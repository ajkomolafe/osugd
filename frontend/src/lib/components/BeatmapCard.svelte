<script lang="js">
    import cover from "../assets/default_beatmap_cover.png"
    // /**
    //  * @typedef {Object} Beatmap
    //  * @property {string} title
    //  * @property {string} creator
    //  * @property {string} background_url
    //  * @property {number} beatmapset_id
    //  */

    // /** @type {Beatmap} */
    let { beatmap } = $props();

    const defaults = {
        cover: cover,
    }

    beatmap = { ...defaults, ...beatmap };

    // id
    // ogd_user_id
    // difficulty
    // artist
    // artist_unicode
    // cover
    // source
    // status
    // title
    // title_unicode
    // creator_id
    // creator_username
</script>

<!-- <a class="" style="background-image: url('{beatmap.background_url}')"> -->
{#if beatmap.id != null}
    <a href={"https://osu.ppy.sh/s/" + beatmap.id}>
        <div
            style="background-position: center; background-size: cover; background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('{beatmap.cover}')"
            class="aspect-2/1 outline rounded-lg px-4 flex flex-col justify-center"    
        >
            <h3 class="text-white font-bold text-xl/5">
                {beatmap.title}
            </h3>
            <p class="text-white text-sm">
                by {beatmap.artist}
            </p>
            <p class="text-gray-300 text-xs font-bold italic">
                {beatmap.source}
            </p>
            <br/>
            <p class="text-white text-sm">
                hosted by {beatmap.creator_username}
            </p>
        </div>
    </a>    
{:else}
    <div
        style="background-position: center; background-size: cover; background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('{beatmap.cover}')"
        class="aspect-2/1 outline rounded-lg py-2 px-4 flex flex-col justify-center"    
    >
        <p class="text-white text-sm text-center">
            Add more beatmaps!
        </p>
        <!-- <p class="text-gray-300 text-xs font-bold italic">
            {beatmap.source}
        </p>
        <br/>
        <p class="text-white text-sm">
            hosted by {beatmap.creator_username}
        </p> -->
    </div>
{/if}