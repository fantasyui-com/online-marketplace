module.exports = async function({options}){

  return async (req, res) => {

    /// NOTE: NETSEC: these have already been validated by the security middleware.
    let username = req.body.username;
    let password = req.body.password;

    let exists = await req.userManager.userExists(username);
    // NOTE: note the early exit if user does not exist.
    if(!exists){
      return res.render("error", Object.assign({}, req.state, {message: 'Invalid Username'} ));
    }

    let user = await req.userManager.userGet(username);
    // NOTE: note the early exit.
    if(user.password !== password){
      return res.render("error", Object.assign({}, req.state, {message: 'Invalid Password'} ));
    }

    // NOTE: NETSEC: this is not a normal cookie, the client side can't tamper with it.
    // yay they made it! user is valid, gets the session setup
    req[this.options.clientSessionsCookieName].username = username;

    // log the activity
    user.notes.push( `${new Date()}: Login` );
    await req.userManager.userMod(username, user);

    // and redirect to home page.
    return res.redirect(this.options.links.user);

  }

}
