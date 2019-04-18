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
  response.render(__dirname + "/views/payment.ejs", {
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

app.get("/success", function(request, response) {
  response.render(__dirname + "/views/success.ejs", {
    payment_id: request.query.id,
  })
})

app.post('/process_payment', async (request, response) => {
  const charge = await stripe.charges.create({
    source: request.body.token_id,
    amount: 1999,
    currency: 'eur',
  })
  
  // Send the response to the client
  await response.send({ success: true, payment_id: charge.id })
})

// listen for requests
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
