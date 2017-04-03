module.exports = async function({options}){

  return async (req, res) => {

    if(req.state.isLoggedIn){
      // NOTE: if user is logged in they are not allowed to access the signup page until they log-out.
      return res.redirect(this.options.links.user);
    }

    res.render(options.view, req.state );

  }

}
