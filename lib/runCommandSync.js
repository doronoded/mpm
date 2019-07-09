const spawnSync = require ("child_process").spawnSync;

module.exports = function runCommandSync(command) {
    console.log (`[ChildProcess] Running command: ${command}`);
    var p = spawnSync(command, {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'inherit',
        encoding: 'utf-8',
        shell: true
    });

    if (p.status !== 0) {
        return (p.error);
    }
}