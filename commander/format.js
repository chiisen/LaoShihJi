const fs = require("fs");
const path = require("path");

/**
 * format 讀取 c# 檔案轉成 UTF8-BOM 檔案格式
 * @param {*} opts
 * @returns
 */
function commanderFormat(opts) {
  if (opts === undefined) {
    return;
  }
  try {
    const dirPath = opts.trim();
    const files = findCsFiles(dirPath);
    let count = 0;
    files.forEach((file) => {
      console.log(file);
      const text = fs.readFileSync(file.trim(), "utf8");
      const lines = text.split(/\r?\n/); // 將文字檔案的內容分割成一行一行的陣列

      let list = []; // 宣告名為 list 的空陣列

      lines.forEach((line) => {
        list.push(line);
      });

      // 將 list 的每個元素轉換成一行，並使用換行符號連接
      const data = list.join("\n");

      // 定義 BOM 和將換行符號轉換為 Windows 格式的函數
      const addBOMAndConvertNewlines = (data) => {
        const BOM = "\uFEFF";
        if (data.startsWith("\uFEFF")) {
          return data.replace(/\n/g, "\r\n");
        } else {
          return BOM + data.replace(/\n/g, "\r\n");
        }
      };

      // 使用 UTF-8 編碼並包含 BOM，並將換行符號轉換為 Windows 格式
      const dataWithBOM = addBOMAndConvertNewlines(data);

      fs.writeFileSync(file.trim(), dataWithBOM, "utf8");
      count++;
    });
    console.log(`新增註解 ${count} 檔案.`);
  } catch (err) {
    console.error(err);
  }
}

/**
 *
 * @param {*} dirPath
 * @returns
 */
function findCsFiles(dirPath) {
  let results = [];

  function readDirectory(directory) {
    fs.readdirSync(directory).forEach((file) => {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        readDirectory(filePath);
      } else if (path.extname(file) === ".cs") {
        results.push(filePath);
      }
    });
  }

  readDirectory(dirPath);
  return results;
}

module.exports = { commanderFormat };
