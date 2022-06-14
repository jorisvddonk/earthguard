import { Choice, QuestVM, parseMarkdown } from 'questmark';
import Noty from 'noty'

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
    vm.loadVMState(vmState);
    vm.run();
  }
}
