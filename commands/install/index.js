const runPackageScript = require ("../../lib/runPackageScript.js");

function run(multiPackage) {
    runPackageScript('install', multiPackage, {runGlobally: true})
}

module.exports = {
    name: "install",
    title: "Runs the install script for each package (outside of the package's folder)",
    run
}