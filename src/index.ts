
import { ManualGuesser} from './manual-guesser'
import { AutoGuesser  } from './auto-guesser'
import { BruteGuesser } from './brute-guesser'
import { Guesser      } from './guesser'
import { Asker        } from './cb-util'
import * as _ from 'lodash'

class SingleRunner {

  private secret: number

  constructor(secret: number, private guesser: Guesser) {
    
    this.secret = secret || this.guesser.probableGuess()
    const msg = this.guesser.validateGuess(this.secret)
    if (msg) throw new Error(msg)
  }
  
  async run() {

    if (!(this.guesser instanceof ManualGuesser)) {
      console.log(`0 > The secret number is ${this.secret}`)
    }

    while (true) {

      const guess  = await this.guesser.guessNextNumber(),
            {cows, bulls} = this.guesser.matcher(this.secret, guess),
            attemptNo     = this.guesser.markResult(guess, cows, bulls)      

      if (bulls === this.guesser.GUESS_LENGTH) {
        console.log(`${attemptNo} > ${guess} =========== You guessed it in ${attemptNo} attempts`)
        return
      } else {
        console.log(`${attemptNo} > ${guess} =========== ${
                      (cows ? cows + 'C' : '') + 
                      (bulls ? bulls + 'B' : '') +
                      (cows + bulls ? '' : 'None')}`)
      }

      if (!(this.guesser instanceof ManualGuesser)) {
        // await this.cheat()
      }
    }
  }

  async cheat() {

    const asker     = new Asker()

    while (true) {
      const cheatText = await asker.ask("cheat")
      asker.close()
      return
    }

  }
}

class LoopRunner {

  guesser: Guesser
  constructor(private loopCount: number, private guesserName: string) {
  }

  async run() {

    const loopCount = this.loopCount
    let totalAttempts = 0
    for (let index = 0; index < loopCount; index++) {
      this.guesser = getGuesser(this.guesserName)
      totalAttempts += await this.runSingle(this.guesser.probableGuess(), index + 1)
    }
    console.table({loopCount, totalAttempts, average: _.round(totalAttempts/loopCount, 2)})
  }
  
  async runSingle(secret: number, index: number) {

    while (true) {

      const guess  = await this.guesser.guessNextNumber(),
            {cows, bulls} = this.guesser.matcher(secret, guess),
            attemptNo     = this.guesser.markResult(guess, cows, bulls)      

      if (bulls === this.guesser.GUESS_LENGTH) {
        // console.log(`${index} > ${guess} =========== You guessed it in ${attemptNo} attempts`)
        return attemptNo
      }
    }
  }
}


function getGuesser(guesserName: string): Guesser {
  switch (guesserName) {
    case 'auto':  return new AutoGuesser()
    case 'brute': 
    case 'loop':  return new BruteGuesser()
    case 'assist':  return new ManualGuesser(true)
    default:      return new ManualGuesser()
  }
}

const argv = process.argv,
      text = argv[2],
      num  = argv[3] ? Number(argv[3]) : 0

let runner      
if (text === 'loop') {
  runner  = new LoopRunner(num || 1000, 'brute')
} else {
  runner  = new SingleRunner(num, getGuesser(argv[2]))
}     

runner.run()      


