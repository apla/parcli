var util = require ("util");

var yargs = require ('yargs');

var ArgvParser = require ("./base");

function YargsParser (config) {

	this.config = config;

	var yargsOptions = this.getOptions ();
	var commands = [];
	for (var optName in config) {
		if (!config[optName].description)
			continue;
		config[optName].run
			? commands.push ("   " + optName + "\t" + config[optName].description)
		: yargsOptions[optName] = config[optName];
	}

	yargs.usage (
		config.help.banner.concat (commands.sort()).join ("\n"),
		yargsOptions
	);

	yargs.help ('help', config.help.description);

	this.config = config;

}

util.inherits (YargsParser, ArgvParser);

YargsParser.prototype.parse = function (argv) {

	if (!argv)
		argv = process.argv.slice (2);

	var options = yargs.parse (argv);

	for (var k in this.config) {
		// clean up options a little
		var aliases = this.config[k].alias;
		if (aliases) {
			if (aliases.constructor !== Array)
				aliases = [aliases];
			aliases.forEach (function (aliasName) {
				if (aliasName in options && aliasName !== k) {
					options[k] = options[aliasName]; // not really needed, insurance for a yargs api changes
					delete options[aliasName];
				}
			});
		}

		if (!this.config[k].env)
			continue;
		if (options[k])
			continue;

		var envVars = this.config[k].env;
		if (envVars.constructor !== Array)
			envVars = [envVars];
		envVars.forEach (function (envVar) {
			if (process.env[envVar])
				options[k] = process.env[envVar];
		});
	}

	return options;
}

module.exports = YargsParser;