module.exports = async function({options}){

  return async (req, res) => {

    let username = req.body.username;
    let password = req.body.password;

    // NOTE: the following means malformed username and not not necessarily no user, security only benefits from this.
    if( this.isInvalid('username', username) ){
      return res.render("error", Object.assign({}, req.state, {message: 'Invalid Username'} ));
    }

    // NOTE: this means that if user somehow got a bad password into the db, they will not be able to login
    if( this.isInvalid('password', password) ){
      return res.render("error", Object.assign({}, req.state, {message: 'Invalid Password'} ));
    }

    let exists = await req.userManager.userExists(username);
    // NOTE: note the early exit.
    if(!exists){
      return res.render("error", Object.assign({}, req.state, {message: 'Invalid Username'} ));
    }

    let user = await req.userManager.userGet(username);
    // NOTE: note the early exit.
    if(user.password !== password){
      return res.render("error", Object.assign({}, req.state, {message: 'Invalid Password'} ));
    }

    // yay they made it! user is valid, gets the session setup
    req[this.options.clientSessionsCookieName].username = username;

    // log the activity
    user.notes.push( `${new Date()}: Login` );
    await req.userManager.userMod(username, user);

    // and redirect to home page.
    return res.redirect(this.options.links.user);

  }

}
