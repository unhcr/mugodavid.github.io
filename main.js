dc.config.defaultColors(d3.schemeCategory20c);
//Create the dc.js chart objects and link to div

var displaceTotalNumber = dc.numberDisplay("#dc-displace-total-number");

var displaceReasonChart = dc.rowChart("#dc-displace-reason-chart");

var prevRegionChart = dc.rowChart("#dc-prev-region-chart");
var currRegionChart = dc.rowChart("#dc-curr-region-chart");

var prevRegionMap = dc.geoChoroplethChart("#dc-prev-region-map");
var currRegionMap = dc.geoChoroplethChart("#dc-curr-region-map");

var prevDistrictMap = dc.geoChoroplethChart("#dc-prev-district-map");
var currDistrictMap = dc.geoChoroplethChart("#dc-curr-district-map");

var displaceMonthChart = dc.barChart("#dc-month-chart");

// Implement bookmarking chart filters status 
// Serializing filters values in URL
function getFiltersValues() {

    var filters = [
        { name: 'reason', value: displaceReasonChart.filters()},
        // { name: 'month', value: displaceMonthChart.filters()},
        { name: 'month', value: resetFilter(displaceMonthChart.filters())},
        { name: 'pregion', value: prevRegionChart.filters()},
        { name: 'pregionmap', value: prevRegionMap.filters()},
        { name: 'pdistrictmap', value: prevDistrictMap.filters()},
        { name: 'cregion', value: currRegionChart.filters()},
        { name: 'cregionmap', value: currRegionMap.filters()},
        { name: 'cdistrictmap', value: currDistrictMap.filters()}
    ];

    var recursiveEncoded = $.param( filters );
    location.hash = recursiveEncoded;

}        


function initFilters() {
  // Get hash values
  // var parseHash = /^#reason=([A-Za-z0-9,_\-\/\s]*)&month=([A-Za-z0-9,_\-\/\s]*)&pregion=([A-Za-z0-9,_\-\/\s]*)&pregionmap=([A-Za-z0-9,_\-\/\s]*)&pdistrictmap=([A-Za-z0-9,_\-\/\s]*)&cregion=([A-Za-z0-9,_\-\/\s]*)&cregionmap=([A-Za-z0-9,_\-\/\s]*)&cdistrictmap=([A-Za-z0-9,_\-\/\s]*)$/;
  // e.g. month="1987-12-24"
  var parseHash = /^#reason=([A-Za-z0-9,_\-\/\s]*)&month=([\d{4}-\d{2}-\d{2},\d{4}-\d{2}-\d{2}]*)&pregion=([A-Za-z0-9,_\-\/\s]*)&pregionmap=([A-Za-z0-9,_\-\/\s]*)&pdistrictmap=([A-Za-z0-9,_\-\/\s]*)&cregion=([A-Za-z0-9,_\-\/\s]*)&cregionmap=([A-Za-z0-9,_\-\/\s]*)&cdistrictmap=([A-Za-z0-9,_\-\/\s]*)$/;
  // var parseHash = /^#reason=([A-Za-z0-9,_\-\/\s]*)&month=([\S\s,\S\s]*)&pregion=([A-Za-z0-9,_\-\/\s]*)&pregionmap=([A-Za-z0-9,_\-\/\s]*)&pdistrictmap=([A-Za-z0-9,_\-\/\s]*)&cregion=([A-Za-z0-9,_\-\/\s]*)&cregionmap=([A-Za-z0-9,_\-\/\s]*)&cdistrictmap=([A-Za-z0-9,_\-\/\s]*)$/;
  var parsed = parseHash.exec(decodeURIComponent(location.hash));
  
  function filter(chart, rank) {  // for instance chart = sector_chart and rank in URL hash = 1
    // sector chart
    if (parsed[rank] == "") {
      chart.filter(null);
    } else if (rank == 2) {
      var filterValues = parsed[rank].split(",");
      
      var start = new Date(filterValues[0]);
      var end = new Date(filterValues[1]);
      
      // initialize date to midnight
      start.setHours(0,0,0,0);
      end.setHours(0,0,0,0);

      var filter = dc.filters.RangedFilter(start, dayOffset(end,1));              
      // var filter = dc.filters.RangedFilter(new Date(2017,2,1), new Date(2017,2,31));              
      chart.filter(filter);            
    } else {
      var filterValues = parsed[rank].split(",");
      for (var i = 0; i < filterValues.length; i++ ) {
          chart.filter(filterValues[i]);                
      }            
    }
  }

  if (parsed) {
    filter(displaceReasonChart, 1);
    filter(displaceMonthChart, 2);
    filter(prevRegionChart, 3);
    filter(prevRegionMap, 4);
    filter(prevDistrictMap, 5);
    filter(currRegionChart, 6);
    filter(currRegionMap, 7);
    filter(currDistrictMap, 8);
  }
}

var numberFormat = d3.format(",.0f");

var dateFormat = d3.timeFormat("%d %b %Y");

var monthNameFormat = d3.timeFormat("%b %Y");

var dateLongFormat = d3.timeFormat("%Y-%m-%d");

var monthBarTip = d3.tip()
      .attr('class', 'd3-month-tip')
      .offset([-5, 0])
      .html(function (d) { 
        // var months = d.data.key.split('-');
        // var date = new Date(months[0], months[1]-1, 1);
        var date = d.data.key;
        return "<div class='dc-tooltip'><span class='dc-tooltip-title'>" + monthNameFormat(date) + "</span> | <span class='dc-tooltip-value'>" + numberFormat(rndFig(d.y)) +"</span></div>";});

var barTip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-5, 0])
      .html(function (d) { return "<div class='dc-tooltip'><span class='dc-tooltip-title'>" + (d.key) + "</span> | <span class='dc-tooltip-value'>" + numberFormat(rndFig(d.value)) +"</span></div>";});

var mapTip = d3.tip()
      .attr('class', 'd3-map-tip')
      .offset([-5, 0])
      .html(function (d) { 
        var t = d3.select(this).select('title').html(); 
        var tA = t.split(':');
        return "<div class='dc-tooltip'><span class='dc-tooltip-title'>" + (tA[0]) + "</span> | <span class='dc-tooltip-value'>" + (tA[1]) +"</span></div>";});

// Correct end date due to month rounding off 
// by adding or deducting a day
var dayOffset = d3.timeDay.offset;

var monthOffset = d3.timeMonth.offset;

var resetFilter = function (filterValues){
  if (filterValues.length == 0) return filterValues;
  var start = filterValues[0][0];
  var end = dayOffset(filterValues[0][1],-1);
  var filter = dc.filters.RangedFilter(dateLongFormat(start), dateLongFormat(end)); 
  return filter;
}

// Load data from CSV file
d3.csv("data/PRMNDataset.csv", function (data){
  // Load data from JSON file
  d3.json("data/Som_Admbnda_Adm1_UNDP.json", function (regionJson) {
    d3.json("data/Som_Admbnda_Adm2_UNDP.json", function (districtJson) {
      // format our data
      data.forEach(function (d) {
        d.id = +d.id;
        d.lyear = +d.lyear;
        d.nmonth = +d.nmonth;
        d.tpeople = +d.tpeople;
        // d.yrmonthnum = +d.yrmonthnum;
      });

      // run the data thru crossfilter
      var facts = crossfilter(data);

      // create people dimension and group
      var peopleGroup = facts.groupAll().reduceSum(function (d) {
        return d.tpeople;
      });

      displaceTotalNumber
        .group(peopleGroup)
        .formatNumber(numberFormat)
        .transitionDuration(500)
        .valueAccessor(function (d) { return rndFig(d); });

      // configure displacement month dimension and group
      var displaceMonth = facts.dimension(function (d) {
        var months = d.monthend.split('\/');
        var date = new Date(months[2], months[1] - 1, months[0]);
        return d3.timeMonth(date);
      });
      var displaceMonthGroup = displaceMonth.group()
        .reduceSum(function (d) {
          return d.tpeople;
        });

      var keys = displaceMonthGroup.all().map(dc.pluck('key')).slice();

      // Configure displacement month bar chart parameters

      // Get minimum and maximum date
      var minDate = keys[0]; 
      var maxDate =  dayOffset(monthOffset(keys[keys.length -1],1));

      displaceMonthChart.height(160)
        .width($('#leftPanel').width())
        .margins({ top: 5, right:10, bottom: 60, left: 50 })
        .dimension(displaceMonth)
        .group(displaceMonthGroup, "Year-Month")
        .valueAccessor(function (d) {
          return d.value;
        })
        .gap(1)
        .barPadding(0.1)
        .outerPadding(0.05)
        // .centerBar(true)
        .ordinalColors(['#338EC9'])
        .renderHorizontalGridLines(true)
        .controlsUseVisibility(true)
        .round(d3.timeMonth.round) 
        .x(d3.scaleTime().domain([minDate, maxDate]))
        .xUnits(d3.timeMonths)
        .round(d3.timeMonth)
        .brushOn(true)
        .elasticY(true)
        .on("filtered", getFiltersValues)
        .title(function (d) {
          // return d3.format(",")(d.value);
          return '';
        })
        .yAxis().ticks(5);      

      displaceMonthChart.filterPrinter(function(filters){
        var s = "Period: ";  
        var start = filters[0][0];
        var end = dayOffset(filters[0][1],-1);    // correct month rounding off 
        s += dateFormat(start) + ' to ' + dateFormat(end);
        return s;        
      });

      displaceMonthChart.xAxis()
        .tickFormat(function (d) {
          return monthNameFormat(d);
        })
        .ticks(keys.length);

      // Rotate x-axis labels
      displaceMonthChart.on('renderlet', function (chart) {
        chart.selectAll('g.x text')
          .attr('transform', 'translate(-10,10) rotate(270)')
          .style('text-anchor', 'end')
          .transition()
          .duration(500)
          .style('opacity', 1);

        chart.selectAll('rect')
          .attr('data-tooltip', 'hello');

        chart.selectAll(".bar").call(monthBarTip);
        chart.selectAll(".bar").on('mouseover', monthBarTip.show)
          .on('mouseout', monthBarTip.hide);

      });


      // create displacement reason dimension and group
      var displaceReason = facts.dimension(function (d) {
        return d.creason;
      });
      var displaceReasonGroup = displaceReason.group().reduceSum(
        function (d) {
          return d.tpeople;
        }
      );

      // configure displacement reason chart parameters
      displaceReasonChart
        .width($('#leftPanel').width())
        .height(130)
        .margins({ top: 0, right: 10, bottom: 20, left: 10 })
        .dimension(displaceReason)
        .group(displaceReasonGroup)
        .valueAccessor(function (d) {
          return (d.value);
        })
        .ordering(function (d) { return -d.value; })
        .on("filtered", getFiltersValues)
        .controlsUseVisibility(true)
        // .colors(d3.scale.category20())
        // .colors('#4292c6')
        // .ordinalColors(['#F5C300','#66D1C1','#72879D','#338EC9'])
        .ordinalColors(['#f7941d', '#e7646a', '#a07b5e', '#c974a2'])
        .label(function (d) {
          return _.upperFirst(d.key);
        })
        .title(function (d) {
          // return _.upperFirst(d.key) + ": "
          //          + d3.format(",")(d.value);
          return '';
        })
        .elasticX(true)
        .xAxis().ticks(4);

      displaceReasonChart.on('renderlet', function (chart) {
        chart.selectAll(".row").call(barTip);
        chart.selectAll(".row").on('mouseover', barTip.show)
          .on('mouseout', barTip.hide);
      });

      // create previous region dimension and group
      var prevRegion = facts.dimension(function (d) {
        return d.pregion;
      });

      var prevRegionGroup = prevRegion.group().reduceSum(function (d) {
        return d.tpeople;
      });

      // configure previous region chart parameters
      prevRegionChart
        .width($('#dc-prev-region-chart').width())
        // .height($('.text-section').height()-50)
        .height(380)
        .margins({ top: 0, right: -13, bottom: 20, left: 10 })
        .dimension(prevRegion)
        .valueAccessor(function (d) { return d.value; })
        .group(prevRegionGroup)
        .ordering(function (d) { return -d.value; })
        .on("filtered", getFiltersValues)
        .controlsUseVisibility(true)
        // .colors(d3.scale.ordinal().range(colorbrewer.Set2[6]))
        .ordinalColors(['#F26E80'])
        .label(function (d) {
          return d.key;
        })
        .title(function (d) {
          // return d.key + ": " + d3.format(",")(d.value);
          return '';
        })
        // .x(d3.scale.linear().domain([0, 300000]))
        .elasticX(true)
        .xAxis().ticks(3)


      prevRegionChart.on('renderlet', function (chart) {
        chart.selectAll(".row").call(barTip);
        chart.selectAll(".row").on('mouseover', barTip.show)
          .on('mouseout', barTip.hide);
      });

      // create current region dimension and group
      var currRegion = facts.dimension(function (d) {
        return d.cregion;
      });

      var currRegionGroup = currRegion.group().reduceSum(function (d) {
        return d.tpeople;
      });

      // configure current region chart parameters
      currRegionChart
        .width($('#dc-curr-region-chart').width())
        // .height($('.text-section').height()-50)
        .height(380)
        .margins({ top: 0, right: 10, bottom: 20, left: 10 })
        .dimension(currRegion)
        .valueAccessor(function (d) { return d.value; })
        .group(currRegionGroup)
        .ordering(function (d) { return -d.value; })
        .on("filtered", getFiltersValues)
        .controlsUseVisibility(true)
        // .colors(d3.scale.ordinal().range(colorbrewer.Set2[6]))
        .colors('#338EC9')
        .label(function (d) {
          return d.key;
        })
        .title(function (d) {
          // return d.key + ": " + d3.format(",")(d.value);
          return '';
        })
        .elasticX(true)
        .xAxis().ticks(3);

      currRegionChart.on('renderlet', function (chart) {
        chart.selectAll(".row").call(barTip);
        chart.selectAll(".row").on('mouseover', barTip.show)
          .on('mouseout', barTip.hide);
      });


      // create map dimension and group
      var prevRegion = facts.dimension(function (d) {
        return d.pregion;
      });
      var prevRegionGroup = prevRegion.group().reduceSum(function (d) {
        return d.tpeople;
      });

      // Convert zipped shapefiles to GeoJSON with mapshaper (mapshaper.org).
      // Use d3.geoMercator projections and play around with the scale and 
      // translate method parameters to get the right fit for the map. 
      // The maximum value for colorDomain can be automatically calculated 
      // from the dataset.
      // colorAccessor returns a grey color for 0 or undefined data values. 
      // Remember to set the 'stroke' color for the admin1 borders to stand-out,
      // to increase thickness set 'stroke-width' to 2px or more. See 'style.css'.

      prevRegionMap
        .width($('#leftPanel').width())
        .height(380)
        .transitionDuration(1000)
        .dimension(prevRegion)
        .group(prevRegionGroup)
        .projection(d3.geoMercator()
          .scale(1490)
          .translate([-1030, 320])
        )
        .keyAccessor(function (d) { return d.key; })
        .valueAccessor(function (d) { return d.value; })
        .on("filtered", getFiltersValues)
        .controlsUseVisibility(true)
        .colors(d3.scaleQuantize().range(['#F9B7BF', '#F592A0', '#F26E80', '#EF4A60', '#B33848']))
        .colorDomain([0, prevRegionGroup.top(1)[0].value / 2])
        .colorCalculator(function (d) { return d ? prevRegionMap.colors()(d) : '#ccc'; })
        .overlayGeoJson(regionJson.features, "admin1Name", function (d) {
          return d.properties.admin1Name;
        })
        .title(function (d) {
          return d.key + ": " + d3.format(",")(rndFig(d.value));
          // return '';
        });
      
      prevRegionMap.on('renderlet', function (chart) {
        chart.selectAll(".admin1Name").call(mapTip);
        chart.selectAll(".admin1Name").on('mouseover', mapTip.show)
          .on('mouseout', mapTip.hide);
      });

      // create map dimension and group
      var prevDistrict = facts.dimension(function (d) {
        return d.pdistrict;
      });
      var prevDistrictGroup = prevDistrict.group().reduceSum(function (d) {
        return d.tpeople;
      });

      prevDistrictMap
      .width($('#leftPanel').width())
      .height(380)
      .transitionDuration(1000)
      .dimension(prevDistrict)
      .group(prevDistrictGroup)
      .projection(d3.geoMercator()
        .scale(1490)
        .translate([-1030, 320])
      )
      .keyAccessor(function (d) { return d.key; })
      .valueAccessor(function (d) { return d.value; })
      .on("filtered", getFiltersValues)
      .controlsUseVisibility(true)
      // .colors(['#ccc'].concat(colorbrewer.Blues[9])) 
      .colors(d3.scaleQuantize().range(['#F9B7BF', '#F592A0', '#F26E80', '#EF4A60', '#B33848']))
      .colorDomain([0, prevDistrictGroup.top(1)[0].value / 2])
      .colorCalculator(function (d) { return d ? prevDistrictMap.colors()(d) : '#ccc'; })
      .overlayGeoJson(districtJson.features, "admin2Name", function (d) {
        return d.properties.admin2Name;
      })
      .title(function (d) {
        return d.key + ": " + d3.format(",")(rndFig(d.value));
        // return '';
      });

      prevDistrictMap.on('renderlet', function (chart) {
        chart.selectAll(".admin2Name").call(mapTip);
        chart.selectAll(".admin2Name").on('mouseover', mapTip.show)
          .on('mouseout', mapTip.hide);
      });

      // create map dimension and group
      var currRegion = facts.dimension(function (d) {
        return d.cregion;
      });
      var currRegionGroup = currRegion.group().reduceSum(function (d) {
        return d.tpeople;
      });

      currRegionMap
        .width($('#leftPanel').width())
        .height(380)
        .transitionDuration(1000)
        .dimension(currRegion)
        .group(currRegionGroup)
        .projection(d3.geoMercator()
          .scale(1490)
          .translate([-1030, 320])
        )
        .keyAccessor(function (d) { return d.key; })
        .valueAccessor(function (d) { return d.value; })
        .on("filtered", getFiltersValues)
        .controlsUseVisibility(true)
        // .colors(['#ccc'].concat(colorbrewer.Blues[9])) 
        // .colors(["#CCC", '#E2F2FF','#C4E4FF','#9ED2FF','#81C5FF','#6BBAFF','#51AEFF','#36A2FF','#1E96FF','#0089FF','#0061B5'])
        .colors(d3.scaleQuantize().range(['#99C7E4', '#66AAD7', '#338EC9', '#0072BC', '#00568D']))
        .colorDomain([0, currRegionGroup.top(1)[0].value / 2])
        .colorCalculator(function (d) { return d ? currRegionMap.colors()(d) : '#ccc'; })
        .overlayGeoJson(regionJson.features, "admin1Name", function (d) {
          return d.properties.admin1Name;
        })
        .title(function (d) {
          return d.key + ": " + d3.format(",")(rndFig(d.value));
          // return '';
        });

      currRegionMap.on('renderlet', function (chart) {
        chart.selectAll(".admin1Name").call(mapTip);
        chart.selectAll(".admin1Name").on('mouseover', mapTip.show)
          .on('mouseout', mapTip.hide);
      });

      // create map dimension and group 
      var currDistrict = facts.dimension(function (d) {

        return d.cdistrict;
      });
      var currDistrictGroup = currDistrict.group().reduceSum(function (d) {
        return d.tpeople;
      });

      currDistrictMap
      .width($('#leftPanel').width())
      .height(380)
      .transitionDuration(1000)
      .dimension(currDistrict)
      .group(currDistrictGroup)
      .projection(d3.geoMercator()
        .scale(1490)
        .translate([-1030, 320])
      )
      .keyAccessor(function (d) { return d.key; })
      .valueAccessor(function (d) { return d.value; })
      .on("filtered", getFiltersValues)
      .controlsUseVisibility(true)
      // .colors(['#ccc'].concat(colorbrewer.Blues[9])) 
      .colors(d3.scaleQuantize().range(['#99C7E4', '#66AAD7', '#338EC9', '#0072BC', '#00568D']))
      .colorDomain([0, currDistrictGroup.top(1)[0].value / 2])
      .colorCalculator(function (d) { return d ? currDistrictMap.colors()(d) : '#ccc'; })
      .overlayGeoJson(districtJson.features, "admin2Name", function (d) {
        return d.properties.admin2Name;
      })
      .title(function (d) {
        return d.key + ": " + d3.format(",")(rndFig(d.value));
        // return '';
      });

      currDistrictMap.on('renderlet', function (chart) {
        chart.selectAll(".admin2Name").call(mapTip);
        chart.selectAll(".admin2Name").on('mouseover', mapTip.show)
          .on('mouseout', mapTip.hide);
      });


      

      // Render the charts
      dc.renderAll();

      initFilters();

      dc.redrawAll();

      setResizingSvg();


  });
  });
});

function setResizingSvg(){
      // set resizing viewbox
    // 
}

// Utilities
// var uri = "https://unhcr.github.io/dataviz-somalia-prmn/index.html#reason=&month=&pregion=&pregionmap=&cregion=&cregionmap=&@UNHCRSom";

// Utility to round figures
function rndFig(num) {
    // Excel function:
    //=IF(C9<100,C9,IF(AND(C9>=100,C9<1000),ROUND(C9,-1),IF(AND(C9>=1000,C9<10000),ROUND(C9,-2),IF(C9>=10000,ROUND(C9,-3),0))))
    //  var num = 767; 
    if (num == null){ // null == undefined
      res = 0;
    }    
    else if (num<=4) {
      res = num;
    }
    else if (num>4 && num<100) {
      res = Math.round(num/10)*10;
    } 
    else if (num>=100 && num<1000) {
      res = Math.round(num/100)*100;
    } 
    else if (num>=1000) {
      res = Math.round(num/1000)*1000;
    } 
    // else if (num>=10000) {
    //   res = Math.round(num/10000)*10000;
    // }

    return res;
}


