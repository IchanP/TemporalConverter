import { Verifier } from './Verifiers/Verifier.js'

/**
 * Builds a timeframe with year and month.
 */
export class TimeFrame {
  /**
   * Initialises the fields.
   *
   * @param {string} name - Name of the timeframe.
   * @param {number} startYear - The year the timeframe starts.
   * @param {number} endYear - The year the timeframe ends.
   * @param {number} startMonth - The month the timeframe starts.
   * @param {number} endMonth - The month the timeframe ends.
   */
  constructor (name, startYear, endYear, startMonth, endMonth) {
    const verifier = new Verifier()

    verifier.verifyString(name)
    verifier.verifyNumber(startYear)
    verifier.verifyNumber(endYear)
    verifier.verifyNumber(startMonth)
    verifier.verifyNumber(endMonth)
    verifier.verifyMonth(startMonth)
    verifier.verifyMonth(endMonth)

    this.name = name
    this.startYear = startYear
    this.endYear = endYear
    this.startMonth = startMonth
    this.endMonth = endMonth
  }
}
