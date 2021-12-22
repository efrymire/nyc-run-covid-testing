const { centers, timestamp } = require('./centers.json');
import Mapbox from './map';
import Info from './info.js';

let map, info;

let state = {
  infoOpen: true,
}

if (centers) {
  map = new Mapbox(centers);
};

if (timestamp) {
  info = new Info(timestamp)
};

function toggleInfo() {
  state.infoOpen = !state.infoOpen;
  info.toggle(state.infoOpen);
}
window.toggleInfo = toggleInfo;