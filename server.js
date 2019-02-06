// server.js
// where your node app starts

// init project
const ejs = require("ejs");
const express = require('express');
const app = express();

app.set('view engine', 'ejs');

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
// app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
// app.get('/', function(request, response) {
//   response.sendFile(__dirname + '/views/index.html');
// });

app.get("/", function(request, response) {
  response.render(__dirname + "views/index.ejs");
});

app.get("/checkout", function(request, response) {
  response.render(__dirname + "/views/checkout.ejs", { name: "Rob" })
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
