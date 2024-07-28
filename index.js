#!/usr/bin/env node

const program = require("commander");
const redis = require("redis");
const fs = require("fs");

const { commanderExcel } = require("./commander/excel");
const { commanderAstrology } = require("./commander/astrology");
const {
  commanderTranslate,
  commanderTranslate1,
} = require("./commander/translate");
const { commanderFile } = require("./commander/file");
const { commanderFormat } = require("./commander/format");
const { commanderStrategy } = require("./commander/strategy");
const { commanderCheck } = require("./commander/check");
const { commanderAbstractSyntaxTree } = require("./commander/abstractSyntaxTree");

function errorColor(str) {
  // 添加 ANSI 转义字符，以将文本输出为红色
  return `\x1b[31m${str}\x1b[0m`;
}

console.log("程式啟動了!\n");

program
  .version("1.0.0")
  .option("-d | --demo <str>", "tinder 可以吃嗎?(基礎範例無實作)")
  .option("-f | --file <str>", "file 讀取 c# 檔案並新增註解")
  .option("-o | --format <str>", "format 讀取 c# 檔案轉成 UTF8-BOM 檔案格式")
  .option("-s | --strategy <str>", "策略模式範例")
  .option("-c | --check <str>", "重複資料檢查")
  .option("-a | --ast <str>", "abstract syntax tree")
  .option(
    "-e | --excel",
    "讀取 Excel 檔案 GameList.xlsx 轉換為 GameList.csv 檔案"
  )
  .option("-a | --astrology", "猜星座(未完成)")
  .option(
    "-t | --translate",
    "取出 html (vue 檔案) 的 tag 內容轉成 Excel 檔案彙整給翻譯"
  )
  .option(
    "-t1 | --translate1",
    "取出 html (vue 檔案) 的 tag 內容轉成 Excel 檔案彙整給翻譯"
  )
  .showHelpAfterError(errorColor("<使用 -h 參數可以提示更多使用功能>")) // 錯誤提示訊息
  .configureOutput({
    // 此处使输出变得容易区分
    writeOut: (str) => process.stdout.write(`[OUT] ${str}`),
    writeErr: (str) => process.stdout.write(`[ERR] ${str}`),
    // 将错误高亮显示
    outputError: (str, write) => write(errorColor(str)),
  })
  .parse(process.argv);

const opts = program.opts();

if (opts.demo) {
  try {
    console.log("好吃!");

    const client = redis.createClient(6379, "127.0.0.1");
    client.connect().then();

    const sync = async () => {
      const reply1 = await client.get("lsj");
      console.log(reply1);
    };

    sync().then();

    client.quit().then();
  } catch (error) {
    console.error("錯誤訊息:", error.message);
  }
}

// file 讀取檔案
if (opts.file) {
  commanderFile(opts.file);
}

// 轉為 UTF8-BOM 檔案格式
if (opts.format) {
  commanderFormat(opts.format);
}

// 讀取 Excel 檔案 GameList.xlsx 轉換為 GameList.csv 檔案
if (opts.excel) {
  commanderExcel(opts.excel);
}

// 猜星座(未完成)
if (opts.astrology) {
  commanderAstrology(opts.astrology);
}

// 取出 html (vue 檔案) 的 tag 內容轉成 Excel 檔案彙整給翻譯
if (opts.translate) {
  commanderTranslate(opts.translate);
}

// 取出 html (vue 檔案) 的 tag 內容轉成 Excel 檔案彙整給翻譯
if (opts.translate) {
  commanderTranslate(opts.translate);
}

// (1) 取出 html (vue 檔案) 的 tag 內容轉成 Excel 檔案彙整給翻譯
if (opts.translate1) {
  commanderTranslate1(opts.translate1);
}

// 策略模式範例
if (opts.strategy) {
  commanderStrategy(opts.strategy);
}

// 重複資料檢查
if (opts.check) {
  commanderCheck(opts.check);
}

// abstract syntax tree
if (opts.ast) {
  commanderAbstractSyntaxTree(opts.ast);
}
