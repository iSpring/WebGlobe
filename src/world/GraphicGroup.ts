import Kernel = require('./Kernel');
import {Drawable} from './Definitions.d';
import Graphic = require('./graphics/Graphic');
import Camera from "./Camera";

class GraphicGroup<T extends Drawable> implements Drawable {
    id: number;
    parent: GraphicGroup<T>;
    children: T[];
    visible: boolean = true;

    constructor() {
        this.id = ++Kernel.idCounter;
        this.children = [];
    }

    add(g: T, first: boolean = false) {
        if (first) {
            this.children.unshift(g);
        } else {
            this.children.push(g);
        }
        g.parent = this;
    }

    remove(g: T): boolean {
        var result = false;
        var findResult = this.findGraphicById(g.id);
        if (findResult) {
            g.destroy();
            this.children.splice(findResult.index, 1);
            g = null;
            result = true;
        }
        return result;
    }

    clear() {
        var i = 0, length = this.children.length, g: Drawable = null;
        for (; i < length; i++) {
            g = this.children[i];
            g.destroy();
        }
        this.children = [];
    }

    destroy() {
        this.parent = null;
        this.clear();
    }

    findGraphicById(graphicId: number) {
        var i = 0, length = this.children.length, g: Drawable = null;
        for (; i < length; i++) {
            g = this.children[i];
            if (g.id === graphicId) {
                return {
                    index: i,
                    graphic: g
                };
            }
        }
        return null;
    }

    shouldDraw() {
        return this.visible && this.children.length > 0;
    }

    draw(camera: Camera) {
        if (this.shouldDraw()) {
            this.onDraw(camera);
        }
    }

    protected onDraw(camera: Camera) {
        this.children.forEach(function (g: Drawable) {
            if (g.shouldDraw(camera)) {
                g.draw(camera);
            }
        });
    }
}

export = GraphicGroup;