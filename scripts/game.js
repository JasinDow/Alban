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
    row.getElementsByClassName("resource-max-amount")[0].id = resource.id + "_max_amount";
    document.getElementById("resources").appendChild(row);
}

function update_all_resources(){
    get_resource_groups().forEach(update_resource_group);
    resources.forEach(update_single_resource);
}

function update_resource_group(group) {
    document.getElementById(group + "_header").hidden = !get_resources_by_group(group).some((res)=>res.isUnlocked());
    document.getElementById(group + "_name").innerHTML =  translate("resource_group_" + group);
}

function update_single_resource(res) {
    document.getElementById("resource_" + res.id).hidden = !res.isUnlocked();

    document.getElementById(res.id + "_name").innerHTML = translate("resource_" + res.id);
    document.getElementById(res.id + "_amount").innerHTML = res.amount;
    document.getElementById(res.id + "_max_amount").innerHTML = res.max_amount;
}

// Actions

let actionTable = document.getElementById("actions");

function build_action_ui_element(action){
    if(document.getElementById("do_" + action.id) != null) return;

    var row = cloneFromTemplate("action-template");
    var button = row.getElementsByClassName("do")[0];
    button.id = "do_" + action.id;
    button.onclick = function(){
        if(!action.canDo()) return;
        action.start();

        update_all_resources();
        update_all_actions();
        update_all_upgrades();
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
    var e = document.getElementById("do_" + action.id);
    
    var label = e.getElementsByClassName("label")[0];
    var bar = e.getElementsByClassName("progress-bar")[0];

    var checkbox = document.getElementById("automation-checkbox-" + action.id);
    checkbox.hidden = action.automationUnlocked == false;

    e.hidden = !action.isUnlocked();
    e.disabled = !action.canDo();
    label.innerHTML = action.name;

    bar.style.width = action.current_cooldown_percentage + "%";
    if(action.current_cooldown <= 0 && action.isRunning){
        action.finish();
    }

    if(action.isRunning == false && action.automationActive && action.canDo()){
        action.start();
    }


    // Tooltip
    e.parentNode.getElementsByClassName("tooltip-title")[0].innerHTML = action.name;
    e.parentNode.getElementsByClassName("tooltip-description")[0].innerHTML = action.description ?? "";
    // Consumption
    set_tooltip_consumption(e, action, action.consumption);
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
    e.parentNode.getElementsByClassName("tooltip-description")[0].innerHTML = upgrade.description ?? "";
    // Consumption
    set_tooltip_consumption(e, null, upgrade.costs);
}

//
// General
//

function set_tooltip_consumption(e, action, cost_list){
    if(cost_list.length > 0){
        e.parentNode.getElementsByClassName("tooltip-consumption-content")[0].innerHTML = null;
        cost_list.forEach(function(c){
            var row = cloneFromTemplate("tooltip-consumption-row-template");
            row.getElementsByClassName("needed-amount")[0].innerHTML = c.amount * (action != null ? action.consumeMultiplier : 1);
            row.getElementsByClassName("resource")[0].innerHTML = translate("resource_" + c.resource.id);
            var availabeAmount = row.getElementsByClassName("available-amount")[0];
            var difference = c.resource.amount - c.amount * (action != null ? action.consumeMultiplier : 1);

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
    if(action._dynamicGainDescription != undefined){
        var row = cloneFromTemplate("tooltip-gain-row-template");
        row.getElementsByClassName("resource")[0].innerHTML = action._dynamicGainDescription;
        e.parentNode.getElementsByClassName("tooltip-gain-content")[0].appendChild(row);
    }
    else{
        action._fixedGain.forEach(function(c){
            var row = cloneFromTemplate("tooltip-gain-row-template");
            row.getElementsByClassName("gain-amount")[0].innerHTML = c.amount * action.gainMultiplier;
            row.getElementsByClassName("resource")[0].innerHTML = translate("resource_" + c.resource.id);
            e.parentNode.getElementsByClassName("tooltip-gain-content")[0].appendChild(row);
        });
    }
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
        tooltip.addEventListener("mouseover", position_tooltip); 
    })

    document.querySelectorAll("#upgrades .tooltip-container").forEach(function(tooltip){
        tooltip.appendChild(cloneFromTemplate("upgrade-tooltip"));   
        tooltip.addEventListener("mouseover", position_tooltip); 
    })
}

function resetGlobalVariables(){
    debug_unlock_all = false;
    max_parallel_actions = 1;
}

function switchProfession(id){
    currentProfession = new StreetwiseProfession();

    console.log("Profession changed to " + currentProfession.name);

    resources = currentProfession.resources;
    actions = currentProfession.actions;
    upgrades = currentProfession.upgrades;

    resetGlobalVariables();
    _build_ui();
}

function openSettings(){
    document.getElementById("settings-dialog").showModal();
}

function closeSettings(){
    document.getElementById("settings-dialog").close();
}

function init(){

    // Settings dialog
    var modal = document.getElementById("settings-dialog");
    var openBtn = document.getElementById("settingsBtn");
    var closeBtn = document.getElementById("settingsCloseBtn");
    openBtn.onclick = function() {
        modal.style.display = "block";
    }
    closeBtn.onclick = function() {
        modal.style.display = "none";
    }
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    resetGlobalVariables();
    switchProfession("streetwise");

    _build_ui();
}

document.addEventListener("DOMContentLoaded", init);

//
// Game Loop
//

window.setInterval(function(){
    update_all_actions();
    update_all_upgrades();
}, 100);