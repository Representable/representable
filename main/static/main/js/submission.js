$(document).ready(function () {});

var visible = null;

// if thanks page, show modal
if (is_thanks === "True") {
  $("#thanksModal").modal("show");
}

function toggleAngle(e) {
  var collapsible = e.parentNode.getElementsByClassName("collapse")[0].id;
  $("#" + collapsible).collapse("toggle");
  if (e.innerHTML.includes("fa-angle-down")) {
    e.innerHTML = e.innerHTML.replace("fa-angle-down", "fa-angle-up");
  } else {
    e.innerHTML = e.innerHTML.replace("fa-angle-up", "fa-angle-down");
  }
}

/*------------------------------------------------------------------------*/
/* JS file from mapbox site -- display a polygon */
/* https://docs.mapbox.com/mapbox-gl-js/example/geojson-polygon/ */
var map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/districter-team/ckdfv8riy0uf51hqu1g7qjrha", //color of the map -- dark-v10 or light-v9
  center: [-96.7026, 40.8136], // starting position - Lincoln, Nebraska (middle of country lol)
  zoom: 3, // starting zoom -- higher is closer
  preserveDrawingBuffer: true,
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

// Only add zoom buttons to medium and large screen devices (non-mobile)
if (!window.matchMedia("only screen and (max-width: 760px)").matches) {
  map.addControl(new mapboxgl.NavigationControl()); // plus minus top right corner
}

// add a new source layer
function newSourceLayer(name, mbCode) {
  map.addSource(name, {
    type: "vector",
    url: "mapbox://mapbox." + mapbox_user_name + "." + mbCode,
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


function addPopupHover(location, txt) {
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
function newBoundariesLayer(name) {
  map.addSource(name, {
    type: "vector",
    url: "mapbox://mapbox.boundaries-" + name + "-v3",
  });
  console.log(name);
  createLineLayer(name + "-lines", name, "boundaries_" + BOUNDARIES_ABBREV[removeLastChar(name)] + "_" + name.slice(-1));
  if (name !== "sta5") {
    createFillLayer(name + "-fills", name, "boundaries_" + BOUNDARIES_ABBREV[removeLastChar(name)] + "_" + name.slice(-1));
  }
}

function sanitizePDF(x) {
  x = x.replace(/ /g, "_");
  x = x.replace("____________________________", "");
  x = x.replace("__________________________", "");
  x = x.replace(/(\r\n|\n|\r)/gm, "");
  x = x.replace(/[^\x00-\x7F]/g, "");
  return x;
}

var hoveredStateId = null;

function createFillLayer(fillLayerName, source, sourceLayer) {
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

function createLineLayer(lineLayerName, source, sourceLayer) {
  map.addLayer({
    id: lineLayerName,
    type: "line",
    source: source,
    "source-layer": sourceLayer,
    layout: {
      visibility: "none",
    },
    paint: {
      "line-color": "rgba(106,137,204,0.7)",
      "line-width": 3,
    },
  });
  console.log(sourceLayer)
}

map.on("load", function () {

  /****************************************************************************/

  // school districts as a data layer
  newSourceLayer("school-districts", SCHOOL_DISTR_KEY);
  createLineLayer("school-districts-lines", "school-districts", "us_school_districts");
  // map.addLayer({
  //   id: "school-districts-lines",
  //   type: "line",
  //   source: "school-districts",
  //   "source-layer": "us_school_districts",
  //   layout: {
  //     visibility: "none",
  //   },
  //   paint: {
  //     "line-color": "rgba(106,137,204,0.7)",
  //     "line-width": 2,
  //   },
  // });
  createFillLayer("school-districts-fills", "school-districts", "us_school_districts");

  // tribal boundaries as a data layer
  newSourceLayer("tribal-boundaries", TRIBAL_BOUND_KEY);
  createLineLayer("tribal-boundaries-lines", "tribal-boundaries", "tl_2020_us_aiannh");
  createFillLayer("tribal-boundaries-fills", "tribal-boundaries", "tl_2020_us_aiannh");

  // ward + community areas for IL
  if (state === "il") {
    newSourceLayer("chi_wards", CHI_WARD_KEY);
    newSourceLayer("chi_comm", CHI_COMM_KEY);
    // map.addLayer({
    //   id: "chi-ward-lines",
    //   type: "line",
    //   source: "chi_wards",
    //   "source-layer": "chi_wards",
    //   layout: {
    //     visibility: "none",
    //   },
    //   paint: {
    //     "line-color": "rgba(106,137,204,0.7)",
    //     "line-width": 2,
    //   },
    // });
    createLineLayer("chi-ward-lines", "chi_wards", "chi_wards");
    createFillLayer("chi-ward-fills", "chi_wards", "chi_wards");
    
    // map.addLayer({
    //   id: "chi-comm-lines",
    //   type: "line",
    //   source: "chi_comm",
    //   "source-layer": "chi_comm",
    //   layout: {
    //     visibility: "none",
    //   },
    //   paint: {
    //     "line-color": "rgba(106,137,204,0.7)",
    //     "line-width": 2,
    //   },
    // });
    createLineLayer("chi-comm-lines", "chi_comm", "chi_comm");
    createFillLayer("chi-comm-fills", "chi_comm", "chi_comm");

    // map.addLayer({
    //   id: "chi-comm-labels",
    //   type: "symbol",
    //   source: "chi_comm",
    //   "source-layer": "chi_comm",
    //   layout: {
    //     visibility: "none",
    //     'text-field': ["get", "community"],
    //   },
    // });
  }
  if (state === "ny") {
    newSourceLayer("nyc-city-council", NYC_COUNCIL_KEY);
    // map.addLayer({
    //   id: "nyc-city-council-lines",
    //   type: "line",
    //   source: "nyc-city-council",
    //   "source-layer": "nyc_council-08swpg",
    //   layout: {
    //     visibility: "none",
    //   },
    //   paint: {
    //     "line-color": "rgba(106,137,204,0.7)",
    //     "line-width": 2,
    //   },
    // });
    createLineLayer("nyc-city-council-lines", "nyc-city-council", "nyc_council-08swpg");
    createFillLayer("nyc-city-council-fills", "nyc-city-council", "nyc_council-08swpg");

    newSourceLayer("nyc-state-assembly", NYC_STATE_ASSEMBLY_KEY);
    createLineLayer("nyc-state-assembly-lines", "nyc-state-assembly", "nyc_state_assembly-5gr5zo");
    createFillLayer("nyc-state-assembly-fills", "nyc-state-assembly", "nyc_state_assembly-5gr5zo");
  }
  // leg2 : congressional district
  // leg3 : state senate district
  // leg4 : state house district
  // adm2 : counties
  // loc4 : neighborhoods
  // pos4 : 5-digit postcode area
  // sta5 : block groups
  for (var key in BOUNDARIES_LAYERS) {
    newBoundariesLayer(key);
  }
  
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
    var fit = new L.Polygon(final).getBounds();
    var southWest = new mapboxgl.LngLat(
      fit["_southWest"]["lat"],
      fit["_southWest"]["lng"]
    );
    var northEast = new mapboxgl.LngLat(
      fit["_northEast"]["lat"],
      fit["_northEast"]["lng"]
    );
    var commBounds = new mapboxgl.LngLatBounds(southWest, northEast);
    map.fitBounds(commBounds, {
      padding: {top: 20, bottom:20, left: 50, right: 50}
    });
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
        },
      },
      layout: {
        visibility: "visible",
      },
      paint: {
        "fill-color": "rgba(110, 178, 181,0.30)",
      },
    });
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
        },
      },
      layout: {
        visibility: "visible",
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "rgba(0, 0, 0,0.2)",
        "line-width": 2,
      },
    });
  }
  //geojson export button - close thanks modal
  $(".geojson-button").on("click", function () {
    $("#thanksModal").modal("hide");
  });
  $("#pdf-button").on("click", function () {
    if (state in publicCommentLinks) $("#pdf-comment-modal").modal("show");
    exportPDF(1500);
  });

  $("#thanksModal").on("hidden.bs.modal", function () {
    window.location.href = "/submission/" + comm_id;
  });
  $("#pdf-button-modal").on("click", function () {
    window.location.href = "/submission/" + comm_id + "?pdf=true";
  });
  if (window.location.search.includes("pdf=true")) {
    exportPDF(4000);
  }
  // pdf export button
  // TODO: add array of blockgroup ids, add population and other demographic info
  function exportPDF(delay) {
    // make the map look good for the PDF ! TODO: un-select other layers like census blocks (turn into functions)
    map.fitBounds(commBounds, {
      padding: {top: 20, bottom:20, left: 50, right: 50},
      duration: 0
    });
    // display loading popup
    setTimeout(function () {
      // loading popup disappears
      var doc = new jsPDF();

      var entryName = window.document.getElementById("pdfName");
      doc.fromHTML(entryName, 20, 20, { width: 180 });
      var createdWith = window.document.getElementById("pdfCreatedWith");
      doc.fromHTML(createdWith, 20, 32, { width: 180 });
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.setFontSize(12);
      doc.setTextColor(0);
      // link to view on rep
      var rLink = doc.splitTextToSize(
        "View this community at: " + window.location.href,
        180
      );
      doc.text(20, 45, rLink);

      var org = window.document.getElementById("pdfOrg");
      var drive = window.document.getElementById("pdfDrive");
      if (drive !== null) {
        doc.text(20, 63, "Organization: " + org.textContent);
        doc.text(20, 69, "Community Mapping Drive: " + drive.textContent);
      }

      var imgData = map.getCanvas().toDataURL("image/png");
      // calculate ratio of map so it isn't squashed / stretched
      var mapDim = map.getCanvas().getBoundingClientRect();
      var mapPDFHeight = (mapDim.height * 170) / mapDim.width;
      doc.addImage(imgData, "PNG", 20, 75, 170, mapPDFHeight);
      // next page
      doc.addPage();
      doc.setFontSize(24);
      doc.text(20, 20, "Community Information");
      // entry fields
      var entryInfo = $("#pdfInfo").prop('outerHTML');
      entryInfo = entryInfo.replace(/[^\x00-\x7F]/g, "");
      doc.fromHTML(entryInfo, 20, 25, {
        width: 180,
      });
      // get entry name in order to name the PDF
      var pdfName = sanitizePDF($("#pdfName").text());
      doc.save(pdfName + ".pdf");
    }, delay);
  }

  function emailPDF() {
    // make the map look good for the PDF ! TODO: un-select other layers like census blocks (turn into functions)
    map.fitBounds(commBounds, {
      padding: {top: 20, bottom:20, left: 50, right: 50},
      duration: 0
    });

    // setup XMLH request
    var request = new XMLHttpRequest();
    request.open("POST", "/send_mail_plain", false);
    var formData = new FormData(document.getElementById("pdfForm"));

    // generate email PDF using a copy of the above javascript code
    // let pdfDoc = new jsPDF();
    // pdfDoc.text("Hello world!", 10, 10);

    var doc = new jsPDF();

    var entryName = window.document.getElementById("pdfName");
    doc.fromHTML(entryName, 20, 20, { width: 180 });
    var createdWith = window.document.getElementById("pdfCreatedWith");
    doc.fromHTML(createdWith, 20, 32, { width: 180 });
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.setFontSize(12);
    doc.setTextColor(0);
    // link to view on rep
    var rLink = doc.splitTextToSize(
      "View this community at: " + window.location.href,
      180
    );
    doc.text(20, 45, rLink);

    var org = window.document.getElementById("pdfOrg");
    var drive = window.document.getElementById("pdfDrive");
    if (drive !== null) {
      doc.text(20, 63, "Organization: " + org.textContent);
      doc.text(20, 69, "Community Mapping Drive: " + drive.textContent);
    }

    var imgData = map.getCanvas().toDataURL("image/png");
    // calculate ratio of map so it isn't squashed / stretched
    var mapDim = map.getCanvas().getBoundingClientRect();
    var mapPDFHeight = (mapDim.height * 170) / mapDim.width;
    doc.addImage(imgData, "PNG", 20, 75, 170, mapPDFHeight);
    // next page
    doc.addPage();
    doc.setFontSize(24);
    doc.text(20, 20, "Community Information");
    // entry fields
    var entryInfo = window.document.getElementById("pdfInfo");
    doc.fromHTML(entryInfo, 20, 25, {
      width: 180,
    });
    // get entry name in order to name the PDF
    var pdfName = sanitizePDF($("#pdfName").text());

    // output and send to requests handled in url
    console.log(formData);
    console.log(pdf);
    console.log(doc);

    var pdf = doc.output("blob");
    formData.append("generatedpdf", pdf, pdfName);
    request.send(formData);
  }

  // Automatically email PDF once
  function once(fn, context) {
    var result;

    return function () {
      if (fn) {
        result = fn.apply(context || this, arguments);
        fn = null;
      }

      return result;
    };
  }

  // Usage
  var canOnlyFireOnce = once(function () {
    setTimeout(emailPDF, 5000);
  });
  if (is_thanks === "True") {
    history.pushState(null, null, document.URL);
    window.addEventListener('popstate', function () {
        history.pushState(null, null, document.URL);
    });
    canOnlyFireOnce(); // "Fired!"
  }

  // Form for sending emailPDF
  var testForm = document.getElementById("pdfForm");

  testForm.onsubmit = function (event) {
    console.log("clicked");
    emailPDF();
  };
});

//create a button that toggles layers based on their IDs
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
  if (count % 2 == 0) {
    addToggleableLayer(id, layersCol1);
  } else {
    addToggleableLayer(id, layersCol2);
  }
  count++;
}

function updateFeatureState(source, sourceLayer, hoveredStateId, hover) {
  map.setFeatureState(
    { source: source,
      sourceLayer: 
        sourceLayer,
      id: hoveredStateId },
    { hover: hover }
  );
}

function addToggleableLayer(id, appendElement) {
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
      // remove all previous layers and popups from the map
      hoveredStateId = null;
      popup.remove();

      for (var layerID in toggleableLayerIds) {
       if (layerID != txt) {
          map.setLayoutProperty(layerID + "-lines", "visibility", "none");
          if (FILL_MAP[txt]) {
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
      
    }

    if (visible != null && visible != "sta5") {
      var sourceLayer = null;
      if (visible === "leg2" || visible === "leg3" || visible === "leg4" || visible === "adm2" || visible === "pos4") {
        sourceLayer = "boundaries_" + BOUNDARIES_ABBREV[removeLastChar(visible)] + "_" + visible.slice(-1);
      } else if (visible === "school-districts") {
        sourceLayer = ""
      }
      sourceLayer = SOURCE_LAYER_NAMES[visible];

      map.on('mousemove', visible + '-fills', function(e) {
        if (FILL_MAP[visible]) {
          addPopupHover(e, visible);
          if (e.features.length > 0) {
            if (hoveredStateId !== null) {
              updateFeatureState(visible, sourceLayer, hoveredStateId, false);
            }
            hoveredStateId = e.features[0].id;
            updateFeatureState(visible, sourceLayer, hoveredStateId, true);
          }
        }
      });
    
      map.on('mouseleave', visible + '-fills', function(e) {
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
  div.className = "switch_box box_1 mb-3";
  var label = document.createElement("label");
  label.setAttribute("for", id);
  label.textContent = toggleableLayerIds[id];
  // var layers = document.getElementById("outline-menu");
  div.appendChild(link);
  div.appendChild(label);
  appendElement.appendChild(div);
  var newline = document.createElement("br");
}

$("#data-layer-btn").on("click", function () {
  toggleDataLayers();
});

$("#mobile-data-layer-btn").on("click", function () {
  toggleDataLayers();
});

$("#data-layer-card div.card-body h5.card-title").on("click", function () {
  toggleDataLayers();
});

$("#demographics-btn").on("click", function () {
  toggleDemographics();
});

$("#mobile-demographics-btn").on("click", function () {
  toggleDemographics();
});

$("#demographics-card div.card-body h5.card-title").on("click", function () {
  toggleDemographics();
});

function toggleDemographics() {
  $("#demographics-col").toggleClass("d-none");
  $("#demographics-card").toggleClass("d-none");
}

function toggleDataLayers() {
  $("#data-layer-col").toggleClass("d-none");
  $("#data-layer-card").toggleClass("d-none");
}

/****************************************************************************/
// public comment portal link, if in states.js
if (state in publicCommentLinks) {
  $('#public-comment-link-modal').prop("href", publicCommentLinks[state]);
  $('#public-comment-link').prop("href", publicCommentLinks[state]);
} else {
  $('#public-comment-card').hide();
}
/****************************************************************************/
// remove the last char in the string
function removeLastChar(str) {
  return str.substring(0, str.length - 1);
}

// Links "What GeoJSON is?" Modal and download for GeoJSON into one event
$("[data-toggle=modal]").on("click", function (e) {
  var $target = $($(this).data("target"));
  $target.data("triggered", true);
  setTimeout(function () {
    if ($target.data("triggered")) {
      $target.modal("show").data("triggered", false);
    }
  }, 100); // ms delay
  return false;
});
$("#geojson-explain-modal").on("show.bs.modal", function () {
  $("#hidden-download-geojson")[0].click();
});
