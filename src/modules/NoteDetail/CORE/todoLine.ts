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

// Turn pasted text or JSON into stored to-do lines ("## heading" / "- [ ] item").
// Text: one item per line; "#" lines become headings; bullets, checkboxes and "1." numbering are stripped.
// JSON: strings, arrays, {text|title|task|name, done|checked|completed, due} items,
// {heading|title, items|todos|tasks} groups, or {"Heading": [...]} maps.
export function importTodos(input: string): string[] {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    return input.split(/\r?\n/).filter((l) => l.trim()).map((l) => {
      const heading = l.match(/^\s*#{1,6}\s+(.*)/);
      if (heading) return `## ${heading[1].trim()}`;
      return formatTodoLine(parseTodoLine(l.replace(/^\s*\d+[.)]\s+/, '')));
    });
  }
  const item = (text: string, checked = false, due = '') =>
    formatTodoLine({ checked, text: text.trim(), due: /^\d{4}-\d{2}-\d{2}$/.test(due) ? due : '' });
  const walk = (v: unknown): string[] => {
    if (v == null) return [];
    if (Array.isArray(v)) return v.flatMap(walk);
    if (typeof v !== 'object') return String(v).trim() ? [item(String(v))] : [];
    const o = v as Record<string, unknown>;
    const list = o.items ?? o.todos ?? o.tasks;
    if (list !== undefined) {
      const heading = o.heading ?? o.title ?? o.name;
      return [...(heading ? [`## ${heading}`] : []), ...walk(list)];
    }
    const text = o.text ?? o.title ?? o.task ?? o.name ?? o.content;
    if (text !== undefined) return [item(String(text), !!(o.done ?? o.checked ?? o.completed), String(o.due ?? o.dueDate ?? ''))];
    return Object.entries(o).flatMap(([k, val]) => [`## ${k}`, ...walk(val)]);
  };
  return walk(data).filter((l) => l !== '- [ ] ');
}
