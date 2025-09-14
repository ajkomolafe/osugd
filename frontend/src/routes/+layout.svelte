<script lang="js">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

  	import { Button } from "$lib/components/ui/button/index.js";
  	import { page } from '$app/state'

  	const client_id = import.meta.env.VITE_CLIENT_ID
	let { data, children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- {@render children?.()} -->
{#if data.user != null}
	<p>Logged in as {data.user.username}</p>
    <img src={data.user.avatar_url} alt="user avatar" />
{:else}
	<Button href="https://osu.ppy.sh/oauth/authorize?client_id={client_id}&response_type=code&scope=public+identify">Login With osu!</Button>
{/if}