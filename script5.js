const width = 960;
const height = 600;

const svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale([1000]);

const path = d3.geoPath().projection(projection);

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Load and process the data
Promise.all([
    d3.json("us-states.json"), // GeoJSON file for US states
    d3.csv("state_summary.csv") // CSV file with state populations and cases
]).then(([us, data]) => {
    const stateData = data.reduce((acc, d) => {
        acc[d.State] = { population: +d.Population, cases: +d.cases };
        return acc;
    }, {});

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(data, d => +d.cases)]);

    svg.append("g")
        .attr("class", "states")
        .selectAll("path")
        .data(us.features)
        .enter().append("path")
        .attr("class", "state")
        .attr("d", path)
        .attr("fill", d => {
            const state = stateData[d.properties.name];
            return state ? colorScale(state.cases) : "#ccc";
        })
        .on("mouseover", (event, d) => {
            const state = stateData[d.properties.name];
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`<strong>${d.properties.name}</strong><br>
                          Population: ${state ? state.population : 'N/A'}<br>
                          Cases: ${state ? state.cases : 'N/A'}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition().duration(500).style("opacity", 0);
        });
});
