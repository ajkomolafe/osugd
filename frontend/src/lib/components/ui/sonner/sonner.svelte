<script>
	import { Toaster as Sonner } from "svelte-sonner";
	// import { mode } from "mode-watcher";

	let { ...restProps } = $props();
</script>

<!-- theme={mode.current} -->
<Sonner
	class="toaster group"
	style="--normal-bg: var(--color-popover); --normal-text: var(--color-popover-foreground); --normal-border: var(--color-border);"
	{...restProps}
/>