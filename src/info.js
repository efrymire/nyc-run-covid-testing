class Info {
  constructor(timestamp) {
    // console.log('new Date(timestamp).toLocaleString :>> ', );
    this.element.innerText = `${new Date(timestamp).toLocaleString("en-US", {
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
