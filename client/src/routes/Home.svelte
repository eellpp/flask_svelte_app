<script>
  export let books;
  let rand = -1;
  function getRand() {
    fetch("./rand")
      .then(d => d.text())
      .then(d => (rand = d));
  }
</script>

<div class="content">
<h1>Your number is {rand}!</h1>
<button on:click={getRand}>Get a random number generated from flask server</button>

{#each books as book}
<h3 class="title is-3">{book.NAME}</h3>
<ol type="1">
{#each book.SENTENCES as sentence}

<ul>{sentence}</ul>
{/each}
</ol>
{/each}
</div>