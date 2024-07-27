// Set up margins and dimensions
const margin = {top: 20, right: 30, bottom: 50, left: 60};
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Append SVG to the body and set up the chart area
const svg = d3.select("#scatterplot").append("svg")
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

// Define the color scale
const colorScale = d3.scaleOrdinal(d3.schemeCategory10); // Use D3 color schemes

// Define the tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Load the CSV data
d3.csv("data/mask_averages.csv").then(data => {
    // Parse the data
    data.forEach(d => {
        d.weightedAverage = +d.weightedAverage;
        d.cases = +d.cases.replace(/,/g, ''); // Remove commas in case numbers
        d.NEVER = +d.NEVER;
        d.RARELY = +d.RARELY;
        d.SOMETIMES = +d.SOMETIMES;
        d.FREQUENTLY = +d.FREQUENTLY;
        d.ALWAYS = +d.ALWAYS;
    });

    // Get the unique states for the color scale domain
    const states = Array.from(new Set(data.map(d => d.state)));
    colorScale.domain(states);

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

    // Function to update the scatterplot
    function updateScatterplot(selectedState) {
        // Filter data based on the selected state
        const filteredData = selectedState === "all" ? data : data.filter(d => d.state === selectedState);

        // Remove existing dots
        svg.selectAll(".dot").remove();

        // Append dots
        svg.selectAll(".dot")
            .data(filteredData)
          .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => xScale(d.cases))
            .attr("cy", d => yScale(d.weightedAverage))
            .attr("r", 5)
            .attr("fill", d => colorScale(d.state))
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`<strong>${d.county}, ${d.state}</strong><br>
                              Cases: ${d.cases}<br>
                              Weighted Avg: ${d.weightedAverage}<br>
                              NEVER: ${d.NEVER}<br>
                              RARELY: ${d.RARELY}<br>
                              SOMETIMES: ${d.SOMETIMES}<br>
                              FREQUENTLY: ${d.FREQUENTLY}<br>
                              ALWAYS: ${d.ALWAYS}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition().duration(500).style("opacity", 0);
            });
    }

    // Initialize scatterplot with all data
    updateScatterplot("all");

    // Handle dropdown change
    d3.select("#select-state").on("change", function() {
        const selectedState = d3.select(this).property("value");
        updateScatterplot(selectedState);
    });
});
