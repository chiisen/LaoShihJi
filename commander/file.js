const fs = require("fs");
const path = require("path");

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
    let count = 0;
    files.forEach((file) => {
      const filePath = file.trim();
      console.log(filePath);
      const text = fs.readFileSync(filePath, "utf8");
      const lines = text.split(/\r?\n/); // 將文字檔案的內容分割成一行一行的陣列

      let list = []; // 宣告名為 list 的空陣列

      // 檔頭插入註解或指令
      let addList = [
        "#nullable disable // 臨時禁用可為 null 的參考型別檢查",
        "#pragma warning disable CS8632 // 可為 Null 的參考型別註釋應只用於 '#nullable' 註釋內容中的程式碼。",
      ];
      addList.forEach((addLine) => {
        pushListInfo(list, addLine);
      });

      lines.forEach((line) => {
        if (currentString(line, "field&class")) {
          if (previousString(list, "summary")) {
            pushListInfo(list, line);
          } else {
            const firstNonWhitespaceIndex = line.search(/\S/); // 使用正則表達式找到第一個非空白字符
            if (firstNonWhitespaceIndex > -1) {
              console.log(`空白到第一個字的位數: ${firstNonWhitespaceIndex}，${line}`);
              const spaceString = " ".repeat(firstNonWhitespaceIndex); // 生成包含指定數量空白的字串
              pushListInfo(list, spaceString + "/// <summary>");
              pushListInfo(list, spaceString + "/// ");
              pushListInfo(list, spaceString + "/// </summary>");
              pushListInfo(list, line);// 將符合條件的行添加到 list 陣列中
            } else {
              throw new Error("這一行只包含空白或是空行");
            }
          }
        } else {
          pushListInfo(list, line);
        }
      });

      if (list.length === lines.length - addList.length) {
        // 不須寫檔案
      } else {
        // 將 list 的每個元素轉換成一行，並使用換行符號連接
        const data = list.join("\n");

        // 定義 BOM 和將換行符號轉換為 Windows 格式的函數
        const addBOMAndConvertNewlines = (data) => {
          const BOM = "\uFEFF";
          return BOM + data.replace(/\n/g, "\r\n");
        };

        // 使用 UTF-8 編碼並包含 BOM，並將換行符號轉換為 Windows 格式
        const dataWithBOM = addBOMAndConvertNewlines(data);

        fs.writeFileSync(filePath, dataWithBOM, "utf8");
        count++;
      }
    });
    console.log(`新增註解 ${count} 檔案.`);
  } catch (err) {
    console.error(err);
  }
}

/**
 * 
 * @param {*} list 
 * @param {*} obj 
 */
function pushListInfo(list, obj) {
  list.push(obj);
}

/**
 * 
 * @param {*} line 
 */
function getLineType(line) {
  if (line.includes("enum")) {
    return "enum";
  }
  else if (line.includes("class")) {
    return "class";
  }
  else {
    return ""
  }
}

/**
 * 判斷目前這行是否為指定格式的字串
 * @param {*} text
 * @returns
 */
function currentString(text, type) {
  switch (type) {
    case "field&class":
      const currentLine = text.trim();
      return currentLine.startsWith("public")
        || currentLine.startsWith("private")
        || currentLine.startsWith("void");
    default:
      return false;
  }
}

/**
 * 判斷上一行是否為指定格式的字串
 * @param {*} text
 * @returns
 */
function previousString(list, type) {
  switch (type) {
    case "summary":
      const previousIndex = list.length - 1;
      const previousLine = list[previousIndex].trim();
      return (
        previousLine.startsWith("/// <") ||
        previousLine.startsWith("[")
      );
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

module.exports = { commanderFile };
