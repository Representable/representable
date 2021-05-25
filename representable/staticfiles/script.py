import json
from turfpy.transformation import union
from geojson import Feature, Polygon, FeatureCollection

with open('ndbg.geojson') as infile:
  data = json.load(infile)

unique_ids = set()
for i in range(0, len(data['features'])):
	unique_ids.add(data['features'][i]['properties']['GEOID'])
assert len(data['features']) == len(unique_ids), 'GEOIDs are not unique'

info = dict()

for i in range(0, 25): 
	my_geoid = data['features'][i]['properties']['GEOID']
	my_ftr = Feature(geometry=data['features'][i]['geometry'])
	info[my_geoid] = {
		'adj_geoids': [],
		'feature_obj': my_ftr,
	} 

progress = len(info)*(len(info)-1)/2
for my_geoid in info.keys():
	for other_geoid in info.keys():
		if my_geoid < other_geoid:
			un = union(FeatureCollection([
				info[my_geoid]['feature_obj'], 
				info[other_geoid]['feature_obj']
			]))
			if un['geometry']['type'] == 'Polygon':
				info[my_geoid]['adj_geoids'].append(other_geoid)
				info[other_geoid]['adj_geoids'].append(my_geoid)

			print(progress, my_geoid, other_geoid, un['geometry']['type'])
			progress -= 1

with open('fast-ndbg-precompute.json', 'w') as outfile:
	json.dump(info, outfile)

# print(json.dumps(un, indent=2, sort_keys=True))



