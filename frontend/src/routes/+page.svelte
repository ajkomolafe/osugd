<script lang="js">
    let { data, children } = $props();
</script>

{#if data.user}
    <div class="flex justify-between items-center">
        <div class="px-5"> <!-- outline rounded-lg -->
            Graved
        </div>
        <div class="px-5">
            Pending
        </div>
        <div class="px-5">
            Ranked
        </div>
    </div>
{:else}
    <p>You are not logged in. Please log in to see more.</p>
{/if}
