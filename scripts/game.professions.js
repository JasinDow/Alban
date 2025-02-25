class Profession{
    id;
    name;
    description;

    constructor(id){
        this.id = id;

        this.init();
    }

    init(){
        resetResources();
        resetActions();
        resetUpgrades();
    }
}

class StreetwiseProfession extends Profession{
    constructor(){
        super('streetwise');
        this.name = "Streetwise";

        resource("energy").max_amount = 10;
        resource("energy").amount = 10;

        unlockAction('beg');
        unlockAction('explore_city');
    }
}

var currentProfession;
