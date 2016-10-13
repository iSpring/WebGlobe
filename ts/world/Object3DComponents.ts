import Kernel = require('./Kernel');
import Vector = require('./Vector');
import Matrix = require('./Matrix');
import Object3D = require('./Object3D');
import PerspectiveCamera = require('./PerspectiveCamera');

type ChildType = Object3D | Object3DComponents;

//三维对象集合
class Object3DComponents {
  id: number;
  matrix: Matrix;
  visible: boolean;
  parent: any;
  children: ChildType[];

  constructor() {
    this.id = ++Kernel.idCounter;
    this.matrix = new Matrix();
    this.visible = true;
    this.parent = null;
    this.children = [];
  }

  add(obj: ChildType) {
    if (this.findObjById(obj.id) !== null) {
      console.debug("obj已经存在于Object3DComponents中，无法将其再次加入！");
      return;
    } else {
      this.children.push(obj);
      obj.parent = this;
    }
  }

  remove(obj: ChildType) {
    if (obj) {
      var result = this.findObjById(obj.id);
      if (result === null) {
        console.debug("obj不存在于Object3DComponents中，所以无法将其从中删除！");
        return false;
      }
      obj.destroy();
      this.children.splice(result.index, 1);
      obj = null;
      return true;
    } else {
      return false;
    }
  }

  //销毁所有的子节点
  clear() {
    for (var i = 0; i < this.children.length; i++) {
      var obj = this.children[i];
      obj.destroy();
    }
    this.children = [];
  }

  //销毁自身及其子节点
  destroy() {
    this.parent = null;
    this.clear();
  }

  findObjById(objId: number): any {
    for (var i = 0; i < this.children.length; i++) {
      var obj = this.children[i];
      if (obj.id == objId) {
        (<any>obj).index = i;
        return obj;
      }
    }
    return null;
  }

  draw(camera: PerspectiveCamera) {
    for (var i = 0; i < this.children.length; i++) {
      var obj = this.children[i];
      if (obj) {
        if (obj.visible) {
          (<any>obj).draw(camera);
        }
      }
    }
  }

  worldTranslate(x: number, y: number, z: number) {
    this.matrix.worldTranslate(x, y, z);
  }

  localTranslate(x: number, y: number, z: number) {
    this.matrix.localTranslate(x, y, z);
  }

  worldScale(scaleX: number, scaleY: number, scaleZ: number) {
    this.matrix.worldScale(scaleX, scaleY, scaleZ);
  }

  localScale(scaleX: number, scaleY: number, scaleZ: number) {
    this.matrix.localScale(scaleX, scaleY, scaleZ);
  }

  worldRotateX(radian: number) {
    this.matrix.worldRotateX(radian);
  }

  worldRotateY(radian: number) {
    this.matrix.worldRotateY(radian);
  }

  worldRotateZ(radian: number) {
    this.matrix.worldRotateZ(radian);
  }

  worldRotateByVector(radian: number, vector: Vector) {
    this.matrix.worldRotateByVector(radian, vector);
  }

  localRotateX(radian: number) {
    this.matrix.localRotateX(radian);
  }

  localRotateY(radian: number) {
    this.matrix.localRotateY(radian);
  }

  localRotateZ(radian: number) {
    this.matrix.localRotateZ(radian);
  }

  //localVector指的是相对于模型坐标系中的向量
  localRotateByVector(radian: number, localVector: Vector) {
    this.matrix.localRotateByVector(radian, localVector);
  }
}

export = Object3DComponents;