// server.js
// where your node app starts

// init project
require('dotenv').config()

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
  response.render(__dirname + "/views/payment.ejs", {
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

app.get("/success", function(request, response) {
  response.render(__dirname + "/views/success.ejs", {
    payment_id: request.query.id,
    payment_status: request.query.status,
  })
})

app.post('/process_payment', async (request, response) => {
  try {
    const payment = await stripe.paymentIntents.create({
      // customer: 'cu_1Ha4FLLGHh7VlXNwiTWAfpRh',
      payment_method: request.body.payment_method_id,
      payment_method_options: {
        card: {
          request_three_d_secure: 'any',
        },
      },
      amount: 100,
      currency: 'eur',
      confirmation_method: 'manual',
      confirm: true,
    })
    // Perform logic to fulfill your order here
    response.send(
      generate_payment_response(payment)
    )
  }
  catch (e) {
    response.send({
      payment_id: e.raw.payment_intent.id,
      payment_status: e.message,
    })
  }
})


app.post('/confirm_payment', async (request, response) => {
  try {
    const payment = await stripe.paymentIntents.confirm(
      request.body.payment_intent_id,
    )
 
    response.send(generate_payment_response(payment))
  }
  catch (e) {
    response.send({
      payment_id: e.raw.payment_intent.id,
      payment_status: e.message,
    })
  }
})


function generate_payment_response(intent) {
  if (
    (intent.status === 'requires_action' || intent.status === 'requires_source_action') &&
    intent.next_action.type === 'use_stripe_sdk'
  ) {
    // Tell the client to handle the action (e.g., do 3DS)
    return {
      requires_action: true,
      payment_intent_client_secret: intent.client_secret,
    }
  }
  // In the previous version, we just *assumed* that the status
  // was 'succeeded'.
  else if (intent.status === 'succeeded') {
    // Handle your post-payment fullfillment / business logic here
     
    return {
      payment_id: intent.id,
      payment_status: intent.status
    }
  }
  else {
    console.log(
      'Invalid status, update your API version: ' +
      'https://dashboard.stripe.com/test/developers'
    )
  }
}

// listen for requests
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
