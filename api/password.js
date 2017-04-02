module.exports = async function({options}){

  return async (req, res) => {

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
      let user = await req.userManager.userGet(_id);
      if(user.password === oldPassword){
        user.notes.push( `${new Date()}: Changed password.` );
        user.password = newPassword;
        Object.assign(user, updateData);
        await req.userManager.userMod(_id, user);
      } else {
        return res.render("error", Object.assign({}, req.state, {message: 'The password you entered was invalid and no changes have been made to the account.'} ));
      }
     } // there are changes

    res.redirect(this.options.links.user);

  }

}
