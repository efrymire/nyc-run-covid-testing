const { centers, timestamp } = require('../data/centers.json');
import axios from 'axios';
import csv from 'csvtojson';
import Mapbox from './map';
import Info from './info.js';

const timesURL = "https://gist.githubusercontent.com/ctbarna/98b660129b01a5a2c050f3bab78aad70/raw/8ed0a23d8c0853e3886407e9a30b4c1b83fd8457/wait.csv"
let map, info;

let state = {
  infoOpen: true,
}

if (centers) {
  map = new Mapbox(centers);
  getTimes().then(times => map.includeTimes(times))
};

if (timestamp) {
  info = new Info(timestamp)
};

async function getTimes() {
  const { data } = await axios.get(timesURL);
  return csv({ output: "json" })
    .fromString(data)
};

function toggleInfo() {
  state.infoOpen = !state.infoOpen;
  info.toggle(state.infoOpen);
}
window.toggleInfo = toggleInfo;