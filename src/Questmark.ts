import * as _ from 'lodash'
import MarkdownIt from 'markdown-it'
import * as dot from 'dot'
import { Promise } from 'q'
dot.templateSettings.varname = 'context'
dot.templateSettings.strip = false

const defaultInquirer = {
  prompt: (text, questions) => {
    console.log(text)
    console.log(questions.map(x => '* ' + x).join('\n'))
    return Promise((resolve, reject) => {
      setTimeout(() => {
        const pick = _.sample(questions)
        console.log('Picked: ', pick)
        resolve(pick)
      }, 1000)
    })
  },
  notify: text => {
    console.log(text)
  },
}

export class Questmark {
  private source: any
  private X: any
  private allHeaders: any
  private currentState: any
  private inquirer: any
  private previousErrors: any
  private questmarkOptions: any
  private context: object

  constructor(source, inquirer) {
    this.inquirer = inquirer || defaultInquirer
    this.source = source
    this.X = this.parseMD(this.source)
    this.questmarkOptions = this.getQuestmarkOptions(this.X)
    this.context = this.questmarkOptions.hasOwnProperty('initial-context')
      ? this.questmarkOptions['initial-context']
      : {}
    this.currentState = this.questmarkOptions.hasOwnProperty('initial-state')
      ? this.questmarkOptions['initial-state']
      : 'InitialState'
    this.allHeaders = this.getHeaders(this.X)
    this.previousErrors = []
    this.parseState()
  }

  private parseMD(text) {
    const markdownIt = new MarkdownIt()
    const tokens = markdownIt.parse(text)
    return tokens
  }

  private getTokensInHeader(tokens, headerToSearch) {
    return _.reduce(
      tokens,
      (memo, token, index) => {
        if (token.type === 'heading_open') {
          memo.isParsingHeader = true
          memo.foundHeader = false
        }

        if (memo.foundHeader && !memo.isParsingHeader) {
          memo.tokensInHeader.push(token)
        }

        if (token.type === 'heading_close') {
          memo.isParsingHeader = false
        }

        if (memo.isParsingHeader && token.type === 'inline') {
          if (token.content === headerToSearch) {
            memo.foundHeader = true
          }
        }

        return memo
      },
      { isParsingHeader: false, foundHeader: false, tokensInHeader: [] }
    ).tokensInHeader
  }
  private getTokensInInfoHeader(tokens) {
    return this.getTokensInHeader(tokens, 'QUESTMARK-OPTIONS-HEADER')
  }

  private getHeaders(tokens) {
    let parsingHeader = false
    return _.reduce(
      tokens,
      (memo, token, index) => {
        if (parsingHeader && token.type === 'inline') {
          memo[memo.length - 1].push(token.content)
        }

        if (token.type === 'heading_open') {
          parsingHeader = true
          memo.push([])
        }

        if (token.type === 'heading_close') {
          memo[memo.length - 1] = memo[memo.length - 1].join(' ')
          parsingHeader = false
        }

        return memo
      },
      []
    )
  }

  private getQuestmarkOptions(tokens) {
    const defaultQuestmarkOptions = { hamster: 'kaasbal' }
    const codeBlockInlineTokens = _.filter(
      _.flatten(
        _.map(
          _.filter(this.getTokensInInfoHeader(tokens), token => {
            return token.type === 'inline'
          }),
          'children'
        )
      ),
      inlineToken => {
        return inlineToken.type === 'code_inline'
      }
    )
    const codeBlockTokens = _.filter(
      this.getTokensInInfoHeader(tokens),
      token => {
        return token.type === 'code_block'
      }
    )
    const allCodeblockTokens = codeBlockInlineTokens.concat(codeBlockTokens)
    const codeJSONs = _.map(allCodeblockTokens, codeBlockToken => {
      let retval = {}
      try {
        retval = JSON.parse(codeBlockToken.content)
      } catch (e) {}
      return retval
    })
    return _.reduce(
      codeJSONs,
      (memo, codeJSON) => {
        return _.extend(memo, codeJSON)
      },
      defaultQuestmarkOptions
    )
  }

  private getBlocksBetween(tokens, beginTokenType, endTokenType, truthFunc?) {
    if (truthFunc === undefined) {
      truthFunc = () => {
        return true
      }
    }
    const beginIndexes = _.reduce(
      tokens,
      (memo, token, index) => {
        if (token.type === beginTokenType && truthFunc(token)) {
          memo.push(index)
        }
        return memo
      },
      []
    )
    const endIndexes = _.reduce(
      tokens,
      (memo, token, index) => {
        if (token.type === endTokenType && truthFunc(token)) {
          memo.push(index)
        }
        return memo
      },
      []
    )
    const blockIndexes = _.zip(beginIndexes, endIndexes)
    return _.reduce(
      blockIndexes,
      (memo, blockIndex) => {
        memo.push(tokens.slice(blockIndex[0] + 1, blockIndex[1]))
        return memo
      },
      []
    )
  }

  private filterBlocks(blocks, tokenType) {
    return _.map(blocks, block => {
      return _.filter(block, token => {
        return token.type === tokenType
      })
    })
  }

  private getListItemContents(tokens) {
    return this.filterBlocks(
      this.getBlocksBetween(
        tokens,
        'list_item_open',
        'list_item_close',
        token => {
          return token.markup === '*'
        }
      ),
      'inline'
    )
  }

  private getOptionsForTokens(tokens, availableHeaders) {
    const listItems = this.getListItemContents(tokens)
    return _.map(listItems, listItem => {
      const content = _.trim(
        _.map(
          _.filter(listItem[0].children, c => {
            return c.type === 'text'
          }),
          'content'
        ).join(' ')
      )
      const linkOpenTag = _.filter(listItem[0].children, c => {
        return c.type === 'link_open'
      }).pop()
      let href
      let tostate
      if (linkOpenTag !== undefined) {
        href = _.fromPairs(linkOpenTag.attrs).href
      }
      if (href !== undefined) {
        if (!_.startsWith(href, '#')) {
          tostate = undefined
        } else if (!_.includes(availableHeaders, href.substr(1))) {
          tostate = undefined
        } else {
          tostate = href.substr(1)
        }
      }

      return {
        href,
        tostate,
        content,
        tokens: listItem[0].children,
      }
    })
  }

  private getRawTextInHeader(originalMarkdownText, tokens, header) {
    const headers = this.getHeaders(tokens)
    const thisHeader = header
    const thisHeaderIndex = _.indexOf(headers, header)

    if (thisHeaderIndex === undefined) {
      throw new Error('Header not found in input tokens!')
    }
    const thisHeaderTokens = this.getTokensInHeader(tokens, thisHeader)

    const lineData = _.reduce(
      _.map(thisHeaderTokens, 'map'),
      (memo, mapVal) => {
        if (_.isArray(mapVal)) {
          if (mapVal[0] < memo.begin) {
            memo.begin = mapVal[0]
          }
          if (mapVal[1] > memo.end) {
            memo.end = mapVal[1]
          }
        }
        return memo
      },
      { begin: Infinity, end: -Infinity }
    )
    if (lineData.begin !== Infinity && lineData.end !== Infinity) {
      return originalMarkdownText
        .split('\n')
        .slice(lineData.begin - 1, lineData.end)
        .join('\n')
    } else {
      throw new Error('Header did not have any line data: ' + header)
    }
  }

  private execCode(data, previousErrors) {
    try {
      return eval(data)
    } catch (e) {
      previousErrors.push(e)
      return undefined
    }
  }

  private processTokens(tokens, previousErrors) {
    return _.compact(
      _.map(tokens, x => {
        if (x.type === 'code_inline') {
          const retval = this.execCode(x.content, previousErrors)
          if (retval === undefined) {
            return undefined
          } else {
            x.content = retval
            return x
          }
        } else {
          x.children = this.processTokens(x.children, previousErrors)
          if (x.children.length > 0) {
            x.content = _.reduce(
              x.children,
              (memo, child) => {
                let ncontent = child.content
                if (child.type === 'softbreak') {
                  ncontent = '\n'
                }
                return memo + ncontent
              },
              ''
            )
          }
          return x
        }
      })
    )
  }

  private parseState() {
    const textInHeader = this.getRawTextInHeader(
      this.source,
      this.X,
      this.currentState
    )
    const templateFunc = dot.template(textInHeader)
    const stateMarkdown = templateFunc(this.context)
    const stateTokens = this.parseMD(stateMarkdown)
    const paragraphsData = this.processTokens(
      _.filter(
        _.flatten(
          this.getBlocksBetween(
            stateTokens,
            'paragraph_open',
            'paragraph_close'
          )
        ),
        x => {
          return x.level === 1
        }
      ),
      this.previousErrors
    )
    const text = _.reduce(
      paragraphsData,
      (memo, val) => {
        memo = memo + '\n' + val.content
        return memo
      },
      ''
    ).trim()
    const options = this.getOptionsForTokens(stateTokens, this.allHeaders)
    if (options.length > 0) {
      this.inquirer
        .prompt(text, _.map(options, 'content'))
        .then(selectedOptionText => {
          const selectedOption = _.find(
            options,
            x => x.content === selectedOptionText
          )
          const codeTokens = _.filter(
            selectedOption.tokens,
            x => x.type === 'code_inline'
          )
          _.each(codeTokens, codeToken => {
            this.execCode(codeToken.content, this.previousErrors)
          })
          if (selectedOption.tostate !== undefined) {
            this.currentState = selectedOption.tostate
            this.parseState()
          } else {
            this.inquirer.notify('** Connection terminated **')
          }
        })
    } else {
      this.inquirer.notify(
        `${text.length > 0 ? text + '\n' : ''}** Connection terminated **`
      )
    }
  }
}
