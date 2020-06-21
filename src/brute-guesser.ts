
import * as _ from 'lodash'
import { Guesser } from './guesser'

export class BruteGuesser extends Guesser {

  async guessNextNumber() {

    let guess = 0

    if (this.guesses.length <= 1) {
      while (guess = this.probableGuess()) {
        if (this.validateGuess(guess)) continue
        if (this.validateCompliance(guess)) continue
        break
      }
    } else {
      for (guess = 1023; guess < 9876; guess++) {
        if (this.validateGuess(guess)) continue
        if (this.validateCompliance(guess)) continue
        break
      }
    }
    return guess
  }


}
