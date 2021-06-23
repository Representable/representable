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

// /*------------------------------------------------------------------------*/
// /* JS file from mapbox site -- display a polygon */
// /* https://docs.mapbox.com/mapbox-gl-js/example/geojson-polygon/ */
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

function sanitizePDF(x) {
  x = x.replace(/ /g, "_");
  x = x.replace("____________________________", "");
  x = x.replace("__________________________", "");
  x = x.replace(/(\r\n|\n|\r)/gm, "");
  x = x.replace(/[^\x00-\x7F]/g, "");
  return x;
}


map.on("load", function () {

  /****************************************************************************/
  addAllLayers(map, document, "submission");
  
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


var toggleableLayerIds = getToggleableLayerIds(state);
addDataSwitches(map, document, "submission", visible)
addElections(map, document, "submission");


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

$("#election-btn").on("click", function () {
  toggleElections();
});

$("#mobile-election-btn").on("click", function () {
  toggleElections();
});

$("#election-card div.card-body h5.card-title").on("click", function () {
  toggleElections();
});

function toggleDemographics() {
  $("#demographics-col").toggleClass("d-none");
  $("#demographics-card").toggleClass("d-none");
}

function toggleDataLayers() {
  $("#data-layer-col").toggleClass("d-none");
  $("#data-layer-card").toggleClass("d-none");
}

function toggleElections() {
  $("#election-col").toggleClass("d-none");
  $("#election-card").toggleClass("d-none");
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
// // remove the last char in the string
// function removeLastChar(str) {
//   return str.substring(0, str.length - 1);
// }

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

// copies link to page to the clipboard
// from: https://stackoverflow.com/questions/49618618/copy-current-url-to-clipboard
function copyPageLink() {
  var dummy = document.createElement('input'),
      text = window.location.href;

  document.body.appendChild(dummy);
  dummy.value = text;
  dummy.select();
  document.execCommand('copy');
  document.body.removeChild(dummy);

  // set text to say "copied!" for feedback mechanism that the copying worked
  var copyText = document.getElementById("copy-link-text");
  copyText.innerHTML = "Copied!";
  setTimeout(function () { copyText.innerHTML = 'Or <a href="#" onclick="copyPageLink();event.preventDefault();">copy the link</a> to this page to share.' }, 2000);
}
