const express = require("express");
const clientSessions = require("client-sessions");
const body = require("body-parser");

class OnlineMarketplace {
  constructor(configuration) {
    let defaults = { };
    this.options = Object.assign({}, defaults, configuration);

    this.app = express();

    let app = this.app;

    app.use(clientSessions({
        secret: this.options.clientSessionsSecret
    }));

    app.use(body.urlencoded({
        extended: true
    }));

    app.set("view engine", "ejs");

    const model = function (req, res, next) {

      req.state = {};

      req.state.model = this.options.baseStateModel;

      req.state.username = req.session_state.username;

      req.state.command = {};

      req.state.command.sessionStateReset = function(){ req.session_state.reset(); };

      next();
    }

    app.use(model);

    app.get("/", (req, res) => { res.render("page-home.ejs", req.state ) });

    app.get("/user-signup", (req, res) => { res.render("page-signup", req ) });
    app.get("/user-login", (req, res) => { res.render("page-login", req ) });
    app.get('/user-logout', function (req, res) {
      req.command.sessionStateReset()
      res.redirect('/');
    });

   }

   listen() {
      this.app.listen(this.options.serverPort, this.options.serverHostname, () => {
          console.log(`Server running at http://${this.options.serverHostname}:${this.options.serverPort}/`);
          if (process.send) process.send('ready');
      });
    }

}

module.exports = OnlineMarketplace;
