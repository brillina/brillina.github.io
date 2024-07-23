const width = 960;
const height = 600;

const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoAlbersUsa().scale(1000).translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

Promise.all([
    d3.json("/Users/baobao/Documents/CS416/brillina.github.io/counties.geojson"),
    d3.csv("/Users/baobao/Documents/CS416/DashboardProject/filtered_total_cases_deaths_per_county.csv")
]).then(([geojson, covidData]) => {
    const covidByCounty = {};
    covidData.forEach(d => {
        covidByCounty[d.county] = +d.cases;
    });

    const colorScale = d3.scaleQuantize()
        .domain([0, d3.max(covidData, d => +d.cases)])
        .range(d3.schemeReds[9]);

    svg.selectAll(".county")
        .data(geojson.features)
        .enter().append("path")
        .attr("class", "county")
        .attr("d", path)
        .attr("fill", d => colorScale(covidByCounty[d.properties.NAME] || 0))
        .on("mouseover", function(event, d) {
            d3.select(this).attr("stroke", "#000").attr("stroke-width", 1.5);
            // Add tooltip logic here if desired
        })
        .on("mouseout", function() {
            d3.select(this).attr("stroke", null);
        });
});
