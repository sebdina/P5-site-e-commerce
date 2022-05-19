
//const fetch = require('node-fetch'); //to correct ReferenceError: fetch is not defined with node

const kanapCatalogBaseUrl = 'http://localhost:3000/api/products';// base url to access Kanap catalog

// fetch objects from the kanap catalog, async await function
const getHomeProducts = async () => {
    const allProductsRequestParam = '/';
    const urlToFetch = `${kanapCatalogBaseUrl}${allProductsRequestParam}`;

    try {
        const response = await fetch(urlToFetch);
        if (response.ok) {
            const jsonResponse = await response.json();
            addProductsToHome(jsonResponse);
        }
    } catch (error) {
        console.log(error);
    }

}

//create DOM objects for each results object of the Kanap catalog to display on the homepage
const addProductsToHome = (products) => {

    const items = document.getElementById('items');

    products.forEach(element => {
        const link = document.createElement('a');
        const article = document.createElement('article');
        const image = document.createElement('img');
        const title = document.createElement('h3');
        const texte = document.createElement('p');

        link.href = `./product.html?id=${element._id}`;
        image.src = element.imageUrl;
        image.alt = element.altTxt;
        title.innerHTML = element.name;
        texte.innerHTML = element.description;

        items.appendChild(link);
        link.appendChild(article);
        article.appendChild(image);
        article.appendChild(title);
        article.appendChild(texte);
    });

}

getHomeProducts(); // call the async function