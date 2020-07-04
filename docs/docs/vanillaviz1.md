---
id: vanillaviz1
title: The Basics
---

Contact Kyle (ktbarnes@princeton.edu) with any questions!

### Vanilla JS Visualizations

As of June 2020, this is the live version of visualizing communities on Representable. It currently takes place across a few files, since communities are visualized on the submission page, overall map, org/drive map, "My communities" page, and review/moderation page. However, while each page differs, they share some basic similarities. This doc will go over the basic aspects of the code + a few key decisions.

We are using [mapbox gl js](https://docs.mapbox.com/mapbox-gl-js/api/) as our mapping platform.

### Loading the map

The map is loaded to center on Lincoln, Nebraska at zoom level 3 -- this shows the contiguous US. It then flies to states / communities depending on what is relevant for the specific map view.

```javascript
var map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/mapbox/light-v9", //color of the map -- dark-v10 or light-v9 or streets-v11
  center: [-96.7026, 40.8136], // starting position - Lincoln, Nebraska (middle of country lol)
  zoom: 3, // starting zoom -- higher is closer
});
```

### Adding layers

In the components folder there are keys for census blocks, state legislature, and state acronyms. In each viz file, it goes through each state (or -- each relevant state) and loads in these layers, which have been uploaded to our team mapbox account (see Mapbox Tilesets doc for more info there). These layers have to be added within the map.on("load") function in order to be visible.

### Adding Communities

Communities are sent via views and loaded as geoJSON sources. Each one also loads in its bounds for flyTo() functionality. Information about each community is loaded through django template language -- the connection between template + js is in the id of each table row with community info. (id = entry_ID)

### Other functions

Other functions including ones specific to each map page are typically commented with basic info about what they do. Reach out to Kyle if you have any questions!
