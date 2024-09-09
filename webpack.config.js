// webpack.config.js
const path = require("path");

module.exports = {
  entry: "./src/script.ts", // Entry point for your application
  module: {
    rules: [
      {
        test: /\.tsx?$/, // Test for .ts or .tsx files
        use: "ts-loader", // Use ts-loader for TypeScript files
        exclude: /node_modules/, // Exclude node_modules directory
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"], // Resolve these extensions
  },
  output: {
    filename: "bundle.js", // Output file name
    path: path.resolve(__dirname, "dist"), // Output directory
  },
  mode: "development", // Set mode to 'development' or 'production'
};
