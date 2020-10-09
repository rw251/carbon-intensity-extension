const fs = require("fs");
const { join } = require("path");
const JSZip = require("jszip");
const zip = new JSZip();

const inquirer = require("inquirer");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const versions = {
  major: "major",
  minor: "minor",
  patch: "patch",
};

const incrementVersion = ({ versionType, message }) =>
  exec(`npm version ${versionType} -m "Upgrade to %s. ${message}"`);
const pushTagsToGit = () => exec("git push --follow-tags");

const createZip = () => {
  const { version } = require("./package.json");
  const filesToZip = [
    "background-page.html",
    "background-script.js",
    "manifest.json",
  ];

  const iconDir = "icons";
  const imgToZip = ["carbon-48.png"];

  filesToZip.forEach((file) => {
    zip.file(file, fs.readFileSync(join(__dirname, file), "utf8"));
  });

  imgToZip.forEach((imgFile) => {
    zip
      .folder(iconDir)
      .file(
        imgFile,
        fs.readFileSync(join(__dirname, iconDir, imgFile), "base64"),
        { base64: true }
      );
  });

  zip
    .generateNodeStream({ type: "nodebuffer", streamFiles: true })
    .pipe(fs.createWriteStream(`extension-v${version}.zip`))
    .on("finish", function () {
      // JSZip generates a readable stream with a "end" event,
      // but is piped here in a writable stream which emits a "finish" event.
      console.log(`extension-v${version}.zip written`);
    });
};

const upToDateCheck = () =>
  inquirer
    .prompt([
      {
        name: "shouldContinue",
        type: "confirm",
        message: "Please confirm all changes are committed and pushed to git.",
      },
    ])
    .then(({ shouldContinue }) => {
      if (!shouldContinue) process.exit(0);
      return shouldContinue;
    });

upToDateCheck().then(() => {
  inquirer
    .prompt([
      {
        name: "versionType",
        type: "list",
        message:
          "What type of versioning do you want to do (vX.Y.Z - major bumps X, minor bumps Y, patch bumps Z)",
        choices: Object.keys(versions),
        default: versions.patch,
      },
      {
        name: "message",
        type: "input",
        message: "Enter a message for the tag",
        validate: (input) =>
          input.length > 0
            ? true
            : "Must leave a message - think of your future self!!",
      },
    ])
    .then(incrementVersion)
    .then(pushTagsToGit)
    .then(createZip)
    .catch((err) => console.log(err));
});
