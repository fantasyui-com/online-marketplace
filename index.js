const express = require("hardened-express");

const clientSessions = require("client-sessions");
const body = require("body-parser");

const UserManager = require("user-manager");
const userManager = new UserManager({storeLocation: './user-accounts/' ,});

const validator = require('validator');
const zxcvbn = require('zxcvbn');
const capitalize = require('lodash/capitalize');
const kebabCase = require('lodash/kebabCase');


class OnlineMarketplace {

  constructor(configuration) {

    let defaults = {};
    this.options = Object.assign({}, defaults, configuration);

    // ENHANCE PROGRAM METADATA BASED ON CONFIGURATION
    // create data lookup set for blacklisting;
    this.options.structure.forEach(device => {
      device.dataSet = new Set( device.data.map(i=>i.id) ); // create a set from id/s
    });
    // create easy links (fun for ejs)
    this.options.links = {};
    this.options.structure.forEach(device => {
      this.options.links[device.name] = device.path;
    });

    this.app = express();

   }

  async model (req, res, next) {

    // ATTACH USER MANAGER
    req.userManager = userManager;

        req.state = {};

        req.state.model = this.options.model;
        req.state.link = this.options.links;

        // by default model user is null.
        req.state.model.user = null; // no user
        req.state.model.activity = []; // no activity
        req.state.model.actions = []; // no actions to be undertaken

        req.state.command = {};

        req.state.command.sessionStateReset = () => {
          req[this.options.clientSessionsCookieName].reset();
        };

        if( req[this.options.clientSessionsCookieName] && req[this.options.clientSessionsCookieName].username ){

          try {

            let user = await userManager.userGet(req[this.options.clientSessionsCookieName].username);
            // NOTE: model.user is only set when serManager.userGet is a success.
            req.state.model.user = user;
            req.state.model.activity = user.notes;

          } catch(err) {

            // console.log(err)
            req.state.command.sessionStateReset()
            res.redirect('/');
          }

          next();

        }else{

          next();

        }

    }

  isInvalid( type, value ){
    let INVALID = true;
    let IS_OK = false;

    if(type === 'username'){
      isEmpty
      if( validator.isEmpty(value) ) return INVALID;
      if( value.match(/[^a-z0-9-]/) ) return INVALID;
      if( value.length < 5 ) return INVALID;
      return IS_OK;

    } else if(type === 'password'){
      if( validator.isEmpty(value) ) return INVALID;
      if( validator.isEmail(value) ) return INVALID; // password can't be email, sorry.
      if( value.length < 10 ) return INVALID;
      if( zxcvbn(value).score < 3 ) return INVALID;
      return IS_OK;

    } else if(type === 'first-name'){
      if( validator.isEmpty(value) ) return INVALID;
      if( value.length < 2 ) return INVALID;
      if( !validator.isAlpha(value) ) return INVALID;
      return IS_OK;

    } else if(type === 'last-name'){
      if( validator.isEmpty(value) ) return INVALID;
      if( value.length < 2 ) return INVALID;
      if( !validator.isAlpha(value) ) return INVALID;
      return IS_OK;

    } else if(type === 'email'){
      if( validator.isEmpty(value) ) return INVALID;
      if( !validator.isEmail(value) ) return INVALID;
      return IS_OK;

    } else if(type === 'text'){
      if( validator.isEmpty(value) ) return INVALID;
      if( !validator.isAscii(value) ) return INVALID;
      if( value.match(/[<>=]/) ) return INVALID;
      return IS_OK;

    }else{
      // Whatever it is, there was no validator for it, it is invalid.
    }

    return INVALID;
  }

  async listen() {

    let app = this.app;

    app.use(clientSessions({
      cookieName: this.options.clientSessionsCookieName,
      secret: this.options.clientSessionsSecret,
      duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
      activeDuration: 1000 * 60 * 5 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
    }));

    // create application/x-www-form-urlencoded parser
    const urlencodedParser = body.urlencoded({ extended: true });

    const validUserIsRequired =  async (req, res, next) => {

      if(!req.state.model.user){
        return res.redirect(this.options.links.login);
      }
      const _id = req.state.model.user._id;
      let exists = await userManager.userExists(_id);
      if(!exists){
        return res.redirect(this.options.links.login);
      }

      next();
    }

    app.set("view engine", "ejs");

    app.use( await this.model.bind(this) );

    this.options.structure.forEach( device => {
      const args = [device.path];
      if(device.method === 'post') args.push ( urlencodedParser ) ;
      if(device.login) args.push ( validUserIsRequired ) ;
      args.push ( (req, res, next) => {

        const errors = [];
        let input;
        if(device.method === 'get') input = req.query;
        if(device.method === 'post') input = req.body;

        // whitelisted stuff
        if( device.data ){
          device.data.forEach(item=>{
            if(input[item.id]){
              if( this.isInvalid(item.type, input[item.id]) ){
                // errors.push(`${device.method}:/${device.path}/${item.id} is invalid.`)
                errors.push(`Invalid ${item.id.replace(/[^a-zA-Z0-9]/,' ')}`)
              }else{
                // perfect!
              }
            }else{
              if(item.required){
                // errors.push(`${device.method}:/${device.path}/${item.id} is required.`)
                errors.push(`${capitalize(item.id)} is required`)
              }else{
                // item is missing, but it is not required.
              }
            }
          });
        }

        // eveything else is blacklisted.
        Object.keys(input).forEach(item=>{
          if(device.dataSet && device.dataSet.has(item)){
            // fantasic!
          }else{
            errors.push(`${device.method}:/${device.path}/${item} is not allowed.`)
          }
        });

        if(errors.length){

          let msg = `The following error${errors.length>1?'s':''} occured during the processing of your request: ${errors.join(', ')}. Please correct ${errors.length>1?'them':'it'} and try again. If you feel you received this message in error, please contact support.`;
          if(1||device.verbose){
            return next( new Error(msg) );
          }else{
            return res.redirect(this.options.links.home);
          }
        }else{
          next();
        }
      });
      app[device.method].apply(app, args );
    });




    app.get("/", (req, res) => {
      res.render("index", req.state );
    });

    let routeInstaller = [];
    this.options.structure.forEach(async device => {
      routeInstaller.push(new Promise(async (resolve, reject) => {
        const args = [device.path];
        if(device.method === 'post') args.push ( urlencodedParser ) ;
        if(device.login) args.push ( validUserIsRequired ) ;
        let filename = `./api/${device.name}.js`;
        let configurator = require(filename);
        let thing = await configurator.bind(this)({options:device});
        args.push( thing );
        // console.log(`${device.method}: Mounting ${filename} on ${device.path}`)
        app[device.method].apply(app, args );
        resolve();
      }))
    });
    await Promise.all( routeInstaller );

    app.get('*',function (req, res) {
      res.redirect('/');
    });
    app.use(function (err, req, res, next) {
      res.render("error", Object.assign({}, req.state, {message: err.message} ));
      res.status(500);
    });
    this.app.listen(this.options.port, this.options.host, () => {
      console.log(`http://${this.options.host}:${this.options.port}/`);
      if (process.send) process.send('ready');
    });

  }

}

module.exports = OnlineMarketplace;
