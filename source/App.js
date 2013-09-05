enyo.kind({
	name: "App",
	kind: "FittableRows",
	fit: true,
    published: {
        dataCessioni: "",
        dataAcquisti: "",
        currentTeam: "",
        nodelabel: "cessioni"
    },
	components:[
		{kind: "onyx.Toolbar", classes: "toolbar top", content: "Calcio Mercato Estate 2013 - Tutti i trasferimenti della Serie A"},
		{kind: "enyo.Scroller", fit: true, components: [
            { kind: "FittableColumns", fit: true, arrangerKind: "CollapsingArranger", classes: "panel container external", narrowFit: false, components: [
                {name: "panel1", classes: "nice-padding panel internal left", components: [
                    {tag: "h1", components: [
                        {name: "TabCessioni", tag: "span", classes: "tab selected", content: "Cessioni", ontap: "ontapcessioni"},
                        {name: "TabAcquisti", tag: "span", classes: "tab", content: "Acquisti", ontap: "ontapacquisti"}
                    ]},
	    		    {name: "Chord", kind: "d3.Chord", onNodeLabel: "onnodelabel", onNodeMouseover: "onselectnode", onChordMouseover: "onselectchord", rotateGroups: 2, nodes: squadreA, matrix: cessioni, details: trasferimenti}
                ]},
                {name: "panel2", kind: "FittableRows", classes: "nice-padding panel internal right", components: [
                    {classes: "prima squadra", components: [
                        {name: "PrimaSquadra", tag: "h1"},
                        {name: "Riassunto", tag: "p"}
                    ]},
                    {name: "Trasferimenti", classes: "trasferimenti", kind: "FittableColumns", components: [
                        {kind: "enyo.Scroller", components: [
                            {name: "RepeaterCessioni", classes: "cessioni", kind: "enyo.Repeater", count: 0, components: [
                                {tag: "p", name: "player1"}
                            ], onSetupItem: "writeCessioni"}
                        ]},
                        {classes: "divisore"},
                        {kind: "enyo.Scroller", components: [
                            {name: "RepeaterAcquisti", classes: "acquisti", kind: "enyo.Repeater", count: 0, components: [
                                {tag: "p", name: "player2"}
                            ], onSetupItem: "writeAcquisti"}
                        ]},
                    ]},
                    {classes: "seconda squadra", components: [
                        {name: "SecondaSquadra", tag: "h1"}
                    ]}
                ]}
            ]}
		]},
		{kind: "onyx.Toolbar", content: "By Alessio 'jenkin' Cimarelli (@jenkin27) with Enyo Framework and D3 javascript library | Powered by Dataninja | Source: Lega Serie A"}
	],
    onnodelabel: function(d,i) {
        return this.$.Chord.nodes[i].name + ": " + Math.round(d.value) + " " + this.nodelabel;
    },
    onselectnode: function(inSender,node) {
        this.$.Chord.d3.chordPath.classed("fade", function(p) {
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
        this.$.RepeaterCessioni.setCount(0);
        this.$.RepeaterAcquisti.setCount(0);
        this.setCurrentTeam(that.getNodes()[node.index].name);
        this.$.PrimaSquadra.setContent(that.getNodes()[node.index].name);
        this.$.Riassunto.setContent("Ha affettuato " + cessioni.length + " cessioni e " + acquisti.length + " acquisti.");
    },
    onselectchord: function(inSender,chord) {
        var that = this.$.Chord;
        var listaAcquisti = that.getDetails().filter(function(obj) { 
                    return (
                            obj["Squadra di provenienza"] === that.nodes[chord.data.source.index].name 
                            && obj["Squadra di destinazione"] === that.nodes[chord.data.target.index].name
                        );
        });
        var listaCessioni = that.getDetails().filter(function(obj) { 
                    return (
                            obj["Squadra di provenienza"] === that.nodes[chord.data.target.index].name 
                            && obj["Squadra di destinazione"] === that.nodes[chord.data.source.index].name
                        );
        });
        if (listaCessioni.length !== 0 || listaAcquisti.length !== 0) {
            this.$.SecondaSquadra.setContent( 
                    (that.nodes[chord.data.source.index].name === this.getCurrentTeam() ? that.nodes[chord.data.target.index].name : that.nodes[chord.data.source.index].name)
                );
        } else {
            this.$.SecondaSquadra.setContent();
        }
        this.setDataCessioni(listaCessioni);
        this.setDataAcquisti(listaAcquisti);
    },
    ontapacquisti: function(inSender,inEvent) {
        this.$.TabCessioni.removeClass("selected");
        this.$.TabAcquisti.addClass("selected");
        this.$.Chord.setMatrix(acquisti);
        this.nodelabel = "acquisti";
        return true;
    },
    ontapcessioni: function(inSender,inEvent) {
        this.$.TabAcquisti.removeClass("selected");
        this.$.TabCessioni.addClass("selected");
        this.$.Chord.setMatrix(cessioni);
        this.nodelabel = "cessioni";
        return true;
    },
    writeCessioni: function(inSender,inEvent) {
        var item = inEvent.item,
            data = this.getDataCessioni()[inEvent.index];
        //item.$.date.setContent(data["Data trasferimento"]);
        item.$.player1.setContent(data["Nome giocatore"]);
        //item.$.from.setContent(data["Squadra di provenienza"]);
        //item.$.to.setContent(data["Squadra di destinazione"]);
        //item.$.type.setContent(data["Tipo di trasferimento"]);
        return true;
    },
    writeAcquisti: function(inSender,inEvent) {
        var item = inEvent.item,
            data = this.getDataAcquisti()[inEvent.index];
        //item.$.date.setContent(data["Data trasferimento"]);
        item.$.player2.setContent(data["Nome giocatore"]);
        //item.$.from.setContent(data["Squadra di provenienza"]);
        //item.$.to.setContent(data["Squadra di destinazione"]);
        //item.$.type.setContent(data["Tipo di trasferimento"]);
        return true;
    },
    dataAcquistiChanged: function() {
        this.$.RepeaterAcquisti.setCount(0);
        this.$.RepeaterAcquisti.setCount(this.getDataAcquisti().length);
    },
    dataCessioniChanged: function() {
        this.$.RepeaterCessioni.setCount(0);
        this.$.RepeaterCessioni.setCount(this.getDataCessioni().length);
    }
});
