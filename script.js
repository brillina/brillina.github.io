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

// Create a tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Load the data
Promise.all([
    d3.json("data/counties.geojson"),  // GeoJSON file with county shapes
    d3.csv("data/filtered_total_cases_deaths_per_county.csv")
]).then(([geojson, covidData]) => {
    console.log("GeoJSON data:", geojson);
    console.log("CSV data:", covidData);

    // Process the COVID data
    const covidByCounty = {};
    covidData.forEach(d => {
        const countyKey = `${d.county}, ${d.state}`;
        covidByCounty[countyKey] = { cases: +d.cases, deaths: +d.deaths };  // Adjust field names as needed
    });

    console.log("Processed COVID data:", covidByCounty);

    // Create a color scale for the states
    const stateColorScale = d3.scaleOrdinal(d3.schemeCategory10);
    
    // Create a color scale for the cases
    const caseColorScale = d3.scaleQuantize()
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
            return caseColorScale(covidByCounty[countyKey] ? covidByCounty[countyKey].cases : 0);
        })
        .attr("stroke", d => stateColorScale(d.properties.STATE))
        .on("mouseover", function(event, d) {
            console.log("Mouse over:", d);
            d3.select(this).attr("fill", "orange").attr("stroke-width", 1.5);
            const countyKey = `${d.properties.NAME}, ${d.properties.STATE}`;
            const covidData = covidByCounty[countyKey];
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`${d.properties.NAME}, ${d.properties.STATE}<br>Cases: ${covidData ? covidData.cases : "N/A"}<br>Deaths: ${covidData ? covidData.deaths : "N/A"}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(event, d) {
            const countyKey = `${d.properties.NAME}, ${d.properties.STATE}`;
            d3.select(this).attr("fill", caseColorScale(covidByCounty[countyKey] ? covidByCounty[countyKey].cases : 0)).attr("stroke-width", 0.5);
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    console.log("Counties drawn.");
}).catch(error => {
    console.error("Error loading the data:", error);
});
