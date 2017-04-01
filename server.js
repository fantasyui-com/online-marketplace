const OnlineMarketplace = require('./index.js');

// Tip: You want to load this from a file or some safe place.

const onlineMarketplace = new OnlineMarketplace({

  clientSessionsSecret: 'eef62de5-6755-4353-a21e-042471e71bc3', // set this to a long random string!

  serverPort: 8080,
  serverHostname: '127.0.0.1',

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
  },

  baseStateModel: {

    primaryTitle: `Online Marketplace`,
    primaryDescription: `Online Marketplace`,
    primaryAuthor: `Captain Fantasy <fantasyui.com@gmail.com> (http://fantasyui.com)`,
    primaryUrl: `http://fantasyui.com`,

  }

});

onlineMarketplace.listen();
