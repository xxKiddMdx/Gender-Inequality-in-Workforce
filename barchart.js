// @author Le Lyu -- file for creating the barchart that presents earning percentage
// grouped by high and low quartile and by men and women
/*globals d3*/
export default function barChart(container, data, state) {
  const margin = { top: 50, right: 20, bottom: 20, left: 50 };

  const width = 500 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

  d3.select(".area").remove();
  let svg = d3
    .select(".barchart")
    .append("svg")
    .attr("class", "area")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // create scales without domains
  let xScale = d3.scaleBand().range([0, width]).padding(0.5);

  let yScale = d3.scaleLinear().range([height, 0]).domain([0, 50]);

  // create axes and axis title containers

  svg.append("g").attr("class", "y-axis");
  // d3.select(".area").append("g").attr("class", "tooltip-area");

  svg
    .append("text")
    .attr("class", "title1")
    .attr("x", 115)
    .attr("y", -15)
    .attr("text-anchor", "middle");
  let yAxis = d3.axisLeft(yScale);

  svg.select(".y-axis").call(yAxis);
  let xAxis = d3.axisBottom().scale(xScale);
  // design: create the set scales. in the update function we only change the height of bars in the bar chart.
  let x = d3
    .scaleBand()
    .domain(["Bottom 50% (W)", "Bottom 50% (M)", "Top 50% (W)", "Top 50% (M)"])
    .range([0, width])
    .padding(0.5);

  let tooltip = d3
    .select(".tooltip_1")
    .style("position", "absolute")
    .style("opacity", 0.8)
    .attr("class", "tooltip_1")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");
  
      // let tooltip = d3.select('.tooltip_1')
      //   .style('opacity', 0)
      //   .attr("class", "tooltip")
      //   .style("background-color", "white")
      //   .style("border", "solid")
      //   .style("border-width", "1px")
      //   .style("border-radius", "1px")
      //   .style("padding", "1px");

  // state is the click event
  function update(data, state) {
    // data and state are succesfully loaded.
    let filter = data.filter((d) => d.State === state)[0];

    console.log("data:", filter);
    let array = Object.values(filter);
    array.shift();
    xScale.domain(array);

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickFormat((d) => d));
    const bars = svg.selectAll(".bar").data(array);
    // Implement the enter-update-exist sequence



       

    bars
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d))
      .attr("y", (d) => height)
      .attr("width", xScale.bandwidth())
      .on("mouseenter", (event, d) => {
        let pos = d3.pointer(event, window); // pos = [x,y]
        tooltip
          .style("opacity", 0.8)
          .html("Percentage: " + d3.format(",")(d) + "%")
          .style("left", pos[0] + "px")
          .style("top", pos[1] + "px");
      })
      .on("mouseleave", (event, d) => {
        tooltip.style("opacity", 0);
      })
      .merge(bars)
      .transition()
      .duration(1000)
      .attr("x", (d) => xScale(d))
      .attr("y", (d) => yScale(d))
      .attr("height", function (d) {
        return height - yScale(d);
      })
      .style("display", "block")
      .style("position", "fixed")
      .style("fill", "#3F72AF");

    bars.exit().remove();

    // svg.select(".title1").text("Gender Inequality at the Top and Bottom of the Labor Market");
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -120)
      .attr("y", -50)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Percentage");
    svg
      .append("text")
      .attr("x", width / 2 + 10)
      .attr("y", 0)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Gender Inequality at the Top and Bottom of the Labor Market");
    svg
      .append("text")
      .attr("x", width / 2 + 10)
      .attr("y", 20)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Seperated by Income");
  }
  update(data, state);
}
