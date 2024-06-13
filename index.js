#!/usr/bin/env node

let program = require("commander");
const redis = require("redis");
const fs = require("fs");
const xlsx = require("node-xlsx");
const clc = require("cli-color");

function errorColor(str) {
  // 添加 ANSI 转义字符，以将文本输出为红色
  return `\x1b[31m${str}\x1b[0m`;
}

console.log("程式啟動了!\n");

program
  .version("1.0.0")
  .option("-t | --tinder <str>", "Tinder 可以吃嗎?")
  .option("-f | --file <str>", "file 讀取檔案")
  .option("-e | --excel", "產生 Excel 範例檔案")
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

if (opts.tinder) {
  console.log("好吃!");

  const client = redis.createClient(6379, "127.0.0.1");
  client.connect().then();

  const sync = async () => {
    const reply1 = await client.get("lsj");
    console.log(reply1);
  };

  sync().then( );

  client.quit().then();
}

if (opts.file) {
  console.log("呼叫讀檔!");
}

if (opts.excel) {
  console.log("將 Excel 轉換為 csv 檔案!");
  // 顯示目前所在路徑
  console.log(__dirname);

  const gameIdListXlsx = `${__dirname}/GameList.xlsx`;
  if (!fs.existsSync(gameIdListXlsx)) {
    console.error(`\n 讀檔失敗，找不到 ${gameIdListXlsx}`);
    process.exit(1);
  }

  let str = "";
  const data = getExcel(gameIdListXlsx);
  if (data !== undefined) {
    let rowCounter = 0;
    data.forEach((row) => {
      row.forEach((cell) => {
        if (rowCounter === 0) {
          str += `${cell}` + ",";
        } else {
          if (cell === "true") {
            str += `"True"` + ",";
          } else {
            str += `"${cell}"` + ",";
          }
        }
      });
      str += "\n";
      rowCounter += 1;
    });
    const gameIdListCsv = `${__dirname}/GameList.csv`;
    writeText(gameIdListCsv, str);
  }
}

/**
 * 讀取 Excel
 *
 * @param {string} fileName
 * @param isLog
 * @param sheetIndex
 */
function getExcel(fileName, isLog = false, sheetIndex = 0) {
  console.log(clc.cyan(`"${fileName}" excel-parse start`));

  const excel = [];
  const sheets = xlsx.parse(fileName);
  let sheet;
  if (isNumeric(sheetIndex.toString())) {
    sheet = sheets[sheetIndex];
  } else {
    sheet = sheets.find((x) => x.name === sheetIndex);
  }
  console.log(sheet)

  // 輸出每行內容
  sheet.data.forEach((row) => {
    // 陣列格式, 根據不同的索引取數據
    excel.push(row);
  });

  console.log(clc.cyan(`"${fileName}" excel-parse end`));
  return excel;
}

/**
 * 檢查是否為數值
 *
 * @param {*} value
 * @returns
 */
function isNumeric(value) {
  return /^-?\d+$/.test(value);
}

/**
 * 寫入純文字檔案
 *
 * @param {*} subPath
 * @param {*} insertText
 */
function writeText(subPath, insertText) {
  const BOM = "\uFEFF";
  fs.writeFileSync(`${subPath}`,BOM + insertText, "utf8");
}
