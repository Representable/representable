
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center:  [-77.0366, 38.895], // DC
  zoom: 12.5,
  bearing: 27,
  pitch: 15
});

var chapters = {
  'baker': {
  bearing: 27,
  center: [-0.15591514, 51.51830379],
  zoom: 15.5,
  pitch: 20
},
'aldgate': {
  duration: 6000,
  center: [-0.07571203, 51.51424049],
  bearing: 150,
  zoom: 15,
  pitch: 0
},
'london-bridge': {
  bearing: 90,
  center: [-0.08533793, 51.50438536],
  zoom: 13,
  speed: 0.6,
  pitch: 40
},
'woolwich': {
  bearing: 90,
  center: [0.05991101, 51.48752939],
  zoom: 12.3
},
'gloucester': {
  bearing: 45,
  center: [-0.18335806, 51.49439521],
  zoom: 15.3,
  pitch: 20,
  speed: 0.5
},
'caulfield-gardens': {
  bearing: 180,
  center: [-0.19684993, 51.5033856],
  zoom: 12.3
},
'telegraph': {
  bearing: 90,
  center: [-0.10669358, 51.51433123],
  zoom: 17.3,
  pitch: 40
},
'charing-cross': {
  bearing: 90,
  center: [-77.0366, 38.895],
  zoom: 14.3,
  pitch: 20
}
};

// On every scroll event, check which element is on screen
window.onscroll = function() {
  var chapterNames = Object.keys(chapters);
  for (var i = 0; i < chapterNames.length; i++) {
    var chapterName = chapterNames[i];
    if (isElementOnScreen(chapterName)) {
        setActiveChapter(chapterName);
        break;
      }
  }
};

var activeChapterName = 'baker';
function setActiveChapter(chapterName) {
  if (chapterName === activeChapterName) return;

  map.flyTo(chapters[chapterName]);
  document.getElementById(chapterName).setAttribute('class', 'active');
  document.getElementById(activeChapterName).setAttribute('class', '');
  activeChapterName = chapterName;
}

function isElementOnScreen(id) {
  var element = document.getElementById(id);
  var bounds = element.getBoundingClientRect();
  return (bounds.top < window.innerHeight && bounds.bottom > 0);
}
