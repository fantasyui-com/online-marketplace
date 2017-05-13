const path = require('path');
const system = require(path.join(__dirname, 'index.js'));
const pkg = require(path.join(__dirname, 'package.json'));
const createServer = require("auto-sni");
async function main() {
  const app = await system.install(pkg);
  const conf = {
    agreeTos: true, // Required for letsencrypt.
    email: pkg.config.email,
    domains: pkg.config.domains,
    ports: pkg.config.ports
  }
  const server = createServer(conf, app);
  server.once("listening", ()=> {
    if (process.send) process.send('ready');
  });
}
main();
