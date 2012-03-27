var config = module.exports;

config["Node Tests"] = {
	environment: "node",
	rootPath: "../",
	libs: ["js/lib/require.js"],
	tests: [
		"test/specs/node/*.js"
	],
	sources: [
	],
	resources: [
	]
}

config["Browser Tests"] = {
	environment: "browser",
	rootPath: "../",
	libs: [
		"build/scripts/3plib/jquery.js",
		"build/scripts/3plib/jquery-ui.js",
		"build/scripts/3plib/jquery-ui.js",
		"ixf/scripts/ixf-plugins.js",
		"ixf/scripts/ixf-utilities.js"
	],
	tests: [
		"test/specs/browser/*.js"
	],
	sources: [
	],
	resources: [
	]
}