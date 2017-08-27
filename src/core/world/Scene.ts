import {Drawable, Pickable} from './Definitions.d';
import GraphicGroup,{PickableGraphicGroup} from './GraphicGroup';
import TiledLayer from './layers/TiledLayer';
import Line from './math/Line';

export default class Scene extends GraphicGroup<Drawable>{
    tiledLayer: TiledLayer;

    pickByWorldLine(worldLine: Line){
        const count = this.children.length;
        for(let i = count - 1; i >= 0; i--){
            let graphicGroup = this.children[i];
            if(graphicGroup instanceof PickableGraphicGroup){
                let pickableGraphicGroup = graphicGroup as PickableGraphicGroup<Drawable & Pickable>;
                const target = pickableGraphicGroup.pickByWorldLine(worldLine, true);
                if(target){
                    return target;
                }
            }
        }
        return null;
    }
};