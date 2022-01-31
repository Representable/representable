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
var PRECINCTS_KEY = "precincts_final";

var STATES_USING_OLD_UNITS = ["il", "ok"];
var STATES_WITHOUT_NEW_FILES = [];

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
};

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
};

var ELECTION_NAMES = {
  PRES12: "2012 President",
  SEN12: "2012 Senate",
  ASS12: "2012 State Assembly",
  ATG12: "2012 Attorney General",
  CDA12: "2012 County District Attorney",
  GOV12: "2012 Governor",
  USH12: "2012 House",

  SEN13: "2013 Senate",

  GOV14: "2014 Governor",
  SEN14: "2014 Senate",
  USH14: "2014 House",
  ASS14: "2014 State Assembly",
  ATG14: "2014 Attorney General",
  SOS14: "2014 Secretary of State",
  TRE14: "2014 Treasurer",

  PRES16: "2016 President",
  SEN16: "2016 Senate",
  USH16: "2016 House",
  AG16: "2016 Attorney General",
  ATG16: "2016 Attorney General",
  GOV16: "2016 Governor",
  SOS16: "2016 Secretary of State",
  ASS16: "2016 State Assembly",
  StSEN16: "2016 State Senate",
  COM16: "2016 Comptroller",
  HOD16: "2016 House of Delegates",
  AUD16: "2016 Auditor",
  LTG16: "2016 Lieutenant Governor",
  SOS16: "2016 Secretary of State",
  TRE16: "2016 Treasurer",
  HOR16: "2016 House",

  HOD17: "2017 House of Delegates",
  ATG17: "2017 Attorney General",
  GOV17: "2017 Governor",
  LTG17: "2017 Lieutenant Governor",

  GOV18: "2018 Governor",
  USH18: "2018 House",
  USS18: "2018 Senate",
  SEN18: "2018 Senate",
  AG18: "2018 Attorney General",
  ATG18: "2018 Attorney General",
  SOS18: "2018 Secretary of State",
  TRE18: "2018 Treasurer",
  StTRE18: "2018 Treasurer",
  LTG18: "2018 Lieutenant Governor",
  HOR18: "2018 House",
  CLAB18: "2018 Commissioner of Labor",
  Corp18: "2018 Corporation Commissioner",
  Insur18: "2019 Insurance Commissioner",
  SPI18: "2018 Superintendent of Public Instruction",
  AUD18: "2018 Auditor",
  StH18: "2018 State House",
  StSEN18: "2018 State Senate",
  StSen18: "2018 State Senate",
  SecS18: "2018 Secretary of State",
  HOR18: "2018 House",
  StHOR18: "2018 State House",
};

var STATE_ELECTIONS = {
  ak: ["GOV18", "USH18", "PRES16", "SEN16", "USH16", "USH14"],
  or: ["GOV18", "USH18", "AG16", "GOV16", "PRES16", "SEN16", "SOS16", "USH16"],
  hi: ["GOV18", "SEN18", "USH18", "PRES16", "SEN16", "USH16"],
  ut: ["GOV16", "PRES16", "SEN16"],
  co: ["AG18", "GOV18", "SOS18", "TRE18", "USH18"],
  tx: ["PRES16", "GOV14", "SEN14", "PRES12", "SEN12"],
  ma: ["PRES16", "SEN14", "SEN13", "PRES12", "SEN12"],
  ri: ["GOV18", "SEN18", "PRES16"],
  ok: ["ATG18", "CLAB18", "Corp18", "GOV18", "HOR18", "Insur18", "LTG18", "SPI18"],
  nv: ["ATG18", "GOV18", "LTG18", "SEN18", "StTRE18"], // "SST18", "StCon18",
  az: ["ATG18", "GOV18", "MNI18", "SOS18", "SPI18", "TRE18", "USS18"],
  mn: ["AG18", "AUD18", "GOV18", "SEN18", "SOS18", "StH18", "USH18"], //"USSSE18", "StSEN18",
  wa: ["HOR18", "SEN18", "StSen18"], //"StHou118", "StHou218",
  mo: ["ATG16", "GOV16", "LTG16", "PRES16", "SEN16", "SOS16", "TRE16"],
  wi: ["PRES16", "SEN16", "ATG14", "GOV14", "SOS14", "TRE14", "USH14", "GOV12", "PRES12", "SEN12", "USH12"], // "ASS12", "ASS14", "ASS16", "ATG12", funky data, "CDA12", "SEN14","StSEN16", "USH16" are broken
  ia: ["PRES16", "SEN16"],
  ar: ["ATG18", "GOV18", "SecS18"],
  il: ["COM16", "PRES16", "SEN16"],
  tn: ["PRES16"],
  mi: ["PRES16"],
  va: ["ATG17", "GOV17", "HOD17", "LTG17", "HOR16", "PRES16"],
  pa: ["GOV18", "HOR18", "SEN18"],
  nc: ["HOR18", "StHOR18", "StSEN18"],
  md: ["PRES16", "SEN16"],
  dc: ["HOR18"],
  vt: ["ATG16", "AUD16", "GOV16", "LTG16", "PRES16", "SEN16"],
};

var HAS_PRECINCTS = ["ak","or","ut","co","tx","ma","ri","ok","nv","az","mn","wa","mo","wi","ia",
"ar","il","tn","mi","va","pa","nc","md","dc","vt", //"hi" is screwed up in terms of projections
];

var STATE_FILES = {
  ak: "alaska_precincts",
  or: "OR_precincts",
  hi: "HI_precincts",
  ut: "UT_precincts",
  co: "co_precincts",
  tx: "TX_vtds",
  ma: "MA_precincts_12_16",
  ri: "RI_precincts",
  ok: "OK_G18",
  nv: "NVG18",
  az: "az_2018",
  mn: "MN_Precincts_Elections",
  wa: "wa2018general",
  mo: "prec_labeled",
  wi: "WI_Wards_12_16",
  ia: "ia_2016",
  ar: "ar18",
  il: "il_2016",
  tn: "tn_2016",
  mi: "mi_2016",
  va: "VirginiaPrecincts2016",
  pa: "PA2018",
  nc: "NC_G18",
  md: "md_2016_w_ushouse",
  dc: "DC_Gen_16_18",
  vt: "vt_2016",
};

var demLayersRef = [
  "whi_alo",
  "bla_alo",
  "nat_alo",
  "asi_alo",
  "pci_alo",
  "sor_alo",
  "Htot"
]

var demLayersNHRef = [
  "whi_alo",
  "bla_alo",
  "nat_alo",
  "asi_alo",
  "pci_alo",
  "sor_alo",
]

var DEMLAYERS = {
  "whi_alo": "White",
  "bla_alo": "Black",
  "nat_alo": "American Indian and Alaska Native",
  "asi_alo": "Asian",
  "pci_alo": "Native Hawaiian or Pacific Islander",
  "sor_alo": "Some other race",
  "Htot": "Hispanic",
}