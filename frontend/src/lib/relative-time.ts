const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
});

const RELATIVE_TIME_UNITS = [
  { unit: 'year', seconds: 60 * 60 * 24 * 365 },
  { unit: 'month', seconds: 60 * 60 * 24 * 30 },
  { unit: 'week', seconds: 60 * 60 * 24 * 7 },
  { unit: 'day', seconds: 60 * 60 * 24 },
  { unit: 'hour', seconds: 60 * 60 },
  { unit: 'minute', seconds: 60 },
] as const satisfies readonly {
  unit: Intl.RelativeTimeFormatUnit;
  seconds: number;
}[];

export function formatRelativeTime(iso: string): string {
  const timestamp = new Date(iso).getTime();

  if (!Number.isFinite(timestamp)) {
    return 'recently';
  }

  const secondsFromNow = Math.round((timestamp - Date.now()) / 1000);

  if (secondsFromNow > -60) {
    return 'just now';
  }

  const absoluteSeconds = Math.abs(secondsFromNow);
  const division = RELATIVE_TIME_UNITS.find((candidate) => absoluteSeconds >= candidate.seconds);

  if (!division) {
    return 'just now';
  }

  return RELATIVE_TIME_FORMATTER.format(
    Math.round(secondsFromNow / division.seconds),
    division.unit,
  );
}
