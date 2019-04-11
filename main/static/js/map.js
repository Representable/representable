/* JS file from mapbox site -- display a polygon */
/* https://docs.mapbox.com/mapbox-gl-js/example/geojson-polygon/ */
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/dark-v10', //mapbox style -- dark is pretty for data visualization :o)
  center: [-74.65545, 40.341701], // starting position - Princeton, NJ :)
  zoom: 12 // starting zoom -- higher is closer
});

map.addControl(new mapboxgl.NavigationControl()); // plus minus top right corner

map.on('load', function () {
  // this is where the census blocks are loaded, from a url to the mbtiles file uploaded to mapbox
  map.addSource("census", {
    type: "vector",
    url: "mapbox://districter-team.njblocks"
  });

  map.addLayer({
    "id": "Census Blocks",
    "type": "fill",
    "source": "census",
    "source-layer": "NJBlocks",
    "layout": {
      "visibility": "visible"
    },
    "paint": {
      "fill-color": "rgb(152, 255, 152, 0)",
      "fill-outline-color": "rgb(152, 255, 152, 1)"
    }
  });

  // this is where the state legislature districts are loaded, from a url to the mbtiles file uploaded to mapbox
  map.addSource("leg", {
    type: "vector",
    url: "mapbox://districter-team.njlegislature"
  });

  map.addLayer({
    "id": "State Legislature",
    "type": "fill",
    "source": "leg",
    "source-layer": "njlegislature",
    "layout": {
      "visibility": "visible"
    },
    "paint": {
      "fill-color": "rgb(255, 152, 255, 0.1)",
      "fill-outline-color": "rgb(255 ,152, 255,1)"
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
        'fill-color': 'rgba(200, 100, 240, 0.4)',
        'fill-outline-color': 'rgba(200, 100, 240, 1)'
      }
    });
  }

// When a click event occurs on a feature in the dummy layer, open a popup at the
// location of the click, with description HTML from its properties.
// https://docs.mapbox.com/mapbox-gl-js/example/polygon-popup-on-click/
map.on('click', 'Census Blocks', function (e) {
  new mapboxgl.Popup()
  .setLngLat(e.lngLat)
  .setHTML(e.features[0].properties.GEOID10)
  .addTo(map);
});

// Change the cursor to a pointer when the mouse is over the dummy layer.
map.on('mouseenter', 'Census Blocks', function () {
  map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'Census Blocks', function () {
  map.getCanvas().style.cursor = '';
});
});

//create a button ! toggles layers based on their IDs
var toggleableLayerIds = ['Census Blocks', 'State Legislature'];

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

  var layers = document.getElementById('menu');
  layers.appendChild(link);
}

// create a button which toggles layers based on tags
// for the future: make it look pretty, get tags from form, etc.
var tagIds = [ 'Demographics', 'Environment'];

for (var i = 0; i < tagIds.length; i++) {
  var id = tagIds[i];

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

  var layers = document.getElementById('tags');
  layers.appendChild(link);
}
