<script lang="js">
    import cover from "../assets/default_beatmap_cover.png"
    import edit_pencil from "../assets/edit_pencil.svg"
    import trash from "../assets/trash.svg"
    import { toast } from "svelte-sonner"
    import { Input } from "$lib/components/ui/input/index.js"
  	import { Label } from "$lib/components/ui/label/index.js"
    import { Button } from "$lib/components/ui/button/index.js"
    import { Switch } from "$lib/components/ui/switch/index.js";
    import * as Dialog from "$lib/components/ui/dialog/index.js"

    let { beatmapset, deleteBeatmapsetParent, parentInvalidateAll } = $props();

    const defaults = {
        cover: cover,
    }
    beatmapset = { ...defaults, ...beatmapset };

	let difficulty = $state(beatmapset.difficulty)
	let editBeatmapDialogOpen = $state(false)
    let isHovering = $state(false)
    let completed = $state(beatmapset.completed)

    async function editBeatmapset() {
        let link = "https://osu.ppy.sh/s/" + beatmapset.beatmapset_id
		const response = await fetch('/api/beatmapsets', {
			method: 'PATCH',
			body: JSON.stringify({ link, difficulty, completed }),
			headers: {
				'content-type': 'application/json'
			}
		})
		const result = await response.json()
		if (result.error != null){
			if (result.error.hint.includes("link")){
				toast.error("Error editing beatmapset", {
					description: "This beatmapset may already be deleted!",
				})
			} else if (result.error.hint.includes("difficulty")) {
				toast.error("Error editing beatmapset", {
					description: "Make sure your difficulty isn't empty!",
				})
			} else {
				toast.error("Error editing beatmapset", {
					description: "Error editing beatmap, try again later."
				})
			}
			
		} else {
			toast.success("Sucessfully added beatmapset!")
			editBeatmapDialogOpen = false;
			beatmapset.difficulty = difficulty
		}

        if (completed != beatmapset.completed){
            parentInvalidateAll()
        }
	}

    async function deleteBeatmapset() {
        let beatmapset_id = beatmapset.beatmapset_id
		const response = await fetch('/api/beatmapsets', {
			method: 'DELETE',
			body: JSON.stringify({ beatmapset_id }),
			headers: {
				'content-type': 'application/json'
			}
		})
		const result = await response.json()
        //fix toasting
		if (result.error != null){
			if (result.error.hint.includes("beatmapset_id")){
				toast.error("Error deleting beatmapset", {
					description: "This beatmapset may already be deleted!",
				})
			} else if (result.error.hint.includes("beatmap doesn't exist")) {
				toast.error("Error deleting beatmapset", {
					description: "This beatmapset has already been deleted!",
				})
			} else {
				toast.error("Error deleting beatmapset", {
					description: "Error deleting beatmap, try again later."
				})
			}
			
		} else {
			toast.success("Sucessfully deleted beatmapset!")
            deleteBeatmapsetParent(beatmapset.beatmapset_id, beatmapset.completed)
		}
	}
    
    // beatmapset_id
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

<!-- on click of the dialogue, the overflow thing is popping out still so get that checked -->
<!-- Edit Beatmap Dialog -->
<Dialog.Root bind:open={editBeatmapDialogOpen}>
    <Dialog.Content class="w-150">
        <Dialog.Header>
            <Dialog.Title>Edit {beatmapset.title}</Dialog.Title>
            <Dialog.Description>
                Change the guest difficulty name or WIP status.
            </Dialog.Description>
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="completed" class="text-right">Completed</Label>
                <Switch bind:checked={completed} />
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="difficulty" class="text-right">Difficulty Name</Label>
                <Input id="difficulty" class="col-span-3" bind:value={difficulty} placeholder={"Expert"} />
            </div>
        </div>
        <Dialog.Footer>
            <Button type="submit" class="cursor-pointer" onclick={editBeatmapset}>Submit</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

{#if beatmapset != null && beatmapset.beatmapset_id != null}
    <div 
        class="relative group overflow-hidden rounded-lg outline"
        onmouseenter={() => { isHovering = true }}
        onmouseleave={() => { isHovering = false }}
        onfocusin={() => { isHovering = true }}
        onfocusout={() => { isHovering = false }}
        role="gridcell"
        tabindex=-1
    >
        <a href={"https://osu.ppy.sh/s/" + beatmapset.beatmapset_id}>
            <div
                class="px-4 py-2 flex flex-col justify-center @container"
                style="background-position: center; background-size: cover; background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('{beatmapset.cover}'); aspect-ratio: 2 / 1;"
            >
                <h3 class="text-white font-bold text-[6cqw] truncate">
                    {beatmapset.title}
                </h3>
                <p class="text-white text-[4cqw] truncate">
                    by {beatmapset.artist}
                </p>
                <p class="text-gray-300 font-bold text-[4cqw] truncate">
                    {beatmapset.source}
                </p>
                <br/>
                <p class="text-white text-[4cqw] truncate">
                    hosted by {beatmapset.creator_username}
                </p>
                <p class="text-white text-[4cqw] font-bold truncate">
                    {beatmapset.difficulty}
                </p>
            </div>
        </a>
        <div 
            class="rounded-lg bg-gray-300 flex flex-col justify-center items-center space-y-6 absolute top-0 right-0 h-full w-16 transform transition-transform duration-300 ease-in-out"
            class:translate-x-0={isHovering && !editBeatmapDialogOpen}
            class:translate-x-full={!isHovering || editBeatmapDialogOpen}
        >
            {#if beatmapset.completed == false}
                <button onclick={() => { editBeatmapDialogOpen = true; }}>
                    <img src={edit_pencil} alt="edit" class="w-4 h-4 filter brightness-0 light:invert cursor-pointer" />
                </button>
            {/if}
            <button onclick={deleteBeatmapset}> <!-- open a dialog that says are you sure you want to delete <> -->
                <img src={trash} alt="delete" class="w-6 h-6 filter brightness-0 light:invert cursor-pointer" />
            </button>
        </div>
    </div>
{:else}
    <div
        style="background-position: center; background-size: cover; background-image: url('{beatmapset.cover}'); aspect-ratio: 2 / 1;"
        class="rounded-lg py-2 px-4 flex flex-col justify-center @container"    
    >
        <p class="text-white text-center text-[5cqw] truncate">
            Add more beatmapsets!
        </p>
    </div>
{/if}