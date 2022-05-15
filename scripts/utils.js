const fs = require("fs");
const cliProgress = require("cli-progress");
const GeoJSON = require("geojson");
// src: https://stackoverflow.com/questions/29880715/how-to-synchronize-a-sequence-of-promises
function synchronousPromiseAll(array, fn, progress) {
  console.log(`LOG | Beginning geocode of ${array.length} items...`);
  progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  progress.start(array.length, 1);

  let results = [];
  return array.reduce(function (p, item, i, all) {
    return p.then(function () {
      return fn(item, i, all, progress).then(function (data) {
        results.push(data);
        return results;
      });
    });
  }, Promise.resolve());
}

function convertToGeoJSON(data) {
  let { centers } = data;
  centers = centers.map(({ coordinates: { lat, lng }, ...d }) => ({
    ...d,
    lat,
    lng,
  }));
  return GeoJSON.parse(centers, { Point: ["lat", "lng"] });
}

function saveJson(data) {
  fs.mkdir("data", { recursive: true }, (err) => {
    if (err) {
      console.error(err);
    } else {
      fs.writeFile(
        "data/centers.json",
        JSON.stringify(data, null, 2),
        (err) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log("LOG | Successfully written data to file");
        }
      );
    }
  });
}

function parseParams(item) {
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

module.exports = {
  parseParams,
  convertToGeoJSON,
  saveJson,
  synchronousPromiseAll,
};
