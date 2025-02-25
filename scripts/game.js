//
// Update UI
//

// Resources

function clearUI(){
    document.getElementById("resources").innerHTML = null;
    actionTable.innerHTML = null;
    upgradeTable.innerHTML = null;
}

function build_resource_group_ui_element(group){
    if(document.getElementById(group + "_header") != null) return;

    var row = cloneFromTemplate("resource-group-row");
    row.id = group + "_header";
    row.getElementsByClassName("resource-group-name")[0].id = group + "_name"
    
    document.getElementById("resources").appendChild(row);
}

function build_resource_ui_element(resource){
    if( document.getElementById("resource_" + resource.id) != null) return;

    var row = cloneFromTemplate("resource-row");
    row.id = "resource_" + resource.id;
    row.getElementsByClassName("resource-name")[0].id = resource.id + "_name";
    row.getElementsByClassName("resource-amount")[0].id = resource.id + "_amount";
    // row.getElementsByClassName("resource-max-amount")[0].id = resource.id + "_max_amount";
    document.getElementById("resources").appendChild(row);
}

function update_all_resources(){
    get_resource_groups().forEach(update_resource_group);
    resources.forEach(update_single_resource);
}

function update_resource_group(group) {
    hide(document.getElementById(group + "_header"), !get_resources_by_group(group).some((res)=>res.isUnlocked()));
    document.getElementById(group + "_name").innerHTML =  Language.translate("resource_group_" + group);
}

function update_single_resource(res) {
    hide(document.getElementById("resource_" + res.id), !res.isUnlocked());

    document.getElementById(res.id + "_name").innerHTML = Language.translate("resource_" + res.id);
    if(res.isSkill){
        document.getElementById(res.id + "_amount").innerHTML = res.isMaxed ? Language.translate("skill_maxed") : res.currentXP + " | " + res.neededXP;

        // document.getElementById(res.id + "_name").innerHTML += ` ${Language.translate("skill_level")} ${res.currentLevel}`;
        document.getElementById(res.id + "_name").innerHTML += ` ${res.currentLevel}`;
    }else{
        document.getElementById(res.id + "_amount").innerHTML = Math.round((res.amount + Number.EPSILON) * 100) / 100;// res.amount.toFixed(2);
    }   
    if(res.max_amount >= 0){
        document.getElementById(res.id + "_amount").innerHTML += " | " + res.max_amount;
    }
    // document.getElementById(res.id + "_max_amount").innerHTML = res.max_amount;
}

// Actions

let actionTable = document.getElementById("actions");

function build_action_ui_element(action){
    if(document.getElementById("do_" + action.id) != null) return;

    var row = cloneFromTemplate("action-template");
    var button = row.getElementsByClassName("do")[0];
    button.id = "do_" + action.id;
    button.onclick = function(){
        if(!action.canDo) return;
        action.start();
    };

    var checkbox = row.getElementsByClassName("automation-checkbox")[0];
    checkbox.id = "automation-checkbox-" + action.id;
    checkbox.onclick = function(){
        action.automationActive = !action.automationActive;
    };

    actionTable.appendChild(row);
}

function update_all_actions(){
    actions.forEach(update_single_action);
    document.getElementById("running-actions").hidden = max_parallel_actions <= 1;
    document.getElementById("current-running-actions").innerHTML = running_actions_amount();
    document.getElementById("max-running-actions").innerHTML = max_parallel_actions;
}

function update_single_action(action) {
    action.update();

    var e = document.getElementById("do_" + action.id);
    
    var label = e.getElementsByClassName("label")[0];
    var bar = e.getElementsByClassName("progress-bar")[0];

    var checkbox = document.getElementById("automation-checkbox-" + action.id);
    checkbox.hidden = action.automationUnlocked == false;

    e.hidden = !action.isUnlocked;
    e.disabled = !action.canDo;
    label.innerHTML = action.name;

    bar.style.width = action.current_cooldown_percentage + "%";

    // Tooltip
    e.parentNode.getElementsByClassName("tooltip-title")[0].innerHTML = action.name;
    e.parentNode.getElementsByClassName("tooltip-description")[0].innerHTML = action.description;
    // Consumption
    set_tooltip_consumption(e, action.consumption);
    // Gain
    set_tooltip_gain(e, action);
    // Duration
    e.parentNode.getElementsByClassName("tooltip-time-remaining")[0].innerHTML = action.isRunning ? formatDuration(action.current_cooldown) : formatDuration(action.cooldown);
    // Times finished
    e.parentNode.getElementsByClassName("times-finished")[0].innerHTML = action.timesFinished;
    // Milestones
    if(action.hasMilestones){
        e.parentNode.getElementsByClassName("tooltip-milestones")[0].hidden = false
        e.parentNode.getElementsByClassName("tooltip-milestones-content")[0].innerHTML = null;
        action.milestones.forEach((milestone) => {
            var row = cloneFromTemplate("tooltip-milestone-row-template");
            row.getElementsByClassName("reached")[0].innerHTML = milestone.alreadyApplied ? "✓" : "";
            row.getElementsByClassName("threshold")[0].innerHTML = milestone.threshold;
            row.getElementsByClassName("description")[0].innerHTML = milestone.alreadyApplied ? milestone.description : "?????";
            e.parentNode.getElementsByClassName("tooltip-milestones-content")[0].appendChild(row);
        });
    }
    else{
        e.parentNode.getElementsByClassName("tooltip-milestones")[0].hidden = true       
    }
    
    
}

// Upgrades

let upgradeTable = document.getElementById("upgrades");

function build_upgrade_ui_element(upgrade){
    if(document.getElementById("upgrade_" + upgrade.id) != null) return;

    var item = cloneFromTemplate("upgrade-template");
    var button = item.getElementsByClassName("do")[0];
    button.id = "upgrade_" + upgrade.id;
    button.onclick = function(){
        if(!upgrade.canBuy()) return;
        upgrade.applyEffect();

        update_all_resources();
        update_all_actions();
        update_all_upgrades();
    };

    upgradeTable.appendChild(item);
}

function update_all_upgrades(){
    upgrades.forEach(update_single_upgrade);
}

function update_single_upgrade(upgrade) {
    var e = document.getElementById("upgrade_" + upgrade.id);
    var label = e.getElementsByClassName("label")[0];

    e.hidden = !upgrade.isUnlocked || upgrade.alreadyApplied;
    e.disabled = !upgrade.canBuy();
    label.innerHTML = upgrade.name;

    // Tooltip
    e.parentNode.getElementsByClassName("tooltip-title")[0].innerHTML = upgrade.name;
    e.parentNode.getElementsByClassName("tooltip-description")[0].innerHTML = upgrade.description;
    // Consumption
    set_tooltip_consumption(e, upgrade.costs);
}

//
// General
//

function set_tooltip_consumption(e, cost_list){
    if(cost_list.length > 0){
        e.parentNode.getElementsByClassName("tooltip-consumption-content")[0].innerHTML = null;
        cost_list.forEach(function(c){
            var row = cloneFromTemplate("tooltip-consumption-row-template");
            row.getElementsByClassName("needed-amount")[0].innerHTML = c.amount;
            row.getElementsByClassName("resource")[0].innerHTML = Language.translate("resource_" + c.resource.id);
            var availabeAmount = row.getElementsByClassName("available-amount")[0];
            var difference = c.resource.amount - c.amount;

            availabeAmount.classList = [];
            if(difference == 0){
                availabeAmount.innerHTML = "±" + difference;
            }
            if(difference > 0){
                availabeAmount.classList = ["sufficient"];
                availabeAmount.innerHTML = "+" + difference;
            }
            if(difference <  0){
                availabeAmount.classList = ["insufficient"];
                availabeAmount.innerHTML = difference;
            }
            e.parentNode.getElementsByClassName("tooltip-consumption-content")[0].appendChild(row);
        });
        e.parentNode.getElementsByClassName("tooltip-consumption")[0].hidden = false;
    }
    else{
        e.parentNode.getElementsByClassName("tooltip-consumption")[0].hidden = true;
    }
}

function set_tooltip_gain(e, action){
    e.parentNode.getElementsByClassName("tooltip-gain-content")[0].innerHTML = null;

    action.gain.forEach(function(c){
        var row = cloneFromTemplate("tooltip-gain-row-template");
        row.getElementsByClassName("gain-amount")[0].innerHTML = c.amount;
        row.getElementsByClassName("resource")[0].innerHTML = Language.translate("resource_" + c.resource.id);
        e.parentNode.getElementsByClassName("tooltip-gain-content")[0].appendChild(row);
    });
}

//
// Init 
//

function _build_ui(){
    clearUI();

    get_resource_groups().forEach((g) => {
        build_resource_group_ui_element(g);
        get_resources_by_group(g).forEach((r) => build_resource_ui_element(r));
    });

    actions.forEach(build_action_ui_element);

    upgrades.forEach(build_upgrade_ui_element);

    update_all_resources();

    document.querySelectorAll("#actions .tooltip-container").forEach(function(tooltip){
        tooltip.appendChild(cloneFromTemplate("action-tooltip"));   
        tooltip.addEventListener("mousemove", position_tooltip); 
    })

    document.querySelectorAll("#upgrades .tooltip-container").forEach(function(tooltip){
        tooltip.appendChild(cloneFromTemplate("upgrade-tooltip"));   
        tooltip.addEventListener("mousemove", position_tooltip); 
    })

    var translatables = document.querySelectorAll("[data-translate]");
    translatables.forEach((t) => {
        t.innerHTML = Language.translate(t.dataset.translate);
    });
}

function resetGlobalVariables(){
    debug_unlock_all = false;
    max_parallel_actions = 1;
}

function switchProfession(id){
    currentProfession = new StreetwiseProfession();
    console.log("Profession changed to " + currentProfession.name);
    
    for (const metaResource of metaResources) {
        resources.push(metaResource);
    }

    resetGlobalVariables();
    clearLog();
    _build_ui();
}

function openSettings(){
    document.getElementById("settings-dialog").showModal();
}

function closeSettings(){
    document.getElementById("settings-dialog").close();
}

function showStory(story){
    document.getElementById("story-dialog").getElementsByClassName("story-content")[0].innerHTML = story;
    document.getElementById("story-dialog").style.display = "block";
}

function closeStory(){
    document.getElementById("story-dialog").close();
}

function init(){

    Language.init();

    document.addEventListener('language:language-changed', (event) => {
        _build_ui();
        clearLog();
    })

    onmousemove = function(e){
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

    // Settings dialog
    var modal = document.getElementById("settings-dialog");
    document.getElementById("settingsBtn").onclick = function() {
        modal.style.display = "block";
    }
    document.getElementById("settingsCloseBtn").onclick = function() {
        modal.style.display = "none";
    }

    // Story dialog
    var storyModal = document.getElementById("story-dialog");
    document.getElementById("storyCloseBtn").onclick = function() {
        storyModal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
        if (event.target == storyModal) {
            storyModal.style.display = "none";
        }
    }

    resetProgress();

    _build_ui();
}

function isPlayerStuck(){
    var isStuck = true;

    for (const a of actions) {
        if(a.isRunning || (a._unlocked && a.canDo)){
            isStuck = false;
            break;
        }
    }

    for (const u of upgrades) {
        if(u._unlocked && u.alreadyApplied == false && u.canBuy()){
            isStuck = false;
            break;
        }  
    }

    return isStuck;
}

document.addEventListener("DOMContentLoaded", init);

//
// Game Loop
//

window.setInterval(function(){
    update_all_resources();
    update_all_actions();
    update_all_upgrades();
}, 100);