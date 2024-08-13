import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk'; // Import chalk for colored output
import readline from 'readline';
import prettyBytes from 'pretty-bytes'; // Use pretty-bytes instead of filesize

// Create a readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


/**
 * @summary Reference Table for Options.
 * C: Color of Log
 * F: Font Decoration
 * U: Utility, Formatting Concerns
 * SC: Standard Configurations,
 * */
const CH = {
    // colors of log
    C: {
        // White: DF for output
        W: '#fff',
        // Red: error messages.
        R: '#FF0000',
        // Green: success
        G: '#00FF00',
        // Green Alternating
        G_A: ['#00FF00', '#009900'],
        // Green List.
        G_L: ['#00FF00', '#00E600', '#00CC00', '#00B300', '#009900', '#008000', '#006600', '#004D00', '#003300', '#001A00'],
        // Blue: info/data
        B: '#1E90FF',
        // Yellow: Warning
        Y: '#FFD700',
        // Orange: Warning Alternate.
        O: '#FFA500',
        // Orange List.
        O_L: ['#FFA500', '#FFB347', '#FF8C00', '#FF7F50', '#FF6F00', '#E65100', '#FF6347', '#FF4500', '#D2691E', '#A0522D'],
    },
    F: {
        B: 'bold',
        U: 'underline'
    },
    U: {
        DEF: 'default',
        SC: 'single-char',
        D: 'divider',
        BL: 'boxed-log',
        N: 'nested'
    },
    SC: {
        // padded length
        L: 50,
        // padding Char
        PC: ' ',
        // Bumper Char
        BC: '|'
    }
}

let configKeys;
let configData;

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
 * @see {CH} for color references.
 *
 * @example A: _cLog('Foo Bar...', [CH.C.G, CH.F.B, CH.F.U])
 *         This would log "Foo Bar..." bold, underlined, in green.
 * @example B: _cLog('Im a royal looking log', ['#7851A9'])
 *          This would log "Im a royal looking log" in purple
 * @example C: _cLog('Plain Log')
 *          This would log a standard white log.
 * */
function cLog(_log, _colorOpts = [CH.C.W], _formatType = CH.U.DEF, _fLength = CH.SC.L, _fPadChar = CH.SC.PC, _fBumperChar = CH.SC.BC) {
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
 * */
function fLog(_log, _type, data) {
    let formattedLog;
    switch( _type ) {
    case CH.U.DEF:
        // default
        formattedLog = _log;
        break;
    case CH.U.SC:
        // colorize a single char
        formattedLog = chalk.hex(data.color)(_log);
        break;
    case CH.U.BL:
        // boxed text
        let divider = chalk.hex(data.color)(data.chars.bumper + ''.padEnd(data.length, '-') + data.chars.bumper);
        formattedLog = `${divider}\n${_log}\n${divider}`;
        break;
    case CH.U.D:
        formattedLog = chalk.hex(data.color)(data.chars.bumper + ''.padEnd(data.length, '-') + data.chars.bumper);
        break;
    case CH.U.N:
        let prepend = chalk.hex(data.prepend.color)(data.prepend.text);
        formattedLog = `${prepend}${_log}`
    break;
    case '':

    break;
    }

    return formattedLog;
}

function question1() {
    cLog(' Your Selection... ', [CH.C.O, CH.F.B],  CH.U.BL);
    let question_selectYourOption = fLog('| user$ ', CH.U.SC, {color: CH.C.O})
    rl.question(question_selectYourOption, (answer) => {
        // Clears User Inputted Line, which is ugly.
        removeLastLine();

        // Discern the length of input and format the bumpers to that.
        let padEndLength = (`Selection: ${answer}.`).length
        // base is orange, same as rest of answer.
        let base = fLog(`Selection:`, CH.U.SC, {color: CH.C.O});
        // user input is blue.
        let input = fLog((`${answer}. ${(configKeys[answer-1])}`).padEnd(CH.SC.L-padEndLength, CH.SC.PC), CH.U.SC, {color: CH.C.B})
        // log user selection
        cLog(` ${base} ${input} `, [CH.C.O, CH.F.B], CH.U.DEF, CH.SC.L, CH.SC.PC, fLog(CH.SC.BC, CH.U.SC, {color: CH.C.O}));
        // mark errors if outside range, bounce back to the question again.
        if ( answer >= configKeys.length || answer <= 0) {
            console.log('\n');
            cLog(` Invalid Selection: ${answer} not between 1 and ${configKeys.length}`, [CH.C.R, CH.F.B], CH.U.BL);
            console.log('\n');
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
            cLog(' Select an option... ', [CH.C.G, CH.F.B],  CH.U.BL);
            let op = 0;
            configKeys.forEach((key, i) => {
                cLog(`${i+1}. ${key}`, [CH.C.G_A[op], CH.F.B], CH.U.DEF ,CH.SC.L, ' ', fLog(CH.SC.BC, CH.U.SC, {color: CH.C.G}));
                op = (op === 0 ? 1 : 0);
            });
            cLog('// divider: end of select an option', [CH.C.G, CH.F.B], CH.U.D );

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
