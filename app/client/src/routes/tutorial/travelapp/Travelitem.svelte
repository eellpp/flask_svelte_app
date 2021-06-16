<script>
    import { blurOnKey } from "./Utils";
    import {createEventDispatcher} from 'svelte';
    let yes = false;
    const dispatch = createEventDispatcher();
    export let item;
    let editing = false;
    // item has name,category,ispacked fields
</script>

<div class="control">
    <label class="checkbox">
        
        <input type="checkbox" bind:checked={yes}/>

        {#if editing === false}
            {#if yes}
            <span
                class="span"
                on:click={() => (editing = true)} style="text-decoration: line-through">{item.name}</span>
            {:else}
            <span
                class="span"
                on:click={() => (editing = true)}>{item.name}</span>
            {/if}
        {:else}
            <input
                class="input"
                on:blur={() => (editing = false)}
                on:keypress={blurOnKey}
                bind:value={item.name} />
        {/if}
    </label>
    <span
        class="icon is-small is-right"
        on:click={() => dispatch('delete')}
        style="pointer-events: all;cursor: pointer;">
        <i class="fas fa-trash-alt" />
    </span>
</div>
