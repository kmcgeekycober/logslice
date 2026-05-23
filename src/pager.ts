import * as readline from 'readline';
import * as process from 'process';

export interface PagerOptions {
  pageSize?: number;
  interactive?: boolean;
}

/**
 * Splits an array of lines into pages of a given size.
 */
export function paginate(lines: string[], pageSize: number): string[][] {
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += pageSize) {
    pages.push(lines.slice(i, i + pageSize));
  }
  return pages;
}

/**
 * Prints lines to stdout with optional interactive paging.
 * In non-interactive (pipe/test) mode, prints all lines immediately.
 */
export async function runPager(
  lines: string[],
  options: PagerOptions = {}
): Promise<void> {
  const { pageSize = 20, interactive = process.stdout.isTTY } = options;

  if (!interactive || lines.length <= pageSize) {
    lines.forEach((line) => process.stdout.write(line + '\n'));
    return;
  }

  const pages = paginate(lines, pageSize);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  for (let i = 0; i < pages.length; i++) {
    pages[i].forEach((line) => process.stdout.write(line + '\n'));
    if (i < pages.length - 1) {
      await new Promise<void>((resolve) => {
        rl.question(
          `\x1b[2m-- Page ${i + 1}/${pages.length}, press Enter for more (q to quit) --\x1b[0m`,
          (answer) => {
            if (answer.trim().toLowerCase() === 'q') {
              rl.close();
              process.exit(0);
            }
            resolve();
          }
        );
      });
    }
  }

  rl.close();
}
