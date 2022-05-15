class Info {
  constructor() {
    // console.log('new Date(timestamp).toLocaleString :>> ', );
  }

  set timestamp(ts) {
    this.element.innerText = `${new Date(ts).toLocaleString("en-US", {
      timeZone: "America/New_York",
    })} ET`;
  }

  get element() {
    return document.querySelector("#timestamp");
  }

  toggle(open) {
    document.querySelector("#info").classList.toggle("hidden", !open);
    document.querySelector("#arrow").classList.toggle("open", open);
  }
}

export default Info;
