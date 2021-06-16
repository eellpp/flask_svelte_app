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
            TravelChecklistApp
        </a>
        <a class="navbar-item" href="#/dataset">
          Dataset
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
            <slot name="Login"/>
          <!-- <div class="buttons">
            <a class="button is-primary" href="#/tutorial/travelchecklist">
              <strong>Sign up</strong>
            </a>
            <a class="button is-light">
              Log in
            </a>
          </div> -->
        </div>
      </div>
    </div>
  </nav>
  
  <slot name = "Body">
    <section class="hero is-info">
        <div class="hero-body">
          <p class="title">
            Info hero
          </p>
          <p class="subtitle">
            Info subtitle
          </p>
        </div>
      </section>
  </slot>
  <slot name = "Footer">
    <footer class="footer">
        <div class="content has-text-centered">
          <p>
            <strong>Bulma</strong> by <a href="https://jgthms.com">Jeremy Thomas</a>. The source code is licensed
            <a href="http://opensource.org/licenses/mit-license.php">MIT</a>. The website content
            is licensed <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY NC SA 4.0</a>.
          </p>
        </div>
      </footer>
  </slot>