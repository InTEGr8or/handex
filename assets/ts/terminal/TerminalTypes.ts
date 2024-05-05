
export const TerminalCssClasses = {
    Terminal: 'terminal',
    Line: 'terminal-line',
    Output: 'terminal-output',
    Input: 'terminal-input',
    Prompt: 'prompt',
    Head: 'head',
    Tail: 'tail',
    LogPrefix: 'log-prefix',
    LogTime: 'log-time',
    NextChars: 'nextChars'
} as const;

export const LogKeys = {
    CharTime: 'char-time',
    Command: 'command',
} as const;

export type TimeCode = string;
export type TimeHTML = string;
export type CharDuration = {
    character: string;
    durationMilliseconds: number;
}
export type CharWPM = {
    character: string;
    wpm: number;
}