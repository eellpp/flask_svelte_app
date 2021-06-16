<script>
  import TravelCategory from "./TravelCategory.svelte";
  import Login from "./Login.svelte";
  import Signup from "./Signup.svelte";
  import { blurOnKey } from "./Utils";
  import Template from "../../Template.svelte";

  let isLoggedIn = false;
  let isSignup = false;
  let categories = {};
  let categoryName;

  function addCategory() {
    const is_duplicate = Object.values(categories).some(
      (cat) => cat.name === categoryName
    );
    if (!is_duplicate) {
      const id = Math.random().toString(36).substr(2, 8);
      categories[id] = { id, name: categoryName, items: {} };
    }
    console.log(categories);
    categoryName = "";
  }

  function deleteCategory(category){
    delete categories[category.id];
    categories = categories;
  }
  
  restore();
  $: if(categories) persist();

  function persist(){
    localStorage.setItem('TravelPacking',JSON.stringify(categories))
  }

  function restore(){
    const text = localStorage.getItem('TravelPacking')
    if(text && text != '{}' ){
      categories = JSON.parse(text)
    }
  }

</script>

<Template>
  <div class="buttons" slot="Login">
    {#if isLoggedIn}
    <a class="button is-light" on:click={() => isLoggedIn = false}> Log out </a>
    {:else}
    <a class="button is-primary" on:click={() => isSignup =true}>
      <strong>Sign up</strong>
    </a>
    <a class="button is-light" on:click={() => isSignup =false}> Log in </a>
    {/if}
  </div>

  <div slot="Body">
    {#if isLoggedIn}
      <div class="column is-one-third">
        <div class="field has-addons">
          <div class="control">
            <input
              class="input"
              type="text"
              placeholder="Eg: Documents,Bathroom,Medical etc"
              bind:value={categoryName} />
          </div>
          <div class="control">
            <a class="button is-info" on:click={addCategory}> AddCategory </a>
          </div>
        </div>
        {#each Object.values(categories) as category}
      <TravelCategory bind:category on:persist={persist}  on:delete={() => deleteCategory(category)}/>
        {/each}
      </div>
    {:else}
    {#if isSignup}
    <Signup on:signup={() => (isLoggedIn = true)} />
    {:else}
    <Login on:login={() => (isLoggedIn = true)} />
      {/if}
    {/if}
  </div>
</Template>
