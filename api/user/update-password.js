module.exports = async function({options}){

  return async (req, res) => {

    // NOTE: Please note that req.body has already been validated.
    // and please note the simplicity that results from leaving security to
    // security specific middleware.

    let user = await req.userManager.userGet(req.userObject._id);
    if(req.body.currentPassword !== user.password) return res.render("error", Object.assign({}, req.state, {message: 'A valid password is required to update this information.'} ));
    user.notes.push( `${new Date()}: Changed password.` );
    await req.userManager.userMod(req.userObject._id, Object.assign(user, {password:req.body.newPassword} ));
    res.redirect(this.options.links.user);

  }

}
