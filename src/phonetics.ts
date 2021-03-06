import _ from 'lodash'
/* Name generation script
     based on Phonetics (my own interpretation of them)
  */

type KeyAndValues = {
  key: string
  values: string[]
}

export default class Phonetics {
  public _unique_generate_cache: any[]
  private chargroups: {
    ordinary_vowels: KeyAndValues
    vowels: KeyAndValues
    consonants: KeyAndValues
    stops: KeyAndValues
    affricates: KeyAndValues
    fricatives: KeyAndValues
    nasals: KeyAndValues
    liquids: KeyAndValues
    glides: KeyAndValues
    remainingconsonants?: KeyAndValues
  }
  constructor() {
    this.chargroups = {
      ordinary_vowels: { key: 'o', values: ['a', 'e', 'i', 'o', 'u'] },
      vowels: { key: 'v', values: ['a', 'e', 'i', 'o', 'u', 'y'] },
      consonants: {
        key: 'c',
        values: [
          'b',
          'c',
          'd',
          'f',
          'g',
          'h',
          'j',
          'k',
          'l',
          'm',
          'n',
          'p',
          'q',
          'r',
          's',
          't',
          'v',
          'x',
          'z',
          'w',
        ],
      },
      stops: { key: 's', values: ['p', 't', 'k', 'b', 'd', 'c', 'ck'] },
      affricates: {
        key: 'a',
        values: ['j', 'g', 'ch', 'dz', 'ds', 'ts', 'tch', 'tu', 'dg'],
      },
      fricatives: {
        key: 'f',
        values: ['f', 'gh', 'v', 'f', 'th', 's', 'sh', 'ch', 'g', 'h'],
      },
      nasals: { key: 'n', values: ['m', 'n', 'kn', 'gn', 'ng'] },
      liquids: { key: 'l', values: ['l', 'le', 'r', 'er', 'ur'] },
      glides: { key: 'g', values: ['w', 'wh'] },
    }
    this.chargroups.remainingconsonants = {
      key: 'r',
      values: _.difference(
        this.chargroups.consonants.values,
        this.chargroups.affricates.values,
        this.chargroups.fricatives.values,
        this.chargroups.stops.values,
        this.chargroups.nasals.values,
        this.chargroups.liquids.values,
        this.chargroups.glides.values
      ),
    }
    this._unique_generate_cache = []
  }

  public generate(pattern) {
    let retString = ''
    let next_is_literal = false
    for (const po of pattern) {
      const pl = po.toLowerCase()

      let genChar
      if (next_is_literal) {
        genChar = po
        next_is_literal = false
      } else if (pl === 'p') {
        genChar = retString.slice(-1)
      } else if (po === 'u') {
        genChar = '' + _.random(0, 9)
      } else if (po === 'U') {
        genChar = '' + _.random(1, 9)
      } else if (po === '\\') {
        next_is_literal = true
        continue
      } else {
        for (let pkey in this.chargroups) {
          if (pl === this.chargroups[pkey].key) {
            genChar = this.chargroups[pkey].values[
              _.random(0, this.chargroups[pkey].values.length - 1)
            ]
          }
        }
      }

      if (genChar !== undefined) {
        if (pl !== po) {
          // Uppercase
          genChar = genChar[0].toUpperCase() + genChar.slice(1)
        } else {
          // Lowercase
          // do nothing
        }
        retString = retString + genChar
      }
    }
    return retString
  }

  public UGenerate(pattern) {
    let generated
    let icount = 0
    while (generated === undefined) {
      if (icount >= 1024) {
        throw new Error(
          "Either you're really unlucky, or this pattern can't generate any more stars!"
        )
      }
      generated = this.generate(pattern)
      if (_.includes(this._unique_generate_cache, generated)) {
        generated = undefined
      } else {
        this._unique_generate_cache.push(generated)
      }
      icount = icount + 1
    }
    return generated
  }

  public clearNameCache() {
    this._unique_generate_cache = []
  }
}
