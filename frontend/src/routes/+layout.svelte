<script lang="js">
	import '../app.css'
	import axios from 'axios';
	import favicon from '$lib/assets/white.svg'

  	import { Button, buttonVariants } from "$lib/components/ui/button/index.js"
	import { Input } from "$lib/components/ui/input/index.js"
  	import { Label } from "$lib/components/ui/label/index.js"
	import { Toaster } from "$lib/components/ui/sonner/index.js"
	import { DatePicker } from "bits-ui";
	import { toast } from "svelte-sonner"
	import * as Dialog from "$lib/components/ui/dialog/index.js"
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { invalidate, invalidateAll } from '$app/navigation';
	import { cn } from '$lib/utils.js';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { redirect, isRedirect } from '@sveltejs/kit';

	import Calendar from "$lib/components/ui/calendar/calendar.svelte";
	import * as Popover from "$lib/components/ui/popover/index.js";
	// import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
	import { today, getLocalTimeZone } from "@internationalized/date";
	// import type { CalendarDate } from "@internationalized/date";

  	const client_id = import.meta.env.VITE_CLIENT_ID
	const backend_address = import.meta.env.VITE_BACKEND_ADDRESS
	const default_avatar_url = "https://osu.ppy.sh/images/layout/avatar-guest@2x.png"
	let { data, children } = $props()
	let link = $state("")
	let difficulty = $state("")
	let addBeatmapDialog = $state(false)
	let updateReminderDialog = $state(false)
	let updateReminderDays = $state()
	let updateReminderHours = $state()
	let updateReminderMins = $state()
	let updateReminderCalendarPopoverOpen = $state(false)
	let updateReminderStartDate = $state(today(getLocalTimeZone()))
	let updateReminderStartTime = $state(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }))

	//remove code query param after load
	if (browser){
		window.history.replaceState("", document.title, window.location.origin + window.location.pathname );
	}

	async function addBeatmapset() {
		const response = await fetch('/api/beatmapsets', {
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
			addBeatmapDialog = false;
			invalidate('custom:page')
		}
	}

	async function logout () {
		await fetch('/api/logout', {
            method: 'GET'
        })
        invalidateAll()
	}

	async function addReminder() {
		const parts = updateReminderStartTime.split(':');
		let start_time = (updateReminderStartDate.toDate().getTime() / 1000) + (60 * 60 * parseInt(parts[0], 10)) + (60 * parseInt(parts[1], 10))

		let hours = updateReminderHours ? updateReminderHours : 0
		let mins = updateReminderMins ? updateReminderMins : 0
		let frequency = (updateReminderDays * 24 * 60 * 60) + (hours * 60 * 60) + (mins * 60)
		const response = await fetch('/api/add_reminder', {
			method: 'POST',
			body: JSON.stringify({ start_time, frequency }),
			headers: {
				'content-type': 'application/json'
			}
		})
		const result = await response.json()
		if (result.error != null){
			if (result.error.hint.includes("frequency")){
				toast.error("Error setting reminder frequency", {
					description: "Make sure your frequency is valid, it should be at least 6 hours!",
				})
			} else if (result.error.hint.includes("past")){
				toast.error("Error setting start date", {
					description: "Your start date is too far in the past, it should be within the last 24 hours!",
				})
			} 
			
			
			else {
				toast.error("Error setting reminder frequency", {
					description: "Error setting reminder frequency, try again later."
				})
			}
			
		} else {
			toast.success("Sucessfully set reminder frequency!")
			updateReminderDialog = false;
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>ogd</title>
	<!-- Discord Embed Properties -->
	<meta content="ogd" property="og:title" />
	<meta content="Manager + Reminder for osu! Guest Difficulties" property="og:description" />
	<!-- <meta content={} property="og:url" /> -->
	<meta content={favicon} property="og:image" />
	<meta content="#43B581" data-react-helmet="true" name="theme-color" />
</svelte:head>

<Toaster 
	position="top-center"
	richColors
/>

<!-- Add Beatmap Dialog -->
<Dialog.Root bind:open={addBeatmapDialog}>
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
		<Dialog.Footer>
			<Button type="submit" class="cursor-pointer" onclick={addBeatmapset}>Submit</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Set Reminder Dialog -->
<Dialog.Root bind:open={updateReminderDialog}>
	<Dialog.Content class="w-150">
		<Dialog.Header>
			<Dialog.Title>Set Reminder Schedule</Dialog.Title>
			<Dialog.Description>
				Set the schedule to be reminded to complete your guest difficulties. There is a minimum of 6 hours between reminders.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-[max-content_1fr_1fr_1fr] items-center gap-4">
				<Label for="remind-every">Remind every</Label>
				<div class="col-span-3 flex items-center gap-2">
					<Input type="number" min="0" max="7" placeholder="days" bind:value={updateReminderDays}/>
					<Input type="number" min="0" max="23" placeholder="hours" bind:value={updateReminderHours}/>
					<Input type="number" min="0" max="59" placeholder="mins" bind:value={updateReminderMins}/>
				</div>
				<Label for="starting-from">Starting from</Label>
				<div class="col-span-3 grid grid-cols-3 gap-2">
					<Popover.Root class="w-full">
						<Popover.Trigger>
							<Button
								variant="outline"
								class="justify-start text-left w-full font-normal"
							>
								{updateReminderStartDate
								? updateReminderStartDate.toDate(getLocalTimeZone()).toLocaleDateString()
								: "date"}
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
									>
									<path d="M6 9l6 6 6-6" />
								</svg>
							</Button>
						</Popover.Trigger>
						<Popover.Content class="w-auto overflow-hidden p-0" align="start">
							<Calendar
							type="single"
							bind:value={updateReminderStartDate}
							captionLayout="dropdown"
							/>
						</Popover.Content>
					</Popover.Root>
					<Input
					type="time"
					id="time"
					step="60"
					bind:value={updateReminderStartTime}
					class="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
					/>
					<div class="flex-1"></div>
				</div>
			</div>
		</div>
		<Dialog.Footer>
			<Button type="submit" class="cursor-pointer" onclick={addReminder}>Submit</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Main Objects -->
<div class="px-40 pt-5">
	<header class="flex justify-between items-center mb-8 outline p-4 rounded-lg">
		<div class="flex items-center gap-4">
			 <a href="/">
				<h1 class="text-3xl text-[ogd-primary] font-bold hover:text-gray-400 transition-colors">ogd</h1>
			</a>
		</div>
		<div class="flex items-center gap-4">
			{#if data.user != null}
				<!-- Add Beatmapset Button -->
				<Button 
					class={cn(buttonVariants({ variant: "outline" }), "cursor-pointer h-14 text-black dark:text-white")} 
					onclick={() => {addBeatmapDialog = true}}>
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
						class="h-4 w-4"
						><path d="M5 12h14" /><path d="M12 5v14" />
					</svg>
					Add Beatmapset
				</Button>

				<!-- Set Reminder Button -->
				<Button 
					class={cn(buttonVariants({ variant: "outline" }), "cursor-pointer h-14 text-black dark:text-white")} 
					onclick={() => {updateReminderDialog = true}}>
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
						class="h-4 w-4"
						>
						<circle cx="12" cy="12" r="10" /> 
						<path d="M12 6v6" /> 
						<path d="M12 12h5" />
					</svg>	
					Set Reminder Schedule
				</Button>
			{/if}
				<div class="flex items-center gap-2">
				{#if data.user != null}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger class={cn(buttonVariants({ variant: "outline" }), "cursor-pointer h-14")}>
							<img
								src={data.user.avatar_url}
								alt="user avatar"
								class="mr-1 h-10 w-10 rounded-full"
							/>
							{data.user.username}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content>
							<DropdownMenu.Label>Account</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<DropdownMenu.Item class="cursor-pointer" onclick={logout}>Logout</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{:else}
					<Button
						variant="outline"
						href={"https://osu.ppy.sh/oauth/authorize?client_id=" + client_id + "&response_type=code&scope=public+identify&redirect_uri=" + page.url.origin}
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