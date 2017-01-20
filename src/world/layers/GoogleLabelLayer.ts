

import LabelLayer from './LabelLayer';

//http://ditu.bigemap.com/

class AutonaviLabelLayer extends LabelLayer {
    private idx: number = 0;

    getTileUrl(level: number, row: number, column: number): string {


        if (this.idx === undefined) {
            this.idx = 0;
        }

        //http://mt3.google.cn/vt/imgtp=png32&lyrs=h@365000000&hl=zh-CN&gl=cn&x=3376&y=1553&z=12&s=Galil
        var url = `//mt${this.idx}.google.cn/vt/imgtp=png32&lyrs=h@365000000&hl=zh-CN&gl=cn&x=${column}&y=${row}&z=${level}&s=Galil`;

        this.idx++;

        if (this.idx >= 4) {
            this.idx = 0;
        }

        return url;
    }
}

export default AutonaviLabelLayer;