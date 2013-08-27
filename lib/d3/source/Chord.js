enyo.kind({
    name: "d3.Chord",
    kind: "enyo.Control",
    classes: "d3 chord",
    published: {
        fileNodes: "",
        fileMatrix: "",
        label: ""
    },
    d3: {
        arc: "",
        layout: "",
        path: "",
        svg: "",
        chord: ""
    },
    rendered: function() {
        var kind = this;
        kind.inherited(arguments);

        var genRand = function(from,to) { return Math.floor(Math.random()*(to-from+1)+from); };
        
        var width = 720,
            height = 720,
            outerRadius = Math.min(width, height) / 2 - 10,
            innerRadius = outerRadius - 24;

        var formatPercent = d3.format(".1%");

        kind.d3.arc = d3.svg.arc()
                        .innerRadius(innerRadius)
                        .outerRadius(outerRadius);

        kind.d3.layout = d3.layout.chord()
                        .padding(.04)
                        .sortSubgroups(d3.descending)
                        .sortChords(d3.ascending);

        kind.d3.path = d3.svg.chord()
                        .radius(innerRadius);

        d3.select("#"+kind.id).append("h1").style("width",width).text(kind.label);
        kind.d3.svg = d3.select("#"+kind.id).append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .attr("id","svg"+kind.label)
                        .append("g")
                        .attr("id", "circle")
                        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        kind.d3.svg.append("circle")
            .attr("r", outerRadius);

        if (kind.fileNodes && kind.fileMatrix) {

            d3.csv(kind.fileNodes, function(nodes) {
                d3.json(kind.fileMatrix, function(matrix) {

                    // Compute the chord layout.
                    kind.d3.layout.matrix(matrix);

                    // Add a group per neighborhood.
                    var group = kind.d3.svg.selectAll(".group")
                                .data(kind.d3.layout.groups)
                                .enter().append("g")
                                .attr("class", "group");

                    // Add a mouseover title.
                    group.append("title").text(function(d, i) {
                        return nodes[i].name + ": " + Math.round(d.value) + " trasferimenti";
                    });

                    // Add the group arc.
                    var groupPath = group.append("path")
                                .attr("id", function(d, i) { return "group" + i; })
                                .attr("d", kind.d3.arc)
                                .style("fill", function(d, i) { return nodes[i].color; });

                    // Add a text label.
                    var groupText = group.append("text")
                                .attr("x", 6)
                                .attr("dy", 15);

                    groupText.append("textPath")
                                .attr("xlink:href", function(d, i) { return "#group" + i; })
                                .text(function(d, i) { return nodes[i].name; });

                    // Remove the labels that don't fit. :(
                    groupText.filter(function(d, i) { return groupPath[0][i].getTotalLength() / 2 - 16 < this.getComputedTextLength(); })
                                .remove();

                    // Add the chords.
                    kind.d3.chord = kind.d3.svg.selectAll(".chord")
                                .data(kind.d3.layout.chords)
                                .enter().append("path")
                                .attr("class", "chord")
                                .style("fill", function(d) { return colorbrewer.Pastel2['8'][genRand(0,7)]; /*nodes[d.source.index].color;*/ })
                                .attr("d", kind.d3.path);

                    // Add an elaborate mouseover title for each chord.
                    kind.d3.chord.append("title").text(function(d) {
                        return nodes[d.source.index].name
                                + " → " + nodes[d.target.index].name
                                + ": " + d.source.value
                                + "\n" + nodes[d.target.index].name
                                + " → " + nodes[d.source.index].name
                                + ": " + d.target.value;
                    });

                });
            });
        }
    }
});
