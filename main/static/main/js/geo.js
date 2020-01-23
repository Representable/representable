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
var ideal_population_LOWER = {
  nj: 109899,
  va: 80010,
  pa: 62573,
  mi: 89851,
};

var ideal_population_UPPER = {
  nj: 219797,
  va: 200026,
  pa: 254048,
  mi: 260096,
};

var ideal_population_CONG = {
  nj: 710767,
  va: 710767,
  pa: 710767,
  mi: 710767,
};
var CENSUS_KEYS = {
  "ak-census": "40xiqgvl",
  "al-census": "5wnfuadx",
  "ar-census": "cfn0gxes",
  "az-census": "d1hc4dk1",
  "ca-census": "dgvz11d5",
  "co-census": "10cpzey1",
  "ct-census": "acwqf5pz",
  "dc-census": "da466hfz",
  "de-census": "1bx4au31",
  "fl-census": "7hpatmow",
  "ga-census": "5lx08ma9",
  "hi-census": "82epj1e0",
  "ia-census": "4jkzgaf9",
  "id-census": "6s8r1pl0",
  "il-census": "awf7y438",
  "in-census": "1fn3qhnn",
  "ks-census": "ad6ys13i",
  "ky-census": "0q4sl8dv",
  "la-census": "7zyid6d0",
  "ma-census": "1bvt0bee",
  "md-census": "1zwr1qu7",
  "me-census": "cyabkjlh",
  "mi-census": "5elaw49i",
  "mn-census": "561za3yv",
  "mo-census": "56j9wugl",
  "ms-census": "33ictlz4",
  "mt-census": "1qescrvy",
  "nc-census": "2i44h0gn",
  "nd-census": "2jj6oy57",
  "ne-census": "4hcty1f0",
  "nh-census": "8q2e3yu3",
  "nj-census": "0yrce8nw",
  "nm-census": "164i2lmn",
  "nv-census": "42p3cqhj",
  "ny-census": "3i3eca1x",
  "oh-census": "18ik8ger",
  "ok-census": "34ou4tm9",
  "or-census": "66y60ac5",
  "pa-census": "4oz1cx84",
  "ri-census": "6p13pxdt",
  "sc-census": "a7ddwoo9",
  "sd-census": "aztmscpz",
  "tn-census": "8io3xzps",
  "tx-census": "773he449",
  "ut-census": "2tq7r5as",
  "va-census": "58tbtkkj",
  "vt-census": "914alme3",
  "wa-census": "4a9umfkl",
  "wi-census": "52mhmiw7",
  "wv-census": "82nll1sy",
  "wy-census": "9uwm30og",
};
var states = [
  "ak",
  "al",
  "ar",
  "az",
  "ca",
  "co",
  "ct",
  "dc",
  "de",
  "fl",
  "ga",
  "hi",
  "ia",
  "id",
  "il",
  "in",
  "ks",
  "ky",
  "la",
  "ma",
  "md",
  "me",
  "mi",
  "mn",
  "mo",
  "ms",
  "mt",
  "nc",
  "nd",
  "nh",
  "nj",
  "nm",
  "nv",
  "ny",
  "oh",
  "ok",
  "or",
  "pa",
  "ri",
  "sc",
  "sd",
  "tn",
  "tx",
  "ut",
  "va",
  "vt",
  "wa",
  "wi",
  "wv",
  "wy",
];

var wkt_obj;
// Formset field object saves a deep copy of the original formset field object.
// (If user deletes all fields, he can add one more according to this one).
var formsetFieldObject;
var state;
$(document).ready(function() {
  console.log(sessionStorage.getItem("stateName"));
  // console.log(state);
  console.log(sessionStorage.getItem("allChecks"));
  if (sessionStorage.getItem("allChecks") == "pass") {
    $("#zipcodeModal").modal("show");
  }
});

function getState(zipcode) {
  // Ensure param is a string to prevent unpredictable parsing results
  if (typeof zipcode !== "string") {
    console.log("Must pass the zipcode as a string.");
    return;
  }

  // Ensure we have exactly 5 characters to parse
  if (zipcode.length !== 5) {
    console.log("Must pass a 5-digit zipcode.");
    return;
  }
  // after error handling, it shud always be 5 digits:
  zipcode = zipcode.substring(0, 4);
  zipcode += "0";
  // console.log(zipcode)
  // Ensure we don't parse strings starting with 0 as octal values
  const thiszip = parseInt(zipcode, 10);

  // Code blocks alphabetized by state
  if (thiszip >= 35000 && thiszip <= 36999) {
    state = "al";
  } else if (thiszip >= 99500 && thiszip <= 99999) {
    state = "ak";
  } else if (thiszip >= 85000 && thiszip <= 86999) {
    state = "az";
  } else if (thiszip >= 71600 && thiszip <= 72999) {
    state = "ar";
  } else if (thiszip >= 90000 && thiszip <= 96699) {
    state = "ca";
  } else if (thiszip >= 80000 && thiszip <= 81999) {
    state = "co";
  } else if (thiszip >= 6000 && thiszip <= 6999) {
    state = "ct";
  } else if (thiszip >= 19700 && thiszip <= 19999) {
    state = "de";
  } else if (thiszip >= 32000 && thiszip <= 34999) {
    state = "fl";
  } else if (thiszip >= 30000 && thiszip <= 31999) {
    state = "ga";
  } else if (thiszip >= 96700 && thiszip <= 96999) {
    state = "hi";
  } else if (thiszip >= 83200 && thiszip <= 83999) {
    state = "ID";
  } else if (thiszip >= 60000 && thiszip <= 62999) {
    state = "il";
  } else if (thiszip >= 46000 && thiszip <= 47999) {
    state = "in";
  } else if (thiszip >= 50000 && thiszip <= 52999) {
    state = "ia";
  } else if (thiszip >= 66000 && thiszip <= 67999) {
    state = "ks";
  } else if (thiszip >= 40000 && thiszip <= 42999) {
    state = "ky";
  } else if (thiszip >= 70000 && thiszip <= 71599) {
    state = "la";
  } else if (thiszip >= 3900 && thiszip <= 4999) {
    state = "me";
  } else if (thiszip >= 20600 && thiszip <= 21999) {
    state = "md";
  } else if (thiszip >= 1000 && thiszip <= 2799) {
    state = "ma";
  } else if (thiszip >= 48000 && thiszip <= 49999) {
    state = "mi";
  } else if (thiszip >= 55000 && thiszip <= 56999) {
    state = "mn";
  } else if (thiszip >= 38600 && thiszip <= 39999) {
    state = "ms";
  } else if (thiszip >= 63000 && thiszip <= 65999) {
    state = "mo";
  } else if (thiszip >= 59000 && thiszip <= 59999) {
    state = "mt";
  } else if (thiszip >= 27000 && thiszip <= 28999) {
    state = "nc";
  } else if (thiszip >= 58000 && thiszip <= 58999) {
    state = "nd";
  } else if (thiszip >= 68000 && thiszip <= 69999) {
    state = "ne";
  } else if (thiszip >= 88900 && thiszip <= 89999) {
    state = "nv";
  } else if (thiszip >= 3000 && thiszip <= 3899) {
    state = "nh";
  } else if (thiszip >= 7000 && thiszip <= 8999) {
    state = "nj";
  } else if (thiszip >= 87000 && thiszip <= 88499) {
    state = "nm";
  } else if (thiszip >= 10000 && thiszip <= 14999) {
    state = "ny";
  } else if (thiszip >= 43000 && thiszip <= 45999) {
    state = "oh";
  } else if (thiszip >= 73000 && thiszip <= 74999) {
    state = "ok";
  } else if (thiszip >= 97000 && thiszip <= 97999) {
    state = "or";
  } else if (thiszip >= 15000 && thiszip <= 19699) {
    state = "pa";
  } else if (thiszip >= 300 && thiszip <= 999) {
    state = "pr";
  } else if (thiszip >= 2800 && thiszip <= 2999) {
    state = "ri";
  } else if (thiszip >= 29000 && thiszip <= 29999) {
    state = "sc";
  } else if (thiszip >= 57000 && thiszip <= 57999) {
    state = "sd";
  } else if (thiszip >= 37000 && thiszip <= 38599) {
    state = "tn";
  } else if (
    (thiszip >= 75000 && thiszip <= 79999) ||
    (thiszip >= 88500 && thiszip <= 88599)
  ) {
    state = "tx";
  } else if (thiszip >= 84000 && thiszip <= 84999) {
    state = "ut";
  } else if (thiszip >= 5000 && thiszip <= 5999) {
    state = "vt";
  } else if (thiszip >= 22000 && thiszip <= 24699) {
    state = "va";
  } else if (thiszip >= 20000 && thiszip <= 20599) {
    state = "dc";
  } else if (thiszip >= 98000 && thiszip <= 99499) {
    state = "wa";
  } else if (thiszip >= 24700 && thiszip <= 26999) {
    state = "wv";
  } else if (thiszip >= 53000 && thiszip <= 54999) {
    state = "wi";
  } else if (thiszip >= 82000 && thiszip <= 83199) {
    state = "wy";
  } else {
    state = "none";
  }
  sessionStorage.setItem("stateName", state);
  console.log(sessionStorage.getItem("stateName"));
}

function modalZip(e) {
  e.preventDefault();

  var isnum = /^\d+$/.test($("#zipcode").val());
  if (isnum) {
    console.log("yuh");
    // Parse only first 4 digits of zipcode.
    zipcode = $("#zipcode").val();
    zipcode = zipcode.substring(0, 4);
    zipcode += "0";
    // console.log(zipcode)
    $("#zipcodeModal").modal("hide");
    // user puts in a zipcode and the map zooms to that loc
    let geoObj = geocoder.query(zipcode, function(err, res) {
      console.log(err, res);
    });
    console.log(geoObj);
    let st = getState($("#zipcode").val());
  } else {
    // write out the error here:
  }
}

$("#zipcodeModal").keypress(function(e) {
  if (e.keyCode === 10 || e.keyCode === 13) {
    modalZip(e);
  }
});
$("#zipSubmit").click(function(e) {
  modalZip(e);
});

//builds proper format of location string based on mapbox data. city,state/province,country
function parseReverseGeo(geoData) {
  // debugger;
  var region, countryName, placeName, returnStr;
  if (geoData.context) {
    $.each(geoData.context, function(i, v) {
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
// Make buttons show the right skin.
document.addEventListener(
  "DOMContentLoaded",
  function() {
    var conditionRow = $(".form-row:not(:last)");
    conditionRow
      .find(".btn.add-form-row")
      .removeClass("btn-outline-success")
      .addClass("btn-outline-danger")
      .removeClass("add-form-row")
      .addClass("remove-form-row")
      .html('<span class="" aria-hidden="true">Remove</span>');
  },
  false
);

/******************************************************************************/

// Initialize the Map
/* eslint-disable */
var map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/mapbox/streets-v11", //hosted style id
  center: [-74.65545, 40.341701], // starting position - Princeton, NJ :)
  zoom: 9, // starting zoom
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
        "line-color": "#60a3bc",
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
        "line-color": "#60a3bc",
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
        "circle-color": "#3c6382",
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
        "circle-color": "#3c6382",
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
        "circle-color": "#3c6382",
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
        "circle-color": "#3c6382",
      },
    },
    {
      id: "gl-draw-polygon-midpoint",
      type: "circle",
      filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
      paint: {
        "circle-radius": 5,
        "circle-color": "#3c6382",
      },
    },
  ],
});

map.addControl(geocoder, "top-right");
// Add controls outside of map.
// Source: https://github.com/mapbox/mapbox-gl-draw/blob/master/docs/API.md
map.addControl(draw);
// Insert class into draw buttons so we can differentiate their styling from
// from the nav buttons below.
drawControls = document.querySelector(".draw_polygon_map .mapboxgl-ctrl-group");
drawControls.classList.add("draw-group");

// Add nav control buttons.
map.addControl(new mapboxgl.NavigationControl());

/* Change mapbox draw button */
var drawButton = document.getElementsByClassName("mapbox-gl-draw_polygon");
drawButton[0].backgroundImg = "";
drawButton[0].id = "draw-button";
drawButton[0].innerHTML = "<i class='fas fa-draw-polygon'></i> Draw Polygon";
var trashButton = document.getElementsByClassName("mapbox-gl-draw_trash");
trashButton[0].backgroundImg = "";
trashButton[0].id = "trash-button";
trashButton[0].innerHTML = "<i class='fas fa-trash-alt'></i> Delete Polygon";

// add button for toggling census Blocks
class CensusBlocksControl {
    onAdd(map) {
        var blocksLink = document.createElement('button');
        blocksLink.href = '#';
        blocksLink.className = 'active';
        blocksLink.textContent = 'Toggle Census Blocks';
        blocksLink.style.width = '135px';
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
        // this._container.textContent = 'Toggle Census Blocks';
        blocksLink.onclick = function(e) {
          for (let i = 0; i < states.length; i++) {

            var clickedLayer = states[i] + "-census-lines";
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
          }
        };
        this._container.appendChild(blocksLink);
        return this._container;
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}
map.addControl(new CensusBlocksControl(), 'top-left');

// Override Behavior for Draw-Button
document.getElementById("draw-button").addEventListener("click", function(e) {
  cleanAlerts();
  draw.deleteAll();
  // TODO: change for all states
  map.setFilter(sessionStorage.getItem("stateName") + "-blocks-highlighted", [
    "in",
    "GEOID10",
  ]);
  draw.changeMode("draw_polygon");
});

document.getElementById("trash-button").addEventListener("click", function(e) {
  cleanAlerts();
  draw.deleteAll();
  // TODO: change for all states
  map.setFilter(sessionStorage.getItem("stateName") + "-blocks-highlighted", [
    "in",
    "GEOID10",
  ]);
  draw.changeMode("simple_select");
});

// add a new source layer
function newSourceLayer(name, mbCode) {
  map.addSource(name, {
    type: "vector",
    url: "mapbox://districter-team." + mbCode,
  });
}
// add a new layer of census block data
function newCensusLines(state) {
  map.addLayer({
    id: state + "-census-lines",
    type: "line",
    source: state + "-census",
    "source-layer": state + "census",
    layout: {
      visibility: "visible",
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "rgba(71, 93, 204, 0.5)",
      "line-width": 1,
    },
  });
}
function newHighlightLayer(state) {
  map.addLayer({
    id: state + "-blocks-highlighted",
    type: "fill",
    source: state + "-census",
    "source-layer": state + "census",
    paint: {
      "fill-outline-color": "#1e3799",
      "fill-color": "#4a69bd",
      "fill-opacity": 0.7,
    },
    filter: ["in", "BLOCKID10", ""],
  });
}

/******************************************************************************/

/* After the map style has loaded on the page, add a source layer and default
   styling for a single point. */
map.on("style.load", function() {
  map.addSource("single-point", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [],
    },
  });

  // this is where the census blocks are loaded, from a url to the mbtiles file uploaded to mapbox
  for (let census in CENSUS_KEYS) {
    newSourceLayer(census, CENSUS_KEYS[census]);
  }

  for (let i = 0; i < states.length; i++) {
    newCensusLines(states[i]);
    newHighlightLayer(states[i]);
  }

  // Point centered at geocoded location
  map.addLayer({
    id: "point",
    source: "single-point",
    type: "circle",
    paint: {
      "circle-radius": 10,
      "circle-color": "#007cbf",
    },
  });

  // Listen for the `geocoder.input` event that is triggered when a user
  // makes a selection and add a symbol that matches the result.
  geocoder.on("result", function(ev) {
    map.getSource("single-point").setData(ev.result.geometry);
    var styleSpec = ev.result;
    var styleSpecBox = document.getElementById("json-response");
    var styleSpecText = JSON.stringify(styleSpec, null, 2);
    // var syntaxStyleSpecText = syntaxHighlight(styleSpecText);
    // styleSpecBox.innerHTML = syntaxStyleSpecText;
  });
});

var wasLoaded = false;
map.on("render", function() {
  if (!map.loaded() || wasLoaded) return;
  wasLoaded = true;
  if (document.getElementById("id_user_polygon").value !== "") {
    // If page refreshes (or the submission fails), get the polygon
    // from the field and draw it again.
    var feature = document.getElementById("id_user_polygon").value;
    var wkt = new Wkt.Wkt();
    wkt_obj = wkt.read(feature);
    var geoJsonFeature = wkt_obj.toJson();
    var featureIds = draw.add(geoJsonFeature);
    console.log("Refresh");
    updateCommunityEntry();
  }
});

/******************************************************************************/

map.on("draw.create", function() {
  console.log("Draw create");
  updateCommunityEntry();
});
map.on("draw.delete", function() {
  console.log("Draw delete");
  updateCommunityEntry();
});
map.on("draw.update", function() {
  console.log("Draw update");
  updateCommunityEntry();
});
map.on("draw.changeMode", function() {
  console.log("Draw CM");
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

function triggerDrawError(id, stringErrorText) {
  /*
        triggerDrawError creates a bootstrap alert placed on top of the map.
    */
  console.log("triggerDrawError() called");
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
    '" class="alert alert-warning alert-dismissible fade show map-alert" role="alert">\
                              ' +
    stringErrorText +
    '\
                                  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\
                                        <span aria-hidden="true">&times;</span>\
                                  </button>\
                          </div>';
  document.getElementById("map-error-alerts").appendChild(newAlert);
}

/******************************************************************************/

function triggerSuccessMessage() {
  /*
        triggerSuccessMessage lets the user know that they created a succesful
        polygon.
    */
  console.log("triggerSuccessMessage() called");
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
}

/******************************************************************************/

/* Takes the user drawn polygon and queries census blocks that are contained
   within the drawn polygon. appends them to the filter and highlights those
   blocks. Returns an array containing the census block polygons that are
   highlighted */
function highlightBlocks(drawn_polygon) {
  console.log("called highlight blocks");
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
    // TODO: update layer names for all states (will this work?)
    var features = map.queryRenderedFeatures(
      [southWestPointPixel, northEastPointPixel],
      { layers: [sessionStorage.getItem("stateName") + "-census-lines"] }
    );
    // for (let j = 0 j < states.length(); j++) {

    // }
    var mpoly = [];
    var wkt = new Wkt.Wkt();
    if (features.length >= 1) {
      var total = 0.0;

      var filter = features.reduce(
        function(memo, feature) {
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
              memo.push(feature.properties.BLOCKID10);
              mpoly = addPoly(polyCon.geometry, mpoly, wkt);
              total += feature.properties.POP10;
            }
          } else {
            if (turf.booleanContains(drawn_polygon, feature.geometry)) {
              memo.push(feature.properties.BLOCKID10);
              polyCon = turf.polygon([feature.geometry.coordinates[0]]);
              mpoly = addPoly(polyCon.geometry, mpoly, wkt);
              total += feature.properties.POP10;
            }
          }
          return memo;
        },
        ["in", "BLOCKID10"]
      );
      //  sets filter - highlights blocks
      // TODO: update for all states
      map.setFilter(
        sessionStorage.getItem("stateName") + "-blocks-highlighted",
        filter
      );

      // show population stats for NJ only:
      // 1. LOWER LEGISLATION PROGRESS BAR __________________________________
      // TODO: update these parts to determine which state we are focusing on
      progressL = document.getElementById("pop");
      progressL.style.background = "orange";
      progressL.innerHTML =
        Math.round((total / (ideal_population_LOWER["nj"] * 1.5)) * 100) + "%";
      progressL.setAttribute("aria-valuenow", "total");
      progressL.setAttribute("aria-valuemax", ideal_population_LOWER["nj"]);
      popWidth = (total / (ideal_population_LOWER["nj"] * 1.5)) * 100;
      progressL.style.width = popWidth + "%";

      // 2. UPPER LEGISLATION PROGRESS BAR __________________________________
      progressU = document.getElementById("popU");
      progressU.style.background = "orange";
      progressU.innerHTML =
        Math.round((total / (ideal_population_UPPER["nj"] * 1.5)) * 100) + "%";
      progressU.setAttribute("aria-valuenow", "total");
      progressU.setAttribute("aria-valuemax", ideal_population_UPPER["nj"]);
      popWidth = (total / (ideal_population_UPPER["nj"] * 1.5)) * 100;
      progressU.style.width = popWidth + "%";

      // 3. CONGRESSIONAL DISTRICT PROGRESS BAR __________________________________
      progressC = document.getElementById("popC");
      progressC.style.background = "orange";
      progressC.innerHTML =
        Math.round((total / (ideal_population_CONG["nj"] * 1.5)) * 100) + "%";
      progressC.setAttribute("aria-valuenow", "total");
      progressC.setAttribute("aria-valuemax", ideal_population_CONG["nj"]);
      popWidth = (total / (ideal_population_CONG["nj"] * 1.5)) * 100;
      progressC.style.width = popWidth + "%";
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
  // console.log(poly_json);
  var wkt_obj = wkt.read(poly_json);
  // console.log(wkt_obj);
  var poly_wkt = wkt_obj.write();
  polyArray.push(poly_wkt);
  return polyArray;
}

/* Responds to the user's actions and updates the geometry fields and the arrayfield
 in the form. */
function updateCommunityEntry(e) {
  console.log("updateCommunity entry called");

  var wkt = new Wkt.Wkt();
  var data = draw.getAll();
  var user_polygon_wkt;
  var census_blocks_polygon_wkt;
  var drawn_polygon;
  if (data.features.length > 0) {
    // Update User Polygon with the GeoJson data.
    drawn_polygon = data.features[0];
    // Validate User Polygon Area
    // Check for kinks.
    let kinks = turf.kinks(drawn_polygon);
    if (kinks.features.length != 0) {
      // console.log("Polygon contains kinks. Please redraw.")
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

    // TODO: Need to make sure map does not cross state boundaries??? Maybe this is fine for communities...
    // Use NJ State Area * 1/2 TODO: need to generalize?
    let halfStateArea = 4350; // TODO use dictionary lookup based on zipcode
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
    census_blocks_polygon_array = highlightBlocks(drawn_polygon);
    if (census_blocks_polygon_array != undefined) {
      census_blocks_polygon_array = census_blocks_polygon_array.join("|");
    }
  } else {
    // sets an empty filter - unhighlights everything
    // sets the form fields as empty
    user_polygon_wkt = "";
    census_blocks_polygon_wkt = "";
    census_blocks_multipolygon_wkt = "";
    // TODO: update for all states
    map.setFilter(sessionStorage.getItem("stateName") + "-blocks-highlighted", [
      "in",
      "GEOID10",
    ]);
  }
  // Update form fields
  census_blocks_polygon_wkt = "";
  document.getElementById("id_user_polygon").value = user_polygon_wkt;
  document.getElementById(
    "id_census_blocks_polygon"
  ).value = census_blocks_polygon_wkt;
  document.getElementById(
    "id_census_blocks_polygon_array"
  ).value = census_blocks_polygon_array;
  console.log("Entry updated; map valid");
  triggerSuccessMessage();
}
/******************************************************************************/

function updateElementIndex(el, prefix, ndx) {
  var id_regex = new RegExp("(" + prefix + "-\\d+)");
  var replacement = prefix + "-" + ndx;
  if ($(el).attr("for"))
    $(el).attr(
      "for",
      $(el)
        .attr("for")
        .replace(id_regex, replacement)
    );
  if (el.id) el.id = el.id.replace(id_regex, replacement);
  if (el.name) el.name = el.name.replace(id_regex, replacement);
}

/******************************************************************************/

function cloneMore(selector, prefix) {
  // Function that clones formset fields.
  var newElement = $(selector).clone(true);
  var total = $("#id_" + prefix + "-TOTAL_FORMS").val();
  if (total >= 10) {
    return false;
  }
  if (total == 0) {
    newElement = formsetFieldObject;
  }
  newElement.find("#description_warning").remove();
  newElement.find("#category_warning").remove();
  newElement.find(":input").each(function() {
    var name = $(this)
      .attr("name")
      .replace("-" + (total - 1) + "-", "-" + total + "-");
    var id = "id_" + name;
    $(this)
      .attr({
        name: name,
        id: id,
      })
      .val("")
      .removeAttr("checked");
  });
  total++;
  $("#id_" + prefix + "-TOTAL_FORMS").val(total);
  if (total == 1) {
    $("#formset_container").after(newElement);
  } else {
    $(selector).after(newElement);
  }
  var conditionRow = $(".form-row:not(:last)");
  conditionRow
    .find(".btn.add-form-row")
    .removeClass("btn-outline-success")
    .addClass("btn-outline-danger")
    .removeClass("add-form-row")
    .addClass("remove-form-row")
    .html('<span class="" aria-hidden="true">Remove</span>');
  return false;
}

/******************************************************************************/
/* Deletes the issue category and description when "remove" is pressed */
function deleteForm(prefix, btn) {
  // Function that deletes formset fields.
  var total = parseInt($("#id_" + prefix + "-TOTAL_FORMS").val());
  if (total == 1) {
    // save last formset field object.
    formsetFieldObject = $(".form-row:last").clone(true);
  }
  btn.closest(".form-row").remove();
  var forms = $(".form-row");
  console.log(forms.length);
  $("#id_" + prefix + "-TOTAL_FORMS").val(forms.length);
  for (var i = 0, formCount = forms.length; i < formCount; i++) {
    $(forms.get(i))
      .find(":input")
      .each(function() {
        updateElementIndex(this, prefix, i);
      });
  }
  return false;
}

/******************************************************************************/

$(document).on("click", ".add-form-row", function(e) {
  // Add form click handler.
  e.preventDefault();
  cloneMore(".form-row:last", "form");
  return false;
});

/******************************************************************************/

$(document).on("click", ".remove-form-row", function(e) {
  // Remove form click handler.
  e.preventDefault();
  deleteForm("form", $(this));
  return false;
});
