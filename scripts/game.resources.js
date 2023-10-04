
class Resource{
    id;
    amount = 0;
    max_amount = 10;
    name;
    group;

    _unlocked = false;

    constructor(id){
        this.id = id;
    }

    isUnlocked(){
        return debug_unlock_all || this._unlocked || this.calculateUnlock();
    }

    calculateUnlock(){
        if(this.amount > 0){
            this._unlocked = true;
        }

        return this._unlocked;
    }
}

class MoneyResource extends Resource{
    constructor(){
        super('money');
        this.name = "Money";
        this.group = "assets"
    }
}

class BottlesResource extends Resource{
    constructor(){
        super('bottles');
        this.name = "Bottles";
        this.group = "assets";
    }
}

class TimeResource extends Resource{
    constructor(){
        super('time');
        this.name = "Time";
        this.group = "assets";
        this.max_amount = 60;
    }
}

class EnergyResource extends Resource{
    constructor(){
        super('energy');
        this.name = "Energy";
        this.group = "stats";
        this.amount = this.max_amount;
    }
}

class ConcentrationResource extends Resource{
    constructor(){
        super('concentration');
        this.name = "Concentration";
        this.group = "stats";
        this.amount = this.max_amount;
    }
}

class DebugResource extends Resource{
    constructor(counter){
        super('debug_resource_' + counter);
        this.name = "Debug " + counter;
        this.group = "stats";
        this.amount = this.max_amount;
    }
}

// var resources = [
//     new MoneyResource(),
//     new BottlesResource(),
//     // new TimeResource(),
//     new EnergyResource(),
//     // new ConcentrationResource()
// ]

function get_resource_groups(){
    return resources.map((x) => x.group).filter((v,i,a) => a.indexOf(v) === i); 
}

function get_resources_by_group(group){
    return resources.filter((x) => x.group == group); 
}

function resource(id){
    
    return resources.find(x => x.id == id);
}

var resources = [];

class ResourceUnit{
    constructor(resourceId, amount){
        this.resourceId = resourceId;
        this.amount = amount;
    }

    get resource(){
        
        return resource(this.resourceId);
    }

    get percentageReached(){
        return this.resource.amount/this.amount;
    }
}