module.exports = async function({options}){

  return async (req, res) => {

    if(req.state.model.user){
      // NOTE: if user is logged in they are not allowed to access the login page until they log-out.
      return res.redirect(this.options.links.user);
    }
    res.render(options.view, req.state );

  }

}
