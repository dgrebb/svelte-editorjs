/** @returns {void} */
function noop() {}

/** @returns {boolean} */
function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
}

const subscriber_queue = [];

/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 *
 * https://svelte.dev/docs/svelte-store#writable
 * @template T
 * @param {T} [value] initial value
 * @param {import('./public.js').StartStopNotifier<T>} [start]
 * @returns {import('./public.js').Writable<T>}
 */
function writable(value, start = noop) {
	/** @type {import('./public.js').Unsubscriber} */
	let stop;
	/** @type {Set<import('./private.js').SubscribeInvalidateTuple<T>>} */
	const subscribers = new Set();
	/** @param {T} new_value
	 * @returns {void}
	 */
	function set(new_value) {
		if (safe_not_equal(value, new_value)) {
			value = new_value;
			if (stop) {
				// store is ready
				const run_queue = !subscriber_queue.length;
				for (const subscriber of subscribers) {
					subscriber[1]();
					subscriber_queue.push(subscriber, value);
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

	/**
	 * @param {import('./public.js').Updater<T>} fn
	 * @returns {void}
	 */
	function update(fn) {
		set(fn(value));
	}

	/**
	 * @param {import('./public.js').Subscriber<T>} run
	 * @param {import('./private.js').Invalidator<T>} [invalidate]
	 * @returns {import('./public.js').Unsubscriber}
	 */
	function subscribe(run, invalidate = noop) {
		/** @type {import('./private.js').SubscribeInvalidateTuple<T>} */
		const subscriber = [run, invalidate];
		subscribers.add(subscriber);
		if (subscribers.size === 1) {
			stop = start(set, update) || noop;
		}
		run(value);
		return () => {
			subscribers.delete(subscriber);
			if (subscribers.size === 0 && stop) {
				stop();
				stop = null;
			}
		};
	}
	return { set, update, subscribe };
}

function createEditor(configuration = {}) {
    var _a;
    const initialData = (_a = configuration.data) !== null && _a !== void 0 ? _a : {
        time: new Date().getTime(),
        blocks: [],
    };
    let editorInstance;
    const { subscribe: subscribeEditor, set: setEditor } = writable({});
    const { subscribe: subscribeIsReady, set: setIsReady } = writable(false);
    const { subscribe: subscribeData, set: setData, update: updateData, } = writable(initialData);
    let newSetData = (data) => {
        updateData((oldData) => (Object.assign(Object.assign({}, oldData), data)));
        editorInstance === null || editorInstance === void 0 ? void 0 : editorInstance.render(data);
    };
    function editor(node, parameters = {}) {
        async function setup() {
            if (typeof window === 'undefined')
                return;
            const Editor = await import('./editor-be7b0f7a.js').then(function (n) { return n.e; });
            const instance = new Editor.default(Object.assign(Object.assign(Object.assign({}, configuration), parameters), { holder: node }));
            instance.isReady
                .then(() => {
                editorInstance = instance;
                if (parameters.data)
                    setData(parameters.data);
                const save = async () => {
                    const data = await instance.save();
                    setData(data);
                };
                const clear = async () => {
                    instance.clear();
                    updateData((data) => (Object.assign(Object.assign({}, data), { time: new Date().getTime(), blocks: [] })));
                };
                const render = async (data) => {
                    instance.render(data);
                };
                setEditor({
                    instance,
                    save,
                    render,
                    clear,
                });
                setIsReady(true);
            })
                .catch(console.error);
        }
        setup();
        return {
            destroy() {
                editorInstance === null || editorInstance === void 0 ? void 0 : editorInstance.destroy();
            },
        };
    }
    editor.subscribe = subscribeEditor;
    return {
        editor,
        isReady: { subscribe: subscribeIsReady },
        data: { subscribe: subscribeData, set: newSetData, update: updateData },
    };
}

export { createEditor };
