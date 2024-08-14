import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import prettyBytes from 'pretty-bytes'; // Use pretty-bytes instead of filesize
import {_LAYOUT, _FONT, _COLOR, _CONFIG, _CHARS} from './variables.js';
import {ChalkEngine} from './chalk-engine.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const testMode = false;
let _chalk = new ChalkEngine();
// Create a readline interface for user input

let configKeys;
let configData;
// Function to remove the last line
function removeLastLine() {
    readline.moveCursor(process.stdout, 0, -1); // Move cursor up one line
    readline.clearLine(process.stdout, 1); // Clear the line
    readline.moveCursor(process.stdout, 0, 0); // Move cursor to the beginning of the cleared line
}

function question1() {
    _chalk.log(`Your Selection...`);
    let q1_selectOption = _chalk.format('| user$ ', {layout: _LAYOUT.SC, color: _COLOR.PURPLE, fonts: [_FONT.BOLD]});
    rl.question(q1_selectOption, (answer) => {
        let answerKey = configKeys[answer-1]
        // Clears User Inputted Line, which is ugly.
        removeLastLine();
        // Display Selected Answer.
        _chalk.log(`Selected Answer: ${answerKey}`);
        // mark errors if outside range, bounce back to the question again.
        if ( answer >= configKeys.length || answer <= 0) {
            _chalk.log(`Invalid Selection: ${answer} not between 1 and ${configKeys.length}`);
            return question1();
        }
        // Compile Files.
        runPathLogic(answerKey);
    })
}

// Function to prompt the user and handle the response
function promptUser() {
    fs.promises.readFile('pdfConfig.json', 'utf8')
        .then(data => {
            configData = JSON.parse(data);
            configKeys = Object.keys(configData);
            if (!configData) {
                _chalk.log(`Data not found in the configuration.`, {color: _COLOR.RED});
                process.exit(1);
            }
            _chalk.log(' Select an option... ');
            configKeys.forEach((key, i) => {
                _chalk.log(`${i+1}. ${key}`);
            });
            _chalk.log('', {layout: _LAYOUT.DIVIDER});
            question1()
        })
}

// Function to handle the logic based on the selected path
function runPathLogic(solicitation) {
    // Create the directory if it doesn't exist
    const solicitationPath = path.resolve('./', solicitation);
    if (!fs.existsSync(solicitationPath)) {
        fs.mkdirSync(solicitationPath);
        _chalk.log(`Directory ${solicitation} created successfully.`, {color: _COLOR.GREEN});
    } else {
        _chalk.log(`Directory ${solicitation} already exists.`, {color: _COLOR.BLUE});
    }

    // Load the configuration JSON
    fs.promises.readFile('pdfConfig.json', 'utf8')
        .then(data => {
            const configArray = JSON.parse(data)[solicitation];
            if (!configArray) {
                _chalk.log(`Solicitation "${solicitation}" not found in the configuration.`, {color: _COLOR.RED});
                process.exit(1);
            }
            return processPDFs(configArray, solicitationPath);
        })
        .then(() => {
            _chalk.log(`All PDFs generated successfully.`, {color: _COLOR.GREEN});
            rl.close();
        })
        .catch(err => {
            _chalk.log(`Error generating PDFs...`, {color: _COLOR.RED});
            console.error(err);
            rl.close();
        });
}

// Function to generate a PDF based on the provided config
function generatePDF(config, outputFileName, solicitationPath) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            autoFirstPage: false,
        });

        // Set background color
        doc.on('pageAdded', () => {
            doc.rect(0, 0, doc.page.width, doc.page.height).fill(config.backgroundColor);
        });

        // Add the first page
        doc.addPage();

        // Add body text
        doc.fontSize(12)
            .fillColor('#000000')
            .text(config.bodyText, {
                align: 'center',
                valign: 'center'
            });

        // Save the file
        const outputPath = path.join(solicitationPath, outputFileName);
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);
        doc.end();
        stream.on('finish', () => {
            const fileSizeInBytes = fs.statSync(outputPath).size;
            _chalk.log(`Generated PDF: ${outputFileName}`, {color: _COLOR.GREEN});

            // Check file size
            const targetSizeInBytes = config.sizeInMB * 1024 * 1024;
            if (fileSizeInBytes < targetSizeInBytes) {
                // Adjust PDF size by adding extra content if necessary
                const remainingBytes = targetSizeInBytes - fileSizeInBytes;
                addExtraContent(outputPath, remainingBytes).then(resolve).catch(reject);
            } else {
                resolve();
            }
        });
    });
}

// Function to add extra content to meet the size requirement
function addExtraContent(outputFileName, extraBytes) {
    return new Promise((resolve, reject) => {
        fs.appendFile(outputFileName, Buffer.alloc(extraBytes), (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// Function to process an array of PDF configurations
async function processPDFs(configArray, solicitationPath) {
    for (let i = 0; i < configArray.length; i++) {
        const config = configArray[i];
        const outputFileName = `${config.fileName}.pdf`;
        await generatePDF(config, outputFileName, solicitationPath);
    }
}

if ( testMode ) {
    /**
     * Default Logging Format. These are all the same output.
     * _chalk.log('Default Formatting.');
     _  chalk.log('Default Log. Full Example.', {layout: _LAYOUT.DEFAULT, color: _COLOR.WHITE});
     _  chalk.log('Default Log. Full Example.', this.logOptions());
     * */
    _chalk.log('DEF. Default Formatting.');
    console.log('\n');
    _chalk.log('SC. Simple Chars. Does not add bumpers. Styles Added.', {layout: _LAYOUT.SC, color: _COLOR.ORANGE, fonts: [_FONT.BOLD, _FONT.UNDERLINE]});
    console.log('\n');
    _chalk.log('DEF. Default Format. Styles Added.', {layout: _LAYOUT.DEFAULT, color: _COLOR.GREEN, fonts: [_FONT.BOLD, _FONT.UNDERLINE]});
    console.log('\n');
    _chalk.log('DIVIDER. Styles can be changed as desired.', {layout: _LAYOUT.DIVIDER, color: _COLOR.YELLOW, fonts: [_FONT.BOLD]});
    console.log('\n');
    _chalk.log('BL. Box wraps log. Good for headers. ', {layout: _LAYOUT.BL, color: _COLOR.YELLOW, fonts: [_FONT.BOLD]});
    console.log('\n');
    /**
     * _options.multi is where you set your array of colors, using hexcodes.
     * bumperChar is set to blank so that double bumpers dont show inside the box.
     * This isnt necessary, you can place whatever you want in the bumperChar.
     * */
    let innerBox = _chalk.create(['BL. Customized.', 'inject a multi-segment', 'into the boxed-log'], {layout: _LAYOUT.MULTI, bumperChar: ''})
    _chalk.log(innerBox, {layout: _LAYOUT.BL, color: _COLOR.BLUE});

    console.log('\n');
    let customBumperChar = _chalk.create('|', {layout: _LAYOUT.SC, color: _COLOR.PURPLE, fonts: [_FONT.BOLD]});
    _chalk.log('Default. With different colored bumpers.', {bumperChar:customBumperChar, layout: _LAYOUT.DEFAULT, color: _COLOR.YELLOW, fonts: [_FONT.BOLD]});
    console.log('\n');
    _chalk.log('DIVIDER. Custom Bumper Style.', {bumperChar:customBumperChar, layout: _LAYOUT.DIVIDER, color: _COLOR.YELLOW, fonts: [_FONT.BOLD]});
} else {
    promptUser();
}
