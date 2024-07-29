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
    d3.json("path/to/us-states.json"), // Path to your GeoJSON file
    d3.csv("path/to/state_summary.csv") // Path to your aggregated data file
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

}).catch(error => {
    console.error('Error loading data:', error);
});
