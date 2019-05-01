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
  "Criminal Justice": "rgba(135, 191, 255,",
  "Civil Rights": "rgba(63, 142, 252,",
  "Economic Affairs": "rgba(196, 178, 188,",
  "Education": "rgba(223, 146, 142,",
  "Environment": "rgba(249, 160, 63,",
  "Health and Health Insurance": "rgba(234, 239, 177,",
  "Internet Regulation": "rgba(178, 177, 207,",
  "Women's Issues": "rgba(223, 41, 53,",
  "LGBT Issues": "rgba(253, 202, 64,",
  "National Security": "rgba(242, 255, 73,",
  "Social Welfare": "rgba(251, 98, 246,",
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
map.on('load', function () {
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


  // issues add to properties
  var issueDict= issues.replace(/'/g,'"');
  issues = JSON.parse(issueDict);
  console.log(issues);
  // send elements to javascript as geojson objects and make them show on the map by
  // calling the addTo

  var outputstr= a.replace(/'/g,'"');
  a = JSON.parse(outputstr);
  let i = 0;

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

    map.addLayer({
      'id': obj,
      'type': 'fill',
      'source': {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
            'type': 'Polygon',
            'coordinates': a[obj]
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
        'fill-color': 'rgba(185, 250, 248,0.4)',
        'fill-outline-color': 'rgba(185, 250, 248,1)'
      }
    });
    i++;
  }

// this function iterates thru the issues, and adds a link to each one Which
// displays the right polygons
  for (issue in issues) {
    // console.log(issue);
    // the button element
    var cat = document.getElementById(issue);
    // console.log(cat);

    cat.onclick = function (e) {
      var issueId = this.id;
      // console.log(issues[issueId]);
      // iterate thru the polygons on the map
      for (obj in a) {
        if (issues[issueId][obj] === undefined) {
          // console.log(obj);
          map.setLayoutProperty(obj, 'visibility', 'none');
        }
        else {
          map.setLayoutProperty(obj, 'visibility', 'visible');
          map.setPaintProperty(obj, 'fill-color', PAINT_VALUES[issueId] + '0.4)');
          map.setPaintProperty(obj, 'fill-outline-color', PAINT_VALUES[issueId] + '1)');
        }
      }
    }
    console.log(issues);
    console.log(issue);
    for (entry in issues[issue]) {
      var entryId = document.getElementById(entry);
      entryId.onclick = function (e) {
        var thisId = this.id;
        for (obj in a) {
          if (thisId === obj) {
            // console.log(obj);
            map.setLayoutProperty(obj, 'visibility', 'visible');
          }
          else {
            map.setLayoutProperty(obj, 'visibility', 'none');
          }
        }
      }
    }
  }

  var allEntriesButton = document.getElementById('all');

  allEntriesButton.onclick = function (e) {
    for (obj in a) {
      map.setLayoutProperty(obj, 'visibility', 'visible');
      map.setPaintProperty(obj, 'fill-color', 'rgba(185, 250, 248,0.4)');
      map.setPaintProperty(obj, 'fill-outline-color', 'rgba(185, 250, 248, 1)');
    }
  }

  // // When a click event occurs on a feature in the dummy layer, open a popup at the
  // // location of the click, with description HTML from its properties.
  // // https://docs.mapbox.com/mapbox-gl-js/example/polygon-popup-on-click/
  // map.on('click', 'Legislature Polygons', function (e) {
  //   new mapboxgl.Popup()
  //   .setLngLat(e.lngLat)
  //   .setHTML(e.features[0].properties.NAMELSAD)
  //   .addTo(map);
  // });
  //
  // // Change the cursor to a pointer when the mouse is over the dummy layer.
  // map.on('mouseenter', 'Legislature Polygons', function () {
  //   map.getCanvas().style.cursor = 'pointer';
  // });
  //
  // // Change it back to a pointer when it leaves.
  // map.on('mouseleave', 'Legislature Polygons', function () {
  //   map.getCanvas().style.cursor = '';
  // });
});

//create a button ! toggles layers based on their IDs
var toggleableLayerIds = ['Census Blocks', 'State Legislature - Lower', 'State Legislature - Upper'];

for (var i = 0; i < toggleableLayerIds.length; i++) {
  var id = toggleableLayerIds[i];

  var link = document.createElement('a');

  link.href = '#';
  link.className = 'active';
  link.textContent = id;

  link.onclick = function (e) {
    var txt = this.textContent;
    var clickedLayers = ["NJ " + txt, "VA " + txt, "PA " + txt, "MI " + txt];
    e.preventDefault();
    e.stopPropagation();

    for (var j = 0; j < clickedLayers.length; j++) {
      var visibility = map.getLayoutProperty(clickedLayers[j], 'visibility');

      if (visibility === 'visible') {
        map.setLayoutProperty(clickedLayers[j], 'visibility', 'none');
        this.className = '';
      } else {
        this.className = 'active';
        map.setLayoutProperty(clickedLayers[j], 'visibility', 'visible');
      }
    }
  };

  var layers = document.getElementById('outline-menu');
  layers.appendChild(link);
}

/* Loop through all dropdown buttons to toggle between hiding and showing its dropdown content -
This allows the user to have multiple dropdowns without any conflict */
var dropdown = document.getElementsByClassName("dropdown-btn");
var i;

for (i = 0; i < dropdown.length; i++) {
  dropdown[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var dropdownContent = this.nextElementSibling;
    if (dropdownContent.style.display === "block") {
      dropdownContent.style.display = "none";
    } else {
      dropdownContent.style.display = "block";
    }
    // add logic for polygons
    // map.setFilter('users', ['in', 'orgs', ...targetIDs]);
  });
}



// search bar function ! looks through the tags and the buttons themselves
function searchTags() {
  var input, filter, dropdowns, sub, i, txtValueB, txtValueS, j, buttons, prev, next, skip;
  input = document.getElementById("search-bar");
  filter = input.value.toUpperCase();
  // search among the tags themselves (buttons)
  // maybe there is a more efficient way to do this, but this makes sense, for now
  buttons = document.getElementsByClassName("dropdown-btn");
  for (i = 0; i < buttons.length; i++) {
    // the dropdown-container with sub tags
    next = buttons[i].nextElementSibling;
    txtValueB = buttons[i].textContent || buttons[i].innerText;
    // the links within dropdown-container: sub tags themselves
    sub = next.getElementsByTagName("a");
    skip = false;
    if (sub) {
      for (j = 0; j < sub.length; j++) {
        txtValueS = sub[j].textContent || sub[j].innerText;
        if (txtValueS.toUpperCase().indexOf(filter) > -1) {
          buttons[i].style.display = "";
          skip = true;
          next.style.display = "block";
          sub[j].style.display = "block";
        } else {
          sub[j].style.display = "none";
        }
      }
    }
    if (!skip) {
      if (txtValueB.toUpperCase().indexOf(filter) > -1) {
        next.style.display = "block";
        for (j = 0; j < sub.length; j++) {
          sub[j].style.display = "block";
        }
        buttons[i].style.display = "";
      } else {
        buttons[i].style.display = "none";
      }
    }
    skip = false;
  }
}
