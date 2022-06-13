const kanapCatalogBaseUrl = 'http://localhost:3000/api/products';// base url to access Kanap catalog

//cart object storing data from localStorage and manipulating it before sending back to localStorage
const cart = {
    key: 'kanapcart',
    products: [],
    init() {
        //check localStorage and initialize cart products
        const storageProducts = localStorage.getItem(cart.key);
        if (storageProducts) {
            cart.products = JSON.parse(storageProducts); //array of objects to store in cart object
        } else {
            //if localStorage empty set an empty array
            cart.products = [];
            cart.sync();
        }
    },
    async sync() {
        const cartToSync = JSON.stringify(cart.products); //string to send to localStorage
        await localStorage.setItem(cart.key, cartToSync);
    },
    find(key) {
        //find an item in the cart by it's key 
        const match = cart.products.filter(item => {
            return item.key === key;
        });
        if (match) return cart.products.indexOf(match[0]); //if product exists return its index
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
    },
    addDetails(productKey, productDetails) {
        //adding details to the cart product in order to avoid storing it in local
        const index = cart.find(productKey);
        if (index >= 0) {
            Object.assign(cart.products[index], productDetails); //adding object details to object product
        } else {
            console.log('product not found');
        }
    },
};

//localStorage.clear();
cart.init();//get cart from localStorage to cart object

//updating quantity and price totals in DOM elements
const updateTotals = () => {
    let totalQuantity = document.getElementById('totalQuantity');
    let totalPrice = document.getElementById('totalPrice');
    let qty = 0;
    let price = 0;

    cart.products.forEach(element => {
        qty += element.quantity; //adding quantities
        price += element.price * element.quantity; // calculating total price
    })

    totalQuantity.innerHTML = qty; //displaying total quantity
    totalPrice.innerHTML = price; //displaying total price
}

//create DOM objects for each results object of the Kanap cart to display on the cartpage
const addProductToCartPage = (product) => {

    //Article
    const cartItems = document.getElementById('cart__items');
    const article = document.createElement('article');
    article.setAttribute('class', "cart__item");
    article.setAttribute('data-id', product.id);
    article.setAttribute('data-color', product.color);
    cartItems.appendChild(article);

    //Image
    const imgDiv = document.createElement('div');
    imgDiv.setAttribute('class', "cart__item__img");
    article.appendChild(imgDiv);
    const image = document.createElement('img');
    image.src = product.imageUrl;
    image.alt = product.altTxt;
    imgDiv.appendChild(image);

    const contentDiv = document.createElement('div');
    contentDiv.setAttribute('class', "cart__item__content");
    article.appendChild(contentDiv);
    const descriptionDiv = document.createElement('div');
    descriptionDiv.setAttribute('class', "cart__item__content__description");
    contentDiv.appendChild(descriptionDiv);
    const name = document.createElement('h2'); //Name
    name.innerHTML = product.name;
    contentDiv.appendChild(name);
    const color = document.createElement('p'); //Color
    color.innerHTML = product.color;
    contentDiv.appendChild(color);
    const price = document.createElement('p'); //Price
    price.innerHTML = product.price + ' €';
    contentDiv.appendChild(price);
    const settingsDiv = document.createElement('div');
    settingsDiv.setAttribute('class', "cart__item__content__settings");
    contentDiv.appendChild(settingsDiv);
    const settingsQtyDiv = document.createElement('div');
    settingsQtyDiv.setAttribute('class', "cart__item__content__settings__quantity");
    settingsDiv.appendChild(settingsQtyDiv);
    const quantity = document.createElement('p'); //Quantity
    quantity.innerHTML = 'Qté : ';
    settingsQtyDiv.appendChild(quantity);
    const inputQty = document.createElement('input'); //Input Quantity
    inputQty.setAttribute('type', "number");
    inputQty.setAttribute('class', "itemQuantity");
    inputQty.setAttribute('name', "itemQuantity");
    inputQty.setAttribute('min', "1");
    inputQty.setAttribute('max', "100");
    inputQty.setAttribute('value', product.quantity);
    inputQty.setAttribute('data-key', product.key); // adding data-key attribute with product-key value
    settingsQtyDiv.appendChild(inputQty);
    const deleteDiv = document.createElement('div');
    deleteDiv.setAttribute('class', "cart__item__content__settings__delete");
    settingsDiv.appendChild(deleteDiv);
    const deleteItem = document.createElement('p'); // Delete item
    deleteItem.setAttribute('class', "deleteItem");
    deleteItem.setAttribute('id', product.key); // adding id attribute with product-key value
    deleteItem.innerHTML = 'Supprimer';
    deleteDiv.appendChild(deleteItem);

    //click listener on Delete button  
    deleteItem.addEventListener("click", () => {
        articleToDelete = deleteItem.closest('article');//nearest article element
        articleToDelete.remove(); //removing from DOM
        cart.remove(product.key); //removing from cart
        updateTotals(); //updating total articles and price
    })

    // Change listener on quantity input
    inputQty.addEventListener("change", () => {
        if (inputQty.value < 1 || inputQty.value > 99) {
            inputQty.setCustomValidity("veuillez renseigner un nombre d'articles entre 1 et 100 !");
            inputQty.reportValidity();
            inputQty.focus();
            inputQty.oninput = () => {
                inputQty.setCustomValidity(''); //removing warning message on input
            };
        }
        if (inputQty.value > 0 && inputQty.value < 101) {
            cart.change(inputQty.getAttribute('data-key'), inputQty.value);
            updateTotals(); //updating total articles and price
        };

    })
    updateTotals();
}

// fetch product details from kanap catalog by product-ID, async await function
const getProductDetails = async (product) => {
    const productRequestParam = `/${product.id}`;
    const urlToFetch = `${kanapCatalogBaseUrl}${productRequestParam}`;

    try {
        const response = await fetch(urlToFetch);
        if (response.ok) {
            const jsonResponse = await response.json();
            delete jsonResponse._id; //removing id from product details
            delete jsonResponse.colors; //removing colors from product details
            cart.addDetails(product.key, jsonResponse);// adding details to product in cart
            addProductToCartPage(product);// adding product to page
        }
    } catch (error) {
        console.log(error);
    }
}

//For each product in  cart, fetching and adding its detail
cart.products.forEach(element => {
    getProductDetails(element);
});

// fetch Post order on kanap Post route, async await function
const postOrder = async (objecToPost) => {
    const orderRequestParam = '/order';
    const urlToFetch = `${kanapCatalogBaseUrl}${orderRequestParam}`;
    const fetchBody = JSON.stringify(objecToPost);// object to string for Post fetch

    try {
        const response = await fetch(urlToFetch, {
            method: 'POST',
            headers: { 'content-type': 'application/json' }, //indicating json content type
            body: fetchBody
        });
        if (response.ok) {
            const jsonResponse = await response.json();
            const fetchedOrderId = jsonResponse.orderId;    
            window.location.assign(`./confirmation.html?id=${fetchedOrderId}`); 
            //opening confirmation page with orderId in parameter
        }
    } catch (error) {
        console.log(error);
    }

}

const orderBtn = document.getElementById('order'); // "order" button
orderBtn.setAttribute('type', 'button'); //to prevent automatic HTML form validation

// form validation on order button click
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
        firstName.oninput = () => {
            firstName.setCustomValidity(''); //removing warning message on input
        };
    } else if (contactLastName === '') {
        lastName.setCustomValidity("veuillez renseigner votre nom !");
        lastName.reportValidity();
        lastName.focus();
        lastName.oninput = () => {
            lastName.setCustomValidity(''); //removing warning message on input
        };
    } else if (contactAddress === '') {
        address.setCustomValidity("veuillez renseigner votre adresse !");
        address.reportValidity();
        address.focus();
        address.oninput = () => {
            address.setCustomValidity(''); //removing warning message on input
        };
    } else if (contactCity === '') {
        city.setCustomValidity("veuillez renseigner votre ville !");
        city.reportValidity();
        city.focus();
        city.oninput = () => {
            city.setCustomValidity(''); //removing warning message on input
        };
    } else if (contactEmail === '') {
        email.setCustomValidity("veuillez renseigner votre email !");
        email.reportValidity();
        email.focus();
        email.oninput = () => {
            email.setCustomValidity(''); //removing warning message on input
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

    //validation before sending Post order
    if (contactFirstName && contactLastName && contactAddress && contactCity 
        && contactEmail && productsToPost.length > 0) {

        postOrder(objectToPost);

    };

}

//imput text validation using regex and triming unecessary empty spaces
const textValidation = (inputField, errField, regexValue) => {

    let inputValue = inputField.value.trim();
    const inputArray = inputValue.split(' ');/*divides into an array of substrings 
                                                separated by ' ' */

    //removing extra spaces between words
    if (inputArray.length > 1) {
        inputValue = '';
        //for each array element 
        inputArray.forEach(element => {
            if (element.trim() != '') {
                inputValue = inputValue + ' ' + element;//separate substrings by a single space
            }
        })
    }
    if (inputValue === "") {
        return '';
        //testing if regex false and value not empty
    } else if (!regexValue.test(inputValue) && inputValue != "") {
        errField.innerHTML = 'Saisie non valide';
        return false;

    } else {
        errField.innerHTML = "";
        return inputValue.trim();//if regex ok then return trimed value
    }
}

//email form validation using regex
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