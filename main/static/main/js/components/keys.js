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
var STATES_USING_NEW_BG = ["az", "mi", "nv", "nj", "nm", "nc", "pa", "ut", "va", "wa"];

// begin: may need to take these out
var DATA_KEYS = {
  "adm2" : "bgpfrxre",
  "leg2" : "7otp57u9",
  "leg3" : "bz8a18pt",
  "leg4" : "2ugj6f9b",
  "pos4" : "5lk8vta5",
  "sta5" : "du2358fd"
}

var SOURCE_LAYERS = {
  "adm2" : "mapbox-boundaries-adm2-v3_2-f-86tkt3",
  "leg2" : "mapbox-boundaries-leg2-v3_2-f-91fx12",
  "leg3" : "mapbox-boundaries-leg3-v3_2-f-aa0ue0",
  "leg4" : "mapbox-boundaries-leg4-v3_2-f-7lbi4k",
  "pos4" : "mapbox-boundaries-pos4-v3_2-f-b0zsxb",
  "sta5" : "mapbox-boundaries-sta5-v3_2-f-5q18z9"
}

var DATASET_KEYS = {
  "adm2" : "cknjahf5i1bfp2ds4rtdejmgy",
  "leg2" : "cknj2c9vh1ca128pi8p04j4hf",
  "leg3" : "cknjaimla0dyr20qk2ajlr82z",
  "leg4" : "cknjakdne51z329pies0s4t8l",
}
// end

var TRIBAL_BOUND_KEY = "6jhw01g1";
var NYC_COUNCIL_KEY = "8igk12p1";
var NYC_STATE_ASSEMBLY_KEY = "61wjirls";

var STATES_USING_OLD_UNITS = ["il", "ok"];

var SOURCE_LAYER_NAMES = {
  "leg2" : "boundaries_legislative_2",
  "leg3" : "boundaries_legislative_3",
  "leg4" : "boundaries_legislative_4",
  "adm2" : "boundaries_admin_2",
  "pos4" : "boundaries_postal_4",
  "sta5" : "boundaries_stats_5",
  "school-districts" : "us_school_districts_points",
  "tribal-boundaries" : "tl_2020_us_aiannh",
  "chi-ward" : "chi_wards",
  "chi-comm" : "chi_comm",
  "nyc-city-council" : "nyc_council-08swp",
  "nyc-state-assembly" : "nyc_state_assembly-5gr5zo"
}

var FILL_MAP = {
  "leg2" : true,
  "leg3" : true,
  "leg4" : true,
  "adm2" : true,
  "pos4" : true,
  "sta5" : false,
  "school-districts" : false,
  "tribal-boundaries" : false,
  "chi-ward" : false,
  "chi-comm" : false,
  "nyc-city-council" : false,
  "nyc-state-assembly" : false
}
