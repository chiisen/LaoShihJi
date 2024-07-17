/**
 * 策略模式
 * @param {*} opts
 * @returns
 */
function commanderStrategy(opts) {
  if (opts === undefined) {
    return;
  }
  try {
    const add = (num1, num2) => num1 + num2;

    const subtract = (num1, num2) => num1 - num2;

    const multiply = (num1, num2) => num1 * num2;

    const numberToChinese = (number) => {
      const chineseNumbers = [
        "零",
        "一",
        "二",
        "三",
        "四",
        "五",
        "六",
        "七",
        "八",
        "九",
      ];
      return number
        .toString()
        .split("")
        .map((num) => chineseNumbers[parseInt(num, 10)])
        .join("");
    };

    const executeStrategy = (strategy, num1, num2) =>
      numberToChinese(strategy(num1, num2));

    const num1 = 10;
    const num2 = 5;

    const resultAdd = executeStrategy(add, num1, num2);
    console.log(`加法結果: ${resultAdd}`);

    const resultSubtract = executeStrategy(subtract, num1, num2);
    console.log(`減法結果: ${resultSubtract}`);

    const resultMultiply = executeStrategy(multiply, num1, num2);
    console.log(`乘法結果: ${resultMultiply}`);
  } catch (error) {
    console.error(error);
  }
}

module.exports = { commanderStrategy };
