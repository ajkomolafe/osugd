function getCookie(req, name) {
    if (req.headers.cookie == null){
        return null
    }
    const cookies = req.headers.cookie.split('; ');
    for (const cookie of cookies){
        if (cookie.startsWith(name)){
            return cookie.substring(name.length + 1, cookie.length)
        }
    }
    return null
}

export { getCookie }