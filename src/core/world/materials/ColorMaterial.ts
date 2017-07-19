import Material from './Material';

// export default class MeshColorMaterial extends Material {
//     type: string = "";
//     ready: boolean = false;
//     singleColor: number[];
//     triangleColors: number[][];
//     verticeColors: number[][];

//     constructor() {
//         super();
//         this.reset();
//     }

//     isReady(){
//         return this.ready;
//     }

//     reset() {
//         this.type = '';
//         this.singleColor = null;
//         this.triangleColors = [];
//         this.verticeColors = [];
//         this.ready = false;
//     }

//     setSingleColor(color: number[]) {
//         this.type = 'single';
//         this.singleColor = color;
//         this.ready = true;
//     }

//     setTriangleColor(colors: number[][]) {
//         this.type = 'triangle';
//         this.triangleColors = colors;
//         this.ready = true;
//     };

//     setVerticeColor(colors: number[][]) {
//         this.type = 'vertice';
//         this.verticeColors = colors;
//         this.ready = true;
//     }

//     destroy() {
//         this.reset();
//     }
// };

export default class ColorMaterial extends Material{
    public color: number[] = null;//rgb,0-1

    constructor(rgb255: number[]){
        super();
        this.color = [rgb255[0] / 255, rgb255[1] / 255, rgb255[2] / 255];
    }

    isReady(){
        return this.color && this.color.length > 0;
    }

    destroy(){
    }
};