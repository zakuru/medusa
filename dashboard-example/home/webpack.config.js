const HtmlWebpackPlugin = require("html-webpack-plugin");
const MedusaPlugin = require("../..//dashboard-plugin");
const {
  container: { ModuleFederationPlugin },
} = require("webpack");
const path = require("path");

module.exports = {
  entry: "./src/index",
  mode: "development",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: 3001,
  },
  output: {
    filename: "[name].[contenthash].js",
    chunkFilename: "[name].[contenthash].js",
    publicPath: `auto`,
  },
  cache: false,
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                javascriptEnabled: true,
                math: "always",
              },
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        loader: "esbuild-loader",
        exclude: /node_modules/,
        options: {
          loader: "jsx",
          target: "es2015",
        },
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "home",
      filename: "remoteEntry.js",
      library: { type: "var", name: "home" },
      remotes: {
        dsl: "dsl",
        search: "search",
        nav: "nav",
        utils: "utils",
      },
      exposes: {
        "./ProductCarousel": "./src/ProductCarousel",
        "./HeroImage": "./src/HeroImage",
      },
      // sharing code based on the installed version, to allow for multiple vendors with different versions
      shared: require("./package.json").dependencies,
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      excludeChunks: ["remoteEntry"],
    }),
    new MedusaPlugin({
      publishVersion: require("./package.json").version,
      filename: "dashboard.json",
      dashboardURL:
        "http://localhost:3000/api/update?token=29f387e1-a00d-46ea-9fd6-02ca5e97449c",
      versionChangeWebhook: "http://cnn.com/",
      metadata: {
        clientUrl: "http://localhost:3000",
        baseUrl: "http://localhost:3001",
        source: {
          url: "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/home",
        },
        remote: "http://localhost:3001/remoteEntry.js",
      },
    }),
  ],
};
