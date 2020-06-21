import {Guesser} from '../guesser'
import { AutoGuesser } from '../auto-guesser'

describe('Common Functions', () => {

  const guesser = new AutoGuesser()

  test('Unique digits in a number', () => {
    expect(guesser.validateGuess(NaN)).toMatch('invalid')
    expect(guesser.validateGuess(123)).toMatch('invalid')
    expect(guesser.validateGuess(12.3)).toMatch('invalid')
    expect(guesser.validateGuess(12345)).toMatch('invalid')
    expect(guesser.validateGuess("0123" as any)).toMatch('invalid')

    expect(guesser.validateGuess(1234)).toBe('')
    expect(guesser.validateGuess(4321)).toBe('')
    expect(guesser.validateGuess(1123)).toMatch('repeat')
    expect(guesser.validateGuess(1223)).toMatch('repeat')
    expect(guesser.validateGuess(1233)).toMatch('repeat')
    expect(guesser.validateGuess(1231)).toMatch('repeat')
  })

  test('Matcher for cows and bulls count', () => {
    expect(guesser.matcher(1234, 5678)).toEqual({cows: 0, bulls: 0})
    expect(guesser.matcher(1234, 1234)).toEqual({cows: 0, bulls: 4})
    expect(guesser.matcher(1234, 1243)).toEqual({cows: 2, bulls: 2})
    expect(guesser.matcher(1234, 6821)).toEqual({cows: 2, bulls: 0})
    expect(guesser.matcher(1234, 6831)).toEqual({cows: 1, bulls: 1})
  })

})

describe('Verifying guessing', () => {

  const guesser = new AutoGuesser()

  test('First Guess => in range', () => {
    
    expect(guesser.GUESS_LENGTH).toBe(4)

    const guess = guesser.probableGuess()
    expect(guess).toBeGreaterThanOrEqual(1023)
    expect(guess).toBeLessThanOrEqual(9876)
  })

  test('First Guess => has unique range', () => {
    
    const guess = guesser.probableGuess()
    const errStr = guesser.validateGuess(guess)
    expect(errStr).toBe('')
  })

  test('Constrained Guessing: single value', () => {

    const ar = Array.from({length: 4}, value => Array(10).fill(0))
    for (let index = 0; index < ar.length; index++) {
      ar[index][index + 1] = 10
    }
    
    expect(guesser.probableGuess(ar)).toBe(1234)
  })

  test('Constrained Guessing: multiple', () => {

    const ar = Array.from({length: 4}, value => Array(10).fill(0)),
          possibilities:number[] = []

    for (let index = 0; index < ar.length; index++) {

      const digits = [index * 2 + 1, index * 2 + 2]
      ar[index][digits[0]] = 10
      ar[index][digits[1]] = 10

      const len = possibilities.length

      if (len) {
        possibilities.length = len * 2
        possibilities.fill(0, len)
        possibilities.copyWithin(len, 0)
        possibilities.forEach((value, i) => {
          possibilities[i] = value * 10 + digits[i < len ? 0 : 1]
        })
      } else {
        possibilities.push(...digits)
      }
    }
    
    expect(possibilities).toContain(guesser.probableGuess(ar))
  })

  test('Constrained Guessing: overlapping 2 digits', () => {

    const ar = Array.from({length: 4}, value => Array(10).fill(0))
    let row = 0
    ar[row][3] = ar[row][4] = 10; row++;
    ar[row][2] = ar[row][3] = 10; row++;
    ar[row][1] = ar[row][2] = 10; row++;
    ar[row][1] = ar[row][2] = 10; row++;
    
    const possibilities = [4312, 4321]
    expect(possibilities).toContain(guesser.probableGuess(ar, true))
  })

  test('weightedGuess: exceptions', () => {

    const ar = Array.from({length: 4}, value => Array(10).fill(0))
    expect(() => guesser.probableGuess(ar)).toThrow(/zero/i)
    ar[0][1] = 1000
    ar[0][2] = -1
    expect(() => guesser.probableGuess(ar)).toThrow(/negative/i)
  })

})
