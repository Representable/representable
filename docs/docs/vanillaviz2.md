---
id: vanillaviz2
title: Mapbox Tilesets
---
Contact Kyle (ktbarnes@princeton.edu) with any questions!

### How to upload data to mapbox tilesets

:::note

This is how we uploaded census blocks groups, school districts, chicago wards and neighborhood boundaries. All other layers on the visualization pages are through Mapbox Boundaries. Implementing drawing with census blocks will require

:::
1. Find your data ! Census blocks and a lot of other shapefiles are available from the census website at https://www.census.gov/cgi-bin/geo/shapefiles/index.php -- blocks with population are found here: https://www2.census.gov/geo/tiger/TIGER2010BLKPOPHU/
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
ogr2ogr -f GeoJSON -t_srs crs:84 {file-name}.geojson {file-name}.shp
```

4. Convert to mbtiles (much smaller!) -ai & -aN create unique ids for use in filter on entry page. Use the same name for the mbtiles as the geojson file to reduce confusion, you'll need this when adding the `source-layer` in mapbox gl js: `tippecanoe -z13 -o {file-name}.mbtiles -ai -aN -ab {file-name}.geojson`
5. Install mapbox cli, if uploading through the CLI. Typically, it's easier to upload through the mapbox GUI: `pip install mapboxcli`
6. Export mapbox token (ask Kyle if you need it, different from mapbox key): `export MAPBOX_ACCESS_TOKEN={TOKEN}`
7. upload the file: `mapbox upload mapbox_user_name.{name} {file-name}.geojson` it's also possible to do this through mapbox studio with an easy to use GUI
8. now you can edit the javascript

```
map.addSource("source-name", {
  type: "vector",
  url: "mapbox://mapbox_user_name.{name}"
});
```

Make sure when you do `map.addLayer()`, you add `"source": "{source-name}"` and `"source-layer": "{file-name}"`! you are done
