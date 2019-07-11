#!/usr/bin/env node

const path = require ("path");
const npm = require (path.resolve (`${process.argv[0]}/../../lib/node_modules/npm`));
const chalk = require("chalk");
const figlet = require("figlet");
const fs = require ("fs");
const minimist = require ("minimist");
const runPackageScript = require ("./lib/runPackageScript.js");
const runCommandSync = require ("./lib/runCommandSync.js");
var params = minimist(process.argv.slice(2));
var multiPackage = {};
try {
    multiPackage = require(path.resolve(`./multi-package.json`));
}
catch (ex){
    if (params._.includes("verbose")) {
        console.warn ("No multi-package.json found");
    }
}

var internalCommands = {};
var packagesScripts = [];

function loadInternalCommands() {
    if (params._.includes("verbose")) {
        console.log ("loading internal commands..");
    }

    var defaultCommands = fs.readdirSync(`${__dirname}/commands`);
    defaultCommands.forEach (defaultCommand => {
        try {
            internalCommands[defaultCommand] = require(`./commands/${defaultCommand}`);
        }
        catch (ex){
            console.warn (`Command ${defaultCommand} wasn't loaded: ${ex}`);
        }
    });

    if (params._.includes("verbose")) {
        console.log (`Internal commands loaded: ${Object.keys (internalCommands)}`);
    }


}

function loadCustomCommands() {
    if (!multiPackage.packages) return;
    var packagesScriptsArray = [];
    Object.values(multiPackage.packages).forEach (packageConfig => {
        packagesScriptsArray = packagesScriptsArray.concat(Object.keys(packageConfig.scripts || []));
    });

    packagesScripts = new Set (packagesScriptsArray);

    packagesScripts.forEach (packageScript => {
        if (Object.keys (internalCommands).includes(packageScript)){
            console.warn (chalk.yellow(`[WARN] The script ${packageScript} found in packages will be ignored because the script name is reserved. Please choose a different name`));
        }

        if (multiPackage.scripts && Object.keys (multiPackage.scripts).includes (packageScript) ) {
            console.warn (chalk.yellow(`[WARN] The script ${packageScript} found in packages will be ignored because the script name is already in use in the global custom scripts. Please choose a different name`));
        }
    })
}

function run () {
    loadInternalCommands();
    loadCustomCommands();
    var mainCommand = process.argv[2], secondaryCommand = process.argv[3];
    if (!mainCommand || mainCommand === "--help") {
        console.log ();
        console.log (`Commands:`);
        console.log ();
        Object.values(internalCommands)
            .forEach (command => console.log(`${chalk.bold("\t" + command.name)}\t\t${command.title}`));
        packagesScripts
            .forEach (command => console.log(`${chalk.bold("\t" + command)}\t\tRun the '${command}' command`));
        console.log ();
        console.log ();
        console.log ();
        console.log ();
        console.log ();
    }
    else if (mainCommand in internalCommands){
        internalCommands[mainCommand].run(multiPackage, params);
    }
    else if (mainCommand in multiPackage.scripts) {
        console.log (chalk.green(`Running custom command: '${chalk.bold(mainCommand)}'`));
        try {
            runCommandSync(multiPackage.scripts[mainCommand]);
        }
        catch (ex) {
            console.error (`Error running script '${mainCommand}': ${ex}`);
        }
    }
    else if (packagesScripts.has (mainCommand) || Object.keys(npm.commands).includes(mainCommand)) {
        runPackageScript (mainCommand, multiPackage);
    }
    else {
        console.log (chalk.red(`Hey, I don't know any command named '${mainCommand}', you are welcomed to add it..`));
    }

};

run();

module.exports = {
    run,
}