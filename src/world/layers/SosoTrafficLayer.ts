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
        //http://rt2.map.gtimg.com/tile?z=4&x=11&y=9&type=vector&styleid=3&version=112
        // var url = `//rt${index}.map.gtimg.com/tile?z=${level}&x=${column}&y=${row}&type=vector&styleid=3&version=112`;

        //http://rtt2.map.qq.com/rtt/?z=11&x=1687&y=1270&timeKey148454126
        // var url = `http://wprd0${this.idx}.is.autonavi.com/appmaptile?x=${column}&y=${row}&z=${level}&lang=zh_cn&size=1&scl=1&style=8&type=11`;
        var timestap = Math.floor(Date.now() / 10000);
        var url = `//rtt2.map.qq.com/${this.domains[this.idx]}/?z=${level}&x=${column}&y=${row}&timeKey${timestap}`;

        this.idx++;

        if (this.idx >= 4) {
            this.idx = 0;
        }

        return url;
    }
}

export default SosoTrafficLayer;