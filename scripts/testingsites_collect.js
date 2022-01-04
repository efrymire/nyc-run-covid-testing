const axios = require("axios");
const cheerio = require("cheerio");
const cliProgress = require('cli-progress');
const fs = require("fs")
require('dotenv').config();

const url = "https://www.nychealthandhospitals.org/covid-19-testing-sites/";
let progress;

async function scrapeData() {
  try {
    // Fetch HTML of the page we want to scrape
    const { data } = await axios.get(url);
    // Load HTML we fetched in the previous line
    const $ = cheerio.load(data);
    // Select all the list items in plainlist class
    const elements = $("p.m-b-20");

    console.log(`LOG | Scraping ${elements.length} items...`)
    Promise.all(elements.map((_, el) => $(el).text())) // asynchronously scrape details
      .then((data) => synchronousPromiseAll(data, geocodeLocation)) // synchronously get coordinates to stay under query limit (rather than asynchronous)
      .then((centers) => {  // write all data to a file
        const data = ({
          timestamp: new Date(),
          centers,
        })
        fs.writeFile("data/centers.json", JSON.stringify(data, null, 2), (err) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log("LOG | Successfully written data to file");
        });
      })

  } catch (err) {
    console.error(err);
  }
}
// Invoke the above function
scrapeData();

// src: https://stackoverflow.com/questions/29880715/how-to-synchronize-a-sequence-of-promises
function synchronousPromiseAll(array, fn) {

  console.log(`LOG | Beginning geocode of ${array.length} items...`)
  progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  progress.start(array.length, 1)

  let results = [];
  return array.reduce(function(p, item, i, all) {
      return p.then(function() {
          return fn(item, i, all).then(function(data) {
              results.push(data);
              return results;
          });
      });
  }, Promise.resolve());
}

function geocodeLocation(item, index, all) {
  
  const num = index + 1
  progress.update(num);
  if (num === all.length) {
    progress.stop();
  } 

  const location = item.trim()
    .replace(/\t/g, '')
    .split(/\n/g);

  const name = location[0]
  const address = location.slice(1, 3).map(d => d.trim())
  const trimAndConcatAddress = [name, ...address]
    .reduce((t, v, i) => {
      if (i === 0) return v
      return t.concat(`+${v}`)
    }, '')
    .replace(/ /g, '+');
  const geocoderQuery = encodeURIComponent(trimAndConcatAddress)

  return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${geocoderQuery}&key=${process.env.GOOGLE_API_KEY}`)
    .then(res => res.data)
    .then(json => {
      if (json.results.length === 0) {
        console.log("ERROR | ", json)
        return null
      } else {
      }
      let lat = json.results['0'].geometry.location.lat
      let lng = json.results['0'].geometry.location.lng
      return ({
        name,
        address,
        coordinates: ({ lat, lng }),
        context: location.slice(3).map(d => d.trim()),
      })
    });
}

