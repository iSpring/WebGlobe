import Utils = require('../Utils');
import TrafficLayer from './TrafficLayer';

class SosoTrafficLayer extends TrafficLayer {
    private idx: number = 1;
    private readonly domains: string[] = ["rtt2", "rtt2a", "rtt2b", "rtt2c"];
    protected minLevel: number = 11;

    getTileUrl(level: number, row: number, column: number): string {

        if (this.idx === undefined) {
            this.idx = 0;
        }

        row = Math.pow(2, level) - row - 1;

        //http://rtt2.map.qq.com/rtt/?z=11&x=1687&y=1270&timeKey148454126
        var timestamp = Math.floor(Date.now() / 10000);
        var url = `//${this.domains[this.idx]}.map.qq.com/rtt/?z=${level}&x=${column}&y=${row}&timeKey${timestamp}`;

        this.idx++;

        if (this.idx >= 4) {
            this.idx = 0;
        }

        return Utils.wrapUrlWithProxy(url);
    }
}

export default SosoTrafficLayer;