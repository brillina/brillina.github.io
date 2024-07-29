// script5.js

// Set up the SVG dimensions and map projection
const width = document.getElementById('map').offsetWidth;
const height = 500; // Adjust as needed

const svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale([width / 1.5]);

const path = d3.geoPath().projection(projection);

// Load the GeoJSON and CSV data
Promise.all([
    d3.json("data/us-states.json"),
    d3.csv("data/state_summary.csv")
]).then(([geojson, stateData]) => {
    // Process and merge data
    const stateDataMap = new Map(stateData.map(d => [d.State, { cases: +d.cases, population: +d.Population }]));

    // Set up color scale for cases
    const colorScale = d3.scaleSequential(d3.interpolateReds)
        .domain([0, d3.max(stateData, d => +d.cases)]);

    // Draw the map
    svg.selectAll("path")
        .data(geojson.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", d => {
            const data = stateDataMap.get(d.properties.name) || { cases: 0 };
            return colorScale(data.cases);
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .on("mouseover", (event, d) => {
            const data = stateDataMap.get(d.properties.name) || { cases: 0, population: 0 };
            d3.select("#tooltip")
                .style("opacity", 1)
                .html(`
                    <strong>${d.properties.name}</strong><br>
                    Cases: ${data.cases}<br>
                    Population: ${data.population}
                `);
        })
        .on("mouseout", () => {
            d3.select("#tooltip").style("opacity", 0);
        });

    // Add tooltip
    d3.select("body").append("div")
        .attr("id", "tooltip")
        .attr("class", "tooltip")
        .style("opacity", 0);

// Add a legend to the map
    const legend = svg.append("g")
        .attr("transform", "translate(20,20)");

    const legendScale = d3.scaleLinear()
        .domain([0, d3.max(stateData, d => +d.cases)])
        .range([0, 200]); // Adjust range to fit your legend width

    legend.selectAll("rect")
        .data(d3.range(0, d3.max(stateData, d => +d.cases), (d3.max(stateData, d => +d.cases) / 10)))
        .enter().append("rect")
        .attr("x", (d, i) => i * 20)
        .attr("y", 0)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", d => colorScale(d));

    legend.append("text")
        .attr("x", 0)
        .attr("y", 30)
        .text("Low Cases");

    legend.append("text")
        .attr("x", 180)
        .attr("y", 30)
        .text("High Cases");


}).catch(error => {
    console.error('Error loading data:', error);
});
