<script>
    let greetings = [
        { country: "US", message: "Aloha" },
        { country: "India", message: "Namaskaram" },
        { country: "Japan", message: "Konnichiva" },
    ];
    let selected_country =
        greetings[Math.floor(Math.random() * (3 - 1))].country;
    let message_for_selected_country = (c) =>
        greetings.filter((g) => g.country === c)[0].message;
    $: message = message_for_selected_country(selected_country);
    $: greeting = ` ${message} ! welcome to svelte form tutorial `;
    let form_input;
    let notes = `- if submit button has on:click method, then forms on:submit will not be called </br> 
    - use bindings to update form values <br/>
    - form submit<br/>
    - editable text`;
    function shuffle() {
        greeting = greeting
            .split(" ")
            .sort(() => Math.random() - 0.5)
            .join(" ");
    }

    function submitClicked() {
        console.log(`${selected_country} : ${message}`);
    }

    //######################################
    // Editing Demo
    let editing = false;
    let category = { name: "category 1" };
    function blurOnKey(event) {
        const { code } = event;
        if (code === "Enter" || code == "Escape" || code === "Tab") {
            event.target.blur();
        }
    }
    //######################################
</script>

<section class="hero is-success is-small">
    <div class="hero-body">
        <p>
            {@html notes}
        </p>
    </div>
</section>

<section class="hero is-info is-small">
    <div class="hero-body">
        <p>
            {@html greeting ? greeting : 'this is some default text'}
        </p>
    </div>
</section>

<div class="columns">
    <div class="column is-one-third">
        <form class="box" on:submit|preventDefault>
            <div class="field">
                <label class="label">Name : selection changes the greeting
                    message</label>
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
            <div class="field">
                <label class="label">Adding input enables submit</label>
                <div class="control">
                        <input class="input" bind:value={form_input}>
                </div>
            </div>

            <div class="field is-grouped">
                <label class="label" />
                <div class="control">
                    <button
                        disabled={!form_input}
                        class="button is-success"
                        on:click={submitClicked}>Submit</button>
                </div>
            </div>
        </form>
    </div>
</div>

<div class="columns">
    <div class="column is-one-third">
        <section class="section">
            <label class="label">Editable Text</label>
            <h3>
                {#if editing}
                    <input
                        class="input"
                        bind:value={category.name}
                        on:blur={() => (editing = false)}
                        on:keypress={blurOnKey} />
                {:else}
                    <span
                        class="span"
                        on:click={() => (editing = true)}>{category.name}</span>
                {/if}
            </h3>
        </section>
    </div>
</div>
