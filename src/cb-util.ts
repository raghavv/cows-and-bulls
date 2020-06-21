import * as readline from 'readline'

export class Asker {

  private rl: readline.Interface

  constructor() {
    this.rl = readline.createInterface({input: process.stdin, output: process.stdout})
  }
  
  ask(question: any): Promise<String> {
    return new Promise((resolve, reject) => {
        this.rl.question(`${question} > `, (input) => resolve(input as String) );
    })
  }

  close() {
    this.rl.close()
  }


}