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
/******************************************************************************/

// GEO Js file for handling map drawing.
/* https://docs.mapbox.com/mapbox-gl-js/example/mapbox-gl-draw/ */
// Polygon Drawn By User

// Helper print function
function print(items) {
  console.log(items);
}

// change "Show Examples" to "Hide Examples" on click
function changeText(element) {
  if (element.innerText == "Show Examples") {
    element.innerText = "Hide Examples";
  } else {
    element.innerText = "Show Examples";
  }
}

function showVideoPopup() {
  $("#video_popup").removeClass("d-none");
  mixpanel.track("Video Popup", {
    drive_id: drive_id,
    drive_name: drive_name,
    organization_id: organization_id,
    organization_name: organization_name,
  });
}

function closePopup() {
  $("#video_popup").addClass("d-none");
}

/******************************************************************************/

var wkt_obj;
// Formset field object saves a deep copy of the original formset field object.
// (If user deletes all fields, he can add one more according to this one).
var formsetFieldObject;
var state;
var neighbors = [];
$(document).ready(function () {
  // load tooltips (bootstrap)
  $('[data-toggle="tooltip"]').tooltip();
});

//builds proper format of location string based on mapbox data. city,state/province,country
function parseReverseGeo(geoData) {
  var region, countryName, placeName, returnStr;
  if (geoData.context) {
    $.each(geoData.context, function (i, v) {
      if (v.id.indexOf("region") >= 0) {
        region = v.text;
      }
      if (v.id.indexOf("country") >= 0) {
        countryName = v.text;
      }
    });
  }
  if (region && countryName) {
    returnStr = region + ", " + countryName;
  } else {
    returnStr = geoData.place_name;
  }
  return returnStr;
}

/******************************************************************************/

function showMap() {
  $(".map-bounding-box.collapse").collapse("show");
  map.resize();
}

function hideMap() {
  $(".map-bounding-box.collapse").collapse("hide");
  map.resize();
}

function checkFieldById(field_id) {
  var field = document.getElementById(field_id);
  if (field.value == null || field.value == "") {
    field.classList.add("has_error");
    return false;
  }
  field.classList.add("has_success");
  return true;
}

function formValidation() {
  // Check Normal Fields
  var flag = true;
  var form_elements = document.getElementById("entryForm").elements;
  for (var i = 0; i < form_elements.length; i++) {
    if (form_elements[i].required) {
      if (checkFieldById(form_elements[i].id) == false) {
        flag = false;
      }
    }
  }

  var cultural_interests_field = document.getElementById(
    "id_cultural_interests"
  );
  var economic_intetersts_field = document.getElementById(
    "id_economic_interests"
  );
  var comm_activities_field = document.getElementById("id_comm_activities");
  var other_considerations_field = document.getElementById(
    "id_other_considerations"
  );

  if (
    cultural_interests_field.value == "" &&
    economic_intetersts_field.value == "" &&
    comm_activities_field.value == "" &&
    other_considerations_field.value == ""
  ) {
    cultural_interests_field.classList.add("has_error");
    economic_intetersts_field.classList.add("has_error");
    comm_activities_field.classList.add("has_error");
    other_considerations_field.classList.add("has_error");
    var interets_alert = document.getElementById("need_one_interest");
    interets_alert.classList.remove("d-none");
  }

  // Check Poly Fields And Display Errors On Save
  var user_polygon_field = document.getElementById("id_user_polygon");
  if (user_polygon_field.value == null || user_polygon_field.value == "") {
    triggerMissingPolygonError();
    flag = false;
  }
  var census_blocks_arr_field = document.getElementById(
    "id_census_blocks_polygon_array"
  );
  if (
    census_blocks_arr_field.value == null ||
    census_blocks_arr_field.value == ""
  ) {
    triggerMissingPolygonError();
    flag = false;
  }
  var census_blocks_poly = document.getElementById("id_census_blocks_polygon");
  if (flag == false) {
    // Add alert.
    document.getElementById("form_error").classList.remove("d-none");
  }
  return flag;
}

// Make buttons show the right skin.
document.addEventListener(
  "DOMContentLoaded",
  function () {
    var conditionRow = $(".form-row:not(:last)");
    conditionRow
      .find(".btn.add-form-row")
      .removeClass("btn-outline-success")
      .addClass("btn-outline-danger")
      .removeClass("add-form-row")
      .addClass("remove-form-row")
      .html('<span class="" aria-hidden="true">Remove</span>');
    var entry_form_button = document.getElementById("save");
    entry_form_button.addEventListener("click", function (event) {
      formValidation();
    });
    state = sessionStorage.getItem("state_name");
    // If there are alerts, scroll to first one.
    var document_alerts = document.getElementsByClassName("django-alert");
    if (document_alerts.length > 0) {
      let first_alert = document_alerts[0];
      first_alert.scrollIntoView();
      document.getElementById("form_error").classList.remove("d-none");
    }

    // Tracking
    var form_elements = document.getElementById("entryForm").elements;
    for (var i = 0; i < form_elements.length; i++) {
      var field = form_elements[i];
      if (
        field &&
        (field.nodeName == "INPUT" || field.nodeName == "TEXTAREA") &&
        field.classList.contains("form-control")
      ) {
        field.addEventListener("focus", function (event) {
          if (event.target.classList.contains("done") == false) {
            event.target.classList.add("done");
            mixpanel.track("Entry Page Section Focus", {
              field_id: event.target.id,
              drive_id: drive_id,
              drive_name: drive_name,
              organization_id: organization_id,
              organization_name: organization_name,
            });
          }
        });
      }
    }
    // Shepherd JS
    document
      .getElementById("shepherd-btn")
      .addEventListener("click", function (event) {
        mixpanel.track("Shepherd JS", {
          drive_id: drive_id,
          drive_name: drive_name,
          organization_id: organization_id,
          organization_name: organization_name,
        });
      });
    sessionStorage.setItem("map_drawn_successfully", false);
  },
  false
);

/******************************************************************************/

// Initialize the Map
/* eslint-disable */
var map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/mapbox/streets-v11", //hosted style id
  center: [-96.7026, 40.8136], // starting position - Lincoln, NE :)
  zoom: 3, // starting zoom -- higher is closer
  maxZoom: 17, // camelCase. There's no official documentation for this smh :/
});

var layerList = document.getElementById("menu");
var inputs = layerList.getElementsByTagName("input");

function switchLayer(layer) {
  var layerId = layer.target.id;
  map.setStyle("mapbox://styles/mapbox/" + layerId);
}

for (let i = 0; i < inputs.length; i++) {
  inputs[i].onclick = switchLayer;
}

var geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  country: "us",
  mapboxgl: mapboxgl,
});

document.getElementById("geocoder").appendChild(geocoder.onAdd(map));

/* Creating custom draw buttons */
class SelectRadiusButton {
  onAdd(map) {
    var radius_control = document.createElement("button");
    radius_control.href = "#";
    radius_control.type = "button";
    radius_control.backgroundImg = "";

    radius_control.classList.add("draw-group");
    radius_control.id = "map-radius-control-id";
    radius_control.style.display = "block";
    radius_control.innerHTML =
      '<form><div class="form-group"><input type="range" min="1" max="100" value="20" class="custom-range" id="radius-control"><p>Select Radius: <span id="radius-value">20</span></p></div></form>';
    this._map = map;
    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    this._container.appendChild(radius_control);
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}
map.addControl(new SelectRadiusButton(), "top-right");

var slider = document.getElementById("radius-control");
var rangeVal = document.getElementById("radius-value");
slider.oninput = function () {
  var size = this.value;
  drawRadius = parseInt(size);
  rangeVal.innerHTML = size;
};

class ClearMapButton {
  onAdd(map) {
    var clear_button = document.createElement("button");
    clear_button.href = "#";
    clear_button.type = "button";
    clear_button.backgroundImg = "";

    clear_button.classList.add("draw-group");
    clear_button.id = "map-clear-button-id";
    clear_button.style.display = "block";
    clear_button.innerHTML = "<i class='fas fa-trash-alt'></i> Clear Selection";
    this._map = map;
    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    clear_button.addEventListener("click", function (event) {
      map.setFilter(state + "-bg-highlighted", ["in", "GEOID"]);
    });
    this._container.appendChild(clear_button);
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}
map.addControl(new ClearMapButton(), "top-right");

var eraseMode = false;
class EraserButton {
  onAdd(map) {
    var eraser_button = document.createElement("button");
    eraser_button.href = "#";
    eraser_button.type = "button";
    eraser_button.backgroundImg = "";

    eraser_button.classList.add("draw-group");
    eraser_button.id = "map-eraser-button-id";
    eraser_button.style.display = "block";
    eraser_button.innerHTML = "Eraser";
    this._map = map;
    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    var clicked = false;
    eraser_button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (clicked) {
        eraseMode = false;
        eraser_button.style.backgroundColor = "transparent";
      } else {
        eraseMode = true;
        eraser_button.style.backgroundColor = "#e0e0e0";
      }
      clicked = eraseMode;
    });
    this._container.appendChild(eraser_button);
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}
map.addControl(new EraserButton(), "top-right");

function toggleInstructionBox() {
  // Show instruction box on map for edit mode.
  var instruction_box = document.getElementById("instruction-box-id");
  if (instruction_box.style.display == "block") {
    hideInstructionBox();
  } else {
    showInstructionBox();
  }
}

function showInstructionBox() {
  var instruction_box = document.getElementById("instruction-box-id");
  instruction_box.style.display = "block";
}

function hideInstructionBox() {
  var instruction_box = document.getElementById("instruction-box-id");
  instruction_box.style.display = "none";
}

// Add nav control buttons.
map.addControl(new mapboxgl.NavigationControl());

var user_polygon_id = undefined;

function toggleMapButtons(state) {
  var mapContent = document.getElementById("map");
  var mapButtons = mapContent.getElementsByTagName("button");
  for (var i = 0; i < mapButtons.length; i++) {
    if (state.localeCompare("off") == 0) {
      mapButtons[i].disabled = true;
    } else if (state.localeCompare("on") == 0) {
      mapButtons[i].disabled = false;
    }
  }
}

// Disable map buttons
// toggleMapButtons("off");

// add a new source layer
function newSourceLayer(name, mbCode) {
  map.addSource(name, {
    type: "vector",
    url: "mapbox://" + mapbox_user_name + "." + mbCode,
  });
}
// census block data - lines only, always visible
function newCensusLines(state) {
  map.addLayer({
    id: state + "-census-lines",
    type: "line",
    source: state + "bg",
    "source-layer": state + "bg",
    paint: {
      "line-color": "rgba(0,0,0,0.3)",
      "line-width": 1,
    },
  });
}

// add a new layer of census block data (transparent layer)
function newCensusShading(state) {
  map.addLayer({
    id: state + "-census-shading",
    type: "fill",
    source: state + "bg",
    "source-layer": state + "bg",
    paint: {
      "fill-outline-color": "#000000",
      "fill-color": "#000000",
      "fill-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.2,
        0,
      ],
    },
  });
}
function newHighlightLayer(state) {
  map.addLayer({
    id: state + "-bg-highlighted",
    type: "fill",
    source: state + "bg",
    "source-layer": state + "bg",
    paint: {
      "fill-outline-color": "#1e3799",
      "fill-color": "#4a69bd",
      "fill-opacity": 0.4,
    },
    filter: ["in", "GEOID", ""],
  });
}

// [WIP] function to add the neighbor layers for the filter that queries
// included census block groups
function addNeighborLayersFilter() {
  for (let i = 0; 0 < neighbors.length; i++) {
    if (map.getLayer(neighbors[i] + "-bg-highlighted")) {
      map.setFilter(neighbors[i] + "-bg-highlighted", ["in", "GEOID"]);
    }
  }
}

function addStateNeighborLayers(new_neighbors, new_state) {
  // remove the old state layer and add the new state layer
  if (map.getLayer(state + "-bg-highlighted"))
    map.removeLayer(state + "-bg-highlighted");
  newHighlightLayer(new_state);
  // iterate through all states in the new_neighbors
  // if includes, don't add
  // delete from old neighbors
  // remove layers in the old neighbors list
  for (let i = 0; i < new_neighbors.length; i++) {
    if (map.getLayer(new_neighbors[i] + "-bg-highlighted") == false) {
      newHighlightLayer(new_neighbors[i]);
    } else {
      let index = neighbors.indexOf(new_neighbor[i]);
      neighbors.splice(index, 1);
    }
  }
  for (let i = 0; i < neighbors.length; i++) {
    if (map.getLayer(neighbors[i] + "-bg-highlighted"))
      map.removeLayer(neighbors[i] + "-bg-highlighted");
  }
}

/******************************************************************************/

// initialize shepherd.js tour
let myTour = new Shepherd.Tour({
  defaultStepOptions: {
    cancelIcon: {
      enabled: true,
    },
    classes: "class-1 class-2",
    scrollTo: { behavior: "smooth", block: "center" },
  },
});

myTour.addStep({
  title: "Draw Your Community Map",
  text:
    "Hover over the map and certain grids will appear highlighted. Click to add the highlighted region into your community.",
  buttons: [
    {
      action() {
        return this.complete();
      },
      classes: "shepherd-button-secondary",
      text: "Exit",
    },
    {
      action() {
        return this.next();
      },
      text: "Next",
    },
  ],
});

myTour.addStep({
  title: "Adjust Size",
  text:
    "Use the Select Radius bar to adjust the size of your selection region \
  ",
  attachTo: {
    element: "#map-radius-control-id",
    on: "top",
  },
  buttons: [
    {
      action() {
        return this.back();
      },
      classes: "shepherd-button-secondary",
      text: "Back",
    },
    {
      action() {
        // Open Eraser
        document.getElementById("map-eraser-button-id").click();
        return this.next();
      },
      text: "Next",
    },
  ],
});

myTour.addStep({
  title: "Eraser ",
  text:
    "User the Eraser tool to erase selected units from your map. \
         Click again to return to the select tool",
  attachTo: {
    element: "#map-eraser-button-id",
    on: "bottom",
  },
  buttons: [
    {
      action() {
        // Close eraser
        document.getElementById("map-eraser-button-id").click();
        return this.back();
      },
      classes: "shepherd-button-secondary",
      text: "Back",
    },
    {
      action() {
        // Exit eraser
        document.getElementById("map-eraser-button-id").click();
        return this.next();
      },
      text: "Next",
    },
  ],
});

myTour.addStep({
  title: "Clear Selection",
  text:
    "Delete the community you have drawn or restart the drawing process by clicking this button.",
  attachTo: {
    element: "#map-clear-button-id",
    on: "bottom",
  },
  buttons: [
    {
      action() {
        return this.back();
      },
      classes: "shepherd-button-secondary",
      text: "Back",
    },
    {
      action() {
        return this.next();
      },
      text: "Next",
    },
  ],
});

myTour.addStep({
  title: "Finish Drawing",
  text: `Once you are done fine-tuning your drawing to reflect the geographical boundaries of
  your community of interest you can move on to the sections below to save your community!`,
  attachTo: {
    element: "#map-finish-drawing-button-id",
    on: "bottom",
  },
  buttons: [
    {
      action() {
        return this.back();
      },
      classes: "shepherd-button-secondary",
      text: "Back",
    },
    {
      action() {
        return this.complete();
      },
      text: "Done",
    },
  ],
});

/******************************************************************************/

/* After the map style has loaded on the page, add a source layer and default
styling for a single point. */
map.on("style.load", function () {
  map.addSource("single-point", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [],
    },
  });
  // Whenever a card section button is clicked, resize the map.
  // This ensures that the map is always shown.
  $(".card-section-button").on("click", function () {
    map.resize();
  });

  $("#save").on("click", function () {
    map.resize();
  });

  // this is where the census block groups are loaded, from a url to the mbtiles file uploaded to mapbox
  for (let bg in BG_KEYS) {
    newSourceLayer(bg, BG_KEYS[bg]);
  }

  for (let i = 0; i < states.length; i++) {
    newCensusShading(states[i]);
    newCensusLines(states[i]);
    newHighlightLayer(states[i]);
  }

  // Point centered at geocoded location
  // map.addLayer({
  //   id: "point",
  //   source: "single-point",
  //   type: "circle",
  //   paint: {
  //     "circle-radius": 10,
  //     "circle-color": "#007cbf",
  //   },
  // });

  map.on("click", function (e) {
    // set bbox as rectangle area around clicked point
    var bbox = [
      [e.point.x - drawRadius, e.point.y - drawRadius],
      [e.point.x + drawRadius, e.point.y + drawRadius],
    ];
    var queryFeatures = map.queryRenderedFeatures(bbox, {
      layers: ["mi-census-shading"],
    });
    var features = [];
    for (let i = 0; i < queryFeatures.length; i++) {
      features.push(queryFeatures[i].properties.GEOID);
      // from highlightBlocks method
      // TODO: if eraseMode, remove polygon
      // TODO: for both cases, check if part of existing mpoly
      // TODO: make mpoly a sessionStorage var
      var mpoly = [];
      var wkt = new Wkt.Wkt();
      if (features.length >= 1) {
        var total = 0.0;
        if (feature.geometry.type == "MultiPolygon") {
          var polyCon;
          if (feature.geometry.coordinates[0][0].length > 2) {
            polyCon = turf.polygon([feature.geometry.coordinates[0][0]]);
          } else {
            polyCon = turf.polygon([feature.geometry.coordinates[0]]);
          }
          mpoly = addPoly(polyCon.geometry, mpoly, wkt);
        } else {
          polyCon = turf.polygon([feature.geometry.coordinates[0]]);
          mpoly = addPoly(polyCon.geometry, mpoly, wkt);
        }
      }
    }

    var filter = [];
    var currentSelection = map.getFilter("mi-bg-highlighted");
    if (eraseMode) {
      currentSelection.forEach(function (feature) {
        if (!features.includes(feature)) {
          filter.push(feature);
        }
      });
    } else {
      // Run through the queried features and set a filter based on GEOID
      filter = features.reduce(
        function (memo, feature) {
          memo.push(feature);
          return memo;
        },
        ["in", "GEOID"]
      );

      currentSelection.forEach(function (feature) {
        if (feature !== "in" && feature !== "GEOID" && feature !== "") {
          filter.push(feature);
        }
      });
    }

    map.setFilter("mi-bg-highlighted", filter);
  });

  // Listen for the `geocoder.input` event that is triggered when a user
  // makes a selection and add a symbol that matches the result.
  geocoder.on("result", function (ev) {
    $("#shepherd-btn").removeClass("d-none");
    map.getSource("single-point").setData(ev.result.geometry);
    var styleSpec = ev.result;
    var styleSpecBox = document.getElementById("json-response");
    var styleSpecText = JSON.stringify(styleSpec, null, 2);

    showMap();
    // get the state from the geocoder response
    if (styleSpec.context.length >= 2) {
      new_state = styleSpec.context[styleSpec.context.length - 2]["short_code"]
        .toLowerCase()
        .substring(3);
    } else {
      new_state = styleSpec.properties["short_code"].toLowerCase().substring(3);
    }
    // get the neighbors of the state if the state is different
    if (state != new_state) {
      new_neighbors = state_neighbors[new_state];
      state = new_state;
      neighbors = new_neighbors;
    }
    // Save state to session storage
    sessionStorage.setItem("state_name", state);

    // Tracking
    mixpanel.track("Geocoder Search Successful", {
      drive_id: drive_id,
      drive_name: drive_name,
      organization_id: organization_id,
      organization_name: organization_name,
    });
  });
});

var wasLoaded = false;
map.on("render", function (event) {
  if (map.loaded() == false || wasLoaded) return;
  wasLoaded = true;
  // TODO: change to be a test of whether or not there is a highlighted bg layer
  if (document.getElementById("id_user_polygon").value !== "") {
    // TODO: update so that the map flies to the highlighted blocks + calls updateCommunityEntry
    var feature = document.getElementById("id_user_polygon").value;
    var wkt = new Wkt.Wkt();
    wkt_obj = wkt.read(feature);
    var geoJsonFeature = wkt_obj.toJson();
    var featureIds = draw.add(geoJsonFeature);
    updateCommunityEntry(event);
    map.flyTo({
      center: geoJsonFeature.coordinates[0][0],
      essential: true, // this animation is considered essential with respect to prefers-reduced-motion
      zoom: 8,
    });
  }
});

// When the user moves their mouse over the census shading layer, we'll update the
// feature state for the feature under the mouse.
var bgID = null;
var features = [];
var drawRadius = 20;
map.on("mousemove", "mi-census-shading", function (e) {
  if (e.features.length > 0) {
    // create a constantly updated list of the features which have been highlighted in foreach loop
    // before highlighting, go thru that list, and deselect all
    var bbox = [
      [e.point.x - drawRadius, e.point.y - drawRadius],
      [e.point.x + drawRadius, e.point.y + drawRadius],
    ];
    var hoverFeatures = map.queryRenderedFeatures(bbox, {
      layers: ["mi-census-shading"],
    });
    features.forEach(function (feature) {
      bgID = feature.id;
      map.setFeatureState(
        { source: "mibg", sourceLayer: "mibg", id: bgID },
        { hover: false }
      );
    });
    features = [];
    hoverFeatures.forEach(function (feature) {
      features.push(feature);
      bgID = feature.id;
      map.setFeatureState(
        { source: "mibg", sourceLayer: "mibg", id: bgID },
        { hover: true }
      );
    });
  }
});

// When the mouse leaves the state-fill layer, update the feature state of the
// previously hovered feature.
map.on("mouseleave", "mi-census-shading", function () {
  if (bgID) {
    map.setFeatureState(
      { source: "mibg", sourceLayer: "mibg", id: bgID },
      { hover: false }
    );
  }
  bgID = null;
});

/******************************************************************************/

function cleanAlerts() {
  let mapAlertMessages = document.querySelectorAll(
    "#map-success-message, #map-area-size-error, #polygon-kink-error, #polygon_missing"
  );
  for (i = 0; i < mapAlertMessages.length; i++) {
    mapAlertMessages[i].remove();
  }
}

function triggerMissingPolygonError() {
  triggerDrawError(
    "polygon_missing",
    "You must draw a polygon to submit this entry."
  );
}

function triggerDrawError(id, stringErrorText) {
  /*
  triggerDrawError creates a bootstrap alert placed on top of the map.
  */
  // Remove success message.
  let oldSuccessAlert = document.getElementById("map-success-message");
  if (oldSuccessAlert) {
    oldSuccessAlert.remove();
  }
  // Check for old error and return if already inserted.
  let oldAlert = document.getElementById(id);
  if (oldAlert) {
    return;
  }
  let newAlert = document.createElement("div");
  newAlert.innerHTML =
    '<div id="' +
    id +
    '" class="alert alert-danger alert-dismissible fade show map-alert" role="alert">\
  ' +
    stringErrorText +
    '\
  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\
  <span aria-hidden="true">&times;</span>\
  </button>\
  </div>';
  document.getElementById("map-error-alerts").appendChild(newAlert);
  sessionStorage.setItem("map_drawn_successfully", false);
}

/******************************************************************************/

function triggerSuccessMessage() {
  /*
  triggerSuccessMessage lets the user know that they created a succesful
  polygon.
  */
  // Remove all map alert messages.
  cleanAlerts();

  let newAlert = document.createElement("div");
  newAlert.innerHTML =
    '<div id="map-success-message" class="alert alert-success alert-dismissible fade show map-alert" role="alert">\
  <strong>Congratulations!</strong> Your map looks great.\
  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\
  <span aria-hidden="true">&times;</span>\
  </button>\
  </div>';
  document.getElementById("map-error-alerts").appendChild(newAlert);
  var map_drawn_flag = sessionStorage.getItem("map_drawn_successfully");
  if (map_drawn_flag == "false") {
    mixpanel.track("Map Drawing Successful", {
      drive_id: drive_id,
      drive_name: drive_name,
      organization_id: organization_id,
      organization_name: organization_name,
    });
    sessionStorage.setItem("map_drawn_successfully", true);
  }
}

/*  Pushes poly in its wkt forms to the polyArray */
function addPoly(poly, polyArray, wkt) {
  // coordinates attribute that shud be converted and pushed
  var poly_json = JSON.stringify(poly);
  var wkt_obj = wkt.read(poly_json);
  var poly_wkt = wkt_obj.write();
  polyArray.push(poly_wkt);
  return polyArray;
}

function updateFormFields(census_blocks_polygon_array) {
  // Update form fields
  document.getElementById(
    "id_census_blocks_polygon_array"
  ).value = census_blocks_polygon_array;
  // "census_blocks_polygon" gets saved in the post() function in django
}

/* Responds to the user's actions and updates the geometry fields and the arrayfield
in the form. */
function updateCommunityEntry(event) {
  cleanAlerts();
  // TODO: use turf or something to determine if highlighted layer is compact & contiguous
    // save census block groups multipolygon
    census_blocks_polygon_array = mpoly;
    if (census_blocks_polygon_array != undefined) {
      census_blocks_polygon_array = census_blocks_polygon_array.join("|");
    }
    triggerSuccessMessage();
    showMap();
  updateFormFields(census_blocks_polygon_array);
}
/******************************************************************************/

function updateElementIndex(el, prefix, ndx) {
  var id_regex = new RegExp("(" + prefix + "-\\d+)");
  var replacement = prefix + "-" + ndx;
  if ($(el).attr("for"))
    $(el).attr("for", $(el).attr("for").replace(id_regex, replacement));
  if (el.id) el.id = el.id.replace(id_regex, replacement);
  if (el.name) el.name = el.name.replace(id_regex, replacement);
}

/******************************************************************************/
