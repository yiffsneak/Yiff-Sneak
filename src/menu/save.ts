Array.from(document.querySelectorAll<HTMLSelectElement | HTMLInputElement>('select, input')).forEach(el => {
    const val = localStorage.getItem(`setting-${el.id}`)
    if (val !== undefined && val !== null) {
        el.value = val
    } else {
        localStorage.setItem(`setting-${el.id}`, el.value)
    }

    el.addEventListener('change', () => {
        localStorage.setItem(`setting-${el.id}`, el.value)
    })
})