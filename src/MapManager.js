import axios from "axios";
import Info from "./info";
import { Map as MapboxMap, Popup } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

class MapManager {
  // This is a "facade" class that orchestrates the setup of Mapbox.
  constructor() {
    // console.log("this.centers :>> ", this.centers);

    this.map = new MapboxMap({
      accessToken: process.env.NODE_ENV_MAPBOX_ACCESS_TOKEN,
      container: "map", // container ID
      style: "mapbox://styles/mapbox/streets-v11", // style URL
      center: [-74.0183, 40.7077], // starting position [lng, lat]
      zoom: 11, // starting zoom
    });

    this.info = new Info();

    this.map.on("load", () => {
      this.loadMapData();
      this.loadWaitTimes();
    });
  }

  async loadTestingSiteSources() {
    this.map.addSource("testSites", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });

    const { data: geoJsonData } = await axios.get("/data/centers.geojson");
    this.map.getSource("testSites").setData(geoJsonData);

    this.timestamp = geoJsonData.timestamp;
    this.info.timestamp = this.timestamp;
  }

  async loadWaitTimes() {
    // Load the wait times separately from the geodata
    // and put it into an ES6 Map where name => wait time data
    const { data } = await axios.get(
      "https://gist.githubusercontent.com/ctbarna/98b660129b01a5a2c050f3bab78aad70/raw/wait.csv"
    );
    const csv = await import("csvtojson");
    const times = await csv({ output: "json" }).fromString(data);
    this.timesLookup = new Map(times.map((time) => [time.fullname, time]));
  }

  loadMapData() {
    // Fetch data

    this.map.loadImage("./custom_marker.png", (error, image) => {
      if (error) throw error;
      this.markerImage = image;

      this.map.addImage("custom-marker", this.markerImage);

      this.loadTestingSiteSources().then(() => {
        this.map.addLayer({
          id: "testSites",
          type: "symbol",
          source: "testSites",
          layout: {
            "icon-image": "custom-marker",
            "icon-ignore-placement": true,
            "icon-allow-overlap": true,
            // get the title name from the source's "title" property
            // "text-ignore-placement": true,
            // "text-allow-overlap": false,
            // "text-field": ["get", "name"],
            // "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            // "text-offset": [0, 1.25],
            // "text-anchor": "top",
          },
        });

        // When a click event occurs on a feature in the places layer, open a popup at the
        // location of the feature, with description HTML from its properties.
        this.map.on("click", "testSites", (e) => {
          // Copy coordinates array.
          const coordinates = e.features[0].geometry.coordinates.slice();
          const {
            address: addressString,
            context: contextString,
            name,
          } = e.features[0].properties;

          const location = {
            address: JSON.parse(addressString),
            context: JSON.parse(contextString),
            name,
          };

          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          const popupHTML = MapManager.formatPopupHTML(
            location,
            this.lookupWaitTime(name)
          );

          new Popup().setLngLat(coordinates).setHTML(popupHTML).addTo(this.map);
        });

        // Change the cursor to a pointer when the mouse is over the places layer.
        this.map.on("mouseenter", "testSites", () => {
          this.map.getCanvas().style.cursor = "pointer";
        });

        // Change it back to a pointer when it leaves.
        this.map.on("mouseleave", "testSites", () => {
          this.map.getCanvas().style.cursor = "";
        });
      });
    });
  }

  lookupWaitTime(name) {
    // Dictionary lookup
    if (this.timesLookup.has(name)) {
      const { wait_time, last_reported } = this.timesLookup.get(name);
      return { wait_time, last_reported };
    } else {
      return null;
    }
  }

  static formatPopupHTML(location, waitTimeObj) {
    return `<div class="font-sans px-2">
    <h3 class="text-lg font-bold py-1">${location?.name}</h3>
    <h3 class="text-md font-bold py-1">Location</h3>
    ${location?.address?.reduce(
      (t, v) => t.concat(`<p class="text-md">${v}</p>`),
      ""
    )}
    <h3 class="text-md font-bold py-1">Details</h3>
    ${location?.context
      ?.filter((d) => d !== "Pre-register for your visit")
      .reduce((t, v) => t.concat(`<p class="text-md">${v}</p>`), "")}
    ${
      waitTimeObj
        ? `<h3 class="text-md font-bold py-1">Wait Times</h3><p>Current wait time: ${waitTimeObj.wait_time}</p><p>Wait time last reported: ${waitTimeObj.last_reported}</p>`
        : ""
    }
  </div>`;
  }
}

export default MapManager;
