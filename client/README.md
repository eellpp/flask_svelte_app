 Svelte is a compiler that converts your application into ideal JavaScript during build time as opposed to React, which uses a virtual DOM to interpret the application code during runtime.   
 
 React uses a concept known as Virtual DOM (VDOM), where a virtual representation of the UI is kept in memory and synced with the real DOM through a process called reconciliation. The reconciliation process will find the difference (diffing) between the Virtual DOM (An object in memory, where we push the latest updates to the UI) and the real DOM (DOM holding the previously rendered UI). Using specific heuristic algorithms, it decides how to update the UI. This process, for the most part, is fast, reliable, and immensely reactive.  
 
Svelte is purely a compiler, that converts your application into ideal JavaScript code when you build the application for production. Meaning it won’t inject any overhead code to run in the browser when your application is running to update the DOM.  

