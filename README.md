# DSAV-CQRSES Architecture Evaluator

> A software tool for determining the optimal architectural variation of a CQRS system with Event Sourcing.

![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.2.6-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.6-61DAFB?logo=react&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-4.4.9-FF6384?logo=chartdotjs&logoColor=white)

## Table of contents

1. [General information](#1-general-information)
2. [Overview](#2-overview)
3. [Problem statement](#3-problem-statement)
4. [Goal and objectives](#4-goal-and-objectives)
5. [Implementation](#5-implementation)

---

## 1. General information

| Property                 | Value                                                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Full title**           | Computer program "DSAV-CQRSES Architecture Evaluator — a software tool for determining the optimal architectural variation of CQRS with Event Sourcing" |
| **Short title**          | Computer program "DSAV-CQRSES Architecture Evaluator"                                                                                                   |
| **Author**               | _(full name to be specified)_                                                                                                                           |
| **Programming language** | TypeScript 6.0, JSX/TSX markup, CSS                                                                                                                     |
| **Interface language**   | Ukrainian and English (user-switchable)                                                                                                                 |
| **Delivery form**        | Web application running in the user's browser                                                                                                           |

## 2. Overview

**DSAV-CQRSES Architecture Evaluator** is a web application that determines the optimal architectural variation of a computer system built on the **CQRS** (Command Query Responsibility Segregation) and **Event Sourcing** patterns.

The object of evaluation is the computer system as a hardware–software complex. The program treats it as an inseparable pair:

> **software architectural variation + hardware configuration of the compute node**

and returns exactly such a pair as its result.

The program implements the three computational processes of the DSAV-CQRSES information technology:

1. **Assessment** of the software component's complexity and the compute node's performance for a single architectural variation.
2. **Selection** of the optimal variation by the criterion of minimum total cost of ownership (TCO), subject to Service Level Agreement (SLA) constraints.
3. **Migration planning** — building a transition plan from the current architectural variation to the target one and determining the payback period of that transition.

> [!NOTE]
> In the current version, all computations run locally on the user's device. There is no dedicated backend or database, and entered data is never sent over the network. The program ships with sets of default input data obtained experimentally by the author, so it is usable immediately after opening.

## 3. Problem statement

The DSAV-CQRSES information technology defines methods for assessing and comparing architectural variations. However, applying these methods to a real system used to be done by hand or with a set of disconnected calculation scripts.

Manual application of these methods is labor-intensive. It involves:

- **fuzzy classification** of several hundred design and implementation complexity values — separately for every activity of every component;
- **multi-criteria aggregation** of metrics using the Analytic Hierarchy Process, with normalization of both criterion weights and alternative values;
- **step-by-step simulation** of cost accumulation under two system-evolution scenarios for every possible transition plan.

## 4. Goal and objectives

**Goal:** automate the application of the DSAV-CQRSES information technology methods and provide a reproducible way to determine the optimal architectural variation of a computer system.

To achieve this goal, the following objectives must be met:

1. Implement a complexity classifier based on trapezoidal membership functions and numerical integration.
2. Implement a performance classifier for system components based on measured metrics (e.g., server response time).
3. Implement the computation of the relative integral complexity of architectural variations using the Analytic Hierarchy Process, for an arbitrary number of variations.
4. Implement the search for the optimal transition plan between architectural variations on a directed weighted graph, and build the list of alternative plans.
5. Implement payback period estimation for the transition via step-by-step simulation of cost accumulation, compared against a scenario of scaling up the existing hardware.
6. Implement validation of all input data.
7. Compile sets of default input data from the results of a field experiment.

## 5. Implementation

The program is a website with three sections, each corresponding to a separate process of the technology.

| Section               | Route                    | Purpose                                             |
| --------------------- | ------------------------ | --------------------------------------------------- |
| Parameters Assessment | `/parameters-assessment` | Prepares the input parameters of a single variation |
| Variation Selection   | `/variation-selection`   | Determines the optimal variation                    |
| Migration Roadmap     | `/migration-roadmap`     | Builds the transition plan to the target variation  |

### 5.1. Parameters Assessment (`/parameters-assessment`)

Prepares the input parameters of a single architectural variation.

**Complexity.** The user maintains a list of architecture components and the activities within them. Each activity has two metrics: **design complexity** and **implementation complexity**. By default, 24 components are loaded — 12 each for the **Classical CQRS** and **mCQRS** variations. The program applies a fuzzy complexity classifier to each activity individually and aggregates the results per component in a table.

**Performance.** The user defines a "performance metric threshold → score" scale and the measured performance values. The program computes a fuzzy score for each measurement, shows a step-by-step explanation of how it was derived, and plots the membership functions with the measured values marked on the chart.

### 5.2. Variation Selection (`/variation-selection`)

Determines the optimal variation. The user maintains:

| Input                        | Default contents                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Quality attributes + weights | 12 attributes: ten components of the **OQAC** class and two of the **PSQAC** class                                                         |
| Metrics matrix               | Metric values for each architectural variation                                                                                             |
| SLA parameters               | 5 parameters: failure rate; 95th percentile of query execution time, of create commands, and of update commands; time to reach consistency |
| Hardware configurations      | Per-variation compute node configurations, each with its cost of ownership and the SLA parameter values measured on that configuration     |

The program then:

1. computes the relative integral complexity of the variations using the Analytic Hierarchy Process (AHP);
2. for each variation, picks the **cheapest hardware configuration that satisfies the SLA requirements**;
3. selects the option with the **minimum total cost**.

### 5.3. Migration Roadmap (`/migration-roadmap`)

Builds the transition plan to the target variation.

The user edits a **directed weighted graph**:

| Graph element | Meaning                          | Attributes                                                         |
| ------------- | -------------------------------- | ------------------------------------------------------------------ |
| **Vertices**  | System build options             | Monthly software maintenance cost and monthly hardware upkeep cost |
| **Edges**     | Technically feasible transitions | Effort (labor intensity)                                           |

The program:

1. validates the structural integrity of the graph;
2. finds the optimal transition plan using **Dijkstra's algorithm**, and all alternative plans via **depth-first search**;
3. renders the graph as an **SVG** with the chosen plan highlighted;
4. estimates the payback period of the transition by simulating cost accumulation step by step and comparing it with a hardware scale-up scenario;
5. summarizes the results for all possible plans in a table.
