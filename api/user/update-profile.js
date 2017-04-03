module.exports = async function({options}){

  return async (req, res) => {

    // NOTE: Please note that req.body has already been validated.
    // and please note the simplicity that results from leaving security to
    // security specific middleware.

    if(Object.keys(req.body).length){
      let user = await req.userManager.userGet(req.userObject._id);
      user.notes.push( `${new Date()}: Updated ${Object.keys(req.body).join(', ')}.` );
      await req.userManager.userMod(req.userObject._id, Object.assign(user, req.body));
    }

    res.redirect(this.options.links.user);

  }

}
