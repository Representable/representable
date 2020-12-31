$(document).ready(function () {});


// if thanks page, show modal
if (is_thanks === "True") {
  $('#thanksModal').modal('show');
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
    url: "mapbox://mapbox.boundaries-" + name + "-v3"
  });
  map.addLayer(
    {
      id: name + "-lines",
      type: "line",
      source: name,
      "source-layer": "boundaries_" + BOUNDARIES_ABBREV[removeLastChar(name)] + "_" + name.slice(-1),
      layout: {
        visibility: "none"
      },
      paint: {
        "line-color": "rgba(106,137,204,0.7)",
        "line-width": 3,
      }
    }
  );
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
  map.addLayer(
    {
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
    }
  );
  // ward + community areas for IL
  if (state === "il") {
    newSourceLayer("chi_wards", CHI_WARD_KEY);
    newSourceLayer("chi_comm", CHI_COMM_KEY);
    map.addLayer(
      {
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
      }
    );
    map.addLayer(
      {
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
      }
    );
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
  // pdf export button
  // TODO: if creator of community -> include identifying info
  $("#pdf-button").on("click", function () {
    // make the map look good for the PDF ! TODO: un-select other layers like census blocks (turn into functions)
    map.fitBounds(commBounds, { padding: 100 });
    // display loading popup
    var instruction_box = document.getElementById("pdf-loading-box");
    instruction_box.style.display = "block";
    setTimeout(function () {
      // loading popup disappears
      instruction_box.style.display = "none";
      var doc = new jsPDF();

      var entryName = window.document.getElementById("entry-name");
      doc.fromHTML(entryName, 20, 20, { width: 180 });
      doc.setFontSize(10);
      doc.setTextColor(150);
      // identifying info
      var userName = window.document.getElementById("user-name");
      var adStreet = window.document.getElementById("address-street");
      var adCity = window.document.getElementById("address-city");
      if (userName !== null) {
        doc.text(20, 35, userName.textContent);
      }
      if (adStreet !== null) {
        doc.text(20, 40, adStreet.textContent);
      }
      if (adCity !== null) {
        doc.text(20, 45, adCity.textContent);
      }
      doc.setFontSize(12);
      doc.setTextColor(0);
      // link to view on rep
      var rLink = doc.splitTextToSize("View this community at: " + window.location.href, 180);
      doc.text(20, 53, rLink);

      var org = window.document.getElementById("org-text");
      var drive = window.document.getElementById("drive-text");
      if (org !== null) {
        doc.text(20, 61, "Organization: " + org.textContent);
      }
      if (drive !== null) {
        doc.text(20, 69, "Drive: " + drive.textContent);
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

      var elementHandler = {
        "#ignorePDF": function (element, renderer) {
          return true;
        },
        "#entry-name": function (element, renderer) {
          return true;
        },
      };
      // entry fields
      var table = window.document.getElementById("table-content");
      doc.fromHTML(table, 20, 25, {
        width: 180,
        elementHandlers: elementHandler,
      });
      // get entry name in order to name the PDF
      var pdfName = sanitizePDF($("#entry-name").text());
      doc.save(pdfName + ".pdf");
    }, 1500);
  });
});

//create a button that toggles layers based on their IDs
var toggleableLayerIds = JSON.parse(JSON.stringify(BOUNDARIES_LAYERS));
toggleableLayerIds["school-districts"] = "School Districts";
// add selector for chicago wards + community areas if illinois
if (state === "il") {
  toggleableLayerIds["chi-ward"] = "Chicago Wards";
  toggleableLayerIds["chi-comm"] = "Chicago Community Areas";
}

for (var id in toggleableLayerIds){

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
    } else {
      map.setLayoutProperty(txt + "-lines", "visibility", "visible");
    }
  };
  // in order to create the buttons
  var div = document.createElement("div");
  div.className = "switch_box box_1";
  var label = document.createElement("label");
  label.setAttribute("for", id);
  label.textContent = toggleableLayerIds[id];
  var layers = document.getElementById("outline-menu");
  div.appendChild(link);
  div.appendChild(label);
  layers.appendChild(div);
  var newline = document.createElement("br");
};

/*******************************************************************/
// remove the last char in the string
function removeLastChar(str) {
  return str.substring(0, str.length - 1);
}

// Links "What GeoJSON is?" Modal and download for GeoJSON into one event
$('[data-toggle=modal]').on('click', function(e) {
  var $target = $($(this).data('target'));
  $target.data('triggered', true);
  setTimeout(function() {
    if ($target.data('triggered')) {
      $target.modal('show').data('triggered', false);
    };
  }, 100); // ms delay
  return false;
});
$('#geojson-explain-modal').on('show.bs.modal', function () {
  $('#hidden-download-geojson')[0].click();
});
