const kanapCatalogBaseUrl = 'http://localhost:3000/api/products';// base url to access Kanap catalog
const urlParams = (new URL(document.location)).searchParams;// retrieving parameters from URL
const productId = urlParams.get('id'); //retrieving product-id from parameters

// fetch product from kanap catalog by product-ID, async await function
const getProduct = async (productId) => {
    const productRequestParam = `/${productId}`;
    const urlToFetch = `${kanapCatalogBaseUrl}${productRequestParam}`;

    try {
        const response = await fetch(urlToFetch);
        if (response.ok) {
            const jsonResponse = await response.json();
            addProductOnPage(jsonResponse);
        }
    } catch (error) {
        console.log(error);
    }

}

//create DOM objects for each info of the Kanap Product to display on product page
const addProductOnPage = (product) => {

    //displaying product image
    const imageClasse = document.getElementsByClassName('item__img')[0]; // result is an array of elements
    const image = document.createElement('img');
    image.src = product.imageUrl;
    image.alt = product.altTxt;
    imageClasse.appendChild(image);

    //displaying product name
    const title = document.getElementById('title');
    title.innerHTML = product.name;

    //displaying product price
    const price = document.getElementById('price');
    price.innerHTML = product.price;

    //displaying product description
    const description = document.getElementById('description');
    description.innerHTML = product.description;

    //displaying product colors
    const colors = document.getElementById('colors');
    product.colors.forEach(element => {
        const option = document.createElement('option');
        option.value = element;
        option.innerHTML = element;
        colors.appendChild(option);
    });

}

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
        // sending cart products to local storage
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
    //add a new item to the cart
    add(product) {
        //check that it is not in the cart already
        if (cart.find(product.key)) {
            let newQty = product.quantity + cart.find(product.key).quantity; /*adding new quantity to 
                                                                                existing product qty*/
            if (newQty > 100) { newQty = 100 } //preventing quantity to be supérior to 100
            cart.change(product.key, newQty);
        } else {
            cart.products.push(product);// adding new product to cart
        }
        //update localStorage
        cart.sync();
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
};

//localStorage.clear();
cart.init(); //copy cart from localStorage to cart object

const addToCartBtn = document.getElementById('addToCart'); // "add to cart" button

addToCartBtn.onclick = () => {
    const productQty = parseInt(document.getElementById('quantity').value); // product quantity 
    const productColor = document.getElementById('colors').value; // product color

    //object to add to cart
    const productToAdd = {
        key: productId + productColor, // to get a unique identifier for a product and his color
        id: productId,
        quantity: productQty,
        color: productColor,
    };

    //form validation for color (should be selected) & quantity (between 1 and 100)
    if (!productColor) {
        document.getElementById('colors').setCustomValidity("veuillez renseigner une couleur !");
        document.getElementById('colors').reportValidity();
        document.getElementById('colors').focus();
        document.getElementById('colors').onclick = () => {
            document.getElementById('quantity').setCustomValidity(''); //removing warning message on click
        };
    } else if (productQty < 1 || productQty > 99) {
        document.getElementById('quantity').setCustomValidity("veuillez renseigner un nombre d'articles entre 1 et 100 !");
        document.getElementById('quantity').reportValidity();
        document.getElementById('quantity').focus();
        document.getElementById('quantity').onclick = () => {
            document.getElementById('quantity').setCustomValidity(''); //removing warning message on click
        };
    }
    // if color selected and quantity between 1 and 100
    if (productColor && (productQty > 0 && productQty < 101)) {
        cart.add(productToAdd);// add product to cart
        window.location.assign('./cart.html'); //opening cart page
    };

}

getProduct(productId); //retrieving product from kanap catalog