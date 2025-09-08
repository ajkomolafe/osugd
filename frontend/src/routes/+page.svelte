<script lang="js">
  import { Button } from "$lib/components/ui/button/index.js";
  import { page } from '$app/state'

  const client_id = import.meta.env.VITE_CLIENT_ID

  if (page.url.searchParams.get('code') != null) {
    //set cookie, move this to +page.server.js load
  }
</script>
 
<Button href="https://osu.ppy.sh/oauth/authorize?client_id={client_id}&response_type=code&scope=public+identify">Login With osu!</Button>