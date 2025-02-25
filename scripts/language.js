class Language{
    static languageList = [];
    static defaultLanguage;
    static currentLanguage;
    
    static dictionary = {};

    static toggleLanguage(){
        var nextLanguage = Language.languageList.shift();
        Language.languageList.push(nextLanguage);
        Language.setLanguage(nextLanguage);
    }
    
    static setLanguage(newLanguage){
        Language.currentLanguage = newLanguage;
    
        console.log("Language changed to " + Language.currentLanguage);
        document.dispatchEvent(this.languageChangedEvent)
    }
    
    static missingTranslations = [];
    static translate(tag){
        var currentDictionary = Language.dictionary[Language.currentLanguage];
        var translation = currentDictionary[tag];
    
        if(translation != undefined) return translation;
        
        var missingLanguageTag = `${Language.currentLanguage}-${tag}`;
        if(Language.missingTranslations.includes(missingLanguageTag) == false){
            Language.missingTranslations.push(missingLanguageTag);
            console.log("[Language][" + Language.currentLanguage + "] Missing translation for " + tag);
        }
        
        return debugMode ? tag : Language.dictionary[Language.defaultLanguage][tag];
    }
    
    static init(){
        Language.languageList = Object.keys(Language.dictionary);
        if(this.languageList.length == 0){
            console.log("[Language] Missing dictionary");
        }
        Language.defaultLanguage = Language.languageList[0];

        Language.toggleLanguage();
    }

    static languageChangedEvent = new CustomEvent('language:language-changed',{
        bubbles: true,
        cancelable: false,
    });
}
