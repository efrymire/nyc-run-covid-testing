// Modular geocoder library
const NodeGeocoder = require("node-geocoder");

const { parseParams } = require("./utils");

function geocode(item, index, all, progress) {
  // Use Mapbox by default since we already have the access token

  // update progress bar
  const num = index + 1;
  progress.update(num);
  if (num === all.length) {
    progress.stop();
  }

  const { name, street, city, state, postalcode, country, context } =
    parseParams(item);
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
    const item = results[0];
    const { latitude: lat, longitude: lng } = item;
    return {
      name,
      address: [street, city, state, postalcode],
      coordinates: { lat, lng },
      context,
    };
  });
}
module.exports = geocode;
