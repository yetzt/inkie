#!/usr/bin/env node

/* require node modules */
var fs = require("fs");
var path = require("path");

/* require npm modules */
var finder = require("findit");
var colors = require("colors");
var pngjs = require("pngjs").PNG;
var async = require("async");

/* dirs */
var PNG_DIR = path.resolve(__dirname, "data/png");
var DATA_FILE = path.resolve(__dirname, "data/inkness.json");

/* walk through png folder, combine related documents as an object */
var cluster_files = function(callback) {
	var files = {};
	finder(PNG_DIR).on("file", function(file,stat){
		var id = path.basename(file).replace(/^(.*)\.pdf-[0-9]+\.png$/i,'$1');
		if (!(id in files)) files[id] = [];
		files[id].push({file: file, inkness: null});
	}).on("end", function(){
		for (id in files) files[id] = files[id].sort();
		callback(files);
	});
}

/* reead a png and extract inkness */
var inkness = function(file, callback) {
	fs.createReadStream(file).pipe(new pngjs()).on('parsed', function() {

		var pixmap = {};
		var rows = {};
		var cols = {};
		var ink = 0;
		
		var pixels = (this.height * this.width);
		
		for (var y = 0; y < this.height; y++) {
			pixmap[y] = []
			cols[y] = 0
			for (var x = 0; x < this.width; x++) {
				if (!(x in rows)) rows[x] = 0;
				var idx = (this.width * y + x) << 2;

				/* get the grayscale of a pixel, ignore alpha; range blackess 0 to 1 */
				pixmap[y][x] = (1-((this.data[idx]+this.data[idx+1]+this.data[idx+2])/765));

				/* make it monochrome by some threshold since scans differ a fucking lot */
				pixmap[y][x] = (pixmap[y][x] > 0.2) ? 1 : 0;

				cols[y] += pixmap[y][x];
				rows[x] += pixmap[y][x];
				ink += pixmap[y][x];
			}
		}

		/* 
			count rows that are not empty, because empty rows are straigtened out 
			later on to handle pages with a lot of whitespace in a normalized way
		*/
		var used_rows = 0;
		for (r in rows) if ((rows[r]/ this.width) > 0.05) used_rows++;

		/* find the first line and last with more than 5% black */
		var firstcol = null;
		var lastcol = null;
		var lines = {};
		for (c in cols) {
			/* percentage of the column filled, ignoring empty columns */
			lines[c] = (cols[c] / used_rows);
			if (lines[c] >= 0.05) {
				if (!firstcol) firstcol = c;
				lastcol = c;
			}
		}
		
		/* determine block with */
		var blockwidth = (lastcol - firstcol);
		
		/* determine comparable number of blackness in relation to blockwidth */
		var blockratio = (blockwidth / this.width);
		var inkness = ((ink / pixels) / blockratio);
		
		callback(inkness);
	
	});
}

var execute = function(callback){
	
	/* main */
	cluster_files(function(clusters){

		var queue = async.queue(function(task, callback){
			task(callback);
		}, 5);

		queue.drain = function(){
			callback(clusters);
		}

		var max_ink = 0;

		for (cluster in clusters) {
			clusters[cluster].forEach(function(f,idx){
				(function(f, idx, cluster){
					queue.push(function(callback){
						inkness(f.file, function(data){
							callback(data);
						});
					}, function(data){
						console.log("[inkie]".inverse.bold.magenta, path.basename(f.file).cyan, data.toFixed(5).yellow.bold);
						if (data > max_ink) {
							max_ink = data;
							console.log("[inkie]".inverse.bold.magenta, "new inkness record".green);
						}
					
						if (!("inkness" in clusters[cluster][idx])) {
							console.log(clusters[cluster][idx]);
						}
					
						clusters[cluster][idx].inkness = data;
					});
				})(f, idx, cluster);
			});
		}
	});
	
};

execute(function(data){
	/* save data */
	fs.writeFileSync(DATA_FILE, JSON.stringify(data,null,'\t'));
	console.log("[inkie]".inverse.bold.magenta, "made with datalove".magenta, "<3".bold.magenta);
});

