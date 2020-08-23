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
var filterStack = JSON.parse(sessionStorage.getItem("filterStack"));
var bboxStack = JSON.parse(sessionStorage.getItem("bboxStack"));
if (filterStack === null) filterStack = [];
if (bboxStack === null) bboxStack = [];

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

// Formset field object saves a deep copy of the original formset field object.
// (If user deletes all fields, he can add one more according to this one).
var formsetFieldObject;
var state;
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

// check that there is an empty filter (no highlighted selection)
function isEmptyFilter(filter) {
  var isEmpty = true;
  filter.forEach(function (feature) {
    if (feature !== "in" && feature !== "GEOID" && feature !== "") {
      isEmpty = false;
      return;
    }
  });
  return isEmpty;
}

/******************************************************************************/

function showMap() {
  $(".map-bounding-box.collapse").collapse("show");
  map.resize();
}

function toggleErrorSuccess(field) {
  if (field.classList.contains("has_error")) {
    field.classList.toggle("has_error");
  }
  field.classList.add("has_success");
}
function toggleErrorFail(field) {
  if (field.classList.contains("has_success")) {
    field.classList.toggle("has_success");
  }
  field.classList.add("has_error");
}

function checkFieldById(field_id) {
  var field = document.getElementById(field_id);
  if (field.type === "checkbox") {
    if (field.checked === true) {
      toggleErrorSuccess(field);
      return true;
    } else {
      // terms-card is the entire card with checkbox -- since it doesn't behave
      // as other form fields do
      toggleErrorFail(document.getElementById("terms-card"));
      return false;
    }
  }
  if (field.value == null || field.value == "") {
    toggleErrorFail(field);
    return false;
  }
  toggleErrorSuccess(field);
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
  if (flag == false) {
    // Add alert.
    var alert = document.getElementById("form_error");
    alert.classList.remove("d-none");
    scrollIntoViewSmooth(alert.id);
  }
  return flag;
}

/****************************************************************************/
// generates polygon to be saved from the selection
function createCommPolygon() {
  // start by checking size -- 800 is an arbitrary number
  // it means a community with a population between 480,000 & 2,400,000
  var polyFilter = JSON.parse(sessionStorage.getItem("bgFilter"));

  if (polyFilter === null) return false;
  if (polyFilter.length > 802) {
    triggerDrawError(
      "polygon_size",
      "You must select a smaller area to submit this community."
    );
    return false;
  } else if (isEmptyFilter(polyFilter)) {
    triggerMissingPolygonError();
    return false;
  }
  // now query the features and build the polygon to be saved
  var queryFeatures = map.queryRenderedFeatures({
    layers: [state + "-census-shading"],
  });
  var multiPolySave;
  queryFeatures.forEach(function (feature) {
    if (polyFilter.includes(feature.properties.GEOID)) {
      if (multiPolySave === undefined) {
        multiPolySave = feature;
      } else {
        multiPolySave = turf.union(multiPolySave, feature);
      }
    }
  });


  // for display purposes -- this is the final multipolygon!!
  // TODO: implement community entry model change -> store only outer coordinates (like code in map.js)
  var wkt = new Wkt.Wkt();
  var wkt_obj = wkt.read(JSON.stringify(multiPolySave.geometry));
  var poly_wkt = wkt_obj.write();
  // ok so this is kinda jank lol but let me explain
  // if it isn't a contiguous selection area, then poly_wkt will start with "MULTIPOLYGON"
  // otherwise it starts with "POLYGON" -- so we test the first char for contiguity 8-)
  if (poly_wkt[0] === "M") {
    triggerDrawError(
      "polygon_size",
      "Please ensure that your community does not contain any gaps. Your selected units must connect."
    );
    return false;
  } else {
    triggerSuccessMessage();
    updateFormFields(poly_wkt);

    // clean up polyFilter -- this is the array of GEOID to be stored
    polyFilter.splice(0, 1);
    polyFilter.splice(0, 1);
    // TODO: implement community entry model change -> store this array of references to blockgroups!
    document.getElementById("id_block_groups").value = polyFilter;

  }
  return true;
}

// zoom to the current Selection
function zoomToCommunity() {
  var selectBbox = JSON.parse(sessionStorage.getItem("selectBbox"));
  if (selectBbox === null || selectBbox.length === 0) return;
  var bbox = turf.bbox(selectBbox);
  map.fitBounds(bbox, { padding: 100, duration: 0 });
}
/****************************************************************************/

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
    $("#save").on("click", function (e) {
      e.preventDefault();
      var form = $("#entryForm");
      zoomToCommunity();
      // delay so that zoom can occur
      var polySuccess = true,
        formSuccess = true;
      // loading icon
      $("#loading-entry").css("display", "block");
      $("#loading-entry").delay(2000).fadeOut(2000);
      setTimeout(function () {
        polySuccess = createCommPolygon();
        formSuccess = formValidation();
      }, 500);
      setTimeout(function () {
        if (polySuccess && formSuccess) {
          form.submit();
        }
      }, 2000);
      return false;
    });
    // If there are alerts, scroll to first one.
    var document_alerts = document.getElementsByClassName("django-alert");
    if (document_alerts.length > 0) {
      let first_alert = document_alerts[0];
      scrollIntoViewSmooth(first_alert.id);
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
  style: "mapbox://styles/districter-team/ckdfv8riy0uf51hqu1g7qjrha", //hosted style id
  center: [-96.7026, 40.8136], // starting position - Lincoln, NE :)
  zoom: 3, // starting zoom -- higher is closer
  maxZoom: 14, // camelCase. There's no official documentation for this smh :/
  minZoom: 7,
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

    radius_control.classList.add("active");
    radius_control.id = "map-radius-control-id";
    radius_control.style.display = "block";
    radius_control.innerHTML =
      '<form><input type="range" min="1" max="50" value="25" class="custom-range" id="radius-control"><p style="margin: 0;">Selection Size: <span id="radius-value">25</span></p></form>';
    this._map = map;
    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group draw-group";
    this._container.id = "draw-group-container";
    this._container.appendChild(radius_control);
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}
map.addControl(new SelectRadiusButton(), "top-right");
var drawControls = document.getElementById("draw-group-container");

var slider = document.getElementById("radius-control");
var rangeVal = document.getElementById("radius-value");
slider.oninput = function () {
  var size = this.value;
  drawRadius = parseInt(size);
  rangeVal.innerHTML = size;
};

var eraseMode = false;
class DrawButton {
  onAdd(map) {
    var draw_button = document.createElement("button");
    draw_button.href = "#";
    draw_button.type = "button";
    draw_button.backgroundImg = "";
    draw_button.style.backgroundColor = "#e0e0e0";

    draw_button.classList.add("active");
    draw_button.id = "map-draw-button-id";
    draw_button.style.display = "block";
    draw_button.innerHTML = "<i class='fas fa-pencil-alt'></i> Draw";
    this._map = map;
    return draw_button;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}
map.addControl(new DrawButton(), "top-right");
var mapDraw = document.getElementById("map-draw-button-id");
drawControls.appendChild(mapDraw);

class EraserButton {
  onAdd(map) {
    var eraser_button = document.createElement("button");
    eraser_button.href = "#";
    eraser_button.type = "button";
    eraser_button.backgroundImg = "";

    eraser_button.classList.add("active");
    eraser_button.id = "map-eraser-button-id";
    eraser_button.style.display = "block";
    eraser_button.innerHTML = "<i class='fas fa-eraser'></i> Eraser";
    this._map = map;
    return eraser_button;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}
map.addControl(new EraserButton(), "top-right");
var mapEraser = document.getElementById("map-eraser-button-id");
drawControls.appendChild(mapEraser);

// click on draw deselects erase, vice versa
mapDraw.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();

  if (eraseMode) {
    eraseMode = false;
    mapDraw.style.backgroundColor = "#e0e0e0";
    mapEraser.style.backgroundColor = "transparent";
  }
});
mapEraser.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  if (!eraseMode) {
    eraseMode = true;
    mapDraw.style.backgroundColor = "transparent";
    mapEraser.style.backgroundColor = "#e0e0e0";
  }
});

class UndoButton {
  onAdd(map) {
    var undo_button = document.createElement("button");
    undo_button.href = "#";
    undo_button.type = "button";
    undo_button.backgroundImg = "";

    undo_button.classList.add("active");
    undo_button.id = "map-undo-button-id";
    undo_button.style.display = "block";
    undo_button.innerHTML = "<i class='fas fa-undo-alt'></i> Undo";
    this._map = map;
    undo_button.addEventListener("click", function (event) {
      if (filterStack.length === 0) {
        showWarningMessage("There are no actions to undo");
      } else {
        var undoFilter = filterStack.pop();
        var undoBbox = bboxStack.pop();
        if (isEmptyFilter(undoFilter)) {
          sessionStorage.setItem("selectBbox", "[]");
        } else {
          sessionStorage.setItem("selectBbox", undoBbox);
        }
        map.setFilter(state + "-bg-highlighted", undoFilter);
        sessionStorage.setItem("bgFilter", JSON.stringify(undoFilter));
        sessionStorage.setItem("filterStack", JSON.stringify(filterStack));
        sessionStorage.setItem("bboxStack", JSON.stringify(bboxStack));
      }
    });
    return undo_button;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}
map.addControl(new UndoButton(), "top-right");
var mapUndoButton = document.getElementById("map-undo-button-id");
drawControls.appendChild(mapUndoButton);

class ClearMapButton {
  onAdd(map) {
    var clear_button = document.createElement("button");
    clear_button.href = "#";
    clear_button.type = "button";
    clear_button.backgroundImg = "";

    clear_button.classList.add("active");
    clear_button.id = "map-clear-button-id";
    clear_button.style.display = "block";
    clear_button.innerHTML = "<i class='fas fa-trash-alt'></i> Clear Selection";
    this._map = map;
    clear_button.addEventListener("click", function (event) {
      // check for empty map -- raise warning message if so
      var undoFilter = JSON.parse(sessionStorage.getItem("bgFilter"));
      if (undoFilter === null || isEmptyFilter(undoFilter)) {
        showWarningMessage("There is no selection to clear.");
        return;
      }
      let isConfirmed = confirm(
        "Are you sure you want to clear the map? This will delete the blocks you have selected."
      );
      if (isConfirmed) {
        map.setFilter(state + "-bg-highlighted", ["in", "GEOID"]);
        var undoBbox = sessionStorage.getItem("selectBbox");
        filterStack.push(undoFilter);
        bboxStack.push(undoBbox);
        sessionStorage.setItem("bgFilter", "[]");
        sessionStorage.setItem("selectBbox", "[]");
        sessionStorage.setItem("filterStack", JSON.stringify(filterStack));
        sessionStorage.setItem("bboxStack", JSON.stringify(bboxStack));
      }
    });
    return clear_button;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}
map.addControl(new ClearMapButton(), "top-right");
var mapClearButton = document.getElementById("map-clear-button-id");
drawControls.appendChild(mapClearButton);

function showWarningMessage(warning) {
  var warning_box = document.getElementById("warning-box-id");
  warning_box.innerHTML =
    '<p class="mb-0"><i class="fa fa-exclamation-triangle"></i> ' +
    warning +
    "</p>";
  warning_box.style.display = "block";
  setTimeout(function () {
    warning_box.style.display = "none";
  }, 4000);
}

function hideWarningMessage() {
  var warning_box = document.getElementById("warning-box-id");
  warning_box.style.display = "none";
}

// Add nav control buttons.
map.addControl(new mapboxgl.NavigationControl());

var user_polygon_id = undefined;

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
    layout: {
      visibility: "none",
    },
    paint: {
      "line-color": "rgba(0,0,0,0.2)",
      "line-width": 1,
    },
  });
}

// add a new layer of census block data (transparent layer)
function newCensusShading(state, firstSymbolId) {
  map.addLayer(
    {
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
    },
    firstSymbolId
  );
}
function newHighlightLayer(state, firstSymbolId) {
  map.addLayer(
    {
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
    },
    firstSymbolId
  );
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
    "Hover over the map and certain units will appear highlighted. Click to add the highlighted region into your community.",
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
        // adjust draw size
        document.getElementById("radius-control").value = 30;
        document.getElementById("radius-value").textContent = "30";
        return this.next();
      },
      text: "Next",
    },
  ],
});

myTour.addStep({
  title: "Adjust Size",
  text:
    "Use the Selection Size bar to adjust the size of your selection region \
  ",
  attachTo: {
    element: "#map-radius-control-id",
    on: "top",
  },
  buttons: [
    {
      action() {
        // adjust draw size
        document.getElementById("radius-control").value = 25;
        document.getElementById("radius-value").textContent = "25";
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
  text: "Use the Eraser tool to erase selected units from your map.",
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
        // adjust to smaller eraser size
        document.getElementById("radius-control").value = 15;
        document.getElementById("radius-value").textContent = "15";
        return this.next();
      },
      text: "Next",
    },
  ],
});

myTour.addStep({
  title: "Adjust Eraser Size",
  text:
    "You can also adjust the size of your eraser with the select size bar \
  ",
  attachTo: {
    element: "#map-radius-control-id",
    on: "top",
  },
  buttons: [
    {
      action() {
        // adjust to smaller eraser size
        document.getElementById("radius-control").value = 30;
        document.getElementById("radius-value").textContent = "30";
        return this.back();
      },
      classes: "shepherd-button-secondary",
      text: "Back",
    },
    {
      action() {
        // Exit eraser
        document.getElementById("map-draw-button-id").click();
        return this.next();
      },
      text: "Next",
    },
  ],
});

myTour.addStep({
  title: "Draw",
  text: "Click the draw button to return to to adding units to the map.",
  attachTo: {
    element: "#map-draw-button-id",
    on: "bottom",
  },
  buttons: [
    {
      action() {
        // Reselect eraser tool
        document.getElementById("map-eraser-button-id").click();
        return this.back();
      },
      classes: "shepherd-button-secondary",
      text: "Back",
    },
    {
      action() {
        document.getElementById("map-undo-button-id").click();
        return this.next();
      },
      text: "Next",
    },
  ],
});

myTour.addStep({
  title: "Undo",
  text: "To undo your previous action, click on the Undo button.",
  attachTo: {
    element: "#map-undo-button-id",
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
  title: "Clear Selection",
  text:
    "Delete the community you have drawn or restart the drawing process by clicking the Clear Selection button.",
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
  your Community of Interest continue on to the next section to save your community!`,
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
// the drawing radius for select tool
var drawRadius = 25;
/* After the map style has loaded on the page, add a source layer and default
styling for a single point. */
map.on("style.load", function () {

  var layers = map.getStyle().layers;
  // Find the index of the first symbol layer in the map style
  var firstSymbolId;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].type === "symbol" && layers[i] !== "road") {
      firstSymbolId = layers[i].id;
      break;
    }
  }

  // Whenever a card section button is clicked, resize the map.
  // This ensures that the map is always shown.
  $(".card-section-button").on("click", function () {
    map.resize();
  });

  $("#save").on("click", function () {
    map.resize();
  });

  // this is where the census block groups are loaded, from a url to the mbtiles file uploaded to mapbox
  newSourceLayer(state + "bg", BG_KEYS[state + "bg"]);
  newCensusShading(state, firstSymbolId);
  newCensusLines(state);
  newHighlightLayer(state);
  showMap();
  map.flyTo({
    center: statesLngLat[state.toUpperCase()],
    zoom: 6,
    essential: true, // this animation is considered essential with respect to prefers-reduced-motion
  });

  sessionStorage.setItem("bgFilter", "[]");
  sessionStorage.setItem("selectBbox", "[]");

  $("#shepherd-btn").removeClass("d-none");
  map.setLayoutProperty(state + "-census-lines", "visibility", "visible");

  // When the user moves their mouse over the census shading layer, we'll update the
  // feature state for the feature under the mouse.
  var bgID = null;
  var features = [];
  var stateCensus = state + "-census-shading";

  // when selecting or erasing
  map.on("click", function (e) {
    // set bbox as rectangle area around clicked point
    var bbox = [
      [e.point.x - drawRadius, e.point.y - drawRadius],
      [e.point.x + drawRadius, e.point.y + drawRadius],
    ];
    var queryFeatures = map.queryRenderedFeatures(bbox, {
      layers: [state + "-census-shading"],
    });
    var isChanged = false; // store only valid moves in stack
    var features = []; // the features in click radius
    var currentBbox; // the current selection area bounding box
    for (let i = 0; i < queryFeatures.length; i++) {
      var feature = queryFeatures[i];
      // push to highlight layer for visibility
      features.push(feature.properties.GEOID);
      if (features.length >= 1) {
        // polyCon : the turf polygon from coordinates
        var polyCon = turf.bbox(feature.geometry);
        var memoPoly = turf.bboxPolygon(polyCon);
        if (i === 0) {
          currentBbox = memoPoly;
        } else {
          currentBbox = turf.union(memoPoly, currentBbox);
        }
      }
    }
    // the previously stored selected area bounding box
    var selectBbox = JSON.parse(sessionStorage.getItem("selectBbox"));

    var filter = [];
    var currentFilter = map.getFilter(state + "-bg-highlighted");
    if (eraseMode) {
      currentFilter.forEach(function (feature) {
        if (!features.includes(feature)) {
          filter.push(feature);
        }
      });
      arraysEqual(filter, currentFilter)
        ? (isChanged = false)
        : (isChanged = true);
      if (isChanged) {
        if (isEmptyFilter(filter)) {
          sessionStorage.setItem("selectBbox", "[]");
        }
        selectBbox = turf.difference(selectBbox, currentBbox);
      }
    } else {
      // check if previous selectBbox overlaps with current selectBbox
      if (selectBbox === null || selectBbox.length === 0) {
        isChanged = true;
        selectBbox = currentBbox;
        hideWarningMessage();
      } else {
        if (turf.booleanDisjoint(currentBbox, selectBbox)) {
          showWarningMessage(
            "Please ensure that your community does not contain any gaps. Your selected units must connect."
          );
          return;
        } else {
          isChanged = true;
          selectBbox = turf.union(currentBbox, selectBbox);
          hideWarningMessage();
        }
      }
      // Run through the queried features and set a filter based on GEOID
      filter = features.reduce(
        function (memo, feature) {
          memo.push(feature);
          return memo;
        },
        ["in", "GEOID"]
      );

      currentFilter.forEach(function (feature) {
        if (feature !== "in" && feature !== "GEOID" && feature !== "") {
          filter.push(feature);
        }
      });
    }
    // check size of community
    if (filter.length < 802) {
      map.setFilter(state + "-bg-highlighted", filter);
    } else {
      showWarningMessage(
        "This community is too large. Please select a smaller area to continue."
      );
    }
    if (isChanged) {
      filterStack.push(currentFilter);
      bboxStack.push(JSON.stringify(currentBbox));
      sessionStorage.setItem("filterStack", JSON.stringify(filterStack));
      sessionStorage.setItem("bboxStack", JSON.stringify(bboxStack));
      sessionStorage.setItem("bgFilter", JSON.stringify(filter));
      sessionStorage.setItem("selectBbox", JSON.stringify(selectBbox));
    }
  });

  // When the user moves their mouse over the census shading layer, we'll update the
  // feature state for the feature under the mouse.
  var bgID = null;
  var features = [];
  stateCensus = state + "-census-shading";
  // if touch screen, disable.
  if (!is_touch_device()) {
    map.on("mousemove", stateCensus, function (e) {
      if (e.features.length > 0) {
        // create a constantly updated list of the features which have been highlighted in foreach loop
        // before highlighting, go thru that list, and deselect all
        var bbox = [
          [e.point.x - drawRadius, e.point.y - drawRadius],
          [e.point.x + drawRadius, e.point.y + drawRadius],
        ];
        var hoverFeatures = map.queryRenderedFeatures(bbox, {
          layers: [state + "-census-shading"],
        });
        stateBG = state + "bg";
        features.forEach(function (feature) {
          bgID = feature.id;
          map.setFeatureState(
            { source: stateBG, sourceLayer: stateBG, id: bgID },
            { hover: false }
          );
        });
        features = [];
        hoverFeatures.forEach(function (feature) {
          features.push(feature);
          bgID = feature.id;
          map.setFeatureState(
            { source: stateBG, sourceLayer: stateBG, id: bgID },
            { hover: true }
          );
        });
      }
    });

  // When the mouse leaves the state-fill layer, update the feature state of the
  // previously hovered feature.
  map.on("mouseleave", stateCensus, function () {
    if (bgID) {
      stateBG = state + "bg";
      map.setFeatureState(
        { source: stateBG, sourceLayer: stateBG, id: bgID },
        { hover: false }
      );
    }
    bgID = null;
  });
}
});

// reloading the page (like when the form fails validation)
// this is still a lil fuzzy
var wasLoaded = false;
map.on("render", function (e) {
  if (map.loaded() == false || wasLoaded) return;
  wasLoaded = true;
  // test if polygon has been drawn
  var bgPoly = sessionStorage.getItem("bgFilter");
  if (
    bgPoly !== "[]" &&
    state !== null &&
    bgPoly !== null &&
    bgPoly !== "null"
  ) {
    // re-display the polygon
    map.setFilter(state + "-bg-highlighted", JSON.parse(bgPoly));
    var selectBbox = JSON.parse(sessionStorage.getItem("selectBbox"));
    if (selectBbox.length !== 0) {
      map.flyTo({
        center: [
          selectBbox.geometry.coordinates[0][0][0],
          selectBbox.geometry.coordinates[0][0][1],
        ],
        essential: true, // this animation is considered essential with respect to prefers-reduced-motion
        zoom: 10,
      });
    }
  }
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
  scrollIntoViewSmooth(id);
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
  // document.getElementById("map-error-alerts").appendChild(newAlert);
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

function updateFormFields(census_blocks_polygon_array) {
  // Update form fields
  document.getElementById(
    "id_census_blocks_polygon_array"
  ).value = census_blocks_polygon_array;
  // "census_blocks_polygon" gets saved in the post() function in django
}

/******************************************************************************/

// check if device is touch screen --> https://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript/4819886#4819886
function is_touch_device() {
  var prefixes = " -webkit- -moz- -o- -ms- ".split(" ");

  var mq = function (query) {
    return window.matchMedia(query).matches;
  };

  if (
    "ontouchstart" in window ||
    (window.DocumentTouch && document instanceof DocumentTouch)
  ) {
    return true;
  }

  // include the 'heartz' as a way to have a non matching MQ to help terminate the join
  // https://git.io/vznFH
  var query = ["(", prefixes.join("touch-enabled),("), "heartz", ")"].join("");
  return mq(query);
}

/****************************************************************************/

// scroll smoothly with a bit of offset
function scrollIntoViewSmooth(id) {
  var yOffset = -10;
  var element = document.getElementById(id);
  var y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

  window.scrollTo({ top: y, behavior: "smooth" });
}

// check if two arrays are equal (same elements)
function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
