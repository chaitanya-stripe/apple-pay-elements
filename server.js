// server.js
// where your node app starts

// init project
const express = require('express');
const bodyParser = require('body-parser')
const ejs = require("ejs");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(express.static('public'));

app.get("/", function(request, response) {
  response.render(__dirname + "/views/index.ejs");
});

app.get("/payment", function(request, response) {
  stripe.paymentIntents.create({
    // In practice you would calculate this based on what's in the cart
    amount: 1999,
    currency: 'eur',
    allowed_source_types: ['card'],
  }, function(err, intent) {
    response.render(__dirname + "/views/payment.ejs", {
      intent: { 
        id: intent.id,
        clientSecret: intent.client_secret,
        status: intent.status
      },
      STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY
    });
  });
});

app.get("/success", function(request, response) {
  response.render(__dirname + "/views/success.ejs", {
    intent: {
      id: request.query.id,
      status: request.query.status,
    }
  });
});

app.post("/webhooks", function(request, response) {
  response.sendStatus(200);
  
  const intent = request.body.data.object
  
  // console.log(intent)

  const intentId = intent.id
  const intentStatus = intent.status
  const sourceId = intent.source
  
  if (intentStatus === "succeeded") {
    stripe.sources.retrieve(sourceId, function(err, source) {
      const customerEmailAddress = source.owner.email

      // Track your sale, create shipping labels, and do other business things here...

      console.log("Sending email confirmation to ", customerEmailAddress)

      const msg = {
        to: customerEmailAddress,
        from: 'test@example.com',
        subject: 'Thanks for buying a MacGuffin',
        text: `We hope you like your new MacGuffin. https://dashboard.stripe.com/test/payments/${intentId}`,
        html: `<p>We hope you like your new MacGuffin. <a href="https://dashboard.stripe.com/test/payments/${intentId}">Dashboard</a></p>`,
      };
      sgMail.send(msg);
    });
  }
  else {
    // handle a failure
    console.error("PaymentIntent did not succeed!", intentId)
  }
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
