const nominatim = require("nominatim-client");
const { parseParams } = require("./utils");

const client = nominatim.createClient({
  useragent: "MyApp", // The name of your application
  referer: "http://example.com", // The referer link
});

function geocodeLocationNominatim(item, index, all, progress) {
  const num = index + 1;
  progress.update(num);
  if (num === all.length) {
    progress.stop();
  }

  const query = parseParams(item);

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

module.exports = geocodeLocationNominatim;
