#!/usr/bin/env node

var program = require("commander")

program
  .version("1.0.0")
  .option("-t | --tinder <str>", "Tinder 可以吃嗎?")
  .showHelpAfterError(errorColor("<使用 -h 參數可以提示更多使用功能>")) // 錯誤提示訊息
  .configureOutput({
    // 此处使输出变得容易区分
    writeOut: (str) => process.stdout.write(`[OUT] ${str}`),
    writeErr: (str) => process.stdout.write(`[ERR] ${str}`),
    // 将错误高亮显示
    outputError: (str, write) => write(errorColor(str)),
  })
  .parse(process.argv)

function errorColor(str) {
  // 添加 ANSI 转义字符，以将文本输出为红色
  return `\x1b[31m${str}\x1b[0m`
}

const opts = program.opts()

console.log("you ordered:" + opts.tinder)
if (opts.tinder) 
{
    console.log("好吃!")
}
else
{ 
    console.log("不好吃!")
}
