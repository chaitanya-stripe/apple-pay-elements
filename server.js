// server.js
// where your node app starts

// init project
const express = require('express');
const ejs = require("ejs");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

const app = express();
app.set('view engine', 'ejs');

app.configure(function() {
  app.use(express.bodyParser());
});

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
  response.render(__dirname + "/views/checkout.ejs", { name: "Rob" })
});

app.post("/charge", function(request, response) {
  console.log(request.body)
  const token = request.body.stripeToken;
  (async () => {
    const charge = await stripe.charges.create({
      amount: 999,
      currency: 'usd',
      description: 'example charge',
      source: token
    });
    
    await console.log(charge);
  });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
