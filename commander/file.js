const fs = require("fs");
const path = require('path');

/**
 * file 讀取 c# 檔案並新增註解
 * @param {*} opts
 * @returns
 */
function commanderFile(opts) {
  if (opts === undefined) {
    return;
  }
  try {
    const dirPath = opts.trim();
    const files = findCsFiles(dirPath);
    files.forEach(file => {
      console.log(file);
      const text = fs.readFileSync(file.trim(), "utf8");
      const lines = text.split(/\r?\n/); // 將文字檔案的內容分割成一行一行的陣列

      let list = []; // 宣告名為 list 的空陣列
      list.push("#nullable disable // 臨時禁用可為 null 的參考型別檢查");
      lines.forEach((line) => {
        if (currentString(line.trim(), 'field&class')) {
          if (previousString(list, 'summary')) {
            list.push(line);
          }
          else {
            const spaceCount = line.indexOf('public');// 指定空白數量
            const spaceString = " ".repeat(spaceCount); // 生成包含指定數量空白的字串
            list.push(spaceString + "/// <summary>");
            list.push(spaceString + "/// ");
            list.push(spaceString + "/// </summary>");
            list.push(line); // 將符合條件的行添加到 list 陣列中
          }
        }
        else {
          list.push(line);
        }
      });

      if (list.length === lines.length - 1) {
        // 不須寫檔案
      }
      else {
        // 將 list 的每個元素轉換成一行，並使用換行符號連接
        const data = list.join('\n');
        fs.writeFileSync(file.trim(), data, "utf8");
      }

    });

  } catch (err) {
    console.error(err);
  }
}

/**
 * 判斷是否為指定格式的字串
 * @param {*} text 
 * @returns 
 */
function currentString(text, type) {
  switch (type) {
    case 'field':
      // 只處理欄位
      return (text.startsWith('public') && text.includes("{ get; set; }"));
    case 'class':
      // 只處理類別
      return text.startsWith('public class');
    case 'field&class':
      return (text.startsWith('public') && text.includes("{ get; set; }")) || text.startsWith('public class');
    default:
      return false;
  }
}

/**
 * 判斷是否為指定格式的字串
 * @param {*} text 
 * @returns 
 */
function previousString(list, type) {
  switch (type) {
    case 'summary':
      const previousIndex = list.length - 1;
      return list[previousIndex].includes("</summary>");
    default:
      return false;
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
    fs.readdirSync(directory).forEach(file => {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        readDirectory(filePath);
      } else if (path.extname(file) === '.cs') {
        results.push(filePath);
      }
    });
  }

  readDirectory(dirPath);
  return results;
}

module.exports = { commanderFile };
