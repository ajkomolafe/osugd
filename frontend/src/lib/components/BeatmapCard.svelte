<script lang="js">
    // /**
    //  * @typedef {Object} Beatmap
    //  * @property {string} title
    //  * @property {string} creator
    //  * @property {string} background_url
    //  * @property {number} beatmapset_id
    //  */

    // /** @type {Beatmap} */
    let { beatmap } = $props();

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

<a href={`/beatmapsets/${beatmap.beatmapset_id}`} class="card" style="background-image: url('{beatmap.background_url}')">
    <div class="info-overlay">
        <h3 class="title">{beatmap.title}</h3>
        <p class="creator">mapped by {beatmap.creator}</p>
        <p class="difficulty">[{beatmap.version}]</p>
    </div>
</a>