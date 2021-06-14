<script>
    let editing = false;
    let category = { name: "category 1" };
    function blurOnKey(event) {
        const { code } = event;
        if (code === "Enter" || code == "Escape" || code === "Tab") {
            event.target.blur();
        }
    }
</script>

<section class="section">
    <label class="label">Editable Text</label>
    <h3>
        {#if editing}
            <input class="input"
                bind:value={category.name}
                on:blur={() => (editing = false)}
                on:keypress={blurOnKey} />
        {:else}
            <span class="span" on:click={() => (editing = true)}>{category.name}</span>
        {/if}
    </h3>
</section>
