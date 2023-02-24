// @author Le Lyu -- file for creating the barchart that presents earning percentage
// grouped by part time job percentage and by men and women
/*globals d3*/
export default function barcmahartPTJ(container, data, state) {
  const margin = { top: 50, right: 20, bottom: 20, left: 50 };

  const width = 500 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

  d3.select(".areaPTJ").remove();
  let svg = d3
    .select(".BarchartPTJ")
    .append("svg")
    .attr("class", "areaPTJ")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // create scales without domains
  let xScale = d3.scaleBand().range([0, width]).padding(1);

  let yScale = d3.scaleLinear().domain([0, 0.5]).range([height, 0]);

  // create axes and axis title containers

  svg.append("g").attr("class", "y-axis");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -120)
    .attr("y", -50)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Part Time Job Percentage");

  let yAxis = d3.axisLeft(yScale);
  const xAxis = d3.axisBottom().scale(xScale);

  svg.select(".y-axis").call(yAxis);

  var x = d3
    .scaleBand()
    .domain(["Women", "Men"]) // This is what is written on the Axis: from 0 to 100
    .range([0, width])
    .padding(1); // Note it is reversed

  // design: create the set scales. in the update function we only change the height of bars in the bar chart.

  // state is the click event
  var tooltip = d3
    .select(".tooltip_2")
  .style("position", "absolute")
    .style("opacity", 0.8)
    .attr("class", "tooltip_2")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");

  const bars = svg.selectAll(".bar");

  function update(data, state) {
    // data and state are succesfully loaded.
    let filter = data.filter((d) => d.State === state)[0];
    let array = Object.values(filter);
    array.shift();
    xScale.domain(array);
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(
        d3.axisBottom(x).tickFormat(function (d) {
          return d;
        })
      );
    svg
      .append("text")
      .attr("x", width / 2 + 10)
      .attr("y", 0)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Percent of Men and Women Working Part-Time by State");

    const bars = svg.selectAll(".bar").data(array);
    // Implement the enter-update-exist sequence

    bars
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d) - 30)
      .attr("y", height)
      .attr("width", 60)
      .on("mousemove", (event, d) => {
        const pos = d3.pointer(event, window);
        console.log(d);// pos = [x,y]
        tooltip
          .html("Percentage: " + d3.format(".1%")(d))
          .style("left", pos[0] + "px")
          .style("top", pos[1] + "px")
          .style("display", "block");
      })
      .on("mouseleave", (event, d) => {
        tooltip.style("display", "none");
      })
      .merge(bars)
      .transition()
      .duration(1000)
      .attr("x", (d) => xScale(d) - 30)
      .attr("y", (d) => yScale(d))
      .attr("height", function (d) {
        console.log(height - yScale(d));
        return height - yScale(d);
      })
      .style("fill", "#3F72AF");
    bars.exit().remove();
  }
  update(data, state);
}
