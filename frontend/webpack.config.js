import path from "node:path";
import { fileURLToPath } from "node:url";
import webpack from "webpack";
import dotenv from "dotenv";
import CopyWebpackPlugin from "copy-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

export default (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: "./app/main.tsx",
    output: {
      path: path.resolve(__dirname, "build"),
      filename: isProduction ? "assets/[name].[contenthash].js" : "assets/[name].js",
      publicPath: "/",
      clean: true,
    },
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js"],
      alias: {
        "~": path.resolve(__dirname, "app"),
      },
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: "babel-loader",
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader", "postcss-loader"],
        },
        {
          test: /\.(svg|png|jpe?g|gif|webp|avif)$/,
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.API_URL": JSON.stringify(process.env.API_URL || "http://localhost:3003"),
      }),
      new HtmlWebpackPlugin({
        template: "./public/index.html",
        favicon: "./public/favicon.ico",
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "public",
            to: ".",
            globOptions: { ignore: ["**/index.html", "**/favicon.ico"] },
          },
        ],
      }),
    ],
    devServer: {
      port: 3000,
      historyApiFallback: true,
      open: true,
    },
    devtool: isProduction ? "source-map" : "eval-source-map",
  };
};
