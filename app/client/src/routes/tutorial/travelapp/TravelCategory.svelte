<script>
  import TravelItem from "./TravelItem.svelte";
  import { blurOnKey, getUID } from "./Utils";
  import {createEventDispatcher} from 'svelte';
  const dispatch = createEventDispatcher();
  export let category;
  let item_name;
  let is_packed = false;
  $: items = category.items;

  function addItem() {
    const is_duplicate = Object.values(category.items).some(
      (item) => item.name.toLowerCase() === item_name.toLowerCase()
    );
    if (!is_duplicate) {
      const item = { id: getUID(), name: item_name, is_packed: is_packed };

      const index = item.id;
      category.items[index] = item;
      category = category;
    }
    console.log(category);
    item_name = "";
    dispatch('persist')
  }
  function deleteCategory(){
    console.log("Deleting category " + category.name)
  }

  function deleteItem(item){
    delete category.items[item.id];
    category = category;
    dispatch('persist')
  }
</script>

<div class="box has-background-primary">
  <div class="level">
    <div class="level-item level-left">
      <h4 class="title is-4">{category.name}</h4>
    </div>
    <span
      class="icon is-small is-right"
      on:click={dispatch('delete',category)}
      style="pointer-events: all;cursor: pointer;">
      <i class="fas fa-trash-alt" />
    </span>
  </div>
  <div class="field">
    <div class="control">
      <input class="input" type="text" bind:value={item_name} />
    </div>
    <div class="control">
      <label class="radio">
        <input
          type="radio"
          name="packed"
          on:select={() => (is_packed = true)} />
        Packed
      </label>
      <label class="radio">
        <input
          type="radio"
          name="packed"
          on:select={() => (is_packed = false)}
          checked />
        NotPacked
      </label>
    </div>
    <div class="control is-grouped ">
      <a class="button is-info" on:click={addItem}> AddItem </a>
    </div>
  </div>
  {#each Object.values(items) as item}
    <TravelItem bind:item on:delete={() => deleteItem(item)}/>
  {/each}
</div>
