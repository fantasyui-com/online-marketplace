module.exports = async function({options}){

  return async (req, res) => {

    res.render(options.view, req.state );

  }

}
