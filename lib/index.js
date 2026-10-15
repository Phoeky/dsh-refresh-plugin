"use strict";

/**
 * dsh-refresh host half.
 *
 * The actual feature lives in the client half (lib/client.js): it binds F5
 * and Ctrl+R to reload the app page, because production DSH desktop builds
 * ship no reload accelerator (the "Reload Page" menu item is development
 * gated). This host plugin only mounts the loader entry so that the
 * client-modules scan registers the bundle's client half in __DSH_BOOT__.
 */
module.exports = {
  apply() {
    // nothing to do on the host side; the client half carries the feature
  },
};
