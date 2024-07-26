const width = 960;
const height = 600;

const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const path = d3.geoPath();
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

const stateFPtoName = {
    "01": "Alabama", "02": "Alaska", "04": "Arizona", "05": "Arkansas", 
    "06": "California", "08": "Colorado", "09": "Connecticut", "10": "Delaware", 
    "11": "District of Columbia", "12": "Florida", "13": "Georgia", "15": "Hawaii", 
    "16": "Idaho", "17": "Illinois", "18": "Indiana", "19": "Iowa", "20": "Kansas", 
    "21": "Kentucky", "22": "Louisiana", "23": "Maine", "24": "Maryland", 
    "25": "Massachusetts", "26": "Michigan", "27": "Minnesota", "28": "Mississippi", 
    "29": "Missouri", "30": "Montana", "31": "Nebraska", "32": "Nevada", 
    "33": "New Hampshire", "34": "New Jersey", "35": "New Mexico", "36": "New York", 
    "37": "North Carolina", "38": "North Dakota", "39": "Ohio", "40": "Oklahoma", 
    "41": "Oregon", "42": "Pennsylvania", "44": "Rhode Island", "45": "South Carolina", 
    "46": "South Dakota", "47": "Tennessee", "48": "Texas", "49": "Utah", 
    "50": "Vermont", "51": "Virginia", "53": "Washington", "54": "West Virginia", 
    "55": "Wisconsin", "56": "Wyoming"
};

const caseColorScale = d3.scaleSequential(d3.interpolateReds).domain([0, 10000]);
const stateColorScale = d3.scaleOrdinal(d3.schemeCategory10);

Promise.all([
    d3.json("data/counties.geojson"),
    d3.csv("data/filtered_total_cases_deaths_per_county.csv"),
    d3.csv("data/mask_averages.csv")
]).then(([geojson, covidData, maskData]) => {
    console.log("GeoJSON Data:", geojson);
    console.log("COVID Data:", covidData);
    console.log("Mask Data:", maskData);

    const covidByCounty = {};
    covidData.forEach(d => {
        const countyKey = `${d.county}, ${d.state}`;
        covidByCounty[countyKey] = {
            cases: +d.cases.replace(/,/g, ''),
            deaths: +d.deaths.replace(/,/g, '')
        };
    });

    const maskByCounty = {};
    maskData.forEach(d => {
        const fips = d.fips.replace(/"/g, '').trim();  // Remove quotes and trim spaces
        maskByCounty[fips] = {
            weightedAverage: +d.weightedAverage
        };
    });

    const combinedData = {};
    geojson.features.forEach(feature => {
        const { properties } = feature;
        const stateFP = properties.STATEFP;
        const countyName = properties.NAME;
        const fips = properties.GEOID;

        if (!stateFP || !countyName || !fips) {
            console.error("Incomplete data for feature:", feature);
            return; // Skip this feature
        }

        const stateName = stateFPtoName[stateFP] || "Unknown State";
        const countyKey = `${countyName}, ${stateName}`;
        combinedData[fips] = {
            ...covidByCounty[countyKey],
            ...maskByCounty[fips]
        };
    });

    console.log("Combined Data:", combinedData);

    // Populate dropdown
    const stateSelect = d3.select("#select-state");
    stateSelect.append("option").attr("value", "all").text("All States");
    Object.values(stateFPtoName).forEach(stateName => {
        stateSelect.append("option")
            .attr("value", stateName)
            .text(stateName);
    });

    // Prepare scatterplot data
    const scatterplotData = Object.values(combinedData)
        .filter(d => d.cases !== undefined && d.weightedAverage !== undefined)
        .map(d => ({
            cases: d.cases,
            maskAverage: d.weightedAverage
        }));

    console.log("Scatterplot Data:", scatterplotData);

    if (scatterplotData.length === 0) {
        console.error("No data available for scatterplot.");
        return; // Exit if no data is available
    }

    // Set up scatterplot scales
    const svgScatter = d3.select("#scatterplot")
        .append("svg")
        .attr("width", 600)
        .attr("height", 400);

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(scatterplotData, d => d.cases) || 1])
        .range([40, 560]);  // Added padding for axes

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(scatterplotData, d => d.maskAverage) || 1])
        .range([360, 40]);  // Inverted range for y-axis

    // Create scatterplot
    svgScatter.selectAll("circle")
        .data(scatterplotData)
        .enter().append("circle")
        .attr("cx", d => xScale(d.cases))
        .attr("cy", d => yScale(d.maskAverage))
        .attr("r", 5)
        .attr("fill", "blue");

    // Add x-axis
    svgScatter.append("g")
        .attr("transform", "translate(0, 360)")
        .call(d3.axisBottom(xScale).tickFormat(d3.format(".0s")));

    // Add y-axis
    svgScatter.append("g")
        .attr("transform", "translate(40, 0)")
        .call(d3.axisLeft(yScale));

    // Add x-axis label
    svgScatter.append("text")
        .attr("class", "x axis-label")
        .attr("x", 300)
        .attr("y", 390)
        .attr("text-anchor", "middle")
        .text("Number of COVID-19 Cases");

    // Add y-axis label
    svgScatter.append("text")
        .attr("class", "y axis-label")
        .attr("x", -200)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Weighted Mask-Wearing Average");

    function updateMap(selectedState) {
        const filteredFeatures = selectedState === "all" 
            ? geojson.features 
            : geojson.features.filter(d => stateFPtoName[d.properties.STATEFP] === selectedState);

        svg.selectAll(".county")
            .data(filteredFeatures)
            .join("path")
            .attr("class", "county")
            .attr("d", path)
            .attr("fill", d => {
                const fips = d.properties.GEOID;
                return caseColorScale(combinedData[fips] ? combinedData[fips].cases : 0);
            })
            .attr("stroke", d => {
                const stateName = stateFPtoName[d.properties.STATEFP];
                return stateColorScale(stateName);
            })
            .on("mouseover", function(event, d) {
                d3.select(this).attr("fill", "orange").attr("stroke-width", 1.5);
                const fips = d.properties.GEOID;
                const covidData = combinedData[fips];
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`${d.properties.NAME}, ${stateFPtoName[d.properties.STATEFP]}<br>Cases: ${covidData ? covidData.cases : "N/A"}<br>Mask-Wearing: ${covidData ? covidData.weightedAverage : "N/A"}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                d3.select(this).attr("fill", d => {
                    const fips = d.properties.GEOID;
                    return caseColorScale(combinedData[fips] ? combinedData[fips].cases : 0);
                }).attr("stroke-width", 1);
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    }

    stateSelect.on("change", function() {
        const selectedState = d3.select(this).property("value");
        updateMap(selectedState);
    });

    updateMap("all");

}).catch(error => {
    console.error("Error loading the data:", error);
});
