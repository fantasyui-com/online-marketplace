module.exports = async function({options}){

  return async (req, res) => {

    const _id = req.state.model.user._id;
    let updateData = {};

    // NOTE: This is tainted and requires validation.
    const newEmail = req.body.email;
    if(newEmail){
      if( this.isInvalid('email', newEmail) ){
        return res.render("error", Object.assign({}, req.state, {message: 'Invalid Email Address'} ));
      }
      updateData.email = newEmail;
    }

    // NOTE: This is tainted and requires validation.
    const newFirstName = req.body.first_name;
    if(newFirstName){
      if( this.isInvalid('first-name', newFirstName) ){
        return res.render("error", Object.assign({}, req.state, {message: 'Invalid First Name'} ));
      }
      updateData.firstName = newFirstName;
    }

    // NOTE: This is tainted and requires validation.
    const newLastName = req.body.last_name;
    if(newLastName){
      if( this.isInvalid('last-name', newLastName) ){
        return res.render("error", Object.assign({}, req.state, {message: 'Invalid Last Name'} ));
      }
      updateData.lastName = newLastName;
    }

    // << HEY! GOT MORE FIELDS?, ADD THEM HERE... >>
    console.log( updateData );
    const changesNeedToBeMade = (Object.keys(updateData).length > 0);

    if(changesNeedToBeMade){
      let user = await req.userManager.userGet(_id);

      const things = [];
      Object.keys(updateData).forEach(key=>{
        let val = updateData[key];
        if(updateData[key] !== user[key]){
          things.push( kebabCase(key).replace(/-/,' ') );
        }
      });
      if(things.length){
        user.notes.push( `${new Date()}: Updated ${things.join(', ')}.` );
      }
      Object.assign(user, updateData);
      await req.userManager.userMod(_id, user);

    }

    res.redirect(this.options.links.user);

  }

}
