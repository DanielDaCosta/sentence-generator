const NLG = require('./NLG')

const settings = {
    sensitiveness: 25,
    threshold: 20,
    dataType: 'peopleCount'
}

const title = "number of people"
const oldData = 5
const newData = 5
const NL = new NLG(title, oldData, newData, settings)

// Based on the sentences.json file, two new varibles were added:
// {actualDim} and {lastDim}. So now, we have two add the values 
// of these two variables
NL.addVariable({
    actualDim: 'today',
    lastDim: 'in comparison to yestarday'
})

const sentence = NL.generateSentence()
console.log(sentence)