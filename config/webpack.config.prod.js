const autoprefixer = require('autoprefixer')
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin')
const PreloadWebpackPlugin = require('preload-webpack-plugin')
// const ExtractTextPlugin = require('extract-text-webpack-plugin'); 将css打包成一个文件的设置
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const getClientEnvironment = require('./env')
const paths = require('./paths')
const babelOptions = require('./babelOptions');

const publicPath = '/'

const publicUrl = ''

const env = getClientEnvironment(publicUrl)

module.exports = {
    mode: env.raw.NODE_ENV,

    devtool: 'cheap-module-source-map',

    entry: [
        require.resolve('./polyfills'),

        paths.appIndexJs,
    ],
    output: {
        path: paths.appBuild,

        pathinfo: true,

        filename: 'static/js/[name].[hash:8].js',

        chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',

        publicPath: publicPath,

        devtoolModuleFilenameTemplate: (info) =>
            path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    },
    resolve: {
        modules: ['node_modules', paths.appNodeModules].concat(
            process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
        ),

        extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx', '.ts', '.tsx'],
        alias: {
            'react-native': 'react-native-web',
        },
        plugins: [new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson])],
    },
    module: {
        strictExportPresence: true,
        rules: [
            {
                oneOf: [
                    {
                        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                        loader: require.resolve('url-loader'),
                        options: {
                            limit: 10000,
                            name: 'static/media/[name].[hash:8].[ext]',
                        },
                    },
                    {
                        test: /\.(ts|tsx)$/,
                        use: [
                            {
                                loader: require.resolve('awesome-typescript-loader'),
                                options: {
                                    transpileOnly: true,
                                    useCache: true,
                                    useBabel: true,
                                    babelOptions: {
                                        babelrc: false,
                                        ...babelOptions,
                                    },
                                    babelCore: '@babel/core',
                                },
                            },
                        ],
                        exclude: /node_modules/,
                    },
                    {
                        test: /\.(js|jsx|mjs)$/,
                        include: paths.appSrc,
                        // loader: 'happypack/loader',
                        loader: require.resolve('babel-loader'),
                        query: {
                            cacheDirectory: true,
                            ...babelOptions,
                        },
                    },
                    {
                        test: /\.(css|less)$/,
                        use: [
                            MiniCssExtractPlugin.loader,
                            {
                                loader: require.resolve('css-loader'),
                                options: {
                                    importLoaders: 1,
                                    minimize: true,
                                    sourceMap: true,
                                },
                            },
                            {
                                loader: require.resolve('less-loader'),
                                options: {
                                    javascriptEnabled: true,
                                }
                            },
                        ]
                        // loader: ExtractTextPlugin.extract( 将css打包成一个文件的设置
                        //     Object.assign(
                        //         {
                        //             fallback: {
                        //                 loader: require.resolve('style-loader'),
                        //                 options: {
                        //                     hmr: false,
                        //                 },
                        //             },
                        //             use: [
                        //                 {
                        //                     loader: require.resolve('css-loader'),
                        //                     options: {
                        //                         importLoaders: 1,
                        //                         minimize: true,
                        //                         sourceMap: true,
                        //                     },
                        //                 },
                        //                 {
                        //                     loader: require.resolve('postcss-loader'),
                        //                     options: {
                        //                         // Necessary for external CSS imports to work
                        //                         // https://github.com/facebookincubator/create-react-app/issues/2677
                        //                         ident: 'postcss',
                        //                         plugins: () => [
                        //                             require('postcss-flexbugs-fixes'),
                        //                             autoprefixer({
                        //                                 browsers: [
                        //                                     '>1%',
                        //                                     'last 4 versions',
                        //                                     'Firefox ESR',
                        //                                     'not ie < 9', // React doesn't support IE8 anyway
                        //                                 ],
                        //                                 flexbox: 'no-2009',
                        //                             }),
                        //                         ],
                        //                     },
                        //                 },
                        //                 {
                        //                     loader: require.resolve('less-loader'),
                        //                     options: {
                        //                         javascriptEnabled: true,
                        //                     }
                        //                 },
                        //             ],
                        //         },
                        //         {}
                        //     )
                        // ),
                    },
                    {
                        exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
                        loader: require.resolve('file-loader'),
                        options: {
                            name: 'static/media/[name].[hash:8].[ext]',
                        },
                    },
                ],
            },
        ],
    },
    plugins: [

        new HtmlWebpackPlugin({
            inject: true,
            template: paths.appHtml,
            chunksSortMode: 'none',
        }),

        new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),

        new PreloadWebpackPlugin({
            rel: 'preload',
            as: 'script',
            include: 'allChunks',
            fileBlacklist: [/\.(css|map)$/, /base?.+/]
        }),

        new webpack.ProgressPlugin({
            handler: require('./progressHandler'),
        }),

        // new ExtractTextPlugin({ 将css打包成一个文件的设置
        //     filename:  (getPath) => {
        //         return getPath('css/[name].css').replace('css/', 'static/css/');
        //     },
        //     allChunks: true,
        // }),

        new MiniCssExtractPlugin({
            filename: "static/css/[name].[contenthash:8].css",
        }),

        new webpack.DefinePlugin(env.stringified),

        new CaseSensitivePathsPlugin(),

        new WatchMissingNodeModulesPlugin(paths.appNodeModules),

        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    ],

    node: {
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty',
    },

    performance: {
        hints: false,
    },

    optimization: {
        namedModules: true,
        nodeEnv: env.raw.NODE_ENV,
    },
}
