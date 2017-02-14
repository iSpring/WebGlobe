import Kernel = require("./Kernel");
import Utils = require("./Utils");

type Listener = (data: any) => void;

export class EventEmitter{
  events:{[key:string]:Listener[]} = null;
  onceListeners:Listener[] = null;

  constructor(){
    this.events = {};
    this.onceListeners = [];
  }

  emit(eventName:string, data: any){
    var listeners = this.events[eventName];
    if(listeners){
      listeners.forEach((listener)=>{
        listener(data);
        var index = this.onceListeners.indexOf(listener);
        if(index >= 0){
          this.onceListeners.splice(index, 1);
        }
      });
    }
  }

  once(eventName:string, listener: Listener){
    this.addEventListener(eventName, listener);
    this.onceListeners.push(listener);
  }

  on(eventName:string, listener: Listener){
    this.addEventListener(eventName, listener);
  }

  addEventListener(eventName:string, listener: Listener){
    var listeners = this.events[eventName];
    if(listeners){
      listeners.push(listener);
    }else{
      this.events[eventName] = [listener];
    }
  }

  removeEventListener(eventName:string, listener: Listener){
    var listeners = this.events[eventName];
    if(listeners){
      this.events[eventName] = listeners.filter((item) => item!==listener);
    }
  }

  removeAllEventListeners(eventName?:string){
    if(eventName){
      this.events[eventName] = [];
    }else{
      this.events = {};
    }
  }
};