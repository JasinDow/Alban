class Profession{
    id;
    name;
    description;
    actions = [];
    

    constructor(id){
        this.id = id;
    }
}

class HomelessProfession extends Profession{
    constructor(){
        super('homeless');
        this.name = "Homeless";
        this.actions = [
            new SitAndRestAction(),
            new CollectBottlesAction(),
            new ReturnBottlesAction(),
        ]
    }
}