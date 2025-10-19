<script lang="js">
    import BeatmapCard from '$lib/components/BeatmapCard.svelte'
    import cover from "../lib/assets/default_beatmap_cover.png"
    import favicon from '$lib/assets/white.svg'
    import { invalidate, invalidateAll } from '$app/navigation';

    let { data, children } = $props();

    function deleteBeatmapsetParent(beatmapset_id, completed) {
        let newBeatmapsets = { ...data.beatmapsets };
        // let default_beatmapset = {
        //     cover: cover,
        // }

        if (completed == false){ // wip Array
            newBeatmapsets.wip = newBeatmapsets.wip.filter((beatmapset) => {
                return beatmapset != null && beatmapset != default_beatmapset && beatmapset.beatmapset_id !== beatmapset_id
            });

            while (newBeatmapsets.wip.length < 2 || (newBeatmapsets.wip.length % 2) == 1){
                newBeatmapsets.wip.push(null)
            }
        } 
        else if (completed == true){ // completed Array
            newBeatmapsets.completed = newBeatmapsets.completed.filter((beatmapset) => {
                beatmapset != null && beatmapset.beatmapset_id !== beatmapset_id
            });

            while (newBeatmapsets.completed.length < 2 || (newBeatmapsets.completed.length % 2) == 1){
                newBeatmapsets.completed.push(null)
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
    <div class="flex justify-center space-x-6">
        <!-- outline rounded-lg -->
        <div class="self-start px-5 justify-between items-center w-full outline rounded-lg max-h-135 overflow-y-auto no-scrollbar"> 
            <h1 class="text-xl font-bold p-5 text-center">Work In Progress</h1>
            <div class="pb-5 gap-3 grid grid-cols-2">
                {#each data.beatmapsets.wip as bm}
                    <BeatmapCard beatmapset={bm} completedParent={false} deleteBeatmapsetParent={deleteBeatmapsetParent} parentInvalidateAll={() => { invalidate('custom:page') }} />
                {/each}
            </div>
        </div>
        <div class="self-start px-5 justify-between items-center w-full outline rounded-lg max-h-135 overflow-y-auto no-scrollbar"> 
            <h1 class="text-xl font-bold p-5 text-center">Completed</h1>
            <div class="pb-5 gap-3 grid grid-cols-2">
                {#each data.beatmapsets.completed as bm}
                    <BeatmapCard beatmapset={bm} completedParent={true} deleteBeatmapsetParent={deleteBeatmapsetParent} parentInvalidateAll={() => { invalidate('custom:page') }} />
                {/each}
            </div>
        </div>
    </div>
{:else}
    <div class="flex flex-col items-center justify-center w-full">
        <img src={favicon} alt="edit" class="w-60 h-60 brightness-0 dark:invert" />
        <h1 class="text-2xl text-center font-bold">ogd - Trello for osu! GDs with In-Game Reminders</h1>
        <br>
        <p class="text-center">You are not logged in. Login with osu! to see more.</p>
        <p class="text-center">Usage information will be added here later!</p>
    </div>
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