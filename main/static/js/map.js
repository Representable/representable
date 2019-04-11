/* JS file from mapbox site -- display a polygon */
/* https://docs.mapbox.com/mapbox-gl-js/example/geojson-polygon/ */
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/dark-v10', //mapbox style -- dark is pretty for data visualization :o)
  center: [-74.65545, 40.341701], // starting position - Princeton, NJ :)
  zoom: 7 // starting zoom -- higher is closer
});

map.addControl(new mapboxgl.NavigationControl()); // plus minus top right corner

map.on('load', function () {
  // the stuff that happens when the map is loaded...
  /*
  var request = new XMLhttpRequest();
  request.open("GET", "../../assets/NJBlocks.json", false);
  request.send(null)
  var census_blocks = JSON.parse(request.responseText);
  alert(census_blocks.result[0]);

  map.addSource({
  'id': 'census',
  'data': census_blocks
});
 */
  map.addSource("census", {
    type: "vector",
    url: "mapbox://districter-team.njblocks"
  });

  map.addLayer({
    "id": "census-blocks",
    "type": "fill",
    "source": "census",
    "source-layer": "NJBlocks",
    "layout": {
      "visibility": "visible"
    },
    "paint": {
      "fill-color": "rgba(200, 100, 240, 0.4)",
      "fill-outline-color": "rgba(200, 100, 240, 1)"
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
map.on('click', 'dummy', function (e) {
  new mapboxgl.Popup()
  .setLngLat(e.lngLat)
  .setHTML(e.features[0].properties.name)
  .addTo(map);
});

// Change the cursor to a pointer when the mouse is over the dummy layer.
map.on('mouseenter', 'dummy', function () {
  map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'dummy', function () {
  map.getCanvas().style.cursor = '';
});
});

//create a button ! toggles layers based on their IDs
var toggleableLayerIds = [ 'Census Blocks', 'dummy' ];

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
