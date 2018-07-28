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
    template: '!!html-loader!./src/core/template.html',
    hash: false,
    inject: 'body',
    // chunks: ["runtime", "globe", "index"]
    chunks: ["index"]
});

var webappHtmlWebpackPlugin = new HtmlWebpackPlugin({
    filename: './webapp.html',
    template: '!!ejs-loader!./src/webapp/template.html',
    hash: false,
    inject: 'body',
    // chunks: ["runtime", "webapp", "globe"]
    chunks: ["webapp"]
});

// var commonsChunkPlugin = new webpack.optimize.CommonsChunkPlugin({
//     // name: "globe",
//     // chunks: ["globe"]
//     names: ["globe", "runtime"]
// });

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
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".jsx", ".scss", ".png"],
        alias: {
            core: path.resolve(__dirname, "./src/core"),
            world: path.resolve(__dirname, "./src/core/world"),
            webapp: path.resolve(__dirname, "./src/webapp")
        }
    },

    module: {
        rules: [{
                test: /\.tsx?$/,
                use: {
                    loader: "ts-loader"
                }
            },
            {
                test: /\.jsx?$/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.scss$/,
                use: extractPlugin.extract({
                    use: [{
                        loader: "css-loader",
                        options: {
                            modules: true,
                            localIdentName: "[name]__[local]___[hash:base64:5]"
                        }
                    }, {
                        loader: "sass-loader"
                    }]
                })
            },
            {
                test: /\.(png|jpeg|jpg|gif)$/,
                use: {
                    loader: "file-loader"
                }
            },
            {
                test: /\.(otf|ttf|eot|woff|woff2).*/,
                use: {
                    loader: "file-loader"
                }
            },
            {
                test: /\.html$/,
                use: {
                    loader: "html-loader",
                    options: {
                        attrs: ['img:src']
                    }
                }
            }
        ]
    },

    plugins: [
        // commonsChunkPlugin,
        extractPlugin,
        webpackMd5HashPlugin,
        indexHtmlWebpackPlugin,
        webappHtmlWebpackPlugin
    ]
};

if (PRODUCTION) {
    module.exports.plugins.push(
        //add DefinePlugin for production to save 88KB for React build
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: false
        })
    );
} else {
    //https://github.com/webpack/webpack/issues/708
    module.exports.plugins.push(
        function() {
            this.plugin("done", function(stats) {
                var errors = stats.compilation.errors;
                if (errors && errors.length > 0) {
                    console.log("");
                    console.log(chalk.red("----------------------------------------------------------------"));
                    errors.forEach(function(err) {
                        var msg = '';
                        // var msg = chalk.red(`ERROR in ${err.module.userRequest},`);
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