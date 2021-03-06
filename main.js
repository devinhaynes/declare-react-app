const fs = require('fs');
const declaration = require('./declaration.json');
const appName = declaration.AppName.toLowerCase();
const buildApp = `npx create-react-app ${appName}`;
const { execSync } = require('child_process');
const { filesToDelete, filesToEdit } = require('./fileModifications');

function initialBuild() {
    console.log(`Building ${appName}...\nThis may take a few minutes.`);
    if (!fs.existsSync(`./${appName}`)) {
        execSync(buildApp, (err, stdout, stderr) => {
            if (err) {
                console.log(err)
            }
        })
    } else {
        console.log(`${appName} directory already exists in this location..`);
    }
}

function removeUnnecessaryFiles() {
    try {
        filesToDelete.forEach(file => {
            let fileName = `./${appName}/${file}`;
            if (fs.existsSync(fileName)) {
                fs.unlink(fileName, (e) => {
                    e && console.log(e);
                });
            }
        })
    } catch (e) {
        console.log(e);
    }

}

function editFiles() {
    try {
        filesToEdit.forEach(file => {
            fs.readFile(`./${appName}/${file.name}`, 'utf8', (err, data) => {
                if (err) {
                    console.log(`Unable to edit ${file}`);
                }
                let dataArray = data.split('\n');

                // TODO - Come up with a more efficient way of filtering all of these data edits

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

                // Edit existing lines
                if (file.lineEdits) {
                    file.lineEdits.forEach(edit => {
                        let { original, replacement } = edit;
                        if (original == '<title>React App</title>') {
                            replacement = `<title>${appName}</title>`;
                        }
                        filteredData = filteredData.map(line => line.trim() == original ? replacement : line);
                    })
                }

                if (file.removeMultiLineComments) {
                    let startComments = new RegExp('<!--', 'g');
                    let endComments = new RegExp('-->', 'g');
                    let started = false;
                    filteredData = filteredData.filter(data => {
                        if (data.match(startComments)) {
                            started = true;
                        }
                        if (!started) {
                            return data
                        }
                        if (data.match(endComments)) {
                            started = false;
                        }
                    })
                }

                let updatedData = filteredData.join('\n');
                fs.writeFile(`./${appName}/${file.name}`, updatedData, (e) => {
                    e && console.log(e);
                })
            })
        })
    } catch (e) {
        console.log(e)
    }
}

function buildComponents() {
    try {
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
                e && console.log(e);
            })
            fs.writeFile(`${filePath}/${componentName}.css`, '', (e) => {
                e && console.log(e);
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
                        e && console.log(e);
                    })
                    // TODO -- Write import statement for subcomponent into the component file
                })
            }
        })
    } catch (e) {
        console.log(e);
    }

}

initialBuild();
removeUnnecessaryFiles();
editFiles();
buildComponents();