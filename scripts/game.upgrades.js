var debug_unlock_all = false;


class Upgrade{
    id;
    name;
    description;
    costs = [];
    _unlocked;
    alreadyApplied;

    constructor(id){
        this.id = id;
    }

    get isUnlocked() {
        return debug_unlock_all || this._unlocked || this.calculateIsUnlocked();
    }

    calculateIsUnlocked(){
        return false;
    }

    canBuy(){
        var can = true;
        this.costs.forEach(function(ru){
            if(ru.resource.amount < ru.amount){
                can = false;
            }
        });
        return !this.alreadyApplied && can;
    }

    buy(){
        this.costs.forEach(function(ru){
            ru.resource.amount -= ru.amount;
        });

        this.applyEffect();
    }

    applyEffect(){
        this.alreadyApplied = true;
    }
}

class PurseUpgrade extends Upgrade{
    constructor(){
        super('purse');
        this.name = "Purse";
        this.description = "Doubles your money capacity";
        this.costs = [
            new ResourceUnit('money', 10),
        ]
    }

    calculateIsUnlocked = function(){
        var returnValue = true;
        this.costs.forEach(function(ru){
            if(ru.percentageReached < .5){
                returnValue = false;
            }
        });
        if(returnValue){
            this._unlocked = true;
        }

        return this._unlocked;
    }

    applyEffect(){
        resource('money').max_amount *= 2;

        this.alreadyApplied = true;
    };
}

class MultitaskingUpgrade extends Upgrade{
    constructor(){
        super('multitasking');
        this.name = "Multitasking";
        this.description = "You can do one thing more simultanously.";
    }

    applyEffect(){
        max_parallel_actions += 1;

        this.alreadyApplied = true;
    };
}

class DebugUnlockAllUpgrade extends Upgrade{
    constructor(){
        super('debug_unlock_all');
        this.name = "Debug: Unlock all";
        this.description = "Unlocks all resources, actions and upgrades";
    }

    calculateIsUnlocked = function(){
        this._unlocked = true;

        return this._unlocked;
    }

    applyEffect(){
        debug_unlock_all = true;
        this.alreadyApplied = true;
    };
}

var upgrades = []

// var upgrades = [
//     new DebugUnlockAllUpgrade(),
//     new PurseUpgrade(),
//     new MultitaskingUpgrade()
// ]