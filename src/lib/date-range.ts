/**
 * The list toolbars expose preset chips ("Last 7 days", "Today", ...). The API
 * takes an inclusive `from`/`to` pair of YYYY-MM-DD dates, so each preset is
 * resolved to concrete dates before the request goes out.
 */
function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export interface DateRange {
  from?: string;
  to?: string;
}

export function resolveDateRange(preset: string, now = new Date()): DateRange {
  const to = iso(now);
  const start = new Date(now);

  switch (preset) {
    case "today":
      return { from: to, to };
    case "week":
      start.setDate(start.getDate() - 7);
      return { from: iso(start), to };
    case "7d":
      start.setDate(start.getDate() - 6);
      return { from: iso(start), to };
    case "month":
      start.setMonth(start.getMonth() - 1);
      return { from: iso(start), to };
    case "3m":
      start.setMonth(start.getMonth() - 3);
      return { from: iso(start), to };
    case "6m":
      start.setMonth(start.getMonth() - 6);
      return { from: iso(start), to };
    case "12m":
      start.setFullYear(start.getFullYear() - 1);
      return { from: iso(start), to };
    case "custom":
    default:
      // "Custom period" is chosen from a date picker, so send no bounds until set.
      return {};
  }
}
