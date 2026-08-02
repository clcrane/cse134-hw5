const themePicker = document.querySelector(".theme-picker");
const themeSelect = document.querySelector("#theme-select");
const root = document.documentElement;

function getSavedTheme() {
    try {
        return localStorage.getItem("theme") || "system";
    } catch {
        return "system";
    }
}

function saveTheme(theme) {
    try {
        localStorage.setItem("theme", theme);
    } catch {
    
    }
}

function applyTheme(theme) {
    if (theme === "light" || theme === "dark") {
        root.dataset.theme = theme;
    } else {
        root.removeAttribute("data-theme");
    }
}

if (themePicker && themeSelect) {
    const savedTheme = getSavedTheme();

    applyTheme(savedTheme);
    themeSelect.value = savedTheme;

    themePicker.hidden = false;

    themeSelect.addEventListener("change", () => {
        const selectedTheme = themeSelect.value;

        applyTheme(selectedTheme);
        saveTheme(selectedTheme);
    });
}