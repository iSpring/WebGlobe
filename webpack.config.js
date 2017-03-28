var path = require('path');
var chalk = require('chalk');
var webpack = require('webpack');

var ExtractTextWebpackPlugin = require("extract-text-webpack-plugin");
var extractPlugin = new ExtractTextWebpackPlugin("bundle.[contenthash].css");

var WebpackMd5Hash = require('webpack-md5-hash');
var webpackMd5HashPlugin = new WebpackMd5Hash();

var HtmlWebpackPlugin = require('html-webpack-plugin');
var htmlWebpackPlugin = new HtmlWebpackPlugin({
    filename: '../index.html',
    template: '!!ejs!./template.html',
    hash: false,
    inject: 'body'
});


//https://github.com/webpack/webpack/issues/708

module.exports = {
    entry: path.resolve(__dirname, "./index.ts"),
    output: {
        path: path.resolve(__dirname, "buildOutput"),
        filename: "bundle.[chunkhash].js"
    },
    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".js", ".ts", ".tsx", ".scss"]
    },
    module: {
        loaders: [
            { test: /\.tsx?$/, loader: "ts-loader" },
            { test: /\.scss$/, loader: extractPlugin.extract("css!sass") }
        ]
    },
    plugins: [
        extractPlugin,
        webpackMd5HashPlugin,
        htmlWebpackPlugin
    ]
};

if (process.argv.indexOf("--ci") >= 0) {
    module.exports.plugins.push(
        function() {
            this.plugin("done", function(stats) {
                var errors = stats.compilation.errors;
                if (errors && errors.length > 0) {
                    console.log("");
                    console.log(chalk.red("----------------------------------------------------------------"));
                    errors.forEach(function(err) {
                        var msg = chalk.red(`ERROR in ${err.module.userRequest},`);
                        msg += chalk.blue(`(${err.location.line},${err.location.character}),`);
                        msg += chalk.red(err.rawMessage);
                        console.log(msg);
                    });
                    console.log(chalk.red("----------------------------------------------------------------"));
                    process.exit(1);
                }
            });
        }
    );
}

if (process.env.NODE_ENV === 'production') {
    module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin());
}