const kanapCatalogBaseUrl = 'http://localhost:3000/api/products';// base url to access Kanap catalog
const urlParams = (new URL(document.location)).searchParams;
const productId = urlParams.get('id'); //retrieving product-id from url

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

//create DOM objects for each parameter of the Kanap Product to display on product page
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

getProduct(productId);
