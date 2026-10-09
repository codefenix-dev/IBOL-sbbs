/*

Inter BBS Oneliners (IBOL)     ▄ ▄ ▄
for Synchronet                 █████
Version 0.260502               ▐▄█▄▌ cf
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
by Craig Hendricks
codefenix@conchaos.synchro.net

ConstructiveChaos BBS:
  https://conchaos.synchro.net
 telnet://conchaos.synchro.net
    ssh://conchaos.synchro.net

*/

load('sbbsdefs.js');
load('funclib.js');
load("frame.js");

const SETTINGS_FILE = "ibol.ini";
const MSG_SUBJ = "InterBBS Oneliner";
const MSG_FROM = "IBBS1LINE";
const IBOL_FILE = "ibol.msg";
const IBOL_HEADER = "ibolhead.msg";
const LAST_READ = "ibol.lr";
const EXEC_PATH = backslash(js.exec_dir);
const SCROLLER_PATH = "../xtrn/scroller/scroller.js";
const SCROLLER_CMD_FMT = '?%s "%s" "%s" %s';
var settings, lastread, systemName, height;
var twits = [];

function main() {
    var exit = false;
    var f = new File(EXEC_PATH + IBOL_FILE);
    var ascfile;
    if (f.open('r')) {
        ascfile = f.readAll();
        f.close();
    } else {
        ascfile = [''];
    }

    while (bbs.online && !js.terminated && !exit) {
        console.clear();
        console.printfile(EXEC_PATH + IBOL_HEADER);
        
        height = console.screen_rows - (console.getxy().y + 1);

        var start = (ascfile.length > height) ? (ascfile.length - height) : start = 0;

        for (var i = start; i < ascfile.length; i = i + 1) {
            console.putmsg(ascfile[i]);
            console.putmsg('\r\n');
        }

        console.putmsg('\x01h\x01w (\x01yA\x01w) \x01mAdd, \x01w(\x01yV\x01w) \x01mView All, \x01w(\x01yQ\x01w) \x01mQuit ');

        switch(console.getkey(K_NONE).toUpperCase()) {
            case "A":

                if (twits.indexOf(user.alias.toUpperCase()) >= 0) {
                    console.putmsg("\x01l\x01w\x01hYou've been \x01yTWITTED\x01n!\r\n\r\n\x01n Sorry, but you're not allowed to post to this wall!\r\n\r\n\x01k\x01h (you must have messed up pretty bad... :P)\x01n\r\n\r\n");
                    log(LOG_WARNING, "ibol is view-only for this user.");
                    console.pause();
                    return;
                }             

                var lines = [];
                for (var i = 0; i < 10; i++) {
					var str = getInputWithPreview('\x01nLine #\x01c\x01h' + (i + 1) + " \x01nof \x01c\x01h10\x01n. Blank line when done!", 56);
                    if ( console.strlen(pipeToCtrlA(str)) === 0) {
                        if (i == 0) {
                            return;
                        } else {
                            break;
                        }
                    }
                    lines.push([str]);
                }

                // preview and confirm before posting...
                console.putmsg(' \x01l\x01h\x01k+----------------------------------------------------------------------------+\r\n');
                for (var i = 0; i < lines.length; i++) {
                    console.putmsg('\x01y\x01hPREVIEW\x01w: \x01n' + pipeToCtrlA(truncsp(lines[i])) + '\r\n');
                }
                console.putmsg(' \x01h\x01k+----------------------------------------------------------------------------+\r\n');
                if (console.yesno('\x01mLook OK\x01n')) {
                    var header = {
                        'to': MSG_FROM,
                        'from': user.alias,
                        'subject': MSG_SUBJ
                    };

                    systemName = settings.systemName;
                    if (systemName === "" || systemName === undefined) {
                        systemName = system.name;
                    }

                    var body = '';

                    body = body + 'Author: ' + user.alias + '\r\n';
                    body = body + 'Source: ' + systemName + '\r\n';
                    for (var i = 0; i < lines.length; i++) {
                        body = body + 'Oneliner: ' + lines[i] + '\r\n';
                    }

                    var msgBase = new MsgBase(settings.messageBase);
                    msgBase.open();
                    msgBase.save_msg(header, body);
                    msgBase.close();

                    // new post was successfully added. :::::::::::::::::::::::::::::::
                    // read back the wall to the user as visual feedback of what ::::::
                    // was added. :::::::::::::::::::::::::::::::::::::::::::::::::::::
                    readmsgbase();
                    if (f.open('r')) {
                        ascfile = f.readAll();
                        f.close();
                    } else {
                        ascfile = [''];
                    }
                    console.clear();
                    console.printfile(EXEC_PATH + IBOL_HEADER);
                    start = (ascfile.length > height) ? (ascfile.length - height) : start = 0;
                    for (var i = start; i < ascfile.length; i = i + 1) {
                        console.putmsg(ascfile[i]);
                        console.putmsg('\r\n');
                    }
                    console.putmsg(' \x01mPress a key....');
                    console.getkey(K_NONE);
                    exit = true;
                }
                break;
            case "V":
                if (file_exists(SCROLLER_PATH)) {
                    bbs.exec( format(SCROLLER_CMD_FMT, SCROLLER_PATH, backslash(EXEC_PATH) + IBOL_FILE, "Inter-BBS One-Liners", "bottom" ), 0, EXEC_PATH );
                } else {
                    console.clear();
                    console.printfile(EXEC_PATH + IBOL_HEADER);
                    console.printfile(EXEC_PATH + IBOL_FILE);
                    console.putmsg(' \x01mPress a key....');
                    console.getkey(K_NONE);
                }
                break;
            case KEY_ESC:
            case "Q":
            case "\x0d": // enter; no selection
                exit = true;
                break;
        }
    }
}

function readmsgbase() {
    var msgBase = new MsgBase(settings.messageBase);
    var ascfile = new File(EXEC_PATH + IBOL_FILE);
    ascfile.open('a+');
    msgBase.open();
    var start = lastread == 0 ? msgBase.first_msg : (lastread + 1);
    for (var m = start; m <= msgBase.last_msg; m = m + 1) {
        var h = msgBase.get_msg_header(m);
        if (h == null)
            continue;
        if (h.subject === MSG_SUBJ && h.to === MSG_FROM) {
            var body = msgBase.get_msg_body(m);
            var author, fromsys;
            var lines = [];
            var msgbody = '';
            var arrayOfLines = body.match(/[^\r\n]+/g);
            var arrayLen = arrayOfLines.length;
            for (var i = 0; i < arrayLen; i = i + 1) {
                var line = pipeToCtrlA(strip_ctrl(arrayOfLines[i]));
                if (line.substr(0, 8) === 'Author: ') {
                    author = truncsp(line.substr(8));
                } else if (line.substr(0, 8) === 'Source: ') {
                    fromsys = truncsp(line.substr(8));
                } else if (line.substr(0, 10) === 'Oneliner: ') {
                    msgbody = msgbody + truncsp(line.substr(10)) + ' ';
                }
            }

            //if (msgbody.length <= 0) {
            //    continue;
            //}

            var arrayOfWords = msgbody.split(' ');
            var spaceleft = 57;
            var curline = '';
            for (var i = 0; i < arrayOfWords.length; i = i + 1) {
                if (arrayOfWords[i].length > spaceleft) {
                    lines.push([curline]);
                    curline = arrayOfWords[i] + ' ';
                    spaceleft = 57 - (arrayOfWords[i].length + 1);
                } else {
                    curline = curline + arrayOfWords[i] + ' ';
                    spaceleft = spaceleft - (arrayOfWords[i].length + 1);
                }
            }
            lines.push([curline]);

            var len = lines.length > 2 ? lines.length : 2;

            if (author && fromsys && (msgbody.length > 0)) { // ensure there's both an author & fromsys before writing to the wall.

                for (var i = 0; i < len; i = i + 1) {

                    //if (truncsp(lines[i]).length <= 0) { // Ignore blank lines
                    //    continue; 
                    //}

                    if (i == 0) {
                        if (lines.length >= 1) {
                            ascfile.printf('\x01h\x01c%s\x01k: \x01n\x01w%s\n', padLeftWithCtrlA(author, 20), truncsp(lines[0]));
                        } else {
                            ascfile.printf('\x01h\x01c%s\x01k: \n', padLeftWithCtrlA(author, 20));
                        }
                    } else if (i == 1) {
                        if (lines.length >= 2) {
                            ascfile.printf('\x01n\x01c%s\x01h\x01k: \x01n\x01w%s\n', padLeftWithCtrlA(fromsys, 20), truncsp(lines[1]));
                        } else {
                            ascfile.printf('\x01n\x01c%s\x01h\x01k: \n', padLeftWithCtrlA(fromsys, 20));
                        }
                    } else {
                        ascfile.printf((new Array(21)).join(" ") + '\x01h\x01k: \x01n\x01w%s\n', truncsp(lines[i]));
                    }
                }
                ascfile.write(' \x010\x01h\x01k------------------------------------------------------------------------------\x01n\x01k\n')
            }
        }
        lastread = m;
    }
    msgBase.close();
    ascfile.close();

    var f = new File(EXEC_PATH + LAST_READ);
    if (!f.open('w'))
        throw "Failed to open " + LAST_READ + ".";
    f.write(lastread); // previously used f.writeBin(); seemed problematic
    f.close();
}

function padLeftWithCtrlA(str, maxLen) {
    while (console.strlen(str) < maxLen) {
        str = " " + str;
    }
    while (console.strlen(str) > maxLen) {
        str = str.substr(0, str.length-1);
    }
    while (str.charAt(str.length-1) === " ") {
        str = " " + str.substr(0, str.length-1);
    }
    return str;
}

function loadSettings() {
    var f = new File(EXEC_PATH + SETTINGS_FILE);
    if (!f.open('r'))
        throw "Failed to open " + SETTINGS_FILE + ".";
    settings = f.iniGetObject();
    if (settings.twits) {
        twits = settings.twits.toUpperCase().split(';');
    }    
    f.close();
    f = new File(EXEC_PATH + LAST_READ);
    if (!f.open('r')) {
        lastread = 0;
    } else {
        lastread = Number(f.read()); // previously used f.readBin(), seemed problematic
        f.close();
    }
}

function getInputWithPreview(what, maxLen) {
	console.clear();
    const WIDTH = console.screen_columns - 2;
	const BLINKY_CURSOR = "\x01w\x01h\x01i" + ascii(219);
	var updateFrames = true;
    var inputStr = "";
	var previewStr = "";
	var keyPressed = "";
    
    var borderChars = ascii(196);
    var entryBorder = (new Array((WIDTH+1)).join(borderChars)).substr(0, WIDTH);
    var entryField = new Array(WIDTH).join(" ") + " ";
    var previewBorder = (new Array(maxLen+1).join(borderChars)).substr(0, maxLen);
    var previewField = new Array(maxLen).join(" ") + " ";

    printf("\x1b[?25l"); // hide the blinking cursor
	console.print("  \x01n\x01b\x01h" + what + " \x01k\x01h(\x01n\x01b\x01b" + maxLen + "\x01b chars\x01k\x01h)\x01n...\r\n");
	console.print("\x01k\x01h" + entryBorder + "\x01w|\r\n");
	console.print("\x01k\x01h" + entryField + "\x01w|\r\n");
	console.print("\x01k\x01h" + entryBorder + "\x01w|\r\n");
	console.print("\r\n  \x01n\x01bPreview:\r\n");
	console.print("\x01b\x01h" + previewBorder + "\x01w|\r\n");
	console.print("\x01b\x01h" + previewField + "\x01w|\r\n");
	console.print("\x01b\x01h" + previewBorder + "\x01w|\r\n");

	console.print("\r\nPipe colors:");
	console.print("\r\n \x01k\x01hForeground:");    
    for (var i = 1; i < 16; i++) {
        console.print( " \x01n|" +  pipeToCtrlA(format("\x01n|%02d", i)) + format("%02d", i)  );
    }
    console.print("\r\n \x01k\x01hBackground:");
    for (var i = 16; i < 24; i++) {
        console.print( " \x01n|" +  pipeToCtrlA(format("\x01k\x01h|%02d", i)) + format("%02d", i) + "\x01n" );
    }

    var fInput = new Frame(1, 3, WIDTH, 1, BG_BLACK|LIGHTGRAY);
	var fPreview = new Frame(1, 8, maxLen, 1, BG_BLACK|LIGHTGRAY);
	var charsUsed = new Frame(15, 6, 15, 1, BG_BLACK|LIGHTGRAY);
	fInput.open();
	fInput.putmsg(inputStr + BLINKY_CURSOR);
	fInput.cycle();
	fPreview.open();
	charsUsed.open();
	charsUsed.putmsg(format("\x01n\x01k(%s%d of %d\x01n\x01k)", "\x01k\x01h", 0, maxLen));
	charsUsed.cycle();

    while (!js.terminated) {

        keyPressed = console.inkey(K_NOCRLF|K_NOSPIN|K_NOECHO,10000); 

        if (keyPressed == "\r" && console.strlen(previewStr) <= maxLen) {
			break;
		} else if (keyPressed == KEY_DEL || keyPressed == '\b') {
			inputStr = inputStr.substr(0, inputStr.length - 1);
			updateFrames = true;
		} else if (keyPressed == KEY_ESC) {
			inputStr = "";
			previewStr = "";
			break;
		} else {
			if (keyPressed != CTRL_Z) { // disable accidentally typing a CTRL-Z character
				inputStr = inputStr + keyPressed;
				updateFrames = true;
			}
		}

		if (updateFrames) {
			previewStr = pipeToCtrlA(inputStr);

			fInput.clear();
			fInput.putmsg(inputStr + BLINKY_CURSOR);
			fInput.cycle();

			fPreview.clear();
			fPreview.putmsg(previewStr);
			fPreview.cycle();

			charsUsed.clear();
			charsUsed.putmsg( format("\x01n\x01k(%s%d of %d\x01n\x01k)",
									(console.strlen(previewStr) <= maxLen ? "\x01c" : "\x01r"),
									console.strlen(previewStr),
									maxLen) );
			charsUsed.cycle();

			updateFrames = false;
        }
        yield();
    }
	fInput.close();
	fPreview.close();
	charsUsed.close();
    printf("\x1b[?25h"); // show the blinking cursor when done
    return strip_ctrl(inputStr.trim());
}

function init() {
	// disable accidentally toggling "raw input/output" modes
	js.on_exit("console.ctrlkey_passthru = " + console.ctrlkey_passthru);
	console.ctrlkey_passthru = "Z";	
    loadSettings();
    readmsgbase();
}

try {
    init();
    main();
} catch (err) {
    log(LOG_ERR, err);
}
