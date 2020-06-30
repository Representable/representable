from state_abbrev import us_state_abbrev as dicta
import json


def make_content(key, value):
    return "<p> Redistricting information for " + key + " is on its way! </p>"


def main():
    jsondict = []

    i = 1
    for key, value in dicta.items():
        currdict = {}
        currdict["model"] = "main.state"
        currdict["pk"] = i
        fields = {}
        fields["name"] = key
        fields["abbr"] = value
        fields["content1"] = make_content(key, value)
        currdict["fields"] = fields
        jsondict.append(currdict)
        i += 1

    with open("./main/fixtures/states.json", "w") as outfile:
        json.dump(jsondict, outfile)


if __name__ == "__main__":
    main()
