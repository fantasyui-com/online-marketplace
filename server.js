const pkg = require(__dirname + '/package.json');
const OnlineMarketplace = require('./index.js');
// Tip: You want to load this from a file or some safe place.
const onlineMarketplace = new OnlineMarketplace({

  port: 8080,
  host: '127.0.0.1',

  clientSessionsSecret: 'eef62de5-6755-4353-a21e-042471e71bc3', // set this to a long random string!
  clientSessionsCookieName: 'a138b116567ba', // set this to something random and unique to your program.

  /* Strict Structure Declaration */

  structure: [
    {
      method: 'get',
      path: "/",
      name: "home",
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
      method: 'get',
      view: 'about',
      path: "/about",
      data: [],
      values: [
        { id: 'isLoggedIn' },
      ]
    },


  ],

  old_structure: [

    /* NOTE:
      Please be mindfull of endles loops of redirects from home -> home,
      due to rules you may set below place as little demand on the home page as possible.
    */
    {
      name: "home",
      method: 'get',
      view: 'index',
      path: "/",
      data: [],
    },

    {
      name: "about",
      method: 'get',
      view: 'about',
      path: "/about",

      data: [{ id: 'test', type: 'email', required:false }], /* will bounce you to "/" unless test=valid@email.address */

    },

    {
      name: "products",
      method: 'get',
      view: "products",
      path: "/products",
      data: []
    },

    {
      name: "legal",
      method: 'get',
      view: "legal",
      path: "/legal",
      data: []
    },

    {
      name: "user",
      login: true, // login is required
      method: 'get',
      view: "user",
      path: "/home",

      data: [],

      values: [ /* Only these values will be made available to the view */

        { id: 'username',  },
        { id: 'userid',        },
        { id: 'email',     },
        { id: 'firstname', },
        { id: 'lastname',  },

        { id: 'purchasedItems' },
        { id: 'recentActivity' },
        { id: 'accountActions' },

      ]
    },

    {
      name: "signup",
      method: 'get',
      view: "signup",
      path: "/signup",
      data: []
    },

    {
      name: "adduser",
      method: 'post',
      path: "/adduser",
      verbose: true, /* show errors when signing up */
      data: [
        { id: 'username', type: 'username', required:true },
        { id: 'password', type: 'password', required:true }
      ]
    },

    {
      name: "login",
      method: 'get',
      view: "login",
      path: "/login",
      data: []
    },

    {
      name: "authenticate",
      method: 'post',
      path: "/authenticate",
      data: [
        { id: 'username', type: 'username', required:true },
        { id: 'password', type: 'password', required:true }
      ]
    },

    {
      name: "logout",
      method: 'get',
      path: "/logout",
      data: []
    },

    /* confirm and validate email */
    {
      name: "confirm",
      login: true, // login is required
      method: 'get',
      view: "confirm",
      path: "/confirm",
      data: [],
      description: "Confirm email address form."
    },

    {
      name: "validate",
      description: "Verify email address code.",
      login: true, // login is required
      method: 'get',
      path: "/validate",
      data: [
        { id: 'code', type: 'alphanumeric', required:true }
      ],
    },

    /* post only */
    {
      name: "support",
      description: "send a message to tech support",
      login: true, // login is required
      verbose: true, /* show errors when attempting to communicate */
      method: 'post',
      path: '/support',
      data: [
        { id: 'subject', type: 'text', required:true },
        { id: 'message', type: 'text', required:true }
      ],
    },

    {
      name: "update",
      description: "update user profile",
      login: true, // login is required
      verbose: true, /* show errors when attempting to update profile */
      method: 'post',
      path: '/update',
      data: [
        { id: 'email',      type: 'email',      required:false },
        { id: 'first_name', type: 'first-name', required:false },
        { id: 'last_name',  type: 'last-name',  required:false }
      ],
    },

    {
      name: "password",
      description: "update user password",
      login: true, // login is required
      verbose: true, /* show errors when attempting to communicate */
      method: 'post',
      path: '/password',
      data: [
        { id: 'new_password', type: 'password', required:true },
        { id: 'old_password', type: 'password', required:true }
      ],
    }

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
