class Plan{
    constructor(public A: number, public B: number, public C: number, public D: number){
    }

    getCopy(): Plan{
        var planCopy = new Plan(this.A, this.B, this.C, this.D);
        return planCopy;
    }
}

export = Plan;