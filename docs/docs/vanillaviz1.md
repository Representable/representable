---
id: vanillaviz1
title: The Basics
---

Contact Kyle (ktbarnes@princeton.edu) with any questions!

### Vanilla JS Visualizations

This is how we visualize communities on Representable. It currently takes place across a few files, since communities are visualized on the submission page, state map pages, org/drive map pages, and the "My communities" review page. The files which use mapbox code are `geo.js` (for drawing a map), `submission.js` (for viewing an individual community), `review.js` (for viewing and deleting all communities attached to a user's account), and `map.js` (for viewing all of the communities in a drive/organization/state at once). However, while each page differs, they share some basic similarities. This doc will go over the basic aspects of the code + a few key decisions.

We are using [mapbox gl js](https://docs.mapbox.com/mapbox-gl-js/api/) as our mapping platform.

### Loading the map

The map is loaded to center on Lincoln, Nebraska at zoom level 3 -- this shows the contiguous US. It then flies to different locations depending on the state/community being visualized.

```javascript
var map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/mapbox/light-v9", //color of the map -- dark-v10 or light-v9 or streets-v11
  center: [-96.7026, 40.8136], // starting position - Lincoln, Nebraska (middle of country lol)
  zoom: 3, // starting zoom -- higher is closer
});
```

Here's the code for how the map flies to a location on the state map page -> more info on the [mapbox documentation](https://docs.mapbox.com/mapbox-gl-js/example/flyto/)
```javascript
if (state !== "") {
  map.flyTo({
    center: statesLngLat[state.toUpperCase()],
    zoom: 5,
    essential: true // this animation is considered essential with respect to prefers-reduced-motion
  });
} else {
  map.flyTo({
    center: [-96.7026, 40.8136],
    zoom: 3,
    essential: true // this animation is considered essential with respect to prefers-reduced-motion
  });
}
```

### Adding layers

Layers are a really important part of how Representable operates. We use layers for generating the census block group overlays which users use to draw the map, and display layers on top of the maps on visualization pages.

For the mapping process (geo.js), we use uploaded tilesets of census block groups. We use these rather than [Mapbox Boundaries](https://www.mapbox.com/boundaries) so that only one state is visible / possible to select at once. It may be worthwhile to change this, however! Mapbox boundaries is what we use for the visualizaton pages. Basically, Mapbox provides us (for free) with access to tilesets for various standardized data layers. This data can then be joined with demographic (or ACS) information to get more detailed information (i.e. labels, demographics, etc). Other data layers, such as school districts and Chicago wards, have to be found and uploaded as tilesets separately. More on that in the Mapbox Tilesets doc.

Each layer has to be added within the map.on("load") function in order to be visible.

### Adding Communities

Communities are sent via views and loaded as geoJSON sources. Each one also loads in its bounds for fitBounds() functionality to zoom to the community. Information about each community is loaded through django template language -- the connection between template + js is in the id of each table row with community info. (id = entry_ID)

### Other functions

Other functions including ones specific to each map page are typically commented with basic info about what they do. Reach out to Kyle if you have any questions!
