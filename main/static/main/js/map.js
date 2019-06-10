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

/* Colors for the different issue categories */
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
    url: "mapbox://representable-team." + mbCode
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
      "visibility": "none"
    },
    "paint": {
      "fill-color": "rgba(193, 202, 214, 0)",
      "fill-outline-color": "rgba(106,137,204,0.4)"
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
      "line-color": "rgba(106,137,204,0.2)",
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
      "visibility": "none",
      "line-join": "round",
      "line-cap": "round"
    },
    "paint": {
      "line-color": "rgba(106,137,204,0.2)",
      "line-width": 2
    }
  });
}

// issues add to properties
issues = JSON.parse(issues);
// {% for issue, desc in issues.items %}
// <button class="dropdown-btn btn-primary" id="{{ issue }}">{{ issue }}
//   <i class="fa fa-caret-down"></i></button>
//   <div class="dropdown-container">
//     {% for item, key in desc.items %}
//     <a href="#" id="{{ item }}" class="btn-primary">{{ key }}</a>
//     {% endfor %}
//   </div>
//   {% endfor %}
for (issue in issues) {
  var button = document.createElement('button');
  button.className = 'dropdown-btn btn-primary';
  button.id = issue;
  button.textContent = issue;
  var circle = document.createElement('i');
  circle.className = 'fa fa-circle';
  circle.style.color = PAINT_VALUES[issue] + '1)';
  circle.style.paddingLeft = '5px';
  button.appendChild(circle);

  var i = document.createElement('i');
  i.className = 'fa fa-caret-down';
  button.appendChild(i);

  var dropdowns = document.createElement('div');
  dropdowns.className = 'dropdown-container';

  for (entry in issues[issue]) {
    var link = document.createElement('a');
    link.href = '#';
    link.id = entry;
    link.className = 'btn-primary';
    link.textContent = issues[issue][entry];
    dropdowns.appendChild(link);
  }
  var issueDiv = document.getElementById('issue-dropdowns');
  issueDiv.appendChild(button);
  issueDiv.appendChild(dropdowns);
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
  // send elements to javascript as geojson objects and make them show on the map by
  // calling the addTo

  var outputstr = a.replace(/'/g, '"');
  a = JSON.parse(outputstr);

  for (obj in a) {
    let catDict = {};
    let catArray = [];
    for (cat in issues) {
      if (issues[cat][obj] !== undefined) {
        catArray.push(cat);
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
    // draw the polygon
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
    console.log(issue);
    // the button element
    var cat = document.getElementById(issue);

    cat.onclick = function(e) {
      var issueId = this.id;
      // iterate thru the polygons on the map
      for (obj in a) {
        if (issues[issueId][obj] === undefined) {
          map.setLayoutProperty(obj, 'visibility', 'none');
          map.setLayoutProperty(obj + "line", 'visibility', 'none');
        } else {
          map.setLayoutProperty(obj, 'visibility', 'visible');
          map.setLayoutProperty(obj + "line", 'visibility', 'visible');
          map.setPaintProperty(obj + "line", 'line-color', PAINT_VALUES[issueId] + '0.3)');
          map.setPaintProperty(obj, 'fill-color', PAINT_VALUES[issueId] + '0.15)');
        }
      }
    }
    for (entry in issues[issue]) {
      var entryId = document.getElementById(entry);
      entryId.onclick = function(e) {
        var thisId = this.id;
        for (obj in a) {
          if (thisId === obj) {
            map.setLayoutProperty(obj, 'visibility', 'visible');
            map.setLayoutProperty(obj + "line", 'visibility', 'visible');
          } else {
            map.setLayoutProperty(obj, 'visibility', 'none');
            map.setLayoutProperty(obj + "line", 'visibility', 'none');
          }
        }
      }
    }
  }

  var allEntriesButton = document.getElementById('all');

  allEntriesButton.onclick = function(e) {
    for (obj in a) {
      map.setLayoutProperty(obj, 'visibility', 'visible');
      map.setLayoutProperty(obj + "line", 'visibility', 'visible');
      map.setPaintProperty(obj, 'fill-color', 'rgba(110, 178, 181,0.15)');
      map.setPaintProperty(obj + "line", 'line-color', 'rgba(110, 178, 181,0.3)');
    }
  }

  for (var tag in tags) {
    var link = document.createElement('a');
    link.href = '#';
    link.textContent = tag;
    link.className = 'btn-primary';

    link.onclick = function (e) {
      var tagName = this.textContent;
      e.preventDefault();
      e.stopPropagation();
      for (obj in a) {
        if (tags[tagName].includes(obj)) {
          map.setLayoutProperty(obj, 'visibility', 'visible');
          map.setLayoutProperty(obj + "line", 'visibility', 'visible');
        } else {
          map.setLayoutProperty(obj, 'visibility', 'none');
          map.setLayoutProperty(obj + "line", 'visibility', 'none');
        }
      }
    };

    var layers = document.getElementById('tags-menu');
    layers.appendChild(link);
  }
});

//create a button that toggles layers based on their IDs
var toggleableLayerIds = ['Census Blocks', 'State Legislature - Lower', 'State Legislature - Upper'];

for (var i = 0; i < toggleableLayerIds.length; i++) {
  var id = toggleableLayerIds[i];

  var link = document.createElement('input');

  link.value = id.replace(/\s+/g, '-').toLowerCase();
  link.id = id;
  link.type = 'checkbox';
  link.className = 'switch_1';
  link.checked = false;

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
  // in order to create the buttons
  var div = document.createElement('div');
  div.className = 'switch_box box_1';
  var label = document.createElement('label');
  label.setAttribute('for', id.replace(/\s+/g, '-').toLowerCase());
  label.textContent = id;
  var layers = document.getElementById('outline-menu');
  div.appendChild(link);
  div.appendChild(label);
  layers.appendChild(div);
  var newline = document.createElement('br');
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
    if (filter === "") {
      buttons[i].style.display = "";
      next.style.display = "none";
      for (j = 0; j < sub.length; j++) {
        sub[j].style.display = "block";
      }
    }
    skip = false;
  }
}
