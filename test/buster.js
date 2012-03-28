var config = module.exports;

config["Browser Tests"] = {
	environment: "browser",
	rootPath: "../",
	libs: [
		"build/scripts/3plib/jquery.js",
		"build/scripts/3plib/jquery-ui.js",
		"ixf/scripts/ixf-plugins.js",
		"build/scripts/ixf-utilities.js"
	],
	tests: [
		"test/specs/browser/*.js"
	],
	sources: [
	],
	resources: [
	]
}