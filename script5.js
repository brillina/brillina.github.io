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

Promise.all([
    d3.json("data/us_states.json"), d3.csv("data/state_summary.csv")
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
            const state = stateData[d.properties.NAME];
            return state ? colorScale(state.cases) : "#ccc";
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", "1")
        .on("mouseover", (event, d) => {
            const state = stateData[d.properties.NAME];
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`<strong>${d.properties.NAME}</strong><br>
                          Population: ${state ? state.population : 'N/A'}<br>
                          Cases: ${state ? state.cases : 'N/A'}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
            
            d3.select(event.currentTarget)
                .attr("fill", "#0b1524")
                // .attr("stroke", "#000")
                // .attr("stroke-width", "2");
        })
        .on("mouseout", (event, d) => {
            tooltip.transition().duration(500).style("opacity", 0);
            
            d3.select(event.currentTarget)
                .attr("fill", d => {
                    const state = stateData[d.properties.NAME];
                    return state ? colorScale(state.cases) : "#ccc";
                })
                .attr("stroke", "#fff")
                .attr("stroke-width", "1");
        });
});
