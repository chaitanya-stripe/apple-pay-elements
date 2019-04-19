// Create a Stripe client.
const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

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

// // Handle form submission.
// const cardholderName = document.getElementById('cardholder-name');
// const cardholderEmail = document.getElementById('cardholder-email');
const form = document.getElementById('payment-form');

form.addEventListener('submit', function(event) {
  // `event.preventDefault()` lets us handle the request manually
  event.preventDefault();
  
  stripe.createToken(card).then(function(result) {
    
    // Send the chargeable thing to your server
    fetch('/process_payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token_id: result.token.id,
      }),
    }).then(function(result) {
      result.json().then(function(json) {
        handleServerResponse(json)
      })
    })
  })
})

function handleServerResponse(response) {
  // Redirect to success page
  window.location.href = 
    `/success?id=${response.payment_id}&status=${response.payment_status}`
}