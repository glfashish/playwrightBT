// utils/csvtojson.ts
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

/**
 * Reads a CSV file and returns an array of type T.
 * @param relativeFilePath - Path relative to your project root, e.g. 'test-data/domesticWireData.csv'
 * @returns T[] — one object per row, with keys from the header row.
 */
export function csvToJson<T = Record<string, string>>(relativeFilePath: string): T[] {
  const fullPath = path.resolve(process.cwd(), relativeFilePath);
  const content = fs.readFileSync(fullPath, 'utf-8');
  const records: T[] = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  return records;
}
