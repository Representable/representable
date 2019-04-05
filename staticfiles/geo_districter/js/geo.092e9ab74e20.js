
// GEO Js file for handling map drawing.
/* https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-draw/ */


/* eslint-disable */
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/satellite-v9', //hosted style id
    center: [-91.874, 42.760], // starting position
    zoom: 12 // starting zoom
});

var draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        polygon: true,
        trash: true
    }
});
map.addControl(draw);

// Update Area Listeners
map.on('draw.create', updateArea);
map.on('draw.delete', updateArea);
map.on('draw.update', updateArea);

// Save Polygon Listeners
function updateArea(e) {
    var data = draw.getAll();
    var answer = document.getElementById('calculated-area');
    if (data.features.length > 0) {
        var area = turf.area(data);
        // restrict to area to 2 decimal points
        var rounded_area = Math.round(area * 100) / 100;
        answer.innerHTML = '<p><strong>' + rounded_area + '</strong></p><p>square meters</p>';
    } else {
        answer.innerHTML = '';
        if (e.type !== 'draw.delete') alert("Use the draw tools to draw a polygon!");
    }
}

// Dummy Save Listener
document.getElementById("dummySave").onclick = dummySave;

function dummySave(e) {
    console.log("Dummy save button pressed!");
    var csrftoken = Cookies.get('csrftoken');
    // console.log(csrftoken);
    $.ajax({
        url: 'ajax/dummy_save/',
        data: {
          'dummy_data': "dummy_data"
        },
        dataType: 'json',
        success: function (data) {
          if (data.worked) {
              alert("Worked!");
          }
        }
      });
}
