// svg.d.ts
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'use': React.SVGProps<SVGUseElement>;
      span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
      svg: React.SVGProps<SVGSVGElement>;
    }
  }
}

export { };