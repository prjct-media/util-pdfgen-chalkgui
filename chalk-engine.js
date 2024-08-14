import chalk from 'chalk';
import {_CHARS, _COLOR, _CONFIG, _FONT, _LAYOUT} from "./variables.js"; // Import chalk for colored output

chalk.level = 3;


export class ChalkEngine {
     ignoreChars= /\x1b\[[0-9;]*m/g;

     stripANSI(_log) {
         return _log.replace(this.ignoreChars, '')
     }
     getANSI(_log) {
         const matches = _log.match(this.ignoreChars);
         return matches ? matches.length : 0;
     }

     logOptions(ops = null) {
         // If user provides an option, use it, otherwise use default.
        return {
            color:      (ops?.color !== undefined ) ? ops.color :  _COLOR.WHITE,
            multi:      (ops?.multi !== undefined ) ? ops.multi : [_COLOR.RED, _COLOR.WHITE, _COLOR.BLUE],
            fonts:      (ops?.fonts !== undefined ) ? ops.fonts : [_FONT.BOLD],
            layout:     (ops?.layout !== undefined ) ? ops.layout : _LAYOUT.DEF,
            length:     (ops?.length !== undefined ) ? ops.length : _CONFIG.PAD_END_LEN,
            padChar:    (ops?.padChar !== undefined ) ? ops.padChar : _CHARS.PADDING,
            // used for all bumpers.
            bumperChar: (ops?.bumperChar !== undefined ) ? ops.bumperChar : _CHARS.BUMPER,
            // used for dividers specifically. can be customized.
            dividerPadChar: (ops?.dividerPadChar !== undefined ) ? ops.dividerPadChar : _CHARS.DIVIDER,
        }
    }
    /**
     * @summary Formats the line to be consistent.
     *
     * If using MULTI:
     * */
    addBumpers(_log, _ops  ) {
        // Remove ANSI characters from string.
        let logNoANSI = this.stripANSI(_log);
        // Pad the end of the no-ansi string,
        // then replace it with the ansi one, and add bumpers.
        // Maintains the exact padEnd that is visually expected.
        let formattedLog =
        logNoANSI
            .padEnd(_ops.length ,_ops.padChar)
            .replace(logNoANSI,_log)
         return `${_ops.bumperChar}${formattedLog}${_ops.bumperChar}`;
    }

    formatLogArray(_log, _ops) {
        // Set a direction. 1 = forward. -1 = backwards in array.
        let direction = 1;
        // start at index -1, which immediately steps into index 0.
        let index = -1;
        let multiColorLog = _log.map((_lofl, i) => {
            // step fwd/back in array.
            index += direction;
            if (index === _ops.multi.length) {
                // if reaching end of array, we turn the direction around.
                direction = -1;
                // move to the second from last in the array.
                index = _ops.multi.length-2
            } else if (index === -1) {
                // if we hit the end of the array, turn around.
                direction = +1;
                // move to second from the start in the array.
                index = 1;
            }
            return chalk.hex(_ops.multi[index])(_lofl);
        }).join('');
        // Returns final output.
        return chalk.hex(_ops.color)(this.addBumpers(multiColorLog,_ops))
    }
    format(_log, _ops){
        let formattedLog;
        switch( _ops.layout ) {
            case _LAYOUT.SC:
                // colorize a single char
                formattedLog = chalk.hex(_ops.color)(_log);
                break;
            case _LAYOUT.BL:
                // boxed text
                let divider = chalk.hex(_ops.color)(_ops.bumperChar + ''.padEnd(_ops.length, '-') + _ops.bumperChar);
                formattedLog = `${divider}\n${this.addBumpers(_log, _ops)}\n${divider}`;
                break;
            case _LAYOUT.DIVIDER:
                // Divider. |----|
                formattedLog = chalk.hex(_ops.color)(this.addBumpers('', {padChar: _ops.dividerPadChar, bumperChar: _ops.bumperChar, length: _CONFIG.PAD_END_LEN}));
                break;
            case _LAYOUT.MULTI:
                // Ensure that the _log is an array of strings, otherwise fail it.
                if (!Array.isArray(_log)) throw new Error(`"${_log}" is not an Array of Strings!`);
                // Array of logs that have different colors.
                // Colors are controlled from the _ops.multi[] where hexcodes can be put.
                formattedLog = this.formatLogArray(_log,_ops);
                break;
            case '':
            case _LAYOUT.DEFAULT:
                // Default: structures with Padding and Bumpers.
                formattedLog = this.addBumpers(_log,_ops);
                break;
        }

        return formattedLog;
    }

    /**
     * @summary Creates a chalk-based command.
     * @param _log {string} Message to be logged out.
     * @param _options {object} Configurations object. Refer to logOptions() function for default.
     * */
     create(_log, _options) {
        // Use provided options or fallback on defaults.
        let _ops = this.logOptions(_options);
        // Set Log Color. Uses Hexcode.
        let cmd = chalk.hex(_ops.color);
        // Chain options, refer to "_FONT" for available options.
        _ops.fonts.forEach(op => cmd = cmd[op]);

        // structures log according to layout.
        let formattedLog = this.format(_log, _ops);
        // Outputs formatted log.
        return cmd(formattedLog);
    }


    log(_log, _options) {
        let cmd = this.create(_log, _options)
         console.log(cmd);
    }
}
