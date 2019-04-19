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

// app.get("/", function(request, response) {
//   response.render(__dirname + "/views/index.ejs");
// });

// app.get("/payment", function(request, response) {
app.get("/", function(request, response) {
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
    console.log('about to call charges.create')
    const payment = await stripe.charges.create({
      source: request.body.token_id,
      amount: 1999,
      currency: 'eur',
    })

    console.log('just called charges.create')

    response.send({
      payment_id: payment.id,
      payment_status: payment.status,
    })
  }
  catch (e) {
    response.send({
      // This line gets the PaymentIntent's ID if it exists, otherwise it get's
      // the Charge ID.
      payment_id: (e.raw.payment_intent ? e.raw.payment_intent.id : e.raw.charge),
      payment_status: e.message,
    })
  }
  
  console.log('sent response to server')
})

// listen for requests
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
