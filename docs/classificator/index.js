import Classificator from './classificator.js'
import * as consistencyImplementationComplexity from './data/consistency-implementation-complexity.js'
import * as consistencyModificationComplexity from './data/consistency-modification-complexity copy.js'
import * as createImplementationComplexity from './data/create-implementation-complexity.js'
import * as createModificationComplexity from './data/create-modification-complexity.js'
import * as dataRemovingImplementationComplexity from './data/data-removing-implementation-complexity.js'
import * as eventVersionImplementationComplexity from './data/event-version-implementation-complexity.js'
import * as queryImplementationComplexity from './data/query-implementation-complexity.js'
import * as queryModificationComplexity from './data/query-modification-complexity.js'
import * as rebuildImplementationComplexity from './data/rebuild-implementation-complexity.js'
import * as rebuildModificationComplexity from './data/rebuild-modification-complexity.js'
import * as updateImplementationComplexity from './data/update-implementation-complexity.js'
import * as updateModificationComplexity from './data/update-modification-complexity.js'

const classificator = new Classificator(37, 30)

console.table({
  classicalCQRS: {
    consistency: {
      implementation: classificator.calculateComplexity(
        consistencyImplementationComplexity.classicalCQRSrealizationComplexity,
        consistencyImplementationComplexity.classicalCQRSdesignComplexity
      ),
      modification: classificator.calculateComplexity(
        consistencyModificationComplexity.classicalCQRSrealizationComplexity,
        consistencyModificationComplexity.classicalCQRSdesignComplexity
      )
    },
    create: {
      implementation: classificator.calculateComplexity(
        createImplementationComplexity.classicalCQRSrealizationComplexity,
        createImplementationComplexity.classicalCQRSdesignComplexity
      ),
      modification: classificator.calculateComplexity(
        createModificationComplexity.classicalCQRSrealizationComplexity,
        createModificationComplexity.classicalCQRSdesignComplexity
      )
    },
    query: {
      implementation: classificator.calculateComplexity(
        queryImplementationComplexity.classicalCQRSrealizationComplexity,
        queryImplementationComplexity.classicalCQRSdesignComplexity
      ),
      modification: classificator.calculateComplexity(
        queryModificationComplexity.classicalCQRSrealizationComplexity,
        queryModificationComplexity.classicalCQRSdesignComplexity
      )
    },
    rebuild: {
      implementation: classificator.calculateComplexity(
        rebuildImplementationComplexity.classicalCQRSrealizationComplexity,
        rebuildImplementationComplexity.classicalCQRSdesignComplexity
      ),
      modification: classificator.calculateComplexity(
        rebuildModificationComplexity.classicalCQRSrealizationComplexity,
        rebuildModificationComplexity.classicalCQRSdesignComplexity
      )
    },
    update: {
      implementation: classificator.calculateComplexity(
        updateImplementationComplexity.classicalCQRSrealizationComplexity,
        updateImplementationComplexity.classicalCQRSdesignComplexity
      ),
      modification: classificator.calculateComplexity(
        updateModificationComplexity.classicalCQRSrealizationComplexity,
        updateModificationComplexity.classicalCQRSdesignComplexity
      )
    },
    changeEventTypes: {
      implementation: classificator.calculateComplexity(
        updateImplementationComplexity.classicalCQRSrealizationComplexity,
        updateImplementationComplexity.classicalCQRSdesignComplexity
      )
    },
    dataRemoving: {
      implementation: classificator.calculateComplexity(
        dataRemovingImplementationComplexity.classicalCQRSrealizationComplexity,
        dataRemovingImplementationComplexity.classicalCQRSdesignComplexity
      )
    }
  },
  mCQRS: {
    consistency: {
      implementation: classificator.calculateComplexity(
        consistencyImplementationComplexity.mCQRSrealizationComplexity,
        consistencyImplementationComplexity.mCQRSdesignComplexity
      ),
      modification: classificator.calculateComplexity(
        consistencyModificationComplexity.mCQRSrealizationComplexity,
        consistencyModificationComplexity.mCQRSdesignComplexity
      )
    },
    create: {
      implementation: classificator.calculateComplexity(
        createImplementationComplexity.mCQRSrealizationComplexity,
        createImplementationComplexity.mCQRSdesignComplexity
      ),
      modification: classificator.calculateComplexity(
        createModificationComplexity.mCQRSrealizationComplexity,
        createModificationComplexity.mCQRSdesignComplexity
      )
    },
    query: {
      implementation: classificator.calculateComplexity(
        queryImplementationComplexity.mCQRSrealizationComplexity,
        queryImplementationComplexity.mCQRSdesignComplexity
      ),
      modification: classificator.calculateComplexity(
        queryModificationComplexity.mCQRSrealizationComplexity,
        queryModificationComplexity.mCQRSdesignComplexity
      )
    },
    rebuild: {
      implementation: classificator.calculateComplexity(
        rebuildImplementationComplexity.mCQRSrealizationComplexity,
        rebuildImplementationComplexity.mCQRSdesignComplexity
      ),
      modification: classificator.calculateComplexity(
        rebuildModificationComplexity.mCQRSrealizationComplexity,
        rebuildModificationComplexity.mCQRSdesignComplexity
      )
    },
    update: {
      implementation: classificator.calculateComplexity(
        updateImplementationComplexity.mCQRSrealizationComplexity,
        updateImplementationComplexity.mCQRSdesignComplexity
      ),
      modification: classificator.calculateComplexity(
        updateModificationComplexity.mCQRSrealizationComplexity,
        updateModificationComplexity.mCQRSdesignComplexity
      )
    },
    changeEventTypes: {
      implementation: classificator.calculateComplexity(
        eventVersionImplementationComplexity.mCQRSrealizationComplexity,
        eventVersionImplementationComplexity.mCQRSdesignComplexity
      )
    },
    dataRemoving: {
      implementation: classificator.calculateComplexity(
        dataRemovingImplementationComplexity.mCQRSrealizationComplexity,
        dataRemovingImplementationComplexity.mCQRSdesignComplexity
      )
    }
  }
})
