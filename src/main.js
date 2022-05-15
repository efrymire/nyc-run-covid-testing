import MapManager from "./MapManager";
let map = new MapManager();

let state = {
  infoOpen: true,
};

function toggleInfo() {
  state.infoOpen = !state.infoOpen;
  map.info.toggle(state.infoOpen);
}
window.toggleInfo = toggleInfo;
