
function createAvgBarChart(data, container){

  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 10, bottom: 70, left: 30},
    width  = 220 - margin.left - margin.right,
    height = 150 - margin.top - margin.bottom;


  // set the ranges
  var x = d3.scaleBand()
            .range([0, width])
            .padding(0.2);
  var y = d3.scaleLinear()
            .range([height, 0]);

  // append the svg object to the body of the page
  // append a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3.select(container).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // Scale the range of the data in the domains
  x.domain(data.map(function(d) { return d.q; }));
  y.domain([0, d3.max(data, function(d) { return +d.avg; })]);

  // append the rectangles for the bar chart
  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.q); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(+d.avg); })
      .attr("height", function(d) { return height - y(+d.avg); });

  // add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
         .tickValues(x.domain().filter(function(d,i){ return d.endsWith('Q1')}))
       )
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");


  // add the y Axis
  svg.append("g")
      .call(d3.axisLeft(y)
        .ticks(4));
}
