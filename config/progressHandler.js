'use strict';

let lineCaretPosition = 0;
let lastMessage = "";

const progressHandler = (percentage, msg, ...args) => {
    const details = args;
    if (percentage < 1) {
        percentage = Math.floor(percentage * 100);
        msg = `${percentage}% ${msg}`;
        if (percentage < 100) {
            msg = ` ${msg}`;
        }
        if (percentage < 10) {
            msg = ` ${msg}`;
        }
        for (let detail of details) {
            if (!detail) continue;
            if (detail.length > 40) {
                detail = `...${detail.substr(detail.length - 39)}`;
            }
            msg += ` ${detail}`;
        }
    }else {
        goToLineStart(msg);
        process.stderr.write("\n");
    }
    if (percentage> 10 && lastMessage !== msg) {
        goToLineStart(msg);
        process.stderr.write(msg);
        lastMessage = msg;
    }
};

const goToLineStart = nextMessage => {
    let str = "";
    for (; lineCaretPosition > nextMessage.length; lineCaretPosition--) {
        str += "\b \b";
    }
    for (var i = 0; i < lineCaretPosition; i++) {
        str += "\b";
    }
    lineCaretPosition = nextMessage.length;
    if (str) process.stderr.write(str);
};

module.exports = progressHandler;
