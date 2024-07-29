const width = 960;
const height = 600;

const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoAlbersUsa().scale(1000).translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

const stateFPtoName = {
    "01": "Alabama",
    "02": "Alaska",
    "04": "Arizona",
    "05": "Arkansas",
    "06": "California",
    "08": "Colorado",
    "09": "Connecticut",
    "10": "Delaware",
    "11": "District of Columbia",
    "12": "Florida",
    "13": "Georgia",
    "15": "Hawaii",
    "16": "Idaho",
    "17": "Illinois",
    "18": "Indiana",
    "19": "Iowa",
    "20": "Kansas",
    "21": "Kentucky",
    "22": "Louisiana",
    "23": "Maine",
    "24": "Maryland",
    "25": "Massachusetts",
    "26": "Michigan",
    "27": "Minnesota",
    "28": "Mississippi",
    "29": "Missouri",
    "30": "Montana",
    "31": "Nebraska",
    "32": "Nevada",
    "33": "New Hampshire",
    "34": "New Jersey",
    "35": "New Mexico",
    "36": "New York",
    "37": "North Carolina",
    "38": "North Dakota",
    "39": "Ohio",
    "40": "Oklahoma",
    "41": "Oregon",
    "42": "Pennsylvania",
    "44": "Rhode Island",
    "45": "South Carolina",
    "46": "South Dakota",
    "47": "Tennessee",
    "48": "Texas",
    "49": "Utah",
    "50": "Vermont",
    "51": "Virginia",
    "53": "Washington",
    "54": "West Virginia",
    "55": "Wisconsin",
    "56": "Wyoming"
};

Promise.all([
    d3.json("data/counties.geojson"),
    d3.csv("data/filtered_total_cases_deaths_per_county.csv")
]).then(([geojson, covidData]) => {
    console.log("GeoJSON data:", geojson.features.slice(0, 5));
    console.log("CSV data:", covidData.slice(0, 5));

    const covidByCounty = {};
    covidData.forEach(d => {
        const countyKey = `${d.county}, ${d.state}`;
        covidByCounty[countyKey] = { cases: +d.cases.replace(/,/g, ''), deaths: +d.deaths.replace(/,/g, '') };  // Adjust field names as needed
    });

    console.log("Processed COVID data:", covidByCounty);

    const stateColorScale = d3.scaleOrdinal(d3.schemeCategory10);
    
    const caseColorScale = d3.scaleQuantize()
        .domain([0, d3.max(covidData, d => +d.cases.replace(/,/g, ''))])
        .range(d3.schemeReds[9]);

    svg.selectAll(".county")
        .data(geojson.features)
        .enter().append("path")
        .attr("class", "county")
        .attr("d", path)
        .attr("fill", d => {
            const stateName = stateFPtoName[d.properties.STATEFP];
            const countyKey = `${d.properties.NAME}, ${stateName}`;
            return caseColorScale(covidByCounty[countyKey] ? covidByCounty[countyKey].cases : 0);
        })
        .attr("stroke", d => {
            const stateName = stateFPtoName[d.properties.STATEFP];
            return stateColorScale(stateName);
        })
        .on("mouseover", function(event, d) {
            console.log("Mouse over:", d);
            d3.select(this).attr("fill", "orange").attr("stroke-width", 1.5);
            const stateName = stateFPtoName[d.properties.STATEFP];
            const countyKey = `${d.properties.NAME}, ${stateName}`;
            const covidData = covidByCounty[countyKey];
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`${d.properties.NAME}, ${stateName}<br>Cases: ${covidData ? covidData.cases : "N/A"}<br>Deaths: ${covidData ? covidData.deaths : "N/A"}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(event, d) {
            const stateName = stateFPtoName[d.properties.STATEFP];
            const countyKey = `${d.properties.NAME}, ${stateName}`;
            d3.select(this).attr("fill", caseColorScale(covidByCounty[countyKey] ? covidByCounty[countyKey].cases : 0)).attr("stroke-width", 0.5);
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    console.log("Counties drawn.");
});