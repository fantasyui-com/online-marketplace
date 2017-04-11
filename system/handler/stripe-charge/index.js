//NOTE: withut proper variables the system drops into test mode.
//NOTE: to run with keys: $> STRIPE_PUBLISHABLE_KEY=pk_test_6pRNASCoBOKtIshFeQd4XMUh STRIPE_SECRET_KEY=sk_test_BQokikJOvBiI2HlWgH4olfQ2 node app.js
// STRIPE_PUBLISHABLE_KEY= STRIPE_SECRET_KEY=
const keyPublishable = process.env.STRIPE_PUBLISHABLE_KEY||'pk_test_6pRNASCoBOKtIshFeQd4XMUh';
const stripeKeySecret = process.env.STRIPE_SECRET_KEY||'sk_test_BQokikJOvBiI2HlWgH4olfQ2';
const downloadKeySecret = process.env.DOWNLOAD_SECRET_KEY||'sk_test_c40aeeb535784f3fa179b107c5ee8e99';

const crypto = require("crypto");
const stripe = require("stripe")(stripeKeySecret);

const productLookup = require("../../helpers/product-object-lookup");

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
      console.log('chargeCreated object', chargeCreated)

      let shasum = crypto.createHash('sha1');
      shasum.update([ customerObject.email, productObject.name, productLicense.type, downloadKeySecret].join("::"));
      let serialNumber = shasum.digest('hex');

      req.model.customerEmail = customerObject.email;
      req.model.productTitle = productObject.title;
      req.model.productLicense = productLicense.type;
      req.model.paidAmount = (parseInt(chargeObject.amount)/100).toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
      req.model.downloadLink = `/download?email=${customerObject.email}&product=${productObject.name}&license=${productLicense.type}&serial=${serialNumber}`;
      res.render(route.viewId, req.model);

    } catch(err){
      res.render("error", {message: err.message} );
      res.status(500);
    }

  }

}

//NOTES:
// Some useful customerObjsect Values
// customerObject.id
// customerObject.email
// customerObject.account_balance
// customerObject.created
// customerObject.currency
