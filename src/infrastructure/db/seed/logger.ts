const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

export interface Logger {
  info(message: string): void;
  success(message: string): void;
  warn(message: string): void;
  error(message: string, err?: Error): void;
  phase(name: string): void;
  table(name: string, count: number, durationMs: number): void;
  summary(totalRows: number, durationMs: number): void;
}

export function createLogger(): Logger {
  return {
    info(message: string) {
      console.log(`${COLORS.dim}[info]${COLORS.reset} ${message}`);
    },

    success(message: string) {
      console.log(`${COLORS.green}[done]${COLORS.reset} ${message}`);
    },

    warn(message: string) {
      console.log(`${COLORS.yellow}[warn]${COLORS.reset} ${message}`);
    },

    error(message: string, err?: Error) {
      console.error(`${COLORS.red}[error]${COLORS.reset} ${message}`);
      if (err) {
        console.error(`${COLORS.dim}${err.stack ?? err.message}${COLORS.reset}`);
      }
    },

    phase(name: string) {
      console.log('');
      console.log(`${COLORS.cyan}━━━ ${name} ━━━${COLORS.reset}`);
    },

    table(name: string, count: number, durationMs: number) {
      const dots = '.'.repeat(Math.max(1, 40 - name.length));
      console.log(
        `  ${name} ${COLORS.dim}${dots}${COLORS.reset} ${count} rows ${COLORS.dim}(${durationMs}ms)${COLORS.reset}`
      );
    },

    summary(totalRows: number, durationMs: number) {
      console.log('');
      console.log(`${COLORS.green}━━━ Seed completed ━━━${COLORS.reset}`);
      console.log(`  Total rows: ${totalRows}`);
      console.log(`  Duration: ${durationMs}ms`);
      console.log('');
    },
  };
}
