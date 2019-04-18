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
    intent: {
      id: request.query.id,
      status: request.query.status,
    }
  });
});

app.post('/ajax/confirm_payment', async (request, response) => {
  try {
    let intent;
    if (request.body.payment_method_id) {
      // Create the PaymentIntent
      intent = await stripe.paymentIntents.create({
        payment_method: request.body.payment_method_id,
        amount: 1099,
        currency: 'usd',
        confirmation_method: 'manual',
        confirm: true,
      })
    }
    else if (request.body.payment_intent_id) {
      intent = await stripe.paymentIntents.confirm(
        request.body.payment_intent_id
      )
    }
    
    // Send the response to the client
    response.send(generate_payment_response(intent))
  }
  catch (e) {
    // Display error on client
    return response.send({ error: e.message })
  }
})

function generate_payment_response(intent) {
  if (
    intent.status === 'requires_action' &&
    intent.next_action.type === 'use_stripe_sdk'
  ) {
    // Tell the client to handle the action
    return {
      requires_action: true,
      payment_intent_client_secret: intent.client_secret,
    }
  } else if (intent.status === 'succeeded') {
    // The payment didn't need any additional actions and completed!
    // Handle your post-payment fullfillment / business logic
    
    return { success: true }
  }
  else {
    // Invalid Status
  }
}

// app.post("/webhooks", function(request, response) {
//   response.sendStatus(200);
  
//   const intent = request.body.data.object
  
//   // console.log(intent)

//   const intentId = intent.id
//   const intentStatus = intent.status
//   const sourceId = intent.source
  
//   if (intentStatus === "succeeded") {
//     stripe.sources.retrieve(sourceId, function(err, source) {
//       const customerEmailAddress = source.owner.email

//       // Track your sale, create shipping labels, and do other business things here...

//       console.log("Sending email confirmation to ", customerEmailAddress)

//       const msg = {
//         to: customerEmailAddress,
//         from: 'test@example.com',
//         subject: 'Thanks for buying a MacGuffin',
//         text: `We hope you like your new MacGuffin. https://dashboard.stripe.com/test/payments/${intentId}`,
//         html: `<p>We hope you like your new MacGuffin. <a href="https://dashboard.stripe.com/test/payments/${intentId}">Dashboard</a></p>`,
//       };
//       sgMail.send(msg);
//     });
//   }
//   else {
//     // handle a failure
//     console.error("PaymentIntent did not succeed!", intentId)
//   }
// });

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
