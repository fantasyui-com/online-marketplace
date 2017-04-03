const express = require("hardened-express");

const clientSessions = require("client-sessions");
const body = require("body-parser");

const UserManager = require("user-manager");
const userManager = new UserManager({storeLocation: './user-accounts/' ,});

const validator = require('validator');
const zxcvbn = require('zxcvbn');
const capitalize = require('lodash/capitalize');
const kebabCase = require('lodash/kebabCase');
const camelCase = require('lodash/camelCase');

const xssFilters = require('xss-filters');

var hbs = require('hbs');
hbs.registerPartials(__dirname + '/views/partials');
hbs.registerPartials(__dirname + '/views/cards');
hbs.registerHelper('inHTMLData', function(str) { return xssFilters.inHTMLData(str); });
hbs.registerHelper('inSingleQuotedAttr', function(str) { return xssFilters.inSingleQuotedAttr(str); });
hbs.registerHelper('inDoubleQuotedAttr', function(str) { return xssFilters.inDoubleQuotedAttr(str); });
hbs.registerHelper('inUnQuotedAttr', function(str) { return xssFilters.inUnQuotedAttr(str); });

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

      this.options.links[camelCase(device.name)] = device.path;

    });

    this.app = express();

   }

   // value producer for values.


   async getValue({req, id, filter}){

     // Default response.
     let response = null;

     if(0){

     } else if(id === 'isLoggedIn'){
       response = !!( req.userObject );

     } else if(id === 'username'){
       if(req.userObject && req.userObject._id){
         response =  req.userObject._id
       }

     } else if(id === 'email'){
       if(req.userObject && req.userObject.email){
         response =  req.userObject.email
       }

     } else if(id === 'firstName'){
       if(req.userObject && req.userObject.firstName){
         response =  req.userObject.firstName
       }

     } else if(id === 'lastName'){
       if(req.userObject && req.userObject.lastName){
         response =  req.userObject.lastName
       }

     } else if(id === 'accountActions'){
       if(req.userObject){

         response = [];

         response.push({
           type: "info",
           title:"Whoo hoo!",
           description:'Now we just need you to grab first product, we\'ll keep track of it for you.',
           text:'Browse Products',
           link:this.options.links.products,
         });

         response.push({
           type: "warning",
           title:"Security!",
           description:'It has been 90 days since you changed your password.',
           text:'Update Password',
           link:'#action-update-password',
         })

       }

     } else if(id === 'recentActivity'){
       if(req.userObject && req.userObject.notes){
         response = req.userObject.notes.slice(-7).map(i=>({note:i}));
       }


     } else if (
       (id === 'browseProducts')||
       (id === 'popularProducts')||
       (id === 'featuredProducts')||
       (id === 'purchasedItems')
     ){
       response = [];
       for(let x=0; x<6; x++){
         let product = {

           /* NOTE: Custom Fields */
           "title": `Theme #${x}`,
           "link": `fantasyui-com/theme-number${x}`,
           "price": `12.00`,

           /* NOTE: Standard Fields */
           "name": `theme-number${x}`,
           "version": "1.0.13",
           "description": "Simple online marketplace for selling files.",
           "keywords": [],
           "author": "Captain Fantasy <fantasyui.com@gmail.com> (http://fantasyui.com)",
           "license": "Standard Closed License",
           "bugs": {
             "url": "https://github.com/fantasyui-com/online-marketplace/issues"
           },
           "homepage": "https://github.com/fantasyui-com/online-marketplace#readme",
           "dependencies": {}
         };


         response.push(product);
       }


     } else {
       throw new Error(`Unknown value id request in getValue. You must add a "${id.replace(/[^a-zA-Z0-9_-]/,'')}" reader getValue function.`);
     }

     return response;
   }



  isInvalid( type, value ){
    let INVALID = true;
    let IS_OK = false;

    if(type === 'username'){
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
      if(!req.userObject){
        return res.redirect(this.options.links.login);
      }
      // Verify that the user is considered to exist.
      const _id = req.userObject._id;
      let exists = await userManager.userExists(_id);
      if(!exists){
        return res.redirect(this.options.links.login);
      }
      next();
    }

    app.set("view engine", "hbs");

    //app.use( await this.model.bind(this) );

    this.options.structure.forEach( device => {
      const args = [device.path];
      if(device.method === 'post') args.push ( urlencodedParser ) ;


    args.push ( async (req, res, next) => {
      req.userManager = userManager;
      req.userObject = null;

      req.sessionStateReset = () => {
        req[this.options.clientSessionsCookieName].reset();
      };

      if( req[this.options.clientSessionsCookieName] && req[this.options.clientSessionsCookieName].username ){
          try {
            let user = await userManager.userGet(req[this.options.clientSessionsCookieName].username);
            // NOTE: model.user is only set when serManager.userGet is a success.
            req.userObject = user;
          } catch(err) {
            // there was a cooke, but user caused an error, remove cookie.
            req.sessionStateReset()
            res.redirect('/');
          }
          next();
        }else{
          next();
        }
      });


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



    let routeInstaller = [];
    this.options.structure.forEach(async device => {
      routeInstaller.push(new Promise(async (resolve, reject) => {

        const args = [device.path];

        if(device.method === 'post') args.push ( urlencodedParser ) ;

        if(device.login) args.push ( validUserIsRequired ) ;



        args.push ( async (req, res, next) => {
          req.state = Object.assign({title:'?'}, this.options.model);
          req.state.link  = this.options.links;
          if(device.values){
            // scan list of values....
            const valuePromises = [];
            device.values.forEach(async valueObject => {
              valuePromises.push(new Promise(async (resolve, reject) => {
                // and fetch that value, assigning it to state.
                req.state[ valueObject.id ] = await this.getValue(Object.assign({},valueObject,{req}));
                resolve();
              }));
            });
            await Promise.all( valuePromises );
          }
          next();
        });

        let routeInstaller = require(device.module).bind(this);
        let deviceRoute = await routeInstaller({options:device});
        args.push( deviceRoute );

         //c-onsole.log(`${device.method}: Mounting ${device.module} on ${device.path}`)

        app[device.method].apply( app, args );

        resolve();
      }))
    });
    await Promise.all( routeInstaller );

    // app.get("/", (req, res) => {
    //   res.render("index", req.state );
    // });
    //

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
