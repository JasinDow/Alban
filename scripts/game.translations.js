
function toggleLanguage(){
    setLanguage(language == "en" ? "de" : "en");
}

function setLanguage(newLanguage){
    language = newLanguage;

    console.log("Language changed to " + language);
    
    _build_ui();

    update_all_resources();
    update_all_actions();
    update_all_upgrades();
}

function translate(tag){
    var currentDictionary = dictionary[language];
    var translation = currentDictionary[tag];

    if(translation != undefined) return translation;
    
    console.log("[" + language + "] Missing translation for " + tag);
    return dictionary["en"][tag];
}

var language = "en";

var dictionary = {
    "en":{
        settings: "Settings",
        switch_language: "Switch language",
        reset_progress: "Reset progress",

        resource_group_assets : "Assets",
        resource_group_stats : "Attributes",
        resource_group_skills : "Skills",

        resource_money : "Euro",
        resource_time : "Time",
        resource_bottles : "Bottles",
        resource_energy : "Stamina",
        resource_local_knowledge : "Local knowledge",
        
        action_collect_bottles_name : "Collect returnable bottles",
        action_return_bottles_name : "Return bottles",
        action_sit_and_rest_name : "Sit on a bench",
        action_rake_leaves_name : "Rake leaves",
        action_run_name : "Run",
    },
    "de":{
        settings: "Einstellungen",
        switch_language: "Sprache umschalten",
        reset_progress: "Fortschritt zurücksetzen",

        resource_group_assets : "Besitz",
        resource_group_stats : "Attribute",
        resource_group_skills : "Fertigkeiten",
        
        resource_money : "Euro",
        resource_time : "Zeit",
        resource_bottles : "Flaschen",
        resource_energy : "Ausdauer",
        resource_local_knowledge : "Ortskenntnis",
        
        action_collect_bottles_name : "Pfandflaschen sammeln",
        action_return_bottles_name : "Pfandflaschen zurückbringen",
        action_sit_and_rest_name : "Auf einer Bank sitzen",
        action_rake_leaves_name : "Laub harken",
        action_run_name : "Laufen",
    }
};


