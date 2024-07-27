// Set up margins and dimensions
const margin = {top: 20, right: 30, bottom: 30, left: 40};
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
d3.csv('data/mask_averages.csv').then(data => {
    // Parse the data
    data.forEach(d => {
        d.weightedAverage = +d.weightedAverage;
        d.cases = +d.cases.replace(/,/g, ''); // Remove commas in case numbers
    });

    // Set domains for scales
    xScale.domain(d3.extent(data, d => d.weightedAverage)).nice();
    yScale.domain(d3.extent(data, d => d.cases)).nice();

    // Append axes
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

    // Append dots
    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.weightedAverage))
        .attr("cy", d => yScale(d.cases))
        .attr("r", 5)
        .append("title")
          .text(d => d.fips); // Tooltip with fips
});
