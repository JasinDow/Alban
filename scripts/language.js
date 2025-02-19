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

var dictionary = {};