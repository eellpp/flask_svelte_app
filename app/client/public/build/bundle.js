
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$1(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function regexparam (str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.38.2 */

    const { Error: Error_1, Object: Object_1$2, console: console_1$5 } = globals;

    // (209:0) {:else}
    function create_else_block$4(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(209:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (202:0) {#if componentParams}
    function create_if_block$3(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(202:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn("Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading");

    	return wrap$1({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == "#" ? "" : "#") + location;

    	try {
    		window.history.replaceState(undefined, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn("Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment.");
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event("hashchange"));
    }

    function link(node, hrefVar) {
    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	updateLink(node, hrefVar || node.getAttribute("href"));

    	return {
    		update(updated) {
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, href) {
    	// Destination must start with '/'
    	if (!href || href.length < 1 || href.charAt(0) != "/") {
    		throw Error("Invalid value for \"href\" attribute: " + href);
    	}

    	// Add # to the href attribute
    	node.setAttribute("href", "#" + href);

    	node.addEventListener("click", scrollstateHistoryHandler);
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {HTMLElementEventMap} event - an onclick event attached to an anchor tag
     */
    function scrollstateHistoryHandler(event) {
    	// Prevent default anchor onclick behaviour
    	event.preventDefault();

    	const href = event.currentTarget.getAttribute("href");

    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument - strings must start with / or *");
    			}

    			const { pattern, keys } = regexparam(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == "string") {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || "/";
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || "/";
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || "") || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {bool} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	if (restoreScrollState) {
    		window.addEventListener("popstate", event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		});

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.scrollX, previousScrollState.scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick("conditionsFailed", detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoading", Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == "object" && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    	});

    	const writable_props = ["routes", "prefix", "restoreScrollState"];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$5.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		derived,
    		tick,
    		_wrap: wrap$1,
    		wrap,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		scrollstateHistoryHandler,
    		createEventDispatcher,
    		afterUpdate,
    		regexparam,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		lastLoc,
    		componentObj
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ("component" in $$props) $$invalidate(0, component = $$props.component);
    		if ("componentParams" in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ("props" in $$props) $$invalidate(2, props = $$props.props);
    		if ("previousScrollState" in $$props) previousScrollState = $$props.previousScrollState;
    		if ("lastLoc" in $$props) lastLoc = $$props.lastLoc;
    		if ("componentObj" in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? "manual" : "auto";
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/Home.svelte generated by Svelte v3.38.2 */

    const file$a = "src/routes/Home.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (33:4) {#each table.COLUMN_NAMES as name}
    function create_each_block_4(ctx) {
    	let th;
    	let t_value = /*name*/ ctx[14] + "";
    	let t;

    	const block = {
    		c: function create() {
    			th = element("th");
    			t = text(t_value);
    			add_location(th, file$a, 33, 8, 658);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*table*/ 1 && t_value !== (t_value = /*name*/ ctx[14] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(33:4) {#each table.COLUMN_NAMES as name}",
    		ctx
    	});

    	return block;
    }

    // (42:8) {#each table.COLUMN_NAMES as name}
    function create_each_block_3(ctx) {
    	let td;
    	let t_value = /*row*/ ctx[11][/*name*/ ctx[14]] + "";
    	let t;

    	const block = {
    		c: function create() {
    			td = element("td");
    			t = text(t_value);
    			add_location(td, file$a, 42, 9, 809);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*table*/ 1 && t_value !== (t_value = /*row*/ ctx[11][/*name*/ ctx[14]] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(42:8) {#each table.COLUMN_NAMES as name}",
    		ctx
    	});

    	return block;
    }

    // (40:0) {#each table.ROWS as row}
    function create_each_block_2$2(ctx) {
    	let tr;
    	let each_value_3 = /*table*/ ctx[0].COLUMN_NAMES;
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(tr, file$a, 40, 8, 752);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*table*/ 1) {
    				each_value_3 = /*table*/ ctx[0].COLUMN_NAMES;
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$2.name,
    		type: "each",
    		source: "(40:0) {#each table.ROWS as row}",
    		ctx
    	});

    	return block;
    }

    // (64:8) {#each book.SENTENCES as sentence}
    function create_each_block_1$2(ctx) {
    	let ul;
    	let t_value = /*sentence*/ ctx[8] + "";
    	let t;

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			t = text(t_value);
    			add_location(ul, file$a, 64, 12, 1350);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*books*/ 2 && t_value !== (t_value = /*sentence*/ ctx[8] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(64:8) {#each book.SENTENCES as sentence}",
    		ctx
    	});

    	return block;
    }

    // (53:4) {#each books as book}
    function create_each_block$6(ctx) {
    	let h3;
    	let t0_value = /*book*/ ctx[5].NAME + "";
    	let t0;
    	let t1;
    	let div2;
    	let div0;
    	let input;
    	let t2;
    	let div1;
    	let button;
    	let t4;
    	let ol;
    	let t5;
    	let each_value_1 = /*book*/ ctx[5].SENTENCES;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			input = element("input");
    			t2 = space();
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "Search";
    			t4 = space();
    			ol = element("ol");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			attr_dev(h3, "class", "title is-3");
    			add_location(h3, file$a, 53, 8, 930);
    			attr_dev(input, "class", "input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Words to search");
    			add_location(input, file$a, 56, 16, 1059);
    			attr_dev(div0, "class", "control");
    			add_location(div0, file$a, 55, 12, 1021);
    			attr_dev(button, "class", "button is-link");
    			add_location(button, file$a, 59, 16, 1192);
    			attr_dev(div1, "class", "control");
    			add_location(div1, file$a, 58, 12, 1154);
    			attr_dev(div2, "class", "field is-grouped");
    			add_location(div2, file$a, 54, 8, 978);
    			attr_dev(ol, "type", "1");
    			add_location(ol, file$a, 62, 8, 1281);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, input);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, button);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, ol, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ol, null);
    			}

    			append_dev(ol, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*books*/ 2 && t0_value !== (t0_value = /*book*/ ctx[5].NAME + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*books*/ 2) {
    				each_value_1 = /*book*/ ctx[5].SENTENCES;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ol, t5);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(ol);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(53:4) {#each books as book}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let section0;
    	let h1;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let button0;
    	let t5;
    	let button1;
    	let t7;
    	let section1;
    	let div;
    	let table_1;
    	let thead;
    	let tr;
    	let t8;
    	let tbody0;
    	let t9;
    	let tbody1;
    	let t10;
    	let mounted;
    	let dispose;
    	let each_value_4 = /*table*/ ctx[0].COLUMN_NAMES;
    	validate_each_argument(each_value_4);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks_2[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	let each_value_2 = /*table*/ ctx[0].ROWS;
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2$2(get_each_context_2$2(ctx, each_value_2, i));
    	}

    	let each_value = /*books*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section0 = element("section");
    			h1 = element("h1");
    			t0 = text("Your number is ");
    			t1 = text(/*rand*/ ctx[2]);
    			t2 = text("!");
    			t3 = space();
    			button0 = element("button");
    			button0.textContent = "Get a random number generated from flask server";
    			t5 = space();
    			button1 = element("button");
    			button1.textContent = "Get Records from backend server";
    			t7 = space();
    			section1 = element("section");
    			div = element("div");
    			table_1 = element("table");
    			thead = element("thead");
    			tr = element("tr");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t8 = space();
    			tbody0 = element("tbody");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t9 = space();
    			tbody1 = element("tbody");
    			t10 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$a, 20, 0, 321);
    			add_location(button0, file$a, 21, 0, 353);
    			add_location(button1, file$a, 22, 0, 437);
    			attr_dev(section0, "class", "section");
    			add_location(section0, file$a, 19, 0, 295);
    			add_location(tr, file$a, 31, 4, 606);
    			add_location(thead, file$a, 30, 2, 594);
    			add_location(tbody0, file$a, 38, 2, 710);
    			add_location(tbody1, file$a, 48, 2, 865);
    			attr_dev(table_1, "class", "table");
    			add_location(table_1, file$a, 29, 0, 570);
    			attr_dev(div, "class", "content");
    			add_location(div, file$a, 26, 0, 546);
    			attr_dev(section1, "class", "section");
    			add_location(section1, file$a, 25, 0, 520);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section0, anchor);
    			append_dev(section0, h1);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			append_dev(h1, t2);
    			append_dev(section0, t3);
    			append_dev(section0, button0);
    			append_dev(section0, t5);
    			append_dev(section0, button1);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, div);
    			append_dev(div, table_1);
    			append_dev(table_1, thead);
    			append_dev(thead, tr);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(tr, null);
    			}

    			append_dev(table_1, t8);
    			append_dev(table_1, tbody0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tbody0, null);
    			}

    			append_dev(tbody0, t9);
    			append_dev(table_1, tbody1);
    			append_dev(div, t10);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*getRand*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*getrecords*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*rand*/ 4) set_data_dev(t1, /*rand*/ ctx[2]);

    			if (dirty & /*table*/ 1) {
    				each_value_4 = /*table*/ ctx[0].COLUMN_NAMES;
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_4(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_4.length;
    			}

    			if (dirty & /*table*/ 1) {
    				each_value_2 = /*table*/ ctx[0].ROWS;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2$2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tbody0, t9);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty & /*books*/ 2) {
    				each_value = /*books*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section0);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(section1);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);
    	let { books } = $$props;
    	let { table } = $$props;
    	let rand = -1;

    	function getRand() {
    		fetch("./rand").then(d => d.text()).then(d => $$invalidate(2, rand = d));
    	}

    	function getrecords() {
    		fetch("./records").then(d => d.json()).then(d => $$invalidate(0, table = d));
    	}

    	const writable_props = ["books", "table"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("books" in $$props) $$invalidate(1, books = $$props.books);
    		if ("table" in $$props) $$invalidate(0, table = $$props.table);
    	};

    	$$self.$capture_state = () => ({ books, table, rand, getRand, getrecords });

    	$$self.$inject_state = $$props => {
    		if ("books" in $$props) $$invalidate(1, books = $$props.books);
    		if ("table" in $$props) $$invalidate(0, table = $$props.table);
    		if ("rand" in $$props) $$invalidate(2, rand = $$props.rand);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [table, books, rand, getRand, getrecords];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { books: 1, table: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*books*/ ctx[1] === undefined && !("books" in props)) {
    			console.warn("<Home> was created without expected prop 'books'");
    		}

    		if (/*table*/ ctx[0] === undefined && !("table" in props)) {
    			console.warn("<Home> was created without expected prop 'table'");
    		}
    	}

    	get books() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set books(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get table() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set table(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/Dataset.svelte generated by Svelte v3.38.2 */
    const file$9 = "src/routes/Dataset.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (48:4) {#each table.COLUMN_NAMES as name}
    function create_each_block_2$1(ctx) {
    	let th;
    	let t_value = /*name*/ ctx[6] + "";
    	let t;

    	const block = {
    		c: function create() {
    			th = element("th");
    			t = text(t_value);
    			add_location(th, file$9, 48, 8, 1170);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*table*/ 1 && t_value !== (t_value = /*name*/ ctx[6] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(48:4) {#each table.COLUMN_NAMES as name}",
    		ctx
    	});

    	return block;
    }

    // (57:8) {#each table.COLUMN_NAMES as name}
    function create_each_block_1$1(ctx) {
    	let td;
    	let t_value = /*row*/ ctx[3][/*name*/ ctx[6]] + "";
    	let t;

    	const block = {
    		c: function create() {
    			td = element("td");
    			t = text(t_value);
    			add_location(td, file$9, 57, 9, 1321);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*table*/ 1 && t_value !== (t_value = /*row*/ ctx[3][/*name*/ ctx[6]] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(57:8) {#each table.COLUMN_NAMES as name}",
    		ctx
    	});

    	return block;
    }

    // (55:0) {#each table.ROWS as row}
    function create_each_block$5(ctx) {
    	let tr;
    	let each_value_1 = /*table*/ ctx[0].COLUMN_NAMES;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(tr, file$9, 55, 8, 1264);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*table*/ 1) {
    				each_value_1 = /*table*/ ctx[0].COLUMN_NAMES;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(55:0) {#each table.ROWS as row}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let section;
    	let h1;
    	let t1;
    	let a;
    	let span;
    	let i;
    	let t2;
    	let table_1;
    	let thead;
    	let tr;
    	let t3;
    	let tbody0;
    	let t4;
    	let tbody1;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*table*/ ctx[0].COLUMN_NAMES;
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	let each_value = /*table*/ ctx[0].ROWS;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			h1 = element("h1");
    			h1.textContent = "Dataset Table";
    			t1 = space();
    			a = element("a");
    			span = element("span");
    			i = element("i");
    			t2 = space();
    			table_1 = element("table");
    			thead = element("thead");
    			tr = element("tr");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();
    			tbody0 = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			tbody1 = element("tbody");
    			attr_dev(h1, "class", "title");
    			add_location(h1, file$9, 37, 0, 899);
    			attr_dev(i, "id", "refreshicon");
    			attr_dev(i, "class", "fas fa-sync-alt");
    			add_location(i, file$9, 40, 8, 1015);
    			attr_dev(span, "class", "icon");
    			add_location(span, file$9, 39, 4, 987);
    			attr_dev(a, "class", "button is-small");
    			add_location(a, file$9, 38, 0, 936);
    			add_location(tr, file$9, 46, 4, 1118);
    			add_location(thead, file$9, 45, 2, 1106);
    			add_location(tbody0, file$9, 53, 2, 1222);
    			add_location(tbody1, file$9, 63, 2, 1377);
    			attr_dev(table_1, "class", "table");
    			add_location(table_1, file$9, 43, 0, 1081);
    			attr_dev(section, "class", "section");
    			attr_dev(section, "id", "table");
    			add_location(section, file$9, 36, 0, 862);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h1);
    			append_dev(section, t1);
    			append_dev(section, a);
    			append_dev(a, span);
    			append_dev(span, i);
    			append_dev(section, t2);
    			append_dev(section, table_1);
    			append_dev(table_1, thead);
    			append_dev(thead, tr);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr, null);
    			}

    			append_dev(table_1, t3);
    			append_dev(table_1, tbody0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody0, null);
    			}

    			append_dev(tbody0, t4);
    			append_dev(table_1, tbody1);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*refresh*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*table*/ 1) {
    				each_value_2 = /*table*/ ctx[0].COLUMN_NAMES;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty & /*table*/ 1) {
    				each_value = /*table*/ ctx[0].ROWS;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody0, t4);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function setspinner() {
    	var rbutton = document.getElementById("refreshicon");
    	rbutton.classList.add("fa-spinner");
    	rbutton.classList.add("fa-spin");
    }

    function resetspinner() {
    	var rbutton = document.getElementById("refreshicon");
    	rbutton.classList.remove("fa-spin");
    	rbutton.classList.remove("fa-spinner");
    	rbutton.classList.add("fa-sync-alt");
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Dataset", slots, []);

    	let { table = {
    		COLUMN_NAMES: ["id", ["..."]],
    		ROWS: [{ "id": "loading", "...": "..." }]
    	} } = $$props;

    	//export let table;
    	var promiseofjsondata = fetch("./records").then(d => d.json()).then(data => {
    		return data;
    	});

    	async function refresh() {
    		setspinner();
    		let res = await fetch("./records");
    		$$invalidate(0, table = await res.json());
    		resetspinner();
    	}

    	onMount(async () => {
    		$$invalidate(0, table = await promiseofjsondata);
    	});

    	const writable_props = ["table"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dataset> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("table" in $$props) $$invalidate(0, table = $$props.table);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		table,
    		promiseofjsondata,
    		setspinner,
    		resetspinner,
    		refresh
    	});

    	$$self.$inject_state = $$props => {
    		if ("table" in $$props) $$invalidate(0, table = $$props.table);
    		if ("promiseofjsondata" in $$props) promiseofjsondata = $$props.promiseofjsondata;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [table, refresh];
    }

    class Dataset extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { table: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dataset",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get table() {
    		throw new Error("<Dataset>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set table(value) {
    		throw new Error("<Dataset>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/Lorem.svelte generated by Svelte v3.38.2 */

    const file$8 = "src/routes/Lorem.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (17:0) {#each Array(repeat) as _}
    function create_each_block$4(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sed consequatur dicta, explicabo delectus, cupiditate, rem illo repellat aperiam saepe id minus ipsa. Illum libero consectetur fuga neque officia, adipisci commodi.Porro eius harum sed architecto maxime, molestiae cum ad dignissimos eum, nihil eligendi? Non quo, modi officia doloribus distinctio pariatur sed? Veniam facere beatae ipsam reprehenderit suscipit! Sequi, distinctio debitis.\n    ";
    			add_location(p, file$8, 17, 4, 410);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(17:0) {#each Array(repeat) as _}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let h1;
    	let t1;
    	let p;
    	let t2;
    	let code;
    	let t4;
    	let each_1_anchor;
    	let each_value = Array(/*repeat*/ ctx[0]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Lorem ipsum";
    			t1 = space();
    			p = element("p");
    			t2 = text("Tip: try changing the number in the URL's fragment, e.g. ");
    			code = element("code");
    			code.textContent = "#/lorem/4";
    			t4 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			add_location(h1, file$8, 14, 0, 271);
    			add_location(code, file$8, 15, 60, 352);
    			add_location(p, file$8, 15, 0, 292);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t2);
    			append_dev(p, code);
    			insert_dev(target, t4, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*repeat*/ 1) {
    				const old_length = each_value.length;
    				each_value = Array(/*repeat*/ ctx[0]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = old_length; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (!each_blocks[i]) {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (i = each_value.length; i < old_length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t4);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Lorem", slots, []);
    	let { params = {} } = $$props;
    	let repeat = 1;
    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Lorem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("params" in $$props) $$invalidate(1, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({ params, repeat });

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(1, params = $$props.params);
    		if ("repeat" in $$props) $$invalidate(0, repeat = $$props.repeat);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*params, repeat*/ 3) {
    			{
    				$$invalidate(0, repeat = 1);

    				if (params && params.repeat) {
    					$$invalidate(0, repeat = parseInt(params.repeat, 10));

    					if (repeat < 1) {
    						$$invalidate(0, repeat = 1);
    					}
    				}
    			}
    		}
    	};

    	return [repeat, params];
    }

    class Lorem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { params: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Lorem",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get params() {
    		throw new Error("<Lorem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<Lorem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/NotFound.svelte generated by Svelte v3.38.2 */

    const file$7 = "src/routes/NotFound.svelte";

    function create_fragment$7(ctx) {
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Not Found";
    			t1 = space();
    			p = element("p");
    			p.textContent = "This route doesn't exist.";
    			attr_dev(h1, "class", "svelte-r5e5ng");
    			add_location(h1, file$7, 0, 0, 0);
    			add_location(p, file$7, 1, 0, 19);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NotFound", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NotFound> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class NotFound extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotFound",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    const BOOKS = [
    {
    NAME : "God Of Small Things",
    SENTENCES : [
    "May in Ayemenem is a hot, brooding month.",
    "The days are long and humid.",
    "The river shrinks and black crows gorge on bright mangoes in still, dustgreen trees.",
    "Red bananas ripen.",
    "Jackfruits burst.",
    "Dissolute bluebottles hum vacuously in the fruity air.",
    "Then they stun themselves against clear windowpanes and die, fatly baffled in the sun.",
    "The nights are clear, but suffused with sloth and sullen expectation.",
    "But by early June the southwest monsoon breaks and there are three months of wind and water with short spells of sharp, glittering sunshine that thrilled children snatch to play with.",
    "The countryside turns an immodest green.",
    "Boundaries blur as tapioca fences take root and bloom.",
    "Brick walls turn moss green.",
    "Pepper vines snake up electric poles.",
    "Wild creepers burst through laterite banks and spill across flooded roads.",
    "Boats ply in the bazaars.",
    "And small fish appear in the puddles that fill the PWD potholes on the highways."
    ]
    }
    ] ;

    const SARS_TABLE= {
    COLUMN_NAMES: ["cases","country","date","deaths","id","recoveries"],
    ROWS: [{cases:1,country:"Germany",date:"2003-03-17",deaths:0,"id":7615,recoveries:0},
    {cases:8,country:"Canada",date:"2003-03-17",deaths:2,"id":7616,recoveries:0},
    {cases:20,country:"Singapore",date:"2003-03-17",deaths:0,"id":7617,recoveries:0},
    {cases:95,country:"Hong Kong SAR, China",date:"2003-03-17",deaths:1,"id":7618,recoveries:0},
    {cases:2,country:"Switzerland",date:"2003-03-17",deaths:0,"id":7619,recoveries:0},
    {cases:1,country:"Thailand",date:"2003-03-17",deaths:0,"id":7620,recoveries:0},
    {cases:40,country:"Viet Nam",date:"2003-03-17",deaths:1,"id":7621,recoveries:0},
    {cases:2,country:"Germany",date:"2003-03-18",deaths:0,"id":7622,recoveries:0},
    {cases:8,country:"Canada",date:"2003-03-18",deaths:2,"id":7623,recoveries:0},
    {cases:0,country:"China",date:"2003-03-18",deaths:0,"id":7624,recoveries:0},
    {cases:23,country:"Singapore",date:"2003-03-18",deaths:0,"id":7625,recoveries:0},
    {cases:123,country:"Hong Kong SAR, China",date:"2003-03-18",deaths:1,"id":7626,recoveries:0},
    {cases:3,country:"Taiwan, China",date:"2003-03-18",deaths:0,"id":7627,recoveries:0}
    ]
    };

    const MOCK_DATA = {
    BOOKS,
    SARS_TABLE
    };

    /* src/routes/tutorial/FormTutorial.svelte generated by Svelte v3.38.2 */

    const { console: console_1$4 } = globals;
    const file$6 = "src/routes/tutorial/FormTutorial.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (67:28) {#each greetings as greeting}
    function create_each_block$3(ctx) {
    	let option;
    	let t_value = /*greeting*/ ctx[4].country + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*greeting*/ ctx[4].country;
    			option.value = option.__value;
    			add_location(option, file$6, 67, 32, 2174);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(67:28) {#each greetings as greeting}",
    		ctx
    	});

    	return block;
    }

    // (105:16) {:else}
    function create_else_block$3(ctx) {
    	let span;
    	let t_value = /*category*/ ctx[3].name + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "span");
    			add_location(span, file$6, 105, 20, 3458);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*click_handler*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*category*/ 8 && t_value !== (t_value = /*category*/ ctx[3].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(105:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (99:16) {#if editing}
    function create_if_block$2(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "class", "input");
    			add_location(input, file$6, 99, 20, 3209);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*category*/ ctx[3].name);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler_1*/ ctx[12]),
    					listen_dev(input, "blur", /*blur_handler*/ ctx[13], false, false, false),
    					listen_dev(input, "keypress", blurOnKey$2, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*category*/ 8 && input.value !== /*category*/ ctx[3].name) {
    				set_input_value(input, /*category*/ ctx[3].name);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(99:16) {#if editing}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let section0;
    	let div0;
    	let p0;
    	let t0;
    	let section1;
    	let div1;
    	let p1;

    	let raw1_value = (/*greeting*/ ctx[4]
    	? /*greeting*/ ctx[4]
    	: "this is some default text") + "";

    	let t1;
    	let div10;
    	let div9;
    	let form;
    	let div4;
    	let label0;
    	let t3;
    	let div3;
    	let div2;
    	let select;
    	let t4;
    	let div6;
    	let label1;
    	let t6;
    	let div5;
    	let input;
    	let t7;
    	let div8;
    	let label2;
    	let t8;
    	let div7;
    	let button;
    	let t9;
    	let button_disabled_value;
    	let t10;
    	let div12;
    	let div11;
    	let section2;
    	let label3;
    	let t12;
    	let h3;
    	let mounted;
    	let dispose;
    	let each_value = /*greetings*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	function select_block_type(ctx, dirty) {
    		if (/*editing*/ ctx[2]) return create_if_block$2;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			section0 = element("section");
    			div0 = element("div");
    			p0 = element("p");
    			t0 = space();
    			section1 = element("section");
    			div1 = element("div");
    			p1 = element("p");
    			t1 = space();
    			div10 = element("div");
    			div9 = element("div");
    			form = element("form");
    			div4 = element("div");
    			label0 = element("label");
    			label0.textContent = "Name : selection changes the greeting\n                    message";
    			t3 = space();
    			div3 = element("div");
    			div2 = element("div");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			div6 = element("div");
    			label1 = element("label");
    			label1.textContent = "Adding input enables submit";
    			t6 = space();
    			div5 = element("div");
    			input = element("input");
    			t7 = space();
    			div8 = element("div");
    			label2 = element("label");
    			t8 = space();
    			div7 = element("div");
    			button = element("button");
    			t9 = text("Submit");
    			t10 = space();
    			div12 = element("div");
    			div11 = element("div");
    			section2 = element("section");
    			label3 = element("label");
    			label3.textContent = "Editable Text";
    			t12 = space();
    			h3 = element("h3");
    			if_block.c();
    			add_location(p0, file$6, 43, 8, 1435);
    			attr_dev(div0, "class", "hero-body");
    			add_location(div0, file$6, 42, 4, 1403);
    			attr_dev(section0, "class", "hero is-success is-small");
    			add_location(section0, file$6, 41, 0, 1356);
    			add_location(p1, file$6, 51, 8, 1577);
    			attr_dev(div1, "class", "hero-body");
    			add_location(div1, file$6, 50, 4, 1545);
    			attr_dev(section1, "class", "hero is-info is-small");
    			add_location(section1, file$6, 49, 0, 1501);
    			attr_dev(label0, "class", "label");
    			add_location(label0, file$6, 61, 16, 1847);
    			if (/*selected_country*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[10].call(select));
    			add_location(select, file$6, 65, 24, 2045);
    			attr_dev(div2, "class", "select");
    			add_location(div2, file$6, 64, 20, 2000);
    			attr_dev(div3, "class", "control");
    			add_location(div3, file$6, 63, 16, 1958);
    			attr_dev(div4, "class", "field");
    			add_location(div4, file$6, 60, 12, 1811);
    			attr_dev(label1, "class", "label");
    			add_location(label1, file$6, 74, 16, 2397);
    			attr_dev(input, "class", "input");
    			add_location(input, file$6, 76, 24, 2516);
    			attr_dev(div5, "class", "control");
    			add_location(div5, file$6, 75, 16, 2470);
    			attr_dev(div6, "class", "field");
    			add_location(div6, file$6, 73, 12, 2361);
    			attr_dev(label2, "class", "label");
    			add_location(label2, file$6, 81, 16, 2664);
    			button.disabled = button_disabled_value = !/*form_input*/ ctx[1];
    			attr_dev(button, "class", "button is-success");
    			add_location(button, file$6, 83, 20, 2746);
    			attr_dev(div7, "class", "control");
    			add_location(div7, file$6, 82, 16, 2704);
    			attr_dev(div8, "class", "field is-grouped");
    			add_location(div8, file$6, 80, 12, 2617);
    			attr_dev(form, "class", "box");
    			add_location(form, file$6, 59, 8, 1755);
    			attr_dev(div9, "class", "column is-one-third");
    			add_location(div9, file$6, 58, 4, 1713);
    			attr_dev(div10, "class", "columns");
    			add_location(div10, file$6, 57, 0, 1687);
    			attr_dev(label3, "class", "label");
    			add_location(label3, file$6, 96, 12, 3099);
    			add_location(h3, file$6, 97, 12, 3154);
    			attr_dev(section2, "class", "section");
    			add_location(section2, file$6, 95, 8, 3061);
    			attr_dev(div11, "class", "column is-one-third");
    			add_location(div11, file$6, 94, 4, 3019);
    			attr_dev(div12, "class", "columns");
    			add_location(div12, file$6, 93, 0, 2993);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section0, anchor);
    			append_dev(section0, div0);
    			append_dev(div0, p0);
    			p0.innerHTML = /*notes*/ ctx[6];
    			insert_dev(target, t0, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, div1);
    			append_dev(div1, p1);
    			p1.innerHTML = raw1_value;
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div10, anchor);
    			append_dev(div10, div9);
    			append_dev(div9, form);
    			append_dev(form, div4);
    			append_dev(div4, label0);
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selected_country*/ ctx[0]);
    			append_dev(form, t4);
    			append_dev(form, div6);
    			append_dev(div6, label1);
    			append_dev(div6, t6);
    			append_dev(div6, div5);
    			append_dev(div5, input);
    			set_input_value(input, /*form_input*/ ctx[1]);
    			append_dev(form, t7);
    			append_dev(form, div8);
    			append_dev(div8, label2);
    			append_dev(div8, t8);
    			append_dev(div8, div7);
    			append_dev(div7, button);
    			append_dev(button, t9);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div12, anchor);
    			append_dev(div12, div11);
    			append_dev(div11, section2);
    			append_dev(section2, label3);
    			append_dev(section2, t12);
    			append_dev(section2, h3);
    			if_block.m(h3, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[10]),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[11]),
    					listen_dev(button, "click", /*submitClicked*/ ctx[7], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*submit_handler*/ ctx[9]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*greeting*/ 16 && raw1_value !== (raw1_value = (/*greeting*/ ctx[4]
    			? /*greeting*/ ctx[4]
    			: "this is some default text") + "")) p1.innerHTML = raw1_value;
    			if (dirty & /*greetings*/ 32) {
    				each_value = /*greetings*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*selected_country, greetings*/ 33) {
    				select_option(select, /*selected_country*/ ctx[0]);
    			}

    			if (dirty & /*form_input*/ 2 && input.value !== /*form_input*/ ctx[1]) {
    				set_input_value(input, /*form_input*/ ctx[1]);
    			}

    			if (dirty & /*form_input*/ 2 && button_disabled_value !== (button_disabled_value = !/*form_input*/ ctx[1])) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(h3, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(section1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div10);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div12);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function blurOnKey$2(event) {
    	const { code } = event;

    	if (code === "Enter" || code == "Escape" || code === "Tab") {
    		event.target.blur();
    	}
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let message;
    	let greeting;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FormTutorial", slots, []);

    	let greetings = [
    		{ country: "US", message: "Aloha" },
    		{ country: "India", message: "Namaskaram" },
    		{ country: "Japan", message: "Konnichiva" }
    	];

    	let selected_country = greetings[Math.floor(Math.random() * (3 - 1))].country;
    	let message_for_selected_country = c => greetings.filter(g => g.country === c)[0].message;
    	let form_input;

    	let notes = `- if submit button has on:click method, then forms on:submit will not be called </br> 
    - use bindings to update form values <br/>
    - form submit<br/>
    - editable text`;

    	function shuffle() {
    		$$invalidate(4, greeting = greeting.split(" ").sort(() => Math.random() - 0.5).join(" "));
    	}

    	function submitClicked() {
    		console.log(`${selected_country} : ${message}`);
    	}

    	//######################################
    	// Editing Demo
    	let editing = false;

    	let category = { name: "category 1" };
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<FormTutorial> was created with unknown prop '${key}'`);
    	});

    	function submit_handler(event) {
    		bubble($$self, event);
    	}

    	function select_change_handler() {
    		selected_country = select_value(this);
    		$$invalidate(0, selected_country);
    		$$invalidate(5, greetings);
    	}

    	function input_input_handler() {
    		form_input = this.value;
    		$$invalidate(1, form_input);
    	}

    	function input_input_handler_1() {
    		category.name = this.value;
    		$$invalidate(3, category);
    	}

    	const blur_handler = () => $$invalidate(2, editing = false);
    	const click_handler = () => $$invalidate(2, editing = true);

    	$$self.$capture_state = () => ({
    		greetings,
    		selected_country,
    		message_for_selected_country,
    		form_input,
    		notes,
    		shuffle,
    		submitClicked,
    		editing,
    		category,
    		blurOnKey: blurOnKey$2,
    		message,
    		greeting
    	});

    	$$self.$inject_state = $$props => {
    		if ("greetings" in $$props) $$invalidate(5, greetings = $$props.greetings);
    		if ("selected_country" in $$props) $$invalidate(0, selected_country = $$props.selected_country);
    		if ("message_for_selected_country" in $$props) $$invalidate(15, message_for_selected_country = $$props.message_for_selected_country);
    		if ("form_input" in $$props) $$invalidate(1, form_input = $$props.form_input);
    		if ("notes" in $$props) $$invalidate(6, notes = $$props.notes);
    		if ("editing" in $$props) $$invalidate(2, editing = $$props.editing);
    		if ("category" in $$props) $$invalidate(3, category = $$props.category);
    		if ("message" in $$props) $$invalidate(8, message = $$props.message);
    		if ("greeting" in $$props) $$invalidate(4, greeting = $$props.greeting);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*selected_country*/ 1) {
    			$$invalidate(8, message = message_for_selected_country(selected_country));
    		}

    		if ($$self.$$.dirty & /*message*/ 256) {
    			$$invalidate(4, greeting = ` ${message} ! welcome to svelte form tutorial `);
    		}
    	};

    	return [
    		selected_country,
    		form_input,
    		editing,
    		category,
    		greeting,
    		greetings,
    		notes,
    		submitClicked,
    		message,
    		submit_handler,
    		select_change_handler,
    		input_input_handler,
    		input_input_handler_1,
    		blur_handler,
    		click_handler
    	];
    }

    class FormTutorial extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FormTutorial",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/routes/tutorial/DogBreed.svelte generated by Svelte v3.38.2 */

    const { Object: Object_1$1, console: console_1$3 } = globals;
    const file$5 = "src/routes/tutorial/DogBreed.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i][0];
    	child_ctx[11] = list[i][1];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (51:28) {:else}
    function create_else_block$2(ctx) {
    	let option;
    	let t_value = /*breed*/ ctx[10] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*breed*/ ctx[10];
    			option.value = option.__value;
    			add_location(option, file$5, 51, 28, 1909);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dog_breeds*/ 2 && t_value !== (t_value = /*breed*/ ctx[10] + "")) set_data_dev(t, t_value);

    			if (dirty & /*dog_breeds*/ 2 && option_value_value !== (option_value_value = /*breed*/ ctx[10])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(51:28) {:else}",
    		ctx
    	});

    	return block;
    }

    // (49:28) {#each sub_breed as sb}
    function create_each_block_2(ctx) {
    	let option;
    	let t_value = /*breed*/ ctx[10] + "-" + /*sb*/ ctx[14] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*breed*/ ctx[10] + "-" + /*sb*/ ctx[14];
    			option.value = option.__value;
    			add_location(option, file$5, 49, 32, 1809);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dog_breeds*/ 2 && t_value !== (t_value = /*breed*/ ctx[10] + "-" + /*sb*/ ctx[14] + "")) set_data_dev(t, t_value);

    			if (dirty & /*dog_breeds*/ 2 && option_value_value !== (option_value_value = /*breed*/ ctx[10] + "-" + /*sb*/ ctx[14])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(49:28) {#each sub_breed as sb}",
    		ctx
    	});

    	return block;
    }

    // (48:24) {#each Object.entries(dog_breeds) as  [breed,sub_breed]}
    function create_each_block_1(ctx) {
    	let each_1_anchor;
    	let each_value_2 = /*sub_breed*/ ctx[11];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_1_else = null;

    	if (!each_value_2.length) {
    		each_1_else = create_else_block$2(ctx);
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();

    			if (each_1_else) {
    				each_1_else.c();
    			}
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);

    			if (each_1_else) {
    				each_1_else.m(target, anchor);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*Object, dog_breeds*/ 2) {
    				each_value_2 = /*sub_breed*/ ctx[11];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;

    				if (!each_value_2.length && each_1_else) {
    					each_1_else.p(ctx, dirty);
    				} else if (!each_value_2.length) {
    					each_1_else = create_else_block$2(ctx);
    					each_1_else.c();
    					each_1_else.m(each_1_anchor.parentNode, each_1_anchor);
    				} else if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    			if (each_1_else) each_1_else.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(48:24) {#each Object.entries(dog_breeds) as  [breed,sub_breed]}",
    		ctx
    	});

    	return block;
    }

    // (107:4) {:catch error}
    function create_catch_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Error: error in getting dog images";
    			add_location(div, file$5, 107, 8, 4204);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(107:4) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (64:4) {:then dog_image_urls}
    function create_then_block(ctx) {
    	let each_1_anchor;
    	let each_value = /*dog_image_urls*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dog_images*/ 4) {
    				each_value = /*dog_image_urls*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(64:4) {:then dog_image_urls}",
    		ctx
    	});

    	return block;
    }

    // (65:4) {#each dog_image_urls as dog_image}
    function create_each_block$2(ctx) {
    	let div3;
    	let article;
    	let figure;
    	let p0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div2;
    	let div0;
    	let p1;
    	let strong;
    	let t2;
    	let small0;
    	let t4;
    	let small1;
    	let t6;
    	let br;
    	let t7;
    	let t8;
    	let nav;
    	let div1;
    	let a0;
    	let span0;
    	let i0;
    	let t9;
    	let a1;
    	let span1;
    	let i1;
    	let t10;
    	let a2;
    	let span2;
    	let i2;
    	let t11;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			article = element("article");
    			figure = element("figure");
    			p0 = element("p");
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			p1 = element("p");
    			strong = element("strong");
    			strong.textContent = "John Smith";
    			t2 = space();
    			small0 = element("small");
    			small0.textContent = "@johnsmith";
    			t4 = space();
    			small1 = element("small");
    			small1.textContent = "31m";
    			t6 = space();
    			br = element("br");
    			t7 = text("\n                            Lorem ipsum dolor sit amet, consectetur adipiscing\n                            elit. Proin ornare magna eros, eu pellentesque\n                            tortor vestibulum ut. Maecenas non massa sem. Etiam\n                            finibus odio quis feugiat facilisis.");
    			t8 = space();
    			nav = element("nav");
    			div1 = element("div");
    			a0 = element("a");
    			span0 = element("span");
    			i0 = element("i");
    			t9 = space();
    			a1 = element("a");
    			span1 = element("span");
    			i1 = element("i");
    			t10 = space();
    			a2 = element("a");
    			span2 = element("span");
    			i2 = element("i");
    			t11 = space();

    			if (img.src !== (img_src_value = /*dog_image*/ ctx[6]
    			? /*dog_image*/ ctx[6]
    			: "https://bulma.io/images/placeholders/128x128.png")) attr_dev(img, "src", img_src_value);

    			add_location(img, file$5, 69, 24, 2464);
    			attr_dev(p0, "class", "image is-128x128");
    			add_location(p0, file$5, 68, 20, 2411);
    			attr_dev(figure, "class", "media-left");
    			add_location(figure, file$5, 67, 16, 2363);
    			add_location(strong, file$5, 76, 28, 2772);
    			add_location(small0, file$5, 77, 28, 2828);
    			add_location(small1, file$5, 78, 28, 2882);
    			add_location(br, file$5, 79, 28, 2929);
    			add_location(p1, file$5, 75, 24, 2740);
    			attr_dev(div0, "class", "content");
    			add_location(div0, file$5, 74, 20, 2694);
    			attr_dev(i0, "class", "fas fa-reply");
    			add_location(i0, file$5, 89, 60, 3501);
    			attr_dev(span0, "class", "icon is-small");
    			add_location(span0, file$5, 89, 32, 3473);
    			attr_dev(a0, "class", "level-item");
    			add_location(a0, file$5, 88, 28, 3418);
    			attr_dev(i1, "class", "fas fa-retweet");
    			add_location(i1, file$5, 93, 60, 3719);
    			attr_dev(span1, "class", "icon is-small");
    			add_location(span1, file$5, 93, 32, 3691);
    			attr_dev(a1, "class", "level-item");
    			add_location(a1, file$5, 92, 28, 3636);
    			attr_dev(i2, "class", "fas fa-heart");
    			add_location(i2, file$5, 97, 60, 3939);
    			attr_dev(span2, "class", "icon is-small");
    			add_location(span2, file$5, 97, 32, 3911);
    			attr_dev(a2, "class", "level-item");
    			add_location(a2, file$5, 96, 28, 3856);
    			attr_dev(div1, "class", "level-left");
    			add_location(div1, file$5, 87, 24, 3365);
    			attr_dev(nav, "class", "level is-mobile");
    			add_location(nav, file$5, 86, 20, 3311);
    			attr_dev(div2, "class", "media-content");
    			add_location(div2, file$5, 73, 16, 2646);
    			attr_dev(article, "class", "media");
    			add_location(article, file$5, 66, 12, 2323);
    			attr_dev(div3, "class", "column is-half");
    			add_location(div3, file$5, 65, 8, 2282);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, article);
    			append_dev(article, figure);
    			append_dev(figure, p0);
    			append_dev(p0, img);
    			append_dev(article, t0);
    			append_dev(article, div2);
    			append_dev(div2, div0);
    			append_dev(div0, p1);
    			append_dev(p1, strong);
    			append_dev(p1, t2);
    			append_dev(p1, small0);
    			append_dev(p1, t4);
    			append_dev(p1, small1);
    			append_dev(p1, t6);
    			append_dev(p1, br);
    			append_dev(p1, t7);
    			append_dev(div2, t8);
    			append_dev(div2, nav);
    			append_dev(nav, div1);
    			append_dev(div1, a0);
    			append_dev(a0, span0);
    			append_dev(span0, i0);
    			append_dev(div1, t9);
    			append_dev(div1, a1);
    			append_dev(a1, span1);
    			append_dev(span1, i1);
    			append_dev(div1, t10);
    			append_dev(div1, a2);
    			append_dev(a2, span2);
    			append_dev(span2, i2);
    			append_dev(div3, t11);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dog_images*/ 4 && img.src !== (img_src_value = /*dog_image*/ ctx[6]
    			? /*dog_image*/ ctx[6]
    			: "https://bulma.io/images/placeholders/128x128.png")) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(65:4) {#each dog_image_urls as dog_image}",
    		ctx
    	});

    	return block;
    }

    // (62:23)      <div>Waiting for dogs images to load ...</div>     {:then dog_image_urls}
    function create_pending_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Waiting for dogs images to load ...";
    			add_location(div, file$5, 62, 4, 2160);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(62:23)      <div>Waiting for dogs images to load ...</div>     {:then dog_image_urls}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let section;
    	let div3;
    	let div2;
    	let label;
    	let t1;
    	let div1;
    	let div0;
    	let select;
    	let t2;
    	let promise;
    	let mounted;
    	let dispose;
    	let each_value_1 = Object.entries(/*dog_breeds*/ ctx[1]);
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 5,
    		error: 9
    	};

    	handle_promise(promise = /*dog_images*/ ctx[2], info);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div3 = element("div");
    			div2 = element("div");
    			label = element("label");
    			label.textContent = "Dog Breed";
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			info.block.c();
    			attr_dev(label, "class", "label");
    			add_location(label, file$5, 43, 12, 1476);
    			if (/*selected_dog*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[3].call(select));
    			add_location(select, file$5, 46, 20, 1607);
    			attr_dev(div0, "class", "select");
    			add_location(div0, file$5, 45, 16, 1565);
    			attr_dev(div1, "class", "control");
    			add_location(div1, file$5, 44, 12, 1527);
    			attr_dev(div2, "class", "field");
    			add_location(div2, file$5, 42, 8, 1444);
    			attr_dev(div3, "class", "column is-one-third");
    			add_location(div3, file$5, 41, 4, 1402);
    			attr_dev(section, "class", "section");
    			add_location(section, file$5, 40, 0, 1372);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div3);
    			append_dev(div3, div2);
    			append_dev(div2, label);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selected_dog*/ ctx[0]);
    			append_dev(section, t2);
    			info.block.m(section, info.anchor = null);
    			info.mount = () => section;
    			info.anchor = null;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*Object, dog_breeds*/ 2) {
    				each_value_1 = Object.entries(/*dog_breeds*/ ctx[1]);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty & /*selected_dog, Object, dog_breeds*/ 3) {
    				select_option(select, /*selected_dog*/ ctx[0]);
    			}

    			info.ctx = ctx;

    			if (dirty & /*dog_images*/ 4 && promise !== (promise = /*dog_images*/ ctx[2]) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			info.block.d();
    			info.token = null;
    			info = null;
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function get_dog_api(url) {
    	const res = await fetch(url);
    	if (!res.ok || res.status === 404) return [];
    	const res_json = await res.json();
    	return res_json.message;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DogBreed", slots, []);
    	let dog_breeds = [];
    	let selected_dog;
    	let dog_images = [];

    	async function get_dog_images(selected_dog) {
    		console.log(`selected dog is ${selected_dog}`);
    		let [breed, sub_breed] = selected_dog.split("-");

    		const url = sub_breed
    		? `https://dog.ceo/api/breed/${breed}/${sub_breed}/images`
    		: `https://dog.ceo/api/breed/${breed}/images`;

    		const images = await get_dog_api(url);
    		$$invalidate(2, dog_images = images.length > 0 ? images.splice(0, 5) : []);
    		console.log(`dog_images : ${dog_images}`);
    	}

    	onMount(async () => {
    		const url = "https://dog.ceo/api/breeds/list/all";
    		$$invalidate(1, dog_breeds = await get_dog_api(url));
    	});

    	const writable_props = [];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<DogBreed> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		selected_dog = select_value(this);
    		$$invalidate(0, selected_dog);
    		$$invalidate(1, dog_breeds);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		dog_breeds,
    		selected_dog,
    		dog_images,
    		get_dog_api,
    		get_dog_images
    	});

    	$$self.$inject_state = $$props => {
    		if ("dog_breeds" in $$props) $$invalidate(1, dog_breeds = $$props.dog_breeds);
    		if ("selected_dog" in $$props) $$invalidate(0, selected_dog = $$props.selected_dog);
    		if ("dog_images" in $$props) $$invalidate(2, dog_images = $$props.dog_images);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*selected_dog*/ 1) {
    			$$invalidate(2, dog_images = selected_dog ? get_dog_images(selected_dog) : []);
    		}
    	};

    	return [selected_dog, dog_breeds, dog_images, select_change_handler];
    }

    class DogBreed extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DogBreed",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/routes/tutorial/Scratchpad.svelte generated by Svelte v3.38.2 */

    const file$4 = "src/routes/tutorial/Scratchpad.svelte";

    // (20:8) {:else}
    function create_else_block$1(ctx) {
    	let span;
    	let t_value = /*category*/ ctx[1].name + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "span");
    			add_location(span, file$4, 20, 12, 572);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*category*/ 2 && t_value !== (t_value = /*category*/ ctx[1].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(20:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (15:8) {#if editing}
    function create_if_block$1(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "class", "input");
    			add_location(input, file$4, 15, 12, 387);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*category*/ ctx[1].name);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[2]),
    					listen_dev(input, "blur", /*blur_handler*/ ctx[3], false, false, false),
    					listen_dev(input, "keypress", blurOnKey$1, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*category*/ 2 && input.value !== /*category*/ ctx[1].name) {
    				set_input_value(input, /*category*/ ctx[1].name);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(15:8) {#if editing}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let section;
    	let label;
    	let t1;
    	let h3;

    	function select_block_type(ctx, dirty) {
    		if (/*editing*/ ctx[0]) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			label = element("label");
    			label.textContent = "Editable Text";
    			t1 = space();
    			h3 = element("h3");
    			if_block.c();
    			attr_dev(label, "class", "label");
    			add_location(label, file$4, 12, 4, 301);
    			add_location(h3, file$4, 13, 4, 348);
    			attr_dev(section, "class", "section");
    			add_location(section, file$4, 11, 0, 271);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, label);
    			append_dev(section, t1);
    			append_dev(section, h3);
    			if_block.m(h3, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(h3, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function blurOnKey$1(event) {
    	const { code } = event;

    	if (code === "Enter" || code == "Escape" || code === "Tab") {
    		event.target.blur();
    	}
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Scratchpad", slots, []);
    	let editing = false;
    	let category = { name: "category 1" };
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Scratchpad> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		category.name = this.value;
    		$$invalidate(1, category);
    	}

    	const blur_handler = () => $$invalidate(0, editing = false);
    	const click_handler = () => $$invalidate(0, editing = true);
    	$$self.$capture_state = () => ({ editing, category, blurOnKey: blurOnKey$1 });

    	$$self.$inject_state = $$props => {
    		if ("editing" in $$props) $$invalidate(0, editing = $$props.editing);
    		if ("category" in $$props) $$invalidate(1, category = $$props.category);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [editing, category, input_input_handler, blur_handler, click_handler];
    }

    class Scratchpad extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Scratchpad",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    function blurOnKey(event) {
        const { code } = event;
        if (code === "Enter" || code == "Escape" || code === "Tab") {
            event.target.blur();
        }
    }


    function getUID(){
        return Math.random().toString(36).substr(2,10)
    }

    /* src/routes/tutorial/travelapp/TravelItem.svelte generated by Svelte v3.38.2 */

    const { console: console_1$2 } = globals;
    const file$3 = "src/routes/tutorial/travelapp/TravelItem.svelte";

    // (29:8) {:else}
    function create_else_block_1(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "class", "input");
    			add_location(input, file$3, 29, 12, 768);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*item*/ ctx[0].name);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "blur", /*blur_handler*/ ctx[7], false, false, false),
    					listen_dev(input, "keypress", blurOnKey, false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[8])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*item*/ 1 && input.value !== /*item*/ ctx[0].name) {
    				set_input_value(input, /*item*/ ctx[0].name);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(29:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (19:8) {#if editing === false}
    function create_if_block(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*yes*/ ctx[1]) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(19:8) {#if editing === false}",
    		ctx
    	});

    	return block;
    }

    // (24:12) {:else}
    function create_else_block(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[0].name + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "span");
    			add_location(span, file$3, 24, 12, 618);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*click_handler_1*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*item*/ 1 && t_value !== (t_value = /*item*/ ctx[0].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(24:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (20:12) {#if yes}
    function create_if_block_1(ctx) {
    	let span;
    	let t_value = /*item*/ ctx[0].name + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "span");
    			set_style(span, "text-decoration", "line-through");
    			add_location(span, file$3, 20, 12, 444);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*item*/ 1 && t_value !== (t_value = /*item*/ ctx[0].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(20:12) {#if yes}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let label;
    	let input;
    	let t0;
    	let t1;
    	let span;
    	let i;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*editing*/ ctx[2] === false) return create_if_block;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			if_block.c();
    			t1 = space();
    			span = element("span");
    			i = element("i");
    			attr_dev(input, "type", "checkbox");
    			add_location(input, file$3, 16, 8, 333);
    			attr_dev(label, "class", "checkbox");
    			add_location(label, file$3, 14, 4, 291);
    			attr_dev(i, "class", "fas fa-trash-alt");
    			add_location(i, file$3, 40, 8, 1105);
    			attr_dev(span, "class", "icon is-small is-right");
    			set_style(span, "pointer-events", "all");
    			set_style(span, "cursor", "pointer");
    			add_location(span, file$3, 36, 4, 968);
    			attr_dev(div, "class", "control");
    			add_location(div, file$3, 13, 0, 265);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, input);
    			input.checked = /*yes*/ ctx[1];
    			append_dev(label, t0);
    			if_block.m(label, null);
    			append_dev(div, t1);
    			append_dev(div, span);
    			append_dev(span, i);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[4]),
    					listen_dev(span, "click", /*deleteItem*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*yes*/ 2) {
    				input.checked = /*yes*/ ctx[1];
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(label, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TravelItem", slots, []);
    	let yes = false;
    	let { item } = $$props;
    	let editing = false;

    	// item has name,category,ispacked fields
    	function deleteItem() {
    		console.log("Deleting the item " + item.name);
    	}

    	const writable_props = ["item"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<TravelItem> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		yes = this.checked;
    		$$invalidate(1, yes);
    	}

    	const click_handler = () => $$invalidate(2, editing = true);
    	const click_handler_1 = () => $$invalidate(2, editing = true);
    	const blur_handler = () => $$invalidate(2, editing = false);

    	function input_input_handler() {
    		item.name = this.value;
    		$$invalidate(0, item);
    	}

    	$$self.$$set = $$props => {
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({
    		blurOnKey,
    		yes,
    		item,
    		editing,
    		deleteItem
    	});

    	$$self.$inject_state = $$props => {
    		if ("yes" in $$props) $$invalidate(1, yes = $$props.yes);
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    		if ("editing" in $$props) $$invalidate(2, editing = $$props.editing);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		item,
    		yes,
    		editing,
    		deleteItem,
    		input_change_handler,
    		click_handler,
    		click_handler_1,
    		blur_handler,
    		input_input_handler
    	];
    }

    class TravelItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { item: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TravelItem",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*item*/ ctx[0] === undefined && !("item" in props)) {
    			console_1$2.warn("<TravelItem> was created without expected prop 'item'");
    		}
    	}

    	get item() {
    		throw new Error("<TravelItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<TravelItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/tutorial/travelapp/TravelCategory.svelte generated by Svelte v3.38.2 */

    const { console: console_1$1 } = globals;
    const file$2 = "src/routes/tutorial/travelapp/TravelCategory.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[11] = list;
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (65:2) {#each items as item}
    function create_each_block$1(ctx) {
    	let travelitem;
    	let updating_item;
    	let current;

    	function travelitem_item_binding(value) {
    		/*travelitem_item_binding*/ ctx[9](value, /*item*/ ctx[10], /*each_value*/ ctx[11], /*item_index*/ ctx[12]);
    	}

    	let travelitem_props = {};

    	if (/*item*/ ctx[10] !== void 0) {
    		travelitem_props.item = /*item*/ ctx[10];
    	}

    	travelitem = new TravelItem({ props: travelitem_props, $$inline: true });
    	binding_callbacks.push(() => bind(travelitem, "item", travelitem_item_binding));

    	const block = {
    		c: function create() {
    			create_component(travelitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(travelitem, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const travelitem_changes = {};

    			if (!updating_item && dirty & /*items*/ 8) {
    				updating_item = true;
    				travelitem_changes.item = /*item*/ ctx[10];
    				add_flush_callback(() => updating_item = false);
    			}

    			travelitem.$set(travelitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(travelitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(travelitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(travelitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(65:2) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div6;
    	let div1;
    	let div0;
    	let h4;
    	let t0_value = /*category*/ ctx[0].name + "";
    	let t0;
    	let t1;
    	let span;
    	let i;
    	let t2;
    	let div5;
    	let div2;
    	let input0;
    	let t3;
    	let div3;
    	let label0;
    	let input1;
    	let t4;
    	let t5;
    	let label1;
    	let input2;
    	let t6;
    	let t7;
    	let div4;
    	let a;
    	let t9;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*items*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h4 = element("h4");
    			t0 = text(t0_value);
    			t1 = space();
    			span = element("span");
    			i = element("i");
    			t2 = space();
    			div5 = element("div");
    			div2 = element("div");
    			input0 = element("input");
    			t3 = space();
    			div3 = element("div");
    			label0 = element("label");
    			input1 = element("input");
    			t4 = text("\n        Packed");
    			t5 = space();
    			label1 = element("label");
    			input2 = element("input");
    			t6 = text("\n        NotPacked");
    			t7 = space();
    			div4 = element("div");
    			a = element("a");
    			a.textContent = "AddItem";
    			t9 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h4, "class", "title is-4");
    			add_location(h4, file$2, 30, 6, 815);
    			attr_dev(div0, "class", "level-item level-left");
    			add_location(div0, file$2, 29, 4, 773);
    			attr_dev(i, "class", "fas fa-trash-alt");
    			add_location(i, file$2, 36, 6, 1007);
    			attr_dev(span, "class", "icon is-small is-right");
    			set_style(span, "pointer-events", "all");
    			set_style(span, "cursor", "pointer");
    			add_location(span, file$2, 32, 4, 874);
    			attr_dev(div1, "class", "level");
    			add_location(div1, file$2, 28, 2, 749);
    			attr_dev(input0, "class", "input");
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$2, 41, 6, 1113);
    			attr_dev(div2, "class", "control");
    			add_location(div2, file$2, 40, 4, 1085);
    			attr_dev(input1, "type", "radio");
    			attr_dev(input1, "name", "packed");
    			add_location(input1, file$2, 45, 8, 1245);
    			attr_dev(label0, "class", "radio");
    			add_location(label0, file$2, 44, 6, 1215);
    			attr_dev(input2, "type", "radio");
    			attr_dev(input2, "name", "packed");
    			input2.checked = true;
    			add_location(input2, file$2, 52, 8, 1415);
    			attr_dev(label1, "class", "radio");
    			add_location(label1, file$2, 51, 6, 1385);
    			attr_dev(div3, "class", "control");
    			add_location(div3, file$2, 43, 4, 1187);
    			attr_dev(a, "class", "button is-info");
    			add_location(a, file$2, 61, 6, 1626);
    			attr_dev(div4, "class", "control is-grouped ");
    			add_location(div4, file$2, 60, 4, 1586);
    			attr_dev(div5, "class", "field");
    			add_location(div5, file$2, 39, 2, 1061);
    			attr_dev(div6, "class", "box has-background-primary");
    			add_location(div6, file$2, 27, 0, 706);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h4);
    			append_dev(h4, t0);
    			append_dev(div1, t1);
    			append_dev(div1, span);
    			append_dev(span, i);
    			append_dev(div6, t2);
    			append_dev(div6, div5);
    			append_dev(div5, div2);
    			append_dev(div2, input0);
    			set_input_value(input0, /*item_name*/ ctx[1]);
    			append_dev(div5, t3);
    			append_dev(div5, div3);
    			append_dev(div3, label0);
    			append_dev(label0, input1);
    			append_dev(label0, t4);
    			append_dev(div3, t5);
    			append_dev(div3, label1);
    			append_dev(label1, input2);
    			append_dev(label1, t6);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div4, a);
    			append_dev(div6, t9);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div6, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(span, "click", /*deleteCategory*/ ctx[5], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen_dev(input1, "select", /*select_handler*/ ctx[7], false, false, false),
    					listen_dev(input2, "select", /*select_handler_1*/ ctx[8], false, false, false),
    					listen_dev(a, "click", /*addItem*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*category*/ 1) && t0_value !== (t0_value = /*category*/ ctx[0].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*item_name*/ 2 && input0.value !== /*item_name*/ ctx[1]) {
    				set_input_value(input0, /*item_name*/ ctx[1]);
    			}

    			if (dirty & /*items*/ 8) {
    				each_value = /*items*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div6, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let items;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TravelCategory", slots, []);
    	let { category } = $$props;
    	let item_name;
    	let is_packed = false;

    	function addItem() {
    		const is_duplicate = category.items.some(item => item.name.toLowerCase() === item_name.toLowerCase());

    		if (!is_duplicate) {
    			const item = { id: getUID(), name: item_name, is_packed };
    			const index = category.items.length;
    			$$invalidate(0, category.items[index] = item, category);
    			$$invalidate(0, category);
    		}

    		console.log(category);
    		$$invalidate(1, item_name = "");
    	}

    	function deleteCategory() {
    		console.log("Deleting category " + category.name);
    	}

    	const writable_props = ["category"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<TravelCategory> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		item_name = this.value;
    		$$invalidate(1, item_name);
    	}

    	const select_handler = () => $$invalidate(2, is_packed = true);
    	const select_handler_1 = () => $$invalidate(2, is_packed = false);

    	function travelitem_item_binding(value, item, each_value, item_index) {
    		each_value[item_index] = value;
    		($$invalidate(3, items), $$invalidate(0, category));
    	}

    	$$self.$$set = $$props => {
    		if ("category" in $$props) $$invalidate(0, category = $$props.category);
    	};

    	$$self.$capture_state = () => ({
    		TravelItem,
    		blurOnKey,
    		getUID,
    		category,
    		item_name,
    		is_packed,
    		addItem,
    		deleteCategory,
    		items
    	});

    	$$self.$inject_state = $$props => {
    		if ("category" in $$props) $$invalidate(0, category = $$props.category);
    		if ("item_name" in $$props) $$invalidate(1, item_name = $$props.item_name);
    		if ("is_packed" in $$props) $$invalidate(2, is_packed = $$props.is_packed);
    		if ("items" in $$props) $$invalidate(3, items = $$props.items);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*category*/ 1) {
    			$$invalidate(3, items = category.items);
    		}
    	};

    	return [
    		category,
    		item_name,
    		is_packed,
    		items,
    		addItem,
    		deleteCategory,
    		input0_input_handler,
    		select_handler,
    		select_handler_1,
    		travelitem_item_binding
    	];
    }

    class TravelCategory extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { category: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TravelCategory",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*category*/ ctx[0] === undefined && !("category" in props)) {
    			console_1$1.warn("<TravelCategory> was created without expected prop 'category'");
    		}
    	}

    	get category() {
    		throw new Error("<TravelCategory>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set category(value) {
    		throw new Error("<TravelCategory>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/tutorial/travelapp/TravelCheckList.svelte generated by Svelte v3.38.2 */

    const { Object: Object_1, console: console_1 } = globals;
    const file$1 = "src/routes/tutorial/travelapp/TravelCheckList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[6] = list;
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (30:4) {#each Object.values(categories) as category}
    function create_each_block(ctx) {
    	let travelcategory;
    	let updating_category;
    	let current;

    	function travelcategory_category_binding(value) {
    		/*travelcategory_category_binding*/ ctx[4](value, /*category*/ ctx[5], /*each_value*/ ctx[6], /*category_index*/ ctx[7]);
    	}

    	let travelcategory_props = {};

    	if (/*category*/ ctx[5] !== void 0) {
    		travelcategory_props.category = /*category*/ ctx[5];
    	}

    	travelcategory = new TravelCategory({
    			props: travelcategory_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(travelcategory, "category", travelcategory_category_binding));

    	const block = {
    		c: function create() {
    			create_component(travelcategory.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(travelcategory, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const travelcategory_changes = {};

    			if (!updating_category && dirty & /*Object, categories*/ 1) {
    				updating_category = true;
    				travelcategory_changes.category = /*category*/ ctx[5];
    				add_flush_callback(() => updating_category = false);
    			}

    			travelcategory.$set(travelcategory_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(travelcategory.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(travelcategory.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(travelcategory, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(30:4) {#each Object.values(categories) as category}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let input;
    	let t0;
    	let div1;
    	let a;
    	let t2;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = Object.values(/*categories*/ ctx[0]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			input = element("input");
    			t0 = space();
    			div1 = element("div");
    			a = element("a");
    			a.textContent = "AddCategory";
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(input, "class", "input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Eg: Documents,Bathroom,Medical etc");
    			add_location(input, file$1, 21, 10, 635);
    			attr_dev(div0, "class", "control");
    			add_location(div0, file$1, 20, 8, 603);
    			attr_dev(a, "class", "button is-info");
    			add_location(a, file$1, 24, 10, 799);
    			attr_dev(div1, "class", "control");
    			add_location(div1, file$1, 23, 8, 767);
    			attr_dev(div2, "class", "field has-addons");
    			add_location(div2, file$1, 19, 4, 564);
    			attr_dev(div3, "class", "column is-one-third");
    			add_location(div3, file$1, 18, 0, 526);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, input);
    			set_input_value(input, /*categoryName*/ ctx[1]);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, a);
    			append_dev(div3, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[3]),
    					listen_dev(a, "click", /*addCategory*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*categoryName*/ 2 && input.value !== /*categoryName*/ ctx[1]) {
    				set_input_value(input, /*categoryName*/ ctx[1]);
    			}

    			if (dirty & /*Object, categories*/ 1) {
    				each_value = Object.values(/*categories*/ ctx[0]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div3, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TravelCheckList", slots, []);
    	let categories = {};
    	let categoryName;

    	function addCategory() {
    		const is_duplicate = Object.values(categories).some(cat => cat.name === categoryName);

    		if (!is_duplicate) {
    			const id = Math.random().toString(36).substr(2, 8);
    			$$invalidate(0, categories[id] = { id, name: categoryName, items: [] }, categories);
    		}

    		console.log(categories);
    		$$invalidate(1, categoryName = "");
    	}

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<TravelCheckList> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		categoryName = this.value;
    		$$invalidate(1, categoryName);
    	}

    	function travelcategory_category_binding(value, category, each_value, category_index) {
    		each_value[category_index] = value;
    	}

    	$$self.$capture_state = () => ({
    		TravelCategory,
    		blurOnKey,
    		categories,
    		categoryName,
    		addCategory
    	});

    	$$self.$inject_state = $$props => {
    		if ("categories" in $$props) $$invalidate(0, categories = $$props.categories);
    		if ("categoryName" in $$props) $$invalidate(1, categoryName = $$props.categoryName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		categories,
    		categoryName,
    		addCategory,
    		input_input_handler,
    		travelcategory_category_binding
    	];
    }

    class TravelCheckList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TravelCheckList",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    var routes = {
        '/':  wrap$1({
            component: Home,
            // Static props
            props: {
                books: MOCK_DATA.BOOKS,
                table:MOCK_DATA.SARS_TABLE
            }
        }),
        '/tutorial/form':  wrap$1({
            component: FormTutorial
        }),
        '/tutorial/dogbreed':  wrap$1({
            component: DogBreed
        }),
        '/tutorial/travelchecklist':  wrap$1({
            component: TravelCheckList
        }),
        '/tutorial/scratchpad':  wrap$1({
            component: Scratchpad
        }),
        '/dataset':  wrap$1({
            component: Dataset
        }),
        '/lorem/:repeat': Lorem,
        // The catch-all route must always be last
        '*': NotFound
    };

    /* src/App.svelte generated by Svelte v3.38.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let nav;
    	let div0;
    	let a0;
    	let img;
    	let img_src_value;
    	let t0;
    	let a1;
    	let span0;
    	let t1;
    	let span1;
    	let t2;
    	let span2;
    	let t3;
    	let div7;
    	let div3;
    	let a2;
    	let t5;
    	let a3;
    	let t7;
    	let a4;
    	let t9;
    	let div2;
    	let a5;
    	let t11;
    	let div1;
    	let a6;
    	let t13;
    	let a7;
    	let t15;
    	let a8;
    	let t17;
    	let a9;
    	let t19;
    	let div6;
    	let div5;
    	let div4;
    	let a10;
    	let strong;
    	let t21;
    	let a11;
    	let t23;
    	let main;
    	let router;
    	let current;
    	router = new Router({ props: { routes }, $$inline: true });

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div0 = element("div");
    			a0 = element("a");
    			img = element("img");
    			t0 = space();
    			a1 = element("a");
    			span0 = element("span");
    			t1 = space();
    			span1 = element("span");
    			t2 = space();
    			span2 = element("span");
    			t3 = space();
    			div7 = element("div");
    			div3 = element("div");
    			a2 = element("a");
    			a2.textContent = "Home";
    			t5 = space();
    			a3 = element("a");
    			a3.textContent = "Dataset";
    			t7 = space();
    			a4 = element("a");
    			a4.textContent = "Lorem";
    			t9 = space();
    			div2 = element("div");
    			a5 = element("a");
    			a5.textContent = "Tutorials";
    			t11 = space();
    			div1 = element("div");
    			a6 = element("a");
    			a6.textContent = "Form";
    			t13 = space();
    			a7 = element("a");
    			a7.textContent = "DogBreed";
    			t15 = space();
    			a8 = element("a");
    			a8.textContent = "TravelChecklistApp";
    			t17 = space();
    			a9 = element("a");
    			a9.textContent = "Scratchpad";
    			t19 = space();
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			a10 = element("a");
    			strong = element("strong");
    			strong.textContent = "Sign up";
    			t21 = space();
    			a11 = element("a");
    			a11.textContent = "Log in";
    			t23 = space();
    			main = element("main");
    			create_component(router.$$.fragment);
    			if (img.src !== (img_src_value = "https://bulma.io/images/bulma-logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "112");
    			attr_dev(img, "height", "28");
    			add_location(img, file, 10, 6, 250);
    			attr_dev(a0, "class", "navbar-item");
    			attr_dev(a0, "href", "https://bulma.io");
    			add_location(a0, file, 9, 4, 196);
    			attr_dev(span0, "aria-hidden", "true");
    			add_location(span0, file, 14, 6, 458);
    			attr_dev(span1, "aria-hidden", "true");
    			add_location(span1, file, 15, 6, 497);
    			attr_dev(span2, "aria-hidden", "true");
    			add_location(span2, file, 16, 6, 536);
    			attr_dev(a1, "role", "button");
    			attr_dev(a1, "class", "navbar-burger");
    			attr_dev(a1, "aria-label", "menu");
    			attr_dev(a1, "aria-expanded", "false");
    			attr_dev(a1, "data-target", "navbarBasicExample");
    			add_location(a1, file, 13, 4, 339);
    			attr_dev(div0, "class", "navbar-brand");
    			add_location(div0, file, 8, 2, 165);
    			attr_dev(a2, "class", "navbar-item");
    			attr_dev(a2, "href", "/");
    			add_location(a2, file, 22, 6, 677);
    			attr_dev(a3, "class", "navbar-item");
    			attr_dev(a3, "href", "#/dataset");
    			add_location(a3, file, 25, 6, 740);
    			attr_dev(a4, "class", "navbar-item");
    			attr_dev(a4, "href", "#/lorem/2");
    			add_location(a4, file, 28, 6, 814);
    			attr_dev(a5, "class", "navbar-link");
    			add_location(a5, file, 32, 8, 946);
    			attr_dev(a6, "class", "navbar-item");
    			attr_dev(a6, "href", "#/tutorial/form");
    			add_location(a6, file, 36, 10, 1051);
    			attr_dev(a7, "class", "navbar-item");
    			attr_dev(a7, "href", "#/tutorial/dogbreed");
    			add_location(a7, file, 39, 10, 1140);
    			attr_dev(a8, "class", "navbar-item");
    			attr_dev(a8, "href", "#/tutorial/travelchecklist");
    			add_location(a8, file, 42, 10, 1237);
    			attr_dev(a9, "class", "navbar-item");
    			attr_dev(a9, "href", "#/tutorial/scratchpad");
    			add_location(a9, file, 45, 10, 1351);
    			attr_dev(div1, "class", "navbar-dropdown");
    			add_location(div1, file, 35, 8, 1011);
    			attr_dev(div2, "class", "navbar-item has-dropdown is-hoverable");
    			add_location(div2, file, 31, 6, 886);
    			attr_dev(div3, "class", "navbar-start");
    			add_location(div3, file, 21, 4, 644);
    			add_location(strong, file, 56, 12, 1625);
    			attr_dev(a10, "class", "button is-primary");
    			add_location(a10, file, 55, 10, 1583);
    			attr_dev(a11, "class", "button is-light");
    			add_location(a11, file, 58, 10, 1675);
    			attr_dev(div4, "class", "buttons");
    			add_location(div4, file, 54, 8, 1551);
    			attr_dev(div5, "class", "navbar-item");
    			add_location(div5, file, 53, 6, 1517);
    			attr_dev(div6, "class", "navbar-end");
    			add_location(div6, file, 52, 4, 1486);
    			attr_dev(div7, "id", "navbarBasicExample");
    			attr_dev(div7, "class", "navbar-menu");
    			add_location(div7, file, 20, 2, 590);
    			attr_dev(nav, "class", "navbar");
    			attr_dev(nav, "role", "navigation");
    			attr_dev(nav, "aria-label", "main navigation");
    			add_location(nav, file, 7, 0, 95);
    			add_location(main, file, 67, 0, 1793);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div0);
    			append_dev(div0, a0);
    			append_dev(a0, img);
    			append_dev(div0, t0);
    			append_dev(div0, a1);
    			append_dev(a1, span0);
    			append_dev(a1, t1);
    			append_dev(a1, span1);
    			append_dev(a1, t2);
    			append_dev(a1, span2);
    			append_dev(nav, t3);
    			append_dev(nav, div7);
    			append_dev(div7, div3);
    			append_dev(div3, a2);
    			append_dev(div3, t5);
    			append_dev(div3, a3);
    			append_dev(div3, t7);
    			append_dev(div3, a4);
    			append_dev(div3, t9);
    			append_dev(div3, div2);
    			append_dev(div2, a5);
    			append_dev(div2, t11);
    			append_dev(div2, div1);
    			append_dev(div1, a6);
    			append_dev(div1, t13);
    			append_dev(div1, a7);
    			append_dev(div1, t15);
    			append_dev(div1, a8);
    			append_dev(div1, t17);
    			append_dev(div1, a9);
    			append_dev(div7, t19);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, a10);
    			append_dev(a10, strong);
    			append_dev(div4, t21);
    			append_dev(div4, a11);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(router, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(main);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Router, routes });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
