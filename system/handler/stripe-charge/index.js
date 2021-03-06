const crypto = require("crypto");

const stripeKeySecret = process.env.STRIPE_SECRET_KEY||'sk_test_BQokikJOvBiI2HlWgH4olfQ2';
const stripe = require("stripe")(stripeKeySecret);

const productLookup = require("../../helpers/product-object-lookup");
const SecureLink = require("../../helpers/secure-link");

module.exports = async function({route}){

  return async (req, res) => {

    try {

      let [productObject, productLicense] = productLookup(req.body.productDescription);
      let customerObject = await stripe.customers.create({ email: req.body.stripeEmail, card: req.body.stripeToken }); // returns the customerObject.id needed for stripe.charges.create

      let chargeObject = {
        customer: customerObject.id,
        description: `${productObject.title} (${productLicense.type})`,
        amount: productLicense.amount,
        currency: productObject.currency,
      };

      let chargeCreated = await stripe.charges.create(chargeObject);

      let secureLink = new SecureLink();
      secureLink.insert('email', customerObject.email);
      secureLink.insert('product', productObject.name);
      secureLink.insert('license', productLicense.type);

      req.model.timestamp = new Date();
      req.model.customerEmail = customerObject.email;
      req.model.productTitle = productObject.title;
      req.model.productLicense = productLicense.type;
      req.model.paidAmount = (parseInt(chargeObject.amount)/100).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

      req.model.downloadLink = `/download?${secureLink}`;

      res.render(route.viewId, req.model);

    } catch(err){

      res.render("error", {message: err.message} );
      res.status(500);

    }

  }

}
