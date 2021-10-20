/*------------------------------------------------------------------------*/
/* this file is for functions and variables common to both map.js and 
    submission.js */
/*------------------------------------------------------------------------*/




// add a new source layer
function newSourceLayer(map, name, mbCode) {
  map.addSource(name, {
    type: "vector",
    url: "mapbox://" + mapbox_user_name + "." + mbCode,
  });
}

var popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});

function getPopupText(featureID, name) {
  if (name === "adm2") {
    let data = ADM2[featureID];
    let key = data["state_code"];
    return ADM2[featureID]["name"] + " County, " + STATE_ANSI[key]["abbrev"];
  }
  if (name === "leg2") {
    let data = LEG2[featureID];
    let key = data["state_code"];
    return STATE_ANSI[key]["abbrev"] + " " + LEG2[featureID]["name"];
  }
  if (name === "leg3") {
    let data = LEG3[featureID];
    let key = data["state_code"];
    return STATE_ANSI[key]["abbrev"] + " " + LEG3[featureID]["name"];
  }
  if (name === "leg4") {
    let data = LEG4[featureID];
    let key = data["state_code"];
    return STATE_ANSI[key]["abbrev"] + " " + LEG4[featureID]["name"];
  }
  if (name === "pos4") {
    return POS4[featureID]["zipcode"];
  }
}


function addPopupHover(map, location, txt) {
  var identifiedFeatures = map.queryRenderedFeatures(location.point, txt + "-fills");
  popup.remove();
  if (identifiedFeatures != '') {
    var featureID = identifiedFeatures[0].id;
    // query txt by feature ID in lookup table
    if (featureID !== undefined) {
      var popupText = getPopupText(featureID, txt);
      popup.setLngLat(location.lngLat)
        .setHTML(popupText)
        .addTo(map);
    }
  }
}

// add a new mapbox boundaries source + layer
function newBoundariesLayer(map, name) {
  map.addSource(name, {
    type: "vector",
    url: "mapbox://mapbox.boundaries-" + name + "-v3",
  });
  createLineLayer(map, name + "-lines", name, "boundaries_" + BOUNDARIES_ABBREV[removeLastChar(name)] + "_" + name.slice(-1));
  if (name !== "sta5") {
    createHoverLayer(map, name + "-fills", name, "boundaries_" + BOUNDARIES_ABBREV[removeLastChar(name)] + "_" + name.slice(-1));
  }
}

var hoveredStateId = null;

function createHoverLayer(map, fillLayerName, source, sourceLayer) {
  map.addLayer({
    id: fillLayerName,
    type: "fill",
    source: source,
    "source-layer": sourceLayer,
    layout: {
      visibility: "none"
    },
    'paint': {
      'fill-color': 'rgba(106,137,204,0.7)',
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.5,
        0
      ]
    }
  });
}

function createLineLayer(map, lineLayerName, source, sourceLayer=false, line_color = "rgba(106,137,204,0.7)", line_width = 3, line_opacity = 1) {
  if (sourceLayer) {
    map.addLayer({
      id: lineLayerName,
      type: "line",
      source: source,
      "source-layer": sourceLayer,
      layout: {
        visibility: "none",
      },
      paint: {
        "line-color": line_color,
        "line-width": line_width,
        "line-opacity": line_opacity,
      },
    });
  }
  else {
    map.addLayer({
      id: lineLayerName,
      type: "line",
      source: source,
      layout: {
        visibility: "none",
      },
      paint: {
        "line-color": line_color,
        "line-width": line_width,
        "line-opacity": line_opacity,
      },
    });
  }
}

function createElectionLayer(map, layerName, source, sourceLayer) {
  map.addLayer({
    // copied from openprecincts colors
    id: layerName,
    type: "fill",
    source: source,
    "source-layer": sourceLayer,
    layout: {
      visibility: "none",
    },
    paint: {
      "fill-outline-color": "rgb(0,0,0)",
      "fill-opacity": 0.35,
    },
  });
}

function addAllLayers(map, document, pageName) {
  // school districts as a data layer
  newSourceLayer(map, "school-districts", SCHOOL_DISTR_KEY);
  createLineLayer(map, "school-districts-lines", "school-districts", "us_school_districts");
  createHoverLayer(map, "school-districts-fills", "school-districts", "us_school_districts");

  // tribal boundaries as a data layer
  newSourceLayer(map, "tribal-boundaries", TRIBAL_BOUND_KEY);
  createLineLayer(map, "tribal-boundaries-lines", "tribal-boundaries", "tl_2020_us_aiannh");
  createHoverLayer(map, "tribal-boundaries-fills", "tribal-boundaries", "tl_2020_us_aiannh");

  // ward + community areas for IL
  if (state === "il") {
    newSourceLayer(map, "chi_wards", CHI_WARD_KEY);
    createLineLayer(map, "chi-ward-lines", "chi_wards", "chi_wards");
    createHoverLayer(map, "chi-ward-fills", "chi_wards", "chi_wards");

    newSourceLayer(map, "chi_comm", CHI_COMM_KEY);
    createLineLayer(map, "chi-comm-lines", "chi_comm", "chi_comm");
    createHoverLayer(map, "chi-comm-fills", "chi_comm", "chi_comm");
  }
  if (state === "ny") {
    newSourceLayer(map, "nyc-city-council", NYC_COUNCIL_KEY);
    createLineLayer(map, "nyc-city-council-lines", "nyc-city-council", "nyc_council-08swpg");
    createHoverLayer(map, "nyc-city-council-fills", "nyc-city-council", "nyc_council-08swpg");

    newSourceLayer(map, "nyc-state-assembly", NYC_STATE_ASSEMBLY_KEY);
    createLineLayer(map, "nyc-state-assembly-lines", "nyc-state-assembly", "nyc_state_assembly-5gr5zo");
    createHoverLayer(map, "nyc-state-assembly-fills", "nyc-state-assembly", "nyc_state_assembly-5gr5zo");
  }
  if (state === "co") {
    newSourceLayer(map, "ccwards", "ccwards");
    createLineLayer(map, "ccwards-lines", "ccwards", "ccwards");
    createHoverLayer(map, "ccwards-fills", "ccwards", "ccwards");

    newSourceLayer(map, "ccnbh", "ccnbh");
    createLineLayer(map, "ccnbh-lines", "ccnbh", "ccnbh");
    createHoverLayer(map, "ccnbh-fills", "ccnbh", "ccnbh");
  }
  // console.log(drive_id);
  // console.log(drive_slug);
  console.log(state);
  // "2022-2023-commerce-city"

  // add precinct lines and fill
  if (HAS_PRECINCTS.indexOf(state) != -1) {
    newSourceLayer(map, "smaller_combined_precincts", PRECINCTS_KEY);
    createLineLayer(map, "smaller_combined_precincts-lines", "smaller_combined_precincts", "smaller_combined_precincts"); //, line_color = BOUNDARIES_COLORS["nyc"], line_width = 2, line_opacity = 0.7)
    createElectionLayer(map, "smaller_combined_precincts-fill", "smaller_combined_precincts", "smaller_combined_precincts");
  } else if (pageName === "map") {
    var txt_box = document.getElementById("no-election-text");
    txt_box.innerHTML = "<b>Election data is not yet available for this state.</b>"
  }


  // leg2 : congressional district
  // leg3 : state senate district
  // leg4 : state house district
  // adm2 : counties
  // loc4 : neighborhoods
  // pos4 : 5-digit postcode area
  // sta5 : block groups
  for (var key in BOUNDARIES_LAYERS) {
    newBoundariesLayer(map, key);
  }
}


function addDataSwitches(map, document, pageName, visible) {
  // Create toggle switches
  var layers = document.getElementById("outline-menu");
  var addContainer = document.createElement("div");
  addContainer.classList.add("container-fluid", "w-100");
  layers.appendChild(addContainer);

  var layersContainer = layers.children[0];
  var addRow = document.createElement("div");
  addRow.classList.add("row", "row-wide");
  layersContainer.appendChild(addRow);

  var layersRow = layersContainer.children[0];
  var addCol1 = document.createElement("div");
  addCol1.classList.add("col-12", "col-md-6", "m-0", "p-0");
  var addCol2 = document.createElement("div");
  addCol2.classList.add("col-12", "col-md-6", "m-0", "p-0");
  layersRow.appendChild(addCol1);
  layersRow.appendChild(addCol2);

  var layersCol1 = layersRow.children[0];
  var layersCol2 = layersRow.children[1];


  var count = 0;
  // Append the switches
  for (var id in toggleableLayerIds) {
    if (pageName === "map") {
      var div = document.createElement("div");
      // div.classList.add("m-0", "p-0");
      // div.classList.add("switch_box,box_1")
      layers.appendChild(div);
      addToggleableLayer(id, div, pageName);
      continue;
    }
    if (count % 2 == 0) {
      addToggleableLayer(id, layersCol1, pageName);
    } else {
      addToggleableLayer(id, layersCol2, pageName);
    }
    count++;
  }
  var newline = document.createElement("br");

  // add the custom layer functionality
  var div = document.createElement("div");

  var upload = document.createElement("input");
  upload.setAttribute("type", "file");
  upload.setAttribute("id", "my-dist-file");
  upload.setAttribute("name", "filename");
  upload.onchange = function(){addCustomLayer(this);};
  upload.setAttribute("accept", ".geojson");

  var uploadLabel = document.createElement("label");
  uploadLabel.setAttribute("for", "my-dist-file");
  uploadLabel.innerHTML= "Upload a district plan or custom layer as a geojson file";
  uploadLabel.classList.add("btn-link");
  uploadLabel.id = "uploadLabel";

  var divideLine = document.createElement("hr");
  div.appendChild(divideLine);

  div.appendChild(uploadLabel);
  div.appendChild(upload);
  layers.appendChild(div);

  // function to add custom layers
  function addCustomLayer(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e) {
        var name = "uploadedMap"
        
        var mapLayer = map.getLayer('uploadedMap-lines');

        // clears previously uploaded maps
        if (typeof mapLayer !== 'undefined') {
          // Remove map layer & source.
          map.removeLayer('uploadedMap-lines').removeSource(name);
          count--;
          var oldToggleParent = document.getElementById("uploadedMap").parentNode;
          while (oldToggleParent.firstChild) {
            oldToggleParent.removeChild(oldToggleParent.firstChild);
          }
          oldToggleParent.remove();
        }

        // add the map source
        map.addSource(name, {
          'type': 'geojson',
          'data': e.target.result
        });

        // add map layer
        createLineLayer(map, 'uploadedMap-lines', name);

        // creates the label for the new layer
        var disp_name = input.files[0].name;
        disp_name = disp_name.substring(0, disp_name.length - 8);
        toggleableLayerIds[name] = disp_name;

        // creates the layer
        addToggleableLayer(name, layers, pageName);
        // if (pageName === "map") {
        //   var div = document.createElement("div");
        //   layers.appendChild(div);
        //   addToggleableLayer(name, div, pageName);
        // }
        // else {
        //   if (count % 2 == 0) {
        //     addToggleableLayer(name, layersCol1, pageName);
        //   } else {
        //     addToggleableLayer(name, layersCol2, pageName);
        //   }
        // }
        var button = document.getElementById(name);
        button.checked = false;
        count++;
      };

      reader.readAsDataURL(input.files[0]);
    }
  }

  function updateFeatureState(source, sourceLayer, hoveredStateId, hover) {
    map.setFeatureState({
      source: source,
      sourceLayer:
        sourceLayer,
      id: hoveredStateId
    },
      { hover: hover }
    );
  }

  function addToggleableLayer(id, appendElement, pageName) {
    var link = document.createElement("input");

    link.value = id;
    link.id = id;
    link.type = "checkbox";
    link.className = "switch_1";
    link.checked = false;

    link.onchange = function (e) {
      var txt = this.id;
      e.preventDefault();
      e.stopPropagation();

      var visibility = map.getLayoutProperty(txt + "-lines", "visibility");
      if (visibility === "visible") { // checked to unchecked
        map.setLayoutProperty(txt + "-lines", "visibility", "none");
        if (FILL_MAP[txt]) {
          map.setLayoutProperty(txt + "-fills", "visibility", "none");
        }
        hoveredStateId = null;
        popup.remove();
        visible = null;

      } else { // unchecked to checked

        hoveredStateId = null;
        popup.remove();

        for (var layerID in toggleableLayerIds) {
          if (layerID != txt) {
            map.setLayoutProperty(layerID + "-lines", "visibility", "none");
            if (FILL_MAP[layerID]) {
              map.setLayoutProperty(layerID + "-fills", "visibility", "none");
            }
            var button = document.getElementById(layerID);
            button.checked = false;
          }
        }
        map.setLayoutProperty(txt + "-lines", "visibility", "visible");
        if (FILL_MAP[txt]) {
          map.setLayoutProperty(txt + "-fills", "visibility", "visible");
          visible = txt;
        }

        mixpanel.track("Clicked on data layer", {
          layer: txt,
        });
      }

      if (visible != null && visible != "sta5") {
        var sourceLayer = SOURCE_LAYER_NAMES[visible];

        map.on('mousemove', visible + '-fills', function (e) {
          if (FILL_MAP[visible]) {
            addPopupHover(map, e, visible);
            if (e.features.length > 0) {
              if (hoveredStateId !== null) {
                updateFeatureState(visible, sourceLayer, hoveredStateId, false);
              }
              hoveredStateId = e.features[0].id;
              updateFeatureState(visible, sourceLayer, hoveredStateId, true);
            }
          }
        });

        map.on('mouseleave', visible + '-fills', function (e) {
          popup.remove();
          if (hoveredStateId !== null) {
            updateFeatureState(visible, sourceLayer, hoveredStateId, false);
          }
          hoveredStateId = null;
        });
      }
    };
    // in order to create the buttons
    var div = document.createElement("div");
    div.className = "switch_box box_1";
    if (pageName === "submission") {
      div.classList.add("mb-3");
    }
    var label = document.createElement("label");
    label.setAttribute("for", id);
    label.textContent = toggleableLayerIds[id];
    // var layers = document.getElementById("outline-menu");
    div.appendChild(link);
    div.appendChild(label);
    appendElement.appendChild(div);
    var newline = document.createElement("br");
  }
}

function addElections(map, document, pageName) {
  // Create toggle switches for elections
  var elections = document.getElementById("election-menu");
  var addContainer = document.createElement("div");
  addContainer.classList.add("container-fluid", "w-100");
  elections.appendChild(addContainer);

  var electionsContainer = elections.children[0];
  var addRow = document.createElement("div");
  addRow.classList.add("row", "row-wide");
  electionsContainer.appendChild(addRow);

  var electionsRow = electionsContainer.children[0];
  var addCol1 = document.createElement("div");
  addCol1.classList.add("col-12", "col-md-6", "m-0", "p-0");
  var addCol2 = document.createElement("div");
  addCol2.classList.add("col-12", "col-md-6", "m-0", "p-0");

  electionsRow.appendChild(addCol1);
  electionsRow.appendChild(addCol2);

  var electionCol1 = electionsRow.children[0];
  var electionCol2 = electionsRow.children[1];

  count = 0;
  // adds elections to next dropdown
  var stateElections = {};
  var elec_text = document.getElementById('election-text');
  if (HAS_PRECINCTS.indexOf(state) != -1) {
    stateElections = STATE_ELECTIONS[state];
  }
  else if (pageName === "submission") {
    elec_text.innerHTML = "<b>Election data is not yet available for this state.</b>";
  }
  for (var idx in stateElections) {
    id = stateElections[idx];
    var link = document.createElement("input");

    link.value = id;
    link.id = id;
    link.type = "checkbox";
    link.className = "switch_1";
    link.checked = false;

    link.onchange = function (e) {
      var txt = "smaller_combined_precincts-fill";
      // var clickedLayers = [];
      // clickedLayers.push(txt + "-lines");
      e.preventDefault();
      e.stopPropagation();

      if (this.checked === false) {
        map.setLayoutProperty(txt, "visibility", "none");
      } else {
        map.setLayoutProperty(txt, "visibility", "visible");
        var demProp = this.id + "D";
        var repProp = this.id + "R";
        var state_layer = STATE_FILES[state];
        // set all other layers to not visible, uncheck the display box for all other layers
        var computedColor = [
          "interpolate-lab", // perceptual color space interpolation
          ["linear"],
          [
            "to-number",
            [
              "/",
              ["to-number", ["get", demProp]],
              // [">", ["number", ["get", demProp], -1], 0],
              [
                "+",
                ["to-number", ["get", demProp]],
                // [">", ["number", ["get", demProp], -1], 0],
                ["to-number", ["get", repProp]],
                // [">", ["number", ["get", repProp], -1], 0],
              ],
            ],
          ],
          0,
          "red",
          0.5,
          "white", // note that, unlike functions, the "stops" are flat, not wrapped in two-element arrays
          1,
          "blue",
        ];
        map.setFilter(txt, ["==", ["get", "layer"], state_layer]);
        map.setPaintProperty(txt, "fill-color", computedColor);

        for (var idx2 in stateElections) {
          otherElection = stateElections[idx2];
          if (otherElection != this.id) {
            var button = document.getElementById(otherElection);
            button.checked = false;
          }
        }
        // if (property.demProp===NULL) {
        //   map.setLayoutProperty(txt, "visibility", "none");
        // }
      }
    };

    // in order to create the buttons
    var dest;
    if (pageName === "submission") {
      if (count % 2 == 0) {
        dest = electionCol1;
      } else {
        dest = electionCol2;
      }
      count++;
    } else { dest = elections }


    var div = document.createElement("div");
    div.className = "switch_box box_1";
    if (pageName === "submission") {
      div.classList.add("mb-3");
    }
    var label = document.createElement("label");
    label.setAttribute("for", id);
    label.textContent = ELECTION_NAMES[id];
    div.appendChild(link);
    div.appendChild(label);
    dest.appendChild(div);
    var newline = document.createElement("br");
  }
}

function getToggleableLayerIds(state) {
  var toggleableLayerIds = JSON.parse(JSON.stringify(BOUNDARIES_LAYERS));
  toggleableLayerIds["school-districts"] = "School Districts";
  toggleableLayerIds["tribal-boundaries"] = "2010 Census Tribal Boundaries";
  // add selector for chicago wards + community areas if illinois
  if (state === "il") {
    toggleableLayerIds["chi-ward"] = "Chicago Wards";
    toggleableLayerIds["chi-comm"] = "Chicago Community Areas";
  }
  if (state === "ny") {
    toggleableLayerIds["nyc-city-council"] = "New York City Council districts";
    toggleableLayerIds["nyc-state-assembly"] = "New York City state assembly districts";
  }
  if (state === "co") {
    toggleableLayerIds["ccwards"] = "Commerce City Wards";
    toggleableLayerIds["ccnbh"] = "Commerce City Neighborhoods";
  }
  if (HAS_PRECINCTS.indexOf(state) != -1) {
    toggleableLayerIds["smaller_combined_precincts"] = "Precinct boundaries";
  }
  return toggleableLayerIds;
}

// remove the last char in the string
function removeLastChar(str) {
  return str.substring(0, str.length - 1);
}
