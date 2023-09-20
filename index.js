#!/usr/bin/env node

var program = require("commander")
const redis = require('redis')

function errorColor(str) {
  // 添加 ANSI 转义字符，以将文本输出为红色
  return `\x1b[31m${str}\x1b[0m`
}

console.log("程式啟動了!\n")

program
  .version("1.0.0")
  .option("-t | --tinder <str>", "Tinder 可以吃嗎?")
  .option("-f | --file <str>", "file 讀取檔案")
  .showHelpAfterError(errorColor("<使用 -h 參數可以提示更多使用功能>")) // 錯誤提示訊息
  .configureOutput({
    // 此处使输出变得容易区分
    writeOut: (str) => process.stdout.write(`[OUT] ${str}`),
    writeErr: (str) => process.stdout.write(`[ERR] ${str}`),
    // 将错误高亮显示
    outputError: (str, write) => write(errorColor(str)),
  })
  .parse(process.argv)

const opts = program.opts()

console.log("you ordered:" + opts.tinder)
if (opts.tinder) 
{
    console.log("好吃!")

    const client = redis.createClient(6379, '127.0.0.1');
    client.connect();

    const sync = async () => {
      const reply1 = await client.get("lsj");
      console.log(reply1);
    }    

    sync()

    client.quit()
    
}
else
{ 
    console.log("不好吃!")
}

console.log("you ordered:" + opts.file)
if (opts.file) 
{
  console.log("呼叫讀檔!")
}


