axios.defaults.baseURL = apiServer

/* --------------------------------- Variables --------------------------------- */

let quill = null
const adminAside = document.getElementById('adminAside')
const adminWrapper = document.getElementById('adminWrapper')
const productForm = document.getElementById('addProductTab')
const brandInputWrapper = document.getElementById('brandInputWrapper')
const categoryInputWrapper = document.getElementById('categoryInputWrapper')
const chooseCategory = document.getElementById('chooseCategory')
const chooseBrand = document.getElementById('chooseBrand')
const productsWrapper = document.getElementById('productsWrapper')
const productsError = document.getElementById('productsError')
const ordersTable = document.getElementById('ordersTable')
const customersTable = document.getElementById('customersTable')

let fileName = null

window.onload = () => {
    quill = new Quill('#editor', {
        theme: 'snow'
    });
    fetchProducts()
    checkAuth()
}

/* --------------------------------- Authantication --------------------------------- */

// CheckAuth
const checkAuth = async () => {
    const session = localStorage.getItem('auth')
    if(!session)
        return window.location.replace(server)
    try {
        const {data} = await axios.post('/token/verify', {token: session})
        const adminName = document.getElementById('adminName')
        adminName.innerHTML = data.fullname
    } catch (err) {
        localStorage.removeItem('auth')
    }
}

// Logout
const logout = () => {
    localStorage.clear()
    window.location.replace(server + '/login.html')
}

/* --------------------------------- Admin Sidebar --------------------------------- */

// Admin Sidebar Toggle
let isAdminAsideTaggle = true

const openSidebar = () => {
    adminAside.style.width = '240px'
    adminWrapper.style.marginLeft = '240px'
    adminAside.style.transition = '0.3s'
    adminWrapper.style.transition = '0.3s'
    isAdminAsideTaggle = !isAdminAsideTaggle
}

const closeSidebar = () => {
    adminAside.style.width = '0px'
    adminWrapper.style.marginLeft = '0px'
    adminAside.style.transition = '0.3s'
    adminWrapper.style.transition = '0.3s'
    isAdminAsideTaggle = !isAdminAsideTaggle
}

const toggleAdminSidebar = () => {
    if(!isAdminAsideTaggle) {
        return openSidebar()
    } 
    closeSidebar()
}

// Selected Tab Code
function onTap(select, element) {
    const tabs = document.getElementsByClassName('tab-data')
    for(let tab of tabs) {
        tab.classList.add('hidden')
    }

    // Fetch Orders 
    if (element === 'orders') {
        fetchOrders()
    }

    // Fetch Customers 
    if (element === 'customers') {
        fetchCustomers()
    }

    const tab = document.getElementById(element)
    tab.classList.remove('hidden')
    tab.classList.add('animate__animated','animate__zoomIn','animate_faster')
}

/* --------------------------------- Add New Product --------------------------------- */

// Add Product Tab 
const openAddProductForm = () => {
    productForm.classList.remove('hidden')
    productForm.classList.add('animate__animated', 'animate__slideInRight', 'animate_faster')
    fetchCategories()
    fetchBrands()
}

const closeAddProductForm = () => {
    productForm.classList.add('hidden', 'animate__slideInLeft', 'animate__animated', 'animate_faster' )
    productForm.classList.remove('animate__slideInRight', 'animate__animated', 'animate_faster')
}

// Add New Product
const onAddProduct = async (e) => {
    e.preventDefault()
    const description = quill.root.innerHTML
    const form = e.target
    const productData = {
        title: form.title.value,
        description: description,
        brand: form.brand.value,
        price: form.price.value,
        discount: form.discount.value,
        category: form.category.value,
        quantity: form.quantity.value
    }
    try {
        await axios.post('/product', productData)
        new Swal({
            icon: 'success',
            title: 'Success',
            text: 'Product added successfully' 
        })
        closeAddProductForm()
        form.reset()
        fetchProducts()
    } catch(err) {
        new Swal({
            icon: 'error',
            title: 'Failed',
            text: 'Unable to create product please try after sometime'
        })
        console.log(err.message)
    }
}

// Show or Hide New Brand Input
let isNewBrandShow = false

const showBrandInput = () => {
    let ui = `<input type="text" name="brandName" class="w-full p-2 mt-2 border outline-none rounded" placeholder="Enter New Brand">
              <button onclick="addNewBrand()" class="bg-[#FFC107] mt-2 w-10 h-10 rounded text-white"><i class="ri-add-large-line"></i></button>`
    brandInputWrapper.innerHTML = ui
    isNewBrandShow = !isNewBrandShow

}

const hideBrandInput = () => {
    brandInputWrapper.innerHTML = ''
    isNewBrandShow = !isNewBrandShow
}

const showNewBrandInput = () => {
    if(!isNewBrandShow)
        return showBrandInput()
    hideBrandInput()
}

// Show or Hide New Category Input 
let isNewCategoryInputShow = false

const showCategoryInput = () => {
    let ui = `<input type="text" name="categoryName" class="w-full p-2 mt-2 border outline-none rounded" placeholder="Enter New Category">
              <button onclick="addNewCategory()" class="bg-[#FFC107] mt-2 w-10 h-10 rounded text-white"><i class="ri-add-large-line"></i></button>`
    categoryInputWrapper.innerHTML = ui
    isNewCategoryInputShow = !isNewCategoryInputShow
}

const hideCategoryInput = () => {
    categoryInputWrapper.innerHTML = ''
    isNewCategoryInputShow = !isNewCategoryInputShow
}

const showNewCategoryInput = () => {
    if(!isNewCategoryInputShow)
        return showCategoryInput()
    hideCategoryInput()
}  

/* --------------------------------- Delete Product --------------------------------- */

// Delete Product
const deleteProduct = async (id) => {
    try {
        await axios.delete(`/product/${id}`)
        new Swal({
            icon: 'success',
            title: 'Success',
            text: 'Product deleted successfully'
        })
        fetchProducts()
    } catch(err) {
        new Swal({
            icon: 'error',
            title: 'Failed',
            text: 'Failed to delete product'
        })
    }
}

/* --------------------------------- Update Product Thumbnail --------------------------------- */

// Thumbnail Upload Progressbar Code
const uploadProgress = (progress) => {
    const loadedSize = ((progress.loaded/1024)/1024)
    const totalSize  = ((progress.total/1024)/1024)
    const percent = ((loadedSize * 100) / totalSize)
    
    // Progress Bar
    const progressBar = document.getElementById('progressBar')
    progressBar.style.width = percent + '%'

    const loadedSizeEl = document.getElementById('loadedSize')
    loadedSizeEl.innerHTML = loadedSize.toFixed(2) + 'MB'

    const totalSizeEl = document.getElementById('totalSize')
    totalSizeEl.innerHTML = totalSize.toFixed(2) + 'MB'

    const uploadfileName = document.getElementById('fileName')
    uploadfileName.innerHTML = fileName
    
}

// Change Thumbnail 
const onChangeThumbnail = async (input, id) => {
    try {
        const file = input.files[0]
        const uploader = document.getElementById('uploader')
        uploader.classList.remove('hidden')
        fileName = file.name
        const formData = new FormData()
        formData.append('fileData', file)
        const {data} = await axios.post('/storage', formData, {onUploadProgress: uploadProgress})
        await axios.put(`/product/${id}`, {thumbnail: data.filename})
        fetchProducts()
        uploader.classList.add('hidden')
    } catch (err) {
        new Swal({
            icon: 'error',
            title: 'Failed',
            text: 'Failed to upload file on server'
        })
    }
}  

/* --------------------------------- Fetch Products and Render --------------------------------- */

// Fetch Products 
const renderProducts = (products) => {
    let ui = ''
    for(let product of products) {
        const productUI = `<!-- product card start-->
                            <div class="flex flex-col gap-2 shadow bg-white h-auto">
                                <div class="w-full relative">
                                    <input type="file" accept="image/*" class="w-full h-full absolute opacity-0" onchange="onChangeThumbnail(this, '${product._id}')" />
                                    <img src="${product.thumbnail ? apiServer+'/'+product.thumbnail : '../images/products/product-avt.png'}" alt="" class="object-cover w-full h-[230px]">
                                </div>
                                <div class="p-4 space-y-3">
                                    <p class="text-[12px] text-slate-400 font-semibold capitalize">${product.brand}</p>
                                    <h2 class="text-slate-700 text-md capitalize">${product.title}</h2>
                                    <div class="flex flex-row gap-2">
                                        <span class="font-semibold">₹${Math.round(product.price-(product.price*product.discount)/100)}</span>
                                        <del class="text-slate-400">₹${product.price}</del>
                                        <span class="text-green-500 font-semibold">${product.discount}% off</span>
                                    </div>
                                    <div class="flex flex-row justify-start items-center gap-2">
                                        <button 
                                            onclick="editProduct('${product._id}')"
                                            class="rounded text-white px-3 py-1 rounded bg-[#FFC107] hover:text-[#FFC107] hover:outline hover:outline-2 hover:outline-[#FFC107] hover:bg-white">
                                            <i class="ri-edit-box-line"></i>
                                        </button>
                                        <button
                                            onclick="deleteProduct('${product._id}')" 
                                            class="rounded text-white px-3 py-1 rounded bg-rose-500  hover:text-rose-500 hover:outline hover:outline-2 hover:outline-rose-500 hover:bg-white">
                                            <i class="ri-delete-bin-line"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>`
        ui += productUI
    }
    return ui
}

const onProductsNotAvailable = () => {
    productsWrapper.innerHTML = ''
    return (
        productsError.innerHTML = (`<img src="../images/cat.svg" alt="" class="w-80 h-auto my-5">
                                    <h3 class="text-slate-500">Opps! Products Not Founds</h3>`)
    )
}

const onSuccessProducts = (products) => {
    productsError.classList.add('hidden')
    return productsWrapper.innerHTML = renderProducts(products)
}

const fetchProducts = async () => {
    try {
        const {data} = await axios('/product')
        if(data.length > 0)
            return onSuccessProducts(data)
        
        productsError.classList.remove('hidden')
        onProductsNotAvailable()
    } catch (err) {
        console.log(err)
    }
}

/* --------------------------------- Product Categories --------------------------------- */

// Fetch Categories 
const fetchCategories = async () => {
    const {data} = await axios.get('/category')
    let ui = '<option value="other">Choose a category</option>'
    for(let category of data) {
        const option = `<option value="${category.title}" class="capitalize">${category.title}</option>`
        ui += option
    }
    chooseCategory.innerHTML = ui
}

const addNewCategory = () => {
    alert()
}

/* --------------------------------- Product Brands --------------------------------- */

// Fetch Brands 
const fetchBrands = async () => {
    const {data} = await axios.get('/brand')
    let ui = '<option value="other">Choose a brand</option>'
    for(let brand of data) {
        const option = `<option value="${brand.title}" class="capitalize">${brand.title}</option>`
        ui += option
    }
    chooseBrand.innerHTML = ui
}

/* -------------------------------- Orders -------------------------------- */

// Render Orders
const renderOrders = (orders) => {
    let index = 0
    if(orders.length > 0) {
        let ui = ''
        for (let order of orders) {
            const orderUI = `
            <tr class="border text-left text-[14px] ${index % 2 === 0 ? 'bg-white' : 'bg-slate-200'}">
                <td class="w-60 py-5 pl-3 border-b pr-10">${moment(order.createdAt).format('DD MMM YYYY HH:MM A')}</td>
                <td class="pr-10">${order.product.title}</td>
                <td class="pr-10">${order.product.price}</td>
                <td class="pr-10">${order.product.discount}</td>
                <td class="pr-10">${order.user.fullname}</td>
                <td class="pr-10">${order.user.email}</td>
                <td class="pr-10">${order.user.mobile}</td>
                <td class="pr-10">${order.user.address}</td>
                <td class="pr-10">
                    <select class="border ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}">
                        <option value="created">Created</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="delivered">Delivered</option>
                    </select>
                </td>
            </tr>
            `
            ui += orderUI
            index += 1
        }
        return ui
    }
    return `<tr><td colspan=9 class="w-full text-center p-3 bg-white shadow">No Orders Found</td></tr>`
}

// Fetch Orders
const fetchOrders = async () => {
    try {
        const {data} = await axios.get('/order')
        ordersTable.innerHTML = renderOrders(data)
    } catch(err) {
        console.log(err)
    }
}

/* -------------------------------- Customers -------------------------------- */

// Render Customers UI
const renderCustomers = (customers) => {
    let index = 0
    ui = ''
    for (let customer of customers) {
        const customerUI = `
        <tr class="text-left text-slate-500 text-[14px] ${index % 2 == 0 ? 'bg-white' : 'bg-slate-100'}">
            <td class="py-2 pl-3 pr-10">
                <div class="capitalize">${customer.fullname}</div>
                <span class="text-[10px]">${moment(customer.createdAt).format('DD MMM YYYY hh:mm A')}</span>
            </td>
            <td class="pr-10">
                <div>${customer.email}</div>
                <span class="text-[10px]">${customer._id}</span>
            </td>
            <td class="pr-10">${customer.mobile}</td>
            <td class="pr-10">${customer.address}</td>
        </tr>
        `
        ui += customerUI
        index += 1
    }
    return ui
}

// Fetch Customers 
const fetchCustomers = async () => {
    try {
        const {data} = await axios.get('/user')
        customersTable.innerHTML = renderCustomers(data)
    } catch(err) {
        console.log(err)
    }
}


