// GEO Js file for handling map drawing.
/* https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-draw/ */

var user_polygon = null;

/* eslint-disable */
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v11', //hosted style id
    center: [-74.65545, 40.341701], // starting position - Princeton, NJ :)
    zoom: 12 // starting zoom
});

var layerList = document.getElementById('menu');
var inputs = layerList.getElementsByTagName('input');

function switchLayer(layer) {
var layerId = layer.target.id;
map.setStyle('mapbox://styles/mapbox/' + layerId);
}

for (var i = 0; i < inputs.length; i++) {
inputs[i].onclick = switchLayer;
}

var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken
});

var draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        polygon: true,
        trash: true
    }
});

map.addControl(geocoder, 'top-right');
map.addControl(draw);

// After the map style has loaded on the page, add a source layer and default
// styling for a single point.
map.on('load', function() {
    map.addSource('single-point', {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": []
        }
    });

    map.addLayer({
        "id": "point",
        "source": "single-point",
        "type": "circle",
        "paint": {
            "circle-radius": 10,
            "circle-color": "#007cbf"
        }
    });

    // Listen for the `geocoder.input` event that is triggered when a user
    // makes a selection and add a symbol that matches the result.
    geocoder.on('result', function(ev) {
        map.getSource('single-point').setData(ev.result.geometry);
        console.log(ev.result);
        var styleSpec = ev.result;
        var styleSpecBox = document.getElementById('json-response');
        var styleSpecText = JSON.stringify(styleSpec, null, 2);
        var syntaxStyleSpecText = syntaxHighlight(styleSpecText);
        styleSpecBox.innerHTML = syntaxStyleSpecText;

    });
});

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
        // Update User Polygon with the GeoJson data.
        user_polygon = data.features[0];
    } else {
        answer.innerHTML = '';
        if (e.type !== 'draw.delete') alert("Use the draw tools to draw a polygon!");
        // Update User Polygon
        user_polygon = null;
    }
}

// AJAX for Saving https://l.messenger.com/l.php?u=https%3A%2F%2Fsimpleisbetterthancomplex.com%2Ftutorial%2F2016%2F08%2F29%2Fhow-to-work-with-ajax-request-with-django.html&h=AT2eBJBqRwotQY98nmtDeTb6y0BYi-ydl5NuMK68-V1LIRsZY11LiFF6o6HUCLsrn0vfPqJYoJ0RsZNQGvLO9qBJPphpzlX4fkxhtRrIzAgOsHmcC6pDV2MzhaeUT-hhj4M2-iOUyg
// Dummy Button Save Listener
document.getElementById("dummySave").onclick = saveNewEntry;

// Process AJAX Request
function saveNewEntry(event) {
    console.log("Dummy save button pressed!");
    // Only save if the user_polygon is not null or empty
    if (user_polygon != null && user_polygon != '') {
        console.log("[AJAX] Sending saveNewEntry to server.")
        // Need to stringify
        // https://www.webucator.com/how-to/how-send-receive-json-data-from-the-server.cfm
        var entry_features = JSON.stringify(user_polygon);
        var map_center = JSON.stringify([-91.874, 42.760]);
        console.log(map_center);
        $.ajax({
            url: 'ajax/dummy_save/',
            data: {
                'entry_features': entry_features,
                'map_center': map_center,
            },
            dataType: 'json',
            success: function(data) {
                if (data.worked) {
                    alert("Saved!");
                } else {
                    alert("Error.");
                }
            }
        });
    }
}
