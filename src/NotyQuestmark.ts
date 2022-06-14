import { Questmark } from './Questmark'
import Noty from 'noty'

export class NotyQuestmark {
  private source: any
  private questmark: Questmark
  constructor(source) {
    this.source = source
    this.questmark = new Questmark(this.source, {
      prompt: (text, questions) => {
        return new Promise(ok => {
          const buttons = questions.map(q => {
            return Noty.button(q, 'btn btn-default', n => {
              n.close()
              ok(q)
            })
          })
          const n = new Noty({
            text: text.replace(/\n/g, '<br/>'),
            layout: 'bottomLeft',
            type: 'alert',
            buttons,
            closeWith: [],
          })
          n.show()
        })
      },
      notify: text => {
        const n = new Noty({
          text: text.replace(/\n/g, '<br/>'),
          layout: 'bottomLeft',
          type: 'alert',
        })
        n.show()
      },
    })
  }
}
