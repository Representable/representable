import json

with open('precompute-ndbg.json') as infile:
  data = json.load(infile)

info = dict()

for my_geoid in data.keys():
	hvals = [-999999999, -999999999]
	lvals = [+999999999, +999999999]
	for point in data[my_geoid]['bounding_box']['geometry']['coordinates'][0]:
		hvals[0] = max(point[0], hvals[0])
		hvals[1] = max(point[1], hvals[1])
		lvals[0] = min(point[0], lvals[0])
		lvals[1] = min(point[1], lvals[1])

	info[my_geoid] = {
		'adj_geoids' : data[my_geoid]['adj_geoids'],
		'bbox_dims' : [1.05*(hvals[0]-lvals[0]), 1.05*(hvals[1]-lvals[1])],
	}

with open('adj-n-bounds-ndbg.json', 'w') as outfile:
	json.dump(info, outfile)