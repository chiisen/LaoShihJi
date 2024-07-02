// Require the lib, get a working terminal
var term = require("terminal-kit").terminal;
const {
  myAstrologyMap,
  astrologyMap,
  astrologyYesMap,
  astrologyNoMap,
} = require("./astrology_data");

/**
 * 猜星座(未完成)
 * @param {*} opts
 * @returns
 */
async function commanderAstrology(opts) {
  if (opts === undefined) {
    return;
  }

  let isWait = true;
  let select = "-1";
  let step = "-1";
  await chooseTheFourElements(select, step, isWait);

  await waitForIsWaitFalse(isWait);

  console.log(`\n選擇${select}，程式結束!`);
}

// 定義一個函數來等待 isWait 變為 false
function waitForIsWaitFalse(isWait) {
  //console.log(`\n進入等待狀態，請稍候!`);
  return new Promise((resolve) => {
    (function waitForFalse() {
      if (!isWait) return resolve();
      setTimeout(waitForFalse, 100); // 每 100 毫秒檢查一次
    })();
  });
}

/**
 * 遞迴選擇星象答案
 * @param {*} select
 * @returns
 */
async function chooseTheAnswerRecursion(select, isWait) {
  const q = astrologyMap.get(select);
  term.blue(q + "\n");
  term.yellow("請輸入數字1、2: ");
  await processInput(function (error, input) {
    if (error) {
      isWait = false;
      return console.error(error);
    }
    term.green("\n你選擇了 '%s'\n", input);
    if (input == "1" || input == "2") {
      if (input === "1") {
        select = astrologyYesMap.get(select);
        if (myAstrologyMap.has(select)) {
          const astro = myAstrologyMap.get(select);
          term.green("星座: " + astro + "\n");
          isWait = false;
          process.exit();
        }
      } else {
        select = astrologyNoMap.get(select);
        if (myAstrologyMap.has(select)) {
          const astro = myAstrologyMap.get(select);
          term.green("星座: " + astro + "\n");
          isWait = false;
          process.exit();
        }
      }
      return chooseTheAnswerRecursion(select, isWait);
    } else {
      isWait = false;
      return "-1";
    }
  });
}

/**
 * 選星座四象(四大元素)
 */
async function chooseTheFourElements(select, step, isWait) {
  // 選星座四象
  term.blue("水象星座(巨蟹.天蠍.雙魚)請從1開始\n");
  term.blue("火象星座(牡羊.獅子.射手)請從2開始\n");
  term.blue("土象星座(金牛.處女.魔羯)請從3開始\n");
  term.blue("風象星座(雙子.天枰.水瓶)請從4開始\n");
  term.yellow("請輸入數字1、2、3、4: ");

  await processInput(function (error, input) {
    if (error) {
      return console.error(error);
    }
    select = input;
    term.green("\n你選擇了 '%s'\n", input);

    if (select == "1" || select == "2" || select == "3" || select == "4") {
      step = select;
      return chooseTheAnswerRecursion(select, isWait);
    } else {
      return (select = "-1");
    }
  });
}

/**
 *
 */
async function processInput(prompt, isDebug = false) {
  try {
    const input = await getInputPromise(prompt, isDebug);
    // 在這裡處理 input
    //console.log(`\n你輸入了: ${input}`);
    prompt(undefined, input);
  } catch (error) {
    // 處理錯誤
    console.error(error);
  }
}

/**
 * term.inputField()修改成同步函式
 */
function getInputPromise(prompt, isDebug = false) {
  return new Promise((resolve, reject) => {
    if (isDebug) {
      term(prompt); // 顯示 prompt(偵錯用)
    }
    term.inputField((error, input) => {
      if (error) {
        reject(error);
      } else {
        resolve(input); // 輸入完畢!
      }
    });
  });
}

module.exports = { commanderAstrology };
