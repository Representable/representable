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
// set population
var pop = sessionStorage.getItem("pop");
if (pop !== null) $(".comm-pop").html(pop);

// change "Show Examples" to "Hide Examples" on click
// TODO: change this to be updated for languages automatically, rather than manually
function changeText(element) {
  var target_id = element.getAttribute("data-target").replace("#","");
  var targetVis = document.getElementById(target_id).classList.contains("show");
  var txt = element.innerText;
  if (!targetVis) {
    if (txt == "Show Examples") {
      element.innerText = "Hide Examples";
    } else if (txt == "Mostar ejemplos") {
      element.innerText = "Ocultar ejemplos";
    }
  } else {
    if (txt == "Hide Examples") {
      element.innerText = "Show Examples";
    } else if (txt == "Ocultar ejemplos"){
      element.innerText = "Mostar ejemplos";
    }
  }
}

// changes page entry page from the survey start page to the first part of the survey
function startSurvey() {
  $("#entry-survey-start").addClass("d-none");
  $("#survey-qs-p1").removeClass("d-none");
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

/******************************************************************************

Entry Page functions

*******************************************************************************/
function toggleAngle(e) {
  var collapsible = e.parentNode.getElementsByClassName('collapse')[0].id;
  $('#' + collapsible).collapse('toggle');
  if (e.innerHTML.includes("fa-angle-down")) {
    e.innerHTML = e.innerHTML.replace("fa-angle-down", "fa-angle-up");
  } else {
    e.innerHTML = e.innerHTML.replace("fa-angle-up", "fa-angle-down");
  }
}

// Adds the responses given to the survey questions to the dropdown on the map page
function fillSurveyQuestions() {
  $("h6#dropdown-comm-name").text(`${$("#id_entry_name").val()}:`);
  $("#map-economic-interests-resp>p.collapse-in").text($("#id_economic_interests").val());
  $("#map-activities-resp>p.collapse-in").text($("#id_comm_activities").val());
  $("#map-cultural-interests-resp>p.collapse-in").text($("#id_cultural_interests").val());
  $("#map-other-interests-resp>p.collapse-in").text($("#id_other_considerations").val());

  $("h6#modal-comm-name").text(`${$("#id_entry_name").val()}:`);
  $("#mobile-map-economic-interests-resp>p.collapse-in").text($("#id_economic_interests").val());
  $("#mobile-map-activities-resp>p.collapse-in").text($("#id_comm_activities").val());
  $("#mobile-map-cultural-interests-resp>p.collapse-in").text($("#id_cultural_interests").val());
  $("#mobile-map-other-interests-resp>p.collapse-in").text($("#id_other_considerations").val());
}

$('#map-help-menu').on('click', function (event) {
  event.stopPropagation();
});

$('#map-help-menu').on('touchstart', function (event) {
  event.stopPropagation();
});

$('#map-comm-menu').on('click', function (event) {
    event.stopPropagation();
});

$('#map-comm-menu').on('touchstart', function (event) {
  event.stopPropagation();
});

$("#mobile-map-help-btn").on("click", function() {
  $("#map-help-modal").modal();
});

$("#mobile-map-comm-btn").on("click", function() {
  $("#map-comm-modal").modal();
});

$('#map-help-dropdown').on('shown.bs.dropdown hidden.bs.dropdown', function() {
  $("#map-help-btn").toggleClass("opened")
});

$('#map-comm-dropdown').on('shown.bs.dropdown hidden.bs.dropdown', function() {
  $("#map-comm-btn").toggleClass("opened")
});

$('#map-help-modal').on('shown.bs.modal hidden.bs.modal', function() {
  $("#mobile-map-help-btn").toggleClass("opened")
});

$('#map-comm-modal').on('shown.bs.modal hidden.bs.modal', function() {
  $("#mobile-map-comm-btn").toggleClass("opened")
});

function addressToSurveyStart() {
  $("#entry_address").addClass("d-none");
  $("#entry_survey").removeClass("d-none");
}

function surveyStartToAddress() {
  $("#entry_survey").addClass("d-none");
  $("#entry_address").removeClass("d-none");
}

// changes page entry page from the survey start page to the first part of the survey
function startSurvey() {
  $("#entry-survey-start").addClass("d-none");
  $("#survey-qs-p1").removeClass("d-none");
}

function surveyP1ToSurveyStart() {
  $("#survey-qs-p1").addClass("d-none");
  $("#entry-survey-start").removeClass("d-none");
}

function surveyP1ToP2() {
  $("#survey-qs-p1").addClass("d-none");
  $("#survey-qs-p2").removeClass("d-none");
}

function surveyP2ToP1() {
  $("#survey-qs-p2").addClass("d-none");
  $("#survey-qs-p1").removeClass("d-none");
}

function surveyP2ToMap() {
  $("#survey-qs-p2").addClass("d-none");
  $("#entryForm").children(".container-fluid").addClass("d-none");
  $("#entry_map").removeClass("d-none");
  $("#entry-map-modal").modal();
  map.resize();
  fillSurveyQuestions();
}

function mapToSurveyP2() {
  $("#entry_map").addClass("d-none");
  $("#entryForm").children(".container-fluid").removeClass("d-none");
  $("#survey-qs-p2").removeClass("d-none");
}

function mapToPrivacy() {
  $("#entry_map").addClass("d-none");
  $("#entryForm").children(".container-fluid").removeClass("d-none");
  $("#entry_privacy").removeClass("d-none");
  $("#entry_survey").addClass("d-none");
}

function privacyToMap() {
  $("#entry_privacy").addClass("d-none");
  $("#entryForm").children(".container-fluid").addClass("d-none");
  $("#entry_map").removeClass("d-none");
  $("#entry_survey").removeClass("d-none");
  map.resize();
}

function clearFieldsError(fields) {
  for (var i = 0; i < fields.length; i++) {
    fields[i].classList.remove("has_error");
  }
}

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

// Checks each of the non-interest form fields
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

function trim(x) {
  return x.replace(/^\s+|\s+$/gm,'');
}

function addressValidated() {
  var flag = true;
  var name_field = document.getElementById("id_user_name");
  var entryForm = document.getElementById("entryForm");


  var is_address_required = address_required == "True";
  if (is_address_required) {
    entryForm.street.value = trim(entryForm.street.value);
    entryForm.city.value = trim(entryForm.city.value);
    entryForm.state.value = trim(entryForm.state.value);
    entryForm.zipcode.value = trim(entryForm.zipcode.value);

    if (entryForm.street.value == "") {
      entryForm.street.classList.add("has_error");
      flag = false
    }
    if (entryForm.city.value == "") {
      entryForm.city.classList.add("has_error");
      flag = false
    }
    if (entryForm.state.value == "") {
      entryForm.state.classList.add("has_error");
      flag = false
    }

    if (entryForm.zipcode.value == "") {
      entryForm.zipcode.classList.add("has_error");
      flag = false
    }


    if (!flag) {
      document.getElementById("need_address").classList.remove("d-none");
    }
  }

  name_field.value = trim(name_field.value)
  if (name_field.value == "") {
    name_field.classList.add("has_error");
    document.getElementById("need_name").classList.remove("d-none");
    flag = false;
  }

  return flag;
}

$("#entry_address_button").on("click", function(e) {
  e.preventDefault();
  if (addressValidated()) {
     addressToSurveyStart();
     var entryForm = document.getElementById("entryForm");
     clearFieldsError(entryForm.getElementsByClassName("addr-field"));
     document.getElementById("need_name").classList.add("d-none");
     document.getElementById("need_address").classList.add("d-none");
  }
});

function interestsValidated() {
  var flag = true;
  var cultural_interests_field = document.getElementById(
    "id_cultural_interests"
  );
  var economic_interests_field = document.getElementById(
    "id_economic_interests"
  );
  var comm_activities_field = document.getElementById("id_comm_activities");
  var other_considerations_field = document.getElementById(
    "id_other_considerations"
  );

  cultural_interests_field.value = trim(cultural_interests_field.value);
  economic_interests_field.value = trim(economic_interests_field.value);
  comm_activities_field.value = trim(comm_activities_field.value);
  other_considerations_field.value = trim(other_considerations_field.value);

  if (
    cultural_interests_field.value == "" &&
    economic_interests_field.value == "" &&
    comm_activities_field.value == "" &&
    other_considerations_field.value == ""
  ) {
    cultural_interests_field.classList.add("has_error");
    economic_interests_field.classList.add("has_error");
    comm_activities_field.classList.add("has_error");
    other_considerations_field.classList.add("has_error");
    var interests_alert = document.getElementById("need_one_interest");
    interests_alert.classList.remove("d-none");
    flag = false;
  }

  return flag
}

$("#surveyP1ToP2_button").on("click", function(e) {
  e.preventDefault();
  if (interestsValidated()) {
    surveyP1ToP2();
    clearFieldsError(document.getElementById("entryForm").getElementsByClassName("survey-field"));
    document.getElementById("need_one_interest").classList.add("d-none");
  }
});

function commNameValidated() {
  var commName = document.getElementById("id_entry_name");
  commName.value = trim(commName.value);
  if (commName.value == "") {
    commName.classList.add("has_error");
    document.getElementById("need_comm_name").classList.remove("d-none");
    return false;
  }
  return true;
}

$("#surveyP2ToMap_button").on("click", function(e) {
  e.preventDefault();
  if (commNameValidated()) {
    surveyP2ToMap();
    document.getElementById("id_entry_name").classList.remove("has_error");
    document.getElementById("need_comm_name").classList.add("d-none");
  }
})

$("#mapToPrivacy").on("click", function(e) {
  e.preventDefault();
  mapToPrivacy();
})

$("#mapToPrivacyMobile").on("click", function(e) {
  e.preventDefault();
  mapToPrivacy();
})

function privacyCheckValidation() {
  if (document.getElementById("toc_check").checked === true || document.getElementById("toc_check_xl").checked === true) {
    return true;
  } else {
    document.getElementById("need_privacy").classList.remove("d-none");
  }
  return false;
}
// function formValidation() {
//   // Check Normal Fields
//   var flag = true;
//   var entryForm = document.getElementById("entryForm");
//   var form_elements = entryForm.elements;
//   for (var i = 0; i < form_elements.length; i++) {
//     if (form_elements[i].required) {
//       if (checkFieldById(form_elements[i].id) == false) {
//         flag = false;
//       }
//     }
//   }

//   var cultural_interests_field = document.getElementById(
//     "id_cultural_interests"
//   );
//   var economic_intetersts_field = document.getElementById(
//     "id_economic_interests"
//   );
//   var comm_activities_field = document.getElementById("id_comm_activities");
//   var other_considerations_field = document.getElementById(
//     "id_other_considerations"
//   );

//   if (
//     cultural_interests_field.value == "" &&
//     economic_intetersts_field.value == "" &&
//     comm_activities_field.value == "" &&
//     other_considerations_field.value == ""
//   ) {
//     cultural_interests_field.classList.add("has_error");
//     economic_intetersts_field.classList.add("has_error");
//     comm_activities_field.classList.add("has_error");
//     other_considerations_field.classList.add("has_error");
//     var interests_alert = document.getElementById("need_one_interest");
//     interests_alert.classList.remove("d-none");
//     flag = false;
//   }
//   var is_address_required = address_required == "True";
//   if (
//     is_address_required &&
//     (entryForm.street.value == "" ||
//       entryForm.city.value == "" ||
//       entryForm.state.value == "" ||
//       entryForm.zipcode.value == "")
//   ) {
//     entryForm.street.classList.add("has_error");
//     entryForm.city.classList.add("has_error");
//     entryForm.state.classList.add("has_error");
//     entryForm.zipcode.classList.add("has_error");
//     document.getElementById("need_address").classList.remove("d-none");
//     flag = false;
//   }

//   if (flag == false) {
//     // Add alert.
//     var alert = document.getElementById("form_error");
//     alert.classList.remove("d-none");
//     scrollIntoViewSmooth(alert.id);
//   }
//   return flag;
// }

/****************************************************************************/
// generates polygon to be saved from the selection
function createCommPolygon() {
  // start by checking size -- 800 is an arbitrary number
  // it means a community with a population between 480,000 & 2,400,000
  var polyFilter = JSON.parse(sessionStorage.getItem("bgFilter"));

  if (polyFilter === null) {
    triggerMissingPolygonError();
    return false;
  }
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
  triggerSuccessMessage();
  updateFormFields(poly_wkt);

  // clean up polyFilter -- this is the array of GEOID to be stored
  polyFilter.splice(0, 1);
  polyFilter.splice(0, 1);
  document.getElementById("id_block_groups").value = polyFilter;
  // load in the Population
  var pop = sessionStorage.getItem("pop");
  document.getElementById("id_population").value = pop;
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
    $("#entrySubmissionButton").on("click", function (e) {
      e.preventDefault();
      var form = $("#entryForm");
      zoomToCommunity();
      // delay so that zoom can occur
      var polySuccess = true,
        formSuccess = true;
      // loading icon
      $("#loading-entry").css("display", "block");
      $("#loading-entry").delay(2000).fadeOut(2000);
      //todo: switch this to a promise ?
      setTimeout(function () {
        polySuccess = createCommPolygon();
        privacySuccess = privacyCheckValidation();
      }, 500);
      setTimeout(function () {
        if (polySuccess && privacySuccess) {
          sessionStorage.clear();
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

function geocoderRender(item) {
  return '<div class="mapboxgl-ctrl-geocoder mapboxgl-ctrl"><span class="geocoder-icon geocoder-icon-search"></span><input type="text" placeholder="Search Location"><ul class="suggestions" style="display: none;"></ul><div class="geocoder-pin-right"><button class="geocoder-icon geocoder-icon-close" aria-label="Clear"></button><span class="geocoder-icon geocoder-icon-loading"></span></div></div>'
}

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

map.on('load', function() {
  map.resize();
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

var modalGeocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  country: "us",
  mapboxgl: mapboxgl,
});

document.getElementById("geocoder").appendChild(geocoder.onAdd(map));
document.getElementById("modal-geocoder").appendChild(modalGeocoder.onAdd(map));

modalGeocoder.on('result', function () {
  $('#entry-map-modal').modal('hide');
})

/* Creating custom draw buttons */
class DropdownButton {
  onAdd(map) {
    var dropdown_control = document.createElement("button");
    dropdown_control.href = "#";
    dropdown_control.type = "button";
    dropdown_control.backgroundImg = "";

    dropdown_control.classList.add("active");
    dropdown_control.id = "map-dropdown-id";
    dropdown_control.style.display = "block";
    dropdown_control.innerHTML = '<i class="fas fa-cog"></i>'; //&emsp;<i class="fas fa-caret-down"></i>

    this._map = map;
    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group draw-group";
    this._container.id = "draw-group-container";
    this._container.appendChild(dropdown_control);
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}
map.addControl(new DropdownButton(), "top-right");
var drawControls = document.getElementById("draw-group-container");

class SelectRadiusButton {
  onAdd(map) {
    var radius_control = document.createElement("button");
    radius_control.href = "#";
    radius_control.type = "button";
    radius_control.backgroundImg = "";

    radius_control.classList.add("active");
    radius_control.id = "map-radius-control-id";
    radius_control.style.display = "none";
    radius_control.innerHTML =
      '<form><label for="radius-control" class="sr-only">Choose a selection size: </label><input type="range" min="0" max="50" value="0" class="custom-range" id="radius-control"><p style="margin: 0;">Selection Tool Size</p></form>';
    this._map = map;
    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group draw-group";
    this._container.appendChild(radius_control);
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

map.addControl(new SelectRadiusButton(), "top-right");
var radiusSelect = document.getElementById("map-radius-control-id");
drawControls.append(radiusSelect);

var slider = document.getElementById("radius-control");
var style = document.querySelector('[data="slider-data"]');
slider.oninput = function () {
  var size = this.value;
  drawRadius = parseInt(size);
  style.innerHTML =
    "input[type=range]::-webkit-slider-thumb { width: " +
    (size / 7 + 14) +
    "px !important; height: " +
    (size / 7 + 14) +
    "px !important; margin-top: " +
    (-3 - size / 16.67) +
    "px !important; }";
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
    draw_button.style.display = "none";
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
    eraser_button.style.display = "none";
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
    undo_button.style.display = "none";
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
    clear_button.style.display = "none";
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
        $(".comm-pop").html(0);
        map.setFilter(state + "-bg-highlighted", ["in", "GEOID"]);
        var undoBbox = sessionStorage.getItem("selectBbox");
        filterStack.push(undoFilter);
        bboxStack.push(undoBbox);
        sessionStorage.setItem("pop", "0");
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

// show more controls after clicking on dropdown
var dropdownButton = document.getElementById("map-dropdown-id");
var basicMode = true;
dropdownButton.addEventListener("click", function (e) {
  if (mapClearButton.style.display === "none") {
    dropdownButton.innerHTML =
      '<i class="fas fa-cog"></i> Settings <i class="fas fa-caret-up"></i>';
    basicMode = false;
  } else {
    dropdownButton.innerHTML = '<i class="fas fa-cog">';
    if (drawRadius === 0) basicMode = true;
  }
  var children = drawControls.children;
  for (let elem of children) {
    if (elem.id !== "map-dropdown-id") {
      elem.style.display === "block"
        ? (elem.style.display = "none")
        : (elem.style.display = "block");
    }
  }
});

/****************************************************************************/

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

// Only add zoom buttons to medium and large screen devices (non-mobile)
if (!window.matchMedia("only screen and (max-width: 760px)").matches) {
  map.addControl(new mapboxgl.NavigationControl()); // plus minus top right corner
}

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
      "line-color": "rgba(0,0,0,0.6)",
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
var drawRadius = 0;
var isStateChanged = false;
/* After the map style has loaded on the page, add a source layer and default
styling for a single point. */
map.on("style.load", function () {
  var layers = map.getStyle().layers;
  // Find the index of the first symbol layer in the map style
  // this is so that added layers go under the symbols on the map
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
  map.setLayoutProperty(state + "-census-lines", "visibility", "visible");
  // check if someone has entered in a new state in the same session
  var prev_state = sessionStorage.getItem("prev_state");
  if (prev_state !== null && state !== prev_state) {
    isStateChanged = true;
    sessionStorage.setItem("selectBbox", "[]");
    sessionStorage.setItem("bgFilter", "[]");
  }
  sessionStorage.setItem("prev_state", state);

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
    // if no features are found - probably selected an invalid area (outside state) or some other error occurred
    if (queryFeatures.length == 0) return;
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
    var isBasicErase = basicMode && currentFilter.includes(features[0]);
    // todo: bug where you can select non-contiguous areas on basicMode
    if ((eraseMode && !basicMode) || isBasicErase) {
      currentFilter.forEach(function (feature) {
        if (!features.includes(feature)) filter.push(feature);
      });
      arraysEqual(filter, currentFilter)
        ? (isChanged = false)
        : (isChanged = true);
      if (isChanged) {
        if (isEmptyFilter(filter)) {
          sessionStorage.setItem("selectBbox", "[]");
        }
        if (selectBbox === null) selectBbox = [];
        else selectBbox = turf.difference(selectBbox, currentBbox);
      }
    } else {
      // check if previous selectBbox overlaps with current selectBbox
      if (selectBbox === null || selectBbox.length === 0) {
        isChanged = true;
        selectBbox = currentBbox;
        hideWarningMessage();
      } else {
        if (
          turf.booleanDisjoint(currentBbox, selectBbox) &&
          !isEmptyFilter(currentFilter)
        ) {
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
        if (feature !== "in" && feature !== "GEOID" && feature !== "" && !filter.includes(feature)) {
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
    // set as indicator that population is loading
    $(".comm-pop").html("...");
    // remove "in" and "GEOID" parts of filter, for population
    getCommPop(cleanFilter(filter));
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
    if (selectBbox.length !== 0 && !isStateChanged) {
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
    "id_census_blocks_polygon"
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

/***************************************************************************/

var bgPopCache = {};
// get the population for a community from filter
// TODO: load this in automatically as part of the tilesets for immediate lookup?
function getCommPop(filter) {
  if (filter.length === 0) $(".comm-pop").html(0);
  var pop = 0;
  var ctr = 0;
  filter.forEach(function(feature){
    if (feature in bgPopCache) {
      ctr++;
      pop += bgPopCache[feature];
      if (ctr === filter.length) {
        $(".comm-pop").html(pop);
        sessionStorage.setItem("pop", pop);
      }
    } else {
      getBGPop(feature, function(bgPop) {
        ctr++;
        pop += parseInt(bgPop);
        bgPopCache[feature] = parseInt(bgPop);
        if (ctr === filter.length) {
          $(".comm-pop").html(pop);
          sessionStorage.setItem("pop", pop);
        }
      })
    }
  });
}

// query the ACS api in order to get blockgroup population data!
// geoid chars 0-2:state, 2-5:county, 5-11:tract, 12:block group
function getBGPop(geoid, callback) {
  var req = new XMLHttpRequest();
  req.open('GET', 'https://api.census.gov/data/2018/acs/acs5?get=B01003_001E&for=block%20group:' + geoid.substring(11) + '&in=state:' + geoid.substring(0,2) + '%20county:' + geoid.substring(2, 5) + '%20tract:' + geoid.substring(5, 11) + '&key=' + census_key, true);
  req.onreadystatechange = function(){
    if (req.readyState == 4 && req.status == 200) {
      var data = JSON.parse(req.response);
      callback(data[1][0]);
    }
  }
  req.send();
}

function cleanFilter(filter) {
  var cleanFilter = filter.slice();
  cleanFilter.splice(0, 2);
  return cleanFilter;
}
