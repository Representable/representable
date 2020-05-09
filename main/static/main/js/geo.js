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

var state_areas = {
  "ak" : 665384,
  "al" : 52420,
  "ar" : 53178,
  "az" : 113990,
  "ca" : 163694,
  "co" : 104093,
  "ct" : 5543,
  "dc" : 68,
  "de" : 2488,
  "fl" : 65757,
  "ga" : 59425,
  "hi" : 10931,
  "ia" : 56272,
  "id" : 83568,
  "il" : 57913,
  "in" : 36419,
  "ks" : 82278,
  "ky" : 40407,
  "la" : 52378,
  "ma" : 10554,
  "md" : 12405,
  "me" : 35379,
  "mi" : 96713,
  "mn" : 86935,
  "mo" : 69706,
  "ms" : 48431,
  "mt" : 147039,
  "nc" : 53819,
  "nd" : 70698,
  "nh" : 9349,
  "nj" : 8722,
  "nm" : 121590,
  "nv" : 110571,
  "ny" : 54554,
  "oh" : 44825,
  "ok" : 69898,
  "or" : 98378,
  "pa" : 46054,
  "ri" : 1544,
  "sc" : 32020,
  "sd" : 77115,
  "tn" : 42144,
  "tx" : 268596,
  "ut" : 84896,
  "va" : 42774,
  "vt" : 9616,
  "wa" : 71297,
  "wi" : 65496,
  "wv" : 24230,
  "wy" : 97813,
}

// dictionary with state neighbors without nebraska since there is
// no census block data for nebraska
var state_neighbors = {
  ak: [],
  al: ["fl", "ga", "ms", "tn"],
  ar: ["la", "mo", "ms", "ok", "tn", "tx"],
  az: ["ca", "co", "nv", "nm", "ut"],
  ca: ["az", "nv", "or"],
  co: ["az", "ks", "nm", "ok", "ut", "wy"],
  ct: ["ma", "ny", "ri"],
  dc: ["md", "va"],
  de: ["md", "nj", "pa"],
  fl: ["al", "ga"],
  ga: ["al", "fl", "nc", "sc", "tn"],
  hi: [],
  ia: ["al", "mn", "mo", "sd", "wi"],
  id: ["mt", "nv", "or", "ut", "wa", "wy"],
  il: ["in", "ia", "mi", "ky", "mo", "wi"],
  in: ["il", "ky", "mi", "oh"],
  ks: ["co", "mo", "ok"],
  ky: ["il", "in", "mo", "oh", "tn", "va", "wv"],
  la: ["ar", "ms", "tx"],
  ma: ["ct", "nh", "ny", "ri", "vt"],
  md: ["de", "pa", "va", "wv"],
  me: ["nh"],
  mi: ["il", "in", "mn", "oh", "wi"],
  mn: ["ia", "mi", "nd", "sd", "wi"],
  mo: ["ar", "il", "ia", "ks", "ky", "ok", "tn"],
  ms: ["al", "ar", "la", "tn"],
  mt: ["id", "nd", "sd", "wy"],
  nc: ["az", "ca", "id", "or", "ut"],
  nd: ["mn", "mt", "sd"],
  nh: ["me", "ma", "vt"],
  nj: ["ny", "de", "pa"],
  nm: ["az", "co", "ok", "tx", "ut"],
  nv: ["az", "ca", "id", "or", "ut"],
  ny: ["ct", "ma", "nj", "pa", "ri", "vt"],
  oh: ["in", "ky", "mi", "pa", "wv"],
  ok: ["ar", "co", "ks", "mo", "nm", "tx"],
  or: ["ca", "id", "nv", "wa"],
  pa: ["de", "md", "nj", "ny", "oh", "wv"],
  ri: ["ct", "ma", "ny"],
  sc: ["ga", "nc"],
  sd: ["ia", "mn", "mt", "nd", "wy"],
  tn: ["al", "ar", "ga", "ky", "ms", "mo", "nc", "va"],
  tx: ["ar", "la", "nm", "ok"],
  ut: ["az", "co", "id", "nv", "nm", "wy"],
  va: ["ky", "md", "nc", "tn", "wv"],
  vt: ["ma", "nh", "ny"],
  wa: ["id", "or"],
  wi: ["il", "ia", "mi", "mn"],
  wv: ["ky", "md", "oh", "pa", "va"],
  wy: ["co", "id", "mt", "sd", "ut"],
};

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
  // debugger;
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
  zoom: 10,
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
trashButton[0].innerHTML = "<i class='fas fa-trash-alt'></i> Undo Polygon";

// add button for toggling census Blocks
class CensusBlocksControl {
  onAdd(map) {
    var blocksLink = document.createElement("button");
    blocksLink.href = "#";
    blocksLink.className = "active";
    blocksLink.style.width = "150px";
    blocksLink.innerHTML =
      "<span data-toggle='tooltip' title='Census blocks are the smallest unit of the US census - darker blocks have a higher population'><i class='fas fa-th-large'></i> Toggle Census Blocks</span>";
    this._map = map;
    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    var clicked = false;
    blocksLink.onclick = function (e) {
      for (let i = 0; i < states.length; i++) {
        var clickedLayer = states[i] + "-census-lines";
        e.preventDefault();
        e.stopPropagation();
        if (clicked) {
          map.setPaintProperty(clickedLayer, "fill-opacity", 0.0);
          this.className = "";
        } else {
          this.className = "active";
          map.setPaintProperty(clickedLayer, "fill-opacity", [
            "*",
            ["get", "POP10"],
            0.0005,
          ]);
        }
      }
      clicked = clicked ? false : true;
    };
    this._container.appendChild(blocksLink);
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}
map.addControl(new CensusBlocksControl(), "top-left");

// Override Behavior for Draw-Button
document.getElementById("draw-button").addEventListener("click", function (e) {
  cleanAlerts();
  draw.deleteAll();
  // TODO: change for all states
  map.setFilter(state + "-blocks-highlighted", ["in", "BLOCKID10"]);
  draw.changeMode("draw_polygon");
});

document.getElementById("trash-button").addEventListener("click", function (e) {
  cleanAlerts();
  draw.deleteAll();
  // TODO: change for all states
  map.setFilter(state + "-blocks-highlighted", ["in", "BLOCKID10"]);
  draw.changeMode("simple_select");
});

// add a new source layer
function newSourceLayer(name, mbCode) {
  map.addSource(name, {
    type: "vector",
    url: "mapbox://" + mapbox_user_name + "." + mbCode,
  });
}
// add a new layer of census block data
// function newCensusLines(state) {
//   map.addLayer({
//     id: state + "-census-lines",
//     type: "line",
//     source: state + "-census",
//     "source-layer": state + "census",
//     layout: {
//       visibility: "visible",
//       "line-join": "round",
//       "line-cap": "round",
//     },
//     paint: {
//       "line-color": "rgba(71, 93, 204, 0.5)",
//       "line-width": 1,
//     },
//   });
// }
// add a new layer of census block data (transparent layer)
function newCensusShading(state) {
  map.addLayer({
    id: state + "-census-lines",
    type: "fill",
    source: state + "-census",
    "source-layer": state + "census",
    layout: {
      visibility: "visible",
    },
    paint: {
      "fill-outline-color": "rgb(0, 0, 0)",
      "fill-color": "rgb(0, 0, 0)",
      "fill-opacity": 0,
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

// [WIP] function to add the neighbor layers for the filter that queries
// included census blocks
function addNeighborLayersFilter() {
  for (let i = 0; 0 < neighbors.length; i++) {
    if (map.getLayer(neighbors[i] + "-blocks-highlighted")) {
      map.setFilter(neighbors[i] + "-blocks-highlighted", ["in", "BLOCKID10"]);
    }
  }
}

function addStateNeighborLayers(new_neighbors, new_state) {
  // remove the old state layer and add the new state layer
  if (map.getLayer(state + "-blocks-highlighted"))
    map.removeLayer(state + "-blocks-highlighted");
  newHighlightLayer(new_state);
  // iterate through all states in the new_neighbors
  // if includes, don't add
  // delete from old neighbors
  // remove layers in the old neighbors list
  for (let i = 0; i < new_neighbors.length; i++) {
    if (!map.getLayer(new_neighbors[i] + "-blocks-highlighted")) {
      newHighlightLayer(new_neighbors[i]);
    } else {
      let index = neighbors.indexOf(new_neighbor[i]);
      neighbors.splice(index, 1);
    }
  }
  for (let i = 0; i < neighbors.length; i++) {
    if (map.getLayer(neighbors[i] + "-blocks-highlighted"))
      map.removeLayer(neighbors[i] + "-blocks-highlighted");
  }
}

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

  // this is where the census blocks are loaded, from a url to the mbtiles file uploaded to mapbox
  for (let census in CENSUS_KEYS) {
    newSourceLayer(census, CENSUS_KEYS[census]);
  }

  for (let i = 0; i < states.length; i++) {
    // newCensusLines(states[i]);
    newCensusShading(states[i]);
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
  geocoder.on("result", function (ev) {
    map.getSource("single-point").setData(ev.result.geometry);
    var styleSpec = ev.result;
    var styleSpecBox = document.getElementById("json-response");
    var styleSpecText = JSON.stringify(styleSpec, null, 2);
    var divs = document.getElementsByClassName("blurtop");
    for (let i = 0; i < divs.length; i++) {
      divs[i].setAttribute(
        "style",
        "-webkit-filter: blur(0px); pointer-events: auto"
      );
    }
    // Enable Map buttons
    var mapContent = document.getElementById("map");
    var mapButtons = mapContent.getElementsByTagName("button");
    for (var i = 0; i < mapButtons.length; i++) {
      mapButtons[i].disabled = false;
    }
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
  });
});

var wasLoaded = false;
map.on("render", function () {
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
    updateCommunityEntry();
  }
});

/******************************************************************************/

map.on("draw.create", function () {
  updateCommunityEntry();
});
map.on("draw.delete", function () {
  updateCommunityEntry();
});
map.on("draw.update", function () {
  updateCommunityEntry();
});
map.on("draw.changeMode", function () {});

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
              memo.push(feature.properties.BLOCKID10);
              mpoly = addPoly(polyCon.geometry, mpoly, wkt);
            }
          } else {
            if (turf.booleanContains(drawn_polygon, feature.geometry)) {
              memo.push(feature.properties.BLOCKID10);
              polyCon = turf.polygon([feature.geometry.coordinates[0]]);
              mpoly = addPoly(polyCon.geometry, mpoly, wkt);
            }
          }
          return memo;
        },
        ["in", "BLOCKID10"]
      );
      //  sets filter - highlights blocks
      // TODO: update for all states
      map.setFilter(state + "-blocks-highlighted", filter);
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

/* Responds to the user's actions and updates the geometry fields and the arrayfield
 in the form. */
function updateCommunityEntry(e) {
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
    let halfStateArea = state_areas[state]/2;
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
      "BLOCKID10",
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
  triggerSuccessMessage();
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
