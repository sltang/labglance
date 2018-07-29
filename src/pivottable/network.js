import React, { Component } from 'react';
import * as d3 from 'd3';
import './network.css'

class Network extends Component {

    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {
        const { width, height, graph } = this.props

        let simulation = d3.forceSimulation(graph.nodes)
            .force("link", d3.forceLink().id(function (d) { return d.id; }))
            .force("charge", d3.forceManyBody().strength(-4000))
            .force("center", d3.forceCenter(width / 2, height / 2));

        var link = d3.select('.links')
            .selectAll("line")
            .data(graph.links)
            .enter().append("line")
            .attr("stroke-width", function (d) { return Math.sqrt(d.value); })

        var node = d3.select('.nodes')
            .selectAll("circle")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("r", 6)

        var label = d3.select('.labels')
            .selectAll("text")
            .data(graph.nodes)
            .enter().append("text")
            .attr("class", "label")
            .text(function (d) { return d.name; });

        node.append("title")
            .text(function (d) { return d.id; });

        simulation
            .nodes(graph.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(graph.links);

        function ticked() {
            link
                .attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });

            node
                .attr("r", function (d) { return d.id === '1' ? 30 : 20 })
                .style("fill", "#d9d9d9")
                .style("stroke", "#969696")
                .style("stroke-width", "1px")
                .attr("cx", function (d) { return d.x + 6; })
                .attr("cy", function (d) { return d.y - 6; });

            label
                .attr("x", function (d) { return d.x; })
                .attr("y", function (d) { return d.y; })
                .style("font-size", "20px").style("fill", "#4393c3");
        }

    }

    render() {
        const { width, height } = this.props
        return (
            <svg width={width} height={height}>
                <g className="links">
                </g>
                <g className="nodes">
                </g>
                <g className="labels">
                </g>
            </svg>
        )
    }
}

export default Network