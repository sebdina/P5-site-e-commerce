
const fetch = require('../node_modules/node-fetch'); //to correct ReferenceError: fetch is not defined
//const {getAllProducts} = require('../back/controllers/product');

const kanapCatalogBaseUrl = 'http://localhost:3000/api/products';// base url to access Kanap catalog

const getHomeProducts = async () => {
    const allProductsRequestParam = '/';
    const urlToFetch = `${kanapCatalogBaseUrl}${allProductsRequestParam}`;

    try {
        const response = await fetch(urlToFetch);
        if (response.ok) {
            const jsonResponse = await response.json();
            return jsonResponse;
            //console.log(jsonResponse);
        }
    } catch (error) {
        console.log(error);
    }

}

const addProductsToHome = (productsArray) => {

    

}


getHomeProducts();