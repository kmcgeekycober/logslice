#!/usr/bin/env node
import * as fs from 'fs';
import * as readline from 'readline';
import { parseLogLines } from './parser';
import { filterLogs } from './filter';
import { parseQuery } from './query';
import { formatEntries, OutputFormat } from './formatter';

interface CliArgs {
  file?: string;
  from?: string;
  to?: string;
  query?: string;
  format: OutputFormat;
  fields?: string[];
  colorize: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { format: 'json', colorize: false };
  for (let i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case '--file':   args.file    = argv[++i]; break;
      case '--from':   args.from    = argv[++i]; break;
      case '--to':     args.to      = argv[++i]; break;
      case '--query':  args.query   = argv[++i]; break;
      case '--format': args.format  = argv[++i] as OutputFormat; break;
      case '--fields': args.fields  = argv[++i].split(','); break;
      case '--color':  args.colorize = true; break;
    }
  }
  return args;
}

async function readInput(file?: string): Promise<string[]> {
  const lines: string[] = [];
  const stream = file ? fs.createReadStream(file) : process.stdin;
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  for await (const line of rl) {
    if (line.trim()) lines.push(line);
  }
  return lines;
}

async function main() {
  const args = parseArgs(process.argv);

  let rawLines: string[];
  try {
    rawLines = await readInput(args.file);
  } catch (err) {
    console.error(`logslice: failed to read input: ${(err as Error).message}`);
    process.exit(1);
  }

  const entries = parseLogLines(rawLines);
  const fieldQuery = args.query ? parseQuery(args.query) : undefined;

  const filtered = filterLogs(entries, {
    from: args.from,
    to: args.to,
    fieldQuery,
  });

  const output = formatEntries(filtered, {
    format: args.format,
    fields: args.fields,
    colorize: args.colorize,
  });

  output.forEach(line => console.log(line));
}

main();
