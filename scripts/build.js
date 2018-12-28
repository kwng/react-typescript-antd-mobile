'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

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
const config = require('../config/webpack.config.prod');
const paths = require('../config/paths');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const FileSizeReporter = require('react-dev-utils/FileSizeReporter');
const printBuildError = require('react-dev-utils/printBuildError');

const measureFileSizesBeforeBuild = FileSizeReporter.measureFileSizesBeforeBuild;
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    process.exit(1);
}

console.log("正在清空文件夹...");
fs.emptyDirSync(paths.appBuild);
// First, read the current file sizes in build directory.
// This lets us display how much they changed later.
measureFileSizesBeforeBuild(paths.appBuild)
    .then(previousFileSizes => {
        // Remove all content but keep the directory so that
        // if you're in it, you don't end up in Trash

        // Merge with the public folder
        console.log("正在创建文件夹...");
        copyPublicFolder();
        // Start the webpack build
        return build(previousFileSizes);
    })
    .then(
        ({stats, previousFileSizes, warnings}) => {
            warnings = warnings.filter((msg) => msg.indexOf("[mini-css-extract-plugin]") === -1 && msg.indexOf("* css ./node_modules/css-loader") === -1 && msg.indexOf("Conflicting order between") === -1);
            if (warnings.length) {
                console.log(chalk.yellow('构建出现警告.\n'));
                console.log(warnings.join('\n\n'));
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

            console.log('gzip后的文件大小:\n');
            printFileSizesAfterBuild(
                stats,
                previousFileSizes,
                paths.appBuild,
                WARN_AFTER_BUNDLE_GZIP_SIZE,
                WARN_AFTER_CHUNK_GZIP_SIZE
            );
            console.log();
            console.log(`项目文件已经构建在 ${chalk.cyan(paths.appBuild)} 目录下\n`);

        },
        err => {
            console.log(chalk.red('构建失败'));
            printBuildError(err);
            process.exit(1);
        }
    );

// Create the production build and print the deployment instructions.
function build(previousFileSizes) {
    console.log(`正在进行 ${chalk.yellow(process.env.NODE_ENV)} 构建...`);

    let compiler = webpack(config);
    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) {
                return reject(err);
            }
            const messages = formatWebpackMessages(stats.toJson({}, true));
            if (messages.errors.length) {
                // Only keep the first error. Others are often indicative
                // of the same problem, but confuse the reader with noise.
                if (messages.errors.length > 1) {
                    messages.errors.length = 1;
                }
                return reject(new Error(messages.errors.join('\n\n')));
            }
            if (
                process.env.CI &&
                (typeof process.env.CI !== 'string' ||
                    process.env.CI.toLowerCase() !== 'false') &&
                messages.warnings.length
            ) {
                console.log(
                    chalk.yellow(
                        '\nprocess.env.CI 不能为 true\n' +
                        '大部分 CI 服务器默认设置此项为true, 请修改\n'
                    )
                );
                return reject(new Error(messages.warnings.join('\n\n')));
            }
            return resolve({
                stats,
                previousFileSizes,
                warnings: messages.warnings,
            });
        });
    });
}

function copyPublicFolder() {
    fs.copySync(paths.appPublic, paths.appBuild, {
        dereference: true,
        filter: file => file !== paths.appHtml,
    });
}
