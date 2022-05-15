# nyc-run-covid-testing

A simple vanilla js website to visualize the city run covid centers, as reported
through
[the NYC H&H COVID-19 testing sites](https://www.nychealthandhospitals.org/covid-19-testing-sites/).
Many thanks to [ctbarna](https://github.com/ctbarna)'s open source project
[covid-wait-times](https://github.com/ctbarna/covid-wait-times) releasing the
wait times at each location.

### Requirements

The scraper requires a google API token for geolocation, and the mapbox
component requires a mapbox access token. Add those in your terminal or in an
`.env` file, or make a copy `.env.sample` and save it as `.env`.

```
GOOGLE_API_KEY=[token]
NODE_ENV_MAPBOX_ACCESS_TOKEN=[token]
```

### Scraping

To scrape, from the root directory, run:

```
node scripts/testingsites_collect.js
```

or `npm run scrape`. All of the scripts within `./scripts` require Node v16+.

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

## Deployment

For the deploy command on Netlify or other deployment services, use
`npm run ci-deploy` to trigger a scrape and Parcel build.

### GitHub Actions

The provided GitHub Actions workflow in `scrape-deploy.yml` outputs a build
artifact that contains the scrape data in GeoJSON format. View the repo's action
runs and look for the Artifacts output.

Two secrets—`NETLIFY_AUTH_TOKEN`, and `NETLIFY_SITE_ID`—are required for the
workflow. These must be configured via GitHub repo secrets. See
[docs for the nwtgck/actions-netlify action](https://github.com/nwtgck/actions-netlify#required-inputs-and-env)
for how to get these keys from Netlify.
