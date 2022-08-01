function validateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
        emailHelp.textContent = "e-Mail address is correct!"
        emailHelp.classList.add("text-info")
        emailHelp.classList.remove("text-warning")
        emailHelp.classList.remove("text-muted")
        return true 
    } else {
        emailHelp.textContent = "e-Mail address is incorrect!"
        emailHelp.classList.remove("text-muted")
        emailHelp.classList.remove("text-info")
        emailHelp.classList.add("text-warning")
        return false
    }
}

function checkStrong(password) {
    if (password.match(/[a-z]+/) 
        && password.match(/[A-Z]+/) 
        && password.match(/[0-9]+/) 
        && password.length > 7) {
        passwordHelp.textContent = "Pasword is correct!"
        passwordHelp.classList.add("text-info")
        passwordHelp.classList.remove("text-muted")
        passwordHelp.classList.remove("text-warning")
        return true
    } else {
        passwordHelp.textContent = "Pasword is not correct!"
        passwordHelp.classList.add("text-warning")
        passwordHelp.classList.remove("text-muted")
        passwordHelp.classList.remove("text-info")
        return false
    }
}

function checkPasswords(pass1, pass2) {
    if (pass1 === pass2) {
        passConfHelp.textContent = "Pasword is equal!"
        passConfHelp.classList.add("text-info")
        passConfHelp.classList.remove("text-muted")
        passConfHelp.classList.remove("text-warning")
        return true
    } else {
        passConfHelp.textContent = "Pasword is not equal!"
        passConfHelp.classList.add("text-warning")
        passConfHelp.classList.remove("text-muted")
        passConfHelp.classList.remove("text-info")
        return false
    }
}

export { checkPasswords, checkStrong, validateEmail }
