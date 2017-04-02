module.exports = async function({options}){

  return async (req, res) => {

    if(req.state.model.user && (req.state.model.user.email !== req.state.model.user.confirmed)){
      // NOTE: email is already confirmed send the user home
      return res.redirect(this.options.links.user);
    }

    if(req.query.code){

      let codeIsValid = false;
      let userHashValid = false;

      if(codeIsValid && userHashValid){ // checks if the confirmation is for the current email
        await req.userManager.userMod(_id, {confirmed:req.state.model.user.email});
        return res.redirect(this.options.links.user);
      }

    }

    res.render("confirm", req.state);

  }

}
