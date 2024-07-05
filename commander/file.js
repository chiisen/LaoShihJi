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
    const files = findCsFiles(opts.trim());
    files.forEach(file => {
      console.log(file);
      const text = fs.readFileSync(file.trim(), "utf8");
      console.log(text);
    });
    
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
