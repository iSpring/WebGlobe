
export class A{
    public a:string;
    getB(){
        return new B();
    }
}

export class B{
    public b:string;
    getA(){
        return new A();
    }
}