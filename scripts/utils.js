const cliProgress = require("cli-progress");

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

module.exports = {
  synchronousPromiseAll,
};
