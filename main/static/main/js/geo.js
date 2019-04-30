/******************************************************************************/

// GEO Js file for handling map drawing.
/* https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-draw/ */
// Polygon Drawn By User
var ideal_population = 109899;
var wkt_obj;
// Formset field object saves a deep copy of the original formset field object.
// (If user deletes all fields, he can add one more according to this one).
var formsetFieldObject;
// flags
var user_poly_defined;
var count_user_poly = 0;
var count_census_poly = 0
var census_poly_defined;
// used to call a function
var drawn_polygon;
var mpolygon = [];


/******************************************************************************/
// Make buttons show the right skin.
document.addEventListener('DOMContentLoaded', function() {
    var conditionRow = $('.form-row:not(:last)');
    conditionRow.find('.btn.add-form-row')
        .removeClass('btn-outline-success').addClass('btn-outline-danger')
        .removeClass('add-form-row').addClass('remove-form-row')
        .html('<span class="" aria-hidden="true">Remove</span>');
}, false);

/******************************************************************************/

// Initialize the Map
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

for (let i = 0; i < inputs.length; i++) {
    inputs[i].onclick = switchLayer;
}

var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken
});

/* tutorial reference for draw control properties:
https://bl.ocks.org/dnseminara/0790e53cef9867e848e716937727ab18
*/
var draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        polygon: true,
        trash: true
    },
    styles: [
        {
            'id': 'gl-draw-polygon-fill-inactive',
            'type': 'fill',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'Polygon'],
                ['!=', 'mode', 'static']
            ],
            'paint': {
                'fill-color': '#3bb2d0',
                'fill-outline-color': '#3bb2d0',
                'fill-opacity': 0.1
            }
        },
        {
            'id': 'gl-draw-polygon-fill-active',
            'type': 'fill',
            'filter': ['all', ['==', 'active', 'true'],
                ['==', '$type', 'Polygon']
            ],
            'paint': {
                'fill-color': '#4a69bd',
                'fill-outline-color': '#4a69bd',
                'fill-opacity': 0.5
            }
        },
        {
            'id': 'gl-draw-polygon-stroke-inactive',
            'type': 'line',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'Polygon'],
                ['!=', 'mode', 'static']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': '#3bb2d0',
                'line-width': 2
            }
        },
        {
            'id': 'gl-draw-polygon-stroke-active',
            'type': 'line',
            'filter': ['all', ['==', 'active', 'true'],
                ['==', '$type', 'Polygon']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': '#fbb03b',
                'line-dasharray': [0.2, 2],
                'line-width': 2
            }
        },
        {
            'id': 'gl-draw-line-inactive',
            'type': 'line',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'LineString'],
                ['!=', 'mode', 'static']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': '#3bb2d0',
                'line-width': 2
            }
        },
        {
            'id': 'gl-draw-line-active',
            'type': 'line',
            'filter': ['all', ['==', '$type', 'LineString'],
                ['==', 'active', 'true']
            ],
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': '#fbb03b',
                'line-dasharray': [0.2, 2],
                'line-width': 2
            }
        }, // basic tools - default settings
        {
            'id': 'gl-draw-polygon-and-line-vertex-stroke-inactive',
            'type': 'circle',
            'filter': ['all', ['==', 'meta', 'vertex'],
                ['==', '$type', 'Point'],
                ['!=', 'mode', 'static']
            ],
            'paint': {
                'circle-radius': 5,
                'circle-color': '#fff'
            }
        },
        {
            'id': 'gl-draw-polygon-and-line-vertex-inactive',
            'type': 'circle',
            'filter': ['all', ['==', 'meta', 'vertex'],
                ['==', '$type', 'Point'],
                ['!=', 'mode', 'static']
            ],
            'paint': {
                'circle-radius': 3,
                'circle-color': '#fbb03b'
            }
        },
        {
            'id': 'gl-draw-point-point-stroke-inactive',
            'type': 'circle',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'Point'],
                ['==', 'meta', 'feature'],
                ['!=', 'mode', 'static']
            ],
            'paint': {
                'circle-radius': 5,
                'circle-opacity': 1,
                'circle-color': '#fff'
            }
        },
        {
            'id': 'gl-draw-point-inactive',
            'type': 'circle',
            'filter': ['all', ['==', 'active', 'false'],
                ['==', '$type', 'Point'],
                ['==', 'meta', 'feature'],
                ['!=', 'mode', 'static']
            ],
            'paint': {
                'circle-radius': 3,
                'circle-color': '#3bb2d0'
            }
        },
        {
            'id': 'gl-draw-point-stroke-active',
            'type': 'circle',
            'filter': ['all', ['==', '$type', 'Point'],
                ['==', 'active', 'true'],
                ['!=', 'meta', 'midpoint']
            ],
            'paint': {
                'circle-radius': 7,
                'circle-color': '#fff'
            }
        },
        {
            'id': 'gl-draw-point-active',
            'type': 'circle',
            'filter': ['all', ['==', '$type', 'Point'],
                ['!=', 'meta', 'midpoint'],
                ['==', 'active', 'true']
            ],
            'paint': {
                'circle-radius': 5,
                'circle-color': '#fbb03b'
            }
        }
    ]

});

// create the custom event
/* inspired from: https://gomakethings.com/custom-events-with-vanilla-javascript/ */

// var highlight = function (elem) {

//     elem.classList.add('highlights');

//     // Create a new event
//     var event = new CustomEvent('highlight');

//     // Dispatch the event
//     elem.dispatchEvent(event);

// };

// dispatch event
// var document.getElementById("map").dispatchEvent(event);
// highlight(map);
// initialize the progress bar with pop data
document.getElementById("ideal-pop").innerHTML = ideal_population;

map.addControl(geocoder, 'top-right');
// Add controls outside of map.
// Source: https://github.com/mapbox/mapbox-gl-draw/blob/master/docs/API.md
map.addControl(draw);
// Enable draw polygon mode.
document.getElementById('drawPolygon').onclick = function(){
    draw.changeMode('draw_polygon');
};
// Delete all drawn features.
document.getElementById('deletePolygon').onclick = function(){
    draw.trash();
};

/* Change mapbox draw button */
var drawButton = document.getElementsByClassName("mapbox-gl-draw_polygon");
drawButton[0].backgroundImg = '';
drawButton[0].innerHTML = "<i class='fas fa-draw-polygon'></i> Draw Polygon";
var trashButton = document.getElementsByClassName("mapbox-gl-draw_trash");
trashButton[0].backgroundImg = '';
trashButton[0].innerHTML = "<i class='fas fa-trash-alt'></i> Delete Polygon";


var polygonError = document.getElementById("polygon_missing");
if (polygonError != null) {
    document.getElementById("map").classList.add("border");
    document.getElementById("map").classList.add("border-warning");
}

/******************************************************************************/


// map.addEventListener('highlighted', highlightBlocks);
// how to trigger the event?

/******************************************************************************/


// After the map style has loaded on the page, add a source layer and default
// styling for a single point.
map.on('style.load', function() {
    map.addSource('single-point', {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": []
        }
    });

    map.addSource("census", {
        type: "vector",
        url: "mapbox://districter-team.aq1twwkc"
      });

    map.addLayer({
    "id": "census-blocks",
    "type": "fill",
    "source": "census",
    "source-layer": "njblockdata",
    "layout": {
        "visibility": "visible"
    },
    "paint": {
        "fill-color": "rgba(200, 100, 240, 0)",
        "fill-outline-color": "rgba(200, 100, 240, 0)"
    }
    });

    // a line so that thickness can be changed
    map.addLayer({
      "id": "census-lines",
      "type": "line",
      "source": "census",
      "source-layer": "njblockdata",
      "layout": {
        "visibility": "visible",
        "line-join": "round",
        "line-cap": "round"
      },
      "paint": {
        "line-color": "rgba(71, 93, 204, 0.25)",
        "line-width": 1
      }
    });

    map.addLayer({
        "id": "blocks-highlighted",
        "type": "fill",
        "source": "census",
        "source-layer": "njblockdata",
        "paint": {
        "fill-outline-color": "#1e3799",
        "fill-color": "#4a69bd",
        "fill-opacity": 0.7
        },
        "filter": ["in", "BLOCKID10", ""]
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
    map.on('click', 'Census Blocks', function (e) {
        new mapboxgl.Popup({
            closeButton: false
        })
        .setLngLat(e.lngLat)
        .setHTML(e.features[0].properties.BLOCKID10)
        .addTo(map);
      });

    // Listen for the `geocoder.input` event that is triggered when a user
    // makes a selection and add a symbol that matches the result.
    geocoder.on('result', function(ev) {
        map.getSource('single-point').setData(ev.result.geometry);
        var styleSpec = ev.result;
        var styleSpecBox = document.getElementById('json-response');
        var styleSpecText = JSON.stringify(styleSpec, null, 2);
        var syntaxStyleSpecText = syntaxHighlight(styleSpecText);
        styleSpecBox.innerHTML = syntaxStyleSpecText;

    });
});

var wasLoaded = false;
map.on('render', function() {
    if (!map.loaded() || wasLoaded) return;
    wasLoaded = true;
    if (document.getElementById('id_user_polygon').value !== '') {
        // If page refreshes (or the submission fails), get the polygon
        // from the field and draw it again.
        var feature = document.getElementById('id_user_polygon').value;
        var wkt = new Wkt.Wkt();
        wkt_obj = wkt.read(feature);
        var geoJsonFeature = wkt_obj.toJson();
        var featureIds = draw.add(geoJsonFeature);
        updateCommunityEntry();
    }

});

map.on('idle', triggerFunc);
map.on('dataloading', triggerFunc2);

/******************************************************************************/

map.on('draw.create', updateCommunityEntry);
map.on('draw.delete', updateCommunityEntry);
map.on('draw.update', updateCommunityEntry);


/******************************************************************************/

function triggerFunc(e) {
    // console.log(user_polygon_wkt);
    // has to be a global var
    // debugger
    // create a custom event and c
    if (user_poly_defined !== undefined && count_user_poly > 0) {
        // console.log("polygon drawn and now do something");
        console.log(count_user_poly);
        count_user_poly = 0;
        mpolygon = highlightBlocks();
        console.log(count_user_poly);

        // debugger

        // if (census_poly_defined !== undefined && count_census_poly > 0) {
        //     count_census_poly = 0;
        //     mergeBlocks(mpolygon);
            
        //     // mergeBlocks(mpolygon);
    
        //     // console.log("highlight polygons now that the filter returns something");
        // }
    }

}


function triggerFunc2(e) {
    // console.log(user_polygon_wkt);
    // has to be a global var
    // debugger
    // create a custom event and c

    if (census_poly_defined !== undefined && count_census_poly > 0) {
        count_census_poly = 0;
        mergeBlocks(mpolygon);
        
        // mergeBlocks(mpolygon);

        // console.log("highlight polygons now that the filter returns something");
    }
    
}

function mergeBlocks(mpoly) {
    var wkt = new Wkt.Wkt();
    var finalpoly = turf.union.apply(null, mpoly);
    var census_blocks_polygon = drawn_polygon;
    // should only be the exterior ring

    if (finalpoly.geometry.coordinates[0][0].length > 2) {
        census_blocks_polygon.geometry.coordinates[0] = finalpoly.geometry.coordinates[0][0];
    }
    else {
        census_blocks_polygon.geometry.coordinates[0] = finalpoly.geometry.coordinates[0];
    }
    // Save outline of census blocks.
    let census_blocks_polygon_json = JSON.stringify(census_blocks_polygon['geometry']);
    wkt_obj = wkt.read(census_blocks_polygon_json);
    census_blocks_polygon_wkt = wkt_obj.write();

    document.getElementById('id_census_blocks_polygon').value = census_blocks_polygon_wkt;
    debugger
    // debugger
    // prevent the method from being called multiple times
}

function highlightBlocks() {
    // Save census blocks polygon outline.
    //
    console.log("called highlight blocks");
    // once the above works, check the global scope of drawn_polygon

    var census_blocks_polygon = drawn_polygon;
    var polygonBoundingBox = turf.bbox(census_blocks_polygon);
    // get the bounds of the polygon to reduce the number of blocks you are querying from
    var southWest = [polygonBoundingBox[0], polygonBoundingBox[1]];
    var northEast = [polygonBoundingBox[2], polygonBoundingBox[3]];

    var northEastPointPixel = map.project(northEast);
    var southWestPointPixel = map.project(southWest);
    var features = map.queryRenderedFeatures([southWestPointPixel, northEastPointPixel], { layers: ['census-blocks'] });
    if (features.length >= 1) {
        var mpoly = [];
        var total = 0.0;

        var filter = features.reduce(function(memo, feature) {
            if (! (turf.intersect(feature, census_blocks_polygon) === null)) {
                memo.push(feature.properties.BLOCKID10);
                mpoly.push(feature);
                total+= feature.properties.POP10;
            }
            return memo;
        }, ["in", "BLOCKID10"]);

        map.setFilter("blocks-highlighted", filter);
        census_poly_defined = true;
        count_census_poly = 1;

        progress = document.getElementById("pop");
        // set color of the progress bar depending on population
        if (total < (ideal_population * 0.33) || total > (ideal_population * 1.5)) {
            progress.style.background = "red";
        }
        else if (total < (ideal_population * 0.67) || total > (ideal_population * 1.33)) {
            progress.style.background = "orange";
        }
        else {
            progress.style.background = "green";
        }
        progress.innerHTML = total;
        progress.setAttribute("aria-valuenow", "total");
        progress.setAttribute("aria-valuemax", ideal_population * 1.5);
        popWidth = total / (ideal_population * 1.5) * 100;
        progress.style.width = popWidth + "%";
    }
    else {
        census_poly_defined = undefined;
        count_census_poly = 0;
        document.getElementById('id_census_blocks_polygon').value = "";
    }

    return mpoly;
}

/******************************************************************************/

// updatePolygon responds to the user's actions and updates the polygon field
// in the form.
function updateCommunityEntry(e) {

    var wkt = new Wkt.Wkt();
    var data = draw.getAll();
    // Polygon drawn by user in map.

    // Polygon saved to DB.
    var user_polygon_wkt;
    // Polygon saved to DB.
    var census_blocks_polygon_wkt;

    if (data.features.length > 0) {
        // Update User Polygon with the GeoJson data.
        drawn_polygon = data.features[0];
        // Save user polygon.
        let user_polygon_json = JSON.stringify(drawn_polygon['geometry']);
        wkt_obj = wkt.read(user_polygon_json);
        user_polygon_wkt = wkt_obj.write();
        user_poly_defined = true;
        count_user_poly = 1;
        // Save census blocks polygon outline.
        // census_blocks_polygon = drawn_polygon;
        // var polygonBoundingBox = turf.bbox(census_blocks_polygon);
        // // get the bounds of the polygon to reduce the number of blocks you are querying from
        // var southWest = [polygonBoundingBox[0], polygonBoundingBox[1]];
        // var northEast = [polygonBoundingBox[2], polygonBoundingBox[3]];

        // var northEastPointPixel = map.project(northEast);
        // var southWestPointPixel = map.project(southWest);
        // var features = map.queryRenderedFeatures([southWestPointPixel, northEastPointPixel], { layers: ['census-blocks'] });
        // if (features.length >= 1) {
        //     var mpolygon = [];
        //     var total = 0.0;

        //     var filter = features.reduce(function(memo, feature) {
        //         if (! (turf.intersect(feature, census_blocks_polygon) === null)) {
        //             memo.push(feature.properties.BLOCKID10);
        //             mpolygon.push(feature);
        //             total+= feature.properties.POP10;
        //         }
        //         return memo;
        //     }, ["in", "BLOCKID10"]);


        //     map.setFilter("blocks-highlighted", filter);
        //     census_poly_defined = true;
        //     // progress bar with population data based on ideal population for a district in the given state
        //     //<div id="pop" class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 85%">
        //     progress = document.getElementById("pop");
        //     // set color of the progress bar depending on population
        //     if (total < (ideal_population * 0.33) || total > (ideal_population * 1.5)) {
        //     progress.style.background = "red";
        //     }
        //     else if (total < (ideal_population * 0.67) || total > (ideal_population * 1.33)) {
        //     progress.style.background = "orange";
        //     }
        //     else {
        //     progress.style.background = "green";
        //     }
        //     progress.innerHTML = total;
        //     progress.setAttribute("aria-valuenow", "total");
        //     progress.setAttribute("aria-valuemax", ideal_population * 1.5);
        //     popWidth = total / (ideal_population * 1.5) * 100;
        //     progress.style.width = popWidth + "%";

        //     var finalpoly = turf.union.apply(null, mpolygon);
        //     // should only be the exterior ring

        //     if (finalpoly.geometry.coordinates[0][0].length > 2) {
        //         census_blocks_polygon.geometry.coordinates[0] = finalpoly.geometry.coordinates[0][0];
        //     }
        //     else {
        //         census_blocks_polygon.geometry.coordinates[0] = finalpoly.geometry.coordinates[0];
        //     }
        //     // Save outline of census blocks.
        //     let census_blocks_polygon_json = JSON.stringify(census_blocks_polygon['geometry']);
        //     wkt_obj = wkt.read(census_blocks_polygon_json);
        //     census_blocks_polygon_wkt = wkt_obj.write();
        // }
        // else {
        //     census_blocks_polygon_wkt = '';
        // }

    } else {
        user_poly_defined = false;
        count_user_poly = 0;
        census_poly_defined = false;
        drawn_polygon = null;
        user_polygon_wkt = '';
        census_blocks_polygon_wkt = '';
        map.setFilter("blocks-highlighted", ["in", "GEOID10"]);
    }
    // Update form fields
    document.getElementById('id_user_polygon').value = user_polygon_wkt;
    document.getElementById('id_census_blocks_polygon').value = census_blocks_polygon_wkt;
}



/******************************************************************************/

function updateElementIndex(el, prefix, ndx) {
    var id_regex = new RegExp('(' + prefix + '-\\d+)');
    var replacement = prefix + '-' + ndx;
    if ($(el).attr("for")) $(el).attr("for", $(el).attr("for").replace(id_regex, replacement));
    if (el.id) el.id = el.id.replace(id_regex, replacement);
    if (el.name) el.name = el.name.replace(id_regex, replacement);
}

/******************************************************************************/

function cloneMore(selector, prefix) {
    // Function that clones formset fields.
    var newElement = $(selector).clone(true);
    var total = $('#id_' + prefix + '-TOTAL_FORMS').val();
    if (total == 0) {
        newElement = formsetFieldObject;
    }
    newElement.find('#description_warning').remove();
    newElement.find('#category_warning').remove();
    newElement.find(':input').each(function() {
        var name = $(this).attr('name').replace('-' + (total - 1) + '-', '-' + total + '-');
        var id = 'id_' + name;
        $(this).attr({
            'name': name,
            'id': id
        }).val('').removeAttr('checked');
    });
    total++;
    $('#id_' + prefix + '-TOTAL_FORMS').val(total);
    if (total == 1) {
        $("#formset_container").after(newElement);
    } else {
        $(selector).after(newElement);
    }
    var conditionRow = $('.form-row:not(:last)');
    conditionRow.find('.btn.add-form-row')
        .removeClass('btn-outline-success').addClass('btn-outline-danger')
        .removeClass('add-form-row').addClass('remove-form-row')
        .html('<span class="" aria-hidden="true">Remove</span>');
    return false;
}

/******************************************************************************/

function deleteForm(prefix, btn) {
    // Function that deletes formset fields.
    var total = parseInt($('#id_' + prefix + '-TOTAL_FORMS').val());
    if (total == 1) {
        // save last formset field object.
        formsetFieldObject = $('.form-row:last').clone(true);
    }
    btn.closest('.form-row').remove();
    var forms = $('.form-row');
    console.log(forms.length);
    $('#id_' + prefix + '-TOTAL_FORMS').val(forms.length);
    for (var i = 0, formCount = forms.length; i < formCount; i++) {
        $(forms.get(i)).find(':input').each(function() {
            updateElementIndex(this, prefix, i);
        });
    }
    return false;
}

/******************************************************************************/

$(document).on('click', '.add-form-row', function(e) {
    // Add form click handler.
    e.preventDefault();
    cloneMore('.form-row:last', 'form');
    return false;
});

/******************************************************************************/

$(document).on('click', '.remove-form-row', function(e) {
    // Remove form click handler.
    e.preventDefault();
    deleteForm('form', $(this));
    return false;
});

/******************************************************************************/

$('input:radio').on('click', function(e) {
    let name = e.currentTarget.name;
    let value = e.currentTarget.value;
    switch (name) {
        case 'race':
            if (value === "on") {
                document.getElementById('race-field').style.display = 'block';
                document.getElementById('race-field').style.visibility = 'visible';
            } else {
                document.getElementById('race-field').style.visibility = 'hidden';
                document.getElementById('race-field').style.display = 'none';
            }
            break;
        case 'religion':
            if (value === "on") {
                document.getElementById('religion-field').style.display = 'block';
                document.getElementById('religion-field').style.visibility = 'visible';
            } else {
                document.getElementById('religion-field').style.visibility = 'hidden';
                document.getElementById('religion-field').style.display = 'none';
            }
            break;
        case 'industry':
            if (value === "on") {
                document.getElementById('industry-field').style.display = 'block';
                document.getElementById('industry-field').style.visibility = 'visible';
            } else {
                document.getElementById('industry-field').style.visibility = 'hidden';
                document.getElementById('industry-field').style.display = 'none';
            }
            break;
    }
});
