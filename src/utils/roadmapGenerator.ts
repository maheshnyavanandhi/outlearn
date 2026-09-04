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

  if (lower.includes('physics') || lower.includes('ohm') || lower.includes('electricity') || lower.includes('circuit')) {
    return {
      title: 'Physics & Circuit Dynamics Roadmap',
      subject: 'physics',
      description: 'Structured 6-stage curriculum progressing from fundamental charges to circuit laws and induction.',
      stages: [
        { id: 'p-1', title: 'Charge & Potential Difference (Voltage)', level: 'beginner', status: 'mastered', conceptsCount: 5, description: 'Coulomb forces, electric fields, and voltage as potential push.' },
        { id: 'p-2', title: 'Electric Current & Rate of Flow', level: 'beginner', status: 'mastered', conceptsCount: 4, description: 'Electron drift velocity, amperes, and charge conservation.' },
        { id: 'p-3', title: "Resistance & Ohm's Law (V = IR)", level: 'beginner', status: 'developing', conceptsCount: 6, description: "Resistivity, material properties, and Ohm's linear relationship." },
        { id: 'p-4', title: 'Series & Parallel Circuit Analysis', level: 'intermediate', status: 'unknown', conceptsCount: 7, description: 'Equivalent resistance, Kirchhoff laws, and voltage dividers.' },
        { id: 'p-5', title: 'Electrical Power & Joule Heating', level: 'intermediate', status: 'unknown', conceptsCount: 5, description: 'Power dissipation P = I²R and thermal energy efficiency.' },
        { id: 'p-6', title: 'Electromagnetism & Induction', level: 'advanced', status: 'unknown', conceptsCount: 8, description: 'Magnetic flux, Faraday law, and electromagnetic induction.' }
      ]
    };
  }

  if (lower.includes('dbms') || lower.includes('sql') || lower.includes('database') || lower.includes('relational')) {
    return {
      title: 'DBMS & Relational Data Engineering Roadmap',
      subject: 'dbms',
      description: 'Structured 6-stage curriculum covering relational schema design, querying, and transaction optimization.',
      stages: [
        { id: 'd-1', title: 'Relational Model & ER Diagrams', level: 'beginner', status: 'mastered', conceptsCount: 6, description: 'Entities, relationships, primary keys, and foreign keys.' },
        { id: 'd-2', title: 'Relational Algebra & Set Operations', level: 'beginner', status: 'mastered', conceptsCount: 5, description: 'Select, project, join, union, and relational completeness.' },
        { id: 'd-3', title: 'SQL Querying, Joins & Aggregations', level: 'intermediate', status: 'developing', conceptsCount: 8, description: 'Inner/outer joins, GROUP BY, HAVING, and subqueries.' },
        { id: 'd-4', title: 'Database Normalization (1NF to BCNF)', level: 'intermediate', status: 'unknown', conceptsCount: 6, description: 'Functional dependencies, 1NF, 2NF, 3NF, and BCNF decomposition.' },
        { id: 'd-5', title: 'Transactions & ACID Properties', level: 'advanced', status: 'unknown', conceptsCount: 7, description: 'Concurrency control, locking, schedules, and serializability.' },
        { id: 'd-6', title: 'Query Optimization & B-Tree Indexing', level: 'advanced', status: 'unknown', conceptsCount: 6, description: 'B+ tree structures, execution plans, and index scans.' }
      ]
    };
  }

  if (lower.includes('cell') || lower.includes('biology') || lower.includes('plant') || lower.includes('respiration')) {
    return {
      title: 'Cellular Biology & Life Sciences Roadmap',
      subject: 'biology',
      description: 'Structured 6-stage curriculum exploring cell structure, metabolic pathways, and molecular genetics.',
      stages: [
        { id: 'b-1', title: 'Cell Membrane & Cellulose Wall Structure', level: 'beginner', status: 'mastered', conceptsCount: 5, description: 'Phospholipid bilayers, turgor pressure, and selective permeability.' },
        { id: 'b-2', title: 'Cytoplasm, Mitochondria & Organelles', level: 'beginner', status: 'mastered', conceptsCount: 6, description: 'Eukaryotic vs prokaryotic organelles and internal transport.' },
        { id: 'b-3', title: 'Cellular Respiration & ATP Synthesis', level: 'intermediate', status: 'developing', conceptsCount: 7, description: 'Glycolysis, Krebs cycle, and electron transport chain ATP yield.' },
        { id: 'b-4', title: 'Mitosis & Meiosis Cell Division', level: 'intermediate', status: 'unknown', conceptsCount: 6, description: 'Chromosomal duplication, spindle fibers, and genetic crossover.' },
        { id: 'b-5', title: 'Molecular Genetics & DNA Replication', level: 'advanced', status: 'unknown', conceptsCount: 8, description: 'Double helix, transcription, mRNA translation, and proteins.' },
        { id: 'b-6', title: 'Photosynthesis & Energy Conversion', level: 'advanced', status: 'unknown', conceptsCount: 6, description: 'Light reactions, Calvin cycle, and chlorophyll photon capture.' }
      ]
    };
  }

  if (lower.includes('python') || lower.includes('programming') || lower.includes('coding') || lower.includes('software')) {
    return {
      title: 'Python & Computer Science Roadmap',
      subject: 'programming',
      description: 'Structured 6-stage curriculum progressing from syntax fundamentals to data structures and algorithms.',
      stages: [
        { id: 'py-1', title: 'Python Syntax, Variables & Types', level: 'beginner', status: 'mastered', conceptsCount: 6, description: 'Primitives, string manipulation, input/output, and expressions.' },
        { id: 'py-2', title: 'Control Flow, Conditionals & Loops', level: 'beginner', status: 'mastered', conceptsCount: 5, description: 'If-else branching, while loops, for loops, and iteration.' },
        { id: 'py-3', title: 'Functions, Scoping & Modules', level: 'intermediate', status: 'developing', conceptsCount: 7, description: 'Def, parameters, return values, lambdas, and imports.' },
        { id: 'py-4', title: 'Data Structures (Lists, Dicts, Sets)', level: 'intermediate', status: 'unknown', conceptsCount: 8, description: 'Mutabilities, dictionary lookups, list comprehensions, and tuples.' },
        { id: 'py-5', title: 'Object-Oriented Programming (OOP)', level: 'advanced', status: 'unknown', conceptsCount: 7, description: 'Classes, inheritance, polymorphism, and encapsulation.' },
        { id: 'py-6', title: 'Algorithms & Time Complexity', level: 'advanced', status: 'unknown', conceptsCount: 8, description: 'Big-O notation, sorting, searching, and recursion.' }
      ]
    };
  }

  if (lower.includes('machine learning') || lower.includes('ml') || lower.includes('ai')) {
    return {
      title: 'AI & Machine Learning Roadmap',
      subject: 'programming',
      description: '8-stage structured curriculum adapted to learner mastery level.',
      stages: [
        { id: 'ml-1', title: 'Python Fundamentals', level: 'beginner', status: 'mastered', conceptsCount: 6, description: 'Core Python syntax and data structures.' },
        { id: 'ml-2', title: 'Mathematics for ML', level: 'beginner', status: 'mastered', conceptsCount: 8, description: 'Linear algebra, calculus, and probability foundations.' },
        { id: 'ml-3', title: 'Data Processing & Pandas', level: 'intermediate', status: 'understood', conceptsCount: 7, description: 'Dataframes, cleaning, and feature engineering.' },
        { id: 'ml-4', title: 'Supervised Learning', level: 'intermediate', status: 'developing', conceptsCount: 10, description: 'Linear/logistic regression, decision trees, and SVMs.' },
        { id: 'ml-5', title: 'Unsupervised Learning', level: 'intermediate', status: 'unknown', conceptsCount: 5, description: 'K-Means clustering, PCA, and anomaly detection.' },
        { id: 'ml-6', title: 'Model Evaluation & Loss', level: 'advanced', status: 'unknown', conceptsCount: 6, description: 'ROC-AUC, confusion matrices, and loss functions.' },
        { id: 'ml-7', title: 'Neural Networks & PyTorch', level: 'advanced', status: 'unknown', conceptsCount: 9, description: 'Deep learning, backpropagation, and tensor operations.' },
        { id: 'ml-8', title: 'Advanced Generative AI', level: 'advanced', status: 'unknown', conceptsCount: 8, description: 'Transformers, LLMs, and diffusion models.' }
      ]
    };
  }

  // General fallback tailored to the user's specific topic string!
  const cleanTitle = effectiveTopic.replace(/^(chapter\s*\d+:?|module\s*\d+:?)/i, '').trim() || effectiveTopic;

  return {
    title: `${cleanTitle} Learning Roadmap`,
    subject: 'general',
    description: `Structured 6-stage adaptive curriculum created for ${cleanTitle}.`,
    stages: [
      { id: 'gen-1', title: `Foundations & Terminology of ${cleanTitle}`, level: 'beginner', status: 'mastered', conceptsCount: 5, description: `Core definitions and foundational building blocks of ${cleanTitle}.` },
      { id: 'gen-2', title: `Governing Principles & Mental Models`, level: 'beginner', status: 'mastered', conceptsCount: 6, description: `Intuitive mental models and primary operational rules.` },
      { id: 'gen-3', title: `Key Analytical Mechanics & Formulas`, level: 'intermediate', status: 'developing', conceptsCount: 7, description: `Quantitative relations and step-by-step analytical mechanisms.` },
      { id: 'gen-4', title: `Practical Applications & Problem Solving`, level: 'intermediate', status: 'unknown', conceptsCount: 8, description: `Applying concepts to real-world scenarios and practical examples.` },
      { id: 'gen-5', title: `Advanced Diagnostics & Case Studies`, level: 'advanced', status: 'unknown', conceptsCount: 6, description: `Diagnosing edge cases, misconceptions, and complex systems.` },
      { id: 'gen-6', title: `Mastery Synthesis & Capstone Projects`, level: 'advanced', status: 'unknown', conceptsCount: 7, description: `Comprehensive integration and mastery evaluation.` }
    ]
  };
}
