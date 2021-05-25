import json
from turfpy.transformation import union
from turfpy.measurement import bbox_polygon, bbox
from geojson import Feature, Polygon, FeatureCollection

with open('ndbg.geojson') as infile:
  data = json.load(infile)

unique_ids = set()
for i in range(0, len(data['features'])):
	unique_ids.add(data['features'][i]['properties']['GEOID'])
assert len(data['features']) == len(unique_ids), 'GEOIDs are not unique'

info = dict()

for i in range(0, len(data['features'])): 
	my_geoid = data['features'][i]['properties']['GEOID']
	my_ftr = Feature(geometry=data['features'][i]['geometry'])
	my_box = bbox_polygon(bbox(my_ftr))
	info[my_geoid] = {
		'adj_geoids': [],
		'feature_obj': my_ftr,
		'bounding_box': my_box,
	} 

progress = len(info)*(len(info)-1)/2
for my_geoid in info.keys():
	for other_geoid in info.keys():
		if my_geoid < other_geoid:
			union_box = union(FeatureCollection([
				info[my_geoid]['bounding_box'],
				info[other_geoid]['bounding_box'],
			]))

			if(union_box['geometry']['type'] == 'Polygon'):
				union_ftr = union(FeatureCollection([
					info[my_geoid]['feature_obj'], 
					info[other_geoid]['feature_obj']
				]))

				if union_ftr['geometry']['type'] == 'Polygon':
					info[my_geoid]['adj_geoids'].append(other_geoid)
					info[other_geoid]['adj_geoids'].append(my_geoid)


			print(progress)
			progress -= 1

with open('precompute-ndbg.json', 'w') as outfile:
	json.dump(info, outfile)