// Set up margins and dimensions
const margin = {top: 20, right: 30, bottom: 50, left: 60};
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;


// Append SVG to the body and set up the chart area
const svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

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

const stateSelect = d3.select("#select-state");
stateSelect.append("option").attr("value", "all").text("All States");
Object.values(stateFPtoName).forEach(stateName => {
    stateSelect.append("option")
        .attr("value", stateName)
        .text(stateName);
});

// Define the scales
const xScale = d3.scaleLinear().range([0, width]);
const yScale = d3.scaleLinear().range([height, 0]);

// Define the axes
const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale);

// Define the color scale
const colorScale = d3.scaleOrdinal(d3.schemeCategory10); // Use D3 color schemes

// Load the CSV data
d3.csv("mask_averages.csv").then(data => {
    // Parse the data
    data.forEach(d => {
        d.weightedAverage = +d.weightedAverage;
        d.cases = +d.cases.replace(/,/g, ''); // Remove commas in case numbers
    });

    // Get the unique states for the color scale domain
    const states = Array.from(new Set(data.map(d => d.state)));
    colorScale.domain(states);

    // Set domains for scales
    xScale.domain(d3.extent(data, d => d.cases)).nice();
    yScale.domain(d3.extent(data, d => d.weightedAverage)).nice();

    // Append axes
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
      .append("text")
        .attr("x", width)
        .attr("y", -10)
        .attr("fill", "#000")
        .attr("text-anchor", "end")
        .text("Cases");

    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
      .append("text")
        .attr("x", -margin.left)
        .attr("y", 15)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("transform", "rotate(-90)")
        .text("Weighted Average");

    // Append dots
    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.cases))
        .attr("cy", d => yScale(d.weightedAverage))
        .attr("r", 5)
        .attr("fill", d => colorScale(d.state))
        .append("title")
          .text(d => `${d.county}, ${d.state}`); // Tooltip with county and state
});
