// Create a Stripe client.
var stripe = Stripe('pk_test_ZicLw9aAjw9hojXl1HfY3hsS', {
  betas: ['payment_intent_beta_3']
});

// Create an instance of Elements.
var elements = stripe.elements();

// Custom styling can be passed to options when creating an Element.
// (Note that this demo uses a wider set of styles than the guide below.)
var style = {
  base: {
    color: '#32325d',
    lineHeight: '18px',
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    fontSmoothing: 'antialiased',
    fontSize: '16px',
    '::placeholder': {
      color: '#aab7c4'
    }
  },
  invalid: {
    color: '#fa755a',
    iconColor: '#fa755a'
  }
};

// Create an instance of the card Element.
var card = elements.create('card', {style: style});

// Add an instance of the card Element into the `card-element` <div>.
card.mount('#card-element');

// Handle real-time validation errors from the card Element.
card.addEventListener('change', function(event) {
  var displayError = document.getElementById('card-errors');
  if (event.error) {
    displayError.textContent = event.error.message;
  } else {
    displayError.textContent = '';
  }
});

// Handle form submission.
const cardholderName = document.getElementById('cardholder-name');
const form = document.getElementById('payment-form');
const clientSecret = form.dataset.secret;

form.addEventListener('submit', function(event) {
  event.preventDefault();

  stripe.handleCardPayment(clientSecret, card, {
    source_data: {
      owner: {
        name: cardholderName.value
      }
    }
  }, function(err, resp) {
    if (err) {
      console.log("something went wrong", err)
    }
    else {
      alert("success")
      console.log("success", resp)
    }
  })
});

