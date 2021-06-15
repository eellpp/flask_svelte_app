<script>
    import { blurOnKey } from "./Utils";
    let yes = false;

    export let item;
    let editing = false;
    // item has name,category,ispacked fields

    function deleteItem() {
        console.log("Deleting the item " + item.name);
    }
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
        on:click={deleteItem}
        style="pointer-events: all;cursor: pointer;">
        <i class="fas fa-trash-alt" />
    </span>
</div>
