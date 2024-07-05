axios.defaults.baseURL = apiServer

/* --------------------------------- Variables --------------------------------- */

const productContainer = document.getElementById('products-container')
const productsNotFound = document.getElementById('products-not-found')


window.onload = () => {
    fetchProducts()
    renderProfile()
}

/* --------------------------------- Products Code--------------------------------- */

// Show Products Not Availble UI
const renderNotFoundUI = () => {
    return (    
        `<div class="md:w-4/12 bg-white p-8">
            <img src="./images/cat.svg" alt="products-not-found">
            <div class="p-2 flex flex-col justify-center items-center space-y-2">
                <h1 class="font-semibold text-3xl text-slate-400 ">Oops!</h1>
                <p class="text-slate-300">Products Not Found!</p>
            </div>
        </div>`
    )
}

// Products Not Availble
const onProductsNotAvailable = () => {
    productsNotFound.classList.remove('hidden')
    return productsNotFound.innerHTML = renderNotFoundUI()
}

// Render Products Interface
const renderProductsUI = (products) => {
    let ui = ''
    for(let product of products) {
        const productUI = `<!-- product card start-->
                                <div class="flex flex-col gap-2 shadow bg-white h-auto">
                                    <div class="w-full">
                                        <img src="${product.thumbnail ? apiServer+'/'+product.thumbnail : './images/products/product-avt.png'}" alt="" class="object-cover w-full h-[230px]">
                                    </div>
                                    <div class="p-4 space-y-3">
                                        <p class="text-[12px] text-slate-400 font-semibold capitalize">${product.brand}</p>
                                        <h2 class="text-slate-700 text-md capitalize">${product.title}</h2>
                                        <div class="flex flex-row gap-2">
                                            <span class="font-semibold">₹${Math.round(product.price - (product.price / 100 * product.discount))}</span>
                                            <del class="text-slate-400">₹${product.price}</del>
                                            <span class="text-green-500 font-semibold">${product.discount}% off</span>
                                        </div>
                                        <div class="grid grid-rows-2 gap-3">
                                            <button onclick="addToCart('${product._id}')" class="text-[14px] text-[#FFC107] px-3 py-1 rounded outline outline-2 outline-[#FFC107]">Add To Cart</button>
                                            <button class="text-[14px] text-white bg-[#FFC107] px-3 py-1 rounded outline outline-2 outline-[#FFC107]">Buy Now</button>
                                        </div>
                                    </div>
                                </div>
                            <!-- product card end-->`
        ui += productUI
    }
    return ui
}

// Fetch Products Success
const onSuccessFetch = (products) => {
    return productContainer.innerHTML = renderProductsUI(products)
}


// Fetch Products Request
const fetchProducts = async () => {
    try {
        const {data} = await axios.get('/product')
        if(data.length > 0)
            return onSuccessFetch(data)
        onProductsNotAvailable()
    } catch(err) {
        console.log(err)
    }
}

/* --------------------------------- Cart --------------------------------- */

// Add to cart
const addToCart = async (productId) => {
    try {
        const token = localStorage.getItem('auth')
        const options = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
        await axios.post('/cart', {product: productId}, options)
        new Swal({
            icon: 'success',
            title: 'Success',
            text: 'Product added to cart' 
        })
    } catch(err) {
        new Swal({
            icon: 'error',
            title: 'Failed',
            text: err.message
        })
    }
}

