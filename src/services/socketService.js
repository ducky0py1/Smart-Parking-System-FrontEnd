let interval = null;

/**
 * Starts a polling loop. Clears any previous interval first.
 * @param {Function} callback - Called on each tick
 * @param {number} ms - Interval in milliseconds (default 3000)
 */
export function startPolling(callback, ms = 3000) {
  stopPolling();
  interval = setInterval(callback, ms);
}

/** Stops the polling loop */
export function stopPolling() {
  if (interval !== null) {
    clearInterval(interval);
    interval = null;
  }
}
