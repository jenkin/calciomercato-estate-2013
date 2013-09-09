enyo.kind({
	name: "App",
	kind: "FittableRows",
	fit: true,
    published: {
        dataCessioni: "",
        dataAcquisti: "",
        currentTeam: "",
        nodelabel: "acquisti",
        spriteShift: 75
    },
	components:[
		{kind: "onyx.Toolbar", classes: "toolbar top", content: "Calcio Mercato Estate 2013 - Tutti i trasferimenti della Serie A"},
		{kind: "enyo.Scroller", fit: true, horizontal: "hidden", components: [
            { kind: "FittableRows", arrangerKind: "CollapsingArranger", classes: "vertical-padding panel container external", narrowFit: false, components: [
                {kind: "FittableColumns", components: [
                    {name: "TabAcquisti", tag: "h2", classes: "tab selected", content: "Acquisti", ontap: "ontapacquisti"},
                    {name: "TabCessioni", tag: "h2", classes: "tab", content: "Cessioni", ontap: "ontapcessioni"}
                ]},
	    		{name: "Chord", kind: "d3.Chord", width: 585, height: 585, onNodeLabel: "onnodelabel", onNodeText: "onnodetext", onChordLabel: "onchordlabel", onNodeMouseover: "onselectnode", onChordClick: "onselectchord", rotateGroups: 2, nodes: squadreA, matrix: cessioni, details: trasferimenti, classes: "vertical-padding"},
                {kind: "FittableColumns", components: [
                    {name: "PrimaImmagine", classes: "prima immagine"},
                    {classes: "prima squadra", fit: true, components: [
                        {name: "PrimaSquadra", tag: "h1"},
                        {name: "Riassunto", tag: "p"}
                    ]}
                ]},
                {name: "Trasferimenti", classes: "trasferimenti", kind: "FittableColumns", components: [
                        {name: "RepeaterAcquisti", classes: "acquisti", kind: "enyo.Repeater", count: 0, components: [
                            {tag: "p", components: [
                                {tag: "span", classes: "player", name: "player2"},
                                {tag: "span", classes: "tipologia", name: "tipo2"}
                            ]}
                        ], onSetupItem: "writeAcquisti"},
                        {name: "RepeaterCessioni", classes: "cessioni", kind: "enyo.Repeater", count: 0, components: [
                            {tag: "p", components: [
                                {tag: "span", classes: "player", name: "player1"},
                                {tag: "span", classes: "tipologia", name: "tipo1"}
                            ]}
                        ], onSetupItem: "writeCessioni"}
                ]},
                {kind: "FittableColumns", components: [
                    {classes: "seconda squadra", fit: true, components: [
                        {name: "SecondaSquadra", tag: "h1"}
                    ]},
                    {name: "SecondaImmagine", classes: "seconda immagine"}
                ]}
            ]}
		]},
		{kind: "onyx.Toolbar", classes: "toolbar bottom", allowHtml: true, content: 
            "By Alessio 'jenkin' Cimarelli "
            + "(<a href=\"https://twitter.com/jenkin27\" target=\"_blank\">@jenkin27</a>) "
            + "with Enyo Framework and D3 javascript library<br>"
            + "Powered by <a href=\"http://www.dataninja.it/\" target=\"_blank\">Dataninja</a> | "
            + "Source: <a href=\"http://www.legaseriea.it/\" target=\"_blank\">Lega Serie A</a>, "
            + "<a href=\"http://www.transfermarkt.it/it/serie-a/sommertransfers/wettbewerb_IT1.html\" target=\"_blank\">Transfermarkt.it</a>"
        }
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
    onfadenode: function(inSender,node) {
        this.$.Chord.d3.chordPath.classed("fade", function(p) {
            return p.source.index != node.index && p.target.index != node.index;
        });
    },
    onselectnode: function(inSender,node) {
        this.onfadenode(inSender,node);
        var that = this.$.Chord;
        var acquisti = that.getDetails().filter(function(obj) {
                    return obj["Squadra di provenienza"] === that.getNodes()[node.index]["Nome completo"];
        });
        var cessioni = that.getDetails().filter(function(obj) {
                    return obj["Squadra di destinazione"] === that.getNodes()[node.index]["Nome completo"];
        });
        this.$.SecondaSquadra.setContent();
        this.$.SecondaImmagine.setStyle("background-position: right 9999px;");
        this.$.RepeaterCessioni.setCount(0);
        this.$.RepeaterAcquisti.setCount(0);
        this.setCurrentTeam(that.getNodes()[node.index]["Nome completo"]);
        if (that.getNodes()[node.index]["Nome completo"] !== "Altro" && that.getNodes()[node.index]["Nome completo"] !== "Serie B") {
            this.$.PrimaSquadra.setContent(that.getNodes()[node.index]["Nome completo"]);
            this.$.PrimaImmagine.setStyle("background-position: left " + (-that.getNodes()[node.index]["Sprite"]*this.spriteShift) + "px;");
            this.$.Riassunto.setContent("Ha effettuato " + cessioni.length + " cessioni e " + acquisti.length + " acquisti.");
        } else {
            this.$.PrimaSquadra.setContent();
            this.$.PrimaImmagine.setStyle("background-position: right 9999px;");
            this.$.Riassunto.setContent();
        }
    },
    onnodecolor: function(d,i) {
        return this.$.Chord.nodes[i]["Colore"];
    },
    onchordcolor: function(d,i) {
        return this.$.Chord.nodes[d.source.index]["Colore"];
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
            this.$.SecondaImmagine.setStyle("background-position: right " + (-(that.nodes[chord.data.source.index]["Nome completo"] === currentTeam ? that.nodes[chord.data.target.index]["Sprite"] : that.nodes[chord.data.source.index]["Sprite"])*this.spriteShift) + "px;");
            listaCessioni = listaTrasferimenti.filter(function(obj) {
                return obj["Squadra di provenienza"] === currentTeam;
            });
            listaAcquisti = listaTrasferimenti.filter(function(obj) {
                return obj["Squadra di destinazione"] === currentTeam;
            });
        } else {
            this.$.SecondaSquadra.setContent();
            this.$.SecondaImmagine.setStyle("background-position: right 9999px;");
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
        item.$.tipo1.setContent(data["Tipologia"]);
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
        item.$.tipo2.setContent(data["Tipologia"]);
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
