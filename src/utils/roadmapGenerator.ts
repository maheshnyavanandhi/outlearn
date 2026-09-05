import { LearnerProfile } from '../types';

export interface LearningPathStage {
  id: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'mastered' | 'understood' | 'developing' | 'unknown';
  conceptsCount: number;
  description: string;
  prerequisites?: string[];
}

export interface LearningPath {
  title: string;
  subject: string;
  description: string;
  stages: LearningPathStage[];
}

export function generateDynamicRoadmap(
  topicPrompt: string,
  profile?: LearnerProfile
): LearningPath {
  const effectiveTopic = (
    topicPrompt ||
    profile?.learningObjective ||
    'General Knowledge & Core Principles'
  ).trim();

  const lower = effectiveTopic.toLowerCase();

  // 1. History & French Revolution
  if (lower.includes('french revolution') || lower.includes('revolution') || lower.includes('french history')) {
    return {
      title: 'French Revolution & 18th-Century European Transformation',
      subject: 'history',
      description: '6-stage sequential historical analysis from the Ancien Régime to the rise of Napoleon Bonaparte.',
      stages: [
        { id: 'fr-1', title: 'The Ancien Régime & Three Estates System', level: 'beginner', status: 'developing', conceptsCount: 5, description: 'Socio-political division of France into Clergy, Nobility, and Third Estate.', prerequisites: [] },
        { id: 'fr-2', title: 'Financial Crisis & Estates-General of 1789', level: 'beginner', status: 'unknown', conceptsCount: 6, description: 'Fiscal bankruptcy under Louis XVI and voting disputes in Assembly.', prerequisites: ['The Ancien Régime & Three Estates System'] },
        { id: 'fr-3', title: 'Tennis Court Oath & Storming of the Bastille', level: 'beginner', status: 'unknown', conceptsCount: 5, description: 'Formation of National Assembly and the July 14, 1789 popular uprising.', prerequisites: ['Financial Crisis & Estates-General of 1789'] },
        { id: 'fr-4', title: 'Declaration of Rights of Man & Constitutional Monarchy', level: 'intermediate', status: 'unknown', conceptsCount: 7, description: 'Enlightenment ideals, August Decrees, and feudalism abolition.', prerequisites: ['Tennis Court Oath & Storming of the Bastille'] },
        { id: 'fr-5', title: 'The Reign of Terror, Jacobins & Robespierre', level: 'intermediate', status: 'unknown', conceptsCount: 6, description: 'Committee of Public Safety, radicalization, and guillotine executions.', prerequisites: ['Declaration of Rights of Man'] },
        { id: 'fr-6', title: 'Thermidorian Reaction & Rise of Napoleon Bonaparte', level: 'advanced', status: 'unknown', conceptsCount: 7, description: 'The Directory, 1799 Brumaire coup d\'état, and Napoleonic state.', prerequisites: ['The Reign of Terror'] }
      ]
    };
  }

  // 2. Physics & Kinematics / Circuit Dynamics
  if (lower.includes('physics') || lower.includes('ohm') || lower.includes('electricity') || lower.includes('circuit') || lower.includes('newton') || lower.includes('force') || lower.includes('motion') || lower.includes('gravity') || lower.includes('kinematics')) {
    return {
      title: 'Physics & Physical Systems Roadmap',
      subject: 'physics',
      description: 'Structured 6-stage curriculum progressing from fundamental laws to quantitative mechanics and field dynamics.',
      stages: [
        { id: 'p-1', title: 'Foundational Physical Forces & Vector Laws', level: 'beginner', status: 'developing', conceptsCount: 5, description: 'Core forces, vectors, displacement, and fundamental laws.', prerequisites: [] },
        { id: 'p-2', title: "Newton's Laws of Motion & Momentum", level: 'beginner', status: 'unknown', conceptsCount: 4, description: 'Inertia, F = ma, action-reaction pairs, and momentum conservation.', prerequisites: ['Foundational Physical Forces'] },
        { id: 'p-3', title: "Charge, Potential & Ohm's Law (V = IR)", level: 'beginner', status: 'unknown', conceptsCount: 6, description: "Voltage, current, resistance, and Ohm's linear relationship.", prerequisites: ["Newton's Laws of Motion"] },
        { id: 'p-4', title: 'Energy, Work & Conservation Laws', level: 'intermediate', status: 'unknown', conceptsCount: 7, description: 'Kinetic/potential energy, work-energy theorem, and power.', prerequisites: ["Ohm's Law"] },
        { id: 'p-5', title: 'Circuit Analysis & Electromagnetism', level: 'intermediate', status: 'unknown', conceptsCount: 5, description: 'Kirchhoff laws, magnetic flux, and electromagnetic induction.', prerequisites: ['Energy, Work & Conservation'] },
        { id: 'p-6', title: 'Advanced Dynamics & Wave Motion', level: 'advanced', status: 'unknown', conceptsCount: 8, description: 'Harmonic motion, wave equations, and field interactions.', prerequisites: ['Circuit Analysis'] }
      ]
    };
  }

  // 3. DBMS & Relational Engineering
  if (lower.includes('dbms') || lower.includes('sql') || lower.includes('database') || lower.includes('relational') || lower.includes('join') || lower.includes('schema')) {
    return {
      title: 'DBMS & Relational Data Engineering Roadmap',
      subject: 'dbms',
      description: 'Structured 6-stage curriculum covering relational schema design, querying, and transaction optimization.',
      stages: [
        { id: 'd-1', title: 'Relational Model & ER Diagrams', level: 'beginner', status: 'developing', conceptsCount: 6, description: 'Entities, relationships, primary keys, and foreign keys.', prerequisites: [] },
        { id: 'd-2', title: 'Relational Algebra & Set Operations', level: 'beginner', status: 'unknown', conceptsCount: 5, description: 'Select, project, join, union, and relational completeness.', prerequisites: ['Relational Model'] },
        { id: 'd-3', title: 'SQL Querying, Joins & Aggregations', level: 'intermediate', status: 'unknown', conceptsCount: 8, description: 'Inner/outer joins, GROUP BY, HAVING, and subqueries.', prerequisites: ['Relational Algebra'] },
        { id: 'd-4', title: 'Database Normalization (1NF to BCNF)', level: 'intermediate', status: 'unknown', conceptsCount: 6, description: 'Functional dependencies, 1NF, 2NF, 3NF, and BCNF decomposition.', prerequisites: ['SQL Querying'] },
        { id: 'd-5', title: 'Transactions & ACID Properties', level: 'advanced', status: 'unknown', conceptsCount: 7, description: 'Concurrency control, locking, schedules, and serializability.', prerequisites: ['Database Normalization'] },
        { id: 'd-6', title: 'Query Optimization & B-Tree Indexing', level: 'advanced', status: 'unknown', conceptsCount: 6, description: 'B+ tree structures, execution plans, and index scans.', prerequisites: ['Transactions'] }
      ]
    };
  }

  // 4. Cellular Biology & Life Sciences
  if (lower.includes('cell') || lower.includes('biology') || lower.includes('plant') || lower.includes('respiration') || lower.includes('photosynthesis') || lower.includes('dna') || lower.includes('gene')) {
    return {
      title: 'Cellular Biology & Life Sciences Roadmap',
      subject: 'biology',
      description: 'Structured 6-stage curriculum exploring cell structure, metabolic pathways, and molecular genetics.',
      stages: [
        { id: 'b-1', title: 'Cell Structure, Membrane & Organelles', level: 'beginner', status: 'developing', conceptsCount: 5, description: 'Phospholipid bilayers, organelle functions, and membrane transport.', prerequisites: [] },
        { id: 'b-2', title: 'Cellular Respiration & ATP Synthesis', level: 'beginner', status: 'unknown', conceptsCount: 6, description: 'Glycolysis, Krebs cycle, and electron transport chain.', prerequisites: ['Cell Structure'] },
        { id: 'b-3', title: 'Photosynthesis & Solar Energy Conversion', level: 'intermediate', status: 'unknown', conceptsCount: 7, description: 'Light-dependent reactions, Calvin cycle, and chlorophyll capture.', prerequisites: ['Cellular Respiration'] },
        { id: 'b-4', title: 'Mitosis, Meiosis & Cell Division', level: 'intermediate', status: 'unknown', conceptsCount: 6, description: 'Chromosomal duplication, spindle fibers, and genetic crossover.', prerequisites: ['Photosynthesis'] },
        { id: 'b-5', title: 'Molecular Genetics & DNA Replication', level: 'advanced', status: 'unknown', conceptsCount: 8, description: 'Double helix, transcription, mRNA translation, and proteins.', prerequisites: ['Cell Division'] },
        { id: 'b-6', title: 'Metabolic Regulation & Signal Transduction', level: 'advanced', status: 'unknown', conceptsCount: 6, description: 'Enzymatic kinetics, feedback inhibition, and cellular signaling.', prerequisites: ['Molecular Genetics'] }
      ]
    };
  }

  // 5. Mathematics & Calculus
  if (lower.includes('math') || lower.includes('algebra') || lower.includes('calculus') || lower.includes('equation') || lower.includes('trigonometry') || lower.includes('derivative') || lower.includes('integral')) {
    return {
      title: 'Mathematics & Analytical Calculus Roadmap',
      subject: 'mathematics',
      description: 'Structured 6-stage curriculum progressing from foundational algebra to differential calculus.',
      stages: [
        { id: 'm-1', title: 'Algebraic Relations, Functions & Graphs', level: 'beginner', status: 'developing', conceptsCount: 5, description: 'Domain/range, polynomial functions, and Cartesian plots.', prerequisites: [] },
        { id: 'm-2', title: 'Trigonometric Identities & Sine Waves', level: 'beginner', status: 'unknown', conceptsCount: 6, description: 'Unit circle, sine/cosine functions, and wave transformation.', prerequisites: ['Algebraic Relations'] },
        { id: 'm-3', title: 'Limits, Continuity & Rates of Change', level: 'intermediate', status: 'unknown', conceptsCount: 7, description: 'Epsilon-delta intuition, secant lines, and instantaneous slope.', prerequisites: ['Trigonometric Identities'] },
        { id: 'm-4', title: 'Differential Calculus & Derivatives', level: 'intermediate', status: 'unknown', conceptsCount: 8, description: 'Power rule, product/quotient rule, chain rule, and optimization.', prerequisites: ['Limits & Continuity'] },
        { id: 'm-5', title: 'Integral Calculus & Area Under Curves', level: 'advanced', status: 'unknown', conceptsCount: 7, description: 'Antiderivatives, Riemann sums, and Fundamental Theorem of Calculus.', prerequisites: ['Differential Calculus'] },
        { id: 'm-6', title: 'Differential Equations & Modeling', level: 'advanced', status: 'unknown', conceptsCount: 6, description: 'First-order ODEs, slope fields, and physical system dynamics.', prerequisites: ['Integral Calculus'] }
      ]
    };
  }

  // 6. Python & Computer Science
  if (lower.includes('python') || lower.includes('programming') || lower.includes('coding') || lower.includes('software')) {
    return {
      title: 'Python & Computer Science Roadmap',
      subject: 'programming',
      description: 'Structured 6-stage curriculum progressing from syntax fundamentals to data structures and algorithms.',
      stages: [
        { id: 'py-1', title: 'Python Syntax, Variables & Types', level: 'beginner', status: 'developing', conceptsCount: 6, description: 'Primitives, string manipulation, input/output, and expressions.', prerequisites: [] },
        { id: 'py-2', title: 'Control Flow, Conditionals & Loops', level: 'beginner', status: 'unknown', conceptsCount: 5, description: 'If-else branching, while loops, for loops, and iteration.', prerequisites: ['Python Syntax'] },
        { id: 'py-3', title: 'Functions, Scoping & Modules', level: 'intermediate', status: 'unknown', conceptsCount: 7, description: 'Def, parameters, return values, lambdas, and imports.', prerequisites: ['Control Flow'] },
        { id: 'py-4', title: 'Data Structures (Lists, Dicts, Sets)', level: 'intermediate', status: 'unknown', conceptsCount: 8, description: 'Mutabilities, dictionary lookups, list comprehensions, and tuples.', prerequisites: ['Functions'] },
        { id: 'py-5', title: 'Object-Oriented Programming (OOP)', level: 'advanced', status: 'unknown', conceptsCount: 7, description: 'Classes, inheritance, polymorphism, and encapsulation.', prerequisites: ['Data Structures'] },
        { id: 'py-6', title: 'Algorithms & Time Complexity', level: 'advanced', status: 'unknown', conceptsCount: 8, description: 'Big-O notation, sorting, searching, and recursion.', prerequisites: ['OOP'] }
      ]
    };
  }

  // 7. Machine Learning & AI
  if (lower.includes('machine learning') || lower.includes('ml') || lower.includes('ai')) {
    return {
      title: 'Machine Learning & Neural Network Architecture Roadmap',
      subject: 'programming',
      description: '7-stage structured learning path from linear algebra vectors to transformers and deep learning.',
      stages: [
        { id: 'ml-1', title: 'Linear Algebra, Vectors & Matrices for ML', level: 'beginner', status: 'developing', conceptsCount: 6, description: 'Vector spaces, matrix multiplication, dot products, and eigenvalues.', prerequisites: [] },
        { id: 'ml-2', title: 'Supervised Learning & Regression Models', level: 'beginner', status: 'unknown', conceptsCount: 8, description: 'Loss functions, gradient descent optimization, and decision boundaries.', prerequisites: ['Linear Algebra'] },
        { id: 'ml-3', title: 'Classification Algorithms, Decision Trees & Random Forests', level: 'intermediate', status: 'unknown', conceptsCount: 7, description: 'Information entropy, decision trees, ensemble methods, and SVMs.', prerequisites: ['Supervised Learning'] },
        { id: 'ml-4', title: 'Model Evaluation, Cross-Validation & Loss Metrics', level: 'intermediate', status: 'unknown', conceptsCount: 6, description: 'Overfitting, bias-variance tradeoff, ROC-AUC curves, and metrics.', prerequisites: ['Classification Algorithms'] },
        { id: 'ml-5', title: 'Unsupervised Learning, K-Means & PCA', level: 'intermediate', status: 'unknown', conceptsCount: 5, description: 'Clustering heuristics, dimensionality reduction, and feature space.', prerequisites: ['Model Evaluation'] },
        { id: 'ml-6', title: 'Artificial Neural Networks & Backpropagation', level: 'advanced', status: 'unknown', conceptsCount: 9, description: 'Perceptrons, activation functions, chain rule gradients, and PyTorch.', prerequisites: ['Unsupervised Learning'] },
        { id: 'ml-7', title: 'Deep Learning Architectures, CNNs & Transformers', level: 'advanced', status: 'unknown', conceptsCount: 8, description: 'Convolutional layers, self-attention mechanisms, and LLM foundations.', prerequisites: ['Neural Networks'] }
      ]
    };
  }

  // General per-topic concept extraction with 0 initial mastered concepts
  const cleanTitle = effectiveTopic.replace(/^(chapter\s*\d+:?|module\s*\d+:?)/i, '').trim() || effectiveTopic;

  return {
    title: `${cleanTitle} Subject Mastery Roadmap`,
    subject: 'general',
    description: `Topic-extracted 5-stage learning path for ${cleanTitle}.`,
    stages: [
      { id: 'gen-1', title: `${cleanTitle}: Core Definitions & Terminology`, level: 'beginner', status: 'developing', conceptsCount: 5, description: `Essential definitions and foundational mental models of ${cleanTitle}.`, prerequisites: [] },
      { id: 'gen-2', title: `${cleanTitle}: Operational Mechanics & Workflow`, level: 'beginner', status: 'unknown', conceptsCount: 6, description: `Structural mechanisms and operational workflows of ${cleanTitle}.`, prerequisites: [`${cleanTitle}: Core Definitions`] },
      { id: 'gen-3', title: `${cleanTitle}: Governing Laws & Quantitative Rules`, level: 'intermediate', status: 'unknown', conceptsCount: 7, description: `Analytical relationships, equations, and rules in ${cleanTitle}.`, prerequisites: [`${cleanTitle}: Operational Mechanics`] },
      { id: 'gen-4', title: `${cleanTitle}: Practical Applications & Problem Solving`, level: 'intermediate', status: 'unknown', conceptsCount: 8, description: `Executing practical problem-solving in real-world scenarios.`, prerequisites: [`${cleanTitle}: Governing Laws`] },
      { id: 'gen-5', title: `${cleanTitle}: Advanced System Synthesis & Case Studies`, level: 'advanced', status: 'unknown', conceptsCount: 7, description: `Diagnostic reasoning, edge cases, and comprehensive synthesis.`, prerequisites: [`${cleanTitle}: Practical Applications`] }
    ]
  };
}
