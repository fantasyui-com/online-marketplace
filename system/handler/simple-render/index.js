module.exports = async function({route}){

  return async (req, res) => {

    //TODO: VERIFY THAT THE OUTPUT DOES NOT CONTAIN JAVASCRIPT: OR DATA:
    //TODO: VERIFY THAT THE OUTPUT DOES NOT CONTAIN SCRIPT TAGS.

    res.render(route.viewId, req.model );

  }

}
