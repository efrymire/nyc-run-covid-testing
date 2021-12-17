const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");
const fs = require("fs")
require('dotenv').config();

const url = "https://www.nychealthandhospitals.org/covid-19-testing-sites/";

async function scrapeData() {
  try {
    // Fetch HTML of the page we want to scrape
    const { data } = await axios.get(url);
    // Load HTML we fetched in the previous line
    const $ = cheerio.load(data);
    // Select all the list items in plainlist class
    const elements = $("p.m-b-20");
    // Stores data for all countries
    const centers = [];
    // Use .each method to loop through the li we selected

    Promise.all(
      elements.map((idx, el) => getCoords($(el).text()))
    ).then((centers) => {
      console.log('centers :>> ', centers);
      fs.writeFile("src/centers.json", JSON.stringify(centers, null, 2), (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("Successfully written data to file");
      });
    })

  } catch (err) {
    console.error(err);
  }
}
// Invoke the above function
scrapeData();

async function getCoords (text) {

  const cleanedText = cleanText(text)

  // let lat, lng;
  // const geocoderQuery = encodeURIComponent("663 Carroll St Brooklyn 11215".replace(/ /g, '+'))
  const geocoderQuery = encodeURIComponent(cleanedText.replace(/ /g, '+'))
  return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${geocoderQuery}&key=${process.env.GOOGLE_API_KEY}`)
    .then(res => res.data)
    .then(json => {
      // console.log('json :>> ', json);
      if (json.results.length === 0) {
        return null
      }
      let lat = json.results['0'].geometry.location.lat
      let lng = json.results['0'].geometry.location.lng
      return ({ text: cleanedText, coordinates: { lat, lng } })
    });
}

function cleanText (text) {
  return text
    .replace(/\t/g, '') // remove all tabs
    .replace(/\n/m, '') // remove starting new lines entirely
    .replace(/\n/g, ', '); // add visual spacing

}