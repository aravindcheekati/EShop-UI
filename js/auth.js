axios.defaults.baseURL = apiServer
const registerContainer = document.getElementById('register-container')
const profileWrapper = document.getElementById('profile-wrapper')

// CheckAuth
const checkAuth = async () => {
    const session = localStorage.getItem('auth')
    if(!session) 
        return null
    try {
        const {data} = await axios.post('/token/verify', {token: session})
        return data
    } catch (err) {
        localStorage.removeItem('auth')
    }
}


const renderProfile = async () => {
    const session = await checkAuth()

    // Checking Authentication By LocalStorage
    if(session) {
        const profileUI = ` 
                <div class="w-8 h-8 relative">
                    <button class="bg-slate-50" onclick="onClickProfile()">
                        <img src="./images/pic.jpg" alt="profile" class="rounded-full" id="profile-photo"/>
                    </button>
                    <div id="user-profile-details" class="w-[200px] h-auto absolute right-0 top-[50px] bg-white rounded shadow border hidden">
                        <ul class="p-4">
                            <li class="border-b py-2 text-[12px]"><i class="ri-mail-line mr-2"></i>${session.email}</li>
                            <li class="border-b py-2 text-[12px]"><a href="cart.html" class="text-[12px]"><i class="ri-shopping-cart-line mr-2"></i>Cart</a></li>
                            <li class="border-b py-2"><button class="text-[12px]" onclick="logout()"><i class="ri-logout-box-r-line mr-2"></i>Logout</button></li>
                        </ul>
                    </div>
                </div>`
        profileWrapper.innerHTML = profileUI
        profileWrapper.classList.remove('hidden')
        registerContainer.classList.add('hidden')   
    }
}




// Logout Functionality
const logout = () => {
    localStorage.clear()
    window.location.replace(server + '/login.html')
}

// Navbar Profile Card Open and Close Functionality
let isProfileVisible = false

const onClickProfile = () => {
    const userProfileDetails = document.getElementById('user-profile-details')
    
    if(!isProfileVisible) {
        userProfileDetails.classList.remove('hidden')
        isProfileVisible = !isProfileVisible
    } else {
        userProfileDetails.classList.add('hidden')
        isProfileVisible = !isProfileVisible
    }
}