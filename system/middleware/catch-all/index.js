module.exports = async function({app,conf}) {
  app.get('*',function (req, res) { res.redirect('/') });
}
