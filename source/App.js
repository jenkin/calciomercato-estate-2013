enyo.kind({
	name: "App",
	kind: "FittableRows",
	fit: true,
    published: {
        data: "",
        currentTeam: ""
    },
	components:[
		{kind: "onyx.Toolbar", content: "Calcio Mercato Estate 2013 - Tutti i trasferimenti della Serie A"},
		{kind: "enyo.Scroller", fit: true, components: [
            { kind: "FittableColumns", fit: true, arrangerKind: "CollapsingArranger", classes: "panels-sample", narrowFit: false, components: [
                {name: "panel1", classes: "nice-padding", components: [
                    {tag: "h1", content: "Cessioni"},
	    		    {name: "Chord", kind: "d3.Chord", onNodeLabel: "cessioninodelabel", onSelectNode: "onselectnode", selectChordOn: "mouseover", onSelectChord: "onselectchord", nodes: squadreA, matrix: cessioni, details: trasferimenti}
                ]},
                {name: "panel2", classes: "nice-padding", components: [
                    {components: [
                        {name: "Squadra", tag: "h1"},
                        {name: "Riassunto", tag: "p"}
                    ]},
                    {name: "SecondaSquadra", tag: "h1"},
                    {name: "Repeater", kind: "enyo.Repeater", count: 0, components: [
                        {name: "text", tag: "p", components: [
                            {tag: "span", name: "date"},
                            {tag: "span", name: "player"},
                            {tag: "span", name: "from"},
                            {tag: "span", name: "to"},
                            {tag: "span", name: "type"}
                        ]}
                    ], onSetupItem: "write"}
                ]}
                //{tag: "h1", content: "Acquisti"},
			    //{name: "Chord2", kind: "d3.Chord", onNodeLabel: "acquistinodelabel", onSelectChord: "onselectchord", nodes: squadreA, matrix: acquisti, details: trasferimenti}
            ]}
		]},
		{kind: "onyx.Toolbar", content: "By Alessio 'jenkin' Cimarelli (@jenkin27) with Enyo Framework and D3 javascript library | Powered by Dataninja | Source: Lega Serie A"}
	],
    cessioninodelabel: function(d,i) {
        return this.$.Chord.nodes[i].name + ": " + Math.round(d.value) + " cessioni";
    },
    acquistinodelabel: function(d,i) {
        return this.$.Chord.nodes[i].name + ": " + Math.round(d.value) + " acquisti";
    },
    onselectnode: function(inSender,node) {
        this.$.Chord.d3.chord.classed("fade", function(p) {
            return p.source.index != node.index && p.target.index != node.index;
        });
        var that = this.$.Chord;
        var cessioni = that.getDetails().filter(function(obj) {
                    return obj["Squadra di provenienza"] === that.getNodes()[node.index].name;
        });
        var acquisti = that.getDetails().filter(function(obj) {
                    return obj["Squadra di destinazione"] === that.getNodes()[node.index].name;
        });
        this.$.SecondaSquadra.setContent();
        this.$.Repeater.setCount(0);
        this.setCurrentTeam(that.getNodes()[node.index].name);
        this.$.Squadra.setContent(that.getNodes()[node.index].name);
        this.$.Riassunto.setContent("Ha affettuato " + cessioni.length + " cessioni e " + acquisti.length + " acquisti.");
    },
    onselectchord: function(inSender,chord) {
        var that = this.$.Chord;
        var a = that.getDetails().filter(function(obj) { 
                    return (
                            obj["Squadra di provenienza"] === that.nodes[chord.data.source.index].name 
                            && obj["Squadra di destinazione"] === that.nodes[chord.data.target.index].name
                        ) || (
                            obj["Squadra di provenienza"] === that.nodes[chord.data.target.index].name 
                            && obj["Squadra di destinazione"] === that.nodes[chord.data.source.index].name
                        );
        });
        if (a.length !== 0) {
            this.$.SecondaSquadra.setContent("Affari con " + 
                    (that.nodes[chord.data.source.index].name === this.getCurrentTeam() ? that.nodes[chord.data.target.index].name : that.nodes[chord.data.source.index].name)
                );
        } else {
            this.$.SecondaSquadra.setContent();
        }
        this.setData(a);
    },
    write: function(inSender,inEvent) {
        var item = inEvent.item,
            data = this.getData()[inEvent.index];
        item.$.date.setContent(data["Data trasferimento"]);
        item.$.player.setContent(data["Nome giocatore"]);
        item.$.from.setContent(data["Squadra di provenienza"]);
        item.$.to.setContent(data["Squadra di destinazione"]);
        item.$.type.setContent(data["Tipo di trasferimento"]);
        return(true);
    },
    dataChanged: function() {
        this.$.Repeater.setCount(0);
        this.$.Repeater.setCount(this.getData().length);
    }
});
