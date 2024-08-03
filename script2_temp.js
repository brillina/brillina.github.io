function updateScatterplot(selectedState) {
    const hideZeroCases = d3.select("#hide-zero-cases").property("checked");
    const filteredData = selectedState === "all" ? data : data.filter(d => d.state === selectedState);
    const displayData = hideZeroCases ? filteredData.filter(d => d.cases > 0) : filteredData;

    svg.selectAll(".dot").remove();

    svg.selectAll(".dot")
        .data(displayData)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.weightedAverage))
        .attr("cy", d => yScale(d.cases))
        .attr("r", 5)
        .attr("fill", d => colorScale(d.state))
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`<strong>${d.county}, ${d.state}</strong><br>
                          Cases: ${d.cases}<br>
                          Deaths: ${d.deaths}<br>
                          Weighted Avg: ${d.weightedAverage}<br>
                          NEVER: ${d.NEVER}<br>
                          RARELY: ${d.RARELY}<br>
                          SOMETIMES: ${d.SOMETIMES}<br>
                          FREQUENTLY: ${d.FREQUENTLY}<br>
                          ALWAYS: ${d.ALWAYS}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");

            const originalColor = d3.color(colorScale(d.state));
            const hoverColor = originalColor.brighter(2);
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
              .attr("fill", colorScale(d.state))
              .attr("stroke", null)
              .attr("stroke-width", null);
        });

    const mower = data.find(d => d.county === "Mower" && d.state === "Minnesota");
    const kenedy = data.find(d => d.county === "Kenedy" && d.state === "Texas");

    if (mower) {
        svg.append("text")
            .attr("x", xScale(mower.weightedAverage) + 10)
            .attr("y", yScale(mower.cases) - 30)
            .attr("class", "annotation")
            .text(`Mower, MN`)
            .style("font-size", "12px")
            .style("fill", "black");

        svg.append("text")
            .attr("x", xScale(mower.weightedAverage) + 10)
            .attr("y", yScale(mower.cases) - 15)
            .attr("class", "annotation")
            .text(`Mask: ${mower.NEVER + mower.RARELY + mower.SOMETIMES + mower.FREQUENTLY + mower.ALWAYS}`)
            .style("font-size", "12px")
            .style("fill", "black");

        svg.append("text")
            .attr("x", xScale(mower.weightedAverage) + 10)
            .attr("y", yScale(mower.cases))
            .attr("class", "annotation")
            .text(`Cases: ${mower.cases}`)
            .style("font-size", "12px")
            .style("fill", "black");
    }

    if (kenedy) {
        svg.append("text")
            .attr("x", xScale(kenedy.weightedAverage) + 20)
            .attr("y", yScale(kenedy.cases) - 30)
            .attr("class", "annotation")
            .text(`Kenedy, TX`)
            .style("font-size", "12px")
            .style("fill", "black");

        svg.append("text")
            .attr("x", xScale(kenedy.weightedAverage) + 20)
            .attr("y", yScale(kenedy.cases) - 15)
            .attr("class", "annotation")
            .text(`Mask: ${kenedy.NEVER + kenedy.RARELY + kenedy.SOMETIMES + kenedy.FREQUENTLY + kenedy.ALWAYS}`)
            .style("font-size", "12px")
            .style("fill", "black");

        svg.append("text")
            .attr("x", xScale(kenedy.weightedAverage) + 20)
            .attr("y", yScale(kenedy.cases))
            .attr("class", "annotation")
            .text(`Cases: ${kenedy.cases}`)
            .style("font-size", "12px")
            .style("fill", "black");
    }
}
