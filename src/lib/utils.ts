import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a duration (in seconds) to a "mm:ss" string format.
 * Pads single-digit minutes and seconds with a leading zero.
 * Example: 65 -> "01:05"
 *
 * @param durationInSeconds - The duration to format, in seconds.
 * @returns The formatted duration string as "mm:ss".
 */
export const formatDuration = (durationInSeconds: number) => {
  const minutes = Math.floor(durationInSeconds / 60000);
  const seconds = Math.floor((durationInSeconds % 60000) / 1000);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export const snakeCaseToTitle = (str: string) => {
  return str.replace(/_/g, " ").replace(/\b\w/g, (txt) => txt.toUpperCase());
};
