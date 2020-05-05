class NaturalLanguageGenerator {
  /**
   * Create an instance of NaturalLanguageGenerator
   * @param {string} title
   * @param {any} oldData - old value of data
   * @param {any} newData - new value of data
   * @param {object} settings - object containing settings informations:
   *                             - sensitiveness: sensitiveness of data,
   *                             - threshold: minimum value to change level of data
   *                             - precision: desired decimal places
   *                             - dataType: group of the inserted data
   */
  constructor (title, oldData, newData, settings = {}) {
    this.title = title
    this.oldData = oldData
    this.newData = newData
    this.settings = settings
    this.config = {}
    this.sentences = require('./resources/sentences.json')
    this.variables = {
      title: this.title,
      oldData: this.oldData,
      newData: this.newData
    }
    this.THRESHOLD = 10 // threshold for absolute comparison for this.config.level
  }

  /**
   * Method for measuring growth between oldData and newData
   * @name setGrowth
   * @returns {number} - Growth from oldData to newData
   */
  setGrowth () {
    const epsilon = 1e-4 // handling division by zero
    const precision = Math.pow(10, this.settings.precision)
    this.config.growth = Math.round((parseFloat(this.newData) -
                                    parseFloat(this.oldData)) /
                                    (parseFloat(this.oldData) + epsilon) *
                                    100 * precision) / precision
    // Growth smaller than 200%, are shown at the sentences. Growth bigger than 200% are shown as 200%
    this.addVariable({ growth: String(Math.min(Math.abs(this.config.growth), 200)) + '%' })
    return this.config.growth
  }

  /**
   * Set missing settings attribute items to its default values
   * @name setDataSettings
   * @private
   */
  setDataSettings () {
    if (!this.settings.threshold) {
      this.settings.threshold = 0.1
    }
    if (!this.settings.sensitiveness) {
      this.settings.sensitiveness = 0.2
    }
    if (!this.settings.precision) {
      this.settings.precision = 0
    }
    if (!this.settings.dataType) {
      this.settings.dataType = 'default'
    }
  }

  /**
   * Measures the level between the difference of newData and oldData
   * @name setIntensity
   * @private
   */
  setIntensity () {
    if (this.settings.dataType === 'default') {
      this.config.level = 'na'
    } else {
      if ((Math.abs(this.config.growth) <= this.settings.threshold) ||
          ((this.oldData < this.THRESHOLD) && (this.newData < this.THRESHOLD))) {
        this.config.level = 0
      } else {
        const level = Math.round(this.config.growth / this.settings.sensitiveness)
        if (level > 3) {
          this.config.level = 3
        } else {
          if (level < -3) {
            this.config.level = -3
          } else {
            this.config.level = level
          }
        }
      }
    }
  }

  /**
   * Current state of the data growth: Positive, Negative or Neutral
   * @name setPolarity
   * @private
   */
  setPolarity () {
    this.setIntensity()
    if (this.config.level === 'na') {
      this.config.polarity = 'na'
    } else {
      if (this.config.level > 0) {
        this.config.polarity = 'positive'
      } else {
        if (this.config.level < 0) {
          this.config.polarity = 'negative'
        } else {
          this.config.polarity = 'neutral'
        }
      }
    }
  }

  /** Get object containing all the variables that will be used
   * to build the sentences
   * @name getVariables
   * @returns {object} object containing name and value of each variable
   * @public
   */
  getVariables () {
    return this.variables
  }

  /** Add new variable
   * @name addData
   * @param {object} variable - object containing name and value of each of
   *                            the new variable
   *                            Ex: { name: value, name2: value2, ...}
   * @public
   */
  addVariable (variableObj) {
    for (var nameVariable in variableObj) {
      this.variables[nameVariable] = variableObj[nameVariable]
    }
  }

  /** Replace variables name, in sentence, with correponsponding values
   * @name replaceVariable
   * @param {string} sentence - sentence string
   * @private
   */
  replaceVariable (sentence) {
    const variablesObject = this.getVariables()
    for (var variable in variablesObject) {
      sentence = sentence.replace('{' + variable + '}', variablesObject[variable])
    }
    return this.capitalizeSentence(sentence)
  }

  /**
   * Add sentence to the correponding dataType, Polarity and Level array.
   * Varibles must be added between braces: { + variable + }
   * @param {string} dataType - group where the sentence will be inserted
   * @param {string} polarity - state of the sentence
   * @param {number} level - intensity of the sentence
   * @param {string} sentence
   */
  addSentence (dataType, polarity, level, sentence) {
    this.sentences[dataType][polarity][level].push(sentence)
  }

  /**
   *  Capitalize the sentence
   * @name capitalizeSentence
   * @param {string} sentence - sentence to be capitalized
   * @returns {string} - sentence capitalized
   * @private
   * */
  capitalizeSentence (sentence) {
    const stringArray = sentence.split('.')
    let newSentence = ''
    stringArray.forEach(element => {
      newSentence += element.charAt(0).toUpperCase() + element.slice(1) + '.'
    })
    return newSentence
  }

  /**
   * Generate sentence base on predefined values.
   * If there is more than one sentence avaible for the level,
   * one sentence is chosen randomly.
   * @name generateSentence
   * @returns {string} - sentence
   * @public
   */
  generateSentence () {
    this.setDataSettings()
    this.setGrowth()
    this.setPolarity()

    const numberOfSentences = this.sentences[this.settings.dataType][this.config.polarity][this.config.level].length
    const rand = Math.floor(Math.random() * numberOfSentences)
    return this.replaceVariable(this.sentences[this.settings.dataType][this.config.polarity][this.config.level][rand])
  }

  /**
   * Get Intensity after generating the sentence
   * @name getIntensity
   * @returns {any} - level of intensity
   * @public
   */
  getIntensity () {
    return this.config.level
  }
}

module.exports = NaturalLanguageGenerator
