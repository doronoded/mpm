const path = require ('path');
const fs = require ('fs');
const chalk = require ('chalk');
const runCommandSync = require ('../../lib/runCommandSync.js');

/**
 * Creates a map of all local packages names (from the package.json) to their folder path (e.g. {'package-1': './package1'}).
 */
function mapLocalPackages(multiPackage) {
    var localPackageMap = {};

    Object.keys(multiPackage.packages).forEach (packageName => {
        if (!fs.existsSync(path.resolve(`./${packageName}`))) {
            if (process.argv.includes("--verbose")) {
                console.log (`[mpm link] '${packageName}' skipped, folder doesn't exists`);
            }
            return;
        }

        var packageJson = require (path.resolve(`./${packageName}/package.json`));
        localPackageMap[packageJson.name] = packageName;
    });

    if (process.argv.includes("--verbose")) {
        console.log (`[mpm link] Package map: ${JSON.stringify(localPackageMap, null, "\t")}`);
    }

    return localPackageMap;
}

/**
 * Runs through all the packages, and replaces for each package, its own "public" package with their local counterparts should these exists.
 * For example. Let's say we have 2 packages in out multi-package.json: "A", "b". and "A" depeneds on "B".
 * This will replace "A/node_modules/B" with "A/node_modules/(symlink)B" that points to "B" (locally)
 */
function createSymlinks(localPackageMap){
    Object.values(localPackageMap).forEach (packageName => {
        if (!fs.existsSync(`./${packageName}/node_modules`)) return;
        Object.keys(localPackageMap).forEach (localPackageName => {
            var packageDependencyPath = path.resolve(`./${packageName}/node_modules/${localPackageName}`);
            if (process.argv.includes("--verbose")) {
                console.log (`[mpm link] checking module: ${packageDependencyPath}`);
            }
            if (!fs.existsSync(packageDependencyPath)) return;
            runCommandSync(`rm -rf ${packageDependencyPath}`);
            fs.symlinkSync(path.resolve(`./${packageName}`), packageDependencyPath);
            console.log (`[mpm link] Created symlink: '${packageDependencyPath}' --> ${packageName}'`);
        });
    })
}

function run(multiPackage) {

    var localPackageMap = mapLocalPackages(multiPackage);
    createSymlinks(localPackageMap);
    console.log (chalk.green(`[mpm link] Symlinks done!`));
}

module.exports = {
    name: "link",
    title: "Creates local symlinks for all local packages",
    run
}