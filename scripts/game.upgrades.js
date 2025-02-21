class Upgrade{
    id;
    _requirement;
    _unlocked;
    costs = [];
    _effect;
    alreadyApplied;

    constructor(id, {requirement, costs, effect}={}){
        this.id = id;
        if(requirement != undefined){
            this._requirement = requirement;
        }
        if(costs != undefined){
            this.costs = costs;
        }
        this._effect = effect;
    }

    get name(){
        return Language.translate("upgrade_" + this.id + "_name");
    }

    get description(){
        return Language.translate("upgrade_" + this.id + "_description");
    }

    get isUnlocked() {
        return debug_unlock_all || this._unlocked || this.calculateIsUnlocked();
    }

    calculateIsUnlocked(){
        if(this._requirement != undefined){
            if(this._requirement instanceof MilestoneRequirement){
                this._requirement.action.addMilestone(this._requirement, this);
            }
            if (this._requirement.isMet){
                this._unlocked = true;
                addLogUpgradeUnlocked(this);
            }
        }
        else{
            this._unlocked = true;
            addLogUpgradeUnlocked(this);
        }
        return this._unlocked;
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
        if(this._effect){
            this._effect();
        }
        this.alreadyApplied = true;
    }
}

class Requirement{
    isMetFunction;
    constructor(isMetFunction){
        this.isMetFunction = isMetFunction;
    }
    get isMet(){return this.isMetFunction != undefined ? this.isMetFunction() : false;}
}

class SkillRequirement extends Requirement{
    constructor(skillId, level){
        super(()=>{
            return resource(skillId).currentLevel >= level;
        });
    }
}

class MilestoneRequirement extends Requirement{
    action;
    threshold;
    constructor(actionId, threshold){
        super(()=>{
            return this.action.timesFinished >= this.threshold;
        });
        this.action = action(actionId);
        this.threshold = threshold;
    }
}

class UpgradeRequirement extends Requirement{
    constructor(upgradeId){
        super(()=>{
            return upgrade(upgradeId).alreadyApplied;
        });
    }
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

function resetUpgrades(){
    upgrades = [
        new Upgrade("debug_unlock_all", 
            {
                requirement: new Requirement(() => debugMode == true),
                effect: () => {debug_unlock_all = true;}
            }
        ),
        new Upgrade("second_hand_shop", 
            {
                requirement: new SkillRequirement("local_knowledge", 1),
            }
        ),
        new Upgrade("purse",
            {
                requirement: new UpgradeRequirement("second_hand_shop"),
                costs: [new ResourceUnit('money', 5)],
                effect: () => {resource('money').max_amount *= 2;}
            }
        ),
        new Upgrade("multitasking", 
            {
                requirement: new Requirement(() => false),
                effect: () => {max_parallel_actions += 1;}
            }
        ),
        new Upgrade("shopping_cart",
            {
                requirement: new MilestoneRequirement("collect_bottles", 2),
                effect: () => {resource('bottles').max_amount = 50;}
            } 
        ),
        new Upgrade("plan_your_route", 
            {
                requirement: new MilestoneRequirement("collect_bottles", 5),
                effect: () => {action('collect_bottles').cooldownMultiplier *= 0.5;}
            }
        ),
        new Upgrade("use_both_hands", 
            {
                requirement: new MilestoneRequirement("collect_bottles", 7),
                effect: () => {action('collect_bottles').gainMultiplier *= 2;}
            }
        ),
        new Upgrade("muscle_memory_collect_bottles", 
            {
                requirement: new MilestoneRequirement("collect_bottles", 10),
                effect: () => {action('collect_bottles').automationUnlocked = true;}
            }
        ),
        new Upgrade("use_two_deposit_machines", 
            {
                requirement: new MilestoneRequirement("return_bottles", 5),
                effect: () => { 
                    action('return_bottles').consumeMultiplier *= 2; 
                    action('return_bottles').gainMultiplier *= 2;
                }
            }
        ),
        new Upgrade("muscle_memory_return_bottles", 
            {
                requirement: new MilestoneRequirement("return_bottles", 10),
                effect: () => {action('return_bottles').automationUnlocked = true;}
            }
        ),
        new Upgrade("science_lab", 
            {
                requirement: new Requirement(() => isPlayerStuck()),
            }
        ),
        new Upgrade("prestige",
            {
                requirement: new UpgradeRequirement("science_lab"),
                effect: () => {switchProfession(currentProfession.id);}
            }
        ),
    ];
}