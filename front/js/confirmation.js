const urlParams = (new URL(document.location)).searchParams;
const orderId = urlParams.get('id'); //retrieving order-id from url


document.getElementById('orderId').innerHTML = orderId; //displaying order number on confirmation page