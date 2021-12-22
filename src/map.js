class Mapbox {

  constructor(centers) {
    mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;
    const map = new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/mapbox/streets-v11', // style URL
      center: [-74.0183, 40.7077], // starting position [lng, lat]
      zoom: 11 // starting zoom
    });

    centers.filter(c => c).map(center =>
      new mapboxgl.Marker()
        .setLngLat(center.coordinates)
        .setPopup(new mapboxgl.Popup().setHTML(formatPopup(center)))
        .addTo(map)
    )
  }

};

const formatPopup = (location) => (`
  <div class="font-sans px-2">
    <h3 class="text-lg font-bold py-2">Location</h3>
    ${location.address.reduce((t, v) => t.concat(`<div class="text-md">${v}</div>`), '')}
    <h3 class="text-lg font-bold py-2">Details</h3>
    ${location.context.filter(d => d !== "Pre-register for your visit").reduce((t, v) => t.concat(`<div class="text-md">${v}</div>`), '')}
  </div>
`);

export default Mapbox;