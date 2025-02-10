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

function addLogMilestone(milestone){
    addLogEntry("Reached milestone '" + milestone.description);
}