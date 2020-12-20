const fs = require('fs');
const declaration = require('./declaration.json');
const appName = declaration.AppName.toLowerCase();
const buildApp = `npx create-react-app ${appName}`;
const { exec } = require('child_process');
const { filesToDelete, filesToEdit } = require('./fileModifications');

// Files to modify :
// index.html
// - Remove commented lines
// - Change title
// - Remove manifest link
// - Remove logo192 link

function initialBuild() {
    console.log(`Building ${appName}...\nThis may take a few minutes.`);
    try {
        if (!fs.existsSync(`./${appName}`)) {
            exec(buildApp, (err, stdout, stderr) => {
                if (err) {
                    console.log(err)
                } else {
                    stdout && console.log(`STDOUT: ${stdout}`);
                    stderr && console.log(`STDERR: ${stderr}`);
                }
            })
        } else {
            console.log(`${appName} directory already exists in this location..`);
        }
    } catch (err) {
        console.log(err);
    }
}

function removeUnnecessaryFiles() {
    try {
        filesToDelete.forEach(file => {
            let fileName = `./${appName}/${file}`;
            if (fs.existsSync(fileName)) {
                console.log(`Removing unnecessary file: ${file}`);
                fs.unlink(fileName, (e) => {
                    console.log(e);
                });
            } else {
                console.log(`${fileName} has already been removed`)
            }

        })
    } catch (e) {
        console.log(e);
    }
}

function editFiles() {
    filesToEdit.forEach(file => {
        fs.readFile(`./${appName}/${file.name}`, 'utf8', (err, data) => {
            if (err) {
                console.log(`Unable to edit ${file}`);
            }
            let dataArray = data.split('\n');
            // Single Line edits
            let filteredData = dataArray.filter(line => !file.singleLineDeletions.includes(line.trim()));
            // Multi Line edits
            if (file.multiLineDeletions) {
                let filteredDataTrimmed = filteredData.map(el => el.trim());
                file.multiLineDeletions.forEach(edit => {
                    let { start, finish } = edit;
                    let startIndex = filteredDataTrimmed.indexOf(start);
                    let finishIndex = filteredDataTrimmed.indexOf(finish);
                    filteredData.splice(startIndex, finishIndex - startIndex + 1);
                })
            }
            // Removed commented lines
            if (file.removeComments) {
                filteredData = filteredData.filter(line => !line.match(/^\/\//g));
            }
            let updatedData = filteredData.join('\n');
            fs.writeFile(`./${appName}/${file.name}`, updatedData, (e) => {
                if (e) throw e;
                console.log('Completed file updates.');
            })
        })
    })
}

async function buildComponents() {
    // Make sure components folder exists. If not, build it
    let componentsDir = `./${appName}/src/components`;
    !fs.existsSync(componentsDir) && fs.mkdirSync(componentsDir);

    declaration.Components.forEach(component => {
        let componentName = Object.keys(component)[0];
        let filePath = `./${appName}/src/components/${componentName}`;

        let lines = [
            "import React from 'react';\n",
            `export default function ${componentName}() {`,
            `\treturn (`,
            `\t\t<div id="${componentName}">`,
            `\t\t</div>`,
            `\t)`,
            `};`];
        !fs.existsSync(filePath) && fs.mkdirSync(filePath);
        fs.writeFile(`${filePath}/${componentName}.js`, lines.join('\n'), (e) => {
            if (e) throw e;
        })
        fs.writeFile(`${filePath}/${componentName}.css`, '', (e) => {
            if (e) throw e;
        })
        if (component[componentName].SubComponents) {
            component[componentName].SubComponents.forEach(sub => {
                let subName = Object.keys(sub)[0];
                let subPathName = `./${appName}/src/components/${componentName}/${subName}`;
                let subLines = [
                    "import React from 'react';\n",
                    `export default function ${subName}() {`,
                    `\treturn (`,
                    `\t\t<div class="${subName}">`,
                    `\t\t</div>`,
                    `\t)`,
                    `};`];
                !fs.existsSync(subPathName) && fs.mkdirSync(subPathName);
                fs.writeFile(`${subPathName}/${subName}.js`, subLines.join('\n'), (e) => {
                    if (e) throw e;
                })
                // TODO -- Write import statement for subcomponent into the component file
            })
        }
    })
}

initialBuild()
removeUnnecessaryFiles();
editFiles();
buildComponents();