
import { Guesser } from './guesser'
import { Asker } from './cb-util'

export class ManualGuesser extends Guesser {

  constructor(private assist: boolean = false) {
    super()
  }

  async guessNextNumber() {

    const asker = new Asker()

    while (true) {

      const str   = await asker.ask(this.guesses.length + 1),
           guess = Number(str)

      if (!str.trim()) continue

      let msg

      if (msg = this.validateGuess(guess))  {
        console.log(msg)
        continue
      }

      if ( this.assist && (msg = this.validateCompliance(guess)) ) {
        console.log(msg)
        continue
      }
      
      asker.close()
      return guess
    }
 }

}