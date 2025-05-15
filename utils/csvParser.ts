import fs from 'fs';
import { parse } from 'csv-parse';

/**
 * Dynamically parses a CSV file into an array of objects.
 *
 * @template T - The type representing each row of the CSV. By default, T is Record<string, string>.
 * @param filePath - The path to the CSV file.
 * @returns A Promise that resolves with an array of objects of type T.
 *
 * Usage Example:
 *   const data = await parseCSV<{ name: string; age: string }>('data.csv');
 */
export function parseCSV<T = Record<string, string>>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = [];
    fs.createReadStream(filePath)
      .pipe(
        parse({
          columns: true,         // Uses the header row as keys.
          trim: true,            // Removes leading/trailing whitespace.
          skip_empty_lines: true // Ignores any empty lines.
        })
      )
      .on('data', (row: T) => {
        results.push(row);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}
