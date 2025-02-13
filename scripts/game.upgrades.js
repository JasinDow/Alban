


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

class SecondHandShopUpgrade extends Upgrade{
    constructor(){
        super('second_hand_shop');
        this.name = "Second-hand shop";
        this.description = "...";
    }

    calculateIsUnlocked = function(){
        if(resource('local_knowledge').calculateLevel() > 0){
            unlockUpgrade(this.id);
        }

        return this._unlocked;
    }

    applyEffect(){
        unlockUpgrade('purse')
        super.applyEffect();
    };
}

class PurseUpgrade extends Upgrade{
    constructor(){
        super('purse');
        this.name = "Wallet";
        this.description = "Doubles your money capacity";
        this.costs = [
            new ResourceUnit('money', 5),
        ]
    }

    applyEffect(){
        resource('money').max_amount *= 2;
        super.applyEffect();
    };
}

class ShoppingCartUpgrade extends Upgrade{
    constructor(){
        super('shopping_cart');
        this.name = "Shopping cart";
        this.description = "This common cart made of metal allows you to carry up to 100 bottles with you.";
    }

    applyEffect(){
        resource('bottles').max_amount = 50;
        super.applyEffect();
    };
}

class PlanYourRouteUpgrade extends Upgrade{
    constructor(){
        super('plan_your_route');
        this.name = "Plan your route";
        this.description = "By planning your route efficiently you finish collecting the bottles twice as fast.";
    }

    applyEffect(){
        action('collect_bottles').cooldownMultiplier *= 0.5;
        super.applyEffect();
    };
}

class ScienceLabUpgrade extends Upgrade{
    constructor(){
        super('science_lab');
        this.name = "Science lab";
        this.description = "...";
    }

    calculateIsUnlocked = function(){
        var isStuck = true;
        if(isStuck){
            unlockUpgrade(this.id);
        }

        return this._unlocked;
    }
}

class PrestigeUpgrade extends Upgrade{
    constructor(){
        super('prestige');
        this.name = "Prestige";
        this.description = "...";
    }

    calculateIsUnlocked = function(){
        if(upgrade('science_lab').alreadyApplied){
            unlockUpgrade(this.id);
        }

        return this._unlocked;
    }

    applyEffect(){
        switchProfession(currentProfession.id);
        // super.applyEffect();
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
        super.applyEffect();
        // this.alreadyApplied = true;
    };
}

class DebugUnlockAllUpgrade extends Upgrade{
    constructor(){
        super('debug_unlock_all');
        this.name = "Debug: Unlock everything";
        this.description = "Unlocks all resources, actions and upgrades";
    }

    calculateIsUnlocked = function(){
        unlockUpgrade(this.id);

        return this._unlocked;
    }

    applyEffect(){
        debug_unlock_all = true;
        super.applyEffect();
        // this.alreadyApplied = true;
    };
}

function unlockUpgrade(id){
    upgrades.forEach(function(u){
        if(u.id == id){
            addLogUpgradeUnlocked(u);
            u._unlocked = true;
        }
    });
}

function upgrade(id){
    return upgrades.find(x => x.id == id);
}

var upgrades = []
