<script>
  import {onMount} from 'svelte';
  export let table = {COLUMN_NAMES: ["id",["..."]],ROWS:[{"id":"loading","...":"..." }] };
  //export let table;

  var promiseofjsondata = fetch("./records")
      .then(d => d.json())
      .then(data => {return data} );


  function setspinner(){
    var rbutton = document.getElementById('refreshicon');
    rbutton.classList.add('fa-spinner');
    rbutton.classList.add('fa-spin');
  }

  function resetspinner(){
    var rbutton = document.getElementById('refreshicon');
    rbutton.classList.remove('fa-spin');
    rbutton.classList.remove('fa-spinner');
    rbutton.classList.add('fa-sync-alt');
  }

  async function refresh(){
    setspinner()
    let res = await fetch('./records')
    table = await res.json();
    resetspinner()

  }


  onMount(async() => {table = await promiseofjsondata });

</script>

<section class="section" id="table">
<h1 class="title">Dataset Table</h1>
<a on:click={refresh} class="button is-small">
    <span class="icon">
        <i id="refreshicon" class="fas fa-sync-alt"></i>
    </span>
</a>
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

  <tbody>
    </tbody>
</table>

</section>