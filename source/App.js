enyo.kind({
	name: "App",
	kind: "FittableRows",
	fit: true,
    published: {
        dataCessioni: "",
        dataAcquisti: "",
        currentTeam: "",
        nodelabel: "acquisti"
    },
	components:[
		{kind: "onyx.Toolbar", classes: "toolbar top", content: "Calcio Mercato Estate 2013 - Tutti i trasferimenti della Serie A"},
		{kind: "enyo.Scroller", fit: true, components: [
            { kind: "FittableColumns", fit: true, arrangerKind: "CollapsingArranger", classes: "panel container external", narrowFit: false, components: [
                {name: "panel1", classes: "nice-padding panel internal left", components: [
                    {tag: "h1", components: [
                        {name: "TabAcquisti", tag: "span", classes: "tab selected", content: "Acquisti", ontap: "ontapacquisti"},
                        {name: "TabCessioni", tag: "span", classes: "tab", content: "Cessioni", ontap: "ontapcessioni"}
                    ]},
	    		    {name: "Chord", kind: "d3.Chord", onNodeLabel: "onnodelabel", onNodeText: "onnodetext", onChordLabel: "onchordlabel", onNodeMouseover: "onselectnode", onChordMouseover: "onselectchord", rotateGroups: 2, nodes: squadreA, matrix: cessioni, details: trasferimenti}
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
        return this.$.Chord.nodes[i]["Nome completo"] + ": " + Math.round(d.value) + " " + this.nodelabel;
    },
    onnodetext: function(d,i) {
        return this.$.Chord.nodes[i]["Nome"];
    },
    onchordlabel: function(d,i) {
        return this.$.Chord.nodes[d.source.index]["Nome"]
                    + " → " + this.$.Chord.nodes[d.target.index]["Nome"]
                    + ": " + d[(this.nodelabel === "acquisti" ? "source" : "target")].value
                    + "\n" + this.$.Chord.nodes[d.target.index]["Nome"]
                    + " → " + this.$.Chord.nodes[d.source.index]["Nome"]
                    + ": " + d[(this.nodelabel === "acquisti" ? "target" : "source")].value;
    },
    onselectnode: function(inSender,node) {
        this.$.Chord.d3.chordPath.classed("fade", function(p) {
            return p.source.index != node.index && p.target.index != node.index;
        });
        var that = this.$.Chord;
        var acquisti = that.getDetails().filter(function(obj) {
                    return obj["Squadra di provenienza"] === that.getNodes()[node.index]["Nome completo"];
        });
        var cessioni = that.getDetails().filter(function(obj) {
                    return obj["Squadra di destinazione"] === that.getNodes()[node.index]["Nome completo"];
        });
        this.$.SecondaSquadra.setContent();
        this.$.RepeaterCessioni.setCount(0);
        this.$.RepeaterAcquisti.setCount(0);
        this.setCurrentTeam(that.getNodes()[node.index]["Nome completo"]);
        this.$.PrimaSquadra.setContent(that.getNodes()[node.index]["Nome completo"]);
        this.$.Riassunto.setContent("Ha effettuato " + cessioni.length + " cessioni e " + acquisti.length + " acquisti.");
    },
    onselectchord: function(inSender,chord) {
        var that = this.$.Chord;
        var currentTeam = this.getCurrentTeam();
        var listaCessioni = [], listaAcquisti = [];
        var listaTrasferimenti = that.getDetails().filter(function(obj) { 
                    return (
                            obj["Squadra di provenienza"] === that.nodes[chord.data.source.index]["Nome completo"] 
                            && obj["Squadra di destinazione"] === that.nodes[chord.data.target.index]["Nome completo"]
                        ) || (
                            obj["Squadra di provenienza"] === that.nodes[chord.data.target.index]["Nome completo"] 
                            && obj["Squadra di destinazione"] === that.nodes[chord.data.source.index]["Nome completo"]
                        );
        });
        if (listaTrasferimenti.length !== 0) {
            this.$.SecondaSquadra.setContent( 
                    (that.nodes[chord.data.source.index]["Nome completo"] === currentTeam ? that.nodes[chord.data.target.index]["Nome completo"] : that.nodes[chord.data.source.index]["Nome completo"])
                );
            listaCessioni = listaTrasferimenti.filter(function(obj) {
                return obj["Squadra di provenienza"] === currentTeam;
            });
            listaAcquisti = listaTrasferimenti.filter(function(obj) {
                return obj["Squadra di destinazione"] === currentTeam;
            });
        } else {
            this.$.SecondaSquadra.setContent();
        }
        this.setDataAcquisti(listaAcquisti);
        this.setDataCessioni(listaCessioni);
    },
    ontapcessioni: function(inSender,inEvent) {
        this.$.TabAcquisti.removeClass("selected");
        this.$.TabCessioni.addClass("selected");
        this.nodelabel = "cessioni";
        this.$.Chord.setMatrix(acquisti);
        return true;
    },
    ontapacquisti: function(inSender,inEvent) {
        this.$.TabCessioni.removeClass("selected");
        this.$.TabAcquisti.addClass("selected");
        this.nodelabel = "acquisti";
        this.$.Chord.setMatrix(cessioni);
        return true;
    },
    writeCessioni: function(inSender,inEvent) {
        var item = inEvent.item,
            data = this.getDataCessioni()[inEvent.index];
        item.$.player1.setContent(data["Nome giocatore"]);
        //item.$.from.setContent(data["Squadra di provenienza"]);
        //item.$.to.setContent(data["Squadra di destinazione"]);
        //item.$.type.setContent(data["Tipologia"]);
        //item.$.amount.setContent(data["Spesa"]);
        return true;
    },
    writeAcquisti: function(inSender,inEvent) {
        var item = inEvent.item,
            data = this.getDataAcquisti()[inEvent.index];
        item.$.player2.setContent(data["Nome giocatore"]);
        //item.$.from.setContent(data["Squadra di provenienza"]);
        //item.$.to.setContent(data["Squadra di destinazione"]);
        //item.$.type.setContent(data["Tipologia"]);
        //item.$.amount.setContent(data["Spesa"]);
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
