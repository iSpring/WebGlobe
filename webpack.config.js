var path = require('path');
var chalk = require('chalk');
var webpack = require('webpack');

var ExtractTextWebpackPlugin = require("extract-text-webpack-plugin");
//https://github.com/webpack-contrib/extract-text-webpack-plugin/blob/webpack-1/README.md
//[name] the name of the chunk
//[contenthash] a hash of the content of the extracted file
var extractPlugin = new ExtractTextWebpackPlugin("[name].[contenthash].css");

var WebpackMd5Hash = require('webpack-md5-hash');
var webpackMd5HashPlugin = new WebpackMd5Hash();

var HtmlWebpackPlugin = require('html-webpack-plugin');
//https://github.com/jantimon/html-webpack-plugin/issues/133
var indexHtmlWebpackPlugin = new HtmlWebpackPlugin({
    filename: './index.html',
    template: '!!html!./src/core/template.html',
    hash: false,
    inject: 'body',
    chunks: ["runtime", "globe", "index"]
});

var webappHtmlWebpackPlugin = new HtmlWebpackPlugin({
    filename: './webapp.html',
    template: '!!ejs!./src/webapp/template.html',
    hash: false,
    inject: 'body',
    chunks: ["runtime", "webapp", "globe"]
});

var commonsChunkPlugin = new webpack.optimize.CommonsChunkPlugin({
    // name: "globe",
    // chunks: ["globe"]
    names: ["globe", "runtime"]
});

var buildFolder = "buildOutput";

var PRODUCTION = process.env.NODE_ENV === 'production';

var es6Promise = "./node_modules/es6-promise/dist/es6-promise.auto.min.js";

module.exports = {
    entry: {
        // globe: "./src/core/world/Globe.ts",
        index: [es6Promise, "./src/core/index.ts"],
        webapp: [es6Promise, "./src/webapp/index.jsx"]
    },

    output: {
        path: path.resolve(__dirname, buildFolder),
        filename: "[name].[chunkhash].js",
        // publicPath: buildFolder + "/",
        devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]'
    },

    // devtool: PRODUCTION ? 'hidden-source-map' : 'cheap-module-eval-source-map'
    devtool: PRODUCTION ? false : 'source-map',

    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".jsx", ".scss", ".png"],
        alias: {
            core: path.resolve(__dirname, "./src/core"),
            world: path.resolve(__dirname, "./src/core/world"),
            webapp: path.resolve(__dirname, "./src/webapp")
        }
    },

    module: {
        loaders: [{
                test: /\.tsx?$/,
                loader: "ts-loader"
            },
            {
                test: /\.jsx?$/,
                loader: "babel-loader"
            },
            {
                test: /\.scss$/,
                loader: extractPlugin.extract("css?modules&localIdentName=[name]__[local]___[hash:base64:5]!sass")
            },
            {
                test: /\.(png|jpeg|jpg)$/,
                loader: "file-loader"
            },
            {
                test: /\.(otf|ttf|eot|woff|woff2)\?v=.*/,
                loader: "file-loader"
            },
            {
                test: /\.html$/,
                loader: "html-loader",
                query: {
                    attrs: ['img:src']
                }
            }
        ]
    },

    plugins: [
        commonsChunkPlugin,
        extractPlugin,
        webpackMd5HashPlugin,
        indexHtmlWebpackPlugin,
        webappHtmlWebpackPlugin
    ]
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