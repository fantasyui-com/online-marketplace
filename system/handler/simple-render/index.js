module.exports = async function({route}){

  return async (req, res) => {
    // VERIFY THAT THE OUTPUT DOES NOT CONTAIN javascript: or data:
    // VERIGYT THAT THE OUTPUT does not contain any script tags.

    console.log("Request for: %s", route.urlPath)

    console.log(req.model)

    res.render(route.viewId, req.model );

  }

}
