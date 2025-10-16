<script lang="js">
    import BeatmapCard from '$lib/components/BeatmapCard.svelte'
    import cover from "../lib/assets/default_beatmap_cover.png"

    let { data, children } = $props();

    function deleteBeatmapsetParent(beatmapset_id, wip_status) {
        let newBeatmapsets = { ...data.beatmapsets };
        let default_beatmapset = {
            cover: cover,
        }

        if (wip_status == true){ // wip Array
            newBeatmapsets.wip = newBeatmapsets.wip.filter((beatmapset) => {
                beatmapset != null && beatmapset.beatmapset_id !== beatmapset_id
            });

            const max_length = Math.min(Math.max(newBeatmapsets.wip.length, newBeatmapsets.completed.length), 3)
            while (newBeatmapsets.wip.length < max_length){
                newBeatmapsets.wip.push(default_beatmapset)
            }
        } 
        else if (wip_status == false){ // completed Array
            newBeatmapsets.completed = newBeatmapsets.completed.filter((beatmapset) => {
                beatmapset != null && beatmapset.beatmapset_id !== beatmapset_id
            });

            const max_length = Math.min(Math.max(newBeatmapsets.wip.length, newBeatmapsets.completed.length), 3)
            while (newBeatmapsets.completed.length < max_length){
                newBeatmapsets.completed.push(default_beatmapset)
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
    <div class="flex justify-center items-center space-x-6">
        <!-- outline rounded-lg -->
        <div class="px-5 justify-between items-center w-full outline rounded-lg max-h-135 overflow-y-auto no-scrollbar"> 
            <h1 class="text-xl font-bold p-5 text-center">Work In Progress</h1>
            <div class="pb-5 gap-2 grid grid-cols-2">
                {#each data.beatmapsets.wip as bm}
                    <BeatmapCard beatmapset={bm}/>
                {/each}
            </div>
        </div>
        <div class="px-5 justify-between items-center w-full outline rounded-lg max-h-135 overflow-y-auto no-scrollbar"> 
            <h1 class="text-xl font-bold p-5 text-center">Completed</h1>
            <div class="pb-5 gap-2 grid grid-cols-2">
                {#each data.beatmapsets.completed as bm}
                    <BeatmapCard beatmapset={bm} deleteBeatmapsetParent={deleteBeatmapsetParent}/>
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