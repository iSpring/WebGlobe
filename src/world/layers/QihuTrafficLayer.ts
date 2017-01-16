import TrafficLayer from './TrafficLayer';

//http://ditu.so.com/

class QihuTrafficLayer extends TrafficLayer {
    protected minLevel: number = 8;

    getTileUrl(level: number, row: number, column: number): string {
        //https://qhapi.map.ishowchina.com/lkinfo/?act=tile&x=208&y=153&z=8&t=1484549712280
        var timestamp = Date.now();
        return `//qhapi.map.ishowchina.com/lkinfo/?act=tile&x=${column}&y=${row}&z=${level}&t=${timestamp}`;
    }
}

export default QihuTrafficLayer;