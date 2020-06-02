$(document).ready(function () {

});

/*------------------------------------------------------------------------*/
/* JS file from mapbox site -- display a polygon */
/* https://docs.mapbox.com/mapbox-gl-js/example/geojson-polygon/ */
var map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/mapbox/streets-v11", //color of the map -- dark-v10 or light-v9
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
    type: "line",
    source: state + "-census",
    "source-layer": state + "census",
    layout: {
      visibility: "none",
    },
    paint: {
      "line-color": "rgba(106,137,204,0.3)",
      "line-width": 1,
    },
  });
}
// add a new layer of upper state legislature data
function newUpperLegislatureLayer(state) {
  map.addLayer({
    id: state.toUpperCase() + " State Legislature - Senate",
    type: "line",
    source: state + "-upper",
    "source-layer": state + "upper",
    layout: {
      visibility: "none",
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "rgba(106,137,204,0.7)",
      "line-width": 2,
    },
  });
}
// add a new layer of lower state legislature data
function newLowerLegislatureLayer(state) {
  map.addLayer({
    id: state.toUpperCase() + " State Legislature - House/Assembly",
    type: "line",
    source: state + "-lower",
    "source-layer": state + "lower",
    layout: {
      visibility: "none",
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "rgba(106,137,204,0.7)",
      "line-width": 2,
    },
  });
}

map.on("load", function () {
  for (let census in CENSUS_KEYS) {
    newSourceLayer(census, CENSUS_KEYS[census]);
  }
  // upper layers
  for (let upper in UPPER_KEYS) {
    if (states[i] !== "dc") {
      newSourceLayer(upper, UPPER_KEYS[upper]);
    }
  }
  // lower layers
  for (let lower in LOWER_KEYS) {
    if (states[i] !== "dc") {
      newSourceLayer(lower, LOWER_KEYS[lower]);
    }
  }
  for (let i = 0; i < states.length; i++) {
    newCensusLayer(states[i]);
    if (states[i] !== "dc") {
      newUpperLegislatureLayer(states[i]);
      newLowerLegislatureLayer(states[i]);
    }
  }
  map.addSource("counties", {
    type: "vector",
    url: "mapbox://mapbox.hist-pres-election-county"
  });
  map.addLayer(
    {
      id: "counties",
      type: "line",
      source: "counties",
      "source-layer": "historical_pres_elections_county",
      layout: {
        visibility: "none"
      },
      paint: {
        "line-color": "rgba(106,137,204,0.7)",
        "line-width": 2,
      }
    }
  );

  var outputstr = a.replace(/'/g, '"');
  a = JSON.parse(outputstr);
  var dest = [];

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
    dest = final[0][0];
    var fit = new L.Polygon(final).getBounds();
    var southWest = new mapboxgl.LngLat(fit['_southWest']['lat'], fit['_southWest']['lng']);
    var northEast = new mapboxgl.LngLat(fit['_northEast']['lat'], fit['_northEast']['lng']);
    map.fitBounds(new mapboxgl.LngLatBounds(southWest, northEast), {padding: 100});
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
        "fill-color": "rgba(110, 178, 181,0.30)",
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

//create a button that toggles layers based on their IDs
var toggleableLayerIds = [
  "Census Blocks",
  "State Legislature - House/Assembly",
  "State Legislature - Senate",
  "counties"
];

for (var i = 0; i < toggleableLayerIds.length; i++) {
  var id = toggleableLayerIds[i];

  var link = document.createElement("input");

  link.value = id.replace(/\s+/g, "-").toLowerCase();
  link.id = id;
  link.type = "checkbox";
  link.className = "switch_1";
  link.checked = false;

  link.onchange = function (e) {
    var txt = this.id;
    var clickedLayers = [];
    if (txt === "counties") {
      clickedLayers.push(txt);
    } else {
      for (let i = 0; i < states.length; i++) {
        if (states[i] !== "dc" || txt === "Census Blocks") {
          clickedLayers.push(states[i].toUpperCase() + " " + txt);
        }
      }
    }
    // var clickedLayers = ["NJ " + txt, "VA " + txt, "PA " + txt, "MI " + txt];
    e.preventDefault();
    e.stopPropagation();

    for (var j = 0; j < clickedLayers.length; j++) {
      var visibility = map.getLayoutProperty(clickedLayers[j], "visibility");

      if (visibility === "visible") {
        map.setLayoutProperty(clickedLayers[j], "visibility", "none");
      } else {
        map.setLayoutProperty(clickedLayers[j], "visibility", "visible");
      }
    }
  };
  // in order to create the buttons
  var div = document.createElement("div");
  div.className = "switch_box box_1";
  var label = document.createElement("label");
  label.setAttribute("for", id.replace(/\s+/g, "-").toLowerCase());
  label.textContent = id;
  var layers = document.getElementById("outline-menu");
  div.appendChild(link);
  div.appendChild(label);
  layers.appendChild(div);
  var newline = document.createElement("br");
}
