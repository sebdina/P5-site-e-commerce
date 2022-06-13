
const kanapCatalogBaseUrl = 'http://localhost:3000/api/products';// base url to access Kanap catalog

// fetch all products from the kanap catalog, async await function
const getHomeProducts = async () => {
    const allProductsRequestParam = '/';
    const urlToFetch = `${kanapCatalogBaseUrl}${allProductsRequestParam}`;

    try {
        const response = await fetch(urlToFetch); // await fetching
        if (response.ok) {
            const jsonResponse = await response.json();// if promise ok getting json response
            addProductsToHome(jsonResponse);
        }
    } catch (error) {
        console.log(error); // if reponse not ok catching error
    }

}

//create DOM objects for each results product of the Kanap catalog to display on the homepage
const addProductsToHome = (products) => {
    const items = document.getElementById('items'); //getting items section
    products.forEach(element => {
        //creating necessary elements
        const link = document.createElement('a');
        const article = document.createElement('article');
        const image = document.createElement('img');
        const title = document.createElement('h3');
        const texte = document.createElement('p');

        //adding attributes and contents
        link.href = `./product.html?id=${element._id}`; //adding element id to url parameters
        image.src = element.imageUrl;
        image.alt = element.altTxt;
        title.innerHTML = element.name;
        texte.innerHTML = element.description;

        //adding elements to DOM
        items.appendChild(link);
        link.appendChild(article);
        article.appendChild(image);
        article.appendChild(title);
        article.appendChild(texte);
    });

}

getHomeProducts(); // call the async function