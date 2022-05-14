const { centers, timestamp } = require("../static/data/centers.json");
import axios from "axios";
import csv from "csvtojson";
import MapFacade from "./MapFacade";
import Info from "./info.js";

const timesURL =
  "https://gist.githubusercontent.com/ctbarna/98b660129b01a5a2c050f3bab78aad70/raw/wait.csv";
let map, info;

let state = {
  infoOpen: true,
};

if (centers) {
  map = new MapFacade(centers);
  getTimes().then((times) => map.includeTimes(times));
}

if (timestamp) {
  info = new Info(timestamp);
}

async function getTimes() {
  const { data } = await axios.get(timesURL);
  return csv({ output: "json" }).fromString(data);
}

function toggleInfo() {
  state.infoOpen = !state.infoOpen;
  info.toggle(state.infoOpen);
}
window.toggleInfo = toggleInfo;
