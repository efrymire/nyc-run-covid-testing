const axios = require("axios");
const cheerio = require("cheerio");
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
    // console.log('elements :>> ', elements);

    Promise.all(
      elements.map((_, el) => {
        return formatLocReturnPromise($(el))
      })
    ).then((centers) => {
      const data = ({
        timestamp: new Date(),
        centers,
      })
      fs.writeFile("data/centers.json", JSON.stringify(data, null, 2), (err) => {
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

function formatLocReturnPromise(el) {

  const location = el.text().trim()
    .replace(/\t/g, '')
    .split(/\n/g);

  const name = location[0]
  const address = location.slice(1, 3)
  const trimAndConcatAddress = address
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
        console.log("error:", json)
        return null
      } else {
      }
      let lat = json.results['0'].geometry.location.lat
      let lng = json.results['0'].geometry.location.lng
      return ({
        name,
        address,
        coordinates: ({ lat, lng }),
        context: location.slice(3),
      })
    });
}

