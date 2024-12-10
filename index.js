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
    let shoppingCart = document.getElementById("shoppingCart");
    let cartMenuOpen = document.getElementById("cart");
    let cartMenuClose = document.getElementById("closeShoppingCart");

    cartMenuOpen.addEventListener("click", () => {
        console.log("Cart icon clicked");
        cartMenuOpen.style.color = "white";
        shoppingCart.style.right = "0"; // Open cart
    });

    cartMenuClose.addEventListener("click", () => {
        shoppingCart.style.right = "-100%"; // Close cart
    });


// Shopping cart functionality
let latestItemlistHtml = document.getElementById("Latestcards");
let popularItemlistHtml = document.getElementById("Popularcards");
let listCart = document.getElementById("listItems");
let items_num = document.getElementById('items_num');
let itemlist = []; // This should be populated with product data
let cart = [];

// Function to add data to HTML
function addDataToHtml() {
    latestItemlistHtml.innerHTML = '';   
    popularItemlistHtml.innerHTML = '';   

    if (itemlist.length > 0) {
        itemlist.forEach(product => {
            let newProduct = document.createElement('div');
            newProduct.classList.add('card');
            newProduct.dataset.id = product.id;
            newProduct.innerHTML = `
                <img src="${product.image}" alt="">
                <a href="${product.link}">
                    <h3>${product.name}</h3>
                </a>
                <div id="priceContainer">
                    <p id="final_price">$${product.final_price}</p>
                    <del id="previous_price">$${product.previous_price}</del>
                </div>
                <div class="rating">${renderRatings(product)}</div>    
                <button class="btn2 addToCart">Add to Cart</button>`;
            
            if (product.isLatest) {
                latestItemlistHtml.appendChild(newProduct);
            } else if (product.isPopular) {
                popularItemlistHtml.appendChild(newProduct);
            }
        });
    } else {
        latestItemlistHtml.innerHTML = '<p>No products available.</p>';
    }
}

// Load cart from localStorage when the page loads
function loadCart() {
    const storedCart = localStorage.getItem('item');
    if (storedCart) {
        cart = JSON.parse(storedCart);
        addItemsCartHtml(); // Update HTML with loaded cart items
    }
}

// Call loadCart on page load
window.onload = loadCart();

// Combined event listener for adding items to cart
latestItemlistHtml.addEventListener("click", addToCartEventHandler);
popularItemlistHtml.addEventListener("click", addToCartEventHandler);

function addToCartEventHandler(event) {
    let positionClick = event.target;
    if (positionClick.classList.contains("addToCart")) {
        let product_id = positionClick.parentElement.dataset.id;
        addToCart(product_id);
    }
}

function addToCart(product_id) {
    let positionProductInCart = cart.findIndex((value) => value.product_id == product_id);
    
    if (positionProductInCart >= 0) {
        cart[positionProductInCart].quantity++;
    } else {
        cart.push({
            product_id: product_id,
            quantity: 1
        });
    }

    addItemsCartHtml();
    addCartToMemory;
    showNotification(product_id);
}

const addCartToMemory = () => {
    localStorage.setItem('item', JSON.stringify(cart));
};

function addItemsCartHtml() {
    listCart.innerHTML = '';
    let totalQuantity = 0;
    if (cart.length > 0) {
        cart.forEach(item => {
            totalQuantity += item.quantity;
            let itemInfoCart = itemlist.find(product => product.id == item.product_id);
            if (itemInfoCart) {
                let newItem = document.createElement('div');
                newItem.classList.add('item');
                newItem.dataset.id = item.product_id;
                newItem.innerHTML = `
                    <div class="image"><img src="${itemInfoCart.image}" alt=""></div>
                    <div class="name">${itemInfoCart.name}</div>
                    <div class="totalPrice">$${(itemInfoCart.final_price * item.quantity).toFixed(2)}</div>
                    <div class="quantity" data-id="${item.product_id}">
                        <span><i class="fas fa-trash-alt remove"></i></span>
                        <span class="minus quantitybtn"><</span>
                        <span>${item.quantity}</span>
                        <span class="plus quantitybtn">></span>
                    </div>`;
                listCart.appendChild(newItem);
            } else {
                console.log("Product in itemInfoCArt not found.");
            }
        });
    }
    
    items_num.innerText = totalQuantity;
}


function showNotification(product_id){
    const productAddedPrompt = document.getElementById("productAddedPrompt");
    const data = itemlist.find((value) => value.id == product_id);
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

listCart.addEventListener("click", (event) => {
    if (event.target.classList.contains("remove")) {
        let product_id = event.target.parentElement.dataset.id;
        let productPosition = cart.findIndex((value) => value.product_id == product_id);
        cart.splice(productPosition,1);
        addItemsCartHtml();
        addCartToMemory();
    }
});

listCart.addEventListener("click", (event) => {
    let itemQuantityControl = event.target;

    if (itemQuantityControl.classList.contains('minus') || itemQuantityControl.classList.contains('plus')) {
        let product_id = itemQuantityControl.parentElement.dataset.id;
        let type = itemQuantityControl.classList.contains('plus') ? 'plus' : 'minus';
        changeItemQuantity(product_id, type);
    }
});

function changeItemQuantity(product_id, type) {
    let positionItemInCart = cart.findIndex((value) => value.product_id == product_id);

    if (positionItemInCart >= 0) {
        switch(type) {
            case 'plus':
                cart[positionItemInCart].quantity++;
                break;
            case 'minus':
                cart[positionItemInCart].quantity--;
                if (cart[positionItemInCart].quantity <= 0) {
                    cart.splice(positionItemInCart, 1);
                }
                break;
        }
    }
    addCartToMemory();
    addItemsCartHtml();
}

function initApp() {
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            itemlist = data;
            if (localStorage.getItem('item')) {
                cart = JSON.parse(localStorage.getItem('item'));
                addItemsCartHtml();
            };
            addDataToHtml();
        })
        .catch(error => console.error('Error fetching products:', error));
}

initApp();

function renderRatings(product) {
    let stars = '';
    const fullStars = Math.floor(product.rating);
    const halfStars = product.rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += `<i class="fas fa-star"></i>`;
        } else if (i === fullStars && halfStars) {
            stars += `<i class="fas fa-star-half-alt"></i>`;
        } else {
            stars += `<i class="far fa-star"></i>`;
        }
    }

    return stars;
}
