import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk'; // Import chalk for colored output
import readline from 'readline';
import prettyBytes from 'pretty-bytes'; // Use pretty-bytes instead of filesize
import {_LAYOUT, _FONT, _COLOR, _CONFIG, _CHARS} from './variables.js'
// Create a readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});




let configKeys;
let configData;
// Function to remove the last line
function removeLastLine() {
    readline.moveCursor(process.stdout, 0, -1); // Move cursor up one line
    readline.clearLine(process.stdout, 1); // Clear the line
    readline.moveCursor(process.stdout, 0, 0); // Move cursor to the beginning of the cleared line
}


/**
 * @summary Generate a styled console log to improve readability.
 * @param _log Message you want logged.
 * @param _colorOpts string array of style options. (index 0 must be hexcode).
 * @param _fOpts string array of formatting options. Array order: Padding length, pad character, start/end char
 * @param _formatType Include formatting. Such as dividers before and after.
 * @param _fLength How much padding you want.
 * @param _fPadChar Character to pad with.
 * @param _fBumperChar Char to start and end with. Can be its own color.
 * @see {_COLOR} for color references.
 *
 * @example A: _cLog('Foo Bar...', [_COLOR.GREEN, _FONT.BOLD, _FONT.UNDERLINE])
 *         This would log "Foo Bar..." bold, underlined, in green.
 * @example B: _cLog('Im a royal looking log', ['#7851A9'])
 *          This would log "Im a royal looking log" in purple
 * @example C: _cLog('Plain Log')
 *          This would log a standard white log.
 * */
function cLog(_log, _colorOpts = [_COLOR.WHITE], _formatType = _LAYOUT.DEF, _fLength = _CONFIG.PAD_END_LEN, _fPadChar = _CHARS.PADDING, _fBumperChar = _CHARS.BUMPER) {
    /** Index 0 will be the hexcode color of the log. */
    let color = _colorOpts.shift();
    /** Base Command sets the color of the log. */
    let cmd = chalk.hex(color);
    /** Append style options to the command. ie; chalk.hex('#fff)['bold']['underline'] */
    _colorOpts.forEach(_op => { cmd = cmd[_op] } );
    /** Formats output in a consisten manner.*/
    let formattedLog = `${_fBumperChar}${_log.padEnd(_fLength, _fPadChar)}${_fBumperChar}`;
    /** Log the finalized command. */
    console.log(cmd(fLog(formattedLog, _formatType, {color: color, length: _fLength, chars: {bumper: _fBumperChar}})));
}

/**
 * @summary Utility class that provides different formatted logs.
 * @param {string} _log The log to be formatted.
 * @param {string} _layout how to display the log in the console.
 * @param {object} data collection of data relevant to each switch case.
 * @returns Chalk Formatted String.
 * */
function fLog(_log, _layout, data) {
    let formattedLog;
    switch( _layout ) {
    case _LAYOUT.SC:
        // colorize a single char
        formattedLog = chalk.hex(data.color)(_log);
        break;
    case _LAYOUT.BL:
        // boxed text
        let divider = chalk.hex(data.color)(data.chars.bumper + ''.padEnd(data.length, '-') + data.chars.bumper);
        formattedLog = `${divider}\n${_log}\n${divider}`;
        break;
    case _LAYOUT.D:
        formattedLog = chalk.hex(data.color)(data.chars.bumper + ''.padEnd(data.length, '-') + data.chars.bumper);
        break;
    case '':
    case _LAYOUT.DEF:
        // default
        formattedLog = _log;
        break;
    }

    return formattedLog;
}

function question1() {
    cLog(' Your Selection... ', [_COLOR.ORANGE, _FONT.BOLD],  _LAYOUT.BL);
    let question_selectYourOption = fLog('| user$ ', _LAYOUT.SC, {color: _COLOR.ORANGE})
    rl.question(question_selectYourOption, (answer) => {
        // Clears User Inputted Line, which is ugly.
        removeLastLine();

        // Discern the length of input and format the bumpers to that.
        let padEndLength = (`Selection: ${answer}.`).length
        // base is orange, same as rest of answer.
        let base = fLog(`Selection:`, _LAYOUT.SC, {color: _COLOR.ORANGE});
        // user input is blue.
        let input = fLog((`${answer}. ${(configKeys[answer-1])}`).padEnd(_CONFIG.PAD_END_LEN-padEndLength, _CHARS.PADDING), _LAYOUT.SC, {color: _COLOR.BLUE})
        // log user selection
        cLog(` ${base} ${input} `, [_COLOR.ORANGE, _FONT.BOLD], _LAYOUT.DEF, _CONFIG.PAD_END_LEN, _CHARS.PADDING, fLog(_CHARS.BUMPER, _LAYOUT.SC, {color: _COLOR.ORANGE}));
        // mark errors if outside range, bounce back to the question again.
        if ( answer >= configKeys.length || answer <= 0) {
            cLog(` Invalid Selection: ${answer} not between 1 and ${configKeys.length}`, [_COLOR.RED, _FONT.BOLD], _LAYOUT.BL);
            return question1();
        }
        // Compile Files.
        runPathLogic(configKeys[answer-1]);
    })
}

// Function to prompt the user and handle the response
function promptUser() {
    fs.promises.readFile('pdfConfig.json', 'utf8')
        .then(data => {
            configData = JSON.parse(data);
            configKeys = Object.keys(configData);
            if (!configData) {
                console.error(`Data not found in the configuration.`);
                process.exit(1);
            }
            cLog(' Select an option... ', [_COLOR.GREEN, _FONT.BOLD],  _LAYOUT.BL);
            let op = 0;
            configKeys.forEach((key, i) => {
                cLog(`${i+1}. ${key}`, [_COLOR.GREEN_ALT[op], _FONT.BOLD], _LAYOUT.DEF ,_CONFIG.PAD_END_LEN, ' ', fLog(_CHARS.BUMPER, _LAYOUT.SC, {color: _COLOR.GREEN}));
                op = (op === 0 ? 1 : 0);
            });
            cLog('// divider: end of select an option', [_COLOR.GREEN, _FONT.BOLD], _LAYOUT.D );

            question1()
        })
}



// Function to handle the logic based on the selected path
function runPathLogic(solicitation) {
    // Create the directory if it doesn't exist
    const solicitationPath = path.resolve('./', solicitation);
    if (!fs.existsSync(solicitationPath)) {
        fs.mkdirSync(solicitationPath);
        console.log(`Directory ${solicitation} created successfully.`);
    } else {
        console.log(`Directory ${solicitation} already exists.`);
    }

    // Load the configuration JSON
    fs.promises.readFile('pdfConfig.json', 'utf8')
        .then(data => {
            const configArray = JSON.parse(data)[solicitation];
            if (!configArray) {
                console.error(`Solicitation "${solicitation}" not found in the configuration.`);
                process.exit(1);
            }
            return processPDFs(configArray, solicitationPath);
        })
        .then(() => {
            console.log('All PDFs generated successfully.');
            rl.close();
        })
        .catch(err => {
            console.error('Error generating PDFs:', err);
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
            console.log(`Generated PDF: ${outputPath} - Size: ${prettyBytes(fileSizeInBytes)}`);

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

// Start the user prompt
promptUser();
