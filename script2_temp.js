// Set up margins and dimensions
const margin = {top: 20, right: 30, bottom: 50, left: 60};
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Append SVG to the body and set up the chart area
const svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Define the scales
const xScale = d3.scaleLinear().range([0, width]);
const yScale = d3.scaleLinear().range([height, 0]);

// Define the axes
const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale);

// Load the CSV data
d3.csv("data/mask_averages.csv").then(data => {
    // Parse the data
    data.forEach(d => {
        d.weightedAverage = +d.weightedAverage;
        d.cases = +d.cases.replace(/,/g, ''); // Remove commas in case numbers
    });

    // Set domains for scales
    xScale.domain(d3.extent(data, d => d.cases)).nice();
    yScale.domain(d3.extent(data, d => d.weightedAverage)).nice();

    // Append axes
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
      .append("text")
        .attr("x", width)
        .attr("y", -10)
        .attr("fill", "#000")
        .attr("text-anchor", "end")
        .text("Cases");

    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
      .append("text")
        .attr("x", -margin.left)
        .attr("y", 15)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("transform", "rotate(-90)")
        .text("Weighted Average");

    // Append dots
    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.cases))
        .attr("cy", d => yScale(d.weightedAverage))
        .attr("r", 5)
        .append("title")
          .text(d => d.fips); // Tooltip with fips
});
