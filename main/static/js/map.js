/* JS file from mapbox site -- display a polygon */
/* https://docs.mapbox.com/mapbox-gl-js/example/geojson-polygon/ */
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/dark-v10', //mapbox style -- dark is pretty for data visualization :o)
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

map.on('load', function () {
  // this is where the census blocks are loaded, from a url to the mbtiles file uploaded to mapbox
  map.addSource("nj-census", {
    type: "vector",
    url: "mapbox://districter-team.aq1twwkc"
  });
  map.addSource("va-census", {
    type: "vector",
    url: "mapbox://districter-team.48cgf8ll"
  });
  map.addSource("pa-census", {
    type: "vector",
    url: "mapbox://districter-team.0k2ks83t"
  });
  map.addSource("mi-census", {
    type: "vector",
    url: "mapbox://districter-team.7bb2ddev"
  });

  // colors: https://coolors.co/6f2dbd-a663cc-b298dc-b8d0eb-b9faf8
  map.addLayer({
    "id": "NJ Census Blocks",
    "type": "fill",
    "source": "nj-census",
    "source-layer": "njblockdata",
    "layout": {
      "visibility": "visible"
    },
    "paint": {
      "fill-color": "rgba(111, 45, 189, 0)",
      "fill-outline-color": "rgba(111, 45, 189, 1)"
    }
  });
  map.addLayer({
    "id": "VA Census Blocks",
    "type": "fill",
    "source": "va-census",
    "source-layer": "vablockdata",
    "layout": {
      "visibility": "visible"
    },
    "paint": {
      "fill-color": "rgba(111, 45, 189, 0)",
      "fill-outline-color": "rgba(111, 45, 189, 1)"
    }
  });
  map.addLayer({
    "id": "PA Census Blocks",
    "type": "fill",
    "source": "pa-census",
    "source-layer": "pablockdata",
    "layout": {
      "visibility": "visible"
    },
    "paint": {
      "fill-color": "rgba(111, 45, 189, 0)",
      "fill-outline-color": "rgba(111, 45, 189, 1)"
    }
  });
  map.addLayer({
    "id": "MI Census Blocks",
    "type": "fill",
    "source": "mi-census",
    "source-layer": "miblockdata",
    "layout": {
      "visibility": "visible"
    },
    "paint": {
      "fill-color": "rgba(111, 45, 189, 0)",
      "fill-outline-color": "rgba(111, 45, 189, 1)"
    }
  });

  // this is where the state legislature districts are loaded, from a url to the mbtiles file uploaded to mapbox
  map.addSource("leg", {
    type: "vector",
    url: "mapbox://districter-team.njlegislature"
  });

  map.addLayer({
    "id": "Legislature Polygons",
    "type": "fill",
    "source": "leg",
    "source-layer": "njlegislature",
    "layout": {
      "visibility": "visible"
    },
    "paint": {
      "fill-color": "rgba(166, 99, 204, 0)",
    }
  });

  // a line so that thickness can be changed
  map.addLayer({
    "id": "NJ State Legislature",
    "type": "line",
    "source": "leg",
    "source-layer": "njlegislature",
    "layout": {
      "visibility": "visible",
      "line-join": "round",
      "line-cap": "round"
    },
    "paint": {
      "line-color": "rgba(166, 99, 204, 1)",
      "line-width": 3
    }
  });

  // send elements to javascript as geojson objects and make them show on the map by
  // calling the addTo
  console.log("printing the features");
  a = JSON.parse(a);
  console.log(a);
  for (let i = 0; i < a.length; i++) {
    let tempId = "dummy" + i;
    console.log(tempId);
    map.addLayer({
      'id': tempId,
      'type': 'fill',
      'source': {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
            'type': 'Polygon',
            'coordinates': a[i]
          },
          'properties': {
            'name': 'dummy'
          }
        }
      },
      'layout': {},
      'paint': {
        'fill-color': 'rgba(185, 250, 248,0.4)',
        'fill-outline-color': 'rgba(185, 250, 248,1)'
      }
    });
  }

  // When a click event occurs on a feature in the dummy layer, open a popup at the
  // location of the click, with description HTML from its properties.
  // https://docs.mapbox.com/mapbox-gl-js/example/polygon-popup-on-click/
  map.on('click', 'Legislature Polygons', function (e) {
    new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(e.features[0].properties.NAMELSAD)
    .addTo(map);
  });

  // Change the cursor to a pointer when the mouse is over the dummy layer.
  map.on('mouseenter', 'Legislature Polygons', function () {
    map.getCanvas().style.cursor = 'pointer';
  });

  // Change it back to a pointer when it leaves.
  map.on('mouseleave', 'Legislature Polygons', function () {
    map.getCanvas().style.cursor = '';
  });
});

//create a button ! toggles layers based on their IDs
var toggleableLayerIds = ['NJ Census Blocks', 'NJ State Legislature'];

for (var i = 0; i < toggleableLayerIds.length; i++) {
  var id = toggleableLayerIds[i];

  var link = document.createElement('a');
  link.href = '#';
  link.className = 'active';
  link.textContent = id;

  link.onclick = function (e) {
    var clickedLayer = this.textContent;
    e.preventDefault();
    e.stopPropagation();

    var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

    if (visibility === 'visible') {
      map.setLayoutProperty(clickedLayer, 'visibility', 'none');
      this.className = '';
    } else {
      this.className = 'active';
      map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
    }
  };

  var layers = document.getElementById('outline-menu');
  layers.appendChild(link);
}

// var tagLayers = ['Environment', 'Social Issues'];
//
//   // <button class="dropdown-btn">Display Outlines
//   // <i class="fa fa-caret-down"></i></button>
//   // <div class="dropdown-container" id="outline-menu">
//
//   for (var i = 0; i < tagLayers.length; i++) {
//     var id = tagLayers[i];
//
//     var link = document.createElement('a');
//     link.href = '#';
//     link.className = 'active';
//     link.textContent = 'fill in the blank';
//
//     link.onclick = function (e) {
//       var clickedLayer = this.textContent;
//       e.preventDefault();
//       e.stopPropagation();
//
//       var visibility = map.getLayoutProperty(clickedLayer, 'visibility');
//
//       if (visibility === 'visible') {
//         map.setLayoutProperty(clickedLayer, 'visibility', 'none');
//         this.className = '';
//       } else {
//         this.className = 'active';
//         map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
//       }
//     };
//
//     var button = document.createElement('button');
//     button.className = 'dropdown-btn';
//     button.textContent = id;
//
//     var inButton = document.createElement('i');
//     inButton.className = 'fa fa-caret-down';
//
//     var dropDiv = document.createElement('div');
//     dropDiv.className = 'dropdown-container';
//
//     var layers = document.getElementById('sidenav');
//     layers.appendChild(button);
//     button.appendChild(inButton);
//     layers.appendChild(dropDiv);
//     dropDiv.appendChild(link);
//   }
/* Loop through all dropdown buttons to toggle between hiding and showing its dropdown content - This allows the user to have multiple dropdowns without any conflict */
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
