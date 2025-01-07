import './save.js'
import './hide.js'

const form = document.querySelector('form')!
form.addEventListener('submit', e => {
    e.preventDefault()

    window.location.assign('/sneak.html')
})