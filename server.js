const pkg = require(__dirname + '/package.json');
const OnlineMarketplace = require('./index.js');
// Tip: You want to load this from a file or some safe place.
const onlineMarketplace = new OnlineMarketplace({

  // NOTE: Loose lips sink ships.
  // setting production to true will lower the ammount of error information shared with the user.
  // to harden the server to maximum disable structure device verbosity.
  production: false,

  port: 8080,
  host: '127.0.0.1',

  clientSessionsSecret: 'eef62de5-6755-4353-a21e-042471e71bc3', // set this to a long random string!
  clientSessionsCookieName: 'a138b116567ba', // set this to something random and unique to your program.

  /* Strict Structure Declaration */

  /* NOTE:
    Please be mindfull of endles loops of redirects from home -> home,
    due to rules you may set below place as little demand on the home page as possible.
  */

  structure: [
    {
      name: "home",
      module: "./api/render.js",
      method: 'get',
      path: "/",
      view: 'index',
      data: [],
      values: [
        { id: 'isLoggedIn' },
        { id: 'username' },
        { id: 'featuredProducts' },
        { id: 'popularProducts' },
      ]
    },

    {
      name: "about",
      module: "./api/render.js",
      method: 'get',
      view: 'about',
      path: "/about",
      data: [],
      values: [
        { id: 'isLoggedIn' },
      ]
    },

    {
      name: "legal",
      module: "./api/render.js",
      method: 'get',
      view: 'legal',
      path: "/legal",
      data: [],
      values: [
        { id: 'isLoggedIn' },
      ]
    },

    {
      name: "products",
      module: "./api/render.js",

      method: 'get',
      view: 'products',
      path: "/products",
      data: [],
      values: [
        { id: 'isLoggedIn' },
        { id: 'browseProducts' },
      ]
    },


    { name: "signup", module: "./api/signup/form.js", method: 'get', view: "signup", path: "/signup", data: [], values: [{id:'isLoggedIn'}]},
    {
      name: "signup-handler",
      module: "./api/signup/handler.js",
      method: 'post',
      path: "/signup",
      verbose: true, /* show errors when signing up */
      data: [
        { id: 'username', type: 'username', required:true },
        { id: 'password', type: 'password', required:true }
      ],
      values: [
        { id: 'isLoggedIn' },
      ]
    },

    { name: "login", module: "./api/login/form.js", method: 'get', view: "login", path: "/login", data: [], values: [{id:'isLoggedIn'}]},
    {
      name: "login-handler",
      module: "./api/login/handler.js",
      method: 'post',
      path: "/login",
      verbose: true, /* show errors when signing up */
      data: [
        { id: 'username', type: 'username', required:true },
        { id: 'password', type: 'password', required:true }
      ],
      values: [
        { id: 'isLoggedIn' },
      ]
    },

    /* Authenticated User Functions Section */

    {
      name: "user",
      module: "./api/user/home.js",
      login: true, // login is required
      method: 'get',
      view: "user",
      path: "/user",
      data: [],
      values: [ /* Only these values will be made available to the view */

        { id: 'isLoggedIn' },

        { id: 'username',  },
        { id: 'email',     },
        { id: 'firstName', },
        { id: 'lastName',  },

        { id: 'purchasedItems' },
        { id: 'recentActivity' },
        { id: 'accountActions' },

      ]
    },


    {
      name: "update-profile",
      description: "update user profile",
      module: "./api/user/update-profile.js",
      login: true, // login is required
      verbose: true, /* show errors when attempting to update profile */
      method: 'post',
      path: '/update-profile',
      data: [
        { id: 'email',      type: 'email',      required:false },
        { id: 'firstName',  type: 'first-name', required:false },
        { id: 'lastName',   type: 'last-name',  required:false }
      ],
    },

    {
      name: "update-password",
      description: "update user password",
      module: "./api/user/update-password.js",
      login: true, // login is required
      verbose: true, /* show errors when attempting to update profile */
      method: 'post',
      path: '/update-password',
      data: [
        { id: 'currentPassword', type: 'password', required:true },
        { id: 'newPassword', type: 'password', required:true },
      ],
    },

    /* post only */
    {
      name: "support-contact",
      description: "send a message to tech support",
      module: "./api/support/contact.js",
      login: true, // login is required
      verbose: true, /* show errors when attempting to communicate */
      method: 'post',
      path: '/support-contact',
      data: [
        { id: 'subject', type: 'text', required:true },
        { id: 'message', type: 'text', required:true }
      ],
    },

    /* Utility Section */
    { name: "logout", module: "./api/logout.js", method: 'get', path: "/logout", data: [] },

  ],

  /* pass any/all variables you may need at run-time */
  model: {
    title: `Fantasy Marketplace`,
    description: `A Fantastic Online Marketplace: Build amazing things, join the sustainable lightweight design revolution.`,
    author:  pkg.author,
    program: pkg.name,
    version: pkg.version,
    license: pkg.license,

  }
});
onlineMarketplace.listen();
