// Run: node --experimental-strip-types src/modules/NoteDetail/CORE/todoLine.check.ts
import assert from 'node:assert/strict';
import { parseTodoLine, formatTodoLine } from './todoLine.ts';

assert.deepEqual(parseTodoLine('- [ ] Send invoice @due(2026-10-03)'), { checked: false, text: 'Send invoice', due: '2026-10-03' });
assert.deepEqual(parseTodoLine('- [x] Call vendor'), { checked: true, text: 'Call vendor', due: '' });
assert.deepEqual(parseTodoLine('• legacy bullet'), { checked: false, text: 'legacy bullet', due: '' });
for (const line of ['- [ ] a @due(2026-01-02)', '- [x] b', '- [ ] email me@due.com']) {
  assert.equal(formatTodoLine(parseTodoLine(line)), line);
}
console.log('todoLine ok');
