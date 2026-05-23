# logslice

A lightweight log filtering utility that parses structured JSON logs with time-range and field queries.

## Installation

```bash
npm install logslice
```

## Usage

```typescript
import { logslice } from 'logslice';

const results = logslice('./app.log', {
  from: '2024-01-15T08:00:00Z',
  to: '2024-01-15T09:00:00Z',
  fields: {
    level: 'error',
    service: 'api-gateway',
  },
});

console.log(results);
// [
//   { timestamp: '2024-01-15T08:23:11Z', level: 'error', service: 'api-gateway', message: 'timeout' },
//   ...
// ]
```

You can also filter directly from a log stream:

```typescript
import { createSliceStream } from 'logslice';

process.stdin
  .pipe(createSliceStream({ from: '2024-01-15T08:00:00Z', fields: { level: 'warn' } }))
  .pipe(process.stdout);
```

## CLI

```bash
npx logslice --file app.log --from 2024-01-15T08:00:00Z --to 2024-01-15T09:00:00Z --level error
```

## API

| Option   | Type     | Description                        |
|----------|----------|------------------------------------|
| `from`   | `string` | ISO 8601 start timestamp           |
| `to`     | `string` | ISO 8601 end timestamp             |
| `fields` | `object` | Key-value pairs to match in logs   |

## License

[MIT](./LICENSE)