axios.defaults.baseURL = apiServer

let showError = false

// Hide Error
const hideError = () => {
    if(showError) {
        document.getElementById('error-msg').classList.add('hidden')
        showError = false
    }
}

// Login Failed ( Show Error Message )
const onFailed = (data) => {
    showError = true
    if(showError) {
        const showError = document.getElementById('error-msg')
        showError.classList.remove('hidden')
        showError.innerHTML = `<span class="text-[12px] text-rose-500 font-medium">* ${data.message}</span>`
    }
}

// Login Success
const onSuccess = (data) => {
    const {token} = data
    localStorage.setItem('auth', token)
    window.location.replace(server)
}

// Login
const onLogin = async (e) => {
    e.preventDefault()
    const form = e.target
    const user = {
        email: form.email.value,
        password: form.password.value
    }

    try {
        const {data} = await axios.post('/auth/login', user)
        onSuccess(data)
    } catch(err) {
        const {response} = err
        const {data} = response
        onFailed(data)
    }
}