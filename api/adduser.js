module.exports = async function({options}){

  return async (req, res) => {


          let username = req.body.username;
          let password = req.body.password;

          if( this.isInvalid('username', username) ){
            return res.render("error", Object.assign({}, req.state, {message: 'Invalid Username'} ));
          }

          if( this.isInvalid('password', password) ){
            return res.render("error", Object.assign({}, req.state, {message: 'Invalid Password'} ));
          }

          try {

            // NOTE: due to race conditions we can only know if the req.userManager.userAdd was a success.
            // req.userManager.userAdd will throw if username already exists.

            await req.userManager.userAdd(username, {password, notes:[`${new Date()}: Account Creation`]});

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

  }

}
