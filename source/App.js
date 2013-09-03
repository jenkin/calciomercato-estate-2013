enyo.kind({
	name: "App",
	kind: "FittableRows",
	fit: true,
	components:[
		{kind: "onyx.Toolbar", content: "Calcio Mercato Estate 2013 - Tutti i trasferimenti della Serie A"},
		{kind: "enyo.Scroller", fit: true, components: [
			{name: "main", classes: "nice-padding", allowHtml: true, components: [
                {tag: "h1", content: "Cessioni"},
			    {name: "Chord", kind: "d3.Chord", onNodeLabel: "cessioninodelabel", onSelectChord: "onselectchord", nodes: squadreA, matrix: cessioni, details: trasferimenti},
                {name: "Repeater", kind: "enyo.Repeater", count: 0, components: [
                    {name: "text", tag: "p", components: [
                        {tag: "span", name: "date"},
                        {tag: "span", name: "player"},
                        {tag: "span", name: "from"},
                        {tag: "span", name: "to"},
                        {tag: "span", name: "type"}
                    ]}
                ], onSetupItem: "write"}
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
    onselectchord: function(d,i) {
        var that = this.$.Chord;
        var a = that.getDetails().filter(function(obj) { 
                    return (
                            obj["Squadra di provenienza"] === that.nodes[d.source.index].name 
                            && obj["Squadra di destinazione"] === that.nodes[d.target.index].name
                        ) || (
                            obj["Squadra di provenienza"] === that.nodes[d.target.index].name 
                            && obj["Squadra di destinazione"] === that.nodes[d.source.index].name
                        );
        });
        that.setSubdetails(a);
        this.$.Repeater.setCount(a.length);
    },
    write: function(inSender,inEvent) {
        var item = inEvent.item,
            data = this.$.Chord.getSubdetails()[inEvent.index];
        item.$.date.setContent(data["Data trasferimento"]);
        item.$.player.setContent(data["Nome giocatore"]);
        item.$.from.setContent(data["Squadra di provenienza"]);
        item.$.to.setContent(data["Squadra di destinazione"]);
        item.$.type.setContent(data["Tipo di trasferimento"]);
        return(true);
    }
});
