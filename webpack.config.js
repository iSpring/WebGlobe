var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: path.resolve(__dirname, "./index.ts"),
    output: {
        path: path.resolve(__dirname, "buildOutput"),
        filename: "bundle.js"
    },
    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".js", ".ts", ".tsx"]
    },
    module: {
        loaders: [
            { test: /\.tsx?$/, loader: "ts-loader" },
            { test: /\.css$/, loader: "style!css"}
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: '../index.html',
            template: '!!ejs!./template.html',
            hash: true,
            inject: 'body'
        }),
        function(){
            this.plugin("done", function(stats){
                var errors = stats.compilation.errors;
                if(errors && errors.length > 0){
                    errors.forEach(function(err){
                        console.info(err.rawMessage);
                    });
                    process.exit(1);
                }
            });
        }
    ]
};

if(process.env.NODE_ENV === 'production'){
    module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin());
}