# online-marketplace
A simple and secure online marketplace for selling files.

## Theory of Operation

- Customer Privacy and Server Security first.
- Minimal attack surface.
- Credit card processing via Stripe or similar.
- Server does not store e-mails in readable form (hash values only).

- Simple product catalog (package.json format) see [product-catalog](https://github.com/fantasyui-com/product-catalog).
- Potential for serving static pages (generate from live and serve via static)


## Start Server

Use default npm (uses server.js)

```sh

npm start;

```

## Periodic Updates

Use default npm command

```sh

npm update;

```

## Tests

Test system uses mocha.

```sh

npm test;

```
