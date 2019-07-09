const fs = require ("fs");
var package_json = require("../package");

if (process.platform === "darwin") return;

if (Object.keys(package_json.dependencies).includes("ttab")){
    delete package_json.dependencies["ttab"]
}

fs.writeFileSync("package.json", JSON.stringify(package_json, "", 4));
console.log ("Removed ttab from package.json")


