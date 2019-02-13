// Create a Stripe client.
const stripe = Stripe(STRIPE_PUBLISHABLE_KEY, {
  betas: ['payment_intent_beta_3']
});

// Create an instance of Elements.
const elements = stripe.elements();

// Custom styling can be passed to options when creating an Element.
// (Note that this demo uses a wider set of styles than the guide below.)
const style = {
  base: {
    color: '#32325d',
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
const card = elements.create('card', {style: style});

// Add an instance of the card Element into the `card-element` <div>.
card.mount('#card-element');

// Handle real-time validation errors from the card Element.
card.addEventListener('change', function(event) {
  const displayError = document.getElementById('card-errors');
  if (event.error) {
    displayError.textContent = event.error.message;
  } else {
    displayError.textContent = '';
  }
});

// Handle form submission.
const cardholderName = document.getElementById('cardholder-name');
const cardholderEmail = document.getElementById('cardholder-email');
const form = document.getElementById('payment-form');
const clientSecret = form.dataset.secret;

form.addEventListener('submit', function(event) {
  event.preventDefault();

  stripe.handleCardPayment(clientSecret, card, {
    source_data: {
      owner: {
        name: cardholderName.value,
        email: cardholderEmail.value,
      }
    }
  }).then(function(result) {
    if (result.error) {
      console.error("Something went wrong:", result.error)
      document.getElementById('card-errors').textContent = `Something went wrong: ${result.error.message}`;
    }
    else {
      // console.log("success!", result);
      const redirectUrl = `/success?id=${result.paymentIntent.id}&status=${result.paymentIntent.status}`
      window.location.href = redirectUrl;
    }
  })
});

