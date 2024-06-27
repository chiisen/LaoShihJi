#!/usr/bin/env node

let program = require("commander");
const redis = require("redis");
const fs = require("fs");
const xlsx = require("node-xlsx");
const clc = require("cli-color");
// Require the lib, get a working terminal
var term = require("terminal-kit").terminal;

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
  .option("-a | --astrology", "猜星座")
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

  sync().then();

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
  console.log(sheet);

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
  fs.writeFileSync(`${subPath}`, BOM + insertText, "utf8");
}

// 所屬的星座
const myAstrologyMap = new Map([
  ["a", "巨蟹"],
  ["b", "射手"],
  ["c", "魔羯"],
  ["d", "水瓶"],
  ["e", "處女"],
  ["f", "金牛"],
  ["g", "天蠍"],
  ["h", "雙魚"],
  ["i", "獅子"],
  ["j", "牡羊"],
  ["k", "天秤"],
  ["l", "雙子"],
]);

const astrologyMap = new Map([
  [1, "1.有某種運動是你特別喜歡的 (1.Y 2.N)"],
  [2, "2.覺得自己是個野蠻女友 (1.Y 2.N)"],
  [3, "3.喜歡走在流行的前端 (1.Y 2.N)"],
  [4, "4.曾有過一腳踏多船的經驗 (1.Y 2.N)"],
  [5, "5.喜歡咖啡勝過可可 (1.Y 2.N)"],
  [6, "6.熱衷於社團 (1.Y 2.N)"],
  [7, "7.覺得同居比結婚好 (1.Y 2.N)"],
  [8, "8.沒有特別支援的政黨 (1.Y 2.N)"],
  [9, "9.如果你對你的另一半已經沒感覺了,你會 (1.維持現狀 2.離婚"],
  [
    10,
    "10.如果被你撞見你的男or女友跟另一個異性走在一起,你會 (1.裝做沒看見,快速走過走 2.上前去問個究竟)",
  ],
  [11, "11.喜歡粉藍色多過粉紅色 (1.Y 2.N)"],
  [12, "12.你是 (1.右撇子 2.左撇子)"],
  [13, "13.比較喜歡用哪種大衆運輸工具 (1.捷運、公車 2.計程車)"],
  [14, "14.比較不喜歡被罵 (1.八婆(自大狂) 2.男人婆(娘娘腔)"],
  [15, "15.外出逛街裝扮通常是 (1.運動型 2.淑女型)"],
  [16, "16.你的球鞋多過休閒鞋 (1.Y 2.N)"],
  [17, "17.喜歡打籃球 (1.Y 2.N)"],
  [18, "18.早上起床時會折好棉被 (1.Y 2.N)"],
  [19, "19.喜歡Energy多過5566 (1.Y 2.N)"],
  [20, "20.打死也不願意買盜版 (1.Y 2.N)"],
  [21, "21.在學校是所謂得乖寶寶 (1.Y 2.N)"],
  [22, "22.喜歡西洋電影多過國片 (1.Y 2.N)"],
  [23, "23.喜歡娛樂新聞多過政治新聞 (1.Y 2.N)"],
  [24, "24.喜歡打電話聊天 (1.Y 2.N)"],
  [25, "25.手機電話簿中異性多過同性 (1.Y 2.N)"],
  [
    26,
    "26.接到打錯電話會 (1.跟他說你打錯了後直接挂斷 2.跟他說你打錯了後順便哈拉一下",
  ],
  [27, "27.目前有心儀的物件 (1.Y 2.N)"],
  [28, "28.被人誤會時會 (1.死命澄清自己的清白 2.讓時間還你清白,不多做解釋"],
  [29, "29.喜歡全家多過7-11 (1.Y 2.N)"],
  [30, "30.相信星座這回事 (1.Y 2.N)"],
  [31, "31.有偷偷詛咒過別人 (1.Y 2.N)"],
  [32, "32.到KTV時麥克風大多時候都你手上 (1.Y 2.N)"],
  [33, "33.受不了噪音 (1.Y 2.N)"],
  [34, "34.現在背的出好朋友的手機號碼 (1.Y 2.N)"],
  [35, "35.手機至少一年換一次 (1.Y 2.N)"],
  [36, "36.討厭在路邊攤吃飯 (1.Y 2.N)"],
  [37, "37.找不到男(女)友時會發瘋 (1.Y 2.N)"],
  [
    38,
    "38.若全世界異性瞬間消失,你會 (1.試著跟同性交往看看 2.寧願自殺也不願成爲GAY",
  ],
  [39, "39.一個人走再街上看到成雙成對情侶時會有沖過去飛踢他們的衝動 (1.Y 2.N)"],
  [40, "40.喜歡上網多過看電視 (1.Y 2.N)"],
  [41, "41.認爲自己還挺闊氣的 (1.Y 2.N)"],
  [42, "42.看到前一任男友會打招呼 (1.Y 2.N)"],
  [43, "43.認爲曖昧是一種幸福 (1.Y 2.N)"],
  [44, "44.會跟第一次見面的異性單獨去看電影 (1.Y 2.N)"],
  [45, "45.有很喜歡很喜歡一個藝人or明星過 (1.Y 2.N)"],
  [46, "46.現在想到國中時的頭髮會覺得很蠢 (1.Y 2.N)"],
  [47, "47.小時後比現在還胖 (1.Y 2.N)"],
  [48, "48.很喜歡自己的星座 (1.Y 2.N)"],
  [49, "49.迷路會到警察局找警察杯杯 (1.Y 2.N)"],
  [50, "50.決不花一毛錢在保養腳指上 (1.Y 2.N)"],
  [51, "51.想回到過去 (1.Y 2.N)"],
  [52, "52.會說夢話 (1.Y 2.N)"],
  [53, "53.在公車上? |故意裝睡 (1.Y 2.N)"],
  [54, "54.曾再電話中聊超過一小時過 (1.Y 2.N)"],
  [55, "55.有定期買雜誌的習慣 (1.Y 2.N)"],
  [56, "56.有心儀的異性不會跟別人說 (1.Y 2.N)"],
]);

const astrologyYesMap = new Map([
  [1, "6"],
  [2, "5"],
  [3, "8"],
  [4, "7"],
  [5, "18"],
  [6, "17"],
  [7, "20"],
  [8, "15"],
  [9, "17"],
  [10, "14"],
  [11, "19"],
  [12, "16"],
  [13, "27"],
  [14, "22"],
  [15, "21"],
  [16, "24"],
  [17, "23"],
  [18, "28"],
  [19, "25"],
  [20, "26"],
  [21, "35"],
  [22, "30"],
  [23, "29"],
  [24, "32"],
  [25, "31"],
  [26, "34"],
  [27, "36"],
  [28, "30"],
  [29, "37"],
  [30, "39"],
  [31, "38"],
  [32, "44"],
  [33, "39"],
  [34, "40"],
  [35, "38"],
  [36, "37"],
  [37, "45"],
  [38, "47"],
  [39, "46"],
  [40, "52"],
  [41, "49"],
  [42, "50"],
  [43, "51"],
  [44, "48"],
  [45, "49"],
  [46, "50"],
  [47, "51"],
  [48, "52"],
  [49, "54"],
  [50, "55"],
  [51, "c"],
  [52, "d"],
  [53, "e"],
  [54, "g"],
  [55, "i"],
  [56, "k"],
]);

const astrologyNoMap = new Map([
  [1, "9"],
  [2, "10"],
  [3, "11"],
  [4, "12"],
  [5, "14"],
  [6, "13"],
  [7, "16"],
  [8, "19"],
  [9, "13"],
  [10, "18"],
  [11, "15"],
  [12, "20"],
  [13, "23"],
  [14, "28"],
  [15, "25"],
  [16, "26"],
  [17, "27"],
  [18, "22"],
  [19, "21"],
  [20, "24"],
  [21, "31"],
  [22, "33"],
  [23, "36"],
  [24, "34"],
  [25, "35"],
  [26, "32"],
  [27, "29"],
  [28, "33"],
  [29, "41"],
  [30, "42"],
  [31, "43"],
  [32, "40"],
  [33, "42"],
  [34, "44"],
  [35, "43"],
  [36, "41"],
  [37, "49"],
  [38, "51"],
  [39, "50"],
  [40, "48"],
  [41, "45"],
  [42, "46"],
  [43, "47"],
  [44, "52"],
  [45, "54"],
  [46, "55"],
  [47, "53"],
  [48, "56"],
  [49, "a"],
  [50, "b"],
  [51, "53"],
  [52, "56"],
  [53, "f"],
  [54, "h"],
  [55, "j"],
  [56, "l"],
]);

if (opts.astrology) {
  console.log("水象星座(巨蟹.天蠍.雙魚)請從1開始");
  console.log("火象星座(牡羊.獅子.射手)請從2開始");
  console.log("土象星座(金牛.處女.魔羯)請從3開始");
  console.log("風象星座(雙子.天枰.水瓶)請從4開始");

  // 選星座四象
  let myInput;
  term.magenta("請輸入數字1、2、3、4: ");
  term.inputField(function (error, input) {
    myInput = input;
    term.green("\n你選擇了 '%s'\n", input);

    myInput = parseInt(myInput, 10); // 確保輸入被解析為數字，第二個參數10表示十進制
    if (isNaN(myInput)) {
      term.red("\n選擇錯誤 '%s'\n", input);
      return;
    }
    if (myInput >= 1 && myInput <= 4) {
      const q = astrologyMap.get(myInput);
      console.log(q);

      // 選星題目
      term.magenta("請輸入數字1、2: ");
      term.inputField(function (error, input) {
        myInput = input;
        term.green("\n你選擇了 '%s'\n", input);
    
        myInput = parseInt(myInput, 10); // 確保輸入被解析為數字，第二個參數10表示十進制
        if (isNaN(myInput)) {
          term.red("\n選擇錯誤 '%s'\n", input);
          return;
        }
        if (myInput == 1) {
          let num = astrologyYesMap.get(myInput);
          if (isNotANumber(num)) {
            term.magenta(myAstrologyMap[num.toLowerCase()]);
            return;
          } else {
            myInput = parseInt(num, 10);
          }
        } else if (myInput == 2) {
          let num = astrologyNoMap.get(myInput);
          if (isNotANumber(num)) {
            term.magenta(myAstrologyMap[num.toLowerCase()]);
            return;
          } else {
            myInput = parseInt(num, 10);
          }
        }
      });
    }
  });
  return

  // 選星題目
  myInput;
  while (true) {
    //myInput = await askQuestion("請輸入數字1、2: ");
    myInput = parseInt(myInput, 10); // 確保輸入被解析為數字，第二個參數10表示十進制
    if (myInput >= 1 && myInput <= 2) {
      console.log(astrologyMap[myInput]);
      if (myInput == 1) {
        let num = astrologyYesMap[myInput];
        if (isNotANumber(num)) {
          console.log(myAstrologyMap[num.toLowerCase()]);
          break;
        } else {
          myInput = num;
        }
      } else if (myInput == 2) {
        let num = astrologyNoMap[myInput];
        if (isNotANumber(num)) {
          console.log(myAstrologyMap[num.toLowerCase()]);
          break;
        } else {
          myInput = num;
        }
      }
    }
  }
}

// 判斷是否為數值
function isNotANumber(str) {
  return isNaN(Number(str));
}

// 取得輸入數值
async function askQuestion(query) {
  // 創建 readline.Interface 的實例
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // 提問並等待用戶輸入
  rl.question("What is your name? ", (name) => {
    console.log(`Hello, ${name}!`);

    // 不要忘記關閉 readline.Interface 的實例！
    rl.close();
  });
}


