//side-menu function
let sideMenuOpen = document.getElementById("menu-icon");
let sideMenuClose = document.getElementById("cross-menu-icon");
let sideMenuItems = document.getElementById("side-menu");
sideMenuOpen.addEventListener("click", () => {
    sideMenuItems.style.right = "0";
})
sideMenuClose.addEventListener("click", () => {
    sideMenuItems.style.right = "-100%";
})

//active Link Navabar
document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll("#main-menu li a");
    const currentPage = window.location.href;
    links.forEach(link => {
        if(link.href === currentPage){
            link.classList.add("activePageLink");
        }
    })
})

//cart menu function
let shoppingCart = document.getElementById('shoppingCart');
let cartMenuOpen = document.getElementById('cart');
let cartMenuClose = document.getElementById('closeShoppingCart');
cartMenuOpen.addEventListener("click", () => {
    shoppingCart.style.right = "0";
})
cartMenuClose.addEventListener("click", () => {
    shoppingCart.style.right = "-100%";
})

//cart functionality
const addItemsHtml = document.getElementById("products");
const addItemsCartHtml = document.getElementById("listItems");
const categorySelection = document.getElementById("categorySelection");
let items_num = document.getElementById("items_num");
const pagination = document.getElementById('pagination');
let itemList = [];
let cart = [];
let currentPage = 1;
const itemsPerPage = 24;
let filteredCategoryItems = [];

fetchProducts();

function fetchProducts(){
    fetch("products.json").then(response => response.json()).then(data => 
        {itemList = data;
            const categoryUrlParams = new URLSearchParams(window.location.search);
            const selectedCategoryUrl = categoryUrlParams.get('category');
            const savedCategory = localStorage.getItem('selectedCategory') || "All";
            const selectedCategory = selectedCategoryUrl? selectedCategoryUrl.replace('%20',' ') : savedCategory;
            categorySelection.value = selectedCategory;
    
            filteredCategoryItems = selectedCategory === "All" 
                    ? itemList 
                    : itemList.filter(product => product.category === selectedCategory);
        
        addProductsHtml();
            if(localStorage.getItem('item')){
                cart = JSON.parse(localStorage.getItem('item'));
                addToCartHtml();
            };
    })
}

function addProductsHtml(){
    addItemsHtml.innerHTML = '';
    const startIndex = (currentPage - 1)*itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    let filteredItems = filteredCategoryItems.slice(startIndex, endIndex);
    if(filteredItems.length > 0){
        filteredItems.forEach((product) => {
            let newProduct = document.createElement('div');
            newProduct.classList.add('card');
            newProduct.dataset.id = product.id;
            newProduct.innerHTML = `<img src="${product.image}" alt="">
            <a href="${product.link}"><h3>${product.name}</h3></a>     
            <div id="priceContainer">
                <p id="final_price">$${product.final_price}</p>
                <del id="previous_price">$${product.previous_price}</del>
                </div>
            <div class="rating">${renderRatings(product)}</div>    
            <button class="btn2 addToCart">Add to Cart</button>`;
            addItemsHtml.appendChild(newProduct);
        });
        fetchProductPage();
    } else {
        addItemsHtml.innerHTML = "items not found";
    }
    paginationFunction();
}

categorySelection.addEventListener("change", () => {
    currentPage = 1;
    const selectedCategory = categorySelection.value;
    filteredCategoryItems = selectedCategory === "All" ? itemList: itemList.filter(product => {
        return  product.category === selectedCategory;
    });
    localStorage.setItem('selectedCategory', selectedCategory);
    addProductsHtml();
})

function renderRatings(product) {
    let stars = '';
    const fullStars = Math.floor(product.rating);
    const halfStars = product.rating % 1 !== 0;
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) { 
            stars += `<i class="fas fa-star"></i>`;
        } else if (i === fullStars && halfStars) {
            stars += `<i class="fas fa-star-half-alt"></i>`;
        } else {
            stars += `<i class="far fa-star"></i>`;
        }
    }
    return stars;
}

function paginationFunction() {
    pagination.innerHTML = '';
    const totalPages = Math.ceil(filteredCategoryItems.length / itemsPerPage);
    
    for (let i = 1; i <= totalPages; i++) {
        let pageButton = document.createElement('div');
        pageButton.innerText = i;
        pageButton.className = 'pagebtn';
        pageButton.dataset.page = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
            addProductsHtml();
            highlightPage(); 
        });

        pagination.appendChild(pageButton);
    }
    
    highlightPage();
}
function highlightPage(){
    const btns = document.querySelectorAll('.pagebtn');
    btns.forEach(btn => {
        if(parseInt(btn.dataset.page) === currentPage){
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    })
}

// Load cart from localStorage when the page loads
function loadCart() {
    const storedCart = localStorage.getItem('item');
    if (storedCart) {
        cart = JSON.parse(storedCart);
        addToCartHtml(); // Update HTML with loaded cart items
    }
}

// Call loadCart on page load
window.onload = loadCart;

addItemsHtml.addEventListener("click", (e) => {
    if(e.target.classList.contains("addToCart")){
        let product_id = e.target.parentElement.dataset.id;
        addToCart(product_id);
    }
})

function addToCart(product_id){
    let productPositionInCart = cart.findIndex((value) => value.product_id == product_id);
    if (productPositionInCart >= 0) {
        cart[productPositionInCart].quantity++;
    } else {
        cart.push({
            product_id: product_id,
            quantity: 1
        });
    }
    addToCartHtml();
    addDataToMemory();
    showNotification(product_id);
}
function addDataToMemory(){
    localStorage.setItem('item', JSON.stringify(cart));
}
function addToCartHtml() {
    addItemsCartHtml.innerHTML = '';
    let totalQuantity = 0;

    if (cart.length > 0) {
        cart.forEach(item => {
            totalQuantity += item.quantity;
            let itemInfoCart = itemList.find(product => product.id == item.product_id);

            let newItem = document.createElement('div');
            newItem.classList.add('item');
            newItem.dataset.id = item.product_id;
            newItem.innerHTML = `
                <div class="image"><img src="${itemInfoCart.image}" alt=""></div>
                <div class="name">${itemInfoCart.name}</div>
                <div class="totalPrice">$${itemInfoCart.final_price * item.quantity}</div>
                <div class="quantity" data-id="${item.product_id}">
                    <span><i class="fas fa-trash-alt remove"></i></span>
                    <span class="minus quantitybtn"><</span>
                    <span>${item.quantity}</span>
                    <span class="plus quantitybtn">></span>
                </div>`;
            addItemsCartHtml.appendChild(newItem);
        });
    }
    items_num.innerText = totalQuantity;
}

function showNotification(product_id){
    const productAddedPrompt = document.getElementById("productAddedPrompt");
    const data = itemList.find((value) => value.id == product_id);
    if(data){
        productAddedPrompt.innerHTML = `<h2> ${data.name} has been added to Cart`;
        productAddedPrompt.style.display = "block";
        setTimeout(() => {
            productAddedPrompt.style.opacity = "0";
            setTimeout(() => {
                productAddedPrompt.style.opacity = "1";
                productAddedPrompt.style.display = "none";
            }, 1000)
        }, 3000)
    }
}

addItemsCartHtml.addEventListener("click", (event) => {
    if (event.target.classList.contains("remove")) {
        let product_id = event.target.parentElement.dataset.id;
        let productPosition = cart.findIndex((value) => value.product_id == product_id);
        cart.splice(productPosition,1);
        addToCartHtml();
        addDataToMemory();
    }
});

addItemsCartHtml.addEventListener("click", (e) => {
    if(e.target.classList.contains("minus") || e.target.classList.contains("plus")){
        let product_id = e.target.parentElement.dataset.id;
        let type = e.target.classList.contains("plus")? "plus":"minus";
        changeQuantity(type, product_id);
    }
})

function changeQuantity(type, product_id){
    let productPositionInCart = cart.findIndex((value) => value.product_id == product_id);
    if(productPositionInCart >= 0){
        switch (type) {
            case "plus":
                cart[productPositionInCart].quantity++;
                break;
            default:
                cart[productPositionInCart].quantity--;
                if(cart[productPositionInCart].quantity <= 0){
                    cart.splice(productPositionInCart, 1);
                }
                break;
        }
    };
    addToCartHtml();
    addDataToMemory();
}

//fetch Product Page
function fetchProductPage() {
    document.querySelectorAll(".card").forEach(product => {
        product.querySelector("img").addEventListener('click', function(e) {
            const productId = product.dataset.id;
            const href = getProductPageLink(productId);
            window.location.href = href;
        });
    });
}

function getProductPageLink(productid) {
    return `Product.html?id=${productid}`;
}

//search functionality
let searchInput = document.getElementById('searchInput');
let keywords = [];

fetch('products.json').then(response => response.json()).then(data => { 
    itemList = data;
    keywords = data.map(keyword => keyword.name); 
    loadSearchDataFromMemory();
});

function addSearchDataToMemory(searchquery, filteredItems) {
    sessionStorage.setItem('query', JSON.stringify(searchquery));
    sessionStorage.setItem('filteredResults', JSON.stringify(filteredItems));
}

function loadSearchDataFromMemory() {
    const savedQuery = sessionStorage.getItem('query');
    const savedResults = sessionStorage.getItem('filteredResults');

    if (savedQuery) {
        searchInput.value = JSON.parse(savedQuery);
    }

    if (savedResults) {
        const filteredItems = JSON.parse(savedResults);
        displayFilteredProducts(filteredItems);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadSearchDataFromMemory();
});

document.getElementById("search-icon").onclick = () => {
    let input = searchInput.value.toLowerCase();
    
    if (input.length > 0) {
        const filteredItems = filterProducts(input);
        addSearchDataToMemory(input, filteredItems);
        displayFilteredProducts(filteredItems);
    } else {
        addProductsHtml();
        
        sessionStorage.removeItem('query');
        sessionStorage.removeItem('filteredResults');
    }
}

searchInput.addEventListener("keypress", (e) => {
    if(e.key === "Enter"){
        document.getElementById("search-icon").click();
    }
});

function filterProducts(input) {
    return itemList.filter(product => product.name.toLowerCase().includes(input));
}

function displayFilteredProducts(filteredItems) {
    addItemsHtml.innerHTML = '';
    
    if (filteredItems.length > 0) {
        filteredItems.forEach((product) => {
            let newProduct = document.createElement('div');
            newProduct.classList.add('card');
            newProduct.dataset.id = product.id;
            newProduct.innerHTML = `
                <img src="${product.image}" alt="">
                <a href="${product.link}"><h3>${product.name}</h3></a>     
                <div id="priceContainer">
                    <p id="final_price">$${product.final_price}</p>
                    <del id="previous_price">$${product.previous_price}</del>
                </div>
                <div class="rating">${renderRatings(product)}</div>    
                <button class="btn2 addToCart">Add to Cart</button>`;
            addItemsHtml.appendChild(newProduct);            
            fetchProductPage();
        });
    } else {
        addItemsHtml.innerHTML = "<h2>Product Not found 😢</h2>";
        addItemsHtml.style.padding = "100px";
    }
    
    pagination.innerHTML = '';
}
