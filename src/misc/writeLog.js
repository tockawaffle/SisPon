const path = require("path");
const sevenZip = require("7zip-bin");
const moment = require("moment");
const { writeFileSync, mkdirSync, renameSync } = require("fs");
const { add } = require("node-7z");

async function writeLogs(errorToWrite) {
    if (!errorToWrite) throw new Error("Nenhum erro foi encontrado.");
    const dir = path.join(__dirname, "../../logs");
    const file = path.join(dir, "/error.log");

    if (file) {
        //Zips the file
        const pathToZip = sevenZip.path7za;
        const name = moment()
            .format("DD/MM/YYYY HH:MM:SS")
            .replace(/\//g, "_")
            .replace(/:/g, "-");
        const oldPath = path.join(__dirname, `../../${name}.zip`);
        const newPath = path.join(__dirname, `../../logs/${name}.zip`);
        add(`${name}.zip`, file, {
            $bin: pathToZip,
        });
        setTimeout(() => {
            renameSync(oldPath, newPath);
        }, 4500);
        throw new Error(errorToWrite);
    }

    writeFileSync(dir + "/error.log", errorToWrite, (err) => {
        // If the directory doesn't exist, create it
        if (err && err.code === "ENOENT") {
            mkdirSync(dir, { recursive: true }, (err) => {
                if (err) throw err;
                else {
                    writeFileSync(dir, +"/error.log", errorToWrite, (err) => {
                        if (err) throw err;
                    });
                }
            });
        }
    });
}

module.exports.writeLogs = writeLogs;
