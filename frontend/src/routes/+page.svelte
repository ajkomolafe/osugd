<script lang="js">
    import BeatmapCard from '$lib/components/BeatmapCard.svelte'
    import cover from "../lib/assets/default_beatmap_cover.png"

    let { data, children } = $props();

    function deleteBeatmapsetParent(beatmapset_id, status) {
        let newBeatmapsets = { ...data.beatmapsets };
        let default_beatmapset = {
            cover: cover,
        }

        if (status == "graveyard"){
            newBeatmapsets.graveyard = newBeatmapsets.graveyard.filter((beatmapset) => {
                beatmapset != null && beatmapset.beatmapset_id !== beatmapset_id
            });

            const max_length = Math.min(Math.max(newBeatmapsets.graveyard.length, newBeatmapsets.pending.length, newBeatmapsets.ranked.length), 3)
            while (newBeatmapsets.graveyard.length < max_length){
                newBeatmapsets.graveyard.push(default_beatmapset)
            }
        } 
        else if (status == "pending"){
            newBeatmapsets.pending = newBeatmapsets.pending.filter((beatmapset) => {
                beatmapset != null && beatmapset.beatmapset_id !== beatmapset_id
            });

            const max_length = Math.min(Math.max(newBeatmapsets.graveyard.length, newBeatmapsets.pending.length, newBeatmapsets.ranked.length), 3)
            while (newBeatmapsets.pending.length < max_length){
                newBeatmapsets.pending.push(default_beatmapset)
            }
            console.log(newBeatmapsets.pending)
        } 
        else if (status == "ranked"){
            newBeatmapsets.ranked = newBeatmapsets.ranked.filter((beatmapset) => {
                beatmapset != null && beatmapset.beatmapset_id !== beatmapset_id
            });

            const max_length = Math.min(Math.max(newBeatmapsets.graveyard.length, newBeatmapsets.pending.length, newBeatmapsets.ranked.length), 3)
            while (newBeatmapsets.ranked.length < max_length){
                newBeatmapsets.ranked.push(default_beatmapset)
            }
        }

        // Force re-render
        data = {
            ...data,
            beatmapsets: newBeatmapsets
        };
    }
</script>

{#if data.user}
    <div class="flex justify-between items-center">
        <!-- outline rounded-lg -->
        <div class="px-5 justify-between items-center w-5/16 outline rounded-lg max-h-135 overflow-y-auto no-scrollbar"> 
            <h1 class="text-xl font-bold p-5 text-center">Graved</h1>
            <div class="pb-5 space-y-2 flex flex-col">
                {#each data.beatmapsets.graveyard as bm}
                    <BeatmapCard beatmapset={bm}/>
                {/each}
            </div>
        </div>
        <div class="px-5 justify-between items-center w-5/16 outline rounded-lg max-h-135 overflow-y-auto no-scrollbar"> 
            <h1 class="text-xl font-bold p-5 text-center">Pending</h1>
            <div class="pb-5 space-y-2 flex flex-col">
                {#each data.beatmapsets.pending as bm}
                    <BeatmapCard beatmapset={bm} deleteBeatmapsetParent={deleteBeatmapsetParent}/>
                {/each}
            </div>
        </div>
        <div class="px-5 justify-between items-center w-5/16 outline rounded-lg max-h-135 overflow-y-auto no-scrollbar"> 
            <h1 class="text-xl font-bold p-5 text-center">Ranked</h1>
            <div class="pb-5 space-y-2 flex flex-col">
                {#each data.beatmapsets.ranked as bm}
                    <BeatmapCard beatmapset={bm} />
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