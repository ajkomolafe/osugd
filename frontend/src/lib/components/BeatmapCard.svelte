<script lang="js">
    import cover from "../assets/default_beatmap_cover.png"
    import edit_pencil from "../assets/edit_pencil.svg"
    import trash from "../assets/trash.svg"
    import { toast } from "svelte-sonner"
    import { Input } from "$lib/components/ui/input/index.js"
  	import { Label } from "$lib/components/ui/label/index.js"
    import { Button } from "$lib/components/ui/button/index.js"
    import * as Dialog from "$lib/components/ui/dialog/index.js"

    let { beatmap } = $props();

    const defaults = {
        cover: cover,
    }
    beatmap = { ...defaults, ...beatmap };

    // let link = $state("")
	let difficulty = $state(beatmap.difficulty)
	let dialogOpen = $state(false)
    let isHovering = $state(false)

    async function editBeatmapset() {
        let link = "https://osu.ppy.sh/s/" + beatmap.id
		const response = await fetch('/api/add_beatmapset', {
			method: 'POST',
			body: JSON.stringify({ link, difficulty }),
			headers: {
				'content-type': 'application/json'
			}
		})
		const result = await response.json()
		if (result.error != null){
			if (result.error.hint.includes("link")){
				toast.error("Error adding beatmapset", {
					description: "Make sure your beatmapset link is valid!",
				})
			} else if (result.error.hint.includes("difficulty")) {
				toast.error("Error adding beatmapset", {
					description: "Make sure your difficulty isn't empty!",
				})
			} else {
				toast.error("Error adding beatmapset", {
					description: "Error adding beatmap, try again later."
				})
			}
			
		} else {
			toast.success("Sucessfully added beatmapset!")
			dialogOpen = false;
			invalidateAll()
		}
	}
    
    // id
    // ogd_user_id
    // difficulty
    // artist
    // artist_unicode
    // cover
    // source
    // status
    // title
    // title_unicode
    // creator_id
    // creator_username
</script>

<!-- <a class="" style="background-image: url('{beatmap.background_url}')"> -->
{#if beatmap.id != null}
    <Dialog.Root bind:open={dialogOpen}>
        <Dialog.Content class="w-150">
            <Dialog.Header>
                <Dialog.Title>Edit {beatmap.title}</Dialog.Title>
                <Dialog.Description>
                    Change the guest difficulty name.
                </Dialog.Description>
            </Dialog.Header>
            <div class="grid gap-4 py-4">
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="difficulty" class="text-right">Difficulty</Label>
                    <Input id="difficulty" class="col-span-3" bind:value={difficulty} placeholder={"Expert"} />
                </div>
            </div>
            <Dialog.Footer>
                <Button type="submit" class="cursor-pointer" onclick={editBeatmapset}>Submit</Button>
            </Dialog.Footer>
        </Dialog.Content>
    </Dialog.Root>

    <!-- on click of the dialogue, the overflow thing is popping out still so get that checked -->

    <div 
        class="relative group overflow-hidden rounded-lg"
        onmouseenter={() => { isHovering = true }}
        onmouseleave={() => { isHovering = false }}
        onfocusin={() => { isHovering = true }}
        onfocusout={() => { isHovering = false }}
        role="gridcell"
        tabindex=-1
    >
        <a href={"https://osu.ppy.sh/s/" + beatmap.id}>
            <div
                style="background-position: center; background-size: cover; background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('{beatmap.cover}')"
                class="aspect-2/1 outline rounded-lg px-4 flex flex-col justify-center"    
            >
                <h3 class="text-white font-bold text-xl/5">
                    {beatmap.title}
                </h3>
                <p class="text-white text-sm">
                    by {beatmap.artist}
                </p>
                <p class="text-gray-300 text-xs font-bold italic">
                    {beatmap.source}
                </p>
                <br/>
                <p class="text-white text-sm">
                    hosted by {beatmap.creator_username}
                </p>
                <p class="text-white text-sm font-bold">
                    {beatmap.difficulty}
                </p>
            </div>
        </a>
        <div 
            class="rounded-lg bg-black/90 flex flex-col justify-center items-center space-y-12 absolute top-0 right-0 h-full w-16 transform transition-transform duration-300 ease-in-out"
            class:translate-x-0={isHovering && !dialogOpen}
            class:translate-x-full={!isHovering || dialogOpen}
        >
            {#if beatmap.status != "ranked"}
                <button onclick={() => { dialogOpen = true; }}>
                    <img src={edit_pencil} alt="edit" class="w-4 h-4 filter brightness-0 invert cursor-pointer" />
                </button>
            {/if}
            <img src={trash} alt="delete" class="w-6 h-6 filter brightness-0 invert cursor-pointer" />
        </div>
    </div>
{:else}
    <div
        style="background-position: center; background-size: cover; background-image: url('{beatmap.cover}')"
        class="aspect-2/1 outline rounded-lg py-2 px-4 flex flex-col justify-center"    
    >
        <p class="text-white text-sm text-center">
            Add more beatmapsets!
        </p>
    </div>
{/if}