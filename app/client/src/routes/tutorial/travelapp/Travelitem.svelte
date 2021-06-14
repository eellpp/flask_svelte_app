<script>
import {blurOnKey} from "./Utils"

export let item;
let editing=false;
// item has name,category,ispacked fields

</script>

<div class="control">
    <label class="checkbox">
        <input type="checkbox">
        
    {#if editing === false}
    <span class="span" on:click={() => editing = true} >{item.name}</span>
    {:else}
    <input class="input" on:blur={() => editing = false} on:keypress={blurOnKey} bind:value={item.name}/>
    {/if}
</label>
</div>