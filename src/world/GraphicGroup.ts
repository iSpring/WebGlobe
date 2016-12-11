///<amd-module name="world/GraphicGroup"/>
import Kernel = require("./Kernel");
import Graphic = require("./graphics/Graphic");
import Camera from "./Camera";

type Drawable = Graphic | GraphicGroup;

class GraphicGroup {
    id: number;
    parent: GraphicGroup;
    children: Drawable[];
    visible: boolean = true;

    constructor() {
        this.id = ++Kernel.idCounter;
        this.children = [];
    }

    add(g: Drawable, first: boolean = false) {
        if (first) {
            this.children.unshift(g);
        } else {
            this.children.push(g);
        }
        g.parent = this;
    }

    remove(g: Drawable): boolean {
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

    isDrawable() {
        return this.visible;
    }

    draw(camera: Camera) {
        if (this.isDrawable()) {
            this.onDraw(camera);
        }
    }

    onDraw(camera: Camera) {
        this.children.forEach(function (g: Drawable) {
            if (g.isDrawable()) {
                g.draw(camera);
            }
        });
    }
}

export = GraphicGroup;