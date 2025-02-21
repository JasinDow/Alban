
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

    get isAsset(){
        return this instanceof Asset;
    }

    get isStat(){
        return this instanceof Stat;
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
        return this.max_amount <= 0 || this.amount >= this.max_amount;
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

class Stat extends Resource{
    constructor(id, {maxAmount, amount}={}){
        super(id);
        this.group = "stats";
        this.max_amount = maxAmount;
        this.amount = amount;
    }
}

class Asset extends Resource{
    constructor(id){
        super(id);
        this.group = "assets"
    }
}

class Skill extends Resource{
    constructor(id){
        super(id);
        this.group = "skills"
        this.max_amount = -1;
    }

    expTable=[0, 2, 4, 8, 16]

    get isMaxed(){
        return this.currentLevel == this.expTable.length - 1;
    }

    get currentXP(){
        return this.amount;
    }

    get neededXP(){
        if(this.isMaxed) return -1;
        return this.expTable[this.currentLevel + 1];
    }

    get currentPercentage() {
        return Math.min(this.currentXP/this.neededXP * 100, 100);
    }

    get currentLevel(){
        for (let index = this.expTable.length - 1; index >= 0; index--) {
            const element = this.expTable[index];
            if(this.amount >= element) return index;
        }
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

var metaResources = [];
function resetMetaResources(){
    metaResources = [
        new Skill("local_knowledge")
    ];
}

var resources = [];
function resetResources(){
    resources = [
        new Stat("energy"),
        new Asset("money"),
        new Asset("bottles"),
    ];
}