<script lang="js">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	// let { children } = $props();

  	import { Button } from "$lib/components/ui/button/index.js";
  	import { page } from '$app/state'

  	const client_id = import.meta.env.VITE_CLIENT_ID
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- {@render children?.()} -->
 
<Button href="https://osu.ppy.sh/oauth/authorize?client_id={client_id}&response_type=code&scope=public+identify">Login With osu!</Button>
