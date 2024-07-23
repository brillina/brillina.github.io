// Set up dimensions and margins
const width = 960;
const height = 600;

// Create an SVG container
const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Define a projection and path generator
const projection = d3.geoAlbersUsa().scale(1000).translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

// Load the data
Promise.all([
    d3.json("data/counties.geojson"),  // GeoJSON file with county shapes
    d3.csv("data/filtered_total_cases_deaths_per_county.csv")         // CSV file with COVID case counts
]).then(([geojson, covidData]) => {
    // Process the COVID data
    const covidByCounty = {};
    covidData.forEach(d => {
        const countyKey = `${d.county}, ${d.state}`;
        covidByCounty[countyKey] = +d.cases;  // Adjust field names as needed
    });

    // Create a color scale
    const colorScale = d3.scaleQuantize()
        .domain([0, d3.max(covidData, d => +d.cases)])
        .range(d3.schemeReds[9]);

    // Draw the counties
    svg.selectAll(".county")
        .data(geojson.features)
        .enter().append("path")
        .attr("class", "county")
        .attr("d", path)
        .attr("fill", d => {
            const countyKey = `${d.properties.NAME}, ${d.properties.STATE}`;
            return colorScale(covidByCounty[countyKey] || 0);  // Adjust property names as needed
        })
        .on("mouseover", function(event, d) {
            d3.select(this).attr("stroke", "#000").attr("stroke-width", 1.5);
            // Add tooltip logic here if desired
        })
        .on("mouseout", function() {
            d3.select(this).attr("stroke", null);
        });
});
