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
  "mi-census": "7bb2ddev"
};
var UPPER_KEYS = {
  "nj-upper": "9fogw4w4",
  "va-upper": "3b1qryb8",
  "pa-upper": "33mtf25i",
  "mi-upper": "5bvjx29f"
};
var LOWER_KEYS = {
  "nj-lower": "8w0imag4",
  "va-lower": "9xpukpnx",
  "pa-lower": "c2qg68h1",
  "mi-lower": "aa2ljvl2"
};
var states = ["nj", "va", "pa", "mi"];
var PAINT_VALUES = {
  "Zoning": "rgba(135, 191, 255,",
  "Policing": "rgba(63, 142, 252,",
  "Crime": "rgba(196, 178, 188,",
  "Nuisance": "rgba(223, 146, 142,",
  "School": "rgba(249, 160, 63,",
  "Religion/Church": "rgba(234, 200, 30,",
  "Race/Ethnicity": "rgba(178, 177, 207,",
  "Immigration Status": "rgba(223, 41, 53,",
  "Socioeconomic": "rgba(253, 202, 64,",
  "Transportation": "rgba(242, 255, 73,",
  "Neighborhood Identity/Official Definition": "rgba(251, 98, 246,",
  "Environmental": "rgba(150, 98, 26,",
  "LGBT Issues": "rgba(255, 192, 203,"
};
/*------------------------------------------------------------------------*/
/* JS file from mapbox site -- display a polygon */
/* https://docs.mapbox.com/mapbox-gl-js/example/geojson-polygon/ */
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/light-v9', //color of the map -- dark-v10 or light-v9
  center: [-74.65545, 40.341701], // starting position - Princeton, NJ :)
  zoom: 12 // starting zoom -- higher is closer
});

// geocoder used for a search bar -- within the map itself
var geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken
});
map.addControl(geocoder, 'top-right');

// Add geolocate control to the map. -- this zooms in on the user's current location when pressed
// Q: is it too confusing ? like the symbol doesn't exactly tell you what it does
map.addControl(new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true
  },
  trackUserLocation: true
}));

map.addControl(new mapboxgl.NavigationControl()); // plus minus top right corner

// add a new source layer
function newSourceLayer(name, mbCode) {
  map.addSource(name, {
    type: "vector",
    url: "mapbox://districter-team." + mbCode
  });
}
// add a new layer of census block data
function newCensusLayer(state) {
  map.addLayer({
    "id": state.toUpperCase() + " Census Blocks",
    "type": "fill",
    "source": state + "-census",
    "source-layer": state + "blockdata",
    "layout": {
      "visibility": "visible"
    },
    "paint": {
      "fill-color": "rgba(193, 202, 214, 0)",
      "fill-outline-color": "rgba(193, 202, 214, 1)"
    }
  });
}
// add a new layer of upper state legislature data
function newUpperLegislatureLayer(state) {
  map.addLayer({
    "id": state.toUpperCase() + " State Legislature - Upper",
    "type": "line",
    "source": state + "-upper",
    "source-layer": state + "upper",
    "layout": {
      "visibility": "none",
      "line-join": "round",
      "line-cap": "round"
    },
    "paint": {
      "line-color": "rgba(193, 202, 214, 1)",
      "line-width": 2
    }
  });
}
// add a new layer of lower state legislature data
function newLowerLegislatureLayer(state) {
  map.addLayer({
    "id": state.toUpperCase() + " State Legislature - Lower",
    "type": "line",
    "source": state + "-lower",
    "source-layer": state + "lower",
    "layout": {
      "visibility": "visible",
      "line-join": "round",
      "line-cap": "round"
    },
    "paint": {
      "line-color": "rgba(193, 202, 214, 1)",
      "line-width": 2
    }
  });
}

map.on('load', function() {
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
  // console.log(issues);
  // send elements to javascript as geojson objects and make them show on the map by
  // calling the addTo

  var outputstr = a.replace(/'/g, '"');
  a = JSON.parse(outputstr);

  for (obj in a) {
    // console.log(obj);
    let catDict = {};
    let catArray = [];
    for (cat in issues) {
      // console.log(cat);
      // console.log(issues[cat][obj]);

      if (issues[cat][obj] !== undefined) {
        catArray.push(cat);
        // console.log(issues[cat][obj]);
        // console.log("goinginside");
        catDict[cat] = issues[cat][obj];
      }

    }
    // check how deeply nested the outer ring of the unioned polygon is
    final = [];
    // set the coordinates of the outer ring to final 
    if (a[obj][0][0].length > 2) {
      final = [a[obj][0][0]];
    }
    else if(a[obj][0].length > 2) {
      final = [a[obj][0]];
    }
    else {
      final = a[obj]
    }

    map.addLayer({
      'id': obj,
      'type': 'fill',
      'source': {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
            'type': 'Polygon',
            'coordinates': final
          },
          'properties': {
            'issues': catDict,
            'category': catArray
          }
        }
      },
      'layout': {
        "visibility": "visible"
      },
      'paint': {
        'fill-color': 'rgba(110, 178, 181,0.15)',
      }
    });

    map.addLayer({
      'id': obj + "line",
      'type': 'line',
      'source': {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
            'type': 'Polygon',
            'coordinates': final
          },
          'properties': {
            'issues': catDict,
            'category': catArray
          }
        }
      },
      'layout': {
        "visibility": "visible",
        "line-join": "round",
        "line-cap": "round"
      },
      'paint': {
        'line-color': 'rgba(110, 178, 181,0.3)',
        "line-width": 2
      }
    });
  }

  // this function iterates thru the issues, and adds a link to each one Which
  // displays the right polygons
  for (issue in issues) {
    // the button element

    var cat = document.getElementById(issue);

    // cat.onclick = function(e) {
    //   var issueId = this.id;
    //
    //   for (obj in a) {
    //     if (issues[issueId][obj] === undefined) {
    //       map.setLayoutProperty(obj, 'visibility', 'none');
    //       map.setLayoutProperty(obj + "line", 'visibility', 'none');
    //     } else {
    //       map.setLayoutProperty(obj, 'visibility', 'visible');
    //       map.setLayoutProperty(obj + "line", 'visibility', 'visible');
    //       map.setPaintProperty(obj + "line", 'line-color', PAINT_VALUES[issueId] + '0.3)');
    //       map.setPaintProperty(obj, 'fill-color', PAINT_VALUES[issueId] + '0.15)');
    //     }
    //   }
    // }
    // console.log(issue);
    for (entry in issues[issue]) {
      var entryId = document.getElementById(entry);
      // console.log(entryId);
      // entryId.onclick = function(e) {
      //   var thisId = this.id;
      //   // console.log(thisId);
      //   for (obj in a) {
      //     if (thisId === obj) {
      //       map.setLayoutProperty(obj, 'visibility', 'visible');
      //       map.setLayoutProperty(obj + "line", 'visibility', 'visible');
      //     } else {
      //       map.setLayoutProperty(obj, 'visibility', 'none');
      //       map.setLayoutProperty(obj + "line", 'visibility', 'none');
      //     }
      //   }
      // }
    }
  }

});

//create a button ! toggles layers based on their IDs
var toggleableLayerIds = ['Census Blocks', 'State Legislature - Lower', 'State Legislature - Upper'];

for (var i = 0; i < toggleableLayerIds.length; i++) {
  var id = toggleableLayerIds[i];

  var link = document.createElement('input');

  link.value = id.replace(/\s+/g, '-').toLowerCase();
  link.id = id;
  link.type = 'checkbox';
  link.className = 'switch_1';
  // only state upper legislature is not checked
  if (id === 'State Legislature - Upper') {
    link.checked = false;
  }
  else {
    link.checked = true;
  }

  link.onchange = function(e) {
    var txt = this.id;
    var clickedLayers = ["NJ " + txt, "VA " + txt, "PA " + txt, "MI " + txt];
    e.preventDefault();
    e.stopPropagation();

    for (var j = 0; j < clickedLayers.length; j++) {
      var visibility = map.getLayoutProperty(clickedLayers[j], 'visibility');

      if (visibility === 'visible') {
        map.setLayoutProperty(clickedLayers[j], 'visibility', 'none');
      } else {
        map.setLayoutProperty(clickedLayers[j], 'visibility', 'visible');
      }
    }
  };
}
