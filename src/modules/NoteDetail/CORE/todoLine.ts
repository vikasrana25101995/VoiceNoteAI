// To-do lines are stored in note.todos as "- [ ] text", "- [x] text", optionally ending in " @due(YYYY-MM-DD)".
// Line breaks inside an item are stored as U+2028 so each item stays on one stored line.
const LINE_SEP = '\u2028';
const DUE_RE = /\s*@due\((\d{4}-\d{2}-\d{2})\)\s*$/;
const PREFIX_RE = /^\s*(- \[[xX\s]\]|\[[xX\s]\]|[•\-\*])\s*/;

export interface TodoLine {
  checked: boolean;
  text: string;
  due: string; // YYYY-MM-DD or ''
}

export function parseTodoLine(line: string): TodoLine {
  return {
    checked: /^\s*(- \[[xX]\]|\[[xX]\])/.test(line),
    due: line.match(DUE_RE)?.[1] ?? '',
    text: line.replace(DUE_RE, '').replace(PREFIX_RE, '').replaceAll(LINE_SEP, '\n'),
  };
}

export function formatTodoLine({ checked, text, due }: TodoLine): string {
  return `- [${checked ? 'x' : ' '}] ${text.replace(/\r?\n/g, LINE_SEP)}${due ? ` @due(${due})` : ''}`;
}

// Local-date "today" as YYYY-MM-DD, so string comparison works for overdue checks.
export const todayISO = () => new Date().toLocaleDateString('en-CA');

export const formatDue = (due: string) =>
  new Date(`${due}T00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
