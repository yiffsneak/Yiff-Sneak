import { loadUrl } from './image.js'


const mode: 'random' | 'favorites' = localStorage.getItem('setting-mode') as any
const favUid = localStorage.getItem('setting-favoriteUserId')


const wait = (delay: number) => {
    return new Promise<void>((res, rej) => {
        setTimeout(() => {
            res()
        }, delay)
    })
}

interface E6Post {
    preview: {
        url: string
    }
}

const cacheAmount = 5
const urls: string[] = localStorage.getItem('posts') ? JSON.parse(localStorage.getItem('posts') as string) : []

const genUrlRandom = async (): Promise<string> => {
    const { post }: { post: E6Post } = await fetch('https://e621.net/posts/random.json').then(res => res.json())
    const imgUrl = post.preview.url
    return imgUrl
}


let favCache: string[] = []
let favCacheSet = 0
const genFavCache = async () => {
    favCacheSet = 1
    const { posts }: { posts: E6Post[] } = await fetch(`https://e621.net/favorites.json?user_id=${favUid}`).then(res => {
        if (res.status != 200) {
            throw new Error()
        }
        return res
    }).then(res => res.json()).catch(err => {
        alert(`Could not get favorites of user ${favUid}\nThe user might have privacy mode (hidden favorites) turned on`)
        window.location.assign('/index.html')
    })
    favCache = posts.map(post => post.preview.url)
    favCacheSet = 2
}
const genUrlFav = async (): Promise<string> => {
    if (favCacheSet == 0) {
        await genFavCache()
    } else if (favCacheSet == 1) {
        while (favCacheSet == 1) {
            await wait(10)
        }
    }
    const i = Math.floor(Math.random() * favCache.length)
    const imgUrl = favCache[i]
    return imgUrl
}

const genUrl = async () => {
    let imgUrl = ''
    switch (mode) {
        case 'random':
            imgUrl = await genUrlRandom()
            break
        case 'favorites':
            imgUrl = await genUrlFav()
            break
    }
    if (!imgUrl) {
        return
    }
    try {
        await loadUrl(imgUrl)
    } catch (err) {
        return
    }
    urls.push(imgUrl)
    localStorage.setItem('posts', JSON.stringify(urls))
}

let cachingRunning = false
export const genCache = async () => {
    if (cachingRunning) {
        while (urls.length < cacheAmount) {
            await wait(10)
        }
        return
    }
    cachingRunning = true

    while (urls.length < cacheAmount) {
        await genUrl()
    }
    cachingRunning = false
}

export const waitUsableCache = async () => {
    if (urls.length > 0) {
        return
    }
    while (urls.length == 0) {
        await wait(10)
    }
}

export const getImg = async (): Promise<string> => {
    await waitUsableCache()
    const url = urls.pop()!
    console.log('got img')
    localStorage.setItem('posts', JSON.stringify(urls))
    genCache()
    return url
}