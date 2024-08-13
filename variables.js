/**
 * @summary Reference Table for Options.
 * C: Color of Log
 * F: Font Decoration
 * U: Utility, Formatting Concerns
 * SC: Standard Configurations,
 * */
export const CH = {
    // Colors
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
    // Font Formatting
    F: {
        // Bolded Logs
        B: 'bold',
        // Underline Logs
        U: 'underline'
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


/**
 * @summary Characters used often
 * */
export const _CHARS = {
    /**  Start and End Char of a Line
     * ex; | HelloWorld |*/
    BUMPER: '|',
    /**  Dividing Line Character
     * ex; |------------| */
    DIVIDER: '-',
    /**  Padding character to add at end of log, up to PAD_END_LEN
     * ex; | Hello      | */
    PADDING: ' ',
}

/**
 * @summary Logging Overall Look and Feel
 * */
export const _CONFIG = {
    /** Padding added to start of log, after the Bumper */
    PAD_START_LEN: 0,
    /** Padding added to end of log, up to the Bumper*/
    PAD_END_LEN: 50,
}

/**
 * @summary Hex Colors Table.
 * */
export const _COLOR= {
    // White: DF for output
    WHITE: '#fff',
    // Red: error messages.
    RED: '#FF0000',
    // Green: success
    GREEN: '#00FF00',
    // Green Alternating
    GREEN_ALT: ['#00FF00', '#009900'],
    // Green List.
    GREEN_LIST: ['#00FF00', '#00E600', '#00CC00', '#00B300', '#009900', '#008000', '#006600', '#004D00', '#003300', '#001A00'],
    // Blue: info/data
    BLUE: '#1E90FF',
    // Yellow: Warning
    YELLOW: '#FFD700',
    // Orange: Warning Alternate.
    ORANGE: '#FFA500',
    // Orange List.
    ORANGE_LIST: ['#FFA500', '#FFB347', '#FF8C00', '#FF7F50', '#FF6F00', '#E65100', '#FF6347', '#FF4500', '#D2691E', '#A0522D'],
}

/**
 * @summary Available Font Style Types from Chalk.
 *
 * Since not all terminals are the same,
 * Chalk flags some modifiers as not widely supported (NWS).
 * */
export const _FONT = {
    BOLD: 'bold',
    UNDERLINE: 'underline', // NWS
    OVERLINE: 'overline', // NWS
    STRIKETHRU: 'strikethrough', // NWS
    DIM: 'dim',
    ITALIC: 'italic',
    INVERSE: 'inverse',
    HIDDEN: 'hidden',
    VISIBLE: 'visible',
}

/**
 * @summary Formats logs in a provided format.
 * @see {@link ./gen-dummy-data.js#fLog}
 * */
export const _LAYOUT = {
    DEF: 'default',
    SC: 'single-char',
    D: 'divider',
    BL: 'boxed-log'
}
