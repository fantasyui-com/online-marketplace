const bcrypt = require('bcryptjs');

module.exports = async function({options}){

  return async (req, res) => {

    // NOTE: Please note that req.body has already been validated.
    // and please note the simplicity that results from leaving security to
    // security specific middleware.

    let user = await req.userManager.userGet(req.userObject._id);
    if( ! bcrypt.compareSync(req.body.currentPassword, user.password) ) return res.render("error", Object.assign({}, req.state, {message: 'A valid password is required to update this information.'} ));

    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync(req.body.newPassword, salt);

    user.notes.push( `${new Date()}: Changed password.` );
    await req.userManager.userMod(req.userObject._id, Object.assign(user, {password} ));
    res.redirect(this.options.links.user);

  }

}
