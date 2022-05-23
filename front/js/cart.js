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
     //add a new item to the cart
    add(product) {
        //check that it is not in the cart already
        if (cart.find(product.key)) {
            cart.increase(product.key);
            
        } else {
            cart.products.push(product);
            //update localStorage
            cart.sync();
        }
    },
    increase(key){
        //increase the quantity of an item in the cart
        cart.products = cart.products.map(item=>{
            if(item.key === key)
                item.quantity++;
            return item;
        });
        //update localStorage
        cart.sync();
    },
    reduce(key){
        //decrease the quantity of an item in the cart
        cart.products = cart.products.map(item=>{
            if(item.key === key)
                item.quantity--;
            return item;
        });
        //update localStorage
        cart.sync();
    },
    change(key, qty){
        //change the quantity of an item in the cart
        cart.products = cart.products.map(item=>{
            if(item.key === key)
                item.quantity = parseInt(qty);
            return item;
        });
        //update localStorage
        cart.sync();
    },
    remove(key){
        //remove an product entirely from the cart based on its key
        cart.products = cart.products.filter(item => {
            return item.key !== key;
        });
        //update localStorage
        cart.sync()
    }
};

//after page is loaded get cart from localStorage to cart object
document.addEventListener('DOMContentLoaded', () => {
    //localStorage.clear();
    cart.init();
    addProductsToCartPage(cart.products);
});


//create DOM objects for each results object of the Kanap cart to display on the cartpage
const addProductsToCartPage = (products) => {

    const cartItems = document.getElementById('cart__items');

    products.forEach(element => {
        const article = document.createElement('article');
        article.setAttribute('class',"cart__item");
        article.setAttribute('data-id', element.id);
        article.setAttribute('data-color', element.color);
        cartItems.appendChild(article);

        const imgDiv = document.createElement('div');
        imgDiv.setAttribute('class',"cart__item__img");
        article.appendChild(imgDiv);
            const image = document.createElement('img');
            image.src = element.imageUrl;
            image.alt = element.altTxt;
            imgDiv.appendChild(image);

        const contentDiv = document.createElement('div');
        contentDiv.setAttribute('class',"cart__item__content");
        article.appendChild(contentDiv);
            const descriptionDiv = document.createElement('div');
            descriptionDiv.setAttribute('class',"cart__item__content__description");
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
            settingsDiv.setAttribute('class',"cart__item__content__settings");
            contentDiv.appendChild(settingsDiv);
                const settingsQtyDiv = document.createElement('div');
                settingsQtyDiv.setAttribute('class',"cart__item__content__settings__quantity");
                settingsDiv.appendChild(settingsQtyDiv);
                    const quantity = document.createElement('p');
                    quantity.innerHTML = 'Qté : ';
                    settingsQtyDiv.appendChild(quantity);
                    const inputQty = document.createElement('input');
                    inputQty.setAttribute('type',"number");
                    inputQty.setAttribute('class',"itemQuantity");
                    inputQty.setAttribute('name',"itemQuantity");
                    inputQty.setAttribute('min',"1");
                    inputQty.setAttribute('max',"100");
                    inputQty.setAttribute('value',element.quantity);
                    inputQty.setAttribute('data-key', element.key);
                    settingsQtyDiv.appendChild(inputQty);
                const deleteDiv = document.createElement('div');
                deleteDiv.setAttribute('class',"cart__item__content__settings__delete");
                settingsDiv.appendChild(deleteDiv);
                    const deleteItem = document.createElement('p');
                    deleteItem.setAttribute('class',"deleteItem");
                    deleteItem.setAttribute('id', element.key);
                    deleteItem.innerHTML = 'Supprimer';
                    deleteDiv.appendChild(deleteItem);

    });

const deleteItems = Array.from(document.getElementsByClassName('deleteItem')); //convert HTMLcollections deleteItem to Array
const inputsQty = document.getElementsByClassName('itemQuantity');

//click listener on all Delete buttons
deleteItems.forEach(element => {
    element.addEventListener("click", () => {
        articleToDelete =  document.getElementById(element.id).closest('article');
        articleToDelete.remove(); //removing from DOM
        cart.remove(element.id); //removing from cart
        updateTotals(); //updating total articles and price
    })
})

// Change listener on all quantity inputs
for (let i = 0; i < inputsQty.length; i++) {
    inputsQty[i].addEventListener("change", () => {
                cart.change(inputsQty[i].getAttribute('data-key'), inputsQty[i].value);
                //console.log(cart.products);
                updateTotals(); //updating total articles and price
            })
}

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
    totalPrice.innerHTML =  price;    
    //console.log(cart.products);
}

updateTotals();

}