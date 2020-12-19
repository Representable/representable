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
  style: "mapbox://styles/mapbox/light-v9", //color of the map -- dark-v10 or light-v9 or streets-v11
  center: [-96.7026, 40.8136], // starting position - Lincoln, Nebraska (middle of country lol)
  zoom: 3, // starting zoom -- higher is closer
});

// geocoder used for a search bar -- within the map itself
var geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  country: "us",
  mapboxgl: mapboxgl,
});
map.addControl(geocoder, "top-right");

state = state.toLowerCase();

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

// Add zoom control for non-mobile devices
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

// add a new mapbox boundaries source + layer
function newBoundariesLayer(name) {
  map.addSource(name, {
    type: "vector",
    url: "mapbox://mapbox.boundaries-" + name + "-v3"
  });
  map.addLayer(
    {
      id: name + "-lines",
      type: "line",
      source: name,
      "source-layer": "boundaries_" + BOUNDARIES_ABBREV[removeLastChar(name)] + "_" + name.slice(-1),
      layout: {
        visibility: "none"
      },
      paint: {
        "line-color": "rgba(106,137,204,0.7)",
      }
    }
  );
}

var community_bounds = {};

map.on("load", function () {
  var layers = map.getStyle().layers;
  // Find the index of the first symbol layer in the map style
  // only necessary for making added layers appear "beneath" the existing layers (roads, place names, etc)
  // var firstSymbolId;
  // for (var i = 0; i < layers.length; i++) {
  //   if (layers[i].type === "symbol" && layers[i] !== "road") {
  //     firstSymbolId = layers[i].id;
  //     break;
  //   }
  // }
  // ward + community areas for IL
  if (state === "il") {
    newSourceLayer("chi_wards", CHI_WARD_KEY);
    newSourceLayer("chi_comm", CHI_COMM_KEY);
    map.addLayer(
      {
        id: "chi-ward-lines",
        type: "line",
        source: "chi_wards",
        "source-layer": "chi_wards",
        layout: {
          visibility: "none",
        },
        paint: {
          "line-color": "rgba(106,137,204,0.7)",
        },
      }
    );
    map.addLayer(
      {
        id: "chi-comm-lines",
        type: "line",
        source: "chi_comm",
        "source-layer": "chi_comm",
        layout: {
          visibility: "none",
        },
        paint: {
          "line-color": "rgba(106,137,204,0.7)",
        },
      }
    );
  }
  // leg2 : congressional district
  // leg3 : state senate district
  // leg4 : state house district
  // adm2 : counties
  // loc4 : neighborhoods
  // pos4 : 5-digit postcode area
  // sta5 : block groups
  for (var key in BOUNDARIES_LAYERS) {
    newBoundariesLayer(key);
  }

  // send elements to javascript as geojson objects and make them show on the map by
  // calling the addTo
  var outputstr = a.replace(/'/g, '"');
  a = JSON.parse(outputstr);

  for (obj in a) {
    // check how deeply nested the outer ring of the unioned polygon is
    final = [];
    // set the coordinates of the outer ring to final
    if (a[obj][0][0].length > 2) {
      final = [a[obj][0][0]];
    } else if (a[obj][0].length > 2) {
      final = [a[obj][0]];
    } else {
      final = a[obj];
    }
    // add info to bounds list for zooming
    // ok zoomer
    var fit = new L.Polygon(final).getBounds();
    var southWest = new mapboxgl.LngLat(fit['_southWest']['lat'], fit['_southWest']['lng']);
    var northEast = new mapboxgl.LngLat(fit['_northEast']['lat'], fit['_northEast']['lng']);
    community_bounds[obj] = new mapboxgl.LngLatBounds(southWest, northEast)
    // draw the polygon
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
        "fill-color": "rgb(110, 178, 181)",
        "fill-opacity": 0.15
      },
    });

    // this has to be a separate layer bc mapbox doesn't allow flexibility with thickness of outline of polygons
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
  // find what features are currently on view
  // multiple features are gathered that have the same source (or have the same source with 'line' added on)
  if (state === "") {
    map.on("moveend", function () {
      var sources = [];
      var features = map.queryRenderedFeatures();
      for (var i = 0; i < features.length; i++) {
        var source = features[i].source;
        if (
          source !== "composite" &&
          !source.includes("line") &&
          !source.includes("census") &&
          !source.includes("lower") &&
          !source.includes("upper")
        ) {
          if (!sources.includes(source)) {
            sources.push(source);
          }
        }
      }
      // only display those on the map
      $(".community-review-span").each(function(i, obj) {
        if ($.inArray(obj.id, sources) !== -1) {
          $(obj).show();
        } else {
          $(obj).hide();
        }
      });
    });
  }
  // hover to highlight
  $(".community-review-span").hover(function() {
    map.setPaintProperty(this.id + "line", "line-color", "rgba(0, 0, 0,0.5)");
    map.setPaintProperty(this.id + "line", "line-width", 4);
    map.setPaintProperty(this.id, "fill-opacity", 0.5);
  }, function () {
    map.setPaintProperty(this.id + "line", "line-color", "rgba(0, 0, 0,0.2)");
    map.setPaintProperty(this.id + "line", "line-width", 2);
    map.setPaintProperty(this.id, "fill-opacity", 0.15);
  });
  // loading icon
  $(".loader").delay(500).fadeOut(500);
  // fly to state if org, otherwise stay on map
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
});

// on click, zoom to community
$(".community-review-span").click(function () {
  map.fitBounds(community_bounds[this.id], {padding: 100});
});

// show more button
document.querySelectorAll(".comm-content").forEach(function (p) {
  p.querySelector("a").addEventListener("click", function (e) {
    e.stopPropagation();
    p.classList.toggle("show");
    this.textContent = p.classList.contains("show") ? "Show Less" : "Show More";
  });
});

//create a button that toggles layers based on their IDs
var toggleableLayerIds = JSON.parse(JSON.stringify(BOUNDARIES_LAYERS));
// add selector for chicago wards + community areas if illinois
if (state === "il") {
  toggleableLayerIds["chi-ward"] = "Chicago Wards";
  toggleableLayerIds["chi-comm"] = "Chicago Community Areas";
}

for (var id in toggleableLayerIds){

  var link = document.createElement("input");

  link.value = id;
  link.id = id;
  link.type = "checkbox";
  link.className = "switch_1";
  link.checked = false;

  link.onchange = function (e) {
    var txt = this.id;
    // var clickedLayers = [];
    // clickedLayers.push(txt + "-lines");
    e.preventDefault();
    e.stopPropagation();

    var visibility = map.getLayoutProperty(txt + "-lines", "visibility");

    if (visibility === "visible") {
      map.setLayoutProperty(txt + "-lines", "visibility", "none");
    } else {
      map.setLayoutProperty(txt + "-lines", "visibility", "visible");
    }
  };
  // in order to create the buttons
  var div = document.createElement("div");
  div.className = "switch_box box_1";
  var label = document.createElement("label");
  label.setAttribute("for", id);
  label.textContent = toggleableLayerIds[id];
  var layers = document.getElementById("outline-menu");
  div.appendChild(link);
  div.appendChild(label);
  layers.appendChild(div);
  var newline = document.createElement("br");
};

/*******************************************************************/
// remove the last char in the string
function removeLastChar(str) {
  return str.substring(0, str.length - 1);
}

// search bar filtering Communities
$(document).ready(function(){
  $("#search-comm").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#collapseThree tr").filter(function() {
      var innerText = $(this).text().toLowerCase().replace("show more", "").replace("show less", "").replace("report", "");
      $(this).toggle(innerText.indexOf(value) > -1)
    });
  });
});
