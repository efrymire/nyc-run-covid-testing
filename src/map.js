class Mapbox {
  constructor(centers) {
    this.centers = centers;
    console.log("this.centers :>> ", this.centers);
    mapboxgl.accessToken = process.env.NODE_ENV_MAPBOX_ACCESS_TOKEN;
    this.map = new mapboxgl.Map({
      container: "map", // container ID
      style: "mapbox://styles/mapbox/streets-v11", // style URL
      center: [-74.0183, 40.7077], // starting position [lng, lat]
      zoom: 11, // starting zoom
    });
  }

  includeTimes(times) {
    this.centers
      .filter((c) => c)
      .map((center) => {
        const timesLookup = new Map(times.map((time) => [time.fullname, time]));
        let popup = formatPopup(center);
        if (timesLookup.has(center.name)) {
          const { wait_time, last_reported } = timesLookup.get(center.name);
          popup = formatPopup(center, { wait_time, last_reported });
        }
        new mapboxgl.Marker()
          .setLngLat(center.coordinates)
          .setPopup(new mapboxgl.Popup().setHTML(popup))
          .addTo(this.map);
      });
  }
}

const formatPopup = (location, waitTimeObj) => `
  <div class="font-sans px-2">
    <h3 class="text-lg font-bold py-1">${location.name}</h3>
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
  </div>
`;

export default Mapbox;
