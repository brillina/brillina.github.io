const margin = {top: 20, right: 30, bottom: 50, left: 60};
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;
const legendWidth = 150;

// Append SVG to the body and set up the chart area
const svg = d3.select("#scatterplot").append("svg")
    .attr("width", width + margin.left + margin.right + legendWidth)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Define the scales
const xScale = d3.scaleLinear().range([0, width]); // x-axis: SVI
const yScale = d3.scaleLinear().range([height, 0]); // y-axis: cases

// Define the axes
const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale);

// Define the color scale
const colorScale = d3.scaleOrdinal(d3.schemeCategory10); // Use D3 color schemes

// Define the tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Load the CSV data
d3.csv("data/SVI_2020_US_county.csv").then(data => {
    // Parse the data
    data.forEach(d => {
        d.FIPS = +d.FIPS.replace(/,/g, '');
        d.SVI = +d.SVI;
        d.cases = +d.cases.replace(/,/g, ''); // Remove commas in case numbers
    });

    // Get the unique states for the dropdown menu
    const states = Array.from(new Set(data.map(d => d.STATE)));

    // Populate the dropdown menu
    const stateSelect = d3.select("#select-state");
    stateSelect.append("option").attr("value", "all").text("All States");
    states.forEach(stateName => {
        stateSelect.append("option")
            .attr("value", stateName)
            .text(stateName);
    });

    // Set the domain for the color scale
    colorScale.domain(states);

    // Set domains for scales
    xScale.domain(d3.extent(data, d => d.SVI)).nice();
    yScale.domain(d3.extent(data, d => d.cases)).nice();

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
        .text("SVI");

    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
      .append("text")
        .attr("x", -margin.left)
        .attr("y", 15)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("transform", "rotate(-90)")
        .text("Cases");

    // Function to update the scatterplot
    function updateScatterplot(selectedState) {
        const hideZeroCases = d3.select("#hide-zero-cases").property("checked");
        const filteredData = selectedState === "all" ? data : data.filter(d => d.STATE === selectedState);
        const displayData = hideZeroCases ? filteredData.filter(d => d.cases > 0) : filteredData;

        svg.selectAll(".dot").remove();

        // Append dots
        svg.selectAll(".dot")
            .data(displayData)
          .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => xScale(d.SVI))
            .attr("cy", d => yScale(d.cases))
            .attr("r", 5)
            .attr("fill", d => colorScale(d.STATE))
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`<strong>${d.COUNTY}, ${d.STATE}</strong><br>
                              FIPS: ${d.FIPS}<br>
                              SVI: ${d.SVI}<br>
                              Cases: ${d.cases}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");

                // Increase the size and change color on hover
                const originalColor = d3.color(colorScale(d.STATE));
                const hoverColor = originalColor.brighter(1);
                d3.select(event.currentTarget)
                  .attr("r", 8)
                  .attr("fill", hoverColor)
                  .attr("stroke", "black")
                  .attr("stroke-width", 2);
            })
            .on("mouseout", (event, d) => {
                tooltip.transition().duration(500).style("opacity", 0);

                // Reset the size and color when mouse leaves
                d3.select(event.currentTarget)
                  .attr("r", 5)
                  .attr("fill", colorScale(d.STATE))
                  .attr("stroke", null)
                  .attr("stroke-width", null);
            });

        // Annotations for Los Angeles, CA and Kenedy, TX
        const mower = data.find(d => d.COUNTY === "Los Angeles" && d.STATE === "Minnesota");
        const kenedy = data.find(d => d.COUNTY === "Kenedy" && d.STATE === "Texas");

        if (mower) {
            svg.append("text")
                .attr("x", xScale(mower.SVI) + 10)
                .attr("y", yScale(mower.cases) - 30)
                .attr("class", "annotation")
                .text(`Los Angeles, CA`)
                .style("font-size", "12px")
                .style("fill", "black");

            svg.append("text")
                .attr("x", xScale(mower.SVI) + 10)
                .attr("y", yScale(mower.cases) - 15)
                .attr("class", "annotation")
                .text(`Cases: ${mower.cases}`)
                .style("font-size", "12px")
                .style("fill", "black");
        }

        if (kenedy) {
            svg.append("text")
                .attr("x", xScale(kenedy.SVI) + 10)
                .attr("y", yScale(kenedy.cases) - 30)
                .attr("class", "annotation")
                .text(`Kenedy, TX`)
                .style("font-size", "12px")
                .style("fill", "black");

            svg.append("text")
                .attr("x", xScale(kenedy.SVI) + 10)
                .attr("y", yScale(kenedy.cases) - 15)
                .attr("class", "annotation")
                .text(`Cases: ${kenedy.cases}`)
                .style("font-size", "12px")
                .style("fill", "black");
        }
    }

    // Initialize scatterplot with all data
    updateScatterplot("all");

    // Handle dropdown change
    d3.select("#select-state").on("change", function() {
        const selectedState = d3.select(this).property("value");
        updateScatterplot(selectedState);
    });

    // Handle checkbox change
    d3.select("#hide-zero-cases").on("change", function() {
        updateScatterplot(d3.select("#select-state").property("value"));
    });

    // Add legend container
    const legendContainer = d3.select("#scatterplot").append("div")
        .style("width", `${legendWidth}px`)
        .style("height", `${height}px`)
        .style("overflow-y", "scroll")
        .style("float", "right")
        .style("padding", "10px");

    legendContainer.append("div")
        .style("font-weight", "bold")
        .style("margin-bottom", "10px")
        .text("State Legend");

    // Add legend items
    const legend = legendContainer.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("div")
        .attr("class", "legend")
        .style("margin-bottom", "5px");

    legend.append("div")
        .style("width", "18px")
        .style("height", "18px")
        .style("background-color", d => colorScale(d))
        .style("display", "inline-block")
        .style("vertical-align", "middle");

    legend.append("span")
        .style("margin-left", "5px")
        .style("vertical-align", "middle")
        .text(d => d);
});
