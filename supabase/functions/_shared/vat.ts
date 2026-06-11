export const VAT_RATE = 0.20;

const round2 = (n: number) => Math.round(n * 100) / 100;

export const withVat = (net: number) => round2(net * (1 + VAT_RATE));
export const vatAmount = (net: number) => round2(net * VAT_RATE);