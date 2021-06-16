<script>
  import Template from "./Template.svelte";
  export let books;
  export let table;

  let rand = -1;
  function getRand() {
    fetch("./rand")
      .then((d) => d.text())
      .then((d) => (rand = d));
  }

  function getrecords() {
    fetch("./records")
      .then((d) => d.json())
      .then((d) => (table = d));
  }
</script>

<Template>
  <div class="buttons" slot="Login">
    <a class="button is-primary" href="">
      <strong>Sign up</strong>
    </a>
    <a class="button is-light"> Log in </a>
  </div>

  <div slot="Body">
    <section class="section">
      <h1>Your number is {rand}!</h1>
      <button on:click={getRand}>Get a random number generated from flask server</button>
      <button on:click={getrecords}>Get Records from backend server</button>
    </section>

    <section class="section">
      <div class="content">
        <table class="table">
          <thead>
            <tr>
              {#each table.COLUMN_NAMES as name}
                <th>{name}</th>
              {/each}
            </tr>
          </thead>

          <tbody>
            {#each table.ROWS as row}
              <tr>
                {#each table.COLUMN_NAMES as name}
                  <td>{row[name]}</td>
                {/each}
              </tr>
            {/each}
          </tbody>
          <tbody />
        </table>

        {#each books as book}
          <h3 class="title is-3">{book.NAME}</h3>
          <div class="field is-grouped">
            <div class="control">
              <input class="input" type="text" placeholder="Words to search" />
            </div>
            <div class="control">
              <button class="button is-link">Search</button>
            </div>
          </div>
          <ol type="1">
            {#each book.SENTENCES as sentence}
              <ul>{sentence}</ul>
            {/each}
          </ol>
        {/each}
      </div>
    </section>
  </div>
</Template>
