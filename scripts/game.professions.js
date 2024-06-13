class Profession{
    id;
    name;
    description;
    actions = [];
    resources = [];
    upgrades = [];

    constructor(id){
        this.id = id;
    }
}

class StreetwiseProfession extends Profession{
    constructor(){
        super('streetwise');
        this.name = "Streetwise";
        
        this.actions = [
            new SitAndRestAction(),
            new CollectBottlesAction(),
            new ReturnBottlesAction(),
        ]

        this.resources = [
            new MoneyResource(),
            new BottlesResource(),
            new EnergyResource(),
        ]

        this.upgrades = [
            new DebugUnlockAllUpgrade(),
            new PurseUpgrade(),
            new MultitaskingUpgrade(),
            new ShoppingCartUpgrade()
        ]
    }
}

var currentProfession;
