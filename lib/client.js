// dsh-refresh client bundle.
//
// Adds a refresh (reload) feature to the DSH desktop web UI:
//   - F5           -> reload the page
//   - Ctrl+F5 / Shift+F5 / Alt+F5 -> hard reload (cache-busted)
//   - Ctrl+R       -> reload the page
//   - Ctrl+Shift+R -> hard reload (cache-busted)
//
// The main process of DSH desktop ships NO reload accelerator in production
// builds (the "Reload Page" menu role is development-gated and bare F5 cannot
// be registered in the shortcuts system), so we bind the keys here, on the
// client side, with a capture-phase listener that runs before any page
// handler. Keys that the app itself claims (native shortcuts) are consumed
// before they ever reach the DOM, so this listener only ever sees unclaimed
// keys — no double handling.
window.__ModuleLoader__.load({
	// The registration id MUST equal the package name: the client-modules
	// registry keys its boot-graph rows by packageName, and a row only counts
	// as "registered" when __ModuleLoader__.load ran with that exact id.
	// (v1.0.0 used the short id "dsh-refresh", which collided/never matched
	// the row id "dsh-refresh-plugin" and crashed with
	// "duplicate factory registration for dsh-refresh".)
	id: "dsh-refresh-plugin",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		const hasNoModifiers = (event) =>
			!event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey;
		const isPlainF5 = (event) => event.code === "F5" && hasNoModifiers(event);
		const isModifiedF5 = (event) => event.code === "F5" && !hasNoModifiers(event);
		const isReloadChord = (event) =>
			event.ctrlKey && !event.altKey && !event.metaKey &&
			(event.key === "r" || event.key === "R");

		/** Soft reload: re-request the current page (browser default). */
		function softReload() {
			window.location.reload();
		}

		/** Hard reload: cache-busted navigation so every asset re-fetches. */
		function hardReload() {
			try {
				const url = new URL(window.location.href);
				url.searchParams.set("_dsh_refresh", String(Date.now()));
				window.location.replace(url.toString());
			} catch (error) {
				// URL parsing failed — fall back to a plain reload.
				window.location.reload();
			}
		}

		exports.inject = [];
		exports.apply = function apply(ctx) {
			try {
				const onKeyDown = (event) => {
					try {
						if (event.defaultPrevented) return; // the app already claimed this key
						if (isPlainF5(event)) {
							event.preventDefault();
							softReload();
						} else if (isModifiedF5(event)) {
							event.preventDefault();
							hardReload();
						} else if (isReloadChord(event)) {
							event.preventDefault();
							if (event.shiftKey) hardReload();
							else softReload();
						}
					} catch (error) {
						console.error("[dsh-refresh] key handler failed", error);
					}
				};
				// Capture phase: run before any target/bubble handler in the page.
				window.addEventListener("keydown", onKeyDown, true);
				return () => window.removeEventListener("keydown", onKeyDown, true);
			} catch (error) {
				console.error("[dsh-refresh] apply failed", error);
			}
		};

		return module.exports;
	},
});
