import json
from turfpy.transformation import union
from geojson import Feature, Polygon, FeatureCollection

with open('ndbg.geojson') as infile:
  data = json.load(infile)

unique_ids = set()
for i in range(0, len(data['features'])):
	unique_ids.add(data['features'][i]['properties']['GEOID'])
assert len(data['features']) == len(unique_ids), 'GEOIDs are not unique'

ftrs = dict()
for i in range(0, len(data['features'])): 
	my_geoid = data['features'][i]['properties']['GEOID']
	my_ftr = Feature(geometry=data['features'][i]['geometry'])
	ftrs[my_geoid] = my_ftr
 
progress = len(ftrs)*(len(ftrs)-1)
info = dict()
for my_geoid, my_ftr in ftrs.items():
	adjlist = []
	for other_geoid, other_ftr in ftrs.items():
		if my_geoid != other_geoid:
			un = union(FeatureCollection([my_ftr, other_ftr]))
			if un['geometry']['type'] == 'Polygon':
				adjlist.append(other_geoid)
			print(progress, my_geoid, other_geoid, un['geometry']['type'])
			progress -= 1
	info[my_geoid] = {
		'adj_geoids': adjlist,
		'feature_obj': my_ftr,
	}

with open('ndbg-precompute.json', 'w') as outfile:
	json.dump(info, outfile)

# print(json.dumps(un, indent=2, sort_keys=True))



