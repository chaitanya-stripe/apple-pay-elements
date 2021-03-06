// Create a Stripe client.
const stripe = Stripe('pk_test_4ecaXEp3ioNREv9EGB5osFxx');

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

// Create a payment request detail page
var paymentRequest = stripe.paymentRequest({
  country: 'US',
  currency: 'usd',
  total: {
    label: 'Demo total',
    amount: 1099,
  },
  requestPayerName: true,
  requestPayerEmail: true,
});

// Mount payment request button
var prButton = elements.create('paymentRequestButton', {
  paymentRequest: paymentRequest,
});

// Check the availability of the Payment Request API first.
paymentRequest.canMakePayment().then(function(result) {
  if (result) {
    prButton.mount('#payment-request-element');
  } else {
    document.getElementById('payment-request-element').style.display = 'none';
  }
});

const form = document.getElementById('payment-form');

form.addEventListener('submit', function(event) {
  // `event.preventDefault()` lets us handle the request manually
  event.preventDefault();
  
  stripe.createPaymentMethod('card', card).then(function(result) {
    
    // Send the chargeable thing to your server
    fetch('/process_payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payment_method_id: result.paymentMethod.id,
      }),
    }).then(function(result) {
      result.json().then(function(json) {
        handleServerResponse(json)
      })
    })
  })
})

function handleServerResponse(response) {
  if (response.error) {
    // Show error from your server in payment form
    console.log(response.error)
  }
  else if (response.requires_action) {
    stripe.handleCardAction(
      response.payment_intent_client_secret
    ).then(function(result) {
      fetch('/confirm_payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_intent_id:
            result.error ?
              result.error.payment_intent.id :
              result.paymentIntent.id
        }),
      }).then(function(confirmResult) {
        return confirmResult.json()
      }).then(handleServerResponse)
    })
  }
  else {
    // Redirect to success page
    window.location.href =
      `/success?id=${response.payment_id}&status=${response.payment_status}`
  }
}