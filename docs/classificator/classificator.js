const classes = [
  { name: 'very simple', value: 4 },
  { name: 'simple', value: 6 },
  { name: 'average', value: 8 },
  { name: 'complex', value: 12 },
  { name: 'very complex', value: 16 }
]

const integrate = (func, a, b, n = 1000) => {
  const h = (b - a) / n
  let sum = 0.5 * (func(a) + func(b))

  for (let i = 1; i < n; i += 1) {
    sum += func(a + i * h)
  }

  return sum * h
}

export default class Classificator {
  constructor(designMaxValue, realizationMaxValue) {
    this.designMaxValue = designMaxValue
    this.realizationMaxValue = realizationMaxValue
  }

  getClassValue(value, xAxis) {
    const chunksCount = classes.length * 2 - 1
    const chunk = xAxis / chunksCount

    for (let i = 0; i < classes.length; i += 1) {
      if (2 * i * chunk <= value && value <= (2 * i + 1) * chunk) {
        return classes[i].value
      }
      if ((2 * i + 1) * chunk < value && value < (2 * i + 2) * chunk && i < classes.length - 1) {
        // return [
        //   { part: Math.round(((value - (2 * i + 1) * chunk) / chunk) * 100), class: classes[i + 1] },
        //   { part: Math.round((((2 * i + 2) * chunk - value) / chunk) * 100), class: classes[i] }
        // ]
        return (
          [
            {
              part: Math.round(
                Math.sqrt(integrate((x) => 1 - x / chunk, value - (2 * i + 1) * chunk, chunk) / (chunk / 2)) * 100
              ),
              class: classes[i]
            },
            {
              part: Math.round(
                Math.sqrt(integrate((x) => x / chunk, 0, value - (2 * i + 1) * chunk) / (chunk / 2)) * 100
              ),
              class: classes[i + 1]
            }
          ].reduce((res, c) => res + c.class.value * c.part, 0) / 100
        )
      }
    }
    throw new Error(`Value ${value} is higher than ${xAxis}`)
  }

  // for (let i = 1; i < 26; i += 1) {
  //   console.log(`${i}:`, getClassValue(i))
  // }

  calculateComplexity(designSource, realizationSource) {
    console.log('\n McCabe complexity')

    const realization = realizationSource.map((m) => ({
      ...m,
      complexity: this.getClassValue(m.complexity, this.realizationMaxValue)
    }))
    const realizationTotal = realization.reduce((res, m) => res + m.complexity, 0).toFixed(2)

    // console.log('By activities', realization)
    console.log('Total', realizationTotal)

    console.log('\n Cognitive functional complexity')

    const сognitive = designSource.map((m) => ({
      ...m,
      complexity: this.getClassValue(m.complexity, this.designMaxValue)
    }))
    const сognitiveTotal = сognitive.reduce((res, m) => res + m.complexity, 0).toFixed(2)

    // console.log('By activities', сognitive)
    console.log('Total', сognitiveTotal)

    const total = (0.5 * сognitiveTotal + 0.5 * realizationTotal).toFixed(2)
    console.log('\n Total complexity', total)

    return total
  }

  calculateMigrationComplexity(realizationSource, designSource) {
    const realization = realizationSource.map((m) => ({
      ...m,
      complexity: this.getClassValue(m.complexity, this.realizationMaxValue)
    }))
    console.log(realization)

    const design = designSource.map((m) => ({
      ...m,
      complexity: this.getClassValue(m.complexity, this.designMaxValue)
    }))
    console.log(design)
  }
}
