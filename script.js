/* globals d3, topojson */
import barChart from "/barchart.js";
import barChartPTJ from "/BarChartPTJ.js";

Promise.all([
  d3.json("states-10m.json"),
  d3.csv("data_comp.csv", d3.autoType),
  d3.csv("data_lelyu.csv", d3.autoType),
  d3.csv("Part_Time_Job.csv", d3.autoType),
]).then((data) => {
  let map = data[0];
  let states = data[1];
  let bar_data = data[2];
  let PTJ_data = data[3];
  states.splice(-4);

  // conver topojson to geojson, extract state info
  const features = topojson.feature(map, map.objects.states).features;

  const width = 600;
  const height = 500;

  // fit the geoJSON to the specified extent
  const projection = d3.geoAlbersUsa().fitExtent(
    [
      [0, 0],
      [width, height],
    ], // available screen space
    topojson.feature(map, map.objects.states) // geoJSON object
  );

  // create a geo path generator using the projection
  const path = d3.geoPath().projection(projection);

  // color scale using positive covid cases
  console.log(states)
  const color = d3
    .scaleSequential(d3.interpolateBlues)
    .domain(d3.extent(states, (d) => d.Percent_Labor_Force));

  const svg = d3
    .select(".main-map") //.main-map
    .append("svg")
    .attr("viewBox", [0, 0, width, height]); // set the viewport

  //tooltip
  const tooltip = svg
    .append("text")
    .attr("class", "tooltip")
    .attr("x", 30)
    .attr("y", 20);

  // fill paths
  svg
    .selectAll("path")
    .data(features) // geojson feature collection
    .join("path")
    .attr("d", (d) => path(d))
    .attr("fill", (d) => {
      const state = states.find((s) => s.State == d.properties.name);
      if (!state) return "black";
      return color(state.Percent_Labor_Force);
    })
    .attr("stroke", "white")
    .attr("stroke-linejoin", "round")
    .on("mouseenter", function (event, d) {
      //tooltip
      const [x, y] = d3.pointer(event, d);
      d3.select(".tooltip")
        .style("display", "block")
        .style("position", "fixed")
        .html("State: " + d.properties.name);
      d3.select(this).attr("opacity", 0.2);
    })
    .on("mouseleave", function (d) {
      d3.select(".tooltip").style("display", "none");
      d3.select(this).attr("opacity", 1);
    })
    .on("click", (event, d) => {
      // toggle selected based on d.key
      //call functions
      let state = d.properties.name;
      PieChart(state);
      // if (state.style.display === "none") {
      //   state.style.display = "block";
      // }
      // console.log(state);
      // Le: calling the barchart function based on click event.
      barChart(".barchart", bar_data, state);
      barChartPTJ(".barchartPTJ", PTJ_data, state);
      stateDisplay(".state", state);
    });

  // boundary paths using GeoJSON lines
  svg
    .append("path")
    .datum(topojson.mesh(map, map.objects.states)) // extract GeoJSON lines
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-linejoin", "round")
    .attr("d", path);

  //why boundary lines? when used with counties
  // https://observablehq.com/@d3/choropleth

  function stateDisplay(container, state) {
    console.log("hello");
    d3.select(".state_display").remove();

    let svg = d3
      .select(".state")
      .append("svg")
      .attr("class", "state_display")
      .attr("width", 200)
      .attr("height", 100)
      .append("g");

    svg
      .append("text")
      .attr("class", "state_display")
      .attr("x", 100)
      .attr("y", 20)
      .attr("text-anchor", "middle");

    svg.select(".state_display").text(state);

    // .attr("transform", `translate(${margin.left}, ${margin.top})`);
  }

  function findTotal(data) {
    const percents = data.map((d) => {
      let percent = 0;
      let lpercent = 0;
      let state = d.State;
      //console.log(state);
      const keys = Object.keys(d);
      keys.forEach((key, index) => {
        if (key != "Percent_Labor_Force") {
          let next = 1;
        } else {
          percent += d[key];
          lpercent += 1 - d[key];
        }
      });
      return { state, percent: percent, lpercent: lpercent };
    });
    return percents;
  }

  let data2 = findTotal(states);

  async function PieChart(statename) {
    d3.select(".p").remove();
    d3.select(".piechart").remove();
    d3.select(".legend").remove();

    let title = d3
      .select(".pietitle")
      .append("g")
      .attr("class", "p")
      .html("Percent of Women Employed in the Labor Force");

    let margin = { top: 20, right: 40, bottom: 0, left: 20 };
    let width = 300 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

    var outerRadius = width / 2;
    var innerRadius = 0;
    var arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
    function findpercent(n) {
      let found = data2.find((d) => d.state == n);
      //console.log(found);
      let arr = [];
      let p1 = found.percent;
      let p2 = found.lpercent;
      //console.log(p1);
      //console.log(p2);
      arr.push(p1);
      arr.push(p2);
      return arr;
    }

    let truedata = findpercent(statename);

    var pie = d3
      .selectAll(".piechart1")
      .append("svg")
      .attr("class", "piechart")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(" + 40 + "," + margin.top + ")");

    const color = d3
      .scaleOrdinal()
      .range(["#0075B4", "#70B5DC"])
      .domain(truedata);

    const piesort = d3.pie().sort(function (a, b) {
      return d3.ascending(a.key, b.key);
    });

    var tooltip_pie = d3
      .select(".tooltip_pie")
      .style("position", "absolute")
      .style("opacity", 0.8)
      .attr("class", "tooltip_pie")
      .style("background-color", "black")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px");

    function update(statename) {
      piesort.value(function (d) {
        return d;
      });

      //console.log(data.map((d) => d.percent));

      var arcs = pie
        .selectAll("g.arc")
        .data(piesort(truedata))
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr("transform", "translate(" + width / 2 + ", " + width / 2 + ")");

      arcs
        .selectAll("path")
        .data(piesort(truedata))
        .enter()
        .append("path")
        .attr("fill", function (d, i) {
          return color(i);
        })
        .attr("d", arc)
        .on("mousemove", function (event, d) {
          const pos = d3.pointer(event, window);
          tooltip_pie
            .html("Percentage: " + d3.format(".0%")(d.data))
            .style("left", pos[0] + "px")
            .style("top", pos[1] + "px")
            .style("display", "block");
        })
        .on("mouseleave", (event, d) => {
          return tooltip_pie.style("display", "none");
        });

      const legend = d3
        .selectAll(".container-item1")
        .append("svg")
        .attr("class", "legend");

      legend
        .selectAll(".container-item1")
        .data(truedata)
        .enter()
        .append("rect")
        .attr("y", (d, i) => 18 * i * 1.8 + 5)
        .attr("x", 45)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", (d, i) => color(i))
        .attr("stroke", "grey")
        .style("stroke-width", "1px");

      let arr = ["Women in the Labor Force", "Women not in the Labor Force"];

      legend
        .selectAll(".container-item1")
        .data(arr)
        .enter()
        .append("text")
        .text((d) => d)
        .attr("x", 18 * 1.2)
        .attr("y", (d, i) => 18 * i * 1.8)
        .style("font-family", "sans-serif")
        .style("font-size", `${16}px`)
        .attr("transform", `translate(${50},${20})`);
    }
    update(data2);
  }
});