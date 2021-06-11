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
var PRECINCTS_KEY = "precincts_final";

var STATES_USING_OLD_UNITS = ["il", "ok"];

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
