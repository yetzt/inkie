#!/usr/bin/env node

/* require node modules */
var fs = require("fs");
var path = require("path");

/* require npm modules */
var colors = require("colors");

/* get data */
var data = JSON.parse(fs.readFileSync(path.resolve(__dirname, "data/inkness.json")));

var max_doc_inkness = 0;
var doc_inkness = [];

var max_page_inkness = 0;
var page_inkness = [];

for (doc in data) (function(doc){
	var doc_ink = 0;
	data[doc].forEach(function(page){
		doc_ink += page.inkness;
		if (page.inkness > max_page_inkness) max_page_inkness = page.inkness;
		page_inkness.push([page.file, page.inkness]);
	});
	doc_ink /= data[doc].length;
	console.log(doc, doc_ink);
	doc_inkness.push([doc, doc_ink]);
	if (doc_ink > max_doc_inkness) max_doc_inkness = doc_ink;
})(doc);

doc_inkness = doc_inkness.sort(function(a,b){ return b[1]-a[1]; });
page_inkness = page_inkness.sort(function(a,b){ return b[1]-a[1]; });

doc_inkness.forEach(function(d){
	console.log(d[0].cyan, d[1].toFixed(5).green);
});

fs.writeFileSync(path.resolve(__dirname, "data/doc-inkness.json"), JSON.stringify(doc_inkness,null,"\t"));
fs.writeFileSync(path.resolve(__dirname, "data/page-inkness.json"), JSON.stringify(page_inkness,null,"\t"));
