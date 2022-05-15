import axios from "axios";
import cheerio from "cheerio";
import "dotenv/config"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import GeocoderManager from "./GeocoderManager.js";
// import other submodules
import { synchronousPromiseAll } from "./utils.js";

const NYCHH_URL =
  "https://www.nychealthandhospitals.org/covid-19-testing-sites/";

let progress;

async function scrapeData() {
  try {
    const geocoder = new GeocoderManager();
    // Fetch HTML of the page we want to scrape
    const { data } = await axios.get(NYCHH_URL);
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
