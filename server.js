// server.js
// where your node app starts

// init project
const express = require('express');
const bodyParser = require('body-parser')
const ejs = require("ejs");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

const app = express();
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
// app.get('/', function(request, response) {
//   response.sendFile(__dirname + '/views/index.html');
// });

app.get("/", function(request, response) {
  response.render(__dirname + "/views/index.ejs");
});

app.get("/checkout", function(request, response) {
  stripe.paymentIntents.create({
    // In practice you would calculate this based on what's in the cart
    amount: 1999,
    currency: 'eur',
    allowed_source_types: ['card'],
  }, function(err, intent) {
    response.render(__dirname + "/views/checkout.ejs", {
      intent: { 
        id: intent.id,
        clientSecret: intent.client_secret,
        status: intent.status
      }
    })
  })
});

app.get("/success", function(request, response) {
  response.render(__dirname + "/views/success.ejs", {
    intent: {
      id: request.query.id,
      status: request.query.status,
    }
  })
})

app.post("/webhooks", function(request, response) {
  response.sendStatus(200)
  console.log("OMG we caught a webhook")
  console.log(response)
})

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
