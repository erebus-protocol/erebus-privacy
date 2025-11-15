// craco.config.js
const path = require("path");
require("dotenv").config();

// Environment variable overrides
const config = {
  disableHotReload: process.env.DISABLE_HOT_RELOAD === "true",
  enableVisualEdits: process.env.REACT_APP_ENABLE_VISUAL_EDITS === "true",
  enableHealthCheck: process.env.ENABLE_HEALTH_CHECK === "true",
};

// Conditionally load visual editing modules only if enabled
let babelMetadataPlugin;
let setupDevServer;

if (config.enableVisualEdits) {
  babelMetadataPlugin = require("./plugins/visual-edits/babel-metadata-plugin");
  setupDevServer = require("./plugins/visual-edits/dev-server-setup");
}

// Conditionally load health check modules only if enabled
let WebpackHealthPlugin;
let setupHealthEndpoints;
let healthPluginInstance;

if (config.enableHealthCheck) {
  WebpackHealthPlugin = require("./plugins/health-check/webpack-health-plugin");
  setupHealthEndpoints = require("./plugins/health-check/health-endpoints");
  healthPluginInstance = new WebpackHealthPlugin();
}

const webpackConfig = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig, { env, paths }) => {
      // Disable all source maps
      webpackConfig.devtool = false;
      // Add polyfills for Node.js modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process'),
        'process/browser': require.resolve('process'),
        assert: require.resolve('assert'),
        url: require.resolve('url'),
        https: require.resolve('https-browserify'),
        http: require.resolve('stream-http'),
        os: require.resolve('os-browserify/browser'),
        util: require.resolve('util'),
        vm: false,
        fs: false,
        path: false,
        zlib: false,
      };
      
      // Add alias for process/browser
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'process/browser': path.resolve(__dirname, 'src/polyfills/process-browser.js'),
        'process/browser.js': path.resolve(__dirname, 'src/polyfills/process-browser.js'),
      };

      // Completely disable source-map-loader to avoid ENOENT errors
      webpackConfig.module.rules = webpackConfig.module.rules.map(rule => {
        // Check if rule has oneOf (common in CRA configs)
        if (rule.oneOf) {
          rule.oneOf = rule.oneOf.filter(oneOfRule => {
            if (oneOfRule.loader && oneOfRule.loader.includes('source-map-loader')) {
              return false;
            }
            return true;
          });
        }
        
        // Remove source-map-loader completely
        if (rule.enforce === 'pre' || (rule.loader && rule.loader.includes('source-map-loader'))) {
          return null;
        }
        return rule;
      }).filter(Boolean);

      // Add rule to handle .mjs files
      webpackConfig.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      });

      // Resolve .mjs extensions
      webpackConfig.resolve.extensions = [
        ...(webpackConfig.resolve.extensions || []),
        '.mjs'
      ];

      // Ignore missing source maps
      webpackConfig.ignoreWarnings = [
        ...(webpackConfig.ignoreWarnings || []),
        /Failed to parse source map/,
        /source-map-loader/,
        /Module build failed/
      ];

      // Provide global Buffer and process
      const webpack = require('webpack');
      webpackConfig.plugins = webpackConfig.plugins || [];
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process',
        }),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        })
      );

      // Disable hot reload completely if environment variable is set
      if (config.disableHotReload) {
        // Remove hot reload related plugins
        webpackConfig.plugins = webpackConfig.plugins.filter(plugin => {
          return !(plugin.constructor.name === 'HotModuleReplacementPlugin');
        });

        // Disable watch mode
        webpackConfig.watch = false;
        webpackConfig.watchOptions = {
          ignored: /.*/, // Ignore all files
        };
      } else {
        // Add ignored patterns to reduce watched directories
        webpackConfig.watchOptions = {
          ...webpackConfig.watchOptions,
          ignored: [
            '**/node_modules/**',
            '**/.git/**',
            '**/build/**',
            '**/dist/**',
            '**/coverage/**',
            '**/public/**',
          ],
        };
      }

      // Add health check plugin to webpack if enabled
      if (config.enableHealthCheck && healthPluginInstance) {
        webpackConfig.plugins.push(healthPluginInstance);
      }

      return webpackConfig;
    },
  },
};

// Only add babel plugin if visual editing is enabled
if (config.enableVisualEdits) {
  webpackConfig.babel = {
    plugins: [babelMetadataPlugin],
  };
}

// Setup dev server with visual edits and/or health check
if (config.enableVisualEdits || config.enableHealthCheck) {
  webpackConfig.devServer = (devServerConfig) => {
    // Apply visual edits dev server setup if enabled
    if (config.enableVisualEdits && setupDevServer) {
      devServerConfig = setupDevServer(devServerConfig);
    }

    // Add health check endpoints if enabled
    if (config.enableHealthCheck && setupHealthEndpoints && healthPluginInstance) {
      const originalSetupMiddlewares = devServerConfig.setupMiddlewares;

      devServerConfig.setupMiddlewares = (middlewares, devServer) => {
        // Call original setup if exists
        if (originalSetupMiddlewares) {
          middlewares = originalSetupMiddlewares(middlewares, devServer);
        }

        // Setup health endpoints
        setupHealthEndpoints(devServer, healthPluginInstance);

        return middlewares;
      };
    }

    return devServerConfig;
  };
}

module.exports = webpackConfig;
