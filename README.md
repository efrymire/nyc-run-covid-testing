# nyc-run-covid-testing

A simple vanilla js website to visualize the city run covid centers, as reported through [the NYC H&H COVID-19 testing sites](https://www.nychealthandhospitals.org/covid-19-testing-sites/).
Many thanks to [ctbarna](https://github.com/ctbarna)'s open source project [covid-wait-times](https://github.com/ctbarna/covid-wait-times) releasing the wait times at each location.

### Requirements

The scraper requires a google API token for geolocation, and the mapbox component requires a mapbox access token. Add those in your terminal or in an `.env` file:
```
GOOGLE_API_KEY=[token]
NODE_ENV_MAPBOX_ACCESS_TOKEN=[token]
```

### Scraping

To scrape, from the root directory, run:
```
node scripts/testingsites_collect.js
```

### Visualizing 

Just the usual:
```
npm i
npm run start
```

or
```
yarn
yarn start
```
