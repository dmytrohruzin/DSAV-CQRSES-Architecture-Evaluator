import DSAVCQRSES from './DSAV-CQRSES-v1.js'
import { avgParams, classicalCQRS, maxParams, mCQRS, minParams } from './data.js'

const dsav = new DSAVCQRSES(maxParams, classicalCQRS, mCQRS)

const evaluationResult01 = dsav.calculateApplicability(0.1, 0.9)
const evaluationResult02 = dsav.calculateApplicability(0.2, 0.8)
const evaluationResult05 = dsav.calculateApplicability(0.5, 0.5)
console.table({ evaluationResult01, evaluationResult02, evaluationResult05 })

const complexityEvaluation = dsav.calculateApplicability(0, 1)
console.log(
  'Save',
  ((complexityEvaluation.mCQRSResult / complexityEvaluation.classicalCQRSResult) * 100 - 100).toFixed(2),
  '%'
)
