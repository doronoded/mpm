const fs = require ('fs');
const promptly = require('promptly');
const ordinal = require ('ordinal');
const chalk = require ('chalk');

async function createSinglePackageConfigurationLoop(multiPackage, packageNumber) {
    var packageConfig = {
        name: `package${packageNumber}`,
        repository: "",
        branch: "master",
        scripts: {}
    };
    try {
        packageConfig.name = await promptly.prompt(`Enter the ${ordinal(packageNumber)} package name (default: ${packageConfig.name}): `, {
            default: packageConfig.name,
            validator: function (v) {
                if (Object.keys(multiPackage.packages).includes(v))
                    throw new Error("Package name already exists");
                else return v;
            }
        });
        packageConfig.repository = await promptly.prompt(`Enter the git repository url of '${packageConfig.name}': `, {
            default: packageConfig.repository,
        });
        if (!packageConfig.repository) console.warn (chalk.yellow("[WARN] No repository set! the git clone command won't work.."));
        packageConfig.branch = await promptly.prompt(`Enter desired git branch of '${packageConfig.name}' (default: ${packageConfig.branch}): `, {
            default: packageConfig.branch,
        });
        packageConfig.scripts.install = `git clone ${packageConfig.repository} ${packageConfig.name} && cd ${packageConfig.name} && git checkout ${packageConfig.branch} && npm install`;
        packageConfig.scripts.pull = `git stash && git pull --rebase && git stash pop && npm install`;

        packageConfig.scripts.install = await promptly.prompt(`Enter install script of '${packageConfig.name}' (default: ${packageConfig.scripts.install}): `, {
            default: packageConfig.scripts.install,
        });
        packageConfig.scripts.pull = await promptly.prompt(`Enter pull script for '${packageConfig.name}' (default: ${packageConfig.scripts.pull}): `, {
            default: packageConfig.scripts.pull,
        });

        console.log();
        console.log(`Great! the package configuration is set. You can edit it manually in the multi-package.json file:\n${JSON.stringify(packageConfig, "", "\t")}                
                        `);

        multiPackage.packages[packageConfig.name] = packageConfig;
        var anotherPackage = await promptly.confirm(`Would you like to create ${chalk.bold("another")} package configuration (y/n)? `);

        if (anotherPackage) {
            return createSinglePackageConfigurationLoop(multiPackage, ++packageNumber);
        }

        console.log ();
        console.log (`${chalk.bold("Done")} creating the multi-package.json file ${chalk.bold(":)")}`);
    }
    catch (ex) {
        console.log (`Aborting: ${ex}`);
    }
}

async function createDefaultMultiPackageJson () {
    var multiPackage = require("./default-multi-package.json");
    var packageCounter = 1;

    await createSinglePackageConfigurationLoop(multiPackage, packageCounter);

    fs.writeFileSync("multi-package.json", JSON.stringify(multiPackage, "", 3));
}
async function run (multiPackage, params) {
    if (fs.existsSync ("multi-package.json")) {
        try {
            var override = await promptly.confirm("A 'multi-package.json' file already exists, override with default (y/n)?", {default: "n"});
            if (override) {
                console.log("Overriding multi-package.json");
                createDefaultMultiPackageJson();
            }
        }
        catch (ex){
            console.log (`Aborting: ${ex}`);
        }
    }
    else {
        createDefaultMultiPackageJson();
    }
}

module.exports = {
    name: "init",
    title: "Initiates an mpm project. Edit the multi-package.json file and run 'mpm install'",
    run
}