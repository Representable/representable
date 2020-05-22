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
/**************************************************************************/
/* this file loads the visualization stuff ! for map.html -- loads layers of
census blocks, state legislature, and drawn polygons + tags to select ur favs */
/**************************************************************************/
// the mapbox keys to load tilesets
// when adding a new state: put it into CENSUS_KEYS, UPPER_KEYS, LOWER_KEYS, and state array
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
var UPPER_KEYS = {
  "ak-upper": "ajy4zns3",
  "al-upper": "ct0ehmlm",
  "ar-upper": "0vp12qw4",
  "az-upper": "7url8569",
  "ca-upper": "c793js1z",
  "co-upper": "duivmkp7",
  "ct-upper": "bt8hzuqf",
  "de-upper": "1tjyqhsb",
  "fl-upper": "1gclsamo",
  "ga-upper": "0ctsypu0",
  "hi-upper": "ce4zroh2",
  "ia-upper": "cjshjdih",
  "id-upper": "a1z3uex6",
  "il-upper": "2k9tw58x",
  "in-upper": "cxroj8b9",
  "ks-upper": "8s51clse",
  "ky-upper": "a0z84cq5",
  "la-upper": "34ot8agf",
  "ma-upper": "7t0rbyqc",
  "md-upper": "57db6u4n",
  "me-upper": "5xn4u2cb",
  "mi-upper": "5bvjx29f",
  "mn-upper": "dfxbv8s2",
  "mo-upper": "8fenu4i3",
  "ms-upper": "1n11roh2",
  "mt-upper": "b0mb1mrt",
  "nc-upper": "0n3amj58",
  "nd-upper": "86n4hvqp",
  "ne-upper": "22ev23od",
  "nh-upper": "dbx500kk",
  "nj-upper": "9fogw4w4",
  "nm-upper": "amyd4x8x",
  "nv-upper": "9t29x676",
  "ny-upper": "2vbg6jw9",
  "oh-upper": "4jxx8mtp",
  "ok-upper": "bytxji14",
  "or-upper": "1yfm1svn",
  "pa-upper": "33mtf25i",
  "ri-upper": "dvlmwj4t",
  "sc-upper": "7e8h2zry",
  "sd-upper": "2ia26tc9",
  "tn-upper": "0wu0rs9e",
  "tx-upper": "1jckmfg8",
  "ut-upper": "3o87d3lh",
  "va-upper": "3b1qryb8",
  "vt-upper": "36j5ux3z",
  "wa-upper": "21jsuobz",
  "wi-upper": "7wznqcw4",
  "wv-upper": "2oou05hr",
  "wy-upper": "7lkxtzk5",
};
var LOWER_KEYS = {
  "ak-lower": "a7my06pf",
  "al-lower": "6s3fb8x6",
  "ar-lower": "aoo42mh5",
  "az-lower": "69m1ncet",
  "ca-lower": "8swc402r",
  "co-lower": "6449ik1a",
  "ct-lower": "aps4sgjm",
  "de-lower": "6pnb05km",
  "fl-lower": "489egzlz",
  "ga-lower": "8tvwmii5",
  "hi-lower": "9hvxot4m",
  "ia-lower": "9lgve8rt",
  "id-lower": "6n6vcm1q",
  "il-lower": "6ztbe511",
  "in-lower": "5o3tg7ko",
  "ks-lower": "7ca08p7p",
  "ky-lower": "bxcziibw",
  "la-lower": "a993qoob",
  "ma-lower": "2li5gb3y",
  "md-lower": "4yiku1xm",
  "me-lower": "b7vwy66v",
  "mi-lower": "aa2ljvl2",
  "mn-lower": "8ls97if0",
  "mo-lower": "3m8wa0ij",
  "ms-lower": "dmiyiiih",
  "mt-lower": "4c5h4k4k",
  "nc-lower": "4wfqq41l",
  "nd-lower": "d5ctq6qu",
  "ne-lower": "4gfifmes",
  "nh-lower": "0rehp33q",
  "nj-lower": "8w0imag4",
  "nm-lower": "5ty9whhm",
  "nv-lower": "ccsgcq7z",
  "ny-lower": "7im366fo",
  "oh-lower": "4ithojy1",
  "ok-lower": "1yv8x4qk",
  "or-lower": "al75jr5d",
  "pa-lower": "c2qg68h1",
  "ri-lower": "30x1nsif",
  "sc-lower": "54vjbmvf",
  "sd-lower": "dxkshx2x",
  "tn-lower": "2tjnjb83",
  "tx-lower": "8omxrrst",
  "ut-lower": "05y3896b",
  "va-lower": "9xpukpnx",
  "vt-lower": "d6brg1fl",
  "wa-lower": "c9rk9gas",
  "wi-lower": "3q5v3n9v",
  "wv-lower": "aq380u5z",
  "wy-lower": "93ya8fsx",
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

/*------------------------------------------------------------------------*/
/* JS file from mapbox site -- display a polygon */
/* https://docs.mapbox.com/mapbox-gl-js/example/geojson-polygon/ */
var map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/mapbox/streets-v11", //color of the map -- dark-v10 or light-v9
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

map.addControl(new mapboxgl.NavigationControl()); // plus minus top right corner

// add a new source layer
function newSourceLayer(name, mbCode) {
  map.addSource(name, {
    type: "vector",
    url: "mapbox://" + mapbox_user_name + "." + mbCode,
  });
}
// add a new layer of census block data
function newCensusLayer(state, firstSymbolId) {
  map.addLayer(
    {
      id: state.toUpperCase() + " Census Blocks",
      type: "line",
      source: state + "-census",
      "source-layer": state + "census",
      layout: {
        visibility: "none",
      },
      paint: {
        "line-color": "rgba(106,137,204,0.7)",
        "line-width": 3,
      },
    },
    firstSymbolId
  );
}
// add a new layer of upper state legislature data
function newUpperLegislatureLayer(state) {
  map.addLayer({
    id: state.toUpperCase() + " State Legislature - Upper",
    type: "line",
    source: state + "-upper",
    "source-layer": state + "upper",
    layout: {
      visibility: "none",
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "rgba(106,137,204,0.7)",
      "line-width": 4,
    },
  });
}
// add a new layer of lower state legislature data
function newLowerLegislatureLayer(state) {
  map.addLayer({
    id: state.toUpperCase() + " State Legislature - Lower",
    type: "line",
    source: state + "-lower",
    "source-layer": state + "lower",
    layout: {
      visibility: "none",
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "rgba(106,137,204,0.7)",
      "line-width": 4,
    },
  });
}

entry_names = JSON.parse(entry_names);
entry_reasons = JSON.parse(entry_reasons);

map.on("load", function () {
  var layers = map.getStyle().layers;
  // Find the index of the first symbol layer in the map style
  var firstSymbolId;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].type === "symbol" && layers[i] !== "road") {
      firstSymbolId = layers[i].id;
      break;
    }
  }
  // this is where the census blocks are loaded, from a url to the mbtiles file uploaded to mapbox
  for (let census in CENSUS_KEYS) {
    newSourceLayer(census, CENSUS_KEYS[census]);
  }
  // upper layers
  for (let upper in UPPER_KEYS) {
    if (states[i] !== "dc") {
      newSourceLayer(upper, UPPER_KEYS[upper]);
    }
  }
  // lower layers
  for (let lower in LOWER_KEYS) {
    if (states[i] !== "dc") {
      newSourceLayer(lower, LOWER_KEYS[lower]);
    }
  }
  for (let i = 0; i < states.length; i++) {
    newCensusLayer(states[i], firstSymbolId);
    if (states[i] !== "dc") {
      newUpperLegislatureLayer(states[i]);
      newLowerLegislatureLayer(states[i]);
    }
  }

  // tags add to properties
  tags = JSON.parse(tags);
  // send elements to javascript as geojson objects and make them show on the map by
  // calling the addTo

  var outputstr = a.replace(/'/g, '"');
  a = JSON.parse(outputstr);
  var dest = [];

  for (obj in a) {
    // check how deeply nested the outer ring of the unioned polygon is
    final = [];
    // set the coordinates of the outer ring to final
    if (a[obj][0][0].length > 2) {
      final = [a[obj][0][0]];
    } else if (a[obj][0].length > 2) {
      final = [a[obj][0]];
    } else {
      final = a[obj];
    }
    dest = final[0][0];
    // draw the polygon
    map.addLayer({
      id: obj,
      type: "fill",
      source: {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: final,
          },
          properties: {
            name: entry_names[obj],
            reason: entry_reasons[obj],
          },
        },
      },
      layout: {
        visibility: "visible",
      },
      paint: {
        "fill-color": "rgba(110, 178, 181,0.15)",
      },
    });

    // this has to be a separate layer bc mapbox doesn't allow flexibility with thickness of outline of polygons
    map.addLayer({
      id: obj + "line",
      type: "line",
      source: {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: final,
          },
          properties: {
            name: entry_names[obj],
            reason: entry_reasons[obj],
          },
        },
      },
      layout: {
        visibility: "visible",
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "rgba(0, 0, 0,0.3)",
        "line-width": 2,
      },
    });
  }
  // find what features are currently on view
  // multiple features are gathered that have the same source (or have the same source with 'line' added on)
  map.on("moveend", function () {
    var sources = [];
    var features = map.queryRenderedFeatures();
    // clear the html so that we dont end up with duplicate communities
    document.getElementById("community-list").innerHTML = "";
    for (var i = 0; i < features.length; i++) {
      // through all the features which are rendered, get info abt them
      var source = features[i].source;
      if (
        source !== "composite" &&
        !source.includes("line") &&
        !source.includes("census") &&
        !source.includes("lower") &&
        !source.includes("upper")
      ) {
        if (!sources.includes(source)) {
          sources.push(source);
          var inner_content =
            "<span class='font-weight-light text-uppercase'><a style='display:inline;' href='/submission?map_id=" +
            source.slice(0, 8) +
            "'>".concat(
              features[i].properties.name,
              "</a></span><hr class='my-1'>\n",
              "<span class='font-weight-light'>Why are you submitting this community?</span> <div class='p-1 my-1 bg-info text-white text-center '>",
              features[i].properties.reason,
              "</div>"
            );
          var content =
            '<li class="list-group-item small" id=' +
            source +
            ">".concat(inner_content, "</li>");
          // put the code into the html - display!
          document
            .getElementById("community-list")
            .insertAdjacentHTML("beforeend", content);
        }
      }
    }
  });
  if (dest !== []) {
    // this is necessary so the map "moves" and queries the features above ^^
    map.flyTo({
      center: dest,
      zoom: 12,
    });
  }
});

// on hover, highlight the community
$("#community-list").on("mouseenter", "li", function () {
  map.setPaintProperty(this.id + "line", "line-color", "rgba(0, 0, 0, 0.8)");
  map.setPaintProperty(this.id + "line", "line-width", 3);
  map.setPaintProperty(this.id, "fill-color", "rgba(61, 114, 118,0.3)");
});
$("#community-list").on("mouseleave", "li", function () {
  map.setPaintProperty(this.id + "line", "line-color", "rgba(0, 0, 0,0.5)");
  map.setPaintProperty(this.id + "line", "line-width", 2);
  map.setPaintProperty(this.id, "fill-color", "rgba(110, 178, 181,0.15)");
});

//create a button that toggles layers based on their IDs
var toggleableLayerIds = [
  "Census Blocks",
  "State Legislature - Lower",
  "State Legislature - Upper",
];

for (var i = 0; i < toggleableLayerIds.length; i++) {
  var id = toggleableLayerIds[i];

  var link = document.createElement("input");

  link.value = id.replace(/\s+/g, "-").toLowerCase();
  link.id = id;
  link.type = "checkbox";
  link.className = "switch_1";
  link.checked = false;

  link.onchange = function (e) {
    var txt = this.id;
    var clickedLayers = [];
    for (let i = 0; i < states.length; i++) {
      if (states[i] !== "dc" || txt === "Census Blocks") {
        clickedLayers.push(states[i].toUpperCase() + " " + txt);
      }
    }
    // var clickedLayers = ["NJ " + txt, "VA " + txt, "PA " + txt, "MI " + txt];
    e.preventDefault();
    e.stopPropagation();

    for (var j = 0; j < clickedLayers.length; j++) {
      var visibility = map.getLayoutProperty(clickedLayers[j], "visibility");

      if (visibility === "visible") {
        map.setLayoutProperty(clickedLayers[j], "visibility", "none");
      } else {
        map.setLayoutProperty(clickedLayers[j], "visibility", "visible");
      }
    }
  };
  // in order to create the buttons
  var div = document.createElement("div");
  div.className = "switch_box box_1";
  var label = document.createElement("label");
  label.setAttribute("for", id.replace(/\s+/g, "-").toLowerCase());
  label.textContent = id;
  var layers = document.getElementById("outline-menu");
  div.appendChild(link);
  div.appendChild(label);
  layers.appendChild(div);
  var newline = document.createElement("br");
}

/* Loop through all dropdown buttons to toggle between hiding and showing its dropdown content -
This allows the user to have multiple dropdowns without any conflict */
var dropdown = document.getElementsByClassName("dropdown-btn");
var i;

for (i = 0; i < dropdown.length; i++) {
  dropdown[i].addEventListener("click", function () {
    this.classList.toggle("active");
    var dropdownContent = this.nextElementSibling;
    if (dropdownContent.style.display === "block") {
      dropdownContent.style.display = "none";
    } else {
      dropdownContent.style.display = "block";
    }
    // add logic for polygons
    // map.setFilter('users', ['in', 'orgs', ...targetIDs]);
  });
}
