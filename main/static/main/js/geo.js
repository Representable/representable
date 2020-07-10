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

/* tutorial reference for draw control properties:
https://bl.ocks.org/dnseminara/0790e53cef9867e848e716937727ab18
*/
var draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: true,
  },
  styles: [
    {
      id: "gl-draw-polygon-fill-inactive",
      type: "fill",
      filter: [
        "all",
        ["==", "active", "false"],
        ["==", "$type", "Polygon"],
        ["!=", "mode", "static"],
      ],
      paint: {
        "fill-color": "#60a3bc",
        "fill-outline-color": "#60a3bc",
        "fill-opacity": 0.2,
      },
    },
    {
      id: "gl-draw-polygon-fill-active",
      type: "fill",
      filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
      paint: {
        "fill-color": "#60a3bc",
        "fill-outline-color": "#60a3bc",
        "fill-opacity": 0.5,
      },
    },
    {
      id: "gl-draw-polygon-stroke-inactive",
      type: "line",
      filter: [
        "all",
        ["==", "active", "false"],
        ["==", "$type", "Polygon"],
        ["!=", "mode", "static"],
      ],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#60a3bc",
        "line-width": 2,
      },
    },
    {
      id: "gl-draw-polygon-stroke-active",
      type: "line",
      filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#60a3bc",
        "line-dasharray": [0.2, 2],
        "line-width": 2,
      },
    },
    {
      id: "gl-draw-line-inactive",
      type: "line",
      filter: [
        "all",
        ["==", "active", "false"],
        ["==", "$type", "LineString"],
        ["!=", "mode", "static"],
      ],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#34495e",
        "line-width": 2,
      },
    },
    {
      id: "gl-draw-line-active",
      type: "line",
      filter: ["all", ["==", "$type", "LineString"], ["==", "active", "true"]],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#34495e",
        "line-dasharray": [0.2, 2],
        "line-width": 2,
      },
    }, // basic tools - default settings
    {
      id: "gl-draw-polygon-and-line-vertex-stroke-inactive",
      type: "circle",
      filter: [
        "all",
        ["==", "meta", "vertex"],
        ["==", "$type", "Point"],
        ["!=", "mode", "static"],
      ],
      paint: {
        "circle-radius": 10,
        "circle-color": "#34495e",
      },
    },
    {
      id: "gl-draw-polygon-and-line-vertex-inactive",
      type: "circle",
      filter: [
        "all",
        ["==", "meta", "vertex"],
        ["==", "$type", "Point"],
        ["!=", "mode", "static"],
      ],
      paint: {
        "circle-radius": 4,
        "circle-color": "#34495e",
      },
    },
    {
      id: "gl-draw-point-point-stroke-inactive",
      type: "circle",
      filter: [
        "all",
        ["==", "active", "false"],
        ["==", "$type", "Point"],
        ["==", "meta", "feature"],
        ["!=", "mode", "static"],
      ],
      paint: {
        "circle-radius": 5,
        "circle-opacity": 1,
        "circle-color": "#fff",
      },
    },
    {
      id: "gl-draw-point-inactive",
      type: "circle",
      filter: [
        "all",
        ["==", "active", "false"],
        ["==", "$type", "Point"],
        ["==", "meta", "feature"],
        ["!=", "mode", "static"],
      ],
      paint: {
        "circle-radius": 3,
        "circle-color": "#34495e",
      },
    },
    {
      id: "gl-draw-point-stroke-active",
      type: "circle",
      filter: [
        "all",
        ["==", "$type", "Point"],
        ["==", "active", "true"],
        ["!=", "meta", "midpoint"],
      ],
      paint: {
        "circle-radius": 7,
        "circle-color": "#fff",
      },
    },
    {
      id: "gl-draw-point-active",
      type: "circle",
      filter: [
        "all",
        ["==", "$type", "Point"],
        ["!=", "meta", "midpoint"],
        ["==", "active", "true"],
      ],
      paint: {
        "circle-radius": 5,
        "circle-color": "#34495e",
      },
    },
    {
      id: "gl-draw-polygon-midpoint",
      type: "circle",
      filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
      paint: {
        "circle-radius": 5,
        "circle-color": "#e67e22",
      },
    },
  ],
});

// Add controls outside of map.
// Source: https://github.com/mapbox/mapbox-gl-draw/blob/master/docs/API.md
map.addControl(draw);
// Insert class into draw buttons so we can differentiate their styling from
// from the nav buttons below.
drawControls = document.querySelector(".draw_polygon_map .mapboxgl-ctrl-group");
drawControls.classList.add("draw-group");

/* Change mapbox draw button */
var drawButton = document.querySelector(".mapbox-gl-draw_polygon");
drawButton.backgroundImg = "";
drawButton.id = "draw-button-id";
drawButton.innerHTML = "<i class='fas fa-draw-polygon'></i> Draw Polygon";
var delete_feature_button = document.querySelector(".mapbox-gl-draw_trash");
delete_feature_button.backgroundImg = "";
delete_feature_button.id = "delete-feature-button-id";
delete_feature_button.style.display = "none";
delete_feature_button.innerHTML =
  "<i class='fas fa-minus-square'></i> Delete Point";

class ClearMapButton {
  onAdd(map) {
    var clear_map_button = document.createElement("button");
    clear_map_button.href = "#";
    clear_map_button.type = "button";
    clear_map_button.backgroundImg = "";

    clear_map_button.classList.add("active");
    clear_map_button.classList.add("map-clear-button");
    clear_map_button.classList.add("mapbox-gl-draw_ctrl-draw-btn");
    clear_map_button.id = "map-clear-button-id";
    clear_map_button.style.display = "none";
    clear_map_button.innerHTML =
      "<i class='fas fa-trash-alt'></i> Clear Polygon";
    this._map = map;
    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    clear_map_button.addEventListener("click", function (event) {
      hideInstructionBox();
      draw.deleteAll();
      if (states.includes(state)) {
        map.setFilter(state + "-bg-highlighted", ["in", "GEOID"]);
      }
      draw.changeMode("simple_select");
      hideMapEditButtons();
    });
    this._container.appendChild(clear_map_button);
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}
map.addControl(new ClearMapButton(), "top-right");
var map_clear_map_button = document.getElementById("map-clear-button-id");
drawControls.appendChild(map_clear_map_button);
// add button for toggling edit mode.
class MapEditButton {
  onAdd(map) {
    var map_edit_button = document.createElement("button");
    map_edit_button.href = "#";
    map_edit_button.type = "button";
    map_edit_button.backgroundImg = "";

    map_edit_button.classList.add("active");
    map_edit_button.classList.add("map-edit-button");
    map_edit_button.classList.add("mapbox-gl-draw_ctrl-draw-btn");
    map_edit_button.id = "map-edit-button-id";
    map_edit_button.style.display = "none";
    map_edit_button.innerHTML = "<i class='fas fa-edit'></i> Edit Polygon";
    this._map = map;
    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    map_edit_button.addEventListener("click", function (e) {
      toggleInstructionBox();
      var all_features = draw.getAll();
      if (all_features.features.length > 0) {
        draw.changeMode("direct_select", {
          featureId: all_features.features[0].id,
        });
      }
    });
    this._container.appendChild(map_edit_button);
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}
map.addControl(new MapEditButton(), "top-right");
var map_edit_button = document.getElementById("map-edit-button-id");
drawControls.appendChild(map_edit_button);

class FinishDrawButton {
  onAdd(map) {
    var finish_draw_button = document.createElement("button");
    finish_draw_button.href = "#";
    finish_draw_button.type = "button";
    finish_draw_button.backgroundImg = "";

    finish_draw_button.classList.add("active");
    finish_draw_button.classList.add("map-finish-drawing-button");
    finish_draw_button.classList.add("mapbox-gl-draw_ctrl-draw-btn");
    finish_draw_button.id = "map-finish-drawing-button-id";
    finish_draw_button.style.display = "none";
    finish_draw_button.innerHTML =
      "<i class='fas fa-check'></i> Finish Drawing";
    this._map = map;
    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    finish_draw_button.addEventListener("click", function (event) {
      hideInstructionBox();
      var all_features = draw.getAll();
      if (all_features.features.length > 0) {
        draw.changeMode("simple_select", {
          featureId: all_features.features[0].id,
        });
      }
    });
    this._container.appendChild(finish_draw_button);
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}
map.addControl(new FinishDrawButton(), "top-right");
var map_finish_drawing_button = document.getElementById(
  "map-finish-drawing-button-id"
);
drawControls.appendChild(map_finish_drawing_button);
// Add trash button last and hide it.
var oldChild = drawControls.removeChild(delete_feature_button);
drawControls.appendChild(delete_feature_button);
delete_feature_button.style.display = "none";

function showMapEditButtons() {
  var map_edit_button = document.getElementById("map-edit-button-id");
  map_edit_button.style.display = "block";
  var map_clear_map_button = document.getElementById("map-clear-button-id");
  map_clear_map_button.style.display = "block";
  var finish_draw_button = document.getElementById(
    "map-finish-drawing-button-id"
  );
  finish_draw_button.style.display = "block";
}

function hideMapEditButtons() {
  var map_edit_button = document.getElementById("map-edit-button-id");
  map_edit_button.style.display = "none";
  var map_clear_map_button = document.getElementById("map-clear-button-id");
  map_clear_map_button.style.display = "none";
  var finish_draw_button = document.getElementById(
    "map-finish-drawing-button-id"
  );
  finish_draw_button.style.display = "none";
  var map_delete_vertex_button = document.getElementById(
    "delete-feature-button-id"
  );
  if (map_delete_vertex_button != null) {
    map_delete_vertex_button.style.display = "none";
  }
}

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
  if (draw != null) {
    var all_features = draw.getAll();
    if (all_features.features.length > 0) {
      draw.changeMode("direct_select", {
        featureId: all_features.features[0].id,
      });
    }
  }
}

function hideInstructionBox() {
  var instruction_box = document.getElementById("instruction-box-id");
  instruction_box.style.display = "none";
  if (draw != null) {
    var all_features = draw.getAll();
    // draw.changeMode("simple_select");
    if (all_features.features.length > 0) {
      draw.changeMode("simple_select", {
        featureIds: [all_features.features[0].id],
      });
    }
    // draw.changeMode("simple_select", {
    // featureIds: [all_features.features[0].id]
    // });
  }
}

function showDeleteFeatureButton() {
  var map_delete_feature_button = document.getElementById(
    "delete-feature-button-id"
  );
  if (map_delete_feature_button != null) {
    map_delete_feature_button.style.display = "block";
  }
}

function hideDeleteFeatureButton() {
  var map_delete_feature_button = document.getElementById(
    "delete-feature-button-id"
  );
  if (map_delete_feature_button != null) {
    map_delete_feature_button.style.display = "none";
  }
}

// Add nav control buttons.
map.addControl(new mapboxgl.NavigationControl());

var user_polygon_id = undefined;

// Override Behavior for Draw-Button
document.getElementById("draw-button-id").addEventListener(
  "click",
  function (event) {
    hideInstructionBox();
    draw.deleteAll();
    if (states.includes(state)) {
      map.setFilter(state + "-bg-highlighted", ["in", "GEOID"]);
    }
    draw.changeMode("draw_polygon");
    showMapEditButtons();
  },
  true
);

// override behavior for delete button
document.getElementById("delete-feature-button-id").addEventListener(
  "click",
  function (event) {
    map.setFilter(state + "-bg-highlighted", ["in", "GEOID"]);
    if (draw != null) {
      var all_features = draw.getAll();
      if (all_features.features.length > 0) {
        var polygon = all_features.features[0];
        updateCommunityEntry(event);
        draw.changeMode("direct_select", {
          featureId: polygon.id,
        });
      } else {
        draw.changeMode("simple_select");
      }
    }
  },
  true
);

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

// add a new layer of census block data (transparent layer)
function newCensusLines(state) {
  map.addLayer({
    id: state + "-census-lines",
    type: "line",
    source: state + "bg",
    "source-layer": state + "bg",
    layout: {
      visibility: "visible",
    },
    paint: {
      "line-color": "rgba(0,0,0,0.15)",
      "line-width": 1,
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
      "fill-opacity": 0.5,
    },
    filter: ["in", "GEOID", ""],
  });
}

// [WIP] function to add the neighbor layers for the filter that queries
// included census blocks
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
  title: "Community of Interest Drawing Tutorial",
  text:
    "Now that you are ready to draw out your community of interest, follow the steps to learn about the mapping tool!",
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
  title: "Map Controls",
  text:
    "Use these controls to orient yourself before drawing out your community of interest. You can \
  zoom in, zoom out and/or reset the map bearing to north using these side buttons.",
  attachTo: {
    element: ".mapboxgl-ctrl-zoom-out",
    on: "left",
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
  title: "Draw your community of interest",
  text: "Begin drawing your community of interest by clicking on this button.",
  attachTo: {
    element: "#draw-button-id",
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
        // show the other control buttons for the tutorial
        document.getElementById("draw-button-id").click();
        return this.next();
      },
      text: "Next",
    },
  ],
});

myTour.addStep({
  title: "Delete Community",
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
  title: "Edit Polygon",
  text:
    "Add points to your community for those fine adjustments by clicking this button and then \
  dragging the points to tweak your community to your liking.",
  attachTo: {
    element: "#map-edit-button-id",
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
  your community of interest click here and move on to the last part of the form!`,
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

  // this is where the census blocks are loaded, from a url to the mbtiles file uploaded to mapbox
  for (let bg in BG_KEYS) {
    newSourceLayer(bg, BG_KEYS[bg]);
  }

  for (let i = 0; i < states.length; i++) {
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
  if (document.getElementById("id_user_polygon").value !== "") {
    // If page refreshes (or the submission fails), get the polygon
    // from the field and draw it again.
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

/******************************************************************************/

map.on("draw.create", function (event) {
  updateCommunityEntry(event);
});
map.on("draw.delete", function (event) {
  updateCommunityEntry(event);
});
map.on("draw.update", function (event) {
  updateCommunityEntry(event);
});
map.on("draw.changeMode", function (event) {
  updateCommunityEntry(event);
});
map.on("draw.selectionchange", function (event) {
  // The event object contains the featues that were selected.
  var selected_objects = event;
  var selected_points = selected_objects.points;
  var selected_features = selected_objects.features;
  if (selected_points.length > 0) {
    // The user selected a point. Show delete vertex.
    showDeleteFeatureButton();
    showInstructionBox();
  } else {
    hideDeleteFeatureButton();
  }
  updateCommunityEntry(event);
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

/******************************************************************************/

/* Takes the user drawn polygon and queries census blocks that are contained
   within the drawn polygon. appends them to the filter and highlights those
   blocks. Returns an array containing the census block polygons that are
   highlighted */
function highlightBlocks(drawn_polygon) {
  // once the above works, check the global scope of drawn_polygon

  var census_blocks_polygon = drawn_polygon;
  var polygonBoundingBox = turf.bbox(census_blocks_polygon);
  // get the bounds of the polygon to reduce the number of blocks you are querying from
  var southWest = [polygonBoundingBox[0], polygonBoundingBox[1]];
  var northEast = [polygonBoundingBox[2], polygonBoundingBox[3]];
  try {
    var northEastPointPixel = map.project(northEast);
    var southWestPointPixel = map.project(southWest);

    // var final_union = turf.union(turf.bboxPolygon([0, 0, 0, 0]), turf.bboxPolygon([0, 0, 1, 1]));
    var features = map.queryRenderedFeatures(
      [southWestPointPixel, northEastPointPixel],
      { layers: [state + "-census-lines"] }
    );

    var mpoly = [];
    var wkt = new Wkt.Wkt();
    if (features.length >= 1) {
      var total = 0.0;

      var filter = features.reduce(
        function (memo, feature) {
          if (feature.geometry.type == "MultiPolygon") {
            var polyCon;
            // go through all the polygons and check to see if any of the polygons are contained
            // call intersect AND contained
            // following if statements cover corner cases
            // if census blocks are multipolygons, create a polygon using
            if (feature.geometry.coordinates[0][0].length > 2) {
              polyCon = turf.polygon([feature.geometry.coordinates[0][0]]);
            } else {
              polyCon = turf.polygon([feature.geometry.coordinates[0]]);
            }
            if (turf.booleanContains(drawn_polygon, polyCon)) {
              memo.push(feature.properties.GEOID);
              mpoly = addPoly(polyCon.geometry, mpoly, wkt);
            }
          } else {
            if (turf.booleanContains(drawn_polygon, feature.geometry)) {
              memo.push(feature.properties.GEOID);
              polyCon = turf.polygon([feature.geometry.coordinates[0]]);
              mpoly = addPoly(polyCon.geometry, mpoly, wkt);
            }
          }
          return memo;
        },
        ["in", "GEOID"]
      );
      //  sets filter - highlights blocks
      map.setFilter(state + "-bg-highlighted", filter);
    }
  } catch (err) {
    console.log("triangle shaped polygon was changed");
  }

  return mpoly;
}

/******************************************************************************/

/*  Pushes poly in its wkt forms to the polyArray */
function addPoly(poly, polyArray, wkt) {
  // coordinates attribute that shud be converted and pushed
  var poly_json = JSON.stringify(poly);
  var wkt_obj = wkt.read(poly_json);
  var poly_wkt = wkt_obj.write();
  polyArray.push(poly_wkt);
  return polyArray;
}

function updateFormFields(user_polygon_wkt, census_blocks_polygon_array) {
  // Update form fields
  document.getElementById("id_user_polygon").value = user_polygon_wkt;
  document.getElementById(
    "id_census_blocks_polygon_array"
  ).value = census_blocks_polygon_array;
  // "census_blocks_polygon" gets saved in the post() function in django
}

/* Responds to the user's actions and updates the geometry fields and the arrayfield
 in the form. */
function updateCommunityEntry(event) {
  cleanAlerts();
  var wkt = new Wkt.Wkt();
  // get all data from draw
  var data = draw.getAll();
  var data_features = data.features;
  var user_polygon_wkt = "";
  var drawn_polygon = "";
  var census_blocks_polygon_array;

  // Check if the feature has data
  if (data_features && data_features.length > 0) {
    var data_geometry = data.features[0].geometry;
    // .coordinates stores an array in an array. The nested array contains
    // the points.
    var coordinates = data_geometry.coordinates[0];
    var coordinates_length;
    if (coordinates) {
      coordinates_length = coordinates.length;
    } else {
      coordinates_length = 0;
    }
  }

  // Check if the map stores a valid polygon
  if (data_features.length == 0 || coordinates_length < 3) {
    // sets an empty filter - unhighlights everything
    // sets the form fields as empty
    // TODO: update for all states
    if (states.includes(state)) {
      map.setFilter(
        sessionStorage.getItem("state_name") + "-bg-highlighted",
        ["in", "GEOID"]
      );
    }
    triggerMissingPolygonError();
  } else {
    // Update User Polygon with the GeoJson data.
    drawn_polygon = data.features[0];
    // Validate User Polygon Area
    // Check for kinks.
    let kinks = turf.kinks(drawn_polygon);
    if (kinks.features.length != 0) {
      triggerDrawError(
        "polygon-kink-error",
        "Polygon lines should not overlap. Please draw your community again."
      );
      draw.trash();
      return;
    }
    // Calculate area and convert it from square meters into square miles.
    let area = turf.area(data);
    area = turf.convertArea(area, "meters", "miles");
    // coi is not too big
    let halfStateArea = state_areas[state] / 2;
    if (area > halfStateArea) {
      triggerDrawError(
        "map-area-size-error",
        "Polygon area too large. Please draw your community again."
      );
      draw.trash();
      return;
    }
    // Save user polygon.
    var user_polygon_json = JSON.stringify(drawn_polygon["geometry"]);
    wkt_obj = wkt.read(user_polygon_json);
    user_polygon_wkt = wkt_obj.write();
    // save census blocks multipolygon
    if (states.includes(state)) {
      census_blocks_polygon_array = highlightBlocks(drawn_polygon);
    }
    if (census_blocks_polygon_array != undefined) {
      census_blocks_polygon_array = census_blocks_polygon_array.join("|");
    }
    triggerSuccessMessage();
    showMap();
  }
  updateFormFields(user_polygon_wkt, census_blocks_polygon_array);
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
