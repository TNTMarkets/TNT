export const languages = ["en", "uk", "ja"] as const;
export type Language = (typeof languages)[number];
