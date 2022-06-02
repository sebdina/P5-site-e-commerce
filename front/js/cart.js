const kanapCatalogBaseUrl = 'http://localhost:3000/api/products';// base url to access Kanap catalog

//cart object storing data from localStorage and manipulating it before sending back to localStorage
const cart = {
    key: 'kanapcart',
    products: [],
    init() {
        //check localStorage and initialize cart products
        const storageProducts = localStorage.getItem(cart.key);
        if (storageProducts) {
            cart.products = JSON.parse(storageProducts); //to array of objects to store in cart object
        } else {
            //if localStorage empty set an empty array
            cart.products = [];
            cart.sync();
        }
    },
    async sync() {
        const cartToSync = JSON.stringify(cart.products); // to string to send to localStorage
        await localStorage.setItem(cart.key, cartToSync);
    },
    find(key) {
        //find an item in the cart by it's key 
        const match = cart.products.filter(item => {
            return item.key === key;
        });
        if (match) return match[0];
    },
    change(key, qty) {
        //change the quantity of an item in the cart
        cart.products = cart.products.map(item => {
            if (item.key === key)
                item.quantity = parseInt(qty);
            return item;
        });
        //update localStorage
        cart.sync();
    },
    remove(key) {
        //remove an product entirely from the cart based on its key
        cart.products = cart.products.filter(item => {
            return item.key !== key;
        });
        //update localStorage
        cart.sync()
    }
};

//after page is loaded get cart from localStorage to cart object
//document.addEventListener('DOMContentLoaded', () => {
    //localStorage.clear();
    cart.init();

    //create DOM objects for each results object of the Kanap cart to display on the cartpage
const addProductsToCartPage = (products) => {

    const cartItems = document.getElementById('cart__items');

    products.forEach(element => {
        const article = document.createElement('article');
        article.setAttribute('class', "cart__item");
        article.setAttribute('data-id', element.id);
        article.setAttribute('data-color', element.color);
        cartItems.appendChild(article);

        const imgDiv = document.createElement('div');
        imgDiv.setAttribute('class', "cart__item__img");
        article.appendChild(imgDiv);
        const image = document.createElement('img');
        image.src = element.imageUrl;
        image.alt = element.altTxt;
        imgDiv.appendChild(image);

        const contentDiv = document.createElement('div');
        contentDiv.setAttribute('class', "cart__item__content");
        article.appendChild(contentDiv);
        const descriptionDiv = document.createElement('div');
        descriptionDiv.setAttribute('class', "cart__item__content__description");
        contentDiv.appendChild(descriptionDiv);
        const name = document.createElement('h2');
        name.innerHTML = element.name;
        contentDiv.appendChild(name);
        const color = document.createElement('p');
        color.innerHTML = element.color;
        contentDiv.appendChild(color);
        const price = document.createElement('p');
        price.innerHTML = element.price + ' €';
        contentDiv.appendChild(price);
        const settingsDiv = document.createElement('div');
        settingsDiv.setAttribute('class', "cart__item__content__settings");
        contentDiv.appendChild(settingsDiv);
        const settingsQtyDiv = document.createElement('div');
        settingsQtyDiv.setAttribute('class', "cart__item__content__settings__quantity");
        settingsDiv.appendChild(settingsQtyDiv);
        const quantity = document.createElement('p');
        quantity.innerHTML = 'Qté : ';
        settingsQtyDiv.appendChild(quantity);
        const inputQty = document.createElement('input');
        inputQty.setAttribute('type', "number");
        inputQty.setAttribute('class', "itemQuantity");
        inputQty.setAttribute('name', "itemQuantity");
        inputQty.setAttribute('min', "1");
        inputQty.setAttribute('max', "100");
        inputQty.setAttribute('value', element.quantity);
        inputQty.setAttribute('data-key', element.key);
        settingsQtyDiv.appendChild(inputQty);
        const deleteDiv = document.createElement('div');
        deleteDiv.setAttribute('class', "cart__item__content__settings__delete");
        settingsDiv.appendChild(deleteDiv);
        const deleteItem = document.createElement('p');
        deleteItem.setAttribute('class', "deleteItem");
        deleteItem.setAttribute('id', element.key);
        deleteItem.innerHTML = 'Supprimer';
        deleteDiv.appendChild(deleteItem);

    });

    const deleteItems = Array.from(document.getElementsByClassName('deleteItem')); //convert HTMLcollections deleteItem to Array
    const inputsQty = document.getElementsByClassName('itemQuantity');

    //click listener on all Delete buttons
    deleteItems.forEach(element => {
        element.addEventListener("click", () => {
            articleToDelete = document.getElementById(element.id).closest('article');
            articleToDelete.remove(); //removing from DOM
            cart.remove(element.id); //removing from cart
            updateTotals(); //updating total articles and price
        })
    })

    // Change listener on all quantity inputs
    for (let i = 0; i < inputsQty.length; i++) {
        inputsQty[i].addEventListener("change", () => {
            if (inputsQty[i].value < 1 || inputsQty[i].value > 99) {
                inputsQty[i].setCustomValidity("veuillez renseigner un nombre d'articles entre 1 et 100 !");
                inputsQty[i].reportValidity();
                inputsQty[i].focus();
                inputsQty[i].onclick = () => {
                    inputsQty[i].setCustomValidity(''); //removing warning message on click
                };
            }
            if (inputsQty[i].value > 0 && inputsQty[i].value < 101) {
                cart.change(inputsQty[i].getAttribute('data-key'), inputsQty[i].value);
                //console.log(cart.products);
                updateTotals(); //updating total articles and price
            };

        })
    }

    //updating quantity and price totals
    const updateTotals = () => {
        let totalQuantity = document.getElementById('totalQuantity');
        let totalPrice = document.getElementById('totalPrice');
        let qty = 0;
        let price = 0;

        cart.products.forEach(element => {
            qty += element.quantity;
            price += element.price * element.quantity;
        })

        totalQuantity.innerHTML = qty;
        totalPrice.innerHTML = price;
        //console.log(cart.products);
    }

    updateTotals();
}
    addProductsToCartPage(cart.products);
//});


const orderBtn = document.getElementById('order'); // "order" button
orderBtn.setAttribute('type', 'button'); //to prevent automatic HTML validation

// firstName.addEventListener("input", () => {
//     textValidation(firstName, firstNameErr, regexForName);
// })

// fetch order on kanap Post route, async await function
const postOrder = async (objecToPost) => {
    const orderRequestParam = '/order';
    const urlToFetch = `${kanapCatalogBaseUrl}${orderRequestParam}`;
    const fetchBody = JSON.stringify(objecToPost);
    //let fetchedOrderId = '';

    // console.log(fetchBody);
    // console.log(urlToFetch);    

    try {
        const response = await fetch(urlToFetch, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: fetchBody
        });
        if (response.ok) {
            const jsonResponse = await response.json();
            //console.log(jsonResponse.orderId);
            const fetchedOrderId = jsonResponse.orderId;
            window.location.assign(`./confirmation.html?id=${fetchedOrderId}`);
        }
    } catch (error) {
        console.log(error);
    }

}

orderBtn.onclick = () => {
    const firstName = document.getElementById('firstName');
    const firstNameErr = document.getElementById('firstNameErrorMsg');
    const lastName = document.getElementById('lastName');
    const lastNameErrorMsg = document.getElementById('lastNameErrorMsg');
    regexForName = /^[a-zA-Zàâéèëêïîôùüç'\s-]+$/; // regex for first name and last name
    const address = document.getElementById('address');
    const addressErrorMsg = document.getElementById('addressErrorMsg');
    const city = document.getElementById('city');
    const cityErrorMsg = document.getElementById('cityErrorMsg');
    regexForAddress = /^[A-Za-z0-9àâéèëêïîôùüç'\.\-\s\,]+$/; // regex for address and city
    const email = document.getElementById('email');
    const emailErrorMsg = document.getElementById('emailErrorMsg');
    regexForEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
    //customer form validation
    contactFirstName = textValidation(firstName, firstNameErr, regexForName);
    contactLastName = textValidation(lastName, lastNameErrorMsg, regexForName);
    contactAddress = textValidation(address, addressErrorMsg, regexForAddress);
    contactCity = textValidation(city, cityErrorMsg, regexForAddress);
    contactEmail = emailValidation(email, emailErrorMsg, regexForEmail);

    //empty inputs validation using Constraint validation API methods
    if (contactFirstName === '') {
        firstName.setCustomValidity("veuillez renseigner votre prénom !");
        firstName.reportValidity();
        firstName.focus();
        firstName.onclick = () => {
            firstName.setCustomValidity(''); //removing warning message on click
        };
    } else if (contactLastName === '') {
        lastName.setCustomValidity("veuillez renseigner votre nom !");
        lastName.reportValidity();
        lastName.focus();
        lastName.onclick = () => {
            lastName.setCustomValidity(''); //removing warning message on click
        };
    } else if (contactAddress === '') {
        address.setCustomValidity("veuillez renseigner votre adresse !");
        address.reportValidity();
        address.focus();
        address.onclick = () => {
            address.setCustomValidity(''); //removing warning message on click
        };
    } else if (contactCity === '') {
        city.setCustomValidity("veuillez renseigner votre ville !");
        city.reportValidity();
        city.focus();
        city.onclick = () => {
            city.setCustomValidity(''); //removing warning message on click
        };
    } else if (contactEmail === '') {
        email.setCustomValidity("veuillez renseigner votre email !");
        email.reportValidity();
        email.focus();
        email.onclick = () => {
            email.setCustomValidity(''); //removing warning message on click
        };
    }

    //Array of product-ID to Post
    const productsToPost = cart.products.map(product => {
        return product.id;
    });

    //contact object to Post
    const objectToPost = {
        contact: {
            firstName: contactFirstName,
            lastName: contactLastName,
            address: contactAddress,
            city: contactCity,
            email: contactEmail,
        },
        products: productsToPost, 
    }



    if (contactFirstName && contactLastName && contactAddress && contactCity && contactEmail && productsToPost.length > 0) {

        console.log(productsToPost);
        console.log(objectToPost);
        //const orderId = '1234';
        postOrder(objectToPost);
        //window.location.assign('./confirmation.html');
       

    };

}

const textValidation = (inputField, errField, regexValue) => {

    let inputValue = inputField.value.trim();
    const inputArray = inputValue.split(' ');

    //removing extra spaces between words
    if (inputArray.length > 1) {
        inputValue = '';
        inputArray.forEach(element => {
            if (element.trim() != '') {
                inputValue = inputValue + ' ' + element;
            }
        })
    }
    if (inputValue === "") {
        return '';

    } else if (!regexValue.test(inputValue) && inputValue != "") {
        errField.innerHTML = 'Saisie non valide';
        return false;

    } else {
        errField.innerHTML = "";
        return inputValue.trim();
    }
}

const emailValidation = (inputField, errField, regexValue) => {

    let inputValue = inputField.value.trim();

    if (inputValue === "") {
        return '';
    } else if (!regexValue.test(inputValue) && inputValue != "") {
        errField.innerHTML = 'Email non valide';
        return false;

    } else {
        errField.innerHTML = "";
        return inputValue;
    }
}