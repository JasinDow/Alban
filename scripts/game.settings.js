
// Settings
var debugMode = true;
var debug_unlock_all = false;
var game_speed = 100;

var theme = 'light';

const settingsButton = document.getElementById('settings-btn');

function setTheme(newTheme){
    console.log("Set theme to " + newTheme);
    theme = newTheme;
    const themeLink = document.getElementById('theme-link');
    themeLink.href = `styles/theme-${theme}.css`;
}

function toggleTheme(){
    if( theme === 'light'){
        setTheme('dark');
    } else {
        setTheme('light');
    }
}

function resetProgress(){
    resetGlobalVariables();
    resetMetaResources();
    switchProfession('streetwise');
    clearLog();
}

setTheme(theme);