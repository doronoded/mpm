const path = require ('path');
const npm = require (path.resolve (`${process.argv[0]}/../../lib/node_modules/npm`));
const chalk = require ('chalk');
const figlet = require ("figlet");
const runCommandSync = require(`./runCommandSync.js`);

module.exports = function runPackageScript(scriptName, multiPackage){
    var globalError, error;
    Object.entries(multiPackage.packages).forEach (([packageName, packageConfig]) => {
        console.log (chalk.green(`Running '${scriptName}' for '${packageName}'...`));

        //get the command from the multi-package.json
        var command = (packageConfig && packageConfig.scripts && packageConfig.scripts[scriptName]);
        //and if not found, see if npm has it
        if (!command && (Object.keys(npm.commands).includes(scriptName))) {
            command = `npm ${process.argv.slice(2).join (" ")}`;
        }
        command = `cd ${packageName} && ${command}`;
        error = runCommandSync (command);
        if (!error){
            console.log ();
            console.log (chalk.green(chalk.bold(`'${packageName}' done!`)));
            console.log ();
        }
        else {
            console.error (error);
            globalError = `Errors during ${scriptName} for one or more packages`;
            return;
        }
    });

    if (globalError) {
        return console.error (globalError);
    }

    console.log();
    console.log(
        chalk.green(
            figlet.textSync("BOOM", {
                font: "Small",
                horizontalLayout: "default",
                verticalLayout: "default"
            })
        )
    );
}