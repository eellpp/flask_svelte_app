<script>
	import Router from 'svelte-spa-router';
	import routes from './routes';
</script>



<nav class="navbar" role="navigation" aria-label="main navigation">
  <div class="navbar-brand">
    <a class="navbar-item" href="https://bulma.io">
      <img src="https://bulma.io/images/bulma-logo.png" width="112" height="28">
    </a>

    <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </a>
  </div>

  <div id="navbarBasicExample" class="navbar-menu">
    <div class="navbar-start">
      <a class="navbar-item" href="/">
        Home
      </a>
      <a class="navbar-item" href="#/dataset">
        Dataset
      </a>
      <a class="navbar-item" href="#/lorem/2">
        Lorem
      </a>
      <div class="navbar-item has-dropdown is-hoverable">
        <a class="navbar-link">
          Tutorials
        </a>
        <div class="navbar-dropdown">
          <a class="navbar-item" href="#/tutorial/form">
            Form
          </a>
          <a class="navbar-item" href="#/tutorial/dogbreed">
            DogBreed
          </a>
          <a class="navbar-item" href="#/tutorial/travelchecklist">
            TravelChecklistApp
          </a>
          <a class="navbar-item" href="#/tutorial/scratchpad">
            Scratchpad
          </a>
        </div>
      </div>
    </div>

    <div class="navbar-end">
      <div class="navbar-item">
        <div class="buttons">
          <a class="button is-primary">
            <strong>Sign up</strong>
          </a>
          <a class="button is-light">
            Log in
          </a>
        </div>
      </div>
    </div>
  </div>
</nav>

<main>
	<Router {routes}/>
</main>