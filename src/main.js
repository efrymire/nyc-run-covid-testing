import MapManager from "./MapManager";
let map = new MapManager();

let state = {
  infoOpen: true,
};

window.toggleInfo = function toggleInfo() {
  state.infoOpen = !state.infoOpen;
  map.info.toggle(state.infoOpen);
};
