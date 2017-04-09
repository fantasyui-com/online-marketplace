const path = require('path');
const system = require(path.join(__dirname, 'index.js'));
const pkg = require(path.join(__dirname, 'package.json'));

async function main() {

  let app = await system.install(pkg);

  const listener = app.listen(pkg.config.port, pkg.config.host, () => {
    console.log(`http://${listener.address().address}:${listener.address().port}/`);
    if (process.send) process.send('ready');
  });

}

main();
