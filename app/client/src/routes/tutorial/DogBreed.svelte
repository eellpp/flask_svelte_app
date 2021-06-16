<script>
    import Template from "./../Template.svelte";
    import {onMount} from 'svelte'

    // get the list of breeds
    // https://dog.ceo/api/breeds/image/random/3
    // https://dog.ceo/api/breeds/list/all
    // url: by breed: https://dog.ceo/api/breed/hound/images
    // by subbreed: https://dog.ceo/api/breed/hound/afghan/images
    // dropdown, autocomplete to select a breed
    // view photos of the breed. Paginated in media box format

    let dog_breeds = [];
    let selected_dog;
    let dog_images = [];
    async function get_dog_api(url){ 
        const res = await fetch(url);
        if(!res.ok || res.status === 404) return [];
        const res_json = await res.json();
        return res_json.message;
    }
    
    async function get_dog_images(selected_dog){ 
        console.log(`selected dog is ${selected_dog}`)
        let [breed,sub_breed] = selected_dog.split('-')
        const url = sub_breed ? `https://dog.ceo/api/breed/${breed}/${sub_breed}/images`:`https://dog.ceo/api/breed/${breed}/images`;
        const images = await get_dog_api(url)
        dog_images = images.length > 0 ? images.splice(0,5):[];
        console.log(`dog_images : ${dog_images}`)
    }

    onMount(async() => {
        const url = "https://dog.ceo/api/breeds/list/all"
        dog_breeds = await get_dog_api(url);
    });

    $: dog_images = selected_dog?get_dog_images(selected_dog):[];

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
    <div class="column is-one-third">
        <div class="field">
            <label class="label">Dog Breed</label>
            <div class="control">
                <div class="select"> 
                    <select  bind:value={selected_dog}> 
                        {#each Object.entries(dog_breeds) as  [breed,sub_breed]}
                            {#each sub_breed as sb}
                                <option>{breed + '-' + sb}</option>
                            {:else}
                            <option>{breed}</option>
                            {/each}
                            
                        {/each}
                    </select>
                  </div>
            </div>
        </div>
    </div>

    {#await dog_images}
    <div>Waiting for dogs images to load ...</div>
    {:then dog_image_urls}
    {#each dog_image_urls as dog_image}
        <div class="column is-half">
            <article class="media">
                <figure class="media-left">
                    <p class="image is-128x128">
                        <img
                            src={dog_image? dog_image: "https://bulma.io/images/placeholders/128x128.png"} />
                    </p>
                </figure>
                <div class="media-content">
                    <div class="content">
                        <p>
                            <strong>John Smith</strong>
                            <small>@johnsmith</small>
                            <small>31m</small>
                            <br />
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Proin ornare magna eros, eu pellentesque
                            tortor vestibulum ut. Maecenas non massa sem. Etiam
                            finibus odio quis feugiat facilisis.
                        </p>
                    </div>
                    <nav class="level is-mobile">
                        <div class="level-left">
                            <a class="level-item">
                                <span class="icon is-small"><i
                                        class="fas fa-reply" /></span>
                            </a>
                            <a class="level-item">
                                <span class="icon is-small"><i
                                        class="fas fa-retweet" /></span>
                            </a>
                            <a class="level-item">
                                <span class="icon is-small"><i
                                        class="fas fa-heart" /></span>
                            </a>
                        </div>
                    </nav>
                </div>
            </article>
        </div>
    {/each}
    {:catch error}
        <div>Error: error in getting dog images</div>
    {/await}
        
</section>
</div>
</Template>