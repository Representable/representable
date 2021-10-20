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
/*------------------------------------------------------------------------*/
/* JS file from mapbox site -- display a polygon */
/* https://docs.mapbox.com/mapbox-gl-js/example/geojson-polygon/ */
var visible = null;
var search_while_moving = false;
var comms_count_total = $("#comms_count").html();

var map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/districter-team/ckrp8nt8q0knn19lscssui7aq", //color of the map -- dark-v10 or light-v9 or streets-v11
  center: [-96.7026, 40.8136], // starting position - Lincoln, Nebraska (middle of country lol)
  zoom: 3, // starting zoom -- higher is closer
});

// geocoder used for a search bar -- within the map itself
var geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  country: "us",
  mapboxgl: mapboxgl,
});
map.addControl(geocoder, "top-right");

state = state.toLowerCase();

// Add geolocate control to the map. -- this zooms in on the user's current location when pressed
// Q: is it too confusing ? like the symbol doesn't exactly tell you what it does
map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
  })
);

// upon moving the map, queries the rendered features and only displays the currently visible ones
function searchMove() {
  var displayed_ids = [];
  var features = map.queryRenderedFeatures();
  for (var i = 0; i < features.length; i++) {
    if ('properties' in features[i]) {
      var prop_id = features[i].properties.id;
      if (prop_id) displayed_ids.push(prop_id);
    }
  }
  // only display those on the map
  var comms_count = 0;
  $(".community-review-span").each(function(i, obj) {
    if ($.inArray(obj.id, displayed_ids) !== -1) {
      $(obj).show();
      comms_count++;
    } else {
      $(obj).hide();
    }
  });
  // update community counter at bottom of page
  $("#comms_count").html(comms_count);
}

// button to search while moving map
$("#map-page-search-btn").click(function() {
  search_while_moving = !search_while_moving;
  if (search_while_moving) {
    map.on("moveend", searchMove);
  } else {
    map.off("moveend", searchMove);
    // show all on sidebar
    $(".community-review-span").each(function(i, obj) {
      $(obj).show();
    });
    // update community counter at bottom of page
    $("#comms_count").html(comms_count_total);
  }
});

// Only add zoom buttons to medium and large screen devices (non-mobile)
if (!window.matchMedia("screen and (max-width: 760px)").matches) {
  var nav = new mapboxgl.NavigationControl({
        showCompass: false
      });

  map.addControl(nav);

}

var community_bounds = {};
var coidata;
var shownCois = new Set(); // Tracks the ids of the cois that are selected to be "only show"
var coidata_geojson_format;
const mxzoom = 10, tol = 3.5;

map.on("load", function () {
  var layers = map.getStyle().layers;
  addAllLayers(map, document, "map");
  // draw all coi's in one layer
  coidata = JSON.parse(coidata.replace(/'/g, '"'));
  numBG = JSON.parse(numBG.replace(/'/g, '"'));
  numBlock = JSON.parse(numBlock.replace(/'/g, '"'));

  coidata_geojson_format = {
    'type': 'FeatureCollection',
    'features': []
  };

  for (coi_id in coidata) {
    // set the coordinates of the outer ring to final
    final = [];
    featureType = "Polygon";
    // set the coordinates of the outer ring to final
    if (coidata[coi_id][0][0].length > 2) {
      featureType = "MultiPolygon";
      temp = [];
      final[0] = [coidata[coi_id][0][0]];
      if (coidata[coi_id][1] && coidata[coi_id][1][0].length > 2) {
        final[1] = [coidata[coi_id][1][0]];
      }
    } else if (coidata[coi_id][0].length > 2) {
      final = [coidata[coi_id][0]];
    } else {
      final = coidata[coi_id];
    }
    coidata[coi_id] = final

    // add info to bounds list for zooming
    var fit = new L.Polygon(final).getBounds();
    var southWest = new mapboxgl.LngLat(fit['_southWest']['lat'], fit['_southWest']['lng']);
    var northEast = new mapboxgl.LngLat(fit['_northEast']['lat'], fit['_northEast']['lng']);
    community_bounds[coi_id] = new mapboxgl.LngLatBounds(southWest, northEast);

    // get value for block and block group
    var coi_op = 0.15;
    if (comms_counter >= 25) {
      coi_op = 0.12;
      if (numBlock[coi_id] > 300 || numBG[coi_id] > 15) coi_op = 0.08;
      if (numBlock[coi_id] > 600 || numBG[coi_id] > 50) coi_op = 0.05;
      if (numBlock[coi_id] > 900 || numBG[coi_id] > 100) coi_op = 0.025;
    }

    coidata_geojson_format.features.push({
      'type': 'Feature',
      'geometry': {
          'type': featureType,
          'coordinates': final,
      },
      'properties': {
          'id': coi_id,
          'coi_op': coi_op,
      },
    });
  }

  var layers = map.getStyle().layers;
  // Find the index of the first symbol layer in the map style
  // this is so that added layers go under the symbols on the map
  var firstSymbolId = layers[0].id;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].type === "symbol") {
      firstSymbolId = layers[i].id;
      break;
    }
  }

  // mxzoom(def 18 higher = more detail)
  // tol(def .375 higher = simpler geometry)

  map.addSource('coi_all', {
      'type': 'geojson',
      'data': coidata_geojson_format,
      'maxzoom': mxzoom,
      'tolerance': tol
  });

  map.addLayer(
    {
      'id': 'coi_layer_fill',
      'type': 'fill',
      'source': 'coi_all',
      'paint': {
          'fill-color': 'rgb(110, 178, 181)',
          'fill-opacity': ['get', 'coi_op'],
      },
    },
    firstSymbolId
  );
  map.addLayer({
    id: "coi_line",
    type: "line",
    source: 'coi_all',
    layout: {
      visibility: "none",
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "rgba(0, 0, 0,0.2)",
      "line-width": 2,
    },
  });

  // hover to highlight
  $(".community-review-span").hover(function() {
      let highlight_id = this.id + "_boldline";
      let highlight_id_fill = this.id + "_fill";
      if (map.getLayer(highlight_id)) {
        map.setLayoutProperty(highlight_id, "visibility", "visible")
        map.setLayoutProperty(highlight_id_fill, "visibility", "visible")
      } else {
        // check if nested (multiple) polygons, or just one
        featureType = "Polygon";
        if (coidata[this.id].length > 1) featureType = "MultiPolygon";
        map.addSource(highlight_id, {
          'type': 'geojson',
          'data': {
            type: "Feature",
            geometry: {
              type: featureType,
              coordinates: coidata[this.id],
            },
          },
          'maxzoom': mxzoom, // def 18 higher = more detail
          'tolerance': tol // def .375 higher = simpler geometry
      });
      map.addLayer({
          'id': highlight_id_fill,
          'type': 'fill',
          'source': highlight_id,
          'paint': {
            'fill-color': 'rgb(110, 178, 181)',
            'fill-opacity': 0.15
          },
      });
      map.addLayer({
          'id': highlight_id,
          'type': 'line',
          'source': highlight_id,
          'paint': {
            'line-color': '#808080',
            'line-width': 2,
          },
      });
    }
  }, function () {
    let highlight_id = this.id + "_boldline";
    let highlight_id_fill = this.id + "_fill";
    map.setLayoutProperty(highlight_id, "visibility", "none")
    map.setLayoutProperty(highlight_id_fill, "visibility", "none")
  });

  // loading icon
  $(".loader").delay(500).fadeOut(500);
  // fly to state if org, otherwise stay on map
  if ((typeof centerLat !== 'undefined') && (centerLat !== '')) {
    map.flyTo({
      center: [parseFloat(centerLat), parseFloat(centerLng)],
      zoom: 9,
      essential: true,
    });
  } else if (state !== "") {
    map.flyTo({
      center: statesLngLat[state.toUpperCase()],
      zoom: 5,
      essential: true // this animation is considered essential with respect to prefers-reduced-motion
    });
  } else {
    map.flyTo({
      center: [-96.7026, 40.8136],
      zoom: 3,
      essential: true // this animation is considered essential with respect to prefers-reduced-motion
    });
  }
});

map.on("style.load", function () {

});

// on click, zoom to community
$(".community-review-span").click(function () {
  map.fitBounds(community_bounds[this.id], {padding: 100});
});

// show more button
document.querySelectorAll(".comm-content").forEach(function (p) {
  p.querySelector("a").addEventListener("click", function (e) {
    e.stopPropagation();
    p.classList.toggle("show");
    this.textContent = p.classList.contains("show") ? "Show Less" : "Show More";
  });
});


var toggleableLayerIds = getToggleableLayerIds(state);
addDataSwitches(map, document, "map", visible);
addElections(map, document, "map");


// Toggles the visibility of the selected community. If the coi_layer_fill layer (all the communities) is displayed, remove it and
// display the selected community. If the last selected community community is hidden, display the coi_layer_fill layer.
function toggleEntryVisibility(checkbox)  {
  map.setLayoutProperty('coi_layer_fill', "visibility", "none");
  if (checkbox.checked) {
    shownCois.add(checkbox.value)
    if (map.getLayer(checkbox.value)) {
      map.setLayoutProperty(checkbox.value, "visibility", "visible");
    } else {
      map.addSource(checkbox.value, {
          'type': 'geojson',
          'data': {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: coidata[checkbox.value],
            },
          },
          'maxzoom': mxzoom,
          'tolerance': tol
      });

      map.addLayer({
          'id': checkbox.value,
          'type': 'fill',
          'source': checkbox.value,
          'paint': {
              'fill-color': 'rgb(110, 178, 181)',
              'fill-opacity': 0.15
          },
      });
    }
  }
  else {
    map.setLayoutProperty(checkbox.value, "visibility", "none");
    shownCois.delete(checkbox.value)
    if (shownCois.size == 0) map.setLayoutProperty('coi_layer_fill', "visibility", "visible");
  }
};

// Uncheck all communities that are currently checked and display the total community layer
function showAllCommunities() {
  $(".map-checkbox:checkbox:checked").toArray().forEach(function(coiCheckbox) {
    coiCheckbox.checked = false;
    toggleEntryVisibility(coiCheckbox);
  })
  map.setLayoutProperty('coi_layer_fill', "visibility", "visible");
}

function exportCois(url, type) {
  let coisToExport = shownCois.size > 0 ? shownCois : new Set(["all"]);
  dataToSend = {
      'cois': JSON.stringify(Array.from(coisToExport)),
      csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').attr('value'),
  }
  $.ajax({
          type: "POST",
          url: url,
          data: dataToSend,
          success:function(response){
            const blob = type == "geo" ? new Blob([JSON.stringify(response)], {type : 'application/json'}) : new Blob([response], {type : 'application/csv'})
            const url = window.URL.createObjectURL(blob);
            var link = type == "geo" ? document.getElementById("map-geo-link") : link = document.getElementById("map-csv-link")
            link.href = url
            link.click()
            window.URL.revokeObjectURL(url);
        }
      });
};

function showAllCommunities() {
  $(".map-checkbox:checkbox:checked").toArray().forEach(function(coiCheckbox) {
    coiCheckbox.checked = false;
    toggleEntryVisibility(coiCheckbox);
    map.setLayoutProperty('coi_layer_fill', "visibility", "visible");
  })
}
/*******************************************************************/

// search bar filtering Communities
$(document).ready(function(){
  $("#search-comm").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#map-cois .row").filter(function() {
      var innerText = $(this).text().toLowerCase().replace("show more", "").replace("show less", "").replace("report", "");
      $(this).toggle(innerText.indexOf(value) > -1)
    });
  });
});

/* Flips arrows on the dropdown menus upon clicking */
$("#buttonOne").click(function() {
  $("#arrowOne").toggleClass('flipY-inplace');
});
$("#buttonTwo").click(function () {
  $("#arrowTwo").toggleClass("flipY-inplace");
});
$("#buttonThree").click(function() {
  $("#arrowThree").toggleClass('flipY-inplace');
});
