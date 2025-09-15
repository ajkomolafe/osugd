<script lang="js">
	import '../app.css'
	import axios from 'axios';
	import favicon from '$lib/assets/favicon.svg'
	import default_beatmap from '$lib/assets/default_beatmap.png'

  	import { Button } from "$lib/components/ui/button/index.js"
	import { Input } from "$lib/components/ui/input/index.js"
  	import { Label } from "$lib/components/ui/label/index.js"
	import * as Dialog from "$lib/components/ui/dialog/index.js"

  	const client_id = import.meta.env.VITE_CLIENT_ID
	const backend_address = import.meta.env.VITE_BACKEND_ADDRESS
	const default_avatar_url = "https://osu.ppy.sh/images/layout/avatar-guest@2x.png"
	let { data, children } = $props()
	let link = $state("")
	let difficulty = $state("")

	async function addBeatmap() {
		try {
			let response = await axios.post(backend_address + "/api/users/add_beatmapset", {
				link: link,
				difficulty: difficulty,
			}, 
			// {
			// 	headers: {
			// 		'Cookie': "session=" + session
			// 	}
			// }
			)
			console.log(response)
		}
		catch (err) {
			console.log(err)
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="px-40 pt-5">
	<header class="flex justify-between items-center mb-8 outline p-4 rounded-lg">
		<div class="flex items-center gap-4">
			<img src={favicon} alt="ogd logo" class="h-12 w-12" />
			<h1 class="text-3xl font-bold">ogd</h1>
		</div>
		<div class="flex items-center gap-4">
			{#if data.user != null}
				<Dialog.Root>
					<Dialog.Trigger asChild>
						<Button 
							variant="outline"
							class="cursor-pointer h-14"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="mr-2 h-4 w-4"
								><path d="M5 12h14" /><path d="M12 5v14" /></svg
							>
							Add Beatmapset
						</Button>
					</Dialog.Trigger>
					<Dialog.Content class="w-150">
						<Dialog.Header>
							<Dialog.Title>Add Beatmapset</Dialog.Title>
							<Dialog.Description>
								Add a new beatmapset to be tracked.
							</Dialog.Description>
						</Dialog.Header>
						<div class="grid gap-4 py-4">
							<div class="grid grid-cols-4 items-center gap-4">
								<Label for="link" class="text-right">Link</Label>
								<Input id="link" class="col-span-3" bind:value={link} placeholder="https://osu.ppy.sh/beatmapsets/..." />
							</div>
							<div class="grid grid-cols-4 items-center gap-4">
								<Label for="difficulty" class="text-right">Difficulty</Label>
								<Input id="difficulty" class="col-span-3" bind:value={difficulty} placeholder={data.user.username + "'s Expert"} />
							</div>
						</div>
						<div class="grid gap-4 py-4">
							<div class="grid grid-cols-4 items-center gap-4">
								<!-- Simple form content -->
							</div>
						</div>
						<Dialog.Footer>
							<Button type="submit" class="cursor-pointer" onclick={addBeatmap}>Submit</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Root>
			{/if}
				<div class="flex items-center gap-2">
				{#if data.user != null}
					<Button 
						variant="outline"
						class="mr-2 h-14 p-4"
					>
						<img
							src={data.user.avatar_url}
							alt="user avatar"
							class="mr-1 h-10 w-10 rounded-full"
						/>
						{data.user.username}
					</Button>
				{:else}
					<Button
						variant="outline"
						href="https://osu.ppy.sh/oauth/authorize?client_id={client_id}&response_type=code&scope=public+identify"
						class="mr-2 h-14 p-4"
					>
						<img
							src={default_avatar_url}
							alt="default user avatar"
							class="mr-2 h-10 w-10 rounded-full"
						/>
						login with osu!
					</Button>
				{/if}
			</div>
		</div>
	</header>

	<main>
		{@render children?.()}
	</main>
</div>