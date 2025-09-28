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
            style="background-position: center; background-size: cover; background-image: url('{beatmap.cover}')"
            class="aspect-2/1 basis-1/4 outline rounded-lg py-2 px-4"    
        >
            <!-- <div class="info-overlay"> -->
                <h3 class="text-white">
                    {beatmap.title}
                </h3>
                <!-- <p class="">
                    mapped by {beatmap.creator}
                </p>
                <p class="">
                    {beatmap.difficulty}
                </p>
            </div> -->
        </div>
    </a>    
{:else}
<div
        style="background-position: center; background-size: cover; background-image: url('{beatmap.cover}')"
        class="aspect-2/1 basis-1/4 outline rounded-lg py-2 px-4"    
    >
        <!-- <div class="info-overlay"> -->
            <h3 class="text-white">
                {beatmap.title}
            </h3>
            <!-- <p class="">
                mapped by {beatmap.creator}
            </p>
            <p class="">
                {beatmap.difficulty}
            </p>
        </div> -->
    </div>
{/if}