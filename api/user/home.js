module.exports = async function({options}){

  return async (req, res) => {

    // NOTE: NETSEC: This function requires authentication (forced by netsec middleware).
    res.render(options.view, req.state );

  }

}
