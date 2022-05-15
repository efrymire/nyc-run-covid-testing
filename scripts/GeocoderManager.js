// Modular geocoder library
const axios = require("axios");
const NodeGeocoder = require("node-geocoder");
const fs = require("fs");
const GeoJSON = require("geojson");
const nominatim = require("nominatim-client");

class GeocoderManager {
  // This is a "facade" class that orchestrates all geocoders.

  constructor() {
    this.NODE_ENV_MAPBOX_ACCESS_TOKEN =
      process.env.NODE_ENV_MAPBOX_ACCESS_TOKEN;
  }

  geocodeMapbox(item, index, all, progress) {
    // Use Mapbox by default since we already have the access token

    // update progress bar
    const num = index + 1;
    progress.update(num);
    if (num === all.length) {
      progress.stop();
    }

    const { name, street, city, state, postalcode, country, context } =
      GeocoderManager.parseGeocoderParams(item);
    const queryString = `${street} ${city}, ${state} ${postalcode}, ${country}`;

    if (!process.env.NODE_ENV_MAPBOX_ACCESS_TOKEN) {
      console.error("Warning: NODE_ENV_MAPBOX_ACCESS_TOKEN not specified");
    }
    const geocoder = NodeGeocoder({
      provider: "mapbox",
      apiKey: process.env.NODE_ENV_MAPBOX_ACCESS_TOKEN,
    });

    // Using callback
    return geocoder.geocode(queryString).then((results) => {
      if (!results.length) {
        console.error(results);
        console.error(`No results for search: ${queryString}`);
        return null;
      } else {
      }
      // Combine geocoder results with the scraped center data
      const item = results[0];
      const { latitude: lat, longitude: lng } = item;
      return {
        name,
        address: [street, city, state, postalcode],
        coordinates: { lat, lng },
        // Context describes additional info about the test site
        context,
        geocoderExtraData: item,
      };
    });
  }

  geocodeGoogle(item, index, all, progress) {
    const num = index + 1;
    progress.update(num);
    if (num === all.length) {
      progress.stop();
    }

    const location = item.trim().replace(/\t/g, "").split(/\n/g);

    const name = location[0];
    const address = location.slice(1, 3).map((d) => d.trim());
    const trimAndConcatAddress = [name, ...address]
      .reduce((t, v, i) => {
        if (i === 0) return v;
        return t.concat(`+${v}`);
      }, "")
      .replace(/ /g, "+");
    const geocoderQuery = encodeURIComponent(trimAndConcatAddress);

    return axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${geocoderQuery}&key=${process.env.GOOGLE_API_KEY}`
      )
      .then((res) => res.data)
      .then((json) => {
        if (json.results.length === 0) {
          console.log("ERROR | ", json);
          return null;
        } else {
        }
        let lat = json.results["0"].geometry.location.lat;
        let lng = json.results["0"].geometry.location.lng;
        return {
          name,
          address,
          coordinates: { lat, lng },
          context: location.slice(3).map((d) => d.trim()),
        };
      });
  }

  geocodeNominatim(item, index, all, progress) {
    // Removed due to accuracy issues (eg: "Fourth Avenue" fails instead of finding "4th Ave")
    const client = nominatim.createClient({
      useragent: "nyc-run-covid-testing", // The name of your application
      referer: "http://example.com", // The referer link
    });

    const num = index + 1;
    progress.update(num);
    if (num === all.length) {
      progress.stop();
    }

    const query = GeocoderManager.parseGeocoderParams(item);

    return client.search(query).then((result) => {
      if (result.length === 0) {
        console.log("No result for:", query, result);
        return null;
      }
      let first = result[0];
      let { lat, lng } = first;

      return {
        name,
        address,
        coordinates: { lat, lng },
        context: location.slice(3).map((d) => d.trim()),
      };
    });
  }

  static parseGeocoderParams(item) {
    // Given an item record, return the parsed parameters to pass onto a geocoder.
    // First, build the query from raw input
    const location = item.trim().replace(/\t/g, "").split(/\n/g);
    const name = location[0];
    const address = location.slice(1, 3).map((d) => d.trim());
    const [street] = address;
    const city = address[1].split(",")[0];
    const postalcode = address[1]
      ?.split(",")[1]
      ?.match(/(\d+(-)?(\d)?)/)
      ?.at(0);

    const query = {
      // q: [name, street].join(","),
      name,
      street,
      city,
      state: "NY",
      postalcode,
      country: "United States",
      context: location.slice(3).map((d) => d.trim()),
    };

    return query;
  }

  static saveGeoJSON(data) {
    let { timestamp, centers } = data;
    // Remove null entries
    centers = centers
      .filter((d) => d)
      .map(({ coordinates: { lat, lng }, ...properties }) => ({
        ...properties,
        lat,
        lng,
      }));
    const geojson = GeoJSON.parse(centers, { Point: ["lat", "lng"] });
    geojson["timestamp"] = timestamp;
    fs.mkdir("static/data", { recursive: true }, (err) => {
      if (err) {
        console.error(err);
      } else {
        fs.writeFile(
          "static/data/centers.geojson",
          JSON.stringify(geojson),
          (err) => {
            if (err) {
              console.error(err);
              return;
            }
            console.log("LOG | Successfully written GeoJSON to file");
          }
        );
      }
    });
  }

  static saveJson(data) {
    fs.mkdir("static/data", { recursive: true }, (err) => {
      if (err) {
        console.error(err);
      } else {
        fs.writeFile(
          "static/data/centers.json",
          JSON.stringify(data),
          (err) => {
            if (err) {
              console.error(err);
              return;
            }
            console.log("LOG | Successfully written JSON to file");
          }
        );
      }
    });
  }
}

module.exports = GeocoderManager;
