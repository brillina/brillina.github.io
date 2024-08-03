function updateScatterplot(selectedState) {
    const hideZeroCases = d3.select("#hide-zero-cases").property("checked");
    const filteredData = selectedState === "all" ? data : data.filter(d => d.STATE === selectedState);
    const displayData = hideZeroCases ? filteredData.filter(d => d.cases > 0) : filteredData;

    svg.selectAll(".dot").remove();

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

            d3.select(event.currentTarget)
              .attr("r", 5)
              .attr("fill", colorScale(d.STATE))
              .attr("stroke", null)
              .attr("stroke-width", null);
        });

    const mower = data.find(d => d.COUNTY === "Mower" && d.STATE === "Minnesota"); // Adjusted STATE
    const kenedy = data.find(d => d.COUNTY === "Kenedy" && d.STATE === "Texas");

    if (mower) {
        svg.append("text")
            .attr("x", xScale(mower.SVI) + 20) // Increased x value
            .attr("y", yScale(mower.cases) - 30)
            .attr("class", "annotation")
            .text(`Mower, MN`)
            .style("font-size", "12px")
            .style("fill", "black");

        svg.append("text")
            .attr("x", xScale(mower.SVI) + 20) // Increased x value
            .attr("y", yScale(mower.cases) - 15)
            .attr("class", "annotation")
            .text(`Cases: ${mower.cases}`)
            .style("font-size", "12px")
            .style("fill", "black");
    }

    if (kenedy) {
        svg.append("text")
            .attr("x", xScale(kenedy.SVI) + 20) // Increased x value
            .attr("y", yScale(kenedy.cases) - 30)
            .attr("class", "annotation")
            .text(`Kenedy, TX`)
            .style("font-size", "12px")
            .style("fill", "black");

        svg.append("text")
            .attr("x", xScale(kenedy.SVI) + 20) // Increased x value
            .attr("y", yScale(kenedy.cases) - 15)
            .attr("class", "annotation")
            .text(`Cases: ${kenedy.cases}`)
            .style("font-size", "12px")
            .style("fill", "black");
    }
}
