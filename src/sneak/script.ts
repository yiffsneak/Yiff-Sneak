import { loadUrl, delUrl } from './image.js'
import { genCache, getImg } from './e6cache.js'

const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!
const ctx = canvas.getContext('2d')!

const size = 10
const speed = Number(localStorage.getItem('setting-speed'))
const color = '#f00'
let scale = 10

interface Pos {
    x: number
    y: number
}

let sneakLength = 1
const body: Pos[] = [{
    x: 0,
    y: 0
}]
let dir: Pos = {
    x: 0,
    y: 1
}

const apples: {pos: Pos, url: string}[] = []


const resize = () => {
    const rect = canvas.getBoundingClientRect()
    scale = Math.floor(rect.height / size)
    canvas.width = scale * size
    canvas.height = scale * size
}
window.addEventListener('resize', resize)
resize()


const generateApple = async () => {
    const x = Math.floor(Math.random() * size)
    const y = Math.floor(Math.random() * size)
    const url = await getImg()

    apples.push({
        pos: {x, y},
        url
    })
}



const tick = async () => {
    body.unshift({x: body[0].x, y: body[0].y})
    if (body.length > sneakLength) {
        body.pop()
    }
    
    body[0].x += dir.x
    body[0].y += dir.y

    const appleI = apples.findIndex(apple => apple.pos.x == body[0].x && apple.pos.y == body[0].y)
    if (appleI != -1) {
        sneakLength++

        // remove unused images from cache
        const imgUrl = apples[appleI].url
        const urlU = apples.find((apple, i) => apple.url == imgUrl && i != appleI)
        if (!urlU) {
            delUrl(imgUrl)
        }

        // delete apple
        apples.splice(appleI, 1)
        await generateApple()
    }

    if (body[0].x < 0 || body[0].x >= size || body[0].y < 0 || body[0].y >= size) {
        alert('you lost')
        window.location.assign('/index.html')
    }

    setTimeout(() => {
        tick()
    }, speed)
}



window.addEventListener('keydown', e => {
    switch (e.key) {
        case 'w':
            dir.y = -1
            dir.x = 0
            break
        case 's':
            dir.y = 1
            dir.x = 0
            break
        case 'a':
            dir.y = 0
            dir.x = -1
            break
        case 'd':
            dir.y = 0
            dir.x = 1
            break
    }
})


const render = async () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = color
    
    for (const part of body) {
        // ctx.fillRect(part.x * scale, part.y * scale, scale, scale)
        ctx.drawImage(await loadUrl('assets/tetris.png'), part.x * scale, part.y * scale, scale, scale)
    }

    for (const apple of apples) {
        // ctx.fillRect(apple.x * scale, apple.y * scale, scale, scale)
        try {
            ctx.drawImage(await loadUrl(apple.url), apple.pos.x * scale, apple.pos.y * scale, scale, scale)
        } catch {
            if (apple.url != 'about:blank') {
                apple.url = 'about:blank'
                ;(async () => {
                    apple.url = await getImg()
                })()
            }
        }
    }
    

    window.requestAnimationFrame(render)
}

const startGame = async () => {
    console.log('start caching')
    await loadUrl('assets/tetris.png')
    await genCache()
    console.log('done caching')
    for (let i = 0; i < 3; i++) {
        await generateApple()
    }
    await genCache()
    console.log('done cache 2')
    render()
    tick()
}
startGame()