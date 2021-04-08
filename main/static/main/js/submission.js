$(document).ready(function () {});

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
    url: "mapbox://" + mapbox_user_name + "." + mbCode,
  });
}
// add a new mapbox boundaries source + layer
function newBoundariesLayer(name) {
  map.addSource(name, {
    type: "vector",
    url: "mapbox://mapbox.boundaries-" + name + "-v3",
  });

  map.addLayer({
    id: name + "-lines",
    type: "line",
    source: name,
    "source-layer":   // ex.: boundaries_legislative_2
      "boundaries_" +
      BOUNDARIES_ABBREV[removeLastChar(name)] +
      "_" +
      name.slice(-1),
    layout: {
      visibility: "none",
    },
    paint: {
      "line-color": "rgba(106,137,204,0.7)",
      "line-width": 3,
    },
  });


  // don't add labels for postal code (redundant) and for block groups (annoying)
  if (name != "pos4" && name != "sta5") {
    map.addSource(name + "-points", {
      type: "vector",
      url: "mapbox://mapbox.boundaries-" + removeLastChar(name) + "Points-v3",
    });
  
    // displays name in centroid of polygons
    map.addLayer({
      id: name + "-labels",
      type: "symbol",
      source: name + "-points",
      "source-layer":   // ex.: boundaries_legislative_2
        "points_" +
        BOUNDARIES_ABBREV[removeLastChar(name)] +
        "_" +
        name.slice(-1),
      layout: {
        'text-field': ["get", "name"],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        visibility: "none",
      },
    });
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

// // create leg 2 lookup table
// const PATH = '/Users/isabelzaller/Desktop/representable-boundaries/mapbox-boundaries-v3_2';
// const lookupTable = require(PATH);

// function createViz(lookupTable) {
//   var lookupTableData = lookupTable.adm1.data;
//   console.log(lookupTableData);
// }

map.on("load", function () {
  // createViz(lookupTable);

  var layers = map.getStyle().layers;
  // Find the index of the first symbol layer in the map style
  // only necessary for making added layers appear "beneath" the existing layers (roads, place names, etc)
  // var firstSymbolId;
  // for (var i = 0; i < layers.length; i++) {
  //   if (layers[i].type === "symbol" && layers[i] !== "road") {
  //     firstSymbolId = layers[i].id;
  //     break;
  //   }
  // }
  /****************************************************************************/
  // school districts as a data layer
  newSourceLayer("school-districts", SCHOOL_DISTR_KEY);
  map.addLayer({
    id: "school-districts-lines",
    type: "line",
    source: "school-districts",
    "source-layer": "us_school_districts",
    layout: {
      visibility: "none",
    },
    paint: {
      "line-color": "rgba(106,137,204,0.7)",
      "line-width": 2,
    },
  });

  map.addLayer({
    id: "school-districts-labels",
    type: "symbol",
    source: "school-districts",
    "source-layer": "us_school_districts_points",
    layout: {
      visibility: "none",
      'text-field': ["get", "name"],
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    },
  });

  // ward + community areas for IL
  if (state === "il") {
    newSourceLayer("chi_wards", CHI_WARD_KEY);
    newSourceLayer("chi_comm", CHI_COMM_KEY);
    map.addLayer({
      id: "chi-ward-lines",
      type: "line",
      source: "chi_wards",
      "source-layer": "chi_wards",
      layout: {
        visibility: "none",
      },
      paint: {
        "line-color": "rgba(106,137,204,0.7)",
        "line-width": 2,
      },
    });
    // TODO: test
    map.addLayer({
      id: "chi-ward-labels",
      type: "symbol",
      source: "chi_wards",
      "source-layer": "chi_wards",
      layout: {
        visibility: "none",
        'text-field': ["get", "ward"],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      },
    });
    map.addLayer({
      id: "chi-comm-lines",
      type: "line",
      source: "chi_comm",
      "source-layer": "chi_comm",
      layout: {
        visibility: "none",
      },
      paint: {
        "line-color": "rgba(106,137,204,0.7)",
        "line-width": 2,
      },
    });
    // TODO: test
    map.addLayer({
      id: "chi-comm-labels",
      type: "symbol",
      source: "chi_comm",
      "source-layer": "chi_comm",
      layout: {
        visibility: "none",
        'text-field': ["get", "community"],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      },
    });
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
    map.fitBounds(commBounds, { padding: 100 });
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
    map.fitBounds(commBounds, { padding: 100 });
    // display loading popup
    var instruction_box = document.getElementById("pdf-loading-box");
    instruction_box.style.display = "block";
    setTimeout(function () {
      // loading popup disappears
      instruction_box.style.display = "none";
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
      doc.save(pdfName + ".pdf");
    }, delay);
  }

  function emailPDF() {
    // make the map look good for the PDF ! TODO: un-select other layers like census blocks (turn into functions)
    map.fitBounds(commBounds, { padding: 100 });

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

// create a button that toggles layers based on their IDs
var toggleableLayerIds = JSON.parse(JSON.stringify(BOUNDARIES_LAYERS));
toggleableLayerIds["school-districts"] = "School Districts";
// add selector for chicago wards + community areas if illinois
if (state === "il") {
  toggleableLayerIds["chi-ward"] = "Chicago Wards";
  toggleableLayerIds["chi-comm"] = "Chicago Community Areas";
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

function addToggleableLayer(id, appendElement) {
  var link = document.createElement("input");

  link.value = id;
  link.id = id;
  link.type = "checkbox";
  link.className = "switch_1";
  link.checked = false;

  link.onchange = function (e) {
    var txt = this.id;
    // var clickedLayers = [];
    // clickedLayers.push(txt + "-lines");
    e.preventDefault();
    e.stopPropagation();

    var visibility = map.getLayoutProperty(txt + "-lines", "visibility");

    if (visibility === "visible") {
      map.setLayoutProperty(txt + "-lines", "visibility", "none");
      if (txt != "pos4" && txt != "sta5") {
        map.setLayoutProperty(txt + "-labels", "visibility", "none");
      }
    } else {
      map.setLayoutProperty(txt + "-lines", "visibility", "visible");
      if (txt != "pos4" && txt != "sta5") {
        map.setLayoutProperty(txt + "-labels", "visibility", "visible");
      }
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
/*******************************************************************/
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
