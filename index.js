#!/usr/bin/env node

// IMPORTS
const download = require("download-git-repo")
const path = require('path');
const fs = require('fs-extra')
const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
var replace = require("replace");
const shell = require("shelljs");

// CONSTANTS
const ROOT_DIR = path.join(__dirname, '..');
const DIC_NAME = '/app/src/main/java/cz/filipobornik/kotlinmvvmbasearchitecture'
const BASE_ID = "cz.filipobornik.kotlinmvvmbasearchitecture"
var FOLDER_NAME = ""

// LOG INVITATION INFO
const init = () => {
    console.log(
        chalk.green(
            figlet.textSync("Android PROCREATOR", {
                horizontalLayout: "default",
                verticalLayout: "default"
            })
        )
    );
}

// CLI questions
const askQuestions = () => {
    const questions = [
        {
            name: "PROJECT_NAME",
            type: "input",
            message: "What is the name of the project?"
        },
        {
            name: "APP_ID",
            type: "input",
            message: "What is the APP ID?",
        }
    ];

    return inquirer.prompt(questions);
};

// MESSAGES
const success = () => console.log(chalk.white.bgGreen.bold(`Done! Project created`));
const error = (message) => console.log(chalk.white.bgRed.bold(message));

// Donwload project and do the magic
createProject = (PROJECT_NAME, APP_ID) => {

    download('direct:https://gitlab.com/filipobornik/mvvm-kotlin-base-architecture.git', "../" + FOLDER_NAME, { clone: true }, function (err) {

        if (fs.existsSync(ROOT_DIR + FOLDER_NAME + DIC_NAME)) {

            fs.copy(ROOT_DIR + FOLDER_NAME + DIC_NAME, ROOT_DIR + FOLDER_NAME + '/app/src/main/java/com/damidev/' + (PROJECT_NAME).toLowerCase())
                .then(() => {

                    fs.removeSync(ROOT_DIR + FOLDER_NAME + '/app/src/main/java/cz');

                    // DELETED TESTS
                    fs.removeSync(ROOT_DIR + FOLDER_NAME + '/app/src/androidTest');
                    fs.removeSync(ROOT_DIR + FOLDER_NAME + '/app/src/test');

                    // REPLACES imports and packages
                    // console.log(ROOT_DIR + '/test/tmp' + '/app/build.gradle');

                    replacement("applicationId ", `"` + BASE_ID + `"`, `"` + APP_ID + `"`, ROOT_DIR + FOLDER_NAME + '/app/build.gradle')
                    replacement("package = ", `"` + BASE_ID + `"`, `"` + APP_ID + `"`, ROOT_DIR + FOLDER_NAME + '/app/src/main/AndroidManifest.xml')

                    // get all files
                    const nameSplit = splitAppId(APP_ID);
                    const allFiles = getAllFiles(ROOT_DIR + FOLDER_NAME + '/app/src/');

                    allFiles.forEach(e => {
                        replacement("package ", BASE_ID, nameSplit[0] + "." + nameSplit[1] + "." + nameSplit[2], e);
                        replacement("import ", BASE_ID, nameSplit[0] + "." + nameSplit[1] + "." + nameSplit[2], e);
                    });

                    success();
                })
                .catch(err => error(err));
        }
        else error('ERROR: folder does not exists! ');
    })
}

// DIVIDES app ID into array to loop over dirs
function splitAppId(app_id) {
    return app_id.split(".")
}


// REPLACES Gradle properties
replacement = (key, toReplace, replacement, dir) => {
    replace({
        regex: key + toReplace,
        replacement: key + replacement,
        paths: [dir],
        recursive: false,
        silent: true,
    });
}

// RECURSIVE looping
const getAllFiles = dir =>
    fs.readdirSync(dir).reduce((files, file) => {
        const name = path.join(dir, file);
        const isDirectory = fs.statSync(name).isDirectory();
        return isDirectory ? [...files, ...getAllFiles(name)] : [...files, name];
    }, []);


// VALIDATION
// return true if input is valid
function allLetterValidation(input) {

    var letters = /^[A-Za-z]+$/;
    if (input.value.match(letters)) return true;
    else return false;
}

// MAIN
const run = async () => {
    init();

    // ask questions
    const answers = await askQuestions();
    const { PROJECT_NAME, APP_ID } = answers;

    // project name validation
    // if (!allLetterValidation(PROJECT_NAME)) 
    //    return error("ERROR: only letters are allowed!")

    // change the folder name
    FOLDER_NAME = "/" + PROJECT_NAME;

    createProject(PROJECT_NAME, APP_ID);

}

run();



