function highlightBlocks(drawn_polygon) {
    console.log("called highlight blocks");
    // once the above works, check the global scope of drawn_polygon
    var census_blocks_polygon = drawn_polygon;
    var polygonBoundingBox = turf.bbox(census_blocks_polygon);
    // get the bounds of the polygon to reduce the number of blocks you are querying from
    var southWest = [polygonBoundingBox[0], polygonBoundingBox[1]];
    var northEast = [polygonBoundingBox[2], polygonBoundingBox[3]];
    var northEastPointPixel = map.project(northEast);
    var southWestPointPixel = map.project(southWest);
    var final_union = turf.union(turf.bboxPolygon([0, 0, 0, 0]), turf.bboxPolygon([0, 0, 1, 1]));
    console.log(final_union);
    var features = map.queryRenderedFeatures([southWestPointPixel, northEastPointPixel], { layers: ['census-blocks'] });
    var mpoly = [];
    if (features.length >= 1) {
        var total = 0.0;
        var filter = features.reduce(function (memo, feature) {
            // console.log(feature);
            if (feature.geometry.type == "MultiPolygon") {
                var polyCon;
                // go through all the polygons and check to see if any of the polygons are contained
                // call intersect AND contained
                // following if statements cover corner cases
                if (feature.geometry.coordinates[0][0].length > 2) {
                    polyCon = turf.polygon([feature.geometry.coordinates[0][0]]);
                }
                else {
                    polyCon = turf.polygon([feature.geometry.coordinates[0]]);
                }
                if (turf.booleanContains(drawn_polygon, polyCon)) {
                    memo.push(feature.properties.BLOCKID10);
                    mpoly.push(polyCon.geometry.coordinates[0]);
                    // final_union = turf.union(final_union, polyCon);
                    total += feature.properties.POP10;
                }
            }
            else {
                if (turf.booleanContains(drawn_polygon, feature.geometry)) {
                    memo.push(feature.properties.BLOCKID10);
                    mpoly.push(feature.geometry.coordinates[0]);
                    polyCon = turf.polygon([feature.geometry.coordinates[0]]);
                    // final_union = turf.union(final_union, polyCon);
                    total += feature.properties.POP10;
                }
            }
            return memo;
        }, ["in", "BLOCKID10"]);
        console.log("printing out the multi poly array that is returned");
        map.setFilter("blocks-highlighted", filter);
        console.log(final_union);
        // 1. LOWER LEGISLATION PROGRESS BAR __________________________________
        progressL = document.getElementById("pop");
        progressL.style.background = "orange";
        progressL.innerHTML = Math.round(total / (ideal_population_LOWER['nj'] * 1.5) * 100) + "%";
        progressL.setAttribute("aria-valuenow", "total");
        progressL.setAttribute("aria-valuemax", ideal_population_LOWER['nj']);
        popWidth = total / (ideal_population_LOWER['nj'] * 1.5) * 100;
        progressL.style.width = popWidth + "%";
        // 2. UPPER LEGISLATION PROGRESS BAR __________________________________
        progressU = document.getElementById("popU");
        progressU.style.background = "orange";
        progressU.innerHTML = Math.round(total / (ideal_population_UPPER['nj'] * 1.5) * 100) + "%";
        progressU.setAttribute("aria-valuenow", "total");
        progressU.setAttribute("aria-valuemax", ideal_population_UPPER['nj']);
        popWidth = total / (ideal_population_UPPER['nj'] * 1.5) * 100;
        progressU.style.width = popWidth + "%";
        // 3. CONGRESSIONAL DISTRICT PROGRESS BAR __________________________________
        progressC = document.getElementById("popC");
        progressC.style.background = "orange";
        progressC.innerHTML = Math.round(total / (ideal_population_CONG['nj'] * 1.5) * 100) + "%";
        progressC.setAttribute("aria-valuenow", "total");
        progressC.setAttribute("aria-valuemax", ideal_population_CONG['nj']);
        popWidth = total / (ideal_population_CONG['nj'] * 1.5) * 100;
        progressC.style.width = popWidth + "%";
    }
    return mpoly;
}
