/**
 * Dev Mode Toggle
 *
 * localStorage-based flag that switches the entire app between
 * dummy (mock) data and real Supabase data.
 */

export function isDevMode(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("soiree_dev_mode") === "true";
}

export function enableDevMode() {
    if (typeof window !== "undefined") {
        localStorage.setItem("soiree_dev_mode", "true");
        window.location.reload();
    }
}

export function disableDevMode() {
    if (typeof window !== "undefined") {
        localStorage.setItem("soiree_dev_mode", "false");
        window.location.reload();
    }
}

export function toggleDevMode() {
    if (isDevMode()) {
        disableDevMode();
    } else {
        enableDevMode();
    }
}
