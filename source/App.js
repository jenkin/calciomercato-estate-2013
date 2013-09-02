enyo.kind({
	name: "App",
	kind: "FittableRows",
	fit: true,
	components:[
		{kind: "onyx.Toolbar", content: "Calcio Mercato Estate 2013 - Tutti i trasferimenti della Serie A"},
		{kind: "enyo.Scroller", fit: true, components: [
			{name: "main", classes: "nice-padding", allowHtml: true, components: [
                {tag: "h1", content: "Cessioni"},
			    {name: "Chord", kind: "d3.Chord", label: "cessioni", nodes: squadreA, matrix: cessioni, details: trasferimenti}
                //{tag: "h1", content: "Acquisti"},
			    //{name: "Chord2", kind: "d3.Chord", label: "acquisti", nodes: squadreA, matrix: acquisti, details: trasferimenti}
            ]}
		]},
		{kind: "onyx.Toolbar", content: "By Alessio 'jenkin' Cimarelli (@jenkin27) with Enyo Framework and D3 javascript library | Powered by Dataninja | Source: Lega Serie A"}
	]
});
