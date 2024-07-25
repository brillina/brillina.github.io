const width = 960;
const height = 600;
const scatterplotWidth = 600;
const scatterplotHeight = 400;

// Create SVG for the map
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

// Calculate weighted mask average
function calculateWeightedAverage(row) {
    return (row.NEVER * 0) + (row.RARELY * 1) + (row.SOMETIMES * 2) + (row.FREQUENTLY * 3) + (row.ALWAYS * 4);
}

// Load and process the data
Promise.all([
    d3.json("data/counties.geojson"),
    d3.csv("data/filtered_total_cases_deaths_per_county.csv"),
    d3.csv("data/mask_frequency.csv")
]).then(([geojson, covidData, maskData]) => {
    // Process the COVID data
    const covidByCounty = {};
    covidData.forEach(d => {
        const countyKey = `${d.county}, ${d.state}`;
        covidByCounty[countyKey] = { cases: +d.cases.replace(/,/g, ''), deaths: +d.deaths.replace(/,/g, '') };
    });

    // Process the mask data
    const maskByCounty = {};
    maskData.forEach(d => {
        const fips = d.fips.replace(/"/g, '');  // Remove quotes
        maskByCounty[fips] = {
            NEVER: +d.NEVER,
            RARELY: +d.RARELY,
            SOMETIMES: +d.SOMETIMES,
            FREQUENTLY: +d.FREQUENTLY,
            ALWAYS: +d.ALWAYS,
            weightedAverage: calculateWeightedAverage({
                NEVER: +d.NEVER,
                RARELY: +d.RARELY,
                SOMETIMES: +d.SOMETIMES,
                FREQUENTLY: +d.FREQUENTLY,
                ALWAYS: +d.ALWAYS
            })
        };
    });

    const combinedData = {};
    geojson.features.forEach(feature => {
        const { properties } = feature;
        if (!properties || !properties.NAME || !properties.STATEFP || !properties.GEOID) {
            console.error("Incomplete data for feature:", feature);
            return; // Skip this feature
        }
    
        const countyName = properties.NAME;
        const stateName = stateFPtoName[properties.STATEFP];
        const fips = properties.GEOID;
    
        if (!countyName || !stateName || !fips) {
            console.error("Incomplete data for feature:", feature);
            return; // Skip this feature
        }
    
        const countyKey = `${countyName}, ${stateName}`;
        combinedData[fips] = {
            ...covidByCounty[countyKey],
            ...maskByCounty[fips]
        };
    });
    
    
    console.log("Combined Data:", combinedData);


    const scatterplotData = Object.values(combinedData).map(d => ({
        cases: d.cases || 0, // Use fallback values
        maskAverage: d.weightedAverage || 0
    }));
    
    const scatterplotSvg = d3.select("#scatterplot").append("svg")
        .attr("width", 600)
        .attr("height", 400);
    
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(scatterplotData, d => d.cases) || 1])
        .range([0, 600]);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(scatterplotData, d => d.maskAverage) || 1])
        .range([400, 0]);
    
    scatterplotSvg.selectAll("circle")
        .data(scatterplotData)
        .enter().append("circle")
        .attr("cx", d => xScale(d.cases))
        .attr("cy", d => yScale(d.maskAverage))
        .attr("r", 5)
        .attr("fill", "blue");
    
    scatterplotSvg.append("g")
        .attr("transform", "translate(0, 400)")
        .call(d3.axisBottom(xScale).tickFormat(d3.format(".0s")));
    
    scatterplotSvg.append("g")
        .call(d3.axisLeft(yScale));
    
    




 // Function to update the map based on selected state
function updateMap(selectedState) {
    const filteredFeatures = selectedState === "all" 
        ? geojson.features 
        : geojson.features.filter(d => stateFPtoName[d.properties.STATEFP] === selectedState);

    // Ensure filteredFeatures is not empty
    if (filteredFeatures.length === 0) {
        console.error("No features found for selected state:", selectedState);
        return;
    }

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
            tooltip.html(`${d.properties.NAME}, ${stateFPtoName[d.properties.STATEFP]}<br>Cases: ${covidData ? covidData.cases : "N/A"}<br>Deaths: ${covidData ? covidData.deaths : "N/A"}<br>Mask Usage:<br>NEVER: ${covidData ? covidData.NEVER : "N/A"}<br>RARELY: ${covidData ? covidData.RARELY : "N/A"}<br>SOMETIMES: ${covidData ? covidData.SOMETIMES : "N/A"}<br>FREQUENTLY: ${covidData ? covidData.FREQUENTLY : "N/A"}<br>ALWAYS: ${covidData ? covidData.ALWAYS : "N/A"}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(event, d) {
            const fips = d.properties.GEOID;
            d3.select(this).attr("fill", caseColorScale(combinedData[fips] ? combinedData[fips].cases : 0)).attr("stroke-width", 0.5);
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
}

    updateMap("all");

    // Listen for changes in the dropdown
    d3.select("#select-state").on("change", function() {
        const selectedState = d3.select(this).property("value");
        updateMap(selectedState);
    });
}).catch(error => {
    console.error("Error loading the data:", error);
});

// Ensure the script loads after the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Populate state dropdown
    const stateSelect = d3.select("#select-state");
    Object.values(stateFPtoName).forEach(stateName => {
        stateSelect.append("option")
            .attr("value", stateName)
            .text(stateName);
    });
});
