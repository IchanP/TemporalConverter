import { TimeFrame } from './TimeFrame.js'
import { japaneseEras } from './Data/japaneseeras.js'
import { JapanaseEraVerifier } from './Verifiers/JapaneseEraVerifier.js'
/**
 * A wrapper for converting to Japanese Era from various calendars.
 */
export class JapaneseEra {
  #listOfEras
  #verifier
  /**
   * Initializes the era list.
   */
  constructor () {
    this.#listOfEras = japaneseEras
    this.#verifier = new JapanaseEraVerifier()
  }

  /**
   * Returns the current era that we are currently in.
   *
   * @returns {TimeFrame} - Returns the last era in the list.
   */
  getCurrentEra () {
    return this.#listOfEras.slice(-1)[0]
  }

  /**
   * Converts from Gregoran to Japanese Era Year, based on year and month.
   *
   * @param {number} gregorianYear - The Gregorian year.
   * @param {month} month - The month.
   * @returns {string} - Returns the matching Japanese Era year or an empty string if no match was found.
   */
  gregorianWithMonthToJpEra (gregorianYear, month) {
    const matchingEra = this.#findEraByMonthAndYear(gregorianYear, month)
    return this.#formatFromGregorian(matchingEra, gregorianYear)
  }

  /**
   * Converts from Gregorian to Japanese Era year, excluding month.
   *
   * @param {number} gregorianYear - The Gregorian year.
   * @returns {Array<string>} - Returns the matching Japanese years, as an array of strings, formatted as "Name YY".
   */
  gregorianWithoutMonthToJpEra (gregorianYear) {
    const foundEras = this.#findErasByYear(gregorianYear)
    if (!foundEras.length) {
      this.#eraDoesNotExist()
    }
    return foundEras.map((era) => this.#formatFromGregorian(era, gregorianYear))
  }

  /**
   * Converts from Japanese Era to Gregorian Calendar.
   *
   * @param {string} eraName - The name of the Era.
   * @param {number} eraYear - The year in the era.
   * @returns {string} - Returns the converted year in "YYYY CE" format.
   */
  FromJpEraToGregorian (eraName, eraYear) {
    this.#verifier.verifyString(eraName)
    const eraToConvertToGregorian = this.#findEraByName(eraName)
    this.#verifier.verifyEraNameExists(eraToConvertToGregorian)
    this.#verifier.verifyEraTimeFrame(eraToConvertToGregorian, eraYear)
    return this.#formatToGregorian(eraToConvertToGregorian, eraYear)
  }

  /**
   * Attemps to find an era by name.
   *
   * @param {string} eraName - The name to identify the Era with.
   * @returns {TimeFrame} - Returns the era, if possible, else returns null.
   */
  #findEraByName (eraName) {
    for (const era of this.#listOfEras) {
      if (era.name === eraName) {
        return era
      }
    }
    return null
  }

  // eslint-disable-next-line jsdoc/require-returns-check
  /**
   * Finds the matching Japanese Era by the passed month and year value.
   *
   * @param {number} gregorianYear - The year by which to find the matching era.
   * @param {number} month - The month of the Gregorian Year to match the era to.
   * @throws {Error} - If the passed month and year does not match any existing eras, throws an error..
   * @returns {TimeFrame} - Returns the matching era.
   */
  #findEraByMonthAndYear (gregorianYear, month) {
    for (const era of this.#listOfEras) {
      if (this.#isCurrentEra(gregorianYear, era)) {
        return this.getCurrentEra()
      }
      if (this.#isMonthOutOfRangeInSameYear(era, month, gregorianYear)) {
        this.#eraDoesNotExist()
      }
      if (this.#isOldEraOnSameYear(era, gregorianYear, month)) {
        return era
      }
      if (this.#isNewEraOnSameYear(era, gregorianYear, month)) {
        return era
      }
      if (this.#isWithinEraRangeLessThanEndYear(era, gregorianYear)) {
        return era
      }
    }
    this.#eraDoesNotExist()
  }

  /**
   * Finds the matching Japanese Era(s) by the passed year value.
   *
   * @param {number} gregorianYear - The year to find the eras by.
   * @returns {Array<TimeFrame>} - Returns the matching eras in an array, with the first occuring Era as the first element.
   */
  #findErasByYear (gregorianYear) {
    // TODO might break this into two functions again, with the inner function being a different function.
    return this.#listOfEras.filter((era) => {
      if (this.#isWithinEraRange(era, gregorianYear)) {
        return era
      }
      if (this.#isCurrentEra(gregorianYear, era)) {
        return era
      }
      return undefined
    })
  }

  /**
   * Formats a TimeFrame object to a Gregorian Year from Japanese Era.
   *
   * @param {TimeFrame} timeEra - The TimeFrame object to convert to a Gregorian date string.
   * @param {number} eraYear - The Japanese Era year to convert from.
   * @returns {string} - Returns the converted year in "YYYY CE" format.
   */
  #formatToGregorian (timeEra, eraYear) {
    return timeEra.startYear + (eraYear - 1) + ' CE'
  }

  /**
   * Formats a TimeFrame object to Japanasee Date from Gregorian year.
   *
   * @param {TimeFrame} timeEra - A TimeFrame object to convert to string.
   * @param {number} gregorianYear - The Gregorian Year to convert from.
   * @returns {string} - Date in "Name YY" format.
   */
  #formatFromGregorian (timeEra, gregorianYear) {
    return timeEra.name + ' ' + ((gregorianYear - timeEra.startYear) + 1)
  }

  /**
   * Checks whether the passed arguments matches the current era.
   *
   * @param {number} gregorianYear - The Gregorian Year to check is within the current era.
   * @param {TimeFrame} era - The era to check against.
   * @returns {boolean} - Returns true if the passed arguments matches the current era, false otherwise.
   */
  #isCurrentEra (gregorianYear, era) {
    return (gregorianYear > era.endYear && era.endYear === new Date().getFullYear())
  }

  /**
   * Checks whether the month is out of range in a scenario where the era starts and ends in the same year.
   *
   * @param {TimeFrame} era - The era to check against.
   * @param {number} month - The month to check inside the year.
   * @param {number} gregorianYear - The year to match the era against.
   * @returns {boolean} - Returns true if the month is out of range, otherwise false.
   */
  #isMonthOutOfRangeInSameYear (era, month, gregorianYear) {
    return (this.#isSameYear(era.startYear, gregorianYear) && this.#isSameYear(era.startYear, era.endYear)) && this.#isMonthOutOfRange(era, month)
  }

  /**
   * Checks whether the passed arguments equal eachother.
   *
   * @param {number} firstYear - The first year to compare.
   * @param {number} secondYear  - The second year to compare.
   * @returns {boolean} - Returns true if they match, otherwise false.
   */
  #isSameYear (firstYear, secondYear) {
    return firstYear === secondYear
  }

  /**
   * Checks whether the passed month is out of range.
   *
   * @param {TimeFrame} era - The time frame to check the month against.
   * @param {number} month - The month to check against.
   * @returns {boolean} - Returns true if the month is out of range, otherwise false.
   */
  #isMonthOutOfRange (era, month) {
    return (era.startMonth > month || era.endMonth < month)
  }

  /**
   * Checks whether the era ends in the same year as the passed Gregorian Year and the month is lower than the end month.
   *
   * @param {TimeFrame} era - The era to check against.
   * @param {number} gregorianYear - The Gregorian Year to match with.
   * @param {number} month - The month in the Gregorian Year.
   * @returns {boolean} - Returns true if the era ends in the same year as the passed Gregorian Year and the month is lower than the end month, otherwise false.
   */
  #isOldEraOnSameYear (era, gregorianYear, month) {
    return (era.endYear === gregorianYear && era.endMonth > month)
  }

  /**
   * Checks whether the era ends in the same year as the pasased Gregorian Year and the month is larger than the start month.
   *
   * @param {TimeFrame} era - The era to check against.
   * @param {number} gregorianYear - The Gregorian Year to match with.
   * @param {number} month - The month in the Gregorian Year.
   * @returns {boolean} - Returns true if the era ends in the same year as the passed Gregorian Year and the month is larger than the start month, otherwise false.
   */
  #isNewEraOnSameYear (era, gregorianYear, month) {
    return (era.startYear === gregorianYear && era.startMonth <= month)
  }

  /**
   * Checks whether the Gregorian Year is within an era year range.
   *
   * @param {TimeFrame} era - The era to check against.
   * @param {number} gregorianYear - The Gregorian Year to match with, may be equal to start year of an era, but not end year.
   * @returns {boolean} - Returns true if the Gregorian Year is within range, otherwise false.
   */
  #isWithinEraRangeLessThanEndYear (era, gregorianYear) {
    // TODO maybe rename this?
    return (era.startYear <= gregorianYear && gregorianYear < era.endYear)
  }

  /**
   * Checks whether the Gregorian Year is within an era year range.
   *
   * @param {TimeFrame} era - The era to compare Gregorian Year against.
   * @param {number} gregorianYear - The Gregorian Year to match to an Era, may be equal to start & end year of an era.
   * @returns {boolean} - Returns true if the Gregorian Year is within range, otherwise false.
   */
  #isWithinEraRange (era, gregorianYear) {
    return (era.startYear <= gregorianYear && gregorianYear <= era.endYear)
  }

  /**
   * Throws an error saying that the era does not exist.
   *
   * @throws {Error} - Notifies the user that the passed month and year does not match any Japanese Eras.
   */
  #eraDoesNotExist () {
    throw new Error('The passed arguments do not match any existing eras.')
  }
}
