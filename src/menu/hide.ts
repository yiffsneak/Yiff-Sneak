const updateListeners: (() => void)[] = []

Array.from(document.querySelectorAll('div[show-when]')).forEach(section => {
    const [ elId, val ] = section.getAttribute('show-when')!.split('=')
    const el = document.querySelector(`#${elId}`)!
    const ck = () => {
        if (!('value' in el)) {
            console.log('skip')
            return
        }
        if (el.value != val) {
            section.classList.add('hidden')
        } else {
            section.classList.remove('hidden')
        }
    }
    ck()
    updateListeners.push(ck)
    el.addEventListener('change', ck)
})

document.querySelector('button[type="reset"]')!.addEventListener('click', () => {
    setTimeout(() => {
        updateListeners.forEach(ck => ck())
    }, 10)
})