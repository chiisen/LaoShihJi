const xlsx = require("node-xlsx");
const clc = require("cli-color");
const fs = require("fs");

/**
 * 重複資料檢查
 */
function commanderCheck(opts) {
  if (opts === undefined) {
    return;
  }
  console.log("將 Excel 轉換為 csv 檔案!");
  // 顯示目前所在路徑
  console.log(process.cwd());

  const excel = `${process.cwd()}/H1Wallet.xlsx`;
  if (!fs.existsSync(excel)) {
    console.error(`\n 讀檔失敗，找不到 ${excel}`);
    process.exit(1);
  }

  let str = "";
  const data = getExcel(excel);
  if (data !== undefined) {
    // 創建一個 Map 物件
    let UnitKeyMap = new Map();

    let rowCounter = 0;

    data.forEach((row) => {
      let key = "";
      let log = true;
      row.forEach((cell) => {
        key += `${cell}|`;
      });

      // 檢查鍵是否已存在
      if (!UnitKeyMap.has(key)) {
        // 如果不存在，新增鍵值對
        UnitKeyMap.set(key, 0);
        //console.log(`${rowCounter}: 新增了鍵值對: ${key}`);
      } else {
        // 如果已存在，處理重複的情況
        if (log) {
          console.log(`${rowCounter}: 鍵 ${key} 已存在。`);
          log = false;
        }
      }

      rowCounter += 1;
    });

    console.log(`共有 ${rowCounter} 筆資料。`);
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

module.exports = { commanderCheck };
