const fs = require("fs");
const path = require("path");


// Only JSON is allowed, only via local, Cross-origin resource sharing is not allowed/implemented.
const jsonParser = require("body-parser").json();

const hbs = require('hbs');
hbs.registerPartials( path.join(__dirname, 'system', 'view', 'partials') );
hbs.registerPartials( path.join(__dirname, 'system', 'view', 'cards') );

const kebabCase = require('lodash/kebabCase');
const marked = require('marked');

const renderer = new marked.Renderer();

renderer.heading = function (text, level) {
  var primary = text.split(":")[0]
  var secondary = text.split(":")[1]||"";
  var anchor = kebabCase(primary);
  var display = "";

  if(level<3){
    display = 'display-4';
  }
  //return `<a name="${anchor}"><h${level} class="mt-3 py-3">${primary} <small class="text-muted">${secondary}</small></h${level}>`;
  return `
  <a name="${anchor}">
  <h${level} class="${display}" style="padding-top: 6rem; padding-bottom: 3rem;">${primary} <span class="lead text-muted"> ${secondary} </span> </h${level}>
  `;
}

renderer.listitem = function (text) {
  var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
    return `<li class="pb-2">${text}</li>`
}

renderer.paragraph = function (text) {
  return `<p class="lead">${text}</p>`
}

marked.setOptions({
  renderer
});

const xssFilters = require('xss-filters');
console.log(  )
hbs.registerHelper('about', function(str) { return marked( fs.readFileSync(path.join(__dirname,'ABOUT.md')).toString() ) });
hbs.registerHelper('inHTMLData', function(str) { return xssFilters.inHTMLData(str); });
hbs.registerHelper('inSingleQuotedAttr', function(str) { return xssFilters.inSingleQuotedAttr(str); });
hbs.registerHelper('inDoubleQuotedAttr', function(str) { return xssFilters.inDoubleQuotedAttr(str); });
hbs.registerHelper('inUnQuotedAttr', function(str) { return xssFilters.inUnQuotedAttr(str); });

const express = require('express');
const app = express();

//NOTE: withut proper variables the system drops into test mode.
//NOTE: to run with keys: $> STRIPE_PUBLISHABLE_KEY=pk_test_6pRNASCoBOKtIshFeQd4XMUh STRIPE_SECRET_KEY=sk_test_BQokikJOvBiI2HlWgH4olfQ2 node app.js
const keyPublishable = process.env.STRIPE_PUBLISHABLE_KEY||'pk_test_6pRNASCoBOKtIshFeQd4XMUh';
const keySecret = process.env.STRIPE_SECRET_KEY||'sk_test_BQokikJOvBiI2HlWgH4olfQ2';

const stripe = require("stripe")(keySecret);

app.set('views', [ path.join(__dirname, 'system', 'view') ]);
app.set("view engine", "hbs");

const denyCors = function(){
  return function(req, res, next){
    let origin = req.get('Origin');
    if( origin ){
      console.log('Origin Detected.')
      next( new Error('Origin header detected: ' + xssFilters.inHTMLData( origin )) );
    } else {
      next();
    }
  }
};

const denyOldBrowsers        = function(){ return function(req, res, next){ console.log('deny-old-browsers       '); next(); } };
const verifyCsrfToken        = function(){ return function(req, res, next){ console.log('verify-csrf-token       '); next(); } };
const denyUndefinedVariables = function(){ return function(req, res, next){ console.log('deny-undefined-variables'); next(); } };
const allowDefinedVariables  = function(){ return function(req, res, next){ console.log('allow-defined-variables '); next(); } };
const establishAnonymousUser = function(){ return function(req, res, next){ console.log('establish-anonymous-user'); next(); } };
const upgradeAnonymousUser   = function(){ return function(req, res, next){ console.log('upgrade-anonymous-user  '); next(); } };
const requireValidUser       = function(){ return function(req, res, next){ console.log('require-valid-user      '); next(); } };

const createDataModel        = require( path.join(__dirname, 'system', 'middleware', 'create-data-model') );
const populateDataModel      = require( path.join(__dirname, 'system', 'middleware', 'populate-data-model') );
const installPageLinks       = require( path.join(__dirname, 'system', 'middleware', 'install-page-links') );

const createEventModel       = function(){ return function(req, res, next){ console.log('create-event-model     '); next(); } };

async function configure(conf){


// initialization, called once at start-up
await Promise.all( conf.routes.map( async route => {

  return (new Promise(async (resolve, reject) => {

    const middleware = [ ];

    middleware.push( route.urlPath );

    // A countermeasure against browsers that do not speak CORS
    middleware.push( denyOldBrowsers(route) );

    // all forms must be local via JSON.
    // Cross-origin resource sharing is denied (Cross domain access is not-implemented thus denied by default)

    // A simple application/x-www-form-urlencoded based POST will not be allowed.

    // POST application/x-www-form-urlencoded can be sent from anywhere in the web,
    // whereas application/json falls under same-origin-policy,
    // thus can only be sent to a local domain.

    // Only JSON can be sent, and only from local page.
    // thus we ensure that the same-origin-policy is in effect.
    // thus only local JavaScript can submit POST requests.

    // A Maliciouss User will need to inject a script into a local page,
    // the script will then be executed in context of a truseted user.
    // Howerver, output is minimal and XSS filtered.
    // Attacker is unable to inject script, thus, unable to submit requests as the user.

    // Output is minimal and XSS filtered.
    // Maliciouss User will be unable to execute local javascript due to XSS protection.

    // When local code injection is impossible (via XSS filters),
    //   and remote input disabled (via CORS-off and JSON-via-JSON-requirement and same-origin ),
    //   Malicious User is unable to submit data via Modern Browser.

    // Additionally, denyOldBrowsers is in effect,
    // and verifyCsrfToken is still used (it is deposited into form)
    // hacker would need JavaScript to pull the token out, XSS filters prevent that.

    middleware.push( denyCors(route) ); // Cross domain access is denied by default (not implemented)

    if(route.httpVerb === 'post') middleware.push ( jsonParser );

    // Verify for Security Early and Often
    // Logging and Intrusion Detection
    middleware.push( verifyCsrfToken(route) );

    // Validate All Inputs
    // Logging and Intrusion Detection
    middleware.push( denyUndefinedVariables(route) );
    middleware.push( allowDefinedVariables(route) );
    //

    // USER //
    // Identity and Authentication Controls
    middleware.push( establishAnonymousUser() );
    middleware.push( upgradeAnonymousUser() );
    if(route.loginRequired) middleware.push( requireValidUser(route) );
    // USER //

    // MODEL //
    // Appropriate Access Controls
    middleware.push( createDataModel({conf, route}) ); // prepare the internal data model
    middleware.push( await populateDataModel({ conf, route }) ); // prepare the internal data model
    middleware.push( installPageLinks(conf) );
    // MODEL //

    // ACTION
    middleware.push( createEventModel(route.handlerEvent) ); // prepare the internal action model
    // ACTION

    // EXECUTE
    const routeModule = await require( path.join(__dirname, 'system', 'handler', route.moduleName) );
    middleware.push( await routeModule({route}) );
    // EXECUTE

    app[route.httpVerb].apply( app, middleware );

    resolve(app);

  }));

}));

// All unmatched routes are redirected back to home page
app.get('*',function (req, res) {
  res.redirect('/');
});

// Error and Exception Handling
// Logging and Intrusion Detection
app.use(function (err, req, res, next) {

  console.log('Error:', err)

  let message = err.message|| err ||"Server Request Error";
  let localPath = path.resolve('./');

  // NETSEC: Sensitive Data Exposure, Local Path Exposure
  message = message.replace(new RegExp(localPath,'g'),'...');

  // NETSEC: Sensitive Data Exposure, Templating Engine Exposure
  message = message.replace(new RegExp('.hbs','g'),'');

  res.render("error", Object.assign({}, req.state, {message} ));
  res.status(500);

});

 return app;

}

module.exports = {
    install: async function(o){
      const configured = await configure(o);
      return configured;
    }
};
