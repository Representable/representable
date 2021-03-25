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
/*------------------------------------------------------------------------*/
/* JS file from mapbox site -- display a polygon */
/* https://docs.mapbox.com/mapbox-gl-js/example/geojson-polygon/ */
var map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/mapbox/light-v9", //color of the map -- dark-v10 or light-v9
  center: [-96.7026, 40.8136], // starting position - Lincoln, Nebraska (middle of country lol)
  zoom: 3, // starting zoom -- higher is closer
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

// Only add zoom buttons to medium and large screen devices (non-mobile)
if (!window.matchMedia("only screen and (max-width: 760px)").matches) {
  map.addControl(new mapboxgl.NavigationControl()); // plus minus top right corner
}

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

function toggleEntryVisibility(checkbox){
  if (checkbox.checked){
    map.setLayoutProperty(checkbox.value, "visibility", "visible");
    map.setLayoutProperty(checkbox.value + "line", "visibility", "visible");
    hoveredOverHidden = false;
  }
  //If it has been unchecked.
  else {
    map.setLayoutProperty(checkbox.value, "visibility", "none");
    map.setLayoutProperty(checkbox.value + "line", "visibility", "none");
  }
}

var community_bounds = {};

map.once("load", function () {
  // this is where the census blocks are loaded, from a url to the mbtiles file uploaded to mapbox
  // for (let census in CENSUS_KEYS) {
  //   newSourceLayer(census, CENSUS_KEYS[census]);
  // }
  // // upper layers
  // for (let upper in UPPER_KEYS) {
  //   newSourceLayer(upper, UPPER_KEYS[upper]);
  // }
  // // lower layers
  // for (let lower in LOWER_KEYS) {
  //   newSourceLayer(lower, LOWER_KEYS[lower]);
  // }
  // for (let i = 0; i < states.length; i++) {
  //   newCensusLayer(states[i]);
  //   newUpperLegislatureLayer(states[i]);
  //   newLowerLegislatureLayer(states[i]);
  // }

  output_poly_json = JSON.parse(entry_poly_dict);
  var dest = [];

  var zooming = true;
  for (obj in output_poly_json) {
    // check how deeply nested the outer ring of the unioned polygon is
    final = [];
    dest = [];
    // set the coordinates of the outer ring to final
    if (output_poly_json[obj][0][0].length > 2) {
      final = [output_poly_json[obj][0][0]];
    } else if (output_poly_json[obj][0].length > 2) {
      final = [output_poly_json[obj][0]];
    } else {
      final = output_poly_json[obj];
    }
    dest = final[0][0];
    // add info to bounds list for zooming
    // ok zoomer
    var fit = new L.Polygon(final).getBounds();
    var southWest = new mapboxgl.LngLat(fit['_southWest']['lat'], fit['_southWest']['lng']);
    var northEast = new mapboxgl.LngLat(fit['_northEast']['lat'], fit['_northEast']['lng']);
    community_bounds[obj] = new mapboxgl.LngLatBounds(southWest, northEast)
    if (zooming) {
      map.fitBounds(community_bounds[obj], {padding: 100});
      zooming = false;
    }
    color = "rgb(110, 178, 181)";
    // unapproved_color = "rgba(255, 50, 0,0.15)";
    // if (approved.indexOf(obj) > -1) {
    //   color = approved_color;
    // } else {
    //   color = unapproved_color;
    // }
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
        "fill-opacity": 0.15
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

hoveredOverHidden = false; // true if the user is hovering over an entry that is hidden
// hover to highlight
$(".community-review-span").hover(function() {
  if (map.getLayer(this.id).visibility == "visible") {
    map.setPaintProperty(this.id + "line", "line-color", "rgba(0, 0, 0,0.5)");
    map.setPaintProperty(this.id + "line", "line-width", 4);
    map.setPaintProperty(this.id, "fill-opacity", 0.5);
  } else {
    map.setLayoutProperty(this.id, "visibility", "visible");
    map.setLayoutProperty(this.id + "line", "visibility", "visible");
    map.setPaintProperty(this.id + "line", "line-color", "rgba(0, 0, 0,0.5)");
    map.setPaintProperty(this.id + "line", "line-width", 4);
    map.setPaintProperty(this.id, "fill-opacity", 0.5);
    hoveredOverHidden = true;
  }
}, function () {
  if (!hoveredOverHidden) {
    map.setPaintProperty(this.id + "line", "line-color", "rgba(0, 0, 0,0.2)");
    map.setPaintProperty(this.id + "line", "line-width", 2);
    map.setPaintProperty(this.id, "fill-opacity", 0.15);
  } else {
    map.setLayoutProperty(this.id, "visibility", "none");
    map.setLayoutProperty(this.id + "line", "visibility", "none");
    hoveredOverHidden = false;
  }
});

// on click, zoom to community
$(".community-review-span").click(function () {
  map.fitBounds(community_bounds[this.id], {padding: 100});
});

document.querySelectorAll(".comm-content").forEach(function (p) {
  p.querySelector("a").addEventListener("click", function (e) {
    e.stopPropagation();
    p.classList.toggle("show");
    this.textContent = p.classList.contains("show") ? "Show Less" : "Show More";
  });
});
