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

//active Link Navabar
document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll("nav #main-menu li a");
    const currentPage = window.location.href;
    links.forEach(link => {
        if(link.href === currentPage){
            link.classList.add("activePageLink");
        }
    })
})

//shopping cart functionality
let relatedItemlistHtml = document.getElementById("RelatedProducts");
let mainProductHtml = document.getElementById("MainProduct");
let listCart = document.getElementById("listItems");
let items_num = document.getElementById('items_num');
let mainData = {};
let itemlist = [];
let cart = [];

function initApp() {
    const urlParams = new URLSearchParams(window.location.search);
    const product_id = urlParams.get("id");
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            itemlist = data;
            mainData = itemlist.find(value => value.id == product_id);
            if(mainData){
                addMainDataToHtml();
                addRelatedDataToHtml();
            } else {
                console.error("Product Not Found.")
            }
            if (localStorage.getItem('item')) {
                cart = JSON.parse(localStorage.getItem('item'));
                addItemsCartHtml();
            }
        })
        .catch(error => console.error('Error fetching products:', error));
}

initApp();

function addMainDataToHtml() {
    let mainImg = document.getElementById('mainImg');
    mainImg.src = mainData.image;
    let sideImages = document.getElementById('sideImgs');
    if(Array.isArray(mainData.sideImages) && mainData.sideImages.length > 0){
        mainData.sideImages.forEach(img => {
        let sideImg = document.createElement('img');
        sideImg.src = img;
        sideImg.classList.add('sideimg');
        sideImg.setAttribute("tabindex", "0")
        sideImg.onerror = () => {
            sideImages.style.display = "none";
        }
        sideImages.appendChild(sideImg);   
    }
    );
    sideImages.addEventListener("click", (event) => {
        if (event.target.tagName === 'IMG') { 
            mainImg.src = event.target.src;
            let allSideImgs = document.querySelectorAll('.sideimg');
            allSideImgs.forEach(img => {
                img.classList.remove('highlight');
            })
            event.target.classList.add('highlight');
            event.target.focus();
        }
    }
    )
    }
    //Product Content
    let content = document.getElementById('content');
    content.innerHTML = `<h2 id="productName">${mainData.name}</h2>
        <div id="productRating">${renderRatings(mainData)}</div>
        <div id="priceContainer">
                <p id="mainFinal_price">$${mainData.final_price}</p>
                <del id="mainPrevious_price">$${mainData.previous_price}</del>
                </div>
        <div id="productDescription"><b>${mainData.description}</b></div>
        <button class="btn2" id="mainAddToCart" data-id="${mainData.id}">Add to Cart</button>
        <button class="btn2" id="mainCheckOut">Check Out</button>`;
    const mainDataAddToCart = document.getElementById("mainAddToCart");
    mainDataAddToCart.addEventListener("click", () => {
        addToCart(mainData.id);
    });
   
}

function addRelatedDataToHtml() {
    relatedItemlistHtml.innerHTML = ''; 
    const mainProductCategory = mainData.category; 
    const RelatedProducts = itemlist.filter(product => {
        return product.category == mainProductCategory && product.id !== mainData.id;
    });
    const totalRelatedProducts = RelatedProducts.slice(0, 9);
    if (totalRelatedProducts.length > 0) {
        totalRelatedProducts.forEach(product => {
            let newProduct = document.createElement('div');
            newProduct.classList.add('card');
            newProduct.dataset.id = product.id;
            newProduct.innerHTML = `
                <img src="${product.image}" alt="" draggable>
                <a href="${product.link}">
                    <h3>${product.name}</h3>
                </a>
                <div id="priceContainer">
                <p id="final_price">$${product.final_price}</p>
                <del id="previous_price">$${product.previous_price}</del>
                </div>
                <div class="rating">${renderRatings(product)}</div>    
                <button class="btn2 addToCart">Add to Cart</button>`;
            relatedItemlistHtml.appendChild(newProduct);
        });
        scrollFunction();
    } else {
        relatedItemlistHtml.innerHTML = '<p>No products available.</p>';
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
window.onload = loadCart;

relatedItemlistHtml.addEventListener("click", (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains("addToCart")) {
        let product_id = positionClick.parentElement.dataset.id;
        addToCart(product_id);
    }
})

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
    addCartToMemory();
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

            let newItem = document.createElement('div');
            newItem.classList.add('item');
            newItem.dataset.id = item.product_id;
            newItem.innerHTML = `
                <div class="image"><img src="${itemInfoCart.image}" alt=""></div>
                <div class="name">${itemInfoCart.name}</div>
                <div class="totalPrice">$${itemInfoCart.final_price * item.quantity}</div>
                <div class="quantity" data-id="${item.product_id}">
                    <span><i class="fas fa-trash-alt remove"></i></span>
                    <span class="minus quantitybtn">&lt;</span>
                    <span id="quantity">${item.quantity}</span>
                    <span class="plus quantitybtn">&gt;</span>
                </div>`;
            listCart.appendChild(newItem);
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

//Rating system
let data = [
    {
        'star': 5,
        'count': 297008
    },
    {
        'star': 4,
        'count': 39300
    },
    {
        'star': 3,
        'count': 25050
    },
    {
        'star': 2,
        'count': 10070
    },
    {
        'star': 1,
        'count': 5020
    },
];
let totalRating = 0;
let totalRatingBasedOnStars = 0;
data.forEach(rating => {
    totalRating += rating.count; 
    totalRatingBasedOnStars += rating.count * rating.star; 
    let ratingBar = `<div class="ratingLine">
                    <div class="ratingLineTitle">
                        <i class="fas fa-star"><h4>${rating.star}</h4></i>
                    </div>
                    <div class="barContainer">
                    <div class="bar" style="width: ${(rating.count / totalRating) * 100}%;"></div>
                    </div>
                    <div class="ratingLineCount">${rating.count.toLocaleString()}</div>
                </div>  `;
    let averageRating = (totalRatingBasedOnStars / totalRating).toFixed(1);
    document.getElementById("totalRatingScore").innerHTML += ratingBar;
    document.getElementById("averageRatingStars").style.width = (averageRating / 5) * 100 + "%";
    document.querySelector("#averageRatingContent #count").innerText = totalRating.toLocaleString();
    document.querySelector("#averageRating h2").innerText = averageRating;
})

//card slider 
const cardsContainer = document.getElementById("RelatedProducts");
function scrollFunction(){
    const cardWidth = document.querySelector(".card").offsetWidth;
    let cardPerView = Math.round(cardsContainer.offsetWidth / cardWidth);
    const totalCards = [...cardsContainer.children];
    totalCards.slice(-cardPerView).forEach(card => {
        cardsContainer.insertAdjacentHTML("afterbegin", card.outerHTML);
    })
    totalCards.slice(0, cardPerView).forEach(card => {
        cardsContainer.insertAdjacentHTML("beforeend", card.outerHTML);
    })
    const scrollbtns = document.querySelectorAll("#scrollbtns button");
    scrollbtns.forEach(btn => {
    btn.addEventListener("click", () => {
        cardsContainer.scrollLeft += btn.id === "scrollLeft"? -cardWidth : cardWidth; 
    })
    cardsContainer.addEventListener("scroll", () => {
        if(cardsContainer.scrollLeft === 0){
            cardsContainer.classList.add("noTransition");
            cardsContainer.scrollLeft = cardsContainer.scrollWidth - (2 * cardsContainer.offsetWidth);
            cardsContainer.classList.remove("noTransition");
        } else if(Math.round(cardsContainer.scrollLeft) === cardsContainer.scrollWidth - cardsContainer.offsetWidth){
            cardsContainer.classList.add("noTransition");
            cardsContainer.scrollLeft = cardsContainer.offsetWidth;
            cardsContainer.classList.remove("noTransition");
        }
    });
})
}
let drag = false, startX, startScrollLeft;
cardsContainer.addEventListener("mousedown", (e) => {
    drag = true;
    cardsContainer.classList.add("dragging");
    startX = e.pageX;
    startScrollLeft = cardsContainer.scrollLeft;
})
cardsContainer.addEventListener("mousemove", (e) => {
    if(!drag) return;
        cardsContainer.scrollLeft = startScrollLeft - (e.pageX - startX);
        

})
document.addEventListener("mouseup", () => {
    drag = false;
    cardsContainer.classList.remove("dragging");
})
cardsContainer.addEventListener("mouseleave", () => {
    drag = false;
    cardsContainer.classList.remove("dragging");
});


