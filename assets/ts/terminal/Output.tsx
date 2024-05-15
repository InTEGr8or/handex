import React from "react";
import { TerminalCssClasses } from "./TerminalTypes";


export interface OutputProps {
    elements: HTMLElement[];
}

export const Output: React.FC<OutputProps> = ({ elements }) => {
    return (
        <div id={TerminalCssClasses.Output} className={TerminalCssClasses.Output}>
            {elements.map((htmlString, index) => (
                <div key={index} dangerouslySetInnerHTML={{ __html: htmlString }} />
            ))}
        </div>
    );
};