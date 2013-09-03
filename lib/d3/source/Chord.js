enyo.kind({
    name: "d3.Chord",
    kind: "d3.Svg",
    classes: "chord",
    published: {
        fileNodes: "",
        fileMatrix: "",
        nodes: "",
        matrix: "",
        details: "",
        selectNodeOn: "mouseover", // ok
        onSelectNode: "onselectnode", // ok
        selectChordOn: "click", // ok
        onSelectChord: "onselectchord", // ok
        onNodeLabel: "onnodelabel", // ok
        onChordLabel: "onchordlabel",
    },
    d3: {
        arc: "",
        layout: "",
        path: "",
        chord: "",
        g: ""
    },
    rendered: function() {

        if (this.container.kind !== this.kind) {
            this.inherited(arguments);
        }
       
        this.draw();
    },
    draw: function() {

        var kind = this;
        var genRand = function(from,to) { return Math.floor(Math.random()*(to-from+1)+from); };
        
        var w = kind.getWidth(),
            h = kind.getHeight(),
            outerRadius = Math.min(w, h) / 2 - 10,
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

        kind.d3.g = kind.d3.svg
                        .append("g")
                        .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

        kind.d3.g.append("circle")
                        .attr("r", outerRadius);

        // Compute the chord layout.
        kind.d3.layout.matrix(kind.matrix);

        // Add a group per neighborhood.
        var group = kind.d3.g.selectAll(".group")
                        .data(kind.d3.layout.groups)
                        .enter().append("g")
                        .attr("class", "group")
                        .on(kind.selectNodeOn, function(d,i) {
                            return kind.oncontrol.call(kind,"onSelectNode",d,i);
                        });

        // Add a mouseover title.
        group.append("title").text(function(d,i) {
            return kind.oncontrol.call(kind,"onNodeLabel",d,i);
        });

        // Add the group arc.
        var groupPath = group.append("path")
                        .attr("id", function(d, i) { return "group" + i; })
                        .attr("d", kind.d3.arc)
                        .style("fill", function(d, i) { return kind.nodes[i].color; });

        // Add a text label.
        var groupText = group.append("text")
                        .attr("x", 6)
                        .attr("dy", 15);

        groupText.append("textPath")
                        .attr("xlink:href", function(d, i) { return "#group" + i; })
                        .text(function(d, i) { return kind.nodes[i].name; });

        // Remove the labels that don't fit. :(
        groupText.filter(function(d, i) { return groupPath[0][i].getTotalLength() / 2 - 16 < this.getComputedTextLength(); })
                        .remove();

        // Add the chords.
        kind.d3.chord = kind.d3.g.selectAll(".chord")
                        .data(kind.d3.layout.chords)
                        .enter().append("path")
                        .attr("class", "chord")
                        .style("fill", function(d) { return colorbrewer.Pastel2['8'][genRand(0,7)]; }) //kind.nodes[d.source.index].color;
                        .attr("d", kind.d3.path)
                        .on(kind.selectChordOn,function(d,i) {
                            return kind.oncontrol.call(kind,"onSelectChord",d,i);
                        });

        // Add an elaborate mouseover title for each chord.
        kind.d3.chord.append("title").text(function(d,i) {
            return kind.oncontrol.call(kind,"onChordLabel",d,i);
        });
    },
    oncontrol: function(c,d,i) { // Nome controllo, parametri
        if (typeof this.owner[this[c]] === "function") {
            return this.owner[this[c]].call(this,d,i);
        } else if (typeof this[this[c]] === "function") {
            return this[this[c]].call(this,d,i);
        } else {
            enyo.error("Funzione " + this[c] + " per " + c + " non riconosciuta!");
            return;
        }
    },
    onselectnode: function(d,i) {
        this.d3.chord.classed("fade", function(p) {
            return p.source.index != i && p.target.index != i;
        });
    },
    onselectchord: function(d,i) {
        var that = this;
        if (this.details) {
            var a = this.details.filter(function(obj) { 
                    if(obj.hasOwnProperty("source") && obj.hasOwnProperty("target")) {
                        return (
                                obj.source === that.nodes[d.source.index].name 
                                && obj.target === that.nodes[d.target.index].name
                            ) || (
                                obj.source === that.nodes[d.target.index].name 
                                && obj.target === that.nodes[d.source.index].name
                            );
                    } else {
                        return false;
                    }
            });
        }
        if (a.length > 0) { console.log(a); }
    },
    onnodelabel: function(d,i) {
        return this.nodes[i].name + ": " + Math.round(d.value) + " trasferimenti";
    },
    onchordlabel: function(d,i) {
        return this.nodes[d.source.index].name
                    + " → " + this.nodes[d.target.index].name
                    + ": " + d.source.value
                    + "\n" + this.nodes[d.target.index].name
                    + " → " + this.nodes[d.source.index].name
                    + ": " + d.target.value;
    }

});
