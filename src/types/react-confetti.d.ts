declare module 'react-confetti' {
    import React from 'react';

    export interface ConfettiProps {
        width: number;
        height: number;
        numberOfPieces?: number;
        recycle?: boolean;
        wind?: number;
        gravity?: number;
        initialVelocityX?: number;
        initialVelocityY?: number;
        colors?: string[];
        opacity?: number;
        onConfettiComplete?: (confetti: unknown) => void;
        // Add other props as needed
    }

    export default class Confetti extends React.Component<ConfettiProps> { }
}
