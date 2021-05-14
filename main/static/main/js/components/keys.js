// used for adding the source-layer on boundaries tilesets
var BOUNDARIES_ABBREV = {
  "adm": "admin",
  "pos": "postal",
  "sta": "stats",
  "loc": "locality",
  "leg": "legislative"
}

var BOUNDARIES_LAYERS = {
  "leg2": "Congressional Districts",
  "leg3": "State Senate Districts",
  "leg4": "State House Districts",
  "adm2": "Counties",
  "pos4": "5-digit Postcode Areas",
  "sta5": "2010 Census Block Groups"
}
var BOUNDARIES_COLORS = {
  "leg2": "rgb(60, 180, 75)", // green
  "leg3": "rgb(245, 130, 49)", // orange
  "leg4": "rgb(145, 30, 180)", // purple
  "adm2": "rgb(230, 25, 75)", // red
  "pos4": "rgb(67, 99, 216)", // blue
  "sta5": "rgb(128, 128, 0)", // olive
  "school": "rgb(70, 153, 144)", // teal
  "chi-ward": "rgb(0, 0, 117)", // navy
  "chi-comm": "rgb(169, 169, 169)", // gray
  "tribal": "rgb(255,0,255)", // magenta
  "nyc": "rgb(0, 0, 117)", // navy
  "nyc_assembly": "rgb(169, 169, 169)" // gray
}
var CHI_WARD_KEY = "179v2oeh";
var CHI_COMM_KEY = "63nswxfc";
var SCHOOL_DISTR_KEY = "1ezqvmlm";
var TRIBAL_BOUND_KEY = "6jhw01g1";
var NYC_COUNCIL_KEY = "8igk12p1";
var NYC_STATE_ASSEMBLY_KEY = "61wjirls";

var STATES_USING_OLD_UNITS = ["il", "ok"];
