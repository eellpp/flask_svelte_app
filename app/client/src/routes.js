
import {wrap} from 'svelte-spa-router/wrap';
import Home from './routes/Home.svelte';
import Dataset from './routes/Dataset.svelte';
import Lorem from './routes/Lorem.svelte';
import NotFound from './routes/NotFound.svelte';
import DATA from "./Data/data";
import FormTutorial from "./routes/tutorial/FormTutorial.svelte"

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
    '/dataset':  wrap({
        component: Dataset
    }),
    '/lorem/:repeat': Lorem,
    // The catch-all route must always be last
    '*': NotFound
};

