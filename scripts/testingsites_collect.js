const axios = require("axios");
const cheerio = require("cheerio");

// import other submodules
const { synchronousPromiseAll } = require("./utils.js");
const GeocoderManager = require("./GeocoderManager");

require("dotenv").config();

const url = "https://www.nychealthandhospitals.org/covid-19-testing-sites/";
let progress;

async function scrapeData() {
  try {
    const geocoder = new GeocoderManager();
    // Fetch HTML of the page we want to scrape
    const { data } = await axios.get(url);
    // Load HTML we fetched in the previous line
    const $ = cheerio.load(data);
    // Select all the list items in plainlist class
    const elements = $("p.m-b-20");

    console.log(`LOG | Scraping ${elements.length} items...`);
    Promise.all(elements.map((_, el) => $(el).text())) // asynchronously scrape details
      .then((data) =>
        synchronousPromiseAll(data, geocoder.geocodeMapbox, progress)
      ) // synchronously get coordinates to stay under query limit (rather than asynchronous)
      .then((centers) => {
        // write all data to a file
        const data = {
          timestamp: new Date(),
          centers,
        };
        GeocoderManager.saveGeoJSON(data);
        GeocoderManager.saveJson(data);
      });
  } catch (err) {
    console.error(err);
  }
}

// Invoke the above function
scrapeData();
