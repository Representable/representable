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
  "chi-comm": "rgb(169, 169, 169)" // gray
}
var BG_KEYS = {
  "albg": "300jwyj1",
  "akbg": "6tvgdw55",
  "azbg": "0n1ps1t2", //2010: 36qwamka
  "arbg": "9k17jaaj",
  "cabg": "268q9ean",
  "cobg": "1jz1bbbn",
  "ctbg": "8r9xck70",
  "dcbg": "52muxnrf",
  "debg": "1ro170dd",
  "flbg": "8xxn05r0",
  "gabg": "1z2ax1de",
  "hibg": "1exo59wx",
  "idbg": "co1hgxz3",
  "ilbg": "4iugl58g",
  "inbg": "1j6vgx4i",
  "iabg": "67o5ozz4",
  "ksbg": "1yfb6h74",
  "kybg": "824zpztg",
  "labg": "4fu0d42l",
  "mebg": "6epxgjkx",
  "mdbg": "92jrtgxz",
  "mabg": "b74lbqvs",
  "mibg": "1isev57e", //2010: 6rmkafit
  "mnbg": "37vpwigo",
  "msbg": "ajbh778v",
  "mobg": "0h5galqm",
  "mtbg": "750skieu",
  "nebg": "3ppwl6ix",
  "nvbg": "8s8o0386", //2010: 0dgcp7py
  "nhbg": "1h5rofgu",
  "njbg": "cxptfxf4", //2010: 9va600u8
  "nmbg": "2r4kzila", //2010: bbx551ad
  "nybg": "7xcrytdf", //2010: 7xcrytdf
  "ncbg": "1amgtw27", //2010: cexlxubg
  "ndbg": "4jpxsqxa",
  "ohbg": "6bunasmx",
  "okbg": "dlg7zdn0",
  "orbg": "13ookshu",
  "pabg": "bias7ts6", //2010: cpap9ug0
  "ribg": "564jbkj2",
  "scbg": "717b0zsq",
  "sdbg": "cklc8t21",
  "tnbg": "a8a1139u",
  "txbg": "9onkqc5t",
  "utbg": "bbpdc27n", //2010: 3i55e9ql
  "vtbg": "bzcxijma",
  "vabg": "2qpo9fjv", //2010: 5qxcnhry
  "wabg": "bnrqxpjq", //2010: 9nxwrro5
  "wvbg": "1ya1ngou",
  "wibg": "7pmyno56",
  "wybg": "0q0iu141"
};
var CHI_WARD_KEY = "179v2oeh";
var CHI_COMM_KEY = "63nswxfc";
var SCHOOL_DISTR_KEY = "1ezqvmlm";
var STATES_USING_NEW_BG = ["az", "mi", "nv", "nj", "nm", "nc", "pa", "ut", "va", "wa"];

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