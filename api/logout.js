module.exports = async function({options}){

  return async (req, res) => {

    req.state.command.sessionStateReset()
    res.redirect('/');

  }

}
