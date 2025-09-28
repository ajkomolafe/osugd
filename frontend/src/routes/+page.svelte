<script lang="js">
    import BeatmapCard from '$lib/components/BeatmapCard.svelte'
    let { data, children } = $props();
</script>

{#if data.user}
    <div class="flex justify-between items-center">
        <!-- outline rounded-lg -->
        <div class="px-5 justify-between items-center w-5/16 outline rounded-lg max-h-135 overflow-y-auto no-scrollbar"> 
            <h1 class="text-xl font-bold p-5 text-center">Graved</h1>
            <div class="pb-5 space-y-2">
                {#each data.beatmapsets.graved as bm}
                    <BeatmapCard beatmap={bm}/>
                {/each}
            </div>
        </div>
        <div class="px-5 justify-between items-center w-5/16 outline rounded-lg max-h-135 overflow-y-auto no-scrollbar"> 
            <h1 class="text-xl font-bold p-5 text-center">Pending</h1>
            <div class="pb-5 space-y-2">
                {#each data.beatmapsets.pending as bm}
                    <BeatmapCard beatmap={bm}/>
                {/each}
            </div>
        </div>
        <div class="px-5 justify-between items-center w-5/16 outline rounded-lg max-h-135 overflow-y-auto no-scrollbar"> 
            <h1 class="text-xl font-bold p-5 text-center">Ranked</h1>
            <div class="pb-5 space-y-2">
                {#each data.beatmapsets.ranked as bm}
                    <BeatmapCard beatmap={bm}/>
                {/each}
            </div>
        </div>
    </div>
{:else}
    <p>You are not logged in. Please log in to see more.</p>
{/if}

<style>
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
    }
</style>