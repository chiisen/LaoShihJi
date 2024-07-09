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
      console.log(file);
      const text = fs.readFileSync(file.trim(), "utf8");
      const lines = text.split(/\r?\n/); // 將文字檔案的內容分割成一行一行的陣列

      let list = []; // 宣告名為 list 的空陣列

      // 檔頭插入註解或指令
      let addList = [
        "#nullable disable // 臨時禁用可為 null 的參考型別檢查",
        //"#pragma warning disable CS8632 // 可為 Null 的參考型別註釋應只用於 '#nullable' 註釋內容中的程式碼。",
      ];
      addList.forEach((addLine) => {
        list.push(addLine);
      });

      lines.forEach((line) => {
        if (currentString(line.trim(), "field&class")) {
          if (previousString(list, "summary")) {
            list.push(line);
          } else {
            const spaceCount = line.indexOf("public"); // 指定空白數量
            const spaceString = " ".repeat(spaceCount); // 生成包含指定數量空白的字串
            list.push(spaceString + "/// <summary>");
            list.push(spaceString + "/// ");
            list.push(spaceString + "/// </summary>");
            list.push(line); // 將符合條件的行添加到 list 陣列中
          }
        } else {
          list.push(line);
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

        fs.writeFileSync(file.trim(), dataWithBOM, "utf8");
        count++;
      }
    });
    console.log(`新增註解 ${count} 檔案.`);
  } catch (err) {
    console.error(err);
  }
}

/**
 * 判斷目前這行是否為指定格式的字串
 * @param {*} text
 * @returns
 */
function currentString(text, type) {
  switch (type) {
    case "field":
      // 只處理欄位
      return text.startsWith("public") && text.includes("{ get; set; }");
    case "class":
      // 只處理類別
      return text.startsWith("public class");
    case "field&class":
      const publicCapitalPattern = /^public [A-Z]/; // 正則表達式，匹配 "public " 後跟一個大寫字母

      return (
        (text.startsWith("public") && text.includes("{ get; set; }")) ||
        text.startsWith("public class") ||
        text.startsWith("public async") ||
        text.startsWith("public bool") ||
        text.startsWith("public string") ||
        text.startsWith("public Task") ||
        text.startsWith("public enum") ||
        text.startsWith("public static") ||
        text.startsWith("public abstract class") ||
        text.startsWith("public void") ||
        text.startsWith("public interface") ||
        text.startsWith("public DateTime") ||
        text.startsWith("public int") ||
        text.startsWith("public long") ||
        text.startsWith("public (") ||
        publicCapitalPattern.test(text)
      ); // 使用正則表達式進行匹配
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
      return (
        list[previousIndex].includes("</summary>") ||
        list[previousIndex].includes("[Required]") ||
        list[previousIndex].includes("[Route(") ||
        list[previousIndex].includes("[HttpPost(") ||
        list[previousIndex].includes("[HttpGet(") ||
        list[previousIndex].includes("[ApiController]") ||
        list[previousIndex].includes("</returns>") ||
        // W1
        list[previousIndex].includes("[DefaultValue(") ||
        list[previousIndex].includes("[StringLength(") ||
        list[previousIndex].includes("[JsonIgnore(") ||
        list[previousIndex].includes("[MaxLength(") ||
        list[previousIndex].includes("[JsonProperty(") ||
        list[previousIndex].includes("[Required]") ||
        list[previousIndex].includes("[MinLength(") ||
        list[previousIndex].includes("[Obsolete(") ||
        list[previousIndex].includes("[Range(") ||
        list[previousIndex].includes("[XmlElement(") ||
        list[previousIndex].startsWith("//public") ||
        list[previousIndex].includes("[Produces(") ||
        list[previousIndex].includes("[HttpPost]")
        
        //list[previousIndex].startsWith("//")
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
