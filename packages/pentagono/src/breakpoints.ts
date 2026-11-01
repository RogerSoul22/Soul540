// Mesmos valores de $mobile, $tablet e $desktop do SCSS legado dos portais.
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;
