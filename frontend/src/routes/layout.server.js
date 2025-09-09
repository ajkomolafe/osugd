export async function load({ cookies, url }) {
    if (code != null){
        cookies.set("code", code, {path: "/"})
    }
	const osuauthToken = cookies.get("osuauth")
    try {
        const response = await fetch("/validateAuth")
        if (response.ok){
            //get pfp and username
        }
        else {
            console.log("Failed Validate")
        }
    }
    catch {}
}