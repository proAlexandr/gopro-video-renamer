const gpmfExtract = require('gpmf-extract');
const fsLib = require('fs');
const path = require('path');
const dateFormat = require("dateformat");
const exiftool = require("exiftool-vendored").exiftool

const fs = fsLib.promises;


const folderPath = process.argv[2];
if (!folderPath) {
  throw new Error('Please specify folder path\nExample: node index.js "D:\\Photos\\2020_12 Светлогорск"');
}

const dateMethods = ['gpmf', 'exif'];
const dateMethod = process.argv[3];
if (dateMethods.indexOf(dateMethod) < 0) {
  throw new Error(`Please specify method, one of: ${dateMethods.join(', ')}.`);
}

function matchFile(fileName) {
  return fileName.match(/^(G[HX]\d{6})\.MP4$/);
}

// TODO remove after fix https://github.com/JuanIrache/gpmf-extract#handling-large-files
function bufferAppender(path, chunkSize) {
  return function(mp4boxFile) {
    var stream = fsLib.createReadStream(path, {'highWaterMark': chunkSize});
    var bytesRead = 0;
    stream.on('end', () => {
      mp4boxFile.flush();
    });
    stream.on('data', (chunk) => {
      var arrayBuffer = new Uint8Array(chunk).buffer;
      arrayBuffer.fileStart = bytesRead;
      var next = mp4boxFile.appendBuffer(arrayBuffer);
      bytesRead += chunk.length;
    });
    stream.resume();
  }
}


async function extractDate(filePath, method) {
  if (method === 'gpmf') {
    const res = await gpmfExtract(bufferAppender(filePath, 10 * 1024 * 1024));
    return res.timing.start;
  } else if (method === 'exif') {
    const res = await exiftool.read(filePath);
    const d = res.MediaCreateDate;
    return new Date(d.year, d.month - 1, d.day, d.hour, d.minute, d.second);
  } else {
    throw new Error(`Unknown dateMethod: "${method}"`)
  }
}

async function main() {
  const fileNames = await fs.readdir(folderPath);

  for (const fileName of fileNames) {
    const match = matchFile(fileName);
    if (!match) continue;
    const filePath = path.join(folderPath, fileName);
    const baseFileName = match[1];

    let date;
    try {
      date = await extractDate(filePath, dateMethod)
    } catch (e) {
      console.error(`${fileName}: ERROR: Can't extract date. ${e.message}`)
      continue;
    }

    const dateString = dateFormat(date, "yyyy-mm-dd_HH-MM-ss");
    const newFileName = `${dateString} (${baseFileName}).mp4`
    const newFilePath = path.join(folderPath, newFileName);

    const isFileExist = fsLib.existsSync(newFilePath);
    if (isFileExist) {
      console.error(`${fileName}: ERROR: File ${newFileName} already exists`)
      continue;
    }

    await fs.rename(filePath, newFilePath)
    console.log(`${fileName}: => ${newFileName}`);
  }
}

main().then(() => {
  process.exit();
});