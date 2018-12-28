'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
    throw err;
});

// Ensure environment variables are read.
require('../config/env');

const chalk = require('chalk');
const fs = require('fs-extra');
const webpack = require('webpack');
const config = require('../config/webpack.config.dev');
const paths = require('../config/paths');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const FileSizeReporter = require('react-dev-utils/FileSizeReporter');
const printBuildError = require('react-dev-utils/printBuildError');

const measureFileSizesBeforeBuild = FileSizeReporter.measureFileSizesBeforeBuild;

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    process.exit(1);
}

console.log("正在清空文件夹...");
fs.emptyDirSync(paths.appBuild);
// First, read the current file sizes in build directory.
// This lets us display how much they changed later.
measureFileSizesBeforeBuild(paths.appBuild)
    .then(() => {
        // Remove all content but keep the directory so that
        // if you're in it, you don't end up in Trash

        // Merge with the public folder
        console.log("正在创建文件夹...");
        copyPublicFolder();

        // Start the webpack build
        return build();
    })
    .then(
        () => {
            console.log(chalk.green("监听文件修改中...\n"));
        },
        err => {
            console.log(chalk.red('构建失败\n'));
            printBuildError(err);
            process.exit(1);
        }
    );

// Create the production build and print the deployment instructions.
function build() {
    console.log(`正在进行 ${chalk.yellow(process.env.NODE_ENV)} 构建...`);

    let compiler = webpack(config);
    return new Promise((reslove, reject) => {
        compiler.watch({
            poll: 1000,//监测修改的时间(ms)
            aggregeateTimeout: 500, //防止重复按键，500毫米内算按键一次
            ignored: /node_modules/,//不监测
        }, (err, stats) => {
            if (err) {
                throw err;
            }
            const watchMessages = formatWebpackMessages(stats.toJson({}, true));
            if (watchMessages.errors.length) {
                // Only keep the first error. Others are often indicative
                // of the same problem, but confuse the reader with noise.
                if (watchMessages.errors.length > 1) {
                    watchMessages.errors.length = 1;
                }
                reject(watchMessages.errors.join('\n\n'));
            }
            if (
                process.env.CI &&
                (typeof process.env.CI !== 'string' ||
                    process.env.CI.toLowerCase() !== 'false') &&
                watchMessages.warnings.length
            ) {
                console.log(
                    chalk.yellow(
                        '\nprocess.env.CI 不能为 true\n' +
                        '大部分 CI 服务器默认设置此项为true, 请修改\n'
                    )
                );
                reject(watchMessages.warnings.join('\n\n'));
            }

            watchMessages.warnings = watchMessages.warnings.filter((msg) => msg.indexOf("[mini-css-extract-plugin]") === -1 && msg.indexOf("* css ./node_modules/css-loader") === -1 && msg.indexOf("Conflicting order between") === -1);

            if (watchMessages.warnings.length) {
                console.log(chalk.yellow('构建出现警告.\n'));
                console.log(watchMessages.warnings.join('\n\n'));
                console.log(
                    '\n搜索 ' +
                    chalk.underline(chalk.yellow('关键词')) +
                    ' 来学习如何去除这些警告'
                );
                console.log(
                    '如果需要忽略, 将 ' +
                    chalk.cyan('// eslint-disable-next-line') + ' 或 ' + chalk.cyan('// @ts-ignore') +
                ' 加在警告的代码前面.\n'
                );
            } else {
                console.log(chalk.green('项目构建成功\n'));
            }

            console.log(`项目文件已经构建在 ${chalk.cyan(paths.appBuild)} 目录下\n`);
            console.log("当前内存占用: " + chalk.yellow(`${process.memoryUsage().rss/1000/1000} MB`));
            console.log(`当前时间: ${chalk.cyan(new Date().toLocaleTimeString())}`);
            reslove();
        })
    });
    //
    // return new Promise((resolve, reject) => {
    //     compiler.run((err, stats) => {
    //         if (err) {
    //             return reject(err);
    //         }
    //         const messages = formatWebpackMessages(stats.toJson({}, true));
    //         if (messages.errors.length) {
    //             // Only keep the first error. Others are often indicative
    //             // of the same problem, but confuse the reader with noise.
    //             if (messages.errors.length > 1) {
    //                 messages.errors.length = 1;
    //             }
    //             return reject(new Error(messages.errors.join('\n\n')));
    //         }
    //         if (
    //             process.env.CI &&
    //             (typeof process.env.CI !== 'string' ||
    //                 process.env.CI.toLowerCase() !== 'false') &&
    //             messages.warnings.length
    //         ) {
    //             console.log(
    //                 chalk.yellow(
    //                     '\nprocess.env.CI 不能为 true\n' +
    //                     '大部分 CI 服务器默认设置此项为true, 请修改\n'
    //                 )
    //             );
    //             return reject(new Error(messages.warnings.join('\n\n')));
    //         }
    //         return resolve();
    //     });
    // });
}

function copyPublicFolder() {
    fs.copySync(paths.appPublic, paths.appBuild, {
        dereference: true,
        filter: file => file !== paths.appHtml,
    });
}
