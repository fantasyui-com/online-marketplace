const express = require("hardened-express");
const requestValidator = function(req, res, next){

}
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

    let defaults = { };
    this.options = Object.assign({}, defaults, configuration);
    this.app = express();

   }

  async model (req, res, next) {

        req.state = {};

        req.state.model = this.options.baseStateModel;
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

            console.log(err)
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

      if( value.match(/[^a-z0-9-]/) ) return INVALID;

      return IS_OK;

    } else if(type === 'password'){

        if( value.length < 10 ) return INVALID;
        if( zxcvbn(value).score < 3 ) return INVALID;

        return IS_OK;

    } else if(type === 'first-name'){
      if( value.length < 2 ) return INVALID;
      if( !validator.isAlpha(value) ) return INVALID;
      return IS_OK;

    } else if(type === 'last-name'){
      if( value.length < 2 ) return INVALID;
      if( !validator.isAlpha(value) ) return INVALID;
      return IS_OK;

    } else if(type === 'email'){

      if( !validator.isEmail(value) ) return INVALID;
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

    const userIsRequired =  async (req, res, next) => {
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



    let routeDefinition = {
      path: '/legal',
      form: [
        {name:'', type:'', optional:true}
      ]

    };
    requestValidator( app, routeDefinition )

    app.set("view engine", "ejs");

    app.use( await this.model.bind(this) );


    app.get("/", (req, res) => {
      res.render("index", req.state );
    });

    app.get(this.options.links.legal, (req, res) => {
      res.render("legal", req.state );
    });

    app.get(this.options.links.about, (req, res) => {
      res.render("about", req.state );
    });

    app.get(this.options.links.products, (req, res) => {
      res.render("browse", req.state );
    });

    app.get(this.options.links.user, userIsRequired, (req, res) => {
      res.render("user", req.state );
    });

    app.post(this.options.links.support, urlencodedParser, userIsRequired, async (req, res) => {
      const _id = req.state.model.user._id;
      let updateData = {};

      // NOTE: This is tainted and requires validation.

      const supportSubject = req.body.subject;
      const supportMessage = req.body.message;

      // TODO: send message...


      res.redirect(this.options.links.user);

    });


    app.post(this.options.links.update, urlencodedParser, userIsRequired, async (req, res) => {
      const _id = req.state.model.user._id;
      let updateData = {};

      // NOTE: This is tainted and requires validation.
      const newEmail = req.body.new_email;
      if(newEmail){
        if( this.isInvalid('email', newEmail) ){
          return res.render("error", Object.assign({}, req.state, {message: 'Invalid Email Address'} ));
        }
        updateData.email = newEmail;
      }

      // NOTE: This is tainted and requires validation.
      const newFirstName = req.body.new_first_name;
      if(newFirstName){
        if( this.isInvalid('first-name', newFirstName) ){
          return res.render("error", Object.assign({}, req.state, {message: 'Invalid First Name'} ));
        }
        updateData.firstName = newFirstName;
      }

      // NOTE: This is tainted and requires validation.
      const newLastName = req.body.new_last_name;
      if(newLastName){
        if( this.isInvalid('last-name', newLastName) ){
          return res.render("error", Object.assign({}, req.state, {message: 'Invalid Last Name'} ));
        }
        updateData.lastName = newLastName;
      }

      // << HEY! GOT MORE FIELDS?, ADD THEM HERE... >>

      const changesNeedToBeMade = (Object.keys(updateData).length > 0);
      if(changesNeedToBeMade){

        let user = await userManager.userGet(_id);

        const things = [];
        Object.keys(updateData).forEach(key=>{
          let val = updateData[key];
          if(updateData[key] !== user[key]){
            things.push( kebabCase(key).replace(/-/,' ') );
          }
        });
        console.log('THings',things)
        if(things.length){
          user.notes.push( `${new Date()}: Updated ${things.join(', ')}.` );
        }
        Object.assign({}, user, updateData);
        await userManager.userMod(_id, user);

      }
      res.redirect(this.options.links.user);

    });


    app.post(this.options.links.password, urlencodedParser, userIsRequired, async (req, res) => {
      const _id = req.state.model.user._id;
      let updateData = {};

      // This is tainted and requires validation.
      const newPassword = req.body.new_password;
      if(newPassword){
        if( this.isInvalid('password', newPassword) ){
          return res.render("error", Object.assign({}, req.state, {message: 'New password is too weak or invalid.'} ));
        }
      }else{
        // no password, no change.
        return res.redirect(this.options.links.user);
      }

      const oldPassword = req.body.old_password;
      // NOTE: oldPassword is tainted but does not require string validation it self, we are trying to get rid of it.
      if(!oldPassword){
        return res.render("error", Object.assign({}, req.state, {message: 'Password is required to update this information.'} ));
      }

      const changesNeedToBeMade = (newPassword);

      if(changesNeedToBeMade){ // there are changes
          let user = await userManager.userGet(_id);
          if(user.password === oldPassword){
            user.notes.push( `${new Date()}: Changed password.` );
            user.password = newPassword;
            Object.assign({}, user, updateData);
            await userManager.userMod(_id, user);
            res.redirect(this.options.links.user);
          } else {
            return res.render("error", Object.assign({}, req.state, {message: 'The password you entered was invalid and no changes have been made to the account.'} ));
          }
          // NOTE: These changes do not require user's password.
          await userManager.userMod(_id, updateData);
       } // there are changes

      res.redirect(this.options.links.user);

    });








    app.get(this.options.links.login, (req, res) => {

      if(req.state.model.user){
        // NOTE: if user is logged in they are not allowed to access the login page until they log-out.
        return res.redirect(this.options.links.user);
      }

      res.render("login", req.state )
    });

    app.post(this.options.links.login, urlencodedParser, async (req, res) => {

      let username = req.body.username;
      let password = req.body.password;

      if( this.isInvalid('username', username) ){
        return res.render("error", Object.assign({}, req.state, {message: 'Invalid Username'} ));
      }

      // NOTE: this means that if user somehow got a bad password into the db, they will not be able to login
      if( this.isInvalid('password', password) ){
        return res.render("error", Object.assign({}, req.state, {message: 'Invalid Password'} ));
      }

      try {

        let exists = await userManager.userExists(username);
        if(exists){

          let user = await userManager.userGet(username);
          // compare passwords
          if(user.password === password){
            // yay! user is valid.
            req[this.options.clientSessionsCookieName].username = username;
            res.redirect(this.options.links.user);
          }else{
            return res.render("error", Object.assign({}, req.state, {message: 'Invalid Password'} ));
          }
        }else{
          return res.render("error", Object.assign({}, req.state, {message: 'Invalid Username'} ));
        }

      } catch(err){

        throw err;
      }

    });



    app.get(this.options.links.signup, (req, res) => { res.render("signup", req.state ) });

    app.post(this.options.links.signup, urlencodedParser, async (req, res) => {

      let username = req.body.username;
      let password = req.body.password;

      if( this.isInvalid('username', username) ){
        return res.render("error", Object.assign({}, req.state, {message: 'Invalid Username'} ));
      }

      if( this.isInvalid('password', password) ){
        return res.render("error", Object.assign({}, req.state, {message: 'Invalid Password'} ));
      }

      try {

        // NOTE: due to race conditions we can only know if the userManager.userAdd was a success.
        // userManager.userAdd will throw if username already exists.

        await userManager.userAdd(username, {password, notes:[`${new Date()}: Account Creation`]});

        // NOTE: even though it it spossible to set req[this.options.clientSessionsCookieName].username right here, we don't do that.
        // there will be just one place where that value is assigned, the login page.
        // DONOT: req[this.options.clientSessionsCookieName].username = username;

      } catch(err){

        if(err.message.startsWith('OBJECT_ALREADY_EXISTS') ){
          return res.render("error", Object.assign({}, req.state, {message: 'Username is taken, try again.'} ));
        }

        throw err;
      }

      // redirect to user to login page.
      res.redirect(this.options.links.login);

    });



    app.get(this.options.links.logout, function (req, res) {
      req.state.command.sessionStateReset()
      res.redirect('/');
    });

    app.get(this.options.links.confirm, userIsRequired, async (req, res) => {

      if(req.state.model.user && (req.state.model.user.email !== req.state.model.user.confirmed)){
        // NOTE: email is already confirmed send the user home
        return res.redirect(this.options.links.user);
      }

      if(req.query.code){

        let codeIsValid = false;
        let userHashValid = false;

        if(codeIsValid && userHashValid){ // checks if the confirmation is for the current email
          await userManager.userMod(_id, {confirmed:req.state.model.user.email});
          return res.redirect(this.options.links.user);
        }

      }

      res.render("confirm", req.state);

    });

    app.post(this.options.links.confirm, urlencodedParser, userIsRequired, async (req, res) => {

      if(req.state.model.user && (req.state.model.user.email !== req.state.model.user.confirmed)){
        // NOTE: email is already confirmed send the user home
        return res.redirect(this.options.links.user);
      }

      let codeIsValid = false;
      let userHashValid = false;

      if(codeIsValid && userHashValid){ // checks if the confirmation is for the current email
        await userManager.userMod(_id, {confirmed:req.state.model.user.email});
      }

      return res.redirect(this.options.links.user);

    });





    this.app.listen(this.options.serverPort, this.options.serverHostname, () => {
      console.log(`Server running at http://${this.options.serverHostname}:${this.options.serverPort}/`);
      if (process.send) process.send('ready');
    });

  }

}

module.exports = OnlineMarketplace;
