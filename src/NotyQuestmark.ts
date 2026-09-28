import { Choice, QuestVM, parseMarkdown } from 'questmark';
import Noty from 'noty'

// Tzo matches `{` / `}` blocks by Function.name, which minifiers mangle
// (breaking every option block in production builds). These replacements
// match by a property tag instead, which minifiers leave alone.
function questmarkOpenBrace(stack: any, context: any, vm: any) {
  let depth = 0;
  let pc = vm.programCounter + 1;
  while (true) {
    const instruction = vm.programList[pc];
    if (instruction === undefined) {
      throw new Error('Unmatched { in questmark program');
    }
    if ((instruction as any).isQuestmarkOpenBrace) {
      depth += 1;
    }
    if ((instruction as any).isQuestmarkCloseBrace) {
      if (depth === 0) {
        vm.programCounter = pc + 1;
        break;
      }
      depth -= 1;
    }
    pc += 1;
  }
}
(questmarkOpenBrace as any).isQuestmarkOpenBrace = true;

function questmarkCloseBrace(stack: any) {
  // no-op: `{` already jumps past the matching `}` when skipping a block.
}
(questmarkCloseBrace as any).isQuestmarkCloseBrace = true;

export class NotyQuestmark {
  constructor(source) {
    const vmState = parseMarkdown(source).qvmState;
    let text = [];
    const vm = new QuestVM((body) => {
      text.push(`${body}`.trim());
    }, (choices: Choice[]) => {
      return new Promise(ok => {
        const buttons = choices.map(q => {
          return Noty.button(q.title, 'btn btn-default', n => {
            n.close()
            ok(q.id)
          })
        })
        const n = new Noty({
          text: text.join('\n').replace(/\n/g, '<br/>'),
          layout: 'bottomLeft',
          type: 'alert',
          buttons,
          closeWith: [],
        })
        text = [];
        n.show()
      })
    });
    // Install minification-safe `{` / `}` before loading, so the VM uses
    // these instead of Tzo's name-based versions.
    (vm as any).functions['{'] = questmarkOpenBrace;
    (vm as any).functions['}'] = questmarkCloseBrace;
    vm.loadVMState(vmState);
    vm.run();
  }
}
