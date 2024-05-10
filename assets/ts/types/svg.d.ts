// svg.d.ts
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'use': React.SVGProps<SVGUseElement>;
    }
  }
}

export {};