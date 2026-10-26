// Roadmap data. Edit this file to change phases, tasks, or unlock rules.
// Task types:
//   "check" — a simple checkbox
//   "count" — a counter with a target (e.g. LeetCode problems solved)
// A phase unlocks when every rule in `unlock` is met: { phase, percent }.
// A task marked `checkpoint: true` is the "can I move on?" test for that phase.

const ROADMAP = [
  {
    id: "p1",
    title: "Foundations",
    weeks: "Weeks 1–8",
    goal: "Write small programs from scratch without a tutorial.",
    unlock: [],
    groups: [
      {
        name: "Python",
        tasks: [
          { id: "py-basics", text: "Variables, loops, functions, lists/dicts" },
          { id: "py-oop", text: "Classes and objects" },
          { id: "py-errors", text: "Error handling and reading tracebacks" },
          { id: "py-venv", text: "Virtual environments and pip" },
          { id: "py-files", text: "Read/write files, JSON, CSV" },
        ],
      },
      {
        name: "Git & GitHub",
        tasks: [
          { id: "git-basics", text: "init, add, commit, push, pull" },
          { id: "git-branch", text: "Branches and merging" },
          { id: "git-profile", text: "Clean GitHub profile with a README" },
          { id: "git-days", text: "Days with at least one commit", type: "count", target: 30 },
        ],
      },
      {
        name: "SQL",
        tasks: [
          { id: "sql-select", text: "SELECT, WHERE, ORDER BY" },
          { id: "sql-joins", text: "JOINs (inner, left)" },
          { id: "sql-group", text: "GROUP BY and HAVING" },
          { id: "sql-window", text: "Window functions" },
        ],
      },
      {
        name: "DSA",
        tasks: [
          { id: "dsa-arrays", text: "Arrays, strings, hashing" },
          { id: "dsa-twoptr", text: "Two pointers and sliding window" },
          { id: "dsa-sort", text: "Sorting and binary search" },
          { id: "dsa-lc", text: "LeetCode problems solved", type: "count", target: 100 },
        ],
      },
      {
        name: "Math (just enough)",
        tasks: [
          { id: "math-vec", text: "Vectors and dot products" },
          { id: "math-prob", text: "Probability basics" },
          { id: "math-grad", text: "Gradient / derivative intuition" },
        ],
      },
      {
        name: "Checkpoint",
        tasks: [
          { id: "p1-check", text: "Built a small Python + SQL CLI app with no tutorial", checkpoint: true },
        ],
      },
    ],
  },
  {
    id: "p2",
    title: "Core ML",
    weeks: "Weeks 9–14",
    goal: "Train, evaluate, and honestly judge a classical ML model.",
    unlock: [{ phase: "p1", percent: 70 }],
    groups: [
      {
        name: "Data tools",
        tasks: [
          { id: "np", text: "NumPy arrays and broadcasting" },
          { id: "pd", text: "Pandas: cleaning, merging, groupby" },
          { id: "plt", text: "Matplotlib / plotting basics" },
        ],
      },
      {
        name: "scikit-learn",
        tasks: [
          { id: "sk-reg", text: "Linear & logistic regression" },
          { id: "sk-tree", text: "Decision trees and ensembles" },
          { id: "sk-split", text: "Train/test split and cross-validation" },
          { id: "sk-pipe", text: "Pipelines and preprocessing" },
        ],
      },
      {
        name: "Evaluation (interviewers love this)",
        tasks: [
          { id: "ev-metrics", text: "Precision, recall, F1, ROC-AUC" },
          { id: "ev-leak", text: "Can explain and spot data leakage" },
          { id: "ev-base", text: "Always compare against a baseline" },
          { id: "ev-overfit", text: "Overfitting vs underfitting" },
        ],
      },
      {
        name: "Neural nets",
        tasks: [
          { id: "nn-torch", text: "Train a small model in PyTorch" },
          { id: "nn-loop", text: "Understand the training loop line by line" },
        ],
      },
      {
        name: "Checkpoint",
        tasks: [
          { id: "p2-check", text: "End-to-end ML notebook with baseline, metrics, and error analysis", checkpoint: true },
        ],
      },
    ],
  },
  {
    id: "p3",
    title: "Applied LLM Engineering",
    weeks: "Weeks 15–24",
    goal: "Build and deploy an LLM-backed API without a tutorial.",
    unlock: [{ phase: "p2", percent: 70 }],
    groups: [
      {
        name: "LLM APIs",
        tasks: [
          { id: "llm-api", text: "Call an LLM API from Python" },
          { id: "llm-prompt", text: "Prompt design and system prompts" },
          { id: "llm-json", text: "Structured outputs (JSON)" },
          { id: "llm-tools", text: "Tool / function calling" },
        ],
      },
      {
        name: "RAG",
        tasks: [
          { id: "rag-chunk", text: "Chunking strategies" },
          { id: "rag-embed", text: "Embeddings and similarity search" },
          { id: "rag-vdb", text: "Use a vector database" },
          { id: "rag-quality", text: "Measure retrieval quality" },
        ],
      },
      {
        name: "Agents",
        tasks: [
          { id: "ag-loop", text: "Build a simple tool-use loop" },
          { id: "ag-when", text: "Know when NOT to use an agent" },
        ],
      },
      {
        name: "Evaluation",
        tasks: [
          { id: "llm-testset", text: "Build a test set for an LLM app" },
          { id: "llm-hallu", text: "Measure accuracy and hallucination" },
        ],
      },
      {
        name: "Shipping",
        tasks: [
          { id: "ship-fastapi", text: "FastAPI backend" },
          { id: "ship-docker", text: "Dockerize an app" },
          { id: "ship-deploy", text: "Deploy to a free tier" },
          { id: "ship-cost", text: "Track cost and latency" },
        ],
      },
      {
        name: "Checkpoint",
        tasks: [
          { id: "p3-check", text: "Deployed LLM API built without a tutorial", checkpoint: true },
        ],
      },
    ],
  },
  {
    id: "p4",
    title: "Proof of Work",
    weeks: "Alongside Phase 3",
    goal: "2–3 serious projects with real users and measured results.",
    unlock: [{ phase: "p3", percent: 30 }],
    groups: [
      {
        name: "Project 1",
        tasks: [
          { id: "pr1-user", text: "Real user and problem defined" },
          { id: "pr1-base", text: "Baseline measured" },
          { id: "pr1-metric", text: "Improvement measured with numbers" },
          { id: "pr1-deploy", text: "Deployed with a live link" },
          { id: "pr1-readme", text: "README: architecture, trade-offs, failures" },
          { id: "pr1-users", text: "Real users / feedback collected", type: "count", target: 20 },
        ],
      },
      {
        name: "Project 2",
        tasks: [
          { id: "pr2-user", text: "Real user and problem defined" },
          { id: "pr2-base", text: "Baseline measured" },
          { id: "pr2-metric", text: "Improvement measured with numbers" },
          { id: "pr2-deploy", text: "Deployed with a live link" },
          { id: "pr2-readme", text: "README: architecture, trade-offs, failures" },
        ],
      },
      {
        name: "Checkpoint",
        tasks: [
          { id: "p4-check", text: "2+ projects with baselines, metrics, and live links", checkpoint: true },
        ],
      },
    ],
  },
  {
    id: "p5",
    title: "Getting Hired",
    weeks: "From Month 4",
    goal: "Turn your work into interviews and offers.",
    unlock: [{ phase: "p2", percent: 50 }],
    groups: [
      {
        name: "Materials",
        tasks: [
          { id: "job-resume", text: "One-page resume with numbers and links" },
          { id: "job-linkedin", text: "LinkedIn profile updated" },
          { id: "job-posts", text: "Write-ups / posts published", type: "count", target: 5 },
        ],
      },
      {
        name: "Outreach",
        tasks: [
          { id: "job-apps", text: "Targeted applications sent", type: "count", target: 50 },
          { id: "job-alumni", text: "Alumni / seniors contacted", type: "count", target: 15 },
          { id: "job-oss", text: "Open-source contributions merged", type: "count", target: 2 },
        ],
      },
      {
        name: "Interview prep",
        tasks: [
          { id: "int-dsa", text: "Solve LeetCode medium in 30–40 min" },
          { id: "int-sql", text: "SQL interview questions practiced" },
          { id: "int-ml", text: "Explain overfitting, leakage, precision/recall, RAG on a whiteboard" },
          { id: "int-proj", text: "Defend your project design (\"why not X?\")" },
          { id: "int-mock", text: "Mock interviews done", type: "count", target: 5 },
        ],
      },
      {
        name: "Checkpoint",
        tasks: [
          { id: "p5-check", text: "Landed an internship or job offer", checkpoint: true },
        ],
      },
    ],
  },
];
