console.time("Load External Datasets & Shapefiles");
//set global options
var o = {
  width: 960, //width of viz in px
  navWidth: 135, //width of nav area in px
  margins: {left: 5, right: 5, top: 10, bottom: 20},  //margins in px
  dataYear: '2023', //year of perception data
  startYear: '2023', //start year of climate change data
  endYear: '', //end year of climate change data
  map: {
    height: 345, //map height in px
    scale: 655, //map scale, higher will zoom in further
    clickPathWidth: 2,
    dashBase: 1,
    legend: {
      width: 375,
      height: 20,
      tickLength: 3,
      textHeight: 28,
      bottomMargin: 20
    }
  },
  scatter: {
    height: 450,
    margins: {left: 50, right: 0, top: 35, bottom: 35},
    pointRadius: 2.5
  },
  t: 1000, //transition time in ms
  loaderSize: 125,
  baseLink: "//jsl6906.net/Clients/YaleClimateChange/MapPage/CountyCompare/",
  colorScale: {
    left: [
      "#FFF7F3", "#FDE2DF", "#FCCBC6", "#FAABB8", "#F880A9", "#EB509C", "#CD238E", "#A2017C", "#740075", "#49006A" //RdPu
      ],
    right: [
      "#FFF7F3", "#FDE2DF", "#FCCBC6", "#FAABB8", "#F880A9", "#EB509C", "#CD238E", "#A2017C", "#740075", "#49006A" //RdPu
    ],
    hotdryday: [
      "#276419", "#4D9221", "#7FBC41", "#B8E186", "#E6F5D0", "#FDE0EF", "#F1B6DA", "#DE77AE", "#C51B7D", "#8E0152"
    ]
  }
};

//asynchronously load datasets and shapefiles
//which datasets to load are determined by the 'mode' url variable
var myQueue = queue()
  .defer(d3.json, "us-projected_2016-05-08.json")
  .defer(d3.csv, "worry_index.csv")
  .defer(d3.csv, "risk_index.csv")
  .await(pageLoad);

var lkCol = {
  //varName: shortTitle, longTitle, agreeText, disagreeText
  expMar2015: ["Personally experienced the effects of global warming (Mar2015)", "who have personally experienced the effects of global warming", "Agree", "Disagree", "National average = 30 (Mar2015)"],
  expOct2014: ["Personally experienced the effects of global warming (Oct2014)", "who have personally experienced the effects of global warming", "Agree", "Disagree", "National average = 30 (Oct2014)"],
  expApr2014: ["Personally experienced the effects of global warming (Apr2014)", "who have personally experienced the effects of global warming", "Agree", "Disagree", "National average = 30 (Apr2014)"],
  expDec2013: ["Personally experienced the effects of global warming (Dec2013)", "who have personally experienced the effects of global warming", "Agree", "Disagree", "National average = 33 (Dec2013)"],
  expApr2013: ["Personally experienced the effects of global warming (Apr2013)", "who have personally experienced the effects of global warming", "Agree", "Disagree", "National average = 39 (Apr2013)"],
  expApr2012: ["Personally experienced the effects of global warming (Apr2012)", "who have personally experienced the effects of global warming", "Agree", "Disagree", "National average = 35 (Apr2012)"],
  expSep2012: ["Personally experienced the effects of global warming (Sep2012)", "who have personally experienced the effects of global warming", "Agree", "Disagree", "National average = 38 (Sep2012)"],
  expNov2011: ["Personally experienced the effects of global warming (Nov2011)", "who have personally experienced the effects of global warming", "Agree", "Disagree", "National average = 35 (Nov2011)"],
  expMay2011: ["Personally experienced the effects of global warming (May2011)", "who have personally experienced the effects of global warming", "Agree", "Disagree", "National average = 32 (May2011)"],
  expJun2010: ["Personally experienced the effects of global warming (Jun2010)", "who have personally experienced the effects of global warming", "Agree", "Disagree", "National average = 31 (Jun2010)"],
  expJan2010: ["Personally experienced the effects of global warming (Jan2010)", "who have personally experienced the effects of global warming", "Agree", "Disagree", "National average = 24 (Jan2010)"],
  expFall2008: ["Personally experienced the effects of global warming (Fall2008)", "who have personally experienced the effects of global warming", "Agree", "Disagree", "National average = 35 (Fall2008)"],
  heat_worry: [ 'Heat worry', 'Heat worry', 'Worried', 'Not worried', 'heat worry' ],
  flooding_worry: [ 'Flooding worry', 'Flooding worry', 'Worried', 'Not worried', 'flooding worry' ],
  wildfires_worry: [ 'Wildfires worry', 'Wildfires worry', 'Worried', 'Not worried', 'wildfires worry' ],
  hurricanes_worry: [
    'Hurricanes worry',
    'Hurricanes worry',
    'Worried',
    'Not worried',
    'hurricanes worry'
  ],
  drought_worry: [ 'Drought worry', 'Drought worry', 'Worried', 'Not worried', 'drought worry' ],
};

var lkStat = {
  cc_heat_rating: 'Heat Hazard Rating',
  cc_flood_rating: 'Flood Hazard Rating',
  cc_fire_rating: "Fire Hazard Rating",
  cc_fraction_with_storm_surge_risk: "Storm Surge Risk",
  cc_drought_rating: "Drought Hazard Rating"
};

var climGroups = [
  {
  name: "Hazards",
  values: [
    "cc_heat_rating","cc_flood_rating","cc_fire_rating","cc_fraction_with_storm_surge_risk","cc_drought_rating"
  ]}
];

var varGroups = [
  {
    name: "Hazards",
    values: [ 'heat_worry', 'flooding_worry', 'wildfires_worry', 'hurricanes_worry', 'drought_worry' ]
  }
  // {
  //   name: "Risk Perceptions",
  //   values: ["worried", "timing", "personal", "harmUS", "devharm", "futuregen"]
  // },
  // {
  //   name: "Policy Support",
  //   values: ["fundrenewables", "regulate", "CO2limits", "supportRPS"]
  // },
  // {
  //   name: "Six Americas",
  //   values: ["Alarmed", "Concerned", "Cautious", "Disengaged", "Doubtful", "Dismissive"]
  // }
];



var geoOpts = {
  "national": {
    "plural": "National",
    "singular": "National",
    "idLength": 0,
    "subState": false,
    "stroke": {
      "width": 1.25,
      "color": "black"
    }
  },
  "state": {
    "plural": "States",
    "singular": "State",
    "idLength": 2,
    "subState": false,
    "stroke": {
      "width": 0.75,
      "color": "black"
    }
  },
  "county": {
    "plural": "Counties",
    "singular": "County",
    "idLength": 5,
    "subState": true,
    "stroke": {
      "width": 0.25,
      "color": "gray"
    }
  }
};
//add in varnames to geoOpts objects
d3.keys(geoOpts).forEach(function(geo) {
  geoOpts[geo].varName = geo;
});

o.calcWidth = o.width - o.margins.left - o.margins.right;
o.map.calcHeight = o.map.height - o.margins.top - o.margins.bottom;
o.scatter.calcHeight = o.scatter.height - o.scatter.margins.top - o.scatter.margins.bottom;
o.scatter.calcWidth = o.calcWidth - o.scatter.margins.left - o.scatter.margins.right;

d3.selectAll("#document").style("width", o.width + "px");
d3.select("#main")
    .style("position", "relative")
    .style("height", o.map.height + "px")
  .append("div")
    .style({
      left: o.width / 2 + "px",
      top: o.map.height / 2 + "px",
      position: "absolute"
    })
    .attr("id", "loaderContainer");
var myLoader = loader({
  width: o.loaderSize,
  height: o.loaderSize,
  container: "#loaderContainer",
  id: "loader"
})();

d3.select("div.nav").style({
  width: o.navWidth + "px",
  left: 0,
  top: 0,
  position: "absolute",
  clear: "both"
});
d3.select("div.map").style({
  left: 0,
  top: 0,
  position: "absolute"
});
var scatter = d3.select("svg#scatter")
    .style({
      width: o.width + "px",
      height: o.scatter.height + "px"
    })
  .append("g").attr("class", "margins")
    .attr("transform", "translate(" + o.scatter.margins.left + "," + o.scatter.margins.top + ")");
var scatterTitle = scatter.append("text")
    .attr({
      class: "scatterTitle",
      x: o.scatter.calcWidth / 2,
      y: -o.scatter.margins.top,
      dy: "1.2em",
      "text-anchor": "middle"
    });
var scatterXLabel = scatter.append("text")
    .attr({
      class: "scatterXLabel",
      x: o.scatter.calcWidth / 2,
      y: o.scatter.calcHeight + o.scatter.margins.bottom,
      dy: "-.25em",
      "text-anchor": "middle"
    });
var scatterYLabel = scatter.append("text")
    .attr({
      class: "scatterYLabel",
      x: -o.scatter.margins.left,
      y: o.scatter.calcHeight / 2,
      dy: ".72em",
      transform: "rotate(-90," + -o.scatter.margins.left + "," + o.scatter.calcHeight / 2 + ")",
      "text-anchor": "middle"
    });
var r2Text = scatter.append("text")
    .attr({
      class: "r2Text",
      x: 3,
      y: 0,
      dy: ".72em"
    });
var countText = scatter.append("text")
    .attr({
      class: "countText",
      x: 3,
      y: o.scatter.calcHeight - 3
    });

var
  allData, geo, stateData,
  legends, legendLeft, legendRight,
  map, mapLeft, mapRight,
  shapeGroups, clickGroups,
  init = false,
  path = d3.geo.path().projection(null);

//function to run when all external data loads
function pageLoad(error, geography, perceptionData, changeData) {
  if (error) console.warn("ERROR loading data:", error);
  console.timeEnd("Load External Datasets & Shapefiles");
  console.group("Clean-up Data, Un-pack Geometries & Draw Geometry Paths");
  console.time("Clean-up Data, Un-pack Geometries & Draw Geometry Paths");

  d3.select("#loaderContainer").remove();
  geo = geography;
  // delete geography.objects.state;
  delete geography.objects.cbsa;
  delete geography.objects.cd;
  delete geography.objects.national;
  delete geography.objects.dma;
  delete geography.objects.rma;
  
  stateData = geography.objects.state?.geometries.map(function(g) {
    return {
      id: g.id,
      NAME: g.properties.NAME,
      ABBREV: g.properties.ABBREV
    };
  });
  if(stateData) stateData.sort(function(a, b) { return d3.ascending(a.NAME, b.NAME); })
  else stateData =[];

  //populate statistic drop-downs
  d3.select("#statSelect")
      .on("change", reColor)
    .selectAll("optgroup")
      .data(varGroups)
    .enter().append("optgroup")
      .attr("label", function(d) { return d.name; })
    .selectAll("option")
      .data(function(d) { return d.values; })
    .enter().append("option")
      .attr("value", String)
      .text(function(d) { return capFirst(lkCol[d][0]); });
  d3.select("#changeSelect")
      .on("change", reColor)
    .selectAll("optgroup")
      .data(climGroups)
      .enter().append("optgroup")
        .attr("label", function(d) { return d.name; })
      .selectAll("option")
        .data(function(d) { return d.values; })
    .enter().append("option")
      .attr("value", String)
      .text(function(d) { return capFirst(lkStat[d]); });
  d3.select("#stateSelect")
    .append("option")
      .attr("class", "default")
      .attr("value", "00")
      .text("Select a State");
  d3.select("#stateSelect")
    .selectAll("option")
      .data(stateData)
    .enter().append("option")
      .attr("value", function(d) { return d.id; })
      .text(function(d) { return d.NAME; });


  //filter to only county data
  allData = perceptionData.filter(function(d) { return d.GeoType.toLowerCase() === "county"; });

  //clean up csv datasets, etc.
  allData.forEach(function(d) {
    d.GeoType = d.GeoType.toLowerCase();
    //fix congressional district GeoType: "cd113" to "cd" for instance
    if (d.GeoType.indexOf("cd") > -1 && d.GeoType !== "cd") d.GeoType = "cd";
    //zero pad GEOIDs based on geoOpts definition
    d3.values(geoOpts).forEach(function(gt) {
      if (d.GeoType === gt.varName) {
        if (gt.idLength) d.GEOID = d3.format("0" + gt.idLength + "d")(+d.GEOID);
      }
    });
    d3.keys(d).forEach(function(k) {
      if (k !== "GeoType" && k !== "GEOID" && k !== "properties") {
        //coerce text values to numbers
        d[k] = +d[k];
      }
    });
    //merge in climate change data
    var mergeData = changeData.filter(function(m) {
      return d.GEOID === m.GEOID;
    })[0];

    d3.keys(mergeData).forEach(function(k) {
      if (k !== "GeoType" && k !== "GEOID" && k !== "properties") {
        //coerce text values to numbers
        d[k] = +mergeData[k];
      }
    });
  });

  //merge data with shapefile
  geography.objects.county.geometries.forEach(function(g) {
    var mergeData = allData.filter(function(m) {
      return m.GEOID === g.id;
    })[0];
    g.properties.data = mergeData;
  });


  //create state and national outline mesh
  var stateOutline = topojson.mesh(geography, geography.objects.state, function(a, b) { return a !== b; }),
      natOutline = topojson.mesh(geography, geography.objects.state, function(a, b) { return a === b; }),
      countyShapes = topojson.feature(geography, geography.objects.county).features;

  //add clickable rect for un-select behind all other content
  d3.select("#map").append("rect")
      .style("fill", "white")
      .attr({
        class: "unselectBox",
        width: o.width,
        height: o.map.height
      });

  //create global selection for map
  map = d3.select("#map")
      .attr("width", o.width + "px")
      .attr("height", o.map.height + "px");
  //switch left and right maps, so variable names will be .. off..!
  mapLeft = map.append("g")
      .attr("class", "geography left")
      .attr("transform", "translate(" + (o.margins.left + o.width * 0.43) + "," + o.margins.top + ")scale(0.65)");
  mapRight = map.append("g")
      .attr("class", "geography right")
      .attr("transform", "translate(" + (o.margins.left - 75) + "," + o.margins.top + ")scale(0.65)");

  console.time("Add All Geography Layers");

  //add geography paths & click paths
  var maps = d3.selectAll("g.geography.left, g.geography.right");
  maps.append("g").attr("class", "shapeLayers");
  maps.append("g").attr("class", "clickPaths");
  shapeGroups = d3.selectAll("svg g.shapeLayers");
  clickGroups = d3.selectAll("svg g.clickPaths");

  shapeGroups.append("g").attr("class", "county")
      .datum("county")
    .selectAll("path.shape.county")
      .data(countyShapes)
    .enter().append("path")
      .attr({
        "class": "shape county",
        "id": function(d) { return d.id; },
        "d": path
      })
      .style({
        "stroke": geoOpts.county.stroke.color,
        "stroke-width": geoOpts.county.stroke.width
      });
  clickGroups.append("g").attr("class", "county")
      .datum("county")
    .selectAll("path.click.county")
      .data(countyShapes)
    .enter().append("path")
      .attr({
        "class": "click county",
        "id": function(d) { return d.id; },
        "d": path
      })
      .style({
        "fill-opacity": 0
      })
    .on("mouseover", over)
    .on("mousemove", over)
    .on("mouseout", out);

  //add in state outline view
  var stateLines = maps.append("g").attr("class", "stateOutline")
    .append("path")
      .style({
        "fill": "none",
        "pointer-events": "none",
        "stroke": geoOpts.state.stroke.color
      })
      .attr("d", path(stateOutline));

  //add in national outline view
  var natLines = maps.append("g").attr("class", "natOutline")
    .append("path")
      .style({
        "fill": "none",
        "pointer-events": "none",
        "stroke": geoOpts.national.stroke.color
      })
      .attr("d", path(natOutline));

  //add legends
  //switching left and right, so variable names will be reversed!
  legendLeft = d3.select("#map").append("g")
      .attr("class", "legendLeft")
      .attr("transform", "translate(" +
        (3 * o.width / 4 - o.map.legend.width / 2) + "," +
        (o.map.height - o.map.legend.height - o.map.legend.bottomMargin) + ")");
  legendRight = d3.select("#map").append("g")
      .attr("class", "legendRight")
      .attr("transform", "translate(" +
        (o.width / 4 - o.map.legend.width / 2) + "," +
        (o.map.height - o.map.legend.height - o.map.legend.bottomMargin) + ")");

  legends = d3.selectAll("#map .legendLeft, #map .legendRight");
  legends.append("text")
      .attr({
        "class": "legendLeft",
        x: o.map.legend.width / 4,
        y: -5,
        "text-anchor": "middle"
      });
  legends.append("text")
      .attr({
        "class": "legendRight",
        x: 3 * o.map.legend.width / 4,
        y: -5,
        "text-anchor": "middle"
      });
  legends.append("text")
      .attr({
        "class": "legendNatVal",
        x: o.map.legend.width / 2,
        y: -5,
        "text-anchor": "middle"
      });

  console.timeEnd("Add All Geography Layers");

  console.groupEnd("Clean-up Data, Un-pack Geometries & Draw Geometry Paths");
  console.timeEnd("Clean-up Data, Un-pack Geometries & Draw Geometry Paths");

  init = true;
  reColor();
}//end pageLoad function

function reColor() {
  //console.info("reColor function...");
  var stat1 = d3.select("#statSelect").property("value"),
      stat2 = d3.select("#changeSelect").property("value");
      // stat3 = d3.select("#changeSelect").property("label"); //want another parameter to recognize the climate indicators group, but not working yet

  //update legend
  var c1 = d3.scale.threshold(),
      c2 = d3.scale.threshold(),
      titleTxt,
      scale1Dom = [],
      scale2Dom = [],
      val1Max, val2Max,
      val1Min, val2Min,
      legend1Format, legend2Format;

  //remove any existing legend filter
  unHighlight();

  clickGroups.selectAll(".click.county").on("click", highlightCounty);
  map.select(".unselectBox").on("click", unHighlight);
  d3.select("#stateSelect").on("change", function(d) { highlightState(d3.select(this).property("value")); });

  //define color scale domain for perception statistic display
  val1Max = 100;
  val1Min = 0;
  scale1Dom = d3.range(10, val1Max, 10);
  legend1Format = function(d) { return d3.format("%")(d / 100); };
  c1.domain(scale1Dom).range(o.colorScale.left);
  var leg1Data = c1.range().map(function(d) { return c1.invertExtent(d); }).reverse();

// if (stat3 === "Hotdrydays anomaly"){
  if (stat2 === "hotdrydays_anomalyFall2008" || stat2 === "hotdrydays_anomalyJan2010" || stat2 ===  "hotdrydays_anomalyJun2010"|| stat2 ===  "hotdrydays_anomalyMay2011"||
  stat2 ===  "hotdrydays_anomalyNov2011"|| stat2 ===  "hotdrydays_anomalyApr2012" || stat2 ===  "hotdrydays_anomalySep2012"|| stat2 === "hotdrydays_anomalyApr2013"||
  stat2 ===  "hotdrydays_anomalyDec2013"|| stat2 ===   "hotdrydays_anomalyApr2014"|| stat2 ===  "hotdrydays_anomalyOct2014"|| stat2 ===   "hotdrydays_anomalyMar2015") {
  val2Max = 24;
  val2Min = -24;
  scale2Dom = d3.range(-16, 20, 4);
  legend2Format = d3.format("+0.1f");
  c2.domain(scale2Dom).range(o.colorScale.hotdryday);
  var leg2Data = c2.range().map(function(d) { return c2.invertExtent(d); }).reverse();
}
else {
    val2Max = 1;
    val2Min = -1;
    scale2Dom = d3.range(-0.8, 1, 0.2);
    legend2Format = d3.format("+0.1f");
    c2.domain(scale2Dom).range(o.colorScale.right);
    var leg2Data = c2.range().map(function(d) { return c2.invertExtent(d); }).reverse();
  }


  //add in extrema for legend
  leg1Data[0][1] = val1Max;
  leg1Data[leg1Data.length - 1][0] = val1Min;
  leg2Data[0][1] = val2Max;
  leg2Data[leg2Data.length - 1][0] = -val2Max;
  var leg1X = d3.scale.ordinal()
        .domain(leg1Data.reverse())
        .rangeBands([0, o.map.legend.width], 0.0),
      leg2X = d3.scale.ordinal()
        .domain(leg2Data.reverse())
        .rangeBands([0, o.map.legend.width], 0.0);

  var leg1Groups = legendLeft.selectAll("g.legendGroup")
          .data(leg1Data.reverse(), String),
      leg2Groups = legendRight.selectAll("g.legendGroup")
          .data(leg2Data.reverse(), String);
  leg1Groups.exit().remove();
  leg2Groups.exit().remove();
  var leg1GroupEnter = leg1Groups.enter().append("g")
          .attr("class", "legendGroup left show"),
      leg2GroupEnter = leg2Groups.enter().append("g")
          .attr("class", "legendGroup right show");

  leg1GroupEnter.append("rect")
      .attr({
        "class": "legendRect left",
        y: 0,
        x: function(g) { return leg1X(g); },
        height: o.map.legend.height,
        width: leg1X.rangeBand()
      })
      .style("fill", function(g) {
        return g[0] === undefined ? c1.range()[0] : c1(g[0]);
      })
      .style("cursor", "pointer")
      .on("click", clickLegend);
  leg2GroupEnter.append("rect")
      .attr({
        "class": "legendRect right",
        y: 0,
        x: function(g) { return leg2X(g); },
        height: o.map.legend.height,
        width: leg2X.rangeBand()
      })
      .style("fill", function(g) {
        return g[0] === undefined ? c2.range()[0] : c2(g[0]);
      })
      .style("cursor", "pointer")
      .on("click", clickLegend);

  leg1GroupEnter.append("line")
      .attr({
        "class": "legendLine left",
        y1: 0,
        x1: function(g) { return leg1X(g) + leg1X.rangeBand(); },
        y2: o.map.legend.height + o.map.legend.tickLength,
        x2: function(g) { return leg1X(g) + leg1X.rangeBand(); }
      });
  leg2GroupEnter.append("line")
      .attr({
        "class": "legendLine right",
        y1: 0,
        x1: function(g) { return leg2X(g) + leg2X.rangeBand(); },
        y2: o.map.legend.height + o.map.legend.tickLength,
        x2: function(g) { return leg2X(g) + leg2X.rangeBand(); }
      });

  leg1GroupEnter.append("text")
      .attr({
        "class": "legendText left",
        "text-anchor": "middle",
        y: o.map.legend.height + o.map.legend.tickLength + 2,
        x: function(g) { return leg1X(g) + leg1X.rangeBand(); },
        dy: "0.72em"
      })
      .text(function(d) {
        return legend1Format(d[1]);
      });
  leg2GroupEnter.append("text")
      .attr({
        "class": "legendText right",
        "text-anchor": "middle",
        y: o.map.legend.height + o.map.legend.tickLength + 2,
        x: function(g) { return leg2X(g) + leg2X.rangeBand(); },
        dy: "0.72em"
      })
      .text(function(d) {
        return legend2Format(d[1]);
      });

  //add in legend extrema line and text
  legendLeft.selectAll(".extreme").remove();
  legendRight.selectAll(".extreme").remove();
  legendLeft.append("line")
      .attr({
        "class": "legendLine left extreme",
        y1: 0,
        x1: 0,
        y2: o.map.legend.height + o.map.legend.tickLength,
        x2: 0
      });
  legendRight.append("line")
      .attr({
        "class": "legendLine right extreme",
        y1: 0,
        x1: 0,
        y2: o.map.legend.height + o.map.legend.tickLength,
        x2: 0
      });

  legendLeft.append("text")
      .attr({
        "class": "legendText left extreme",
        "text-anchor": "middle",
        y: o.map.legend.height + o.map.legend.tickLength + 2,
        x: 0,
        dy: "0.72em"
      })
      .text(function(d) {
        return legend1Format(val1Min);
      });
  legendRight.append("text")
      .attr({
        "class": "legendText right extreme",
        "text-anchor": "middle",
        y: o.map.legend.height + o.map.legend.tickLength + 2,
        x: 0,
        dy: "0.72em"
      })
      .text(function(d) {
        return legend2Format(-val2Max);
      });

  //change map colors
  var t = d3.select("#map").transition().duration(o.t);
  t.selectAll(".left .shape")
      .style("fill", function(d) {
        var shapeData = d.properties.data;
        if(!shapeData){
          return "grey";
        }
        return shapeData && shapeData[stat1] ? c1(shapeData[stat1]) : "white";
      });
  t.selectAll(".right .shape")
      .style("fill", function(d) {
        var shapeData = d.properties.data;
        // return shapeData[stat2 + "_Slope"] ? c2(shapeData[stat2 + "_Slope"]) : "white";
        return shapeData && shapeData[stat2] ? c2(shapeData[stat2]) : "white";
      });

  //update scatterplot
  // var xExtent = d3.extent(allData.map(function(m) { return m[stat2 + "_Slope"]; })),
  var xExtent = d3.extent(allData.map(function(m) { return m[stat2]; })),
      yExtent = d3.extent(allData.map(function(m) { return m[stat1]; })),
      scX = d3.scale.linear()
        .domain(xExtent)
        .range([0, o.scatter.calcWidth])
        .nice(),
      scY = d3.scale.linear()
        .domain(yExtent)
        .range([o.scatter.calcHeight, 0])
        .nice(),
      scXAxis = d3.svg.axis()
        .scale(scX)
        .orient("bottom")
        .tickFormat(legend2Format),
      scYAxis = d3.svg.axis()
        .scale(scY)
        .orient("left")
        .tickFormat(legend1Format),
      scatterData = allData.map(function(m) {
        return {
          // x: m[stat2 + "_Slope"],
          x: m[stat2],
          y: m[stat1],
          GEOID: m.GEOID
        };
      }).filter(function(m) { return m.x && m.y; }),
      regLine = regression('linear', scatterData.map(function(m) { return [m.x, m.y]; })),
      regLeftPoint = [scX.domain()[0], scX.domain()[0] * regLine.equation[0] + regLine.equation[1]],
      regRightPoint = [scX.domain()[1], scX.domain()[1] * regLine.equation[0] + regLine.equation[1]],
      xmean = d3.mean(scatterData, function(d) { return d.x; }),
      xstd = d3.deviation(scatterData, function(d) { return d.x; }),
      ymean = d3.mean(scatterData, function(d) { return d.y; }),
      ystd = d3.deviation(scatterData, function(d) { return d.y; }),
      quadtree = d3.geom.quadtree()
        .extent([[xExtent[0], yExtent[0]], [xExtent[1], yExtent[1]]])
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        (scatterData),
      brush = d3.svg.brush()
        .x(scX)
        .y(scY)
        .on("brush", brushed);

  r2Text.text("To select counties, drag your cursor around points on the plot.");

  var scatterX = scatter.selectAll("g.x.axis").data([1]);
      scatterY = scatter.selectAll("g.y.axis").data([1]);
  scatterX.enter().append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(" + 0 + "," + o.scatter.calcHeight + ")")
      .call(scXAxis);
  scatterY.enter().append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + 0 + "," + 0 + ")")
      .call(scYAxis);
  scatterX.transition().duration(o.t).call(scXAxis);
  scatterY.transition().duration(o.t).call(scYAxis);

  var zeroLine = scatterX.selectAll("line.zeroLine").data([1]);
  zeroLine.enter().append("line")
      .attr({
        class: "zeroLine",
        x1: scX(0),
        y1: 0,
        x2: scX(0),
        y2: -o.scatter.calcHeight
      });
  zeroLine.transition().duration(o.t)
      .attr({
        x1: scX(0),
        x2: scX(0)
      });

  var regressionLine = scatter.selectAll("line.regressionLine").data([1]);
  regressionLine.enter().append("line")
      .attr({
        class: "regressionLine",
        x1: scX(regLeftPoint[0]),
        y1: scY(regLeftPoint[1]),
        x2: scX(regRightPoint[0]),
        y2: scY(regRightPoint[1])
      });
  regressionLine.transition().duration(o.t)
      .attr({
        x1: scX(regLeftPoint[0]),
        y1: scY(regLeftPoint[1]),
        x2: scX(regRightPoint[0]),
        y2: scY(regRightPoint[1])
      });

  var bgBoxData = [
    [0, scY(ymean + 2 * ystd), o.scatter.calcWidth, scY(ymean - 2 * ystd) - scY(ymean + 2 * ystd)],
    [0, scY(ymean + ystd), o.scatter.calcWidth, scY(ymean - ystd) - scY(ymean + ystd)],
    [scX(xmean - 2 * xstd), 0, scX(xmean + 2 * xstd) - scX(xmean - 2 * xstd), o.scatter.calcHeight],
    [scX(xmean - xstd), 0, scX(xmean + xstd) - scX(xmean - xstd), o.scatter.calcHeight]
  ],
  meanData = [
    [scX(xmean), 0, scX(xmean), o.scatter.calcHeight],
    [0, scY(ymean), o.scatter.calcWidth, scY(ymean)]
  ];

  var bgBoxes = scatter.selectAll("rect.bgBox").data(bgBoxData);
  bgBoxes.enter().append("rect")
      .attr({
        class: "bgBox",
        x: function(d) { return d[0]; },
        y: function(d) { return d[1]; },
        width: function(d) { return d[2]; },
        height: function(d) { return d[3]; }
      });
  bgBoxes.transition().duration(o.t)
      .attr({
        x: function(d) { return d[0]; },
        y: function(d) { return d[1]; },
        width: function(d) { return d[2]; },
        height: function(d) { return d[3]; }
      });

  var meanLines = scatter.selectAll("line.meanLine").data(meanData);
  meanLines.enter().append("line")
      .attr({
        class: "meanLine",
        x1: function(d) { return d[0]; },
        y1: function(d) { return d[1]; },
        x2: function(d) { return d[2]; },
        y2: function(d) { return d[3]; }
      });
  meanLines.transition().duration(o.t)
      .attr({
        x1: function(d) { return d[0]; },
        y1: function(d) { return d[1]; },
        x2: function(d) { return d[2]; },
        y2: function(d) { return d[3]; }
      });

  var scatterBrush = scatter.call(brush);

  var pointsGroup = scatter.selectAll("g.points").data([1]);
  pointsGroup.enter().append("g").attr("class", "points");
  var points = pointsGroup.selectAll("circle.point")
    .data(scatterData, function(d) { return d.GEOID; });
  points.enter().append("circle")
      .attr({
        class: "point",
        "pointer-events": "all",
        cx: function(d) { return scX(d.x); },
        cy: function(d) { return scY(d.y); },
        r: o.scatter.pointRadius
      })
      .on("mouseover", over)
      .on("mousemove", over)
      .on("mouseout", out)
      .on("click", highlightPoint);
  points.transition().duration(o.t)
      .attr({
        cx: function(d) { return scX(d.x); },
        cy: function(d) { return scY(d.y); }
      });
  points.exit().remove();

  scatterBrush.call(brush.event);

  //update title text
  var leftLabel = lkCol[stat1][4],
      rightLabel = lkStat[stat2] + " (" + o.startYear +")";
  legendLeft.select(".legendNatVal").text(leftLabel);
  legendRight.select(".legendNatVal").text(rightLabel);
  // scatterTitle.text("Each point represents one county.  Click & drag on chart, or click on map / legend to highlight counties.");
  scatterXLabel.text(rightLabel);
  scatterYLabel.text(leftLabel);

  function unHighlight() {
    map.selectAll("path.selectionOutline").remove();
    map.selectAll(".shape").classed("tempHide", false);
    updateCount(0);
    d3.select("#stateSelect").property("value", "00");
    if (points) {
      points.each(function(d) { d.selected = false; });
      points.classed("selected", false);
    }
    if (brush) {
      scatterBrush.call(brush.extent([[0,0],[0,0]])).call(brush.event);
    }
  }

  function brushed() {
    points.each(function(d) { d.selected = false; });
    if (brush.empty()) {
      highlightMap([]);
      map.selectAll("path.selectionOutline").remove();
      updateCount(0);
      return points.classed("selected", false).attr("pointer-events", "all");
    }
    points.attr("pointer-events", "none");
    var extent = brush.extent();
    searchScatter(quadtree, extent[0][0], extent[0][1], extent[1][0], extent[1][1]);
    points.classed("selected", function(d) { return d.selected; });
  }

  // Find the nodes within the specified rectangle.
  function searchScatter(quadtree, x0, y0, x3, y3) {
    var selectList = [];
    quadtree.visit(function(node, x1, y1, x2, y2) {
      var p = node.point;
      if (p && ((p.x >= x0) && (p.x < x3) && (p.y >= y0) && (p.y < y3))) {
        selectList.push(node.point.GEOID);
        p.selected = true;
      }
      else if (p) p.selected = false;
      return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
    });
    highlightMap(selectList);
  }

  function highlightMap(selectList) {
    if (selectList.length === 0) {
      map.selectAll("path.selectionOutline").remove();
      return map.selectAll(".shape").classed("tempHide", false);
    }
    var geoList = geo.objects.county.geometries.filter(function(d) {
      return selectList.indexOf(d.id) !== -1;
    });
    map.selectAll(".shape").classed("tempHide", function(d) {
      return selectList.indexOf(d.id) === -1;
    });
    var mergedGeo = topojson.merge(geo, geoList);

    var outline = shapeGroups.selectAll("path.selectionOutline").data([mergedGeo]);
    outline.enter().append("path").attr("class", "selectionOutline");
    outline.attr("d", path);
    updateCount(selectList.length);
  }

  function highlightCounty(shape) {
    unHighlight();
    var selPoint = points.filter(function(d) { return +d.GEOID === +shape.id; });
    selPoint.classed("selected", true).moveToFront();
    highlightMap([shape.id]);
  }

  function highlightPoint(point) {
    unHighlight();
    d3.select(this).classed("selected", true).moveToFront();
    highlightMap([point.GEOID]);
  }

  function highlightState(fipsState) {
    unHighlight();
    var selPoints = points.filter(function(d) { return d.GEOID.substring(0, 2) === fipsState; });
    selPoints.classed("selected", true).moveToFront();
    var countyIds = geo.objects.county.geometries
      .filter(function(d) { return d.id.substring(0, 2) === fipsState; })
      .map(function(d) { return d.id; });
    highlightMap(countyIds);
  }

  function updateCount(num) {
    if (num === 0) return countText.text("");
    else if (num === 1) return countText.text("1 county highlighted");
    else countText.text(d3.format(",f")(num) + " counties highlighted");
  }

  function clickLegend(d) {
    var newExtent;
    if (d3.select(this).classed("left")) {
      newExtent = [[scX.domain()[0], d[0]], [scX.domain()[1], d[1]]];
    }
    else if (d3.select(this).classed("right")) {
      newExtent = [[d[0], scY.domain()[0]], [d[1], scY.domain()[1]]];
    }
    scatterBrush
      .call(brush.extent(newExtent))
      .call(brush.event);
  }
}
function toFixedDecimal(x) {
  return Number.parseFloat(x).toFixed(2);
}
function over(shape) {
  var tooltip = d3.select("div#tooltip"),
      stat1 = d3.select("#statSelect").property("value"),
      stat2 = d3.select("#changeSelect").property("value");

  if (!shape.properties) {
    var oldData = shape;
    shape = geo.objects.county.geometries.filter(function(d) { return d.id === oldData.GEOID; })[0];
  }

  var myData = shape.properties.data;

  //update tooltip text
  tooltip.select("header").text(getName(shape));
  tooltip.select(".data1 .question").text(capFirst(lkCol[stat1][0]) + ": ");
  tooltip.select(".data2 .question").text(capFirst(lkStat[stat2]) + ": ");
  tooltip.select(".data1 .percent")
    .text(myData[stat1] ? toFixedDecimal(myData[stat1]) : "N/A");
  tooltip.select(".data2 .percent")
    .text(myData[stat2] ? toFixedDecimal(myData[stat2]) : "N/A");


  //change position of tooltip
  var tHeight = tooltip.property("offsetHeight"),
      tWidth = tooltip.property("offsetWidth"),
      tMargin = 25;

  var pointCoord = d3.mouse(d3.select("#main").node());
  var newLeft = pointCoord[0] - tWidth / 2;
  var newTop = pointCoord[1] + tMargin;

  // if (newLeft < 0) newLeft = 0;
  // if (newLeft > o.width - tWidth) newLeft = o.width - tWidth;
  // if (newTop < 0) newTop = 0;
  // var svgHeight = d3.select(this.parentNode.parentNode.parentNode).style("height");
  // if (newTop > svgHeight - tHeight) newTop = svgHeight - tHeight;

  tooltip
      .style("top", newTop + "px")
      .style("left", newLeft + "px")
      .style("opacity", 1);

  //highlight appropriate map areas and scatterplot point
  d3.selectAll("path.click").filter(function(d) { return d.id === shape.id; })
      .classed("hover", true);
  d3.selectAll("circle.point").filter(function(d) { return d.GEOID === shape.id; })
      .moveToFront()
      .classed("hover", true);

}

function out() {
  d3.select("div#tooltip").style("opacity", 0);
  d3.selectAll(".hover").classed("hover", false);
}

function capFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

d3.selection.prototype.moveToFront = function() {
  return this.each(function() {
    this.parentNode.appendChild(this);
  });
};

function getName(shape) {
  var baseName = shape.properties.NAME,
      stateId = shape.id.substring(0, 2),
      state = geo.objects.state.geometries.filter(function(d) { return d.id === stateId; })[0].properties.ABBREV;
  if (state) baseName += ", " + state;
  return baseName;
}

function sortShapes(a, b) {
  if (a.properties.ABBREV !== b.properties.ABBREV) {
    return d3.ascending(a.properties.ABBREV, b.properties.ABBREV);
  }
  else if (a.properties.data.GeoType === "cd") {
    return (+a.id.substring(2, 4)) - (+b.id.substring(2, 4));
  }
  else return d3.ascending(a.properties.NAME, b.properties.NAME);
}

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    vars[key] = value;
  });
  return vars;
}

//function to determine what color text to use
function textCol(hexcolor) {
  var r = parseInt(hexcolor.substr(1, 2), 16);
  var g = parseInt(hexcolor.substr(3, 2), 16);
  var b = parseInt(hexcolor.substr(5, 2), 16);
  var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
}

function loader(config) {
  return function() {
    var radius = Math.min(config.width, config.height) / 2;
    var tau = 2 * Math.PI;

    var arc = d3.svg.arc()
            .innerRadius(radius * 0.5)
            .outerRadius(radius * 0.9)
            .startAngle(0);

    var svg = d3.select(config.container).append("svg")
        .attr("id", config.id)
        .attr("width", config.width)
        .attr("height", config.height)
      .append("g")
        .attr("transform", "translate(" + config.width / 2 + "," + config.height / 2 + ")");

    svg.append("text")
        .attr({
          "text-anchor": "middle",
          dy: ".35em"
        })
        .text("Loading...");

    var background = svg.append("path")
            .datum({endAngle: 0.33 * tau})
            .style("fill", "#4D4D4D")
            .attr("d", arc)
            .call(spin, 1500);

    function spin(selection, duration) {
        selection.transition()
            .ease("linear")
            .duration(duration)
            .attrTween("transform", function() {
                return d3.interpolateString("rotate(0)", "rotate(360)");
            });

        setTimeout(function() { spin(selection, duration); }, duration);
    }

    function transitionFunction(path) {
        path.transition()
            .duration(7500)
            .attrTween("stroke-dasharray", tweenDash)
            .each("end", function() { d3.select(this).call(transition); });
    }
  };
}
