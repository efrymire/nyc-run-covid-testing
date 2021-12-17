const centers = require('./centers.json')

mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [-74.0083, 40.7077], // starting position [lng, lat]
    zoom: 12 // starting zoom
});

centers.map(center => {
  if (center) new mapboxgl.Marker()
  .setLngLat(center.coordinates)
  .setPopup(new mapboxgl.Popup().setHTML(`${center.text}`))
  .addTo(map)
})