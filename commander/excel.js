const xlsx = require("node-xlsx");
const clc = require("cli-color");
const fs = require("fs");

/**
 * 讀取 Excel 檔案 GameList.xlsx 轉換為 GameList.csv 檔案
 */
function commanderExcel(opts) {
  if (opts === undefined) {
    return;
  }

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
    const BOM = "\uFEFF";
    str = BOM + str;
    writeText(gameIdListCsv, str);
  }
}

/**
 * 寫入純文字檔案
 *
 * @param {*} subPath
 * @param {*} insertText
 */
function writeText(subPath, insertText) {
  fs.writeFileSync(`${subPath}`, insertText, "utf8");
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

module.exports = { commanderExcel };
