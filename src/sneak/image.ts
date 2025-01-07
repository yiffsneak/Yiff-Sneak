
const imgMap = new Map<string, CanvasImageSource>()

export const loadUrl = async (url: string): Promise<CanvasImageSource> => {
    if (imgMap.has(url)) {
        return imgMap.get(url)!
    }

    const img = document.createElement('img')
    img.src = url
    await new Promise<void>((res, rej) => {
        img.addEventListener('load', () => {
            res()
        })
        img.addEventListener('error', () => {
            rej(new Error('failed to load image'))
        })
    })
    imgMap.set(url, img)
    return img
}

export const delUrl = (url: string) => {
    imgMap.delete(url)
}