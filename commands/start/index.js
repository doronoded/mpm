const chalk = require("chalk");
const spawn = require ("child_process").spawn;

function runProcess (packageName, startScript){
    return new Promise (resolve => {
        var command = `${__dirname}/../../node_modules/ttab/bin/ttab -d ${process.cwd()}/${packageName} -t ${packageName} ${startScript}`;
        console.log (command);
        var p = spawn (command, [], {shell: true});
        setTimeout (() => resolve(p), 1500); //delay from the next new tab
    });

}

function getPackages(multiPackage) {
    //filter packages
    var requestedPackages = process.argv.slice (3).filter (c => c !== "-p" && c !== "--package");
    var supportedPackages = Object.keys(multiPackage.packages);
    var unsupportedPackages = [];
    var packages = [];

    //filter supported packages
    if (requestedPackages.length > 0) {
        packages = requestedPackages.filter (packageName => {
            if (supportedPackages.includes(packageName)){
                return true;
            }
            else {
                unsupportedPackages.push (packageName);
            }
        });
    }
    else {
        console.log (`Running all supported packages: ${supportedPackages}`);
        packages = supportedPackages;
    }

    if (unsupportedPackages.length > 0) console.log(chalk.orange(`These packages are unsupported and will be skipped: ${unsupportedPackages}`));

    return packages;
}

async function run (multiPackage, params){

    let packages = getPackages(multiPackage);

    if (process.platform === "linux") {
        var command = `gnome-terminal`;
        for (var packageName of packages) {
            var startScript = (multiPackage.packages[packageName] && multiPackage.packages[packageName].scripts && multiPackage.packages[packageName].scripts.start) || `npm start`;
            command += ` -e "bash -c '${startScript};$SHELL'" --tab --working-directory='${process.cwd()}/${packageName}' --title='${packageName}'`
        }
        console.log ("running: " + command);
        spawn (command, {shell: true});

    }
    else if (process.platform === "darwin"){
        for (var packageName of packages) {
            var startScript = (multiPackage.packages[packageName] && multiPackage.packages[packageName].scripts && multiPackage.packages[packageName].scripts.start) || `npm start`;
            console.log(chalk.green(`running service ${packageName} in new tab`));
            try {
                var p = await runProcess(packageName, startScript);
            } catch (ex) {
                console.error(ex);
            }
        }
    }
}

module.exports = {
    name: "start",
    title: "Runs the start script (e.g. 'npm start') for all packages in separate tabs",
    run
};