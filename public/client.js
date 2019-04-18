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
  
  stripe.createPaymentMethod('card', cardElement).then(function(result) {
    if (result.error) {
      // Show Stripe error from PaymentMethod in payment form
      console.log(result.error)
    }
    else {
      fetch('/ajax/confirm_payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method_id: result.paymentMethod.id }),
      }).then(function(result) {
        result.json().then(function(json) {
          handleServerResponse(json)
        })
      })
    }
  })

  // stripe.handleCardPayment(clientSecret, card, {
  //   source_data: {
  //     owner: {
  //       name: cardholderName.value,
  //       email: cardholderEmail.value,
  //     }
  //   }
  // }).then(function(result) {
  //   if (result.error) {
  //     console.error("Something went wrong:", result.error)
  //     document.getElementById('card-errors').textContent = result.error.message;
  //   }
  //   else {
  //     // console.log("success!", result);
  //     const redirectUrl = `/success?id=${result.paymentIntent.id}&status=${result.paymentIntent.status}`
  //     window.location.href = redirectUrl;
  //   }
  // })
});

function handleServerResponse(response) {
  if (response.error) {
    // Show error from your server in payment form
    console.log(response.error)
  }
  else if (response.requires_action) {
    stripe.handleCardAction(
      response.payment_intent_client_secret
    ).then(function(result) {
      if (result.error) {
        // Show Stripe error from PaymentIntent in payment form
        console.log(result.error)
      }
      else {
        fetch('/ajax/confirm_payment', {
          method: 'POST',
          headers: { },
        }).then(function(confirmResult) {
          return confirmResult.json()
        }).then(handleServerResponse)
      }
    })
  }
  else {
    // Redirect to the success page
  }
}