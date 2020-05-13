/*
 * Copyright (c) 2019- Representable Team (Theodor Marcu, Lauren Johnston, Somya Arora, Kyle Barnes, Preeti Iyer).
 *
 * This file is part of Representable
 * (see http://representable.org).
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
/**************************************************************************/
/* this file loads the visualization stuff ! for map.html -- loads layers of
census blocks, state legislature, and drawn polygons + tags to select ur favs */
/**************************************************************************/
// the mapbox keys to load tilesets
// when adding a new state: put it into CENSUS_KEYS, UPPER_KEYS, LOWER_KEYS, and state array
var CENSUS_KEYS = {
  "nj-census": "aq1twwkc",
  "va-census": "48cgf8ll",
  "pa-census": "0k2ks83t",
  "mi-census": "7bb2ddev",
};
var UPPER_KEYS = {
  "nj-upper": "9fogw4w4",
  "va-upper": "3b1qryb8",
  "pa-upper": "33mtf25i",
  "mi-upper": "5bvjx29f",
};
var LOWER_KEYS = {
  "nj-lower": "8w0imag4",
  "va-lower": "9xpukpnx",
  "pa-lower": "c2qg68h1",
  "mi-lower": "aa2ljvl2",
};
var states = ["nj", "va", "pa", "mi"];
/*------------------------------------------------------------------------*/
/* JS file from mapbox site -- display a polygon */
/* https://docs.mapbox.com/mapbox-gl-js/example/geojson-polygon/ */
var map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/mapbox/light-v9", //color of the map -- dark-v10 or light-v9
  center: [-74.65545, 40.341701], // starting position - Princeton, NJ :)
  zoom: 12, // starting zoom -- higher is closer
});

// geocoder used for a search bar -- within the map itself
var geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
});
map.addControl(geocoder, "top-right");

// Add geolocate control to the map. -- this zooms in on the user's current location when pressed
// Q: is it too confusing ? like the symbol doesn't exactly tell you what it does
map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
  })
);

map.addControl(new mapboxgl.NavigationControl()); // plus minus top right corner

// add a new source layer
function newSourceLayer(name, mbCode) {
  map.addSource(name, {
    type: "vector",
    url: "mapbox://" + mapbox_user_name + "." + mbCode,
  });
}
// add a new layer of census block data
function newCensusLayer(state) {
  map.addLayer({
    id: state.toUpperCase() + " Census Blocks",
    type: "fill",
    source: state + "-census",
    "source-layer": state + "blockdata",
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-color": "rgba(193, 202, 214, 0)",
      "fill-outline-color": "rgba(193, 202, 214, 1)",
    },
  });
}
// add a new layer of upper state legislature data
function newUpperLegislatureLayer(state) {
  map.addLayer({
    id: state.toUpperCase() + " State Legislature - Upper",
    type: "line",
    source: state + "-upper",
    "source-layer": state + "upper",
    layout: {
      visibility: "none",
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "rgba(193, 202, 214, 1)",
      "line-width": 2,
    },
  });
}
// add a new layer of lower state legislature data
function newLowerLegislatureLayer(state) {
  map.addLayer({
    id: state.toUpperCase() + " State Legislature - Lower",
    type: "line",
    source: state + "-lower",
    "source-layer": state + "lower",
    layout: {
      visibility: "visible",
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "rgba(193, 202, 214, 1)",
      "line-width": 2,
    },
  });
}

map.on("load", function () {
  // this is where the census blocks are loaded, from a url to the mbtiles file uploaded to mapbox
  for (let census in CENSUS_KEYS) {
    newSourceLayer(census, CENSUS_KEYS[census]);
  }
  // upper layers
  for (let upper in UPPER_KEYS) {
    newSourceLayer(upper, UPPER_KEYS[upper]);
  }
  // lower layers
  for (let lower in LOWER_KEYS) {
    newSourceLayer(lower, LOWER_KEYS[lower]);
  }
  for (let i = 0; i < states.length; i++) {
    newCensusLayer(states[i]);
    newUpperLegislatureLayer(states[i]);
    newLowerLegislatureLayer(states[i]);
  }

  // tags add to properties
  tags = JSON.parse(tags);

  var output_poly_json = JSON.parse(entry_poly_dict);
  for (obj in output_poly_json) {
    // check how deeply nested the outer ring of the unioned polygon is
    final = [];
    // set the coordinates of the outer ring to final
    if (output_poly_json[obj][0][0].length > 2) {
      final = [output_poly_json[obj][0][0]];
    } else if (output_poly_json[obj][0].length > 2) {
      final = [output_poly_json[obj][0]];
    } else {
      final = output_poly_json[obj];
    }
    approved_color = "rgba(110, 178, 181,0.15)";
    unapproved_color = "rgba(255, 50, 0,0.15)";
    if (approved.indexOf(obj) > -1) {
      color = approved_color;
    } else {
      color = unapproved_color;
    }
    map.addLayer({
      id: obj,
      type: "fill",
      source: {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: final,
          },
        },
      },
      layout: {
        visibility: "visible",
      },
      paint: {
        "fill-color": color,
      },
    });
    map.addLayer({
      id: obj + "line",
      type: "line",
      source: {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: final,
          },
        },
      },
      layout: {
        visibility: "visible",
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "rgba(0, 0, 0,0.2)",
        "line-width": 2,
      },
    });
  }
});

// on hover, highlight the community
$(".sidenav").on("mouseenter", ".community-review-span", function () {
  var isApproved = false;
  if (
    map.getPaintProperty(this.id, "fill-color") === "rgba(110, 178, 181,0.15)"
  ) {
    isApproved = true;
  }
  if (isApproved) {
    map.setPaintProperty(this.id + "line", "line-color", "rgba(0, 0, 0,0.5)");
    map.setPaintProperty(this.id + "line", "line-width", 4);
    map.setPaintProperty(this.id, "fill-color", "rgba(110, 178, 181,0.5)");
  } else {
    map.setPaintProperty(this.id + "line", "line-color", "rgba(0, 0, 0,0.5)");
    map.setPaintProperty(this.id + "line", "line-width", 4);
    map.setPaintProperty(this.id, "fill-color", "rgba(255, 50, 0,0.5)");
  }
});
$(".sidenav").on("mouseleave", ".community-review-span", function () {
  var isApproved = false;
  if (
    map.getPaintProperty(this.id, "fill-color") === "rgba(110, 178, 181,0.5)"
  ) {
    isApproved = true;
  }
  if (isApproved) {
    map.setPaintProperty(this.id + "line", "line-color", "rgba(0, 0, 0,0.2)");
    map.setPaintProperty(this.id + "line", "line-width", 2);
    map.setPaintProperty(this.id, "fill-color", "rgba(110, 178, 181,0.15)");
  } else {
    map.setPaintProperty(this.id + "line", "line-color", "rgba(0, 0, 0,0.2)");
    map.setPaintProperty(this.id + "line", "line-width", 2);
    map.setPaintProperty(this.id, "fill-color", "rgba(255, 50, 0,0.15)");
  }
});
