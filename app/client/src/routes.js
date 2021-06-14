
import {wrap} from 'svelte-spa-router/wrap';
import Home from './routes/Home.svelte';
import Dataset from './routes/Dataset.svelte';
import Lorem from './routes/Lorem.svelte';
import NotFound from './routes/NotFound.svelte';
import DATA from "./Data/data";
import FormTutorial from "./routes/tutorial/FormTutorial.svelte"
import DogBreed from "./routes/tutorial/DogBreed.svelte"
import Scratchpad from "./routes/tutorial/Scratchpad.svelte"
import TravelCheckList from "./routes/tutorial/travelapp/TravelCheckList.svelte"


export default {
    '/':  wrap({
        component: Home,
        // Static props
        props: {
            books: DATA.BOOKS,
            table:DATA.SARS_TABLE
        }
    }),
    '/tutorial/form':  wrap({
        component: FormTutorial
    }),
    '/tutorial/dogbreed':  wrap({
        component: DogBreed
    }),
    '/tutorial/travelchecklist':  wrap({
        component: TravelCheckList
    }),
    '/tutorial/scratchpad':  wrap({
        component: Scratchpad
    }),
    '/dataset':  wrap({
        component: Dataset
    }),
    '/lorem/:repeat': Lorem,
    // The catch-all route must always be last
    '*': NotFound
};

