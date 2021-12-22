const d3 = require('d3');

class Info {

  constructor(timestamp) {

    // console.log('new Date(timestamp).toLocaleString :>> ', );

    d3.select("#timestamp")
      .text(`${new Date(timestamp).toLocaleString('en-US', { timeZone: 'America/New_York' })} ET`)
  };

  toggle(open) {
    d3.select("#info")
      .classed("hidden", !open)
    d3.select("#arrow")
      .classed("open", open)
  }
};

export default Info;