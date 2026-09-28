// ---------------------------------------------------------------------------
// Translation definitions for the DSAV-CQRSES Architecture Evaluator application.
// Every user-visible string must have a key here with both EN and UA values.
// ---------------------------------------------------------------------------

/**
 * The translations object shape. Each locale contains the same nested
 * structure so that lookups are type-safe.
 */
export interface Translations {
  common: {
    appTitle: string
    appDescription: string
    tabParametersAssessment: string
    tabVariationSelection: string
    tabMigrationRoadmap: string
    calculate: string
    exportJson: string
    add: string
    remove: string
    name: string
    value: string
    type: string
    from: string
    to: string
    effort: string
    level: string
    score: string
    total: string
    results: string
    actions: string
    source: string
    target: string
    none: string
    select: string
    selectSource: string
    selectTarget: string
    mainNavigation: string
    mustBeGreaterThanZero: string
    mustBeNonNegative: string
    nameCannotBeEmpty: string
    alreadyExists: string
    valueMustBeNumber: string
    footerBuiltOn: string
    footerPlatform: string
    footerWithin: string
    footerUniversity: string
  }

  home: {
    heading: string
    subtitle: string
    methodologyHeading: string
    cardParametersAssessmentTitle: string
    cardParametersAssessmentDescription: string
    cardVariationSelectionTitle: string
    cardVariationSelectionDescription: string
    cardMigrationRoadmapTitle: string
    cardMigrationRoadmapDescription: string
    fuzzyLogicBadge: string
    fuzzyLogicText: string
    mcdaBadge: string
    mcdaText: string
    graphPlanningBadge: string
    graphPlanningText: string
  }

  tab1: {
    // Page header
    heading: string
    description: string

    // Section headers
    complexityEvaluationTitle: string
    complexityEvaluationDescription: string
    performanceEvaluationTitle: string
    performanceEvaluationDescription: string

    // Classificator settings
    classificatorSettings: string
    designWeight: string
    realizationWeight: string
    weightsSumMustBeOne: string
    designMaxValue: string
    realizationMaxValue: string
    autoCalcMaxValues: string

    // Component & activity management
    componentLabel: string
    removeComponent: string
    activityColumn: string
    designComplexityColumn: string
    realizationComplexityColumn: string
    removeActivity: string
    addActivity: string
    addComponent: string
    componentNamePlaceholder: string
    newActivity: string

    // Classification summary
    classValueFuzzy: string
    componentTotal: string

    // Complexity results
    complexityResultsTitle: string
    complexityResultsPlaceholder: string
    componentColumn: string
    designColumn: string
    realizationColumn: string
    totalColumn: string
    complexityChartTitle: string
    complexityValueAxis: string
    membershipCoefficientAxis: string

    // Fuzzy class labels
    fuzzyVerySimple: string
    fuzzySimple: string
    fuzzyAverage: string
    fuzzyComplex: string
    fuzzyVeryComplex: string

    // Performance scale
    performanceScaleTitle: string
    thresholdMs: string
    addLevel: string
    removeLast: string

    // Performance results table
    performanceResultsTitle: string
    metricNameColumn: string
    responseTimeMsColumn: string
    calculationColumn: string
    performanceScoreColumn: string
    addPerformanceMetric: string
    metricNamePlaceholder: string
    responseTimePlaceholder: string
    removeMetric: string
    responseTimeAxis: string
    classScoreAxis: string

    // Performance chart
    performanceChartTitle: string
    addAtLeastTwoLevels: string
  }

  tab2: {
    heading: string
    description: string

    // Quality Attributes
    qualityAttributesTitle: string
    qualityAttributesDescription: string
    complexityAttributes: string
    addCustomAttribute: string
    componentTypeLabel: string
    oqacLabel: string
    psqacLabel: string
    oqacFull: string
    psqacFull: string
    weightCriterionColumn: string

    // Quality Attribute Components Weights
    weightsTitle: string
    weightsDescription: string
    calculationTemplate: string
    weightValue: string
    weightsAllValid: string
    weightsInvalidValue: string

    // Variation Metrics
    qualityAttributeComponent: string
    variationMetricsTitle: string
    variationMetricsDescription: string
    addVariation: string
    variationNamePlaceholder: string
    variationNameEmpty: string
    addVariationHint: string
    metricRequired: string
    metricMustBePositive: string
    allValuesPositive: string

    // SLA Parameters
    slaParametersTitle: string
    slaParametersDescription: string
    slaNameColumn: string
    slaUnitColumn: string
    slaDirectionColumn: string
    slaThresholdColumn: string
    slaDirectionLessBetter: string
    slaDirectionMoreBetter: string
    addSlaParameter: string
    slaNamePlaceholder: string
    slaNameRequired: string

    // Hardware Configurations
    hardwareConfigurationsTitle: string
    hardwareConfigurationsDescription: string
    hardwareNameColumn: string
    hardwarePriceColumn: string
    addHardwareConfig: string
    hardwareNamePlaceholder: string
    hardwareNameRequired: string
    hardwareNoVariations: string

    // Development price for the simplest variation
    swpTitle: string
    swpDescription: string
    swpUnit: string

    // Results — relative complexity
    resultsTitle: string
    relativeComplexityTitle: string
    relativeComplexityPlaceholder: string
    relativeComplexityIntegralColumn: string
    relativeComplexityRcColumn: string
    referenceVariationBadge: string

    // Results — relative hosting price
    relativeHostingTitle: string
    relativeHostingPlaceholder: string
    relativeHostingPriceColumn: string
    relativeHostingPcColumn: string

    // Results — optimal variation
    optimalResultTitle: string
    optimalResultPlaceholder: string
    columnVariation: string
    columnRc: string
    columnHardware: string
    columnHardwarePrice: string
    columnDevCost: string
    columnTotal: string
    optimalRowBadge: string
    slaNotMetBadge: string

    // Calculate button
    calculateOptimalVariation: string

    // Validation status (shared with ValidationStatus component on Tab 3)
    validationPassed: string
    validationErrors: string
    validationAllMetricKeysPresent: string
    validationAllValuesPositive: string
    validationPerformancePrioritiesSum: string
  }

  tab3: {
    // Page header
    heading: string
    description: string

    // Section 1: Variations (Graph Nodes)
    variationsGraphNodesTitle: string
    variationsGraphNodesDescription: string
    variationNamePlaceholder: string
    noVariationsDefined: string
    variationAlreadyExists: string

    // Section 2: Migration Edges
    migrationEdgesTitle: string
    migrationEdgesDescription: string
    noEdgesDefined: string
    effortWeight: string
    selectBothFromTo: string
    fromToMustBeDifferent: string
    effortMustBePositive: string
    edgeAlreadyExists: string
    edgeLabel: string

    // Validation summary
    noDuplicateEdges: string
    allEffortPositive: string
    fromNotEqualTo: string

    // Section 3: Pathfinding
    pathfindingResultsTitle: string
    addVariationsToBegin: string
    findOptimalPath: string
    sourceAndTargetMustBeDifferent: string
    selectSourceAndTarget: string

    // Results
    resultsTitle: string
    noPathExists: string
    noPathExistsFromTo: string
    optimalPath: string
    totalEffort: string
    steps: string
    alternativePaths: string
    noAlternativePaths: string

    // Graph visualization
    graphVisualizationTitle: string
    addVariationsToSeeGraph: string
    pathSummary: string
    zoomIn: string
    zoomOut: string
    zoomReset: string

    // Notification
    removedNodeAndEdges: string

    // Feasibility Assessment
    feasibilityTitle: string
    feasibilityToggleLabel: string
    feasibilityColNow: string
    feasibilityColUpgrade: string
    feasibilityColAfter: string
    feasibilitySupportCost: string
    feasibilityHostingCost: string
    feasibilityMonthlyTotal: string
    feasibilityMigrationCostLabel: string
    feasibilityPaybackResult: string
    feasibilityNoPayback: string
    feasibilityNoPaybackMoreExpensive: string

    // Per-node graph fields
    nodeNameColumn: string
    nodeSupportCostColumn: string
    nodeHostingCostColumn: string

    // Per-edge graph fields
    edgeMigrationTimeColumn: string
    edgeMigrationTimeHint: string

    // Feasibility warnings
    feasibilityMigrationDuration: string
    feasibilityInstantaneousFallback: string

    // Step-by-step breakdown
    feasibilityBreakdownTitle: string
    feasibilityBreakdownStepColumn: string
    feasibilityBreakdownDurationColumn: string
    feasibilityBreakdownCumMigrationColumn: string
    feasibilityBreakdownCumUpgradeColumn: string
    feasibilityBreakdownInitial: string
    feasibilityBreakdownEdge: string
    feasibilityBreakdownTarget: string
    feasibilityBreakdownPaybackBadge: string

    // Alternative-paths comparison
    feasibilityAlternativesTitle: string
    feasibilityAlternativesPathColumn: string
    feasibilityAlternativesDurationColumn: string
    feasibilityAlternativesCostColumn: string
    feasibilityAlternativesPaybackColumn: string
    feasibilityAlternativesPaybackInline: string

    // Path summary (all paths from source to target)
    feasibilityAllPathsTitle: string
    feasibilityAllPathsRecommendedBadge: string
  }

  validation: {
    missingMetric: string
    invalidValue: string
    invalidWeight: string
    invalidSwp: string
    nonFinite: string
    notPositive: string
    negativeValue: string
    exceedsMax: string
    missingVariations: string
  }
}

// ---------------------------------------------------------------------------
// English locale
// ---------------------------------------------------------------------------

const en: Translations = {
  common: {
    appTitle: 'DSAV-CQRSES',
    appDescription:
      'DSAV CQRS/ES Architecture Evaluator — a tool for selecting the optimal variation of a CQRS-with-Event-Sourcing architecture',
    tabParametersAssessment: 'Parameters Assessment',
    tabVariationSelection: 'Variation Selection',
    tabMigrationRoadmap: 'Migration Roadmap',
    calculate: 'Calculate',
    exportJson: 'Export JSON',
    add: 'Add',
    remove: 'Remove',
    name: 'Name',
    value: 'Value',
    type: 'Type',
    from: 'From',
    to: 'To',
    effort: 'Effort',
    level: 'Level',
    score: 'Score',
    total: 'Total',
    results: 'Results',
    actions: 'Actions',
    source: 'Source',
    target: 'Target',
    none: 'None',
    select: '-- Select --',
    selectSource: '-- Select source --',
    selectTarget: '-- Select target --',
    mainNavigation: 'Main navigation',
    mustBeGreaterThanZero: 'Must be greater than 0',
    mustBeNonNegative: 'Value must be ≥ 0',
    nameCannotBeEmpty: 'Name cannot be empty',
    alreadyExists: 'already exists',
    valueMustBeNumber: 'Value must be a number',
    footerBuiltOn: 'Built on',
    footerPlatform: 'DBBSoftware platform',
    footerWithin: 'as part of the PhD program at',
    footerUniversity: 'Oles Honchar Dnipro National University'
  },

  home: {
    heading: 'Information Technology for Determining the Optimal CQRS with ES Architectural Variation',
    subtitle:
      'DSAV-CQRSES helps software architects determine the optimal CQRS with ES variation for a given system and the optimal migration path between variations.',
    methodologyHeading: 'Underlying Methodology',
    cardParametersAssessmentTitle: 'Parameters Assessment',
    cardParametersAssessmentDescription:
      'Evaluate the complexity and performance characteristics of your system using fuzzy linguistic variables and expert-driven criteria.',
    cardVariationSelectionTitle: 'Variation Selection',
    cardVariationSelectionDescription:
      'Compare architectural variations of CQRS with Event Sourcing and select the optimal one based on multi-criteria decision analysis.',
    cardMigrationRoadmapTitle: 'Migration Roadmap',
    cardMigrationRoadmapDescription:
      'Generate an optimal step-by-step migration path between architectural variations using graph-based planning.',
    fuzzyLogicBadge: 'Fuzzy Logic',
    fuzzyLogicText:
      'Linguistic variables and membership functions translate qualitative expert assessments into precise numeric scores for each system parameter.',
    mcdaBadge: 'MCDA',
    mcdaText:
      'Multi-criteria decision analysis ranks architectural variations by aggregating weighted parameter scores, revealing the best fit for your context.',
    graphPlanningBadge: 'Graph Planning',
    graphPlanningText:
      'A directed graph of architectural variations and migration steps enables shortest-path algorithms to produce an optimal, incremental migration roadmap.'
  },

  tab1: {
    heading: 'Parameters Assessment',
    description:
      'Evaluate the complexity and performance characteristics of a single architectural variation using fuzzy logic classification and scoring scales.',

    complexityEvaluationTitle: 'Complexity Evaluation',
    complexityEvaluationDescription:
      'Evaluate complexity of a single architectural variation using fuzzy logic classification (trapezoid membership functions).',
    performanceEvaluationTitle: 'Performance Evaluation',
    performanceEvaluationDescription:
      'Evaluate performance using fuzzy logic on server response time. Based on measured read/write response times and a scoring scale.',

    classificatorSettings: 'Classificator settings:',
    designWeight: 'Design Weight',
    realizationWeight: 'Realization Weight',
    weightsSumMustBeOne: 'Weights sum must equal 1',
    designMaxValue: 'Design Max Value',
    realizationMaxValue: 'Realization Max Value',
    autoCalcMaxValues: 'Auto-detect from data',

    componentLabel: 'Component:',
    removeComponent: 'Remove component',
    activityColumn: 'Activity',
    designComplexityColumn: 'Design Complexity',
    realizationComplexityColumn: 'Realization Complexity',
    removeActivity: 'Remove activity',
    addActivity: '+ Add Activity',
    addComponent: '+ Add Component',
    componentNamePlaceholder: 'Component name',
    newActivity: 'New activity',

    classValueFuzzy: 'Class value (fuzzy)',
    componentTotal: 'Refined complexity:',

    complexityResultsTitle: 'Complexity Results',
    complexityResultsPlaceholder: 'No results to display. Add components and activities to see complexity results.',
    componentColumn: 'Component',
    designColumn: 'Design',
    realizationColumn: 'Realization',
    totalColumn: 'Refined',
    complexityChartTitle: 'Complexity Chart',
    complexityValueAxis: 'Complexity value',
    membershipCoefficientAxis: 'Membership coefficient',

    fuzzyVerySimple: 'Very Simple',
    fuzzySimple: 'Simple',
    fuzzyAverage: 'Average',
    fuzzyComplex: 'Complex',
    fuzzyVeryComplex: 'Very Complex',

    performanceScaleTitle: 'Performance Scale',
    thresholdMs: 'Threshold (ms)',
    addLevel: '+ Add Level',
    removeLast: 'Remove Last',

    performanceResultsTitle: 'Performance Results',
    metricNameColumn: 'Name',
    responseTimeMsColumn: 'Server Response Time (ms)',
    calculationColumn: 'Calculation',
    performanceScoreColumn: 'Score',
    addPerformanceMetric: '+ Add Performance Metric',
    metricNamePlaceholder: 'Metric name',
    responseTimePlaceholder: 'Response time (ms)',
    removeMetric: 'Remove metric',
    responseTimeAxis: 'Response time (ms)',
    classScoreAxis: 'Class score',

    performanceChartTitle: 'Performance Chart',
    addAtLeastTwoLevels: 'Add at least 2 scale levels to display the chart.'
  },

  tab2: {
    heading: 'Variation Selection',
    description:
      'Compare architectural variations of CQRS with Event Sourcing. Integral complexity (rc_i) combines with the cheapest SLA-satisfying hardware to determine the optimal variation per the formula as* = min { swp · rc_i + min c_ij }.',

    qualityAttributesTitle: 'Quality Attributes',
    qualityAttributesDescription:
      'Select which complexity quality attributes to include. These attributes determine the metric columns of the Variation Metrics table.',
    complexityAttributes: 'Complexity Attributes',
    addCustomAttribute: '+ Add Custom Attribute',
    componentTypeLabel: 'Component Type',
    oqacLabel: 'OQAC',
    psqacLabel: 'PSQAC',
    oqacFull: 'Operational Quality Attribute Component',
    psqacFull: 'Problem Space Quality Attribute Component',
    weightCriterionColumn: 'Weight Criterion',

    weightsTitle: 'Quality Attribute Components Weights',
    weightsDescription: 'Define weights for each quality attribute component used in the integral complexity score.',
    calculationTemplate: 'Calculation Template',
    weightValue: 'Value',
    weightsAllValid: 'All weight values are valid',
    weightsInvalidValue: 'Weight value must be > 0',

    qualityAttributeComponent: 'Quality Attribute Component',
    variationMetricsTitle: 'Variation Metrics',
    variationMetricsDescription:
      'Enter measured complexity metrics for each variation. Columns match the enabled quality attributes.',
    addVariation: '+ Add Variation',
    variationNamePlaceholder: 'Variation name',
    variationNameEmpty: 'Variation name cannot be empty.',
    addVariationHint: '(all metric rows will be added empty, fill values manually)',
    metricRequired: 'is required',
    metricMustBePositive: 'must be > 0',
    allValuesPositive: 'All values > 0',

    slaParametersTitle: 'SLA Parameters',
    slaParametersDescription:
      'Define the SLA constraints used to filter hardware configurations. Add, edit, or remove parameters as needed.',
    slaNameColumn: 'SLA name',
    slaUnitColumn: 'Unit',
    slaDirectionColumn: 'Direction',
    slaThresholdColumn: 'Threshold',
    slaDirectionLessBetter: 'Less is better',
    slaDirectionMoreBetter: 'More is better',
    addSlaParameter: '+ Add SLA Parameter',
    slaNamePlaceholder: 'e.g. p95 Queries',
    slaNameRequired: 'SLA name cannot be empty.',

    hardwareConfigurationsTitle: 'Hardware Configurations per Variation',
    hardwareConfigurationsDescription:
      'For each variation, list hardware configurations with their monthly price (USD) and measured values for every SLA parameter.',
    hardwareNameColumn: 'Hardware',
    hardwarePriceColumn: 'Price (USD/month)',
    addHardwareConfig: 'Add hardware',
    hardwareNamePlaceholder: 'e.g. m7i-gp3',
    hardwareNameRequired: 'Hardware name cannot be empty.',
    hardwareNoVariations: 'No variations defined — add at least one variation in the Variation Metrics section.',

    swpTitle: 'Development Price for the Simplest Variation',
    swpDescription:
      'Cost of developing the variation with relative complexity rc = 1. The final formula scales this by rc_i and adds the cheapest valid hardware price.',
    swpUnit: 'USD/month',

    resultsTitle: 'Results',
    relativeComplexityTitle: 'Relative Complexity',
    relativeComplexityPlaceholder: 'Run calculation to see relative complexity.',
    relativeComplexityIntegralColumn: 'r_i (integral)',
    relativeComplexityRcColumn: 'rc_i = r_i / r_min',
    referenceVariationBadge: 'reference',

    relativeHostingTitle: 'Relative Hosting Price',
    relativeHostingPlaceholder: 'Run calculation to see relative hosting prices.',
    relativeHostingPriceColumn: 'p_i (USD/month)',
    relativeHostingPcColumn: 'pc_i = p_i / p_min',

    optimalResultTitle: 'Optimal Variation',
    optimalResultPlaceholder: 'Run calculation to see the optimal variation.',
    columnVariation: 'Variation',
    columnRc: 'rc_i',
    columnHardware: 'Hardware',
    columnHardwarePrice: 'Hardware price',
    columnDevCost: 'swp · rc_i',
    columnTotal: 'Total',
    optimalRowBadge: 'optimal',
    slaNotMetBadge: 'SLA not met',

    calculateOptimalVariation: 'Calculate optimal variation',

    validationPassed: 'Validation Passed',
    validationErrors: 'Validation Errors',
    validationAllMetricKeysPresent: 'All metric keys present in all variations',
    validationAllValuesPositive: 'All values > 0',
    validationPerformancePrioritiesSum: 'All required inputs provided'
  },

  tab3: {
    heading: 'Migration Roadmap',
    description:
      'Generate an optimal step-by-step migration path between architectural variations. Graph-based planning uses shortest-path algorithms to produce an incremental roadmap tailored to your system.',

    variationsGraphNodesTitle: 'Variations (Graph Nodes)',
    variationsGraphNodesDescription: 'Define architectural variations that form the graph nodes.',
    variationNamePlaceholder: 'Variation name',
    noVariationsDefined: 'No variations defined yet.',
    variationAlreadyExists: 'A variation with this name already exists',

    migrationEdgesTitle: 'Migration Edges',
    migrationEdgesDescription: 'Define possible migration paths between variations and their effort.',
    noEdgesDefined: 'No edges defined yet. Add variations first.',
    effortWeight: 'Effort (weight)',
    selectBothFromTo: 'Select both From and To variations',
    fromToMustBeDifferent: 'From and To must be different',
    effortMustBePositive: 'Effort must be greater than 0',
    edgeAlreadyExists: 'This edge already exists',
    edgeLabel: 'Edge',

    noDuplicateEdges: 'No duplicate edges (same from→to)',
    allEffortPositive: 'All effort values > 0',
    fromNotEqualTo: 'From ≠ To for each edge',

    pathfindingResultsTitle: 'Pathfinding',
    addVariationsToBegin: 'Add variations to begin',
    findOptimalPath: 'Find Optimal Path',
    sourceAndTargetMustBeDifferent: 'Source and target must be different',
    selectSourceAndTarget: 'Select source and target, then click Find Optimal Path',

    resultsTitle: 'Results',
    noPathExists: 'No path exists',
    noPathExistsFromTo: 'No path exists from {source} to {target}',
    optimalPath: 'Optimal path',
    totalEffort: 'Total effort:',
    steps: 'Steps',
    alternativePaths: 'Alternative paths',
    noAlternativePaths: 'No alternative paths available',

    graphVisualizationTitle: 'Graph Visualization',
    addVariationsToSeeGraph: 'Add variations to see the migration graph.',
    pathSummary: 'Path Summary',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    zoomReset: 'Reset zoom',

    removedNodeAndEdges: 'Removed "{name}" and {count} connected edge(s)',

    feasibilityTitle: 'Migration Feasibility Assessment',
    feasibilityToggleLabel: 'Hardware upgrade can avoid migration',
    feasibilityColNow: '1. Now (current)',
    feasibilityColUpgrade: '2. Hardware upgrade',
    feasibilityColAfter: '3. After migration',
    feasibilitySupportCost: 'Support cost (USD/month)',
    feasibilityHostingCost: 'Hosting cost (USD/month)',
    feasibilityMonthlyTotal: 'Monthly total',
    feasibilityMigrationCostLabel: 'Migration cost (one-time, USD)',
    feasibilityPaybackResult: 'Migration pays off in ~{months} months',
    feasibilityNoPayback: 'Migration does not pay off',
    feasibilityNoPaybackMoreExpensive:
      'Migration does not pay off — after migration, monthly cost is {diff} USD higher than the hardware-upgrade scenario.',

    nodeNameColumn: 'Variation',
    nodeSupportCostColumn: 'Support cost (USD/mo)',
    nodeHostingCostColumn: 'Hosting cost (USD/mo)',

    edgeMigrationTimeColumn: 'Time (mo)',
    edgeMigrationTimeHint: 'Set on one edge — others scale by effort',

    feasibilityMigrationDuration: 'Migration duration',
    feasibilityInstantaneousFallback: 'Migration time not set — payback is computed as if migration is instantaneous.',

    feasibilityBreakdownTitle: 'Step-by-step cost comparison',
    feasibilityBreakdownStepColumn: 'Step',
    feasibilityBreakdownDurationColumn: 'Duration (mo)',
    feasibilityBreakdownCumMigrationColumn: 'Cum. migration',
    feasibilityBreakdownCumUpgradeColumn: 'Cum. upgrade',
    feasibilityBreakdownInitial: 'Migration cost paid',
    feasibilityBreakdownEdge: 'Step {n}: {from} → {to}',
    feasibilityBreakdownTarget: 'On target ({target})',
    feasibilityBreakdownPaybackBadge: 'payback',

    feasibilityAlternativesTitle: 'Alternative migration paths',
    feasibilityAlternativesPathColumn: 'Path',
    feasibilityAlternativesDurationColumn: 'Migration duration (mo)',
    feasibilityAlternativesCostColumn: 'Migration cost (USD)',
    feasibilityAlternativesPaybackColumn: 'Payback',
    feasibilityAlternativesPaybackInline: 'Migration pays off in ~{months} months',

    feasibilityAllPathsTitle: 'Migration paths',
    feasibilityAllPathsRecommendedBadge: 'recommended'
  },

  validation: {
    missingMetric: 'Variation "{variation}" is missing metric "{metricKey}"',
    invalidValue: 'Variation "{variation}" metric "{metricKey}" must be > 0 (got {value})',
    invalidWeight: 'Component weight "{metricKey}" must be a finite number > 0 (got {value})',
    invalidSwp: 'Development price (swp) must be a finite number ≥ 0 (got {value})',
    nonFinite: '"{field}" must be a finite number (got {value})',
    notPositive: '"{field}" must be a finite number > 0 (got {value})',
    negativeValue: '"{field}" must be a finite number ≥ 0 (got {value})',
    exceedsMax: '"{field}" must be a finite number ≤ {max} (got {value})',
    missingVariations: 'At least one variation is required'
  }
}

// ---------------------------------------------------------------------------
// Ukrainian locale
// ---------------------------------------------------------------------------

const ua: Translations = {
  common: {
    appTitle: 'DSAV-CQRSES',
    appDescription: 'Оцінювач архітектури DSAV CQRS/ES — інструмент для визначення оптимальної варіації CQRS з ES',
    tabParametersAssessment: 'Оцінка параметрів',
    tabVariationSelection: 'Вибір варіації',
    tabMigrationRoadmap: 'План міграції',
    calculate: 'Обчислити',
    exportJson: 'Експорт JSON',
    add: 'Додати',
    remove: 'Видалити',
    name: 'Назва',
    value: 'Значення',
    type: 'Тип',
    from: 'З',
    to: 'До',
    effort: 'Зусилля',
    level: 'Рівень',
    score: 'Оцінка',
    total: 'Загалом',
    results: 'Результати',
    actions: 'Дії',
    source: 'Джерело',
    target: 'Ціль',
    none: 'Немає',
    select: '-- Обрати --',
    selectSource: '-- Обрати джерело --',
    selectTarget: '-- Обрати ціль --',
    mainNavigation: 'Головна навігація',
    mustBeGreaterThanZero: 'Має бути більше 0',
    mustBeNonNegative: 'Значення має бути ≥ 0',
    nameCannotBeEmpty: 'Назва не може бути порожньою',
    alreadyExists: 'вже існує',
    valueMustBeNumber: 'Значення має бути числом',
    footerBuiltOn: 'Розроблено на платформі',
    footerPlatform: 'DBBSoftware',
    footerWithin: 'в рамках освітньої програми PhD',
    footerUniversity: 'Дніпровський національний університет імені Олеся Гончара'
  },

  home: {
    heading: 'Інформаційна технологія визначення оптимальної варіації CQRS з ES архітектури',
    subtitle:
      'DSAV-CQRSES допомагає архітекторам програмного забезпечення визначити оптимальну варіацію CQRS з ES для заданої системи та оптимальний шлях міграції між варіаціями.',
    methodologyHeading: 'Основна методологія',
    cardParametersAssessmentTitle: 'Оцінка параметрів',
    cardParametersAssessmentDescription:
      'Оцініть складність та продуктивність вашої системи за допомогою нечітких лінгвістичних змінних та експертних критеріїв.',
    cardVariationSelectionTitle: 'Вибір варіації',
    cardVariationSelectionDescription:
      'Порівняйте архітектурні варіації CQRS з Event Sourcing та оберіть оптимальну на основі багатокритеріального аналізу рішень.',
    cardMigrationRoadmapTitle: 'План міграції',
    cardMigrationRoadmapDescription:
      'Створіть оптимальний покроковий шлях міграції між архітектурними варіаціями за допомогою графового планування.',
    fuzzyLogicBadge: 'Нечітка логіка',
    fuzzyLogicText:
      'Лінгвістичні змінні та функції належності перетворюють якісні експертні оцінки в точні числові оцінки для кожного параметра системи.',
    mcdaBadge: 'БКАР',
    mcdaText:
      'Багатокритеріальний аналіз рішень ранжує архітектурні варіації, агрегуючи зважені оцінки параметрів, визначаючи найкращий варіант для вашого контексту.',
    graphPlanningBadge: 'Графове планування',
    graphPlanningText:
      'Орієнтований граф архітектурних варіацій та кроків міграції дозволяє алгоритмам найкоротшого шляху створювати оптимальний, поступовий план міграції.'
  },

  tab1: {
    heading: 'Оцінка параметрів',
    description:
      'Оцініть характеристики складності та продуктивності окремої архітектурної варіації за допомогою нечіткої логічної класифікації та шкал оцінювання.',

    complexityEvaluationTitle: 'Оцінка складності',
    complexityEvaluationDescription:
      'Оцініть складність окремої архітектурної варіації за допомогою нечіткої класифікації (трапецієподібні функції належності).',
    performanceEvaluationTitle: 'Оцінка продуктивності',
    performanceEvaluationDescription:
      'Оцініть продуктивність за допомогою нечіткої логіки на основі часу відповіді сервера. Базується на виміряних часах відповіді читання/запису та шкалі оцінювання.',

    classificatorSettings: 'Налаштування класифікатора:',
    designWeight: 'Вага проєктування',
    realizationWeight: 'Вага реалізації',
    weightsSumMustBeOne: 'Сума ваг має дорівнювати 1',
    designMaxValue: 'Макс. значення проєктування',
    realizationMaxValue: 'Макс. значення реалізації',
    autoCalcMaxValues: 'Авто-визначити з даних',

    componentLabel: 'Компонент:',
    removeComponent: 'Видалити компонент',
    activityColumn: 'Діяльність',
    designComplexityColumn: 'Складність проєктування',
    realizationComplexityColumn: 'Складність реалізації',
    removeActivity: 'Видалити діяльність',
    addActivity: '+ Додати діяльність',
    addComponent: '+ Додати компонент',
    componentNamePlaceholder: 'Назва компонента',
    newActivity: 'Нова діяльність',

    classValueFuzzy: 'Класове значення (нечітке)',
    componentTotal: 'Уточнена складність:',

    complexityResultsTitle: 'Результати складності',
    complexityResultsPlaceholder:
      'Немає результатів для відображення. Додайте компоненти та діяльності, щоб побачити результати складності.',
    componentColumn: 'Компонент',
    designColumn: 'Проєктування',
    realizationColumn: 'Реалізація',
    totalColumn: 'Інтегральна',
    complexityChartTitle: 'Графік складності',
    complexityValueAxis: 'Значення складності',
    membershipCoefficientAxis: 'Ступінь належності\nдо класу продуктивності',

    fuzzyVerySimple: 'Дуже простий',
    fuzzySimple: 'Простий',
    fuzzyAverage: 'Середній',
    fuzzyComplex: 'Складний',
    fuzzyVeryComplex: 'Дуже складний',

    performanceScaleTitle: 'Шкала продуктивності',
    thresholdMs: 'Поріг (мс)',
    addLevel: '+ Додати рівень',
    removeLast: 'Видалити останній',

    performanceResultsTitle: 'Результати продуктивності',
    metricNameColumn: 'Назва',
    responseTimeMsColumn: 'Час відповіді сервера (мс)',
    calculationColumn: 'Розрахунок',
    performanceScoreColumn: 'Оцінка',
    addPerformanceMetric: '+ Додати метрику продуктивності',
    metricNamePlaceholder: 'Назва метрики',
    responseTimePlaceholder: 'Час відповіді (мс)',
    removeMetric: 'Видалити метрику',
    responseTimeAxis: 'Час відповіді (мс)',
    classScoreAxis: 'Бальна оцінка класу',

    performanceChartTitle: 'Графік продуктивності',
    addAtLeastTwoLevels: 'Додайте щонайменше 2 рівні шкали, щоб відобразити графік.'
  },

  tab2: {
    heading: 'Вибір варіації',
    description:
      'Порівняйте архітектурні варіації CQRS з Event Sourcing. Інтегральна складність (rc_i) разом із найдешевшою аппаратною конфігурацією, що задовольняє SLA, визначає оптимальну варіацію за формулою as* = min { swp · rc_i + min c_ij }.',

    qualityAttributesTitle: 'Атрибути якості',
    qualityAttributesDescription:
      'Оберіть, які атрибути складності включити в оцінку. Вони визначають стовпці таблиці «Метрики варіацій».',
    complexityAttributes: 'Атрибути складності',
    addCustomAttribute: '+ Додати власний атрибут',
    componentTypeLabel: 'Тип компонента',
    oqacLabel: 'OQAC',
    psqacLabel: 'PSQAC',
    oqacFull: 'Операційний компонент атрибутів якості',
    psqacFull: 'Компонент атрибутів якості простору проблем',
    weightCriterionColumn: 'Критерій ваги',

    weightsTitle: 'Ваги компонентів атрибутів якості',
    weightsDescription:
      'Визначте ваги для кожного компонента атрибуту якості, які беруть участь в інтегральній оцінці складності.',
    calculationTemplate: 'Шаблон розрахунку',
    weightValue: 'Значення',
    weightsAllValid: 'Усі значення ваг валідні',
    weightsInvalidValue: 'Значення ваги має бути > 0',

    qualityAttributeComponent: 'Компонент атрибуту якості',
    variationMetricsTitle: 'Метрики варіацій',
    variationMetricsDescription:
      'Введіть виміряні метрики складності для кожної варіації. Стовпці відповідають увімкненим атрибутам якості.',
    addVariation: '+ Додати варіацію',
    variationNamePlaceholder: 'Назва варіації',
    variationNameEmpty: 'Назва варіації не може бути порожньою.',
    addVariationHint: '(всі рядки метрик будуть додані порожніми, заповнюйте значення вручну)',
    metricRequired: 'є обовʼязковим',
    metricMustBePositive: 'має бути > 0',
    allValuesPositive: 'Усі значення > 0',

    slaParametersTitle: 'SLA-параметри',
    slaParametersDescription:
      'Визначте SLA-обмеження, за якими фільтрується апаратні конфігурації. Додавайте, редагуйте або видаляйте параметри за потреби.',
    slaNameColumn: 'Назва SLA',
    slaUnitColumn: 'Одиниця',
    slaDirectionColumn: 'Напрямок',
    slaThresholdColumn: 'Поріг',
    slaDirectionLessBetter: 'Менше — краще',
    slaDirectionMoreBetter: 'Більше — краще',
    addSlaParameter: '+ Додати SLA-параметр',
    slaNamePlaceholder: 'напр. p95 Запити',
    slaNameRequired: 'Назва SLA не може бути порожньою.',

    hardwareConfigurationsTitle: 'Аппаратні конфігурації по варіаціях',
    hardwareConfigurationsDescription:
      'Для кожної варіації вкажіть аппаратні конфігурації з місячною ціною (USD) та виміряними значеннями для кожного SLA-параметра.',
    hardwareNameColumn: 'Hardware',
    hardwarePriceColumn: 'Ціна (USD/місяць)',
    addHardwareConfig: 'Додати hardware',
    hardwareNamePlaceholder: 'напр. m7i-gp3',
    hardwareNameRequired: 'Назва hardware не може бути порожньою.',
    hardwareNoVariations: 'Варіації відсутні — додайте принаймні одну варіацію в розділі «Метрики варіацій».',

    swpTitle: 'Вартість розробки найпростішої варіації',
    swpDescription: 'Вартість розробки варіації з відносною складністю rc = 1.',
    swpUnit: 'USD/місяць',

    resultsTitle: 'Результати',
    relativeComplexityTitle: 'Відносна складність',
    relativeComplexityPlaceholder: 'Запустіть обчислення, щоб побачити відносну складність.',
    relativeComplexityIntegralColumn: 'r_i (інтегральна)',
    relativeComplexityRcColumn: 'rc_i = r_i / r_min',
    referenceVariationBadge: 'опорна',

    relativeHostingTitle: 'Відносна вартість хостингу',
    relativeHostingPlaceholder: 'Запустіть обчислення, щоб побачити відносні вартості хостингу.',
    relativeHostingPriceColumn: 'p_i (USD/місяць)',
    relativeHostingPcColumn: 'pc_i = p_i / p_min',

    optimalResultTitle: 'Оптимальна варіація',
    optimalResultPlaceholder: 'Запустіть обчислення, щоб побачити оптимальну варіацію.',
    columnVariation: 'Варіація',
    columnRc: 'rc_i',
    columnHardware: 'Hardware',
    columnHardwarePrice: 'Ціна hardware',
    columnDevCost: 'swp · rc_i',
    columnTotal: 'Усього',
    optimalRowBadge: 'оптимум',
    slaNotMetBadge: 'SLA не виконано',

    calculateOptimalVariation: 'Обчислити оптимальну варіацію',

    validationPassed: 'Валідацію пройдено',
    validationErrors: 'Помилки валідації',
    validationAllMetricKeysPresent: 'Усі ключі метрик присутні у всіх варіаціях',
    validationAllValuesPositive: 'Усі значення > 0',
    validationPerformancePrioritiesSum: 'Усі обовʼязкові поля заповнено'
  },

  tab3: {
    heading: 'План міграції',
    description:
      'Створіть оптимальний покроковий шлях міграції між архітектурними варіаціями. Графове планування використовує алгоритми найкоротшого шляху для створення поступового плану міграції, адаптованого до вашої системи.',

    variationsGraphNodesTitle: 'Варіації (вузли графа)',
    variationsGraphNodesDescription: 'Визначте архітектурні варіації, що формують вузли графа.',
    variationNamePlaceholder: 'Назва варіації',
    noVariationsDefined: 'Варіації ще не визначено.',
    variationAlreadyExists: 'Варіація з такою назвою вже існує',

    migrationEdgesTitle: 'Ребра міграції',
    migrationEdgesDescription: 'Визначте можливі шляхи міграції між варіаціями та їх зусилля.',
    noEdgesDefined: 'Ребра ще не визначено. Спочатку додайте варіації.',
    effortWeight: 'Зусилля (вага)',
    selectBothFromTo: 'Оберіть обидві варіації З та До',
    fromToMustBeDifferent: 'З та До мають бути різними',
    effortMustBePositive: 'Зусилля має бути більше 0',
    edgeAlreadyExists: 'Це ребро вже існує',
    edgeLabel: 'Ребро',

    noDuplicateEdges: 'Немає дублікатів ребер (однакові з→до)',
    allEffortPositive: 'Усі значення зусилля > 0',
    fromNotEqualTo: 'З ≠ До для кожного ребра',

    pathfindingResultsTitle: 'Пошук шляху',
    addVariationsToBegin: 'Додайте варіації для початку',
    findOptimalPath: 'Знайти оптимальний шлях',
    sourceAndTargetMustBeDifferent: 'Джерело та ціль мають бути різними',
    selectSourceAndTarget: 'Оберіть джерело та ціль, потім натисніть Знайти оптимальний шлях',

    resultsTitle: 'Результати',
    noPathExists: 'Шлях не існує',
    noPathExistsFromTo: 'Шлях від {source} до {target} не існує',
    optimalPath: 'Оптимальний шлях',
    totalEffort: 'Загальне зусилля:',
    steps: 'Кроки',
    alternativePaths: 'Альтернативні шляхи',
    noAlternativePaths: 'Альтернативних шляхів немає',

    graphVisualizationTitle: 'Візуалізація графа',
    addVariationsToSeeGraph: 'Додайте варіації, щоб побачити граф міграції.',
    pathSummary: 'Підсумок шляху',
    zoomIn: 'Збільшити',
    zoomOut: 'Зменшити',
    zoomReset: 'Скинути масштаб',

    removedNodeAndEdges: 'Видалено "{name}" та {count} повʼязаних ребер',

    feasibilityTitle: 'Оцінка доцільності міграції',
    feasibilityToggleLabel: 'При посиленні апаратної конфігурації міграція не є обов’язковою',
    feasibilityColNow: '1. Зараз (поточний стан)',
    feasibilityColUpgrade: '2. Посилення апаратної частини',
    feasibilityColAfter: '3. Після міграції',
    feasibilitySupportCost: 'Вартість підтримки (USD/місяць)',
    feasibilityHostingCost: 'Вартість хостингу (USD/місяць)',
    feasibilityMonthlyTotal: 'Місячна сума',
    feasibilityMigrationCostLabel: 'Вартість міграції (одноразово, USD)',
    feasibilityPaybackResult: 'Міграція окупиться приблизно за {months} місяців',
    feasibilityNoPayback: 'Міграція не окупається',
    feasibilityNoPaybackMoreExpensive:
      'Міграція не окупається — після міграції щомісячна вартість на {diff} USD більша за сценарій посилення апаратної частини.',

    nodeNameColumn: 'Варіація',
    nodeSupportCostColumn: 'Підтримка (USD/міс)',
    nodeHostingCostColumn: 'Хостинг (USD/міс)',

    edgeMigrationTimeColumn: 'Час (міс)',
    edgeMigrationTimeHint: 'Заповніть для одного ребра — решта обчислюється з effort',

    feasibilityMigrationDuration: 'Тривалість міграції',
    feasibilityInstantaneousFallback: 'Час міграції не заданий — окупність розрахована як для миттєвої міграції.',

    feasibilityBreakdownTitle: 'Покрокове порівняння витрат',
    feasibilityBreakdownStepColumn: 'Етап',
    feasibilityBreakdownDurationColumn: 'Тривалість (міс)',
    feasibilityBreakdownCumMigrationColumn: 'Сум. міграції',
    feasibilityBreakdownCumUpgradeColumn: 'Сум. посилення',
    feasibilityBreakdownInitial: 'Сплачена вартість міграції',
    feasibilityBreakdownEdge: 'Етап {n}: {from} → {to}',
    feasibilityBreakdownTarget: 'На цільовій варіації ({target})',
    feasibilityBreakdownPaybackBadge: 'окупність',

    feasibilityAlternativesTitle: 'Альтернативні шляхи міграції',
    feasibilityAlternativesPathColumn: 'Шлях',
    feasibilityAlternativesDurationColumn: 'Тривалість міграції (міс)',
    feasibilityAlternativesCostColumn: 'Вартість міграції (USD)',
    feasibilityAlternativesPaybackColumn: 'Окупність',
    feasibilityAlternativesPaybackInline: 'Міграція окупиться приблизно за {months} місяців',

    feasibilityAllPathsTitle: 'Шляхи міграції',
    feasibilityAllPathsRecommendedBadge: 'рекомендований'
  },

  validation: {
    missingMetric: 'У варіації "{variation}" відсутня метрика "{metricKey}"',
    invalidValue: 'Метрика "{metricKey}" варіації "{variation}" має бути > 0 (отримано {value})',
    invalidWeight: 'Вага компонента "{metricKey}" має бути скінченним числом > 0 (отримано {value})',
    invalidSwp: 'Вартість розробки (swp) має бути скінченним числом ≥ 0 (отримано {value})',
    nonFinite: '"{field}" має бути скінченним числом (отримано {value})',
    notPositive: '"{field}" має бути скінченним числом > 0 (отримано {value})',
    negativeValue: '"{field}" має бути скінченним числом ≥ 0 (отримано {value})',
    exceedsMax: '"{field}" має бути скінченним числом ≤ {max} (отримано {value})',
    missingVariations: 'Потрібна щонайменше одна варіація'
  }
}

// ---------------------------------------------------------------------------
// Locale map
// ---------------------------------------------------------------------------

export const translations = { en, ua } as const

export type Locale = keyof typeof translations

// ---------------------------------------------------------------------------
// TranslationKey — dot-notation path type for type-safe lookups
// ---------------------------------------------------------------------------

/**
 * Recursively builds a union of dot-notation paths for all leaf keys.
 *
 * Example: `TranslationKey` includes `'common.calculate'`, `'tab1.readMs'`, etc.
 */
type DotPrefix<T extends string, U extends string> = `${T}.${U}`

type TranslationPaths<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string ? K : DotPrefix<K, TranslationPaths<T[K]>>
    }[keyof T & string]

export type TranslationKey = TranslationPaths<Translations>

// ---------------------------------------------------------------------------
// Helper — type-safe translation getter
// ---------------------------------------------------------------------------

/**
 * Resolve a dot-notation key against a Translations object.
 *
 * Usage:
 * ```ts
 * const t = translations['en']
 * const label = getTranslation(t, 'common.calculate') // "Calculate"
 * ```
 */
export function getTranslation(t: Translations, key: TranslationKey): string {
  const parts = key.split('.')
  let current: unknown = t
  for (const part of parts) {
    if (current === undefined || current === null) return key
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'string' ? current : key
}
