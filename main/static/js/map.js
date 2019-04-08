/* JS file from mapbox site -- display a polygon */
/* https://docs.mapbox.com/mapbox-gl-js/example/geojson-polygon/ */
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: [-74.65545, 40.341701],
    zoom: 5
  });

  map.addControl(new mapboxgl.NavigationControl());

  map.on('load', function () {

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

    map.addLayer({
      'id': 'census-blocks',
      'type': 'fill',
      'source': 'census',
      'paint': {
        'fill-color': 'rgba(200, 100, 240, 0.4)',
        'fill-outline-color': 'rgba(200, 100, 240, 1)'
      },
    });
 */  
//     console.log(a);
    console.log("printing the features");
    a = JSON.parse(a);
    map.addLayer({
      'id': 'maine',
      'type': 'fill',
      'source': {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
            'type': 'Polygon',
            'coordinates': a
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
  });
