
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

    get name(){return Language.translate('action_' + this.id + '_name');};
    get description(){return Language.translate('action_' + this.id + '_description');};
    
    // Unlocked
    _unlocked = false;
    get isUnlocked(){
        return debug_unlock_all || this._unlocked || this.calculateUnlock();
    }

    calculateUnlock(){
        return false;
    }
    
    // Cooldown
    baseCooldown = 2000;
    cooldownMultiplier = 1;
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

    lastStartTime;
    isRunning = false;
    timesFinished = 0;

    // Consumption
    baseConsumption = [];
    consumeMultiplier = 1;
    get consumption(){
        return this.baseConsumption.map((ru) => new ResourceUnit(ru.resourceId, ru.amount * this.consumeMultiplier));
    }

    // Gain
    baseGain = [];
    gainMultiplier = 1;
    get gain(){
        return this.baseGain.map((ru) => new ResourceUnit(ru.resourceId, ru.amount * (ru.resource.isSkill ? 1 : this.gainMultiplier)));
    }

    // Milestones
    milestones = [];
    get hasMilestones(){return this.milestones != undefined && this.milestones.length > 0;}
    addMilestone(milestoneRequirement, upgrade){
        if(this.milestones.some((element) => element.threshold == milestoneRequirement.threshold)){
            return;
        }
        this.milestones.push(new Milestone(milestoneRequirement.threshold, Language.translate("upgrade_" + upgrade.id + "_name")));
    }



    automationUnlocked = false;
    automationActive = false;

    constructor(id){
        this.id = id;
    }

    get canDo(){
        // Parallel actions
        if(running_actions_amount() >= max_parallel_actions) return false;

        // Cooldown
        if(this.current_cooldown > 0) return false;

        // Can the cost be settled?
        var canConsume = true;
        this.consumption.forEach(function(ru){
            if(ru.resource.amount < ru.amount){
                canConsume = false;
            }
        });
        
        // Is there any gain at all?
        var canGain = false;
        this.gain.forEach(function(ru){
            if(!ru.resource.maxReached()){
                canGain = true;
            }
        });

        return canConsume && canGain;
    }

    update(){
        if(this.current_cooldown <= 0 && this.isRunning){
            this.finish();
        }
    
        if(this.isRunning == false && this.automationActive && this.canDo){
            this.start();
        }
    }

    start(){
        this.consumption.forEach(function(ru){
            ru.resource.amount -= ru.amount;
        });
        
        this.isRunning = true;
        this.lastStartTime = new Date().getTime();
    }

    applyGain(){
        if(this.gain != null){
            this.gain.forEach(function(ru){
                ru.resource.amount += ru.amount;
                if(ru.resource.max_amount > -1){
                    ru.resource.amount = Math.min(ru.resource.amount, ru.resource.max_amount);
                }
            });
        }
    }

    finish(){
        this.isRunning = false;
        this.timesFinished++;
        if(this.hasMilestones){
            this.milestones.forEach((m) => m.check(this))
        }

        this.applyGain();
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
        this.baseGain = [
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
        this.baseGain = [
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
        this.baseConsumption = [
            new ResourceUnit('energy', 0.5),
        ]
        this.baseGain = [
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
        this.baseConsumption = [
            new ResourceUnit('bottles', 1),
        ]
        this.baseGain = [
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
        this.baseConsumption = [
            new ResourceUnit('energy', 2),
        ]
        this.baseGain = [
            new ResourceUnit('money', 1),
        ];
        this.baseCooldown = 3000;
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
