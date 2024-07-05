const quantity = document.getElementById('quantity') 
const cartWrapper = document.getElementById('cartWrapper')

window.onload = async () => {
    const session = await checkAuth()
    if(!session) 
        return window.location.href = `${server}/login.html`
    fetchCart()
}

/* ---------------------------------------- Cart ---------------------------------------- */

// Show Cart 
const renderCartUI = (cartProducts) => {
    let ui = ''
    for (let cart of cartProducts) {
        const {product} = cart
        let index = 0
        const cartUI = `
                <div class="bg-white mt-4 p-4 rounded shadow grid grid-cols-8 gap-3" id="product-card-${index}">
                    <div  class="col-span-3 md:col-span-1">
                        <img src="${product.thumbnail ? apiServer+'/'+product.thumbnail : './images/products/a.jpg'}" alt="" class="w-full h-full object-cover">
                    </div>
                    <div class="col-span-5 md:col-span-7 px-4 space-y-2">
                        <h1 class="text-xl font-semibold text-slate-500">${product.title}</h1>
                        <div class="flex flex-row gap-2">
                            <span class="font-semibold">₹${Math.round(product.price - (product.price * product.discount / 100))}</span>
                            <del class="text-slate-400">₹${product.price}</del>
                            <span class="text-green-500 font-semibold">${product.discount}% off</span>
                        </div>
                        <div>
                            <button class="w-8 h-8 bg-rose-100 rounded-full hover:bg-rose-500 hover:text-white" onclick="decreaseQuantity()"><i class="ri-subtract-line"></i></button>
                            <span class="mx-2" id="quantity">${cart.quantity}</span>
                            <button class="w-8 h-8 bg-green-100 rounded-full hover:bg-green-500 hover:text-white" onclick="increaseQuantity()"><i class="ri-add-line"></i></button>
                        </div>
                        <div class="flex gap-3">
                            <button class="block mt-4 text-[14px] text-white bg-[#FFC107] px-3 py-1 rounded outline outline-2 outline-[#FFC107]">Buy Now</button>
                            <button class="block mt-4 text-[14px] text-[#FFC107] bg-white px-3 py-1 rounded outline outline-2 outline-[#FFC107]" onclick="removeFromCart('${cart._id}','product-card-${index}')">Remove</button>       
                        </div>
                    </div>
                </div>
             `
        ui += cartUI
        index += index
    }
    return ui
}

// Fetch Products
const fetchCart = async () => {
    try {
        const token = localStorage.getItem("auth")
        const options = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
        const {data} = await axios('/cart', options) 
        cartWrapper.innerHTML = renderCartUI(data)
    } catch (err) {
        new Swal({
            icon: 'error',
            title: 'Failed',
            text: err.message
        })
    }
}

// Increase Quantity
const increaseQuantity = () => {
    prdoctQuantity += 1
    quantity.innerHTML = prdoctQuantity
}


// Decrease Quantity
const decreaseQuantity = () => {
   if(prdoctQuantity > 1) {
        prdoctQuantity -= 1
        quantity.innerHTML = prdoctQuantity
   }
}


// Remove from cart

const removeFromCart = async (cartID, cartCardID) => {
    try {
        const token = localStorage.getItem('auth')
        const options = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
        await axios.delete(`/cart/${cartID}`, options)
        const cartCard = document.getElementById(cartCardID)
        cartCard.remove()
    } catch (err) {
        new Swal({
            icon: 'error',
            title: 'Failed',
            text: 'Product not removed from cart'
        })
    }
}