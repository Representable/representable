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

  // colors: https://coolors.co/6f2dbd-a663cc-b298dc-b8d0eb-b9faf8
  map.addLayer({
    "id": "Census Blocks",
    "type": "fill",
    "source": "census",
    "source-layer": "NJBlocks",
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
    "id": "State Legislature",
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
var toggleableLayerIds = ['Census Blocks', 'State Legislature'];

for (var i = 0; i < toggleableLayerIds.length; i++) {
  var id = toggleableLayerIds[i];

  var link = document.createElement('a');
  link.href = '#';
  link.className = 'active';
  link.textContent = id;
  link.setAttribute('role', 'menuitem');
  link.setAttribute('tabindex', '-1');

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
  var li = document.createElement('li');
  li.setAttribute('role', 'presentation');
  li.setAttribute('id', 'subform');
  layers.appendChild(li);
  li.appendChild(link);
}
