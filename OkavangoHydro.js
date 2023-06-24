// var dataset = ee.Image("MERIT/Hydro/v1_0_1");
Map.centerObject(OK, 10);

// var visualization = {
//   bands: ['viswth'],
// };

// var img = dataset.clip(OK)
// Map.addLayer(img, visualization, "River width");

var DEMdataset = ee.Image("NASA/NASADEM_HGT/001");

var elevation = DEMdataset.select("elevation");
var okavango = elevation.clip(OK);

var elevationVis = {
  min: 950.0,
  max: 1150.0,
  palette: [
    "3ae237",
    "b5e22e",
    "d6e21f",
    "fff705",
    "ffd611",
    "ffb613",
    "ff8b13",
    "ff6e08",
    "ff500d",
    "ff0000",
    "de0101",
    "c21301",
    "0602ff",
    "235cb1",
    "307ef3",
    "269db1",
    "30c8e2",
    "32d3ef",
    "3be285",
    "3ff38f",
    "86e26f",
  ],
};

var hillshade = ee.Terrain.hillshade(okavango);
Map.addLayer(hillshade, { min: 150, max: 255 }, "Hillshade");

// var slope = ee.Terrain.slope(dem);
// Map.addLayer(slope, {min:0, max:20, pallete: ['FFFFFF']},'Slope');
// print(slope);

Map.addLayer(okavango, elevationVis, "Elevation");

// //Export the classification result
Export.image.toDrive({
  image: okavango,
  description: "elevevationmap",
  folder: "EarthEngine",
  region: OK,
  scale: 30,
  maxPixels: 1e13,
});

var dataset = ee.FeatureCollection("WWF/HydroSHEDS/v1/FreeFlowingRivers");

// Paint "RIV_ORD" (river order) value to an image for visualization.
var datasetVis = ee.Image().byte().paint(dataset, "RIV_ORD", 2);

var img = datasetVis.clip(OK);
// var img2 = dataset.clip(OK);

var visParams = {
  min: 1,
  max: 10,
  palette: ["1057c9", "137c94", "10c9ba"],
};

Map.addLayer(img, visParams, "Free flowing rivers");
Map.addLayer(dataset, null, "FeatureCollection", false);

/*
 * Legend setup
 */

// Creates a color bar thumbnail image for use in legend from the given color palette.
var vis = {
  min: 500,
  max: 1000,
  palette: "3ae237, b5e22e, d6e21f, fff705, ffd611, ffb613",
};

function makeColorBarParams(palette) {
  return {
    bbox: [0, 0, 1, 0.1],
    dimensions: "100x10",
    format: "png",
    min: 0,
    max: 1,
    palette: palette,
  };
}

// Create the color bar for the legend.
var colorBar = ui.Thumbnail({
  image: ee.Image.pixelLonLat().select(0),
  params: makeColorBarParams(vis.palette),
  style: { stretch: "horizontal", margin: "0px 8px", maxHeight: "24px" },
});

// Create a panel with three numbers for the legend.
var legendLabels = ui.Panel({
  widgets: [
    ui.Label(vis.min, { margin: "4px 8px" }),
    ui.Label((vis.max + vis.min) / 2, {
      margin: "4px 8px",
      textAlign: "center",
      stretch: "horizontal",
    }),
    ui.Label(vis.max, { margin: "4px 8px" }),
  ],
  layout: ui.Panel.Layout.flow("horizontal"),
});

var legendTitle = ui.Label({
  value: "Elevation Map of Okavango (m)",
  style: { fontWeight: "bold" },
});

// Add the legendPanel to the map.
var legendPanel = ui.Panel([legendTitle, colorBar, legendLabels]);
Map.add(legendPanel);
