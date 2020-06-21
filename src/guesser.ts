import * as _ from 'lodash'

interface AttemptResult {
  guess : number
  cows  : number
  bulls : number
}


export abstract class Guesser {
  
  abstract async guessNextNumber(): Promise<number>

  readonly TOTAL_PROBABILITY  = 1000
  readonly GUESS_LENGTH       = 4       // game of guessing 4 digits
  readonly TOTAL_DIGITS       = 10      // Count of digits
  private  LOGGING            = false

  static    initialProbArray: number[][]
  protected guesses: AttemptResult[] = []

  getInitialProbArray() {

    if (!Guesser.initialProbArray) {

      const arProb    = [],
            firstProb = Math.floor(this.TOTAL_PROBABILITY/(this.TOTAL_DIGITS - 1)),
            otherProb = Math.floor(this.TOTAL_PROBABILITY/this.TOTAL_DIGITS)

      for (let index = 0; index < this.GUESS_LENGTH; index++) {
        arProb[index] = Array(this.TOTAL_DIGITS).fill(index ? otherProb : firstProb)
      }
      arProb[0][0] = 0 // zeros cannot be at first place
      Guesser.initialProbArray = arProb
    }
    return Guesser.initialProbArray
  }

  probableGuess(probArrayIn: number[][] | undefined = undefined, logging: boolean = false): number {
    if (logging) this.LOGGING = true
    const result = this.probableGuessInternal(probArrayIn || this.getInitialProbArray(), 0)
    if (logging) this.LOGGING = false
    return result
  }

  probableGuessInternal(probArrayIn: number[][], attemptCount: number): number {

    const probArray    = _.cloneDeep(probArrayIn),
          arSlotCount  = probArray.map((arNum, index) => this.getSlotCount(arNum)),
          costDigits :number[] = Array(this.TOTAL_DIGITS).fill(0),
          costRows   :number[] = Array(this.GUESS_LENGTH).fill(0)

    // Calculate cost of contention on each digit
    let maxDigitCost = 0      
    for (let di = 0; di < this.TOTAL_DIGITS; di++) {
      for (let ri = 0; ri < this.GUESS_LENGTH; ri++) {
        if (probArray[ri][di]) costDigits[di] += (1 / arSlotCount[ri])
      }
      costDigits[di] = _.round(costDigits[di], 2)
      if (costDigits[di] > maxDigitCost) maxDigitCost = costDigits[di]
    }
    if (this.LOGGING) {
      console.table(costDigits)
      console.log(`maxDigitCost: ${maxDigitCost}`)
    }

    // Based on cost of contention on each digit, calculate row cost
    let maxRowCost = 0
    for (let ri = 0; ri < this.GUESS_LENGTH; ri++) {
      for (let di = 0; di < this.TOTAL_DIGITS; di++) {
        if (probArray[ri][di]) costRows[ri] += costDigits[di]
      }
      costRows[ri] = _.round(costRows[ri] / arSlotCount[ri], 2)
      if (costRows[ri] > maxRowCost) maxRowCost = costRows[ri]
    }
    if (this.LOGGING) {
      console.table(costRows)
      console.log(`maxRowCost: ${maxRowCost}`)
    }

    const sortedCostRows = this.sortPreserveIndex(costRows, true)
    if (this.LOGGING) {
      console.table(sortedCostRows)
    }

    let answer         = 0

    for (let index = 0; index < this.GUESS_LENGTH; index++) {

      const ri    = sortedCostRows[index].index,
            digit = this.weightedGuess(probArray[ri])

      for (let i = 0; i < this.GUESS_LENGTH; i++) {
        probArray[i][digit] = 0
      }
      if (this.LOGGING) {
        console.table(probArray)
        console.log(`digit: ${digit}`)
      }
  
      answer += digit * Math.pow(10, this.GUESS_LENGTH - 1 - ri) 
    }

    return answer
  }

  getSlotCount(ar: number[]) {
    return ar.reduce((count, value) => count + (value ? 1 : 0), 0)
  }

  // ascending sort on number array with original indexes preserved
  sortPreserveIndex(ar: number[], descending: boolean) {

    const objAr       = ar.map((value, index) => { return {value, index} }),
          multiplier  = descending ? -1 : 1

    objAr.sort((a,b) => {
      return (a.value > b.value) ? 1 * multiplier 
                                 : (a.value < b.value ? -1 * multiplier : 0)
    })
    return objAr
  }

  weightedGuess(inpArray: number[]): number {

    const total = inpArray.reduce(function(sum, value) {
                    if (value < 0) throw new Error('weightedGuess: Negative values in input')
                    return sum + value
                  }, 0),
          rand  = Math.floor(Math.random() * total) // max: 1 less than sum

    if (!total) throw new Error('weightedGuess: Total weight of array is zero')

    let sum = 0, index = 0
    while (true) {
      const value = inpArray[index]
      sum += value
      if (sum > rand) break
      index++
    }
    return index
  }

  matcher(secret: number, guess: number) {

    const strSecret = String(secret),
          strGuess  = String(guess),
          output    = {cows: 0, bulls: 0}

    for (let index = 0; index < strGuess.length; index++) {
      const guessedLetter = strGuess.charAt(index),
            secretIndex   = strSecret.indexOf(guessedLetter)
      
      if (secretIndex === index) {
        output.bulls++      
      } else if (secretIndex !== -1) {
        output.cows++      
      }
    }

    return output
  }

  validateGuess(guess: number): string {

    const strGuess = String(guess)

    if (isNaN(guess) || (guess !== Math.round(guess)) || (guess < 0)) {
      return 'Error: invalid number'

    } else if (strGuess.length !== this.GUESS_LENGTH) {
      return `Error: invalid number, must have ${this.GUESS_LENGTH} digits`

    } else {

      for (let index = 0; index < this.GUESS_LENGTH; index++) {
        const char = strGuess.charAt(index)
        if (strGuess.lastIndexOf(char) !== index) return `Error: no repeats, please! => digit '${char}' repeated...`
      }

      for (let index = 0; index < this.guesses.length; index++) {
        const result = this.guesses[index]
        if (result.guess === guess) return `Duplicate of attempt #${index + 1}. Ignoring...`
      }
    }

    return ''
  }

  markResult(guess: number, cows: number, bulls: number) {
    this.guesses.push({guess, cows, bulls})
    return this.guesses.length
  }

  validateCompliance(newGuess: number): string {

    for (let index = 0; index < this.guesses.length; index++) {
      const oldGuess = this.guesses[index]
      const newResult = this.matcher(newGuess, oldGuess.guess)
      if (newResult.cows == oldGuess.cows && newResult.bulls == oldGuess.bulls) continue
      return `Your guess is not compliant with earlier guess of ${oldGuess.guess}`
    }
    return ''

  }

}

