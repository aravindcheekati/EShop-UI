axios.defaults.baseURL = apiServer

const onRegisterUser = async (e) => {
    e.preventDefault()
    const signupForm = e.target
    
    const user = {
        fullname: signupForm.fullname.value,
        email: signupForm.email.value,
        password: signupForm.password.value,
        mobile: signupForm.mobile.value,
        address: signupForm.address.value
    }

    try {
        const {data} = await axios.post('/auth/signup', user)
        localStorage.setItem('auth', data.token)
        window.location.replace(server)
    } catch(err) {
        console.log(err.message)
    }
}