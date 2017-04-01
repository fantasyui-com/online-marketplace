const express = require("express");
const clientSessions = require("client-sessions");
const body = require("body-parser");

const UserManager = require("user-manager");
const userManager = new UserManager({storeLocation: './user-accounts/' ,});

class OnlineMarketplace {

  constructor(configuration) {

    let defaults = { };
    this.options = Object.assign({}, defaults, configuration);
    this.app = express();

   }

  async model(){

     return async (req, res, next) => {


        req.state = {};
        req.state.model = this.options.baseStateModel;
        req.state.link = this.options.links;

        // by default model user is null.
        req.state.model.user = null;

        req.state.command = {};
        req.state.command.sessionStateReset = function(){ req.session_state.reset(); };

        if( req.session_state.username ){

          try {

            let user = await userManager.userGet(req.session_state.username);
            // NOTE: model.user is only set when serManager.userGet is a success.
            req.state.model.user = user;

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

  }

  isInvalid( type, value ){
    let INVALID = true;
    let IS_OK = false;

    if(type === 'username'){

      if( value.match(/[^a-z0-9-]/) ) return INVALID;

      return IS_OK;

    } else if(type === 'password'){
        if( value.length < 10 ) return INVALID;
        return IS_OK;

    } else if(type === 'email'){

      if( value.match(/^[a-zA-Z0-9_+.-]+@[a-zA-Z_]/ ) ) return IS_OK;
      return INVALID;

    }else{
      // Whatever it is, there was no validator for it, it is invalid.
    }

    return INVALID;
  }

  async listen() {

    let app = this.app;

    app.use(clientSessions({
        secret: this.options.clientSessionsSecret
    }));

    app.use(body.urlencoded({
        extended: true
    }));

    app.set("view engine", "ejs");

    app.use( await this.model() );

    app.get("/", (req, res) => {
      res.render("index", req.state );
    });

    app.get(this.options.links.user, (req, res) => {
      if(!req.state.model.user){
        // NOTE: accessing /user when there is no model.user is pointless and will redirect to login.
        return res.redirect(this.options.links.login);
      }

      res.render("user", req.state );

    });

    app.post(this.options.links.user, async (req, res) => {

      if(!req.state.model.user){
        // NOTE: accessing /user when there is no model.user is pointless and will redirect to login.
        // posting to this page is only possible if user had a successful login that resulted in proper session username
        return res.redirect(this.options.links.login);
      }

      // get id from user object loaded by user manager based on encrypted session, set from within the sever code.
      var _id = req.state.model.user._id;
      // user id or username cannot be changed.

      // NOTE: we will be building the object based on what came over,
      // if the user did not send in a new password, no changes to the password will be made.
      // we begin with an empty object.
      let updateData = {};

      // these are tainted and require validation
      var newEmail = req.body.user_email;
      if(newEmail){
        if( this.isInvalid('email', newEmail) ){
          return res.render("error", Object.assign({}, req.state, {message: 'Invalid Email Address'} ));
        }
        updateData.email = newEmail;
      }

      // these are tainted and require validation
      var newPassword = req.body.user_password;
      if(newPassword){
        if( this.isInvalid('password', newPassword) ){
          return res.render("error", Object.assign({}, req.state, {message: 'Invalid Password'} ));
        }
        updateData.password = newPassword;
      }

      if(Object.keys(updateData).length > 0){
        await userManager.userMod(_id, updateData);
      }

      // upon updating information, the user is redirected.
      res.redirect(this.options.links.user);

    });

    app.get(this.options.links.login, (req, res) => {

      if(req.state.model.user){
        // NOTE: if user is logged in they are not allowed to access the login page until they log-out.
        return res.redirect(this.options.links.user);
      }

      res.render("login", req.state )
    });

    app.post(this.options.links.login, async (req, res) => {

      let username = req.body.username;
      let password = req.body.password;

      if( this.isInvalid('username', username) ){
        return res.render("error", Object.assign({}, req.state, {message: 'Invalid Username'} ));
      }

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
            req.session_state.username = username;
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

    app.post(this.options.links.signup, async (req, res) => {

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

        // NOTE: even though it it spossible to set req.session_state.username right here, we don't do that.
        // there will be just one place where that value is assigned, the login page.
        // DONOT: req.session_state.username = username;

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


    app.get(this.options.links.confirm, async (req, res) => {

      if(!req.state.model.user){
        // NOTE: accessing email confirmation when there is no model.user is pointless and will redirect to login.
        return res.redirect(this.options.links.login);
      }

      if(req.state.model.user && req.state.model.user.emailConfirmed){
        // NOTE: email is already confirmed send the user home
        return res.redirect(this.options.links.user);
      }

      if(req.query.code){
        if(codeIsValid){
          await userManager.userMod(_id, {emailConfirmed:true});
          return res.redirect(this.options.links.user);
        }
      }
      res.render("confirm", req.state);
    });

    app.post(this.options.links.confirm, async (req, res) => {

      if(!req.state.model.user){
        // NOTE: accessing email confirmation when there is no model.user is pointless and will redirect to login.
        return res.redirect(this.options.links.user);
      }

      if(req.state.model.user && req.state.model.user.emailConfirmed){
        // NOTE: email is already confirmed send the user home
        return res.redirect(this.options.links.user);
      }

      if(codeIsValid){
        await userManager.userMod(_id, {emailConfirmed:true});
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
