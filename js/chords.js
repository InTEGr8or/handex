const allChords = [
    {
        "report": "a and A",
        "value": "0x04",
        "chord": "4",
        "strokes": "ipf"
    },
    {
        "report": "b and B",
        "value": "0x05",
        "chord": "D6",
        "strokes": "ppf, mmf"
    },
    {
        "report": "c and C",
        "value": "0x06",
        "chord": "47",
        "strokes": "ipf, mpf"
    },
    {
        "report": "d and D",
        "value": "0x07",
        "chord": "7A",
        "strokes": "mpf, rpf"
    },
    {
        "report": "e and E",
        "value": "0x08",
        "chord": "7",
        "strokes": "mpf"
    },
    {
        "report": "f and F",
        "value": "0x09",
        "chord": "74",
        "strokes": "mpf, ipf"
    },
    {
        "report": "g and G",
        "value": "0x0A",
        "chord": "76",
        "strokes": "mpf, mmf"
    },
    {
        "report": "h and H",
        "value": "0x0B",
        "chord": "9A",
        "strokes": "rmf, rpf"
    },
    {
        "report": "i and I",
        "value": "0x0C",
        "chord": "31",
        "strokes": "imf, tpf"
    },
    {
        "report": "j and J",
        "value": "0x0D",
        "chord": "34",
        "strokes": "imf, ipf"
    },
    {
        "report": "k and K",
        "value": "0x0E",
        "chord": "DA",
        "strokes": "ppf, rpf"
    },
    {
        "report": "l and L",
        "value": "0x0F",
        "chord": "AD",
        "strokes": "rpf, ppf"
    },
    {
        "report": "m and M",
        "value": "0x10",
        "chord": "67",
        "strokes": "mmf, mpf"
    },
    {
        "report": "n and N",
        "value": "0x11",
        "chord": "D",
        "strokes": "ppf"
    },
    {
        "report": "o and O",
        "value": "0x12",
        "chord": "3",
        "strokes": "imf"
    },
    {
        "report": "p and P",
        "value": "0x13",
        "chord": "43",
        "strokes": "ipf, imf"
    },
    {
        "report": "q and Q",
        "value": "0x14",
        "chord": "674",
        "strokes": "mmf, mpf, ipf"
    },
    {
        "report": "r and R",
        "value": "0x15",
        "chord": "A",
        "strokes": "rpf"
    },
    {
        "report": "s and S",
        "value": "0x16",
        "chord": "C",
        "strokes": "pmf"
    },
    {
        "report": "t and T",
        "value": "0x17",
        "chord": "9",
        "strokes": "rmf"
    },
    {
        "report": "u and U",
        "value": "0x18",
        "chord": "6",
        "strokes": "mmf"
    },
    {
        "report": "v and V",
        "value": "0x19",
        "chord": "61",
        "strokes": "mmf, tpf"
    },
    {
        "report": "w and W",
        "value": "0x1A",
        "chord": "A6",
        "strokes": "rpf, mmf"
    },
    {
        "report": "x and X",
        "value": "0x1B",
        "chord": "4D",
        "strokes": "ipf, ppf"
    },
    {
        "report": "y and Y",
        "value": "0x1C",
        "chord": "D5",
        "strokes": "ppf, ime"
    },
    {
        "report": "z and Z",
        "value": "0x1D",
        "chord": "71",
        "strokes": "mpf, tpf"
    },
    {
        "report": "1 and !",
        "value": "0x1E",
        "chord": "346",
        "strokes": "imf, ipf, mmf"
    },
    {
        "report": "2 and @",
        "value": "0x1F",
        "chord": "347",
        "strokes": "imf, ipf, mpf"
    },
    {
        "report": "3 and #",
        "value": "0x20",
        "chord": "3467",
        "strokes": "imf, ipf, mmf, mpf"
    },
    {
        "report": "4 and $",
        "value": "0x21",
        "chord": "3476",
        "strokes": "imf, ipf, mpf, mmf"
    },
    {
        "report": "5 and %",
        "value": "0x22",
        "chord": "349",
        "strokes": "imf, ipf, rmf"
    },
    {
        "report": "6 and ^",
        "value": "0x23",
        "chord": "34A",
        "strokes": "imf, ipf, rpf"
    },
    {
        "report": "7 and &",
        "value": "0x24",
        "chord": "349A",
        "strokes": "imf, ipf, rmf, rpf"
    },
    {
        "report": "8 and *",
        "value": "0x25",
        "chord": "34A9",
        "strokes": "imf, ipf, rpf, rmf"
    },
    {
        "report": "9 and (",
        "value": "0x26",
        "chord": "34C",
        "strokes": "imf, ipf, pmf"
    },
    {
        "report": "0 and )",
        "value": "0x27",
        "chord": "34D",
        "strokes": "imf, ipf, ppf"
    },
    {
        "report": "Return (ENTER)",
        "value": "0x28",
        "chord": "41",
        "strokes": "ipf, tpf"
    },
    {
        "report": "ESCAPE",
        "value": "0x29",
        "chord": "DC",
        "strokes": "ppf, pmf"
    },
    {
        "report": "DELETE (Backspace)",
        "value": "0x2A",
        "chord": "C1",
        "strokes": "pmf, tpf"
    },
    {
        "report": "Tab",
        "value": "0x2B",
        "chord": "CD",
        "strokes": "pmf, ppf"
    },
    {
        "report": "Spacebar",
        "value": "0x2C",
        "chord": "1",
        "strokes": "tpf"
    },
    {
        "report": "- and (underscore)",
        "value": "0x2D",
        "chord": "38",
        "strokes": "imf, mme"
    },
    {
        "report": "= and +",
        "value": "0x2E",
        "chord": "72",
        "strokes": "mpf, tme"
    },
    {
        "report": "[ and {",
        "value": "0x2F",
        "chord": "A2",
        "strokes": "rpf, tme"
    },
    {
        "report": "] and }",
        "value": "0x30",
        "chord": "3B",
        "strokes": "imf, rme"
    },
    {
        "report": "\\ and |",
        "value": "0x31",
        "chord": "AB",
        "strokes": "rpf, rme"
    },
    {
        "report": "Non-US # and ~",
        "value": "0x32",
        "chord": "4A",
        "strokes": "ipf, rpf"
    },
    {
        "report": "; and :",
        "value": "0x33",
        "chord": "42",
        "strokes": "ipf, tme"
    },
    {
        "report": "' and \"",
        "value": "0x34",
        "chord": "434",
        "strokes": "ipf, imf, ipf"
    },
    {
        "report": "Grave Accent and Tilde",
        "value": "0x35",
        "chord": "45",
        "strokes": "ipf, ime"
    },
    {
        "report": ", and <",
        "value": "0x36",
        "chord": "46",
        "strokes": "ipf, mmf"
    },
    {
        "report": ". and >",
        "value": "0x37",
        "chord": "D1",
        "strokes": "ppf, tpf"
    },
    {
        "report": "/ and ?",
        "value": "0x38",
        "chord": "AC",
        "strokes": "rpf, pmf"
    },
    {
        "report": "Caps Lock",
        "value": "0x39",
        "chord": "F",
        "strokes": ""
    },
    {
        "report": "F1",
        "value": "0x3A",
        "chord": "4A4",
        "strokes": "ipf, rpf, ipf"
    },
    {
        "report": "F2",
        "value": "0x3B",
        "chord": "4B",
        "strokes": "ipf, rme"
    },
    {
        "report": "F3",
        "value": "0x3C",
        "chord": "A61",
        "strokes": "rpf, mmf, tpf"
    },
    {
        "report": "F4",
        "value": "0x3D",
        "chord": "51",
        "strokes": "ime, tpf"
    },
    {
        "report": "F5",
        "value": "0x3E",
        "chord": "48",
        "strokes": "ipf, mme"
    },
    {
        "report": "F6",
        "value": "0x3F",
        "chord": "513",
        "strokes": "ime, tpf, imf"
    },
    {
        "report": "F7",
        "value": "0x40",
        "chord": "54",
        "strokes": "ime, ipf"
    },
    {
        "report": "F8",
        "value": "0x41",
        "chord": "56",
        "strokes": "ime, mmf"
    },
    {
        "report": "F9",
        "value": "0x42",
        "chord": "57",
        "strokes": "ime, mpf"
    },
    {
        "report": "F10",
        "value": "0x43",
        "chord": "58",
        "strokes": "ime, mme"
    },
    {
        "report": "F11",
        "value": "0x44",
        "chord": "59",
        "strokes": "ime, rmf"
    },
    {
        "report": "F12",
        "value": "0x45",
        "chord": "5A5",
        "strokes": "ime, rpf, ime"
    },
    {
        "report": "PrintScreen",
        "value": "0x46",
        "chord": "5B",
        "strokes": "ime, rme"
    },
    {
        "report": "Scroll Lock",
        "value": "0x47",
        "chord": "6F6",
        "strokes": "mmf, mmf"
    },
    {
        "report": "Pause",
        "value": "0x48",
        "chord": "713",
        "strokes": "mpf, tpf, imf"
    },
    {
        "report": "Insert",
        "value": "0x49",
        "chord": "711",
        "strokes": "mpf, tpf, tpf"
    },
    {
        "report": "Home",
        "value": "0x4A",
        "chord": "69",
        "strokes": "mmf, rmf"
    },
    {
        "report": "PageUp",
        "value": "0x4B",
        "chord": "62",
        "strokes": "mmf, tme"
    },
    {
        "report": "Delete Forward",
        "value": "0x4C",
        "chord": "65",
        "strokes": "mmf, ime"
    },
    {
        "report": "End",
        "value": "0x4D",
        "chord": "676",
        "strokes": "mmf, mpf, mmf"
    },
    {
        "report": "PageDown",
        "value": "0x4E",
        "chord": "474",
        "strokes": "ipf, mpf, ipf"
    },
    {
        "report": "RightArrow",
        "value": "0x4F",
        "chord": "36",
        "strokes": "imf, mmf"
    },
    {
        "report": "LeftArrow",
        "value": "0x50",
        "chord": "63",
        "strokes": "mmf, imf"
    },
    {
        "report": "DownArrow",
        "value": "0x51",
        "chord": "6B",
        "strokes": "mmf, rme"
    },
    {
        "report": "UpArrow",
        "value": "0x52",
        "chord": "767",
        "strokes": "mpf, mmf, mpf"
    },
    {
        "report": "Keypad Num Lock and Clear",
        "value": "0x53",
        "chord": "717",
        "strokes": "mpf, tpf, mpf"
    },
    {
        "report": "Keypad /",
        "value": "0x54",
        "chord": "727",
        "strokes": "mpf, tme, mpf"
    },
    {
        "report": "Keypad *",
        "value": "0x55",
        "chord": "73",
        "strokes": "mpf, imf"
    },
    {
        "report": "Keypad -",
        "value": "0x56",
        "chord": "747",
        "strokes": "mpf, ipf, mpf"
    },
    {
        "report": "Keypad +",
        "value": "0x57",
        "chord": "75",
        "strokes": "mpf, ime"
    },
    {
        "report": "Keypad ENTER",
        "value": "0x58",
        "chord": "76F",
        "strokes": "mpf, mmf"
    },
    {
        "report": "Keypad 1 and End",
        "value": "0x59",
        "chord": "78D",
        "strokes": "mpf, mme, ppf"
    },
    {
        "report": "Keypad 2 and Down Arrow",
        "value": "0x5A",
        "chord": "79",
        "strokes": "mpf, rmf"
    },
    {
        "report": "Keypad 3 and PageDn",
        "value": "0x5B",
        "chord": "7A769",
        "strokes": "mpf, rpf, mpf, mmf, rmf"
    },
    {
        "report": "Keypad 4 and Left Arrow",
        "value": "0x5C",
        "chord": "7B",
        "strokes": "mpf, rme"
    },
    {
        "report": "Keypad 5",
        "value": "0x5D",
        "chord": "8F",
        "strokes": "mme"
    },
    {
        "report": "Keypad 6 and Right Arrow",
        "value": "0x5E",
        "chord": "81",
        "strokes": "mme, tpf"
    },
    {
        "report": "Keypad 7 and Home",
        "value": "0x5F",
        "chord": "82",
        "strokes": "mme, tme"
    },
    {
        "report": "Keypad 8 and Up Arrow",
        "value": "0x60",
        "chord": "83",
        "strokes": "mme, imf"
    },
    {
        "report": "Keypad 9 and PageUp",
        "value": "0x61",
        "chord": "84",
        "strokes": "mme, ipf"
    },
    {
        "report": "Keypad 0 and Insert",
        "value": "0x62",
        "chord": "85",
        "strokes": "mme, ime"
    },
    {
        "report": "Keypad . and Delete",
        "value": "0x63",
        "chord": "86F",
        "strokes": "mme, mmf"
    },
    {
        "report": "Non-US \\ and |",
        "value": "0x64",
        "chord": "87F",
        "strokes": "mme, mpf"
    },
    {
        "report": "Application",
        "value": "0x65",
        "chord": "89",
        "strokes": "mme, rmf"
    },
    {
        "report": "Power",
        "value": "0x66",
        "chord": "8A",
        "strokes": "mme, rpf"
    },
    {
        "report": "Keypad =",
        "value": "0x67",
        "chord": "8B",
        "strokes": "mme, rme"
    },
    {
        "report": "F13",
        "value": "0x68",
        "chord": "9F",
        "strokes": "rmf"
    },
    {
        "report": "F14",
        "value": "0x69",
        "chord": "91",
        "strokes": "rmf, tpf"
    },
    {
        "report": "F15",
        "value": "0x6A",
        "chord": "92",
        "strokes": "rmf, tme"
    },
    {
        "report": "F16",
        "value": "0x6B",
        "chord": "383",
        "strokes": "imf, mme, imf"
    },
    {
        "report": "F17",
        "value": "0x6C",
        "chord": "914",
        "strokes": "rmf, tpf, ipf"
    },
    {
        "report": "F18",
        "value": "0x6D",
        "chord": "95",
        "strokes": "rmf, ime"
    },
    {
        "report": "F19",
        "value": "0x6E",
        "chord": "96",
        "strokes": "rmf, mmf"
    },
    {
        "report": "F20",
        "value": "0x6F",
        "chord": "97",
        "strokes": "rmf, mpf"
    },
    {
        "report": "F21",
        "value": "0x70",
        "chord": "98",
        "strokes": "rmf, mme"
    },
    {
        "report": "F22",
        "value": "0x71",
        "chord": "9A9",
        "strokes": "rmf, rpf, rmf"
    },
    {
        "report": "F23",
        "value": "0x72",
        "chord": "9B",
        "strokes": "rmf, rme"
    },
    {
        "report": "F24",
        "value": "0x73",
        "chord": "AF",
        "strokes": "rpf"
    },
    {
        "report": "Execute",
        "value": "0x74",
        "chord": "414",
        "strokes": "ipf, tpf, ipf"
    },
    {
        "report": "Help",
        "value": "0x75",
        "chord": "6F",
        "strokes": "mmf"
    },
    {
        "report": "Menu",
        "value": "0x76",
        "chord": "A3",
        "strokes": "rpf, imf"
    },
    {
        "report": "Select",
        "value": "0x77",
        "chord": "A4",
        "strokes": "rpf, ipf"
    },
    {
        "report": "Stop",
        "value": "0x78",
        "chord": "A5",
        "strokes": "rpf, ime"
    },
    {
        "report": "Again",
        "value": "0x79",
        "chord": "626",
        "strokes": "mmf, tme, mmf"
    },
    {
        "report": "Undo",
        "value": "0x7A",
        "chord": "A7",
        "strokes": "rpf, mpf"
    },
    {
        "report": "Cut",
        "value": "0x7B",
        "chord": "A8",
        "strokes": "rpf, mme"
    },
    {
        "report": "Copy",
        "value": "0x7C",
        "chord": "A9",
        "strokes": "rpf, rmf"
    },
    {
        "report": "Paste",
        "value": "0x7D",
        "chord": "ABA",
        "strokes": "rpf, rme, rpf"
    },
    {
        "report": "Find",
        "value": "0x7E",
        "chord": "BF",
        "strokes": "rme"
    },
    {
        "report": "Mute",
        "value": "0x7F",
        "chord": "B1B",
        "strokes": "rme, tpf, rme"
    },
    {
        "report": "Volume Up",
        "value": "0x80",
        "chord": "B2",
        "strokes": "rme, tme"
    },
    {
        "report": "Volume Down",
        "value": "0x81",
        "chord": "B3",
        "strokes": "rme, imf"
    },
    {
        "report": "Locking Caps Lock",
        "value": "0x82",
        "chord": "B4",
        "strokes": "rme, ipf"
    },
    {
        "report": "Locking Num Lock",
        "value": "0x83",
        "chord": "B5",
        "strokes": "rme, ime"
    },
    {
        "report": "Locking Scroll Lock",
        "value": "0x84",
        "chord": "B6",
        "strokes": "rme, mmf"
    },
    {
        "report": "Keypad Comma",
        "value": "0x85",
        "chord": "B7",
        "strokes": "rme, mpf"
    },
    {
        "report": "Keypad Equal Sign",
        "value": "0x86",
        "chord": "B8",
        "strokes": "rme, mme"
    },
    {
        "report": "International1",
        "value": "0x87",
        "chord": "B97",
        "strokes": "rme, rmf, mpf"
    },
    {
        "report": "International2",
        "value": "0x88",
        "chord": "BAB",
        "strokes": "rme, rpf, rme"
    },
    {
        "report": "International3",
        "value": "0x89",
        "chord": "611",
        "strokes": "mmf, tpf, tpf"
    },
    {
        "report": "International4",
        "value": "0x8A",
        "chord": "6F1",
        "strokes": "mmf, tpf"
    },
    {
        "report": "International5",
        "value": "0x8B",
        "chord": "6F2",
        "strokes": "mmf, tme"
    },
    {
        "report": "International6",
        "value": "0x8C",
        "chord": "6F3",
        "strokes": "mmf, imf"
    },
    {
        "report": "International7",
        "value": "0x8D",
        "chord": "3F4",
        "strokes": "imf, ipf"
    },
    {
        "report": "International8",
        "value": "0x8E",
        "chord": "6F5",
        "strokes": "mmf, ime"
    },
    {
        "report": "International9",
        "value": "0x8F",
        "chord": "6F6A",
        "strokes": "mmf, mmf, rpf"
    },
    {
        "report": "LANG1",
        "value": "0x90",
        "chord": "6F7",
        "strokes": "mmf, mpf"
    },
    {
        "report": "LANG2",
        "value": "0x91",
        "chord": "6F8",
        "strokes": "mmf, mme"
    },
    {
        "report": "LANG3",
        "value": "0x92",
        "chord": "6F9",
        "strokes": "mmf, rmf"
    },
    {
        "report": "LANG4",
        "value": "0x93",
        "chord": "6FA",
        "strokes": "mmf, rpf"
    },
    {
        "report": "LANG5",
        "value": "0x94",
        "chord": "6FB",
        "strokes": "mmf, rme"
    },
    {
        "report": "LANG6",
        "value": "0x95",
        "chord": "618",
        "strokes": "mmf, tpf, mme"
    },
    {
        "report": "LeftControl",
        "value": "0xE0",
        "chord": "619",
        "strokes": "mmf, tpf, rmf"
    },
    {
        "report": "LeftShift",
        "value": "0xE1",
        "chord": "4F",
        "strokes": "ipf"
    },
    {
        "report": "LeftAlt",
        "value": "0xE2",
        "chord": "61B",
        "strokes": "mmf, tpf, rme"
    },
    {
        "report": "Left GUI",
        "value": "0xE3",
        "chord": "62F",
        "strokes": "mmf, tme"
    },
    {
        "report": "RightControl",
        "value": "0xE4",
        "chord": "621",
        "strokes": "mmf, tme, tpf"
    },
    {
        "report": "RightShift",
        "value": "0xE5",
        "chord": "6F26",
        "strokes": "mmf, tme, mmf"
    },
    {
        "report": "RightAlt",
        "value": "0xE6",
        "chord": "623",
        "strokes": "mmf, tme, imf"
    },
    {
        "report": "Right GUI",
        "value": "0xE7",
        "chord": "62F6",
        "strokes": "mmf, tme, mmf"
    }
]