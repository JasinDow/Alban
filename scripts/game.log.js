max_log_length = 50;

let log = document.getElementById("log");

function addLogEntry(icon, text){
    while(log.children.length >= max_log_length){
        log.removeChild(log.children[0]);
    }
    var entry = cloneFromTemplate("log-entry-with-icon");

    var iconElement = entry.getElementsByClassName("log-entry-icon")[0];
    iconElement.classList.add("fa-solid");
    iconElement.classList.add(icon);
    
    var textElement = entry.getElementsByClassName("log-entry-text")[0];
    textElement.innerHTML = text;
    
    log.appendChild(entry);
    entry.scrollIntoView();
}

function clearLog(){
    while(log.children.length > 0){
        log.removeChild(log.children[0]);
    }
}

function refreshLog(){}

function addLogActionUnlocked(upgrade){
    addLogEntry("fa-lock-open", `${Language.translate('unlocked')} '${upgrade.name}'`);
}

function addLogMilestoneReached(milestone){
    addLogEntry("fa-flag-checkered", `${Language.translate('reached')} '${milestone.description}'`);
}

function addLogUpgradeUnlocked(upgrade){
    addLogEntry("fa-lock-open", `${Language.translate('unlocked')} '${upgrade.name}'`);
}