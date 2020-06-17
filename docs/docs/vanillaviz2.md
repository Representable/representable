---
id: vanillaviz2
title: Mapbox Tilesets
---
Contact Kyle (ktbarnes@princeton.edu) with any questions!

### How to upload data to mapbox tilesets

:::note

This is how we uploaded census blocks + state legislature borders. Counties are through Mapbox's existing election data tileset. Also note that for some reason Nebraska's files don't show on Mapbox? This is an ongoing mystery.

:::
1. Find your data ! Census blocks and a lot of other shapefiles are available from the census website at https://www.census.gov/cgi-bin/geo/shapefiles/index.php
2. Install tippecanoe (https://github.com/mapbox/tippecanoe)

```
# on MacOS
brew install tippecanoe
# on Ubuntu
git clone https://github.com/mapbox/tippecanoe.git
cd tippecanoe
make -j
make install
```

3. Get the file, unzip, convert to geojson (might have to install GDAL for ogr2ogr, `brew install gdal`)

```
curl -L -O {URL}/{file-name}.zip
unzip {file-name}.zip
ogr2ogr -f GeoJSON {file-name}.geojson {file-name}.shp
```

4. Convert to mbtiles (much smaller!): `tippecanoe -zg -o {file-name}.mbtiles --drop-densest-as-needed --extend-zooms-if-still-dropping {file-name}.geojson`
5. Install mapbox cli: `pip install mapboxcli`
6. Export mapbox token (ask Kyle if you need it, different from mapbox key): `export MAPBOX_ACCESS_TOKEN={TOKEN}`
7. upload the file: `mapbox upload mapbox_user_name.{name} {file-name}.geojson`
8. now you can edit the javascript

```
map.addSource("source-name", {
  type: "vector",
  url: "mapbox://mapbox_user_name.{name}"
});
```

Make sure when you do `map.addLayer()`, you add `"source": "{source-name}"` and `"source-layer": "{file-name}"`! you are done
