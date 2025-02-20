
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
    get description(){return translate('action_' + this.id + '_description');};
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

    milestones = [];
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
        
        var passed_time = (new Date().getTime() - this.lastStartTime) * game_speed;
        if(passed_time >= this.cooldown) return 0;

        return this.cooldown - passed_time;
    }

    get current_cooldown_percentage() {
        if(this.lastStartTime == undefined) return 0;
        
        var passed_time = (new Date().getTime() - this.lastStartTime) * game_speed;
        if(passed_time >= this.cooldown) return 0;

        return Math.min(passed_time/this.cooldown * 100, 100);
    }

    get consumption(){
        if(this._fixedConsumption != undefined) return this._fixedConsumption;
        if(this._dynamicConsumption != undefined) return this._dynamicConsumption();

        return [];
    }

    get calculatedGain(){
        if(this._fixedGain != undefined) return this._fixedGain;
        if(this._dynamicGain != undefined) return this._dynamicGain();

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
        var canConsume = true;
        var action = this;
        this.consumption.forEach(function(ru){
            if(ru.resource.amount < ru.amount * action.consumeMultiplier){
                canConsume = false;
            }
        });
        
        
        // Is there any gain at all?
        var canGain = false;
        this.calculatedGain.forEach(function(ru){
            if(!ru.resource.maxReached()){
                canGain = true;
            }
        });
        

        return canConsume && canGain;
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
                ru.resource.amount += ru.amount * (ru.resource.isSkill ? 1 : action.gainMultiplier);
                if(ru.resource.max_amount > -1){
                    ru.resource.amount = Math.min(ru.resource.amount, ru.resource.max_amount);
                }
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

    addMilestone(milestoneRequirement, upgrade){
        if(this.milestones.some((element, index, array)=>element.threshold == milestoneRequirement.threshold)){
            return;
        }
        this.milestones.push(new Milestone(milestoneRequirement.threshold, translate("upgrade_" + upgrade.id + "_name")));
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
            addLogMilestoneReached(this);
            this.applyEffect();
        }
    }

    applyEffect(){
        if(this._effect != undefined){
            this._effect();
        }
        this.alreadyApplied = true;
    }
}

// Specific actions

class BegAction extends Action{
    constructor(){
        super('beg');
        this.gainOnFinish = true;
        this._fixedGain = [
            new ResourceUnit('energy', 1),
            new ResourceUnit('money', 0.1),
        ];
        this.baseCooldown = 3000;

        this.calculateUnlock = function(){
            unlockAction(this.id);

            return this._unlocked;
        }
    }
}

class SitAndRestAction extends Action{
    constructor(){
        super('sit_and_rest');
        this.gainOnFinish = true;
        this._fixedGain = [
            new ResourceUnit('energy', 1),
        ];
        this.baseCooldown = 3000;

        this.calculateUnlock = function(){
            if(resource("energy").amount <= resource("energy").max_amount/2){
                unlockAction(this.id);
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
            new ResourceUnit('local_knowledge', 1),
        ];
        this.baseCooldown = 1000;

        this.calculateUnlock = function(){
            unlockAction(this.id);

            return this._unlocked;
        }
    }
}

class ReturnBottlesAction extends Action{
    constructor(){
        super('return_bottles');
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
                unlockAction(this.id);
            }

            return this._unlocked;
        }
    }
}

class RakeLeavesAction extends Action{
    constructor(){
        super('rake_leaves');
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

function unlockAction(id){
    actions.forEach(function(a){
        if(a.id == id){
            addLogActionUnlocked(a);
            a._unlocked = true;
        }
    });
}

function action(id){
    return actions.find(x => x.id == id);
}

var actions = [];

function resetActions(){
    actions = [
        new BegAction(),
        new CollectBottlesAction(),
        new ReturnBottlesAction(),
    ];
}
