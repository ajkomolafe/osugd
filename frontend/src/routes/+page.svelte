<script lang="js">
    let { data, children } = $props();
</script>

{#if data.user}
    <div class="flex justify-between items-center">
        <div class="px-5 justify-between items-center"> <!-- outline rounded-lg -->
            <p>Graved</p>
            <div class="outline rounded-lg min-w-100 min-h-40">
                
            </div>
        </div>
        <div class="px-5">
            Pending
            <div class="outline rounded-lg min-w-20">
                
            </div>
        </div>
        <div class="px-5">
            Ranked
            <div class="outline rounded-lg min-w-20">
                
            </div>
        </div>
    </div>
{:else}
    <p>You are not logged in. Please log in to see more.</p>
{/if}
