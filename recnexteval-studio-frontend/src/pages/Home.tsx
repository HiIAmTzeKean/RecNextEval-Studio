import React from 'react'

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="space-y-6">
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent leading-tight pb-1">
            RecNextEval
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            An open-source Python toolkit that models temporal context to more accurately represent real-world offline evaluation scenarios for recommender systems.
          </p>
        </div>
      </section>

      {/* Key Features */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg space-y-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Temporal Context Modeling</h3>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            Designed with a focus on real-world temporal contexts to enhance recommendation accuracy through proper time-aware evaluation.
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 p-6 rounded-lg space-y-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Comprehensive Components</h3>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            Offers seamless integration of data handling, algorithm implementation, and evaluation metrics for complete RecSys pipelines.
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200 dark:border-purple-800 p-6 rounded-lg space-y-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">User-Friendly API</h3>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            Simplifies developing and testing recommendation systems, making it accessible for both researchers and practitioners.
          </p>
        </div>
      </section>

      {/* Architecture */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-lg">
        <h2 className="text-2xl font-semibold mb-6 text-slate-900 dark:text-slate-50">Architecture Overview</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Core Components</h3>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300">
              <li>• <strong>Data Handling:</strong> Interaction matrices, temporal splitting</li>
              <li>• <strong>Algorithms:</strong> ItemKNN, Time-aware models, Custom implementations</li>
              <li>• <strong>Evaluation:</strong> Pipeline and streaming evaluators</li>
              <li>• <strong>Metrics:</strong> Precision, Recall, NDCG, Hit rate</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Evaluation Settings</h3>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300">
              <li>• <strong>Single Time Point:</strong> Traditional evaluation at fixed timestamp</li>
              <li>• <strong>Sliding Window:</strong> Incremental evaluation over time windows</li>
              <li>• <strong>Temporal Splitting:</strong> Proper train/validation/test with time awareness</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-900 dark:to-cyan-900 p-8 rounded-lg text-white space-y-4">
        <h2 className="text-2xl font-semibold">Get Started with recnexteval</h2>
        <p className="text-blue-100 dark:text-blue-200">
          Build, evaluate, and deploy recommender systems with temporal awareness. Perfect for research and production use cases.
        </p>
        <div className="flex gap-4 pt-4">
          <a
            href="https://github.com/HiIAmTzeKean/recnexteval"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
          >
            View on GitHub
          </a>
          <a
            href="https://hiiamtzekean.github.io/recnexteval/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition"
          >
            Documentation
          </a>
        </div>
      </section>
    </div>
  )
}
