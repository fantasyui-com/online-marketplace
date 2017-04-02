module.exports = async function({options}){

  return async (req, res) => {

    req.sessionStateReset()
    res.redirect('/');

  }

}
