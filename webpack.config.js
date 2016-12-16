var path = require('path');

module.exports = {
    entry: path.resolve(__dirname, "src/index.ts"),
    output: {
        path: path.resolve(__dirname, "buildOutput"),
        filename: "bundle.js"
    },
    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".js", ".ts", ".tsx"]
    },
    module: {
        loaders: [
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    }
};