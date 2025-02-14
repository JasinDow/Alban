
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

    get isSkill(){
        return this instanceof Skill;
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

    maxReached(){
        // console.log(this.id + ": " + this.amount + " | " + this.max_amount);
        return this.max_amount <= 0|| this.amount >= this.max_amount;
    }
}

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

class Skill extends Resource{

    constructor(id){
        super(id);
        this.group = "skills"
        this.max_amount = -1;
    }

    calculateLevel(){
        if(this.amount >= 16){
            return 4;
        }
        if(this.amount >= 8){
            return 3;
        }
        if(this.amount >= 4){
            return 2;
        }
        if(this.amount >= 2){
            return 1;
        }
        return 0;
    }
}

class LocalKnowledgeResource extends Skill{
    constructor(){
        super('local_knowledge');
    }
}

class MoneyResource extends Resource{
    constructor(){
        super('money');
        // this.name = "Money";
        this.group = "assets"
    }
}
class TimeResource extends Resource{
    constructor(){
        super('time');
        // this.name = "Time";
        this.group = "assets"
    }
}
class BottlesResource extends Resource{
    constructor(){
        super('bottles');
        // this.name = "Bottles";
        this.group = "assets";
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
        // this.name = "Concentration";
        this.group = "stats";
        this.amount = this.max_amount;
    }
}

function get_resource_groups(){
    return resources.map((x) => x.group).filter((v,i,a) => a.indexOf(v) === i); 
}

function get_resources_by_group(group){
    return resources.filter((x) => x.group == group); 
}

function resource(id){
    return resources.find(x => x.id == id);
}

function resetMetaResources(){
    metaResources = [new LocalKnowledgeResource()];
}

var metaResources = [];
var resources = [];

