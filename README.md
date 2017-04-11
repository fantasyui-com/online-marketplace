# online-marketplace
A simple and secure online marketplace for selling files.

![Opening Intro](screenshots/a.jpg "Opening Intro")

![Product Layout](screenshots/b.jpg "Product Layout")

![Product Details](screenshots/c.jpg "Product
 Details")

![Licensing](screenshots/d.jpg "Licensing")

## Theory of Operation

Security

- Customer Privacy and Server Security first.
- Minimal attack surface.
- Server does not store e-mails in readable form (hash values only).
- Credit card processing via Stripe or similar.

Structure

- Simple product catalog (package.json format) see [product-catalog](https://github.com/fantasyui-com/product-catalog).
- Potential for serving static pages (generate from live and serve via static)

## Development Status

See TODO.md

## Installation

```sh

mkdir my-online-marketplace
cd my-online-marketplace/
git clone https://github.com/fantasyui-com/online-marketplace.git .
npm i
npm start

```

at this point you will see [http://0.0.0.0:3000/](http://0.0.0.0:3000/)
navigate to the address to view the homepage.


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

## Development

Clone repository, install supervisor ```npm install -G supervisor``` and then:

```sh

npm run watch;

```

## Running Tests

Test system uses mocha.

```sh

npm test;

```
