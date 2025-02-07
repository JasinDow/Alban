
max_parallel_actions = 1;

function running_actions_amount(){
    var amount = 0;

    actions.forEach(function(a){
        if(a.isRunning){
            amount++;
        }
    });

    return amount;
}

class Action{
    id;
    get name(){return translate('action_' + this.id + '_name');};
    description
    baseCooldown = 2000;
    _unlocked = false;

    lastStartTime;
    isRunning = false;
    timesFinished = 0;

    _fixedConsumption;
    _dynamicConsumption;

    gainOnFinish = false;
    _fixedGain;
    _dynamicGain;
    _dynamicGainDescription;

    milestones;
    get hasMilestones(){return this.milestones != undefined && this.milestones.length > 0;}

    automationUnlocked = false;
    automationActive = false;

    cooldownMultiplier = 1;
    consumeMultiplier = 1;
    gainMultiplier = 1;

    constructor(id){
        this.id = id;
    }

    get cooldown(){ return this.baseCooldown * this.cooldownMultiplier;}

    get current_cooldown() {
        if(this.lastStartTime == undefined) return 0;
        
        var passed_time = new Date().getTime() - this.lastStartTime;
        if(passed_time >= this.cooldown) return 0;

        return this.cooldown - passed_time;
    }

    get current_cooldown_percentage() {
        if(this.lastStartTime == undefined) return 0;
        
        var passed_time = new Date().getTime() - this.lastStartTime;
        if(passed_time >= this.cooldown) return 0;

        return Math.min(passed_time/this.cooldown * 100, 100);
    }

    get consumption(){
        if(this._fixedConsumption != undefined) return this._fixedConsumption;
        if(this._dynamicConsumption != undefined) return this._dynamicConsumption();

        return [];
    }

    isUnlocked(){
        return debug_unlock_all || this._unlocked || this.calculateUnlock();
    }

    calculateUnlock(){
        return false;
    }

    canDo(){
        // Parallel actions
        if(running_actions_amount() >= max_parallel_actions) return false;

        // Cooldown
        if(this.current_cooldown > 0) return false;

        // Can the cost be settled?
        var can = true;
        var action = this;
        this.consumption.forEach(function(ru){
            if(ru.resource.amount < ru.amount * action.consumeMultiplier){
                can = false;
            }
        });
        if(!can) return can;
        
        return true;
    }

    start(){
        var action = this;
        this.consumption.forEach(function(ru){
            ru.resource.amount -= ru.amount * action.consumeMultiplier;
        });
        
        if(this.gainOnFinish == false){
            this.gain();
        }

        this.isRunning = true;
        this.lastStartTime = new Date().getTime();

        // resource("time").amount += this.cooldown / 1000;
    }

    gain(){
        var action = this;
        if(this._fixedGain != null){
            this._fixedGain.forEach(function(ru){
                ru.resource.amount += ru.amount * action.gainMultiplier;
                ru.resource.amount = Math.min(ru.resource.amount, ru.resource.max_amount);
            });
        }
        if (this._dynamicGain != null){
            this._dynamicGain();
        }
    }

    finish(){
        this.isRunning = false;
        this.timesFinished++;
        if(this.hasMilestones){
            this.milestones.forEach((m) => m.check(this))
        }

        if(this.gainOnFinish == true){
            this.gain();
        }

        update_all_actions();
        update_all_resources();

        if(this.automationActive && this.canDo()){
            this.start();
        }
    }
}

class Milestone{
    threshold;
    description;
    alreadyApplied;
    _effect;
    
    constructor(threshold, description, effect){
        this.threshold = threshold;
        this.description = description;
        this._effect = effect;
    }

    check(action){
        if(this.alreadyApplied) return;

        if(action.timesFinished == this.threshold){
            this.applyEffect();
        }
    }

    applyEffect(){
        this._effect();
        this.alreadyApplied = true;
    }
}

// Specific actions

class SitAndRestAction extends Action{
    constructor(){
        super('sit_and_rest');
        this.description = "Listening to the surrounding sounds and feeling the light breeze on your skin makes you feel refreshed.";
        this.gainOnFinish = true;
        this._fixedGain = [
            new ResourceUnit('energy', 1),
            // new ResourceUnit(resource('concentration'), 1)
        ];
        this.baseCooldown = 3000;

        this.calculateUnlock = function(){
            if(resource("energy").amount <= resource("energy").max_amount/2){
                this._unlocked = true;
            }

            return this._unlocked;
        }
    }
}

class CollectBottlesAction extends Action{
    constructor(){
        super('collect_bottles');
        this.gainOnFinish = true;
        this._fixedConsumption = [
            new ResourceUnit('energy', 0.5),
        ]
        this._fixedGain = [
            new ResourceUnit('bottles', 1),
        ];
        this.baseCooldown = 1000;

        this.calculateUnlock = function(){
            this._unlocked = true;

            return this._unlocked;
        }
        var action = this;
        this.milestones = [
            new Milestone(25, "Find a shopping cart", function(){unlockUpgrade('shopping_cart');}),
            new Milestone(50, "Plan your route", function(){action.cooldownMultiplier *= 0.5;}),
            new Milestone(75, "Use both hands", function(){action.gainMultiplier *= 2;}),
            new Milestone(100, "Muscle memory", function(){action.automationUnlocked = true;})
        ]
    }
}

class ReturnBottlesAction extends Action{
    constructor(){
        super('return_bottles');
        this.description = "Return the collected bottles. ";
        this.gainOnFinish = true;
        this._fixedConsumption = [
            new ResourceUnit('bottles', 1),
        ]
        this._fixedGain = [
            new ResourceUnit('money', .25),
        ];
        this.baseCooldown = 1000;

        this.calculateUnlock = function(){
            if(resource("bottles").amount > 0){
                this._unlocked = true;
            }
            

            return this._unlocked;
        }

        var action = this;
        this.milestones = [
            // new Milestone(2, "Plan your route", function(){action.cooldownMultiplier *= 0.5;}),
            new Milestone(50, "Use two deposit machines", function(){
                action.consumeMultiplier *= 2; 
                action.gainMultiplier *= 2;
            }),
            new Milestone(100, "Muscle memory", function(){action.automationUnlocked = true;})
        ]
    }
}

class RakeLeavesAction extends Action{
    constructor(){
        super('rake_leaves');
        this.description = "The gardens in the neighbourhood are full of leaves and an endless source of income. But it is an exhausting activity. ";
        this.gainOnFinish = true;
        this._fixedConsumption = [
            new ResourceUnit('energy', 2),
        ]
        this._fixedGain = [
            new ResourceUnit('money', 1),
        ];
        this.baseCooldown = 3000;
    }
}

class RunAction extends Action{

    energy =  resource('energy');
    get maxEnergyGain() {return Math.round(this.energy.max_amount/10);};

    constructor(unlocked){
        super('run', unlocked);
        this.description = "Maybe you can finish a marathon one day if you are training long enough.";
        this.gainOnFinish = true;
        this._dynamicConsumption = function(){
            return [new ResourceUnit('energy', this.energy.max_amount)];
        };
        this._dynamicGain = function(){
            this.energy.max_amount += this.maxEnergyGain;
        };
        this._dynamicGainDescription = this.energy.name + " capacity + 10% (+" + this.maxEnergyGain +")"
        this.baseCooldown = 8000;
    }
}

class DebugAction extends Action{
    constructor(counter){
        super('debug_action_' + counter);
    }
}

var actions = [];
