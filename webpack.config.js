var path = require('path');
var chalk = require('chalk');
var webpack = require('webpack');

var ExtractTextWebpackPlugin = require("extract-text-webpack-plugin");
var extractPlugin = new ExtractTextWebpackPlugin("bundle.[contenthash].css");

var WebpackMd5Hash = require('webpack-md5-hash');
var webpackMd5HashPlugin = new WebpackMd5Hash();

var HtmlWebpackPlugin = require('html-webpack-plugin');
var coreHtmlWebpackPlugin = new HtmlWebpackPlugin({
    filename: './index.html',
    template: '!!ejs!./src/core/template.html',
    hash: false,
    inject: 'body',
    chunks: ["core"]
});

var webappHtmlWebpackPlugin = new HtmlWebpackPlugin({
    filename: './webapp.html',
    template: '!!ejs!./src/webapp/template.html',
    hash: false,
    inject: 'body',
    chunks: ["webapp"]
});

var buildFolder = "buildOutput";

var PRODUCTION = process.env.NODE_ENV === 'production';

var es6Promise = "./node_modules/es6-promise/dist/es6-promise.auto.min.js";

module.exports = {
    entry: {
        core: ["./src/core/index.ts", es6Promise],
        webapp: ["./src/webapp/index.jsx", es6Promise]
    },

    output: {
        path: path.resolve(__dirname, buildFolder),
        filename: "[name].[chunkhash].js",
        // publicPath: buildFolder + "/",
        devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]'
    },

    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".jsx", ".scss", ".png"],
        alias: {
            core: path.resolve(__dirname, "./src/core"),
            world: path.resolve(__dirname, "./src/core/world"),
            webapp: path.resolve(__dirname, "./src/webapp")
        }
    },

    module: {
        loaders: [
            { test: /\.tsx?$/, loader: "ts-loader" },
            { test: /\.jsx?$/, loader: "babel-loader" },
            { test: /\.scss$/, loader: extractPlugin.extract("css?modules&localIdentName=[name]__[local]___[hash:base64:5]!sass") },
            { test: /\.(png|jpeg|jpg)$/, loader: "file-loader" },
            { test: /\.(otf|ttf|eot|woff|woff2)\?v=.*/, loader: "file-loader" }
        ]
    },

    plugins: [
        extractPlugin,
        webpackMd5HashPlugin,
        coreHtmlWebpackPlugin,
        webappHtmlWebpackPlugin
    ],

    // devtool: PRODUCTION ? 'hidden-source-map' : 'cheap-module-eval-source-map'
    devtool: PRODUCTION ? false : 'source-map'
};

if (process.argv.indexOf("--ci") >= 0) {
    //https://github.com/webpack/webpack/issues/708
    module.exports.plugins.push(
        function () {
            this.plugin("done", function (stats) {
                var errors = stats.compilation.errors;
                if (errors && errors.length > 0) {
                    console.log("");
                    console.log(chalk.red("----------------------------------------------------------------"));
                    errors.forEach(function (err) {
                        var msg = chalk.red(`ERROR in ${err.module.userRequest},`);
                        // msg += chalk.blue(`(${err.location.line},${err.location.character}),`);
                        msg += chalk.red(err.message);
                        console.log(msg);
                        // console.log(err);
                    });
                    console.log(chalk.red("----------------------------------------------------------------"));
                    process.exit(1);
                }
            });
        }
    );
}

if (PRODUCTION) {
    module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin({
        sourceMap: false
    }));
}