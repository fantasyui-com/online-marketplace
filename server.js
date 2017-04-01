const pkg = require(__dirname+'/package.json');
const OnlineMarketplace = require('./index.js');

// Tip: You want to load this from a file or some safe place.

const onlineMarketplace = new OnlineMarketplace({

                serverPort: 8080,
            serverHostname: '127.0.0.1',

      clientSessionsSecret: 'eef62de5-6755-4353-a21e-042471e71bc3', // set this to a long random string!
  clientSessionsCookieName: 'a138b116567ba', // set this to something random and unique to your program.


  // ability to configure links
  links: {
       home: "/",
      about: "/about",
   products: "/browse",
      legal: "/legal",
       user: "/home",
      login: "/login",
     logout: "/logout",
     signup: "/signup",
    confirm: "/confirm",

    support: '/support', // send a message to tech support

    update: '/update', // update user profile
    password: '/password', // update user password
  },

  baseStateModel: {

    title: `Fantasy Marketplace`,
    description: `Online Marketplace`,
    author: `Captain Fantasy <fantasyui.com@gmail.com> (http://fantasyui.com)`,
    version: pkg.version,
    license: pkg.license,
  }

});

onlineMarketplace.listen();
