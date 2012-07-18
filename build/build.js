// npm install -g uglify-js

var fs = require('fs');
var path = require('path');
var jsp = require("uglify-js").parser;
var pro = require("uglify-js").uglify;

var versionNumber = "1.1.4";

console.log("\nBuilding IxF " + versionNumber + "...");

generatePluginFiles(function() {
	generateMinifiedUtilities(function() {
		generateKickstart(function() {
			console.log("\nBuild Finished.");
		});
	});
});

function generateMinifiedUtilities(callback) {

	console.log("\nGenerating IxF ixf-utilities.min.js...");

	var now = new Date(),
		data = fs.readFileSync('scripts/ixf-utilities.js','utf8').replace("Y_Y_Y_Y", now.getFullYear()).replace('ixf.version = "X.X.X"','ixf.version = "' + versionNumber + '"').replace("X.X.X",versionNumber + " - " + now.getFullYear() + "/" + (now.getMonth()+1) + "/" + now.getDate()),
		outMin = fs.openSync('scripts/ixf-utilities.min.js','w'),
		index = data.indexOf("/*"), lastIndex = data.indexOf("*/",index),
		ast, minCode, buffer, comment;

	// Write permanent comment to minified file
	if(index != -1 && lastIndex != -1) {
		comment = data.substring(index,lastIndex+2);
		console.log(comment);
		buffer = new Buffer(comment + "\n");
		fs.writeSync(outMin, buffer, 0, buffer.length);
		data = data.substring(lastIndex+2);
	}

	//Minify the code
	ast = jsp.parse(data); // parse code and get the initial AST
	ast = pro.ast_mangle(ast); // get a new AST with mangled names
	ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
	minCode = pro.gen_code(ast); // compressed code here

	// Write minified code to file
	buffer = new Buffer(minCode+"\n");
	fs.writeSync(outMin, buffer, 0, buffer.length);
	fs.closeSync(outMin);
	console.log("  Output: scripts/ixf-utilities.min.js");

	if(callback)
		callback();
}


function generatePluginFiles(callback) {

	console.log("\nGenerating IxF ixf-plugins.js and ixf-plugins.min.js...");

	var out = fs.openSync('scripts/ixf-plugins.js','w'),
		outMin = fs.openSync('scripts/ixf-plugins.min.js','w'),
		xlib = "scripts/3plib",
		lib = "scripts/lib",
		now = new Date(),
		buffer = new Buffer("/*!\n" +
			" * IxF Plugins \n" +
			" * @description This file is a collection of jquery plugins and modernizr used by IxF.\n" +
			" * @version     " + versionNumber + " - " + now.getFullYear() + "/" + (now.getMonth()+1) + "/" + now.getDate() + "\n" +
			" * @copyright   Copyright © " + now.getFullYear() + " by Intellectual Reserve, Inc.\n" +
				" * @URL         http://irinc.github.com/ixf\n" +
			" * global       ixf, $, window\n" +
			" */\n\n"+
			"var ixf = ixf || {};\n\n");
	fs.writeSync(out, buffer, 0, buffer.length);
	fs.writeSync(outMin, buffer, 0, buffer.length);

	var plugins = [
		lib + '/jquery.ixf.fixSelect.js',
		lib + '/jquery.ixf.fillHeight.js',
		lib + '/jquery.ixf.fixHeader.js',
		lib + '/jquery.ixf.watermark.js',
		lib + '/jquery.ixf.makeVisible.js',
		lib + '/jquery.ixf.multiSelect.js',
		lib + '/jquery.ixf.finder.js',
		lib + '/jquery.ixf.masterDetail.js',
		lib + '/jquery.ixf.timePicker.js',
		xlib + '/jquery.jTouchScroll.js',
		xlib + '/jquery.scrollTo.js',
		xlib + '/jquery.bbq.js',
		xlib + '/jquery.hashchange.js',
		xlib + '/jquery.caret.js',
		xlib + '/jquery.dataTables.js',
		xlib + '/jquery.layout.js',
		xlib + '/jquery.qtip.js',
		xlib + '/jquery.ariatabs.js',
		xlib + '/modernizr.js'
	];

	var i = 0, len = plugins.length, data, index,lastIndex,comment,ast,minCode,plugin;

	for(i=0; i<len; i++) {
		plugin = plugins[i];
		console.log("  Input: " + plugin);
		data = fs.readFileSync(plugin,'utf8');

		//Output plugins file
		buffer = new Buffer(data);
		fs.writeSync(out, buffer, 0, buffer.length);

		// Write permanent comment to minified file
		index = data.indexOf("/*"), lastIndex = data.indexOf("*/",index);
		if(index != -1 && lastIndex != -1) {
			comment = data.substring(index,lastIndex+2);
			buffer = new Buffer(comment + "\n");
			fs.writeSync(outMin, buffer, 0, buffer.length);
			data = data.substring(lastIndex+2);
		}

		//Minify the code
		ast = jsp.parse(data); // parse code and get the initial AST
		ast = pro.ast_mangle(ast); // get a new AST with mangled names
		ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
		minCode = pro.gen_code(ast); // compressed code here

		// Write minified code to file
		buffer = new Buffer(minCode+";\n");
		fs.writeSync(outMin, buffer, 0, buffer.length);
	}
	fs.closeSync(out);
	fs.closeSync(outMin);
	console.log("  Output: scripts/ixf-plugins.js");
	console.log("  Output: scripts/ixf-plugins.min.js");

	if(callback)
		callback();
}

function copyFile (srcFile, destFile) {
	var BUF_LENGTH, buff, bytesRead, fdr, fdw, pos;
	BUF_LENGTH = 64 * 1024;
	buff = new Buffer(BUF_LENGTH);
	fdr = fs.openSync(srcFile, 'r');
	fdw = fs.openSync(destFile, 'w');
	bytesRead = 1;
	pos = 0;
	while (bytesRead > 0) {
		bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
		fs.writeSync(fdw, buff, 0, bytesRead);
		pos += bytesRead;
	}
	fs.closeSync(fdr);
	return fs.closeSync(fdw);
};

function copyFileToDirectory(filePath, directory) {
	var index = filePath.lastIndexOf("/"), fileName = index == -1 ? filePath : filePath.substring(index+1);
	copyFile(filePath, directory + "/" + fileName);
}


function generateKickstart(callback) {
	console.log("\nGenerating IxF Kickstart...");

	//Copy IxF Scripts

	var kickstartDir = "kickstart", srcDir = ".", destDir = kickstartDir + "/ixf", webDestDir = "../ixf",
		subdir = "scripts", i, files = fs.readdirSync(srcDir + "/" + subdir),
		length = files.length, fileName, data, out, now = new Date();

	if(!fs.existsSync(destDir))
		fs.mkdirSync(destDir);
	if(!fs.existsSync(webDestDir))
		fs.mkdirSync(webDestDir);

	if(!fs.existsSync(destDir + "/" + subdir))
		fs.mkdirSync(destDir + "/" + subdir);
	if(!fs.existsSync(webDestDir + "/" + subdir))
		fs.mkdirSync(webDestDir + "/" + subdir);

	for(i=0; i<length; i++) {
		fileName = files[i];
		if(fileName.indexOf("ixf-") != -1) {

			if(fileName === "ixf-utilities.js") {
				data = fs.readFileSync(srcDir + "/" + subdir + "/" + fileName,'utf8').replace("Y_Y_Y_Y", now.getFullYear()).replace('ixf.version = "X.X.X"','ixf.version = "' + versionNumber + '"').replace(/X\.X\.X/g,versionNumber + " - " + now.getFullYear() + "/" + (now.getMonth()+1) + "/" + now.getDate());
				console.log("  Output: " + destDir + "/" + subdir + "/" + fileName);
				out = fs.openSync(destDir + "/" + subdir + "/" + fileName,'w')
				buffer = new Buffer(data);
				fs.writeSync(out, buffer, 0, buffer.length);
				fs.closeSync(out);

				console.log("  Output: " + webDestDir + "/" + subdir + "/" +fileName);
				out = fs.openSync(webDestDir + "/" + subdir + "/" + fileName,'w')
				buffer = new Buffer(data);
				fs.writeSync(out, buffer, 0, buffer.length);
				fs.closeSync(out);

			} else {
				console.log("  Output: " + destDir + "/" + subdir + "/" + fileName);
				copyFileToDirectory(srcDir + "/" + subdir + "/" +fileName, destDir + "/" + subdir);
				console.log("  Output: " + webDestDir + "/" + subdir + "/" +fileName);
				copyFileToDirectory(srcDir + "/" + subdir + "/" +fileName, webDestDir + "/" + subdir);
			}
		}
	}

	//Copy Jquery Libs
	console.log("  Output: " + destDir + "/" + subdir + "/jquery.min.js");
	copyFileToDirectory("scripts/3plib/jquery.min.js", destDir + "/" + subdir);
	console.log("  Output: " + webDestDir + "/" + subdir + "/jquery.min.js");
	copyFileToDirectory("scripts/3plib/jquery.min.js", webDestDir + "/" + subdir);
	console.log("  Output: " + destDir + "/" + subdir + "/jquery-ui.min.js");
	copyFileToDirectory("scripts/3plib/jquery-ui.min.js", destDir + "/" + subdir);
	console.log("  Output: " + webDestDir + "/" + subdir + "/jquery-ui.min.js");
	copyFileToDirectory("scripts/3plib/jquery-ui.min.js", webDestDir + "/" + subdir);

	//Copy Styles
	subdir = "styles";
	files = fs.readdirSync(srcDir + "/" + subdir);
	length = files.length;

	if(!fs.existsSync(destDir + "/" + subdir))
		fs.mkdirSync(destDir + "/" + subdir);
	if(!fs.existsSync(webDestDir + "/" + subdir))
		fs.mkdirSync(webDestDir + "/" + subdir);

	for(i=0; i<length; i++) {
		fileName = files[i];
		if(fileName && fileName.indexOf(".css") != -1) {
			data = fs.readFileSync(srcDir + "/" + subdir + "/" + fileName,'utf8').replace("Y_Y_Y_Y", now.getFullYear()).replace("X.X.X",versionNumber + " - " + now.getFullYear() + "/" + (now.getMonth()+1) + "/" + now.getDate());

			console.log("  Output: " + destDir + "/" + subdir + "/" + fileName);
			out = fs.openSync(destDir + "/" + subdir + "/" + fileName,'w')
			buffer = new Buffer(data);
			fs.writeSync(out, buffer, 0, buffer.length);
			fs.closeSync(out);

			console.log("  Output: " + webDestDir + "/" + subdir + "/" +fileName);
			out = fs.openSync(webDestDir + "/" + subdir + "/" + fileName,'w')
			buffer = new Buffer(data);
			fs.writeSync(out, buffer, 0, buffer.length);
			fs.closeSync(out);
		}
	}

	//Copy Images
	subdir = "images";
	files = fs.readdirSync(srcDir + "/" + subdir);
	length = files.length;

	if(!fs.existsSync(destDir + "/" + subdir))
		fs.mkdirSync(destDir + "/" + subdir);
	if(!fs.existsSync(webDestDir + "/" + subdir))
		fs.mkdirSync(webDestDir + "/" + subdir);

	for(i=0; i<length; i++) {
		fileName = files[i];
		if(fileName.indexOf(".png") != -1 || fileName.indexOf(".gif") != -1 || fileName.indexOf(".jpg") != -1) {
			console.log("  Output: " + destDir + "/" + subdir + "/" + fileName);
			copyFileToDirectory(srcDir + "/" + subdir + "/" +fileName, destDir + "/" + subdir);
			console.log("  Output: " + webDestDir + "/" + subdir + "/" +fileName);
			copyFileToDirectory(srcDir + "/" + subdir + "/" +fileName, webDestDir + "/" + subdir);
		}
	}

	//Create Zip Files

	if(!fs.existsSync("../downloads"))
		fs.mkdirSync("../downloads");

	generateZipFile("kickstart","../downloads/ixf-kickstart-"+versionNumber+".zip", "kickstart/.gitignore", function() {
	});
}

function generateZipFile(sourceDir, destinationPath, ignore, callback) {
	console.log('\nGenerating Zip File...');

	var cp = require('child_process'),
		exec = cp.exec, spawn = cp.spawn,
		path = require('path'), zip, command = 'zip ' + (ignore ? '-x ' + ignore : '') + ' -r ' + destinationPath + ' ' + sourceDir,
		cwd = process.cwd();

	if(fs.existsSync(destinationPath)) {
		console.log("  Deleting: " + cwd + "/" + destinationPath);
		fs.unlinkSync(destinationPath);
	}

	console.log('  Output: ' + cwd + "/" + destinationPath);
	console.log('  Command: ' + command);

	zip = exec(command, function(error, stdout, stderr) {
		//console.log('stdout: ' + stdout);
		//console.log('stderr: ' + stderr);
		if (error !== null) {
			console.log('exec error: ' + error);
		} else if(callback)
			callback();
	});
}