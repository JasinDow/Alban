
function toggleLanguage(){
    setLanguage(language == "en" ? "de" : "en");
}

function setLanguage(newLanguage){
    language = newLanguage;

    console.log("Language changed to " + language);
    
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
        resource_group_assets : "Assets",
        resource_group_stats : "Attributes",
        resource_money : "Money",
        resource_bottles : "Bottles",
        resource_energy : "Energy",
    },
    "de":{
        resource_group_assets : "Besitz",
        resource_group_stats : "Attribute",
        resource_money : "Geld",
        resource_bottles : "Flaschen",
        resource_energy : "Energie",
    }
};


