<script>
    import {createEventDispatcher} from 'svelte';
  const dispatch = createEventDispatcher();
  export let user = {email:"",password:""}; 

const login = () => dispatch("login");
const signup = () => dispatch("signup");
</script>

<section class="hero is-primary is-fullheight">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-5-tablet is-4-desktop is-3-widescreen">
            <form action="" class="box">
              <div class="field">
                <label for="" class="label">Email</label>
                <div class="control has-icons-left">
                  <input type="email" placeholder="e.g. bobsmith@gmail.com" class="input" required bind:value={user.email}>
                  <span class="icon is-small is-left">
                    <i class="fa fa-envelope"></i>
                  </span>
                </div>
              </div>
              <div class="field">
                <label for="" class="label">Password</label>
                <div class="control has-icons-left">
                  <input type="password" placeholder="*******" class="input" required bind:value={user.password}>
                  <span class="icon is-small is-left">
                    <i class="fa fa-lock"></i>
                  </span>
                </div>
              </div>
              <div class="field">
                <label for="" class="checkbox">
                  <input type="checkbox">
                 Remember me
                </label>
              </div>
              <div class="field">
                <button class="button is-success" on:click={login}>
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>