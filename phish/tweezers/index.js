function tooltipHtml(node) {
    return "<p>" + node.name + "</p>" +
	"<p>" + node.date + "</p>" +
	"<p>" + node.venue + "</p>";
}

function showLinkTooltip(d) {
    tooltip
	.html(tooltipHtml(nodesById[d.source]) + "<hr/>" + tooltipHtml(nodesById[d.target]))
	.style("text-align", "left")
	.style("height", "400px")
        .style("left", d3.event.pageX + 20 + "px")
        .style("top", d3.event.pageY - 15 + "px");
    tooltip
	.transition()
        .duration(200)
        .style("opacity", 1);
}

function showNodeToolTip(d) {
    tooltip
	.html(tooltipHtml(d))
	.style("text-align", "right")
	.style("height", "200px")
        .style("left", d3.event.pageX - 240 + "px")
        .style("top", d3.event.pageY - 15 + "px");
    tooltip
	.transition()
        .duration(200)
        .style("opacity", 1);
}

function hideToolTip() {
    tooltip
	.transition()
        .duration(200)
        .style("opacity", 0);
}

var timeParse = d3.timeParse("%Y-%m-%d");

var stretch = 10;

var width = window.innerWidth - 20,
    height = (window.innerHeight - 10) * stretch;

var start = Date.parse(graph.nodes[0].date);
var end = Date.parse(graph.nodes[graph.nodes.length-1].date);
var y = d3
    .scalePoint()
    .domain(graph.nodes.map(function(n) { return n.id; }))
    .range([0, height * 3]);

var years = {}
var year = timeParse(graph.nodes[0].date).getFullYear();
years[year] = y(graph.nodes[0].id);
graph.nodes.forEach(function(node){
    nodeYear = timeParse(node.date).getFullYear();
    if(nodeYear > year) {
	year = nodeYear;
	years[year] = y(node.id);
    }
});

var nodesById = {};
graph.nodes.forEach(function(node) {
    nodesById[node.id] = node;
});

var activeNode = null;
var activeLink = null;

var color = d3
    .scaleOrdinal()
    .domain(graph.nodes.map(function(n) { return n.category; }))
    .range(d3.schemeCategory10);

var tooltip = d3
    .select("body")
    .append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

var svg = d3
    .select("#viz")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(d3.zoom().on("zoom", function () {
       svg.attr("transform", d3.event.transform)
    }))
    .append("g");

var links = svg
    .selectAll("links")
    .data(graph.links)
    .enter()
    .append('path')
    .attr('d', function (d) {
	start = y(d.source);    // X position of start node on the X axis
	end = y(d.target);      // X position of end node
	return ['M', 400, start,    // the arc starts at the coordinate x=30, y=height (where the starting node is)
		'A',                            // This means we're gonna build an elliptical arc
		(start - end)/2, ',',    // Next 2 lines are the coordinates of the inflexion point. Width of this point is proportional with start - end distance
		(start - end)/2, 0, 0, ',',
		1, 400, ',', end] // We always want the arc on the right so put a 1 here.
            .join(' ');
    })
    .attr("stroke", function(d) { return color(nodesById[d.source].category); })
    .style("fill", "none")
    .style("stroke-width", 10)
    .style("cursor", "pointer")
    .on("click", function(d) {
	if(activeLink == d.source) {
	    activeLink = null;
	    hideToolTip();
	} else {
	    activeLink = d.source;
	    showLinkTooltip(d);
	}
    })
    .on("mouseover", function(d) {
	showLinkTooltip(d);
    })					
    .on("mouseout", function(d) {
	if(!activeLink) {
	    hideToolTip();
	}
    });

var nodes = svg
    .selectAll("nodes")
    .data(graph.nodes)
    .enter()
    .append("circle")
    .attr("cx", 400)
    .attr("cy", function(d){ return y(d.id); })
    .attr("r", 15)
    .attr("stroke", "white")
    .style("fill", function(d) { return color(d.category); })
    .style("cursor", "pointer")
    .on("click", function(d) {
	if(activeNode == d.id) {
	    activeNode = null;
	    hideToolTip();
	} else {
	    activeNode = d.id;
	    showNodeToolTip(d);
	}
    })
    .on("mouseover", function(d) {
	showNodeToolTip(d);
    })					
    .on("mouseout", function(d) {
	if(!activeNode){
	    hideToolTip();
	}
    });

var labels = svg
    .selectAll("labels")
    .data([1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2003, 2004, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020])
    .enter()
    .append("text")
    .attr("x", 0)
    .attr("y", function(d) { return years[d] + 50})
    .style("text-anchor", "end")
    .style("font", "144px sans-serif")
    .text(function(d) { return d; });
