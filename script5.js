const width = 960;
const height = 600;

// Append SVG to the map div
const svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

// Define the projection and path generator
const projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale([1000]);

const path = d3.geoPath().projection(projection);

// Define the tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Load and process the data
Promise.all([
    d3.json("data/us_states.json"), // GeoJSON file for US states
    d3.csv("data/state_summary.csv") // CSV file with state populations and cases
]).then(([us, data]) => {
    // Process CSV data
    const stateData = data.reduce((acc, d) => {
        acc[d.State] = { population: +d.Population, cases: +d.cases };
        return acc;
    }, {});

    // Define color scale
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(data, d => +d.cases)]);

    // Draw states
    svg.append("g")
        .attr("class", "states")
        .selectAll("path")
        .data(us.features)
        .enter().append("path")
        .attr("class", "state")
        .attr("d", path)
        .attr("fill", d => {
            const state = stateData[d.properties.NAME];
            return state ? colorScale(state.cases) : "#ccc";
        })
        .attr("stroke", "#fff") // Optional: Add stroke to outline states
        .attr("stroke-width", "1") // Optional: Define stroke width
        .on("mouseover", (event, d) => {
            const state = stateData[d.properties.NAME];
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`<strong>${d.properties.NAME}</strong><br>
                          Population: ${state ? state.population : 'N/A'}<br>
                          Cases: ${state ? state.cases : 'N/A'}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
            
            // Change the fill and stroke on hover
            d3.select(event.currentTarget)
                .attr("fill", "#0b1524") // Highlight color
                // .attr("stroke", "#000") // Highlight border color
                // .attr("stroke-width", "2"); // Highlight border width
        })
        .on("mouseout", (event, d) => {
            tooltip.transition().duration(500).style("opacity", 0);
            
            // Revert to original fill and stroke
            d3.select(event.currentTarget)
                .attr("fill", d => {
                    const state = stateData[d.properties.NAME];
                    return state ? colorScale(state.cases) : "#ccc";
                })
                .attr("stroke", "#fff") // Original border color
                .attr("stroke-width", "1"); // Original border width
        });
});
