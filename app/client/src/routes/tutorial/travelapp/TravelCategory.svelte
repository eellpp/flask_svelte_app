<script>
    import TravelItem from "./TravelItem.svelte";
    import { blurOnKey,getUID } from "./Utils";
    export let category;
    let item_name;
    let is_packed = false;
    $: items = category.items

    function addItem(){
        const is_duplicate =  category.items.some((item) => item.name.toLowerCase() === item_name.toLowerCase());
        if (!is_duplicate) {
            const item = {id:getUID(),name:item_name, is_packed:is_packed}
            
            const index = category.items.length
            category.items[index] = item
            category = category
        }
        console.log(category)
        item_name = ""
    }

</script>

<div class="box has-background-primary">
<h4 class="title is-4">{category.name}</h4>
<div class="field">
    <div class="control">
      <input class="input" type="text" bind:value={item_name}>
    </div>
    <div class="control">
        <label class="radio">
          <input type="radio" name="packed" on:select={() => is_packed = true} />
          Packed
        </label>
        <label class="radio">
          <input type="radio" name="packed" on:select={() => is_packed = false} checked>
          NotPacked
        </label>
      </div>
    <div class="control is-grouped ">
      <a class="button is-info" on:click={addItem}>
        AddItem
      </a>
    </div>
  </div>
{#each items as item}
    <TravelItem bind:item={item} />
{/each}
</div>

