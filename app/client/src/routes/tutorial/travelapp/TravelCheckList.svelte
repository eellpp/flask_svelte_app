<script>
    import TravelCategory from "./TravelCategory.svelte";
    import { blurOnKey } from "./Utils";

    let categories = {};
    let categoryName;

    function addCategory() {
        const is_duplicate =  Object.values(categories).some((cat) => cat.name === categoryName);
        if (!is_duplicate) {
            const id = Math.random().toString(36).substr(2,8)
            categories[id] = {id,name: categoryName, items: [] }
        }
        console.log(categories);
        categoryName = ""
    }
</script>

<div class="column is-one-third">
    <div class="field has-addons">
        <div class="control">
          <input class="input" type="text" placeholder="Eg: Documents,Bathroom,Medical etc" bind:value={categoryName}>
        </div>
        <div class="control">
          <a class="button is-info" on:click={addCategory}>
            AddCategory
          </a>
        </div>
      </div>
    {#each Object.values(categories) as category}
       <TravelCategory bind:category={category} />
    {/each}
</div>

