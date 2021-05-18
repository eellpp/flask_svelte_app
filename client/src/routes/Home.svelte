<script>
  export let books;
  let rand = -1;
  function getRand() {
    fetch("./rand")
      .then(d => d.text())
      .then(d => (rand = d));
  }
</script>

<section class="section">
<h1>Your number is {rand}!</h1>
<button on:click={getRand}>Get a random number generated from flask server</button>
</section>

<section class="section">
<div class="content">



    {#each books as book}
        <h3 class="title is-3">{book.NAME}</h3>
        <div class="field is-grouped">
            <div class="control">
                <input class="input" type="text" placeholder="Words to search">
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