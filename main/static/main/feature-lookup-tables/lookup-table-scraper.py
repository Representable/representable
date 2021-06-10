## we want to only get "feature_id", "name", and "names"

# run using:
## cd main/static/main/feature-lookup-tables

## python lookup-table-scraper.py 
##   mapbox-boundaries-adm2-v3_2.json 
##   mapbox-boundaries-leg2-v3_2.json 
##   mapbox-boundaries-leg3-v3_2.json 
##   mapbox-boundaries-leg4-v3_2.json 
##   mapbox-boundaries-pos4-v3_2.json


import argparse
import json

def first2(s):
    return s[:2]

def scrape(fn, identifier):
    ## open the file
    f = open(fn)
    data = json.load(f)

    ## extract "feature_id", "name", "names" parameters
    jsondict = {}
    features = data[identifier]["data"]["all"]
    for fe in features:
        feature_data = data[identifier]["data"]["all"][fe]  ## get data for one feature
        if identifier == "adm2":
            length = len(feature_data["names"]["en"])
            selected_data = {"name": feature_data["names"]["en"][length - 1]}
        elif identifier == "leg2":
            selected_data = {"name": feature_data["name"], "state_code": first2(feature_data["unit_code"])}
        elif identifier == "leg3":
            selected_data = {"name": feature_data["name"], "state_code": first2(feature_data["unit_code"])}
        elif identifier == "leg4":
            selected_data = {"name": feature_data["name"], "state_code": first2(feature_data["unit_code"])}
        elif identifier == "pos4":
            selected_data = {"zipcode": feature_data["unit_code"]}

        jsondict[feature_data["feature_id"]] = selected_data

    ## close in file
    f.close()

    return jsondict

def main():
    parser = argparse.ArgumentParser(description='Read in the name of the json file(s)')
    parser.add_argument('filename', metavar='N', type=str, nargs='+',
                    help='name of the json file(s) of interest')
    args = parser.parse_args()

    ## write data to outfile
    outfile = "feature-lookup-tables.js"
    with open(outfile, "w") as outfile:
        for fn in args.filename:
            identifier = fn.split("-")[2] ## get identifier (ex. adm2, leg2, etc.)
            outfile.write("const " + identifier.upper() + " =\n")
            data = scrape(fn, identifier)
            json.dump(data, outfile)
            outfile.write("\n")

if __name__ == "__main__":
    main()