max_log_length = 50;

let log = document.getElementById("log");

function addLogEntry(text){
    while(log.children.length >= max_log_length){
        log.removeChild(log.children[0]);
    }
    var entry = cloneFromTemplate("log-entry");
    entry.innerHTML = text;
    log.appendChild(entry);
    entry.scrollIntoView();
}

function clearLog(){
    while(log.children.length > 0){
        log.removeChild(log.children[0]);
    }
}

function addLogActionUnlocked(upgrade){
    addLogEntry("Unlocked action '" + upgrade.name);
}

function addLogMilestoneReached(milestone){
    addLogEntry("Reached milestone '" + milestone.description);
}

function addLogUpgradeUnlocked(upgrade){
    addLogEntry("Unlocked upgrade '" + upgrade.name);
}