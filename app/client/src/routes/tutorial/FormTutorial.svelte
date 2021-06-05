<script>
    let greetings = [{country:"US",message:"Aloha"}, {country:"India",message:"Namaskaram"},{country:"Japan",message:"Konnichiva"}]
    let selected_country =  greetings[Math.floor(Math.random()*(3 - 1))].country
    let message_for_selected_country = (c) => greetings.filter((g)=> g.country === c)[0].message  
    $: message = message_for_selected_country(selected_country)
    $: greeting = ` ${message} ! welcome to svelte form tutorial </br> 
    - use bindings to update form values <br/>
    - form submit<br/>`
    
    function shuffle(){
        greeting = greeting.split(" ").sort(() => Math.random() - 0.5).join(" ")
    }
    
    function submitClicked(){
        console.log(`${selected_country} : ${message}`)
    
    }
    </script>
    
    <section class="hero is-info">
        <div class="hero-body">
            <p>{@html greeting?greeting:"this is some default text"}</p>
        </div>
    </section>
    
    <form class="box" on:submit|preventDefault>
        <div class="field">
            <label class="label">Name : selection changes the greeting message</label>
            <div class="control">
                <div class="select">
                    <select bind:value={selected_country}> 
                        {#each greetings as greeting}
                        <option>{greeting.country}</option>
                    {/each}
                    </select>
                </div>
            </div>
        </div>
        
        <div class="field is-grouped">
            <label class="label"></label>
            <div class="control">
                <button class="button is-link is-light" on:click={submitClicked}>Submit</button>
            </div>
        </div>
    </form>
    
    
    