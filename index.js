const fs = require("fs");
const path = require("path");

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
  if(level<3) display = 'display-4';
  return `<a name="${anchor}"><h${level} class="${display}" style="padding-top: 6rem; padding-bottom: 3rem;">${primary} <span class="lead text-muted"> ${secondary} </span> </h${level}>`;
}

renderer.listitem = function (text) { return `<li class="pb-2">${text}</li>` }
renderer.paragraph = function (text) { return `<p class="lead">${text}</p>` }
marked.setOptions({ renderer });

const xssFilters = require('xss-filters');
hbs.registerHelper('about', function(str) { return marked( fs.readFileSync(path.join(__dirname,'ABOUT.md')).toString() ) });
hbs.registerHelper('mangle', function(str) { return str.split("").map(i=>i.charCodeAt(0)-1).map(i=>String.fromCharCode(i)).join("")} );
hbs.registerHelper('inHTMLData', function(str) { return xssFilters.inHTMLData(str); });
hbs.registerHelper('inSingleQuotedAttr', function(str) { return xssFilters.inSingleQuotedAttr(str); });
hbs.registerHelper('inDoubleQuotedAttr', function(str) { return xssFilters.inDoubleQuotedAttr(str); });
hbs.registerHelper('inUnQuotedAttr', function(str) { return xssFilters.inUnQuotedAttr(str); });

const express = require('express');
const app = express();

app.set('views', [ path.join(__dirname, 'system', 'view') ]);
app.set("view engine", "hbs");

const middlewareInstaller = require( path.join(__dirname, 'system', 'middleware', 'installer') );
const catchAll = require( path.join(__dirname, 'system', 'middleware', 'catch-all') );
const errorHandler = require( path.join(__dirname, 'system', 'middleware', 'error-handler') );

async function configure(conf){
  await middlewareInstaller({app,conf});
  await catchAll({app,conf});
  await errorHandler({app,conf});
  return app;
}

module.exports = {
    install: async function(o){
      const configured = await configure(o);
      return configured;
    }
};
