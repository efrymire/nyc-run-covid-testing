const axios = require("axios");

function geocodeGoogle(item, index, all, progress) {
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

module.exports = geocodeGoogle;
