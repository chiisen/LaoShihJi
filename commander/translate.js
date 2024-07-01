const fs = require("fs");
const cheerio = require("cheerio");
const XLSX = require("xlsx");
const { JSDOM } = require("jsdom");

/**
 * (1) 取出 html (vue 檔案) 的 tag 內容轉成 Excel 檔案彙整給翻譯
 * @param {*} opts
 * @returns
 */
function commanderTranslate1(opts) {
  if (opts === undefined) {
    return;
  }
  // 假設 readTextFile 是一個同步函數，用於讀取檔案內容(要拿掉 <template> 標籤，不然會無發解析)
  const html = readTextFile("./AboutDirectionsView1.vue");

  // 使用 jsdom 解析 HTML
  const { document } = new JSDOM(html).window;

  // 選擇所有的 <li> 和 <p> 標籤
  const elements = document.querySelectorAll("li, p");

  // 提取並輸出每個元素的文字內容
  const texts = Array.from(elements).map((element) => element.textContent);
  //console.log(texts);

  const data = [];
  let count = 1;
  texts.forEach((liContent) => {
    const trimmedContent = liContent.trim();
    const lines = trimmedContent.split("\n");
    if (lines && lines.length > 0) {
      lines.forEach((line) => {
        const l = line.trim();
        if (l.length > 0) {
          data.push({ id: count, message: line });
          count += 1;
        }
      });
    }
  });

  const filePath = "./output1.xlsx";

  writeToExcel(data, filePath);
}

/**
 * 取出 html (vue 檔案) 的 tag 內容轉成 Excel 檔案彙整給翻譯
 * @param {*} opts
 * @returns
 */
function commanderTranslate(opts) {
  if (opts === undefined) {
    return;
  }

  // 使用範例
  const htmlContent = readTextFile("./AboutDirectionsView.vue");
  const liContents = extractLiContents(htmlContent, "li");
  //console.log(liContents);

  const data = [];
  let count = 1;
  liContents.forEach((liContent) => {
    const trimmedContent = liContent.trim();
    const lines = trimmedContent.split("\n");
    if (lines && lines.length > 0) {
      lines.forEach((line) => {
        const l = line.trim();
        if (l.length > 0) {
          data.push({ id: count, message: line });
          count += 1;
        }
      });
    }
  });

  const filePath = "./output.xlsx";

  writeToExcel(data, filePath);
}

/**
 *
 * @param {*} data
 * @param {*} filePath
 */
function writeToExcel(data, filePath) {
  // 創建一個工作簿
  const wb = XLSX.utils.book_new();

  // 將 JS 數據對象轉換為工作表
  const ws = XLSX.utils.json_to_sheet(data);

  // 將工作表添加到工作簿
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  // 寫入檔案
  XLSX.writeFile(wb, filePath);
}

/**
 * 讀取純文字檔案
 *
 * @param {*} subPath
 * @param {*} insertText
 */
function readTextFile(subPath) {
  try {
    const data = fs.readFileSync(subPath, "utf8");
    //console.log(data);
    return data;
  } catch (err) {
    console.error(err);
    return err;
  }
}

/**
 * 從 HTML 中提取 <li> 標籤的內容
 *
 * @param {*} html
 */
function extractLiContents(html, tag) {
  const $ = cheerio.load(html);
  const liContents = [];
  $(tag).each(function (i, elem) {
    liContents.push($(this).text());
  });
  return liContents;
}

module.exports = { commanderTranslate, commanderTranslate1 };
