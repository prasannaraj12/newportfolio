/**
 * NEURALVERSE content layer.
 * Source of truth: Prasanna Raj R — résumé (Prasannaraj_Resume.pdf).
 * Do not add claims, metrics or statistics that are not in the résumé.
 */

export const profile = {
  name: "Prasanna Raj R",
  firstName: "Prasanna",
  lastName: "Raj R",
  role: "AI / ML Engineer",
  location: "Bengaluru, Karnataka, India",
  focus: ["Generative AI", "LLM Applications", "Agentic AI Systems"],
  summary:
    "AI/ML Engineer specializing in Generative AI, LLM applications, and Agentic AI systems, with hands-on experience building multi-agent pipelines, retrieval-augmented workflows, and fine-tuned open-weight language models.",
  summaryDetail:
    "Experienced in LangChain/LangGraph orchestration, QLoRA/PEFT fine-tuning, and backend AI engineering (FastAPI, Node.js). Pursuing B.E. in Artificial Intelligence & Machine Learning, VTU (2027).",
  links: {
    email: "prasannaraj.pr12@gmail.com",
    phone: "+91 7810096062",
    github: "https://github.com/prasannaraj12",
    linkedin: "https://www.linkedin.com/in/prasanna-raj-r-0b50a7282/",
  },
} as const;

export const education = {
  degree: "B.E. in Artificial Intelligence & Machine Learning",
  school: "Sri Sairam College of Engineering, Bengaluru",
  university: "VTU",
  year: "2027 (Expected)",
  cgpa: "7.975/10",
} as const;

export type Experience = {
  role: string;
  company: string;
  period: string;
  current?: boolean;
  points: string[];
};

export const experience: Experience[] = [
  {
    role: "Junior AI Engineer Intern",
    company: "Crawl Corp India Private Limited",
    period: "Jul 2026 — Present",
    current: true,
    points: [
      "Engineering CrawlNews and RentYourMate end-to-end — AI pipeline design, LLM fine-tuning, and full-stack development.",
    ],
  },
  {
    role: "Green Intern",
    company: "1M1B (1 Million for 1 Billion)",
    period: "Sep — Oct 2025",
    points: [
      "Contributed data-driven research to sustainability-focused technology initiatives serving 1M+ beneficiaries.",
    ],
  },
  {
    role: "Data Analyst Intern",
    company: "NoviTech R&D Private Limited",
    period: "Sep — Oct 2024",
    points: [
      "Built data-cleaning and visualization pipelines (Python, Pandas, Matplotlib), cutting preprocessing time 40% for recurring reporting cycles.",
    ],
  },
];

export type Project = {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  org?: string;
  description: string;
  stack: string[];
  /** Facts stated in the résumé, surfaced as highlights. */
  facts: string[];
};

export const projects: Project[] = [
  {
    id: "agentdb",
    index: "01",
    title: "AgentDB",
    subtitle: "Agentic AI Database Assistant",
    description:
      "A LangGraph ReAct pipeline with 5 custom LangChain tools — schema reader, SQL executor, chart generator, diagram renderer and insight generator — for autonomous reasoning over any SQLite database. Shipped via FastAPI, React/Vite and Docker.",
    stack: ["LangGraph", "LangChain", "FastAPI", "React", "Vite", "Docker", "SQLite"],
    facts: ["5 custom tools", "Response time: hours → under 2 s", "Validated across 50+ queries"],
  },
  {
    id: "qwen",
    index: "02",
    title: "Qwen Fine-Tuning",
    subtitle: "LLM Fine-Tuning — QLoRA / PEFT",
    description:
      "Fine-tuned an open-weight Qwen model end-to-end using Supervised Fine-Tuning with LoRA/QLoRA and PEFT (Unsloth, TRL, Hugging Face Transformers); applied bitsandbytes 4-bit quantization and validated outputs before deploying for optimized inference.",
    stack: ["SFT", "QLoRA", "PEFT", "Unsloth", "TRL", "Transformers", "bitsandbytes"],
    facts: ["End-to-end SFT", "4-bit quantization", "Deployed for optimized inference"],
  },
  {
    id: "crawlnews",
    index: "03",
    title: "CrawlNews",
    subtitle: "Multi-Agent News Intelligence Platform",
    org: "Crawl Corp",
    description:
      "An AI-agent pipeline for automated news collection, deduplication, event clustering, relevance filtering, fact verification and LLM-based summarization.",
    stack: ["Multi-Agent", "LLMs", "RSS", "Scheduling", "Summarization"],
    facts: ["31 RSS sources", "15-minute scheduled cycle", "Fact verification stage"],
  },
  {
    id: "rentyourmate",
    index: "04",
    title: "RentYourMate",
    subtitle: "Verified-Companion Marketplace Platform",
    org: "Crawl Corp",
    description:
      "A full-stack marketplace with secure booking and payment workflows, KYC / selfie verification, and role-based access.",
    stack: ["Flutter", "Node.js", "Express", "PostgreSQL", "Firebase"],
    facts: ["KYC / selfie verification", "Secure booking & payments", "Role-based access"],
  },
];

export type SkillGroup = { id: string; label: string; items: string[] };

export const skills: SkillGroup[] = [
  {
    id: "genai",
    label: "Generative AI / LLM",
    items: [
      "LLMs", "RAG", "Agentic AI", "Multi-Agent Systems", "LangChain", "LangGraph",
      "Prompt Engineering", "Tool/Function Calling", "LLM APIs", "Embeddings", "ChromaDB",
    ],
  },
  {
    id: "finetune",
    label: "LLM Fine-Tuning",
    items: ["SFT", "PEFT", "LoRA", "QLoRA", "Hugging Face Transformers", "TRL", "Unsloth", "bitsandbytes"],
  },
  {
    id: "aiml",
    label: "AI / ML",
    items: ["Machine Learning", "Deep Learning", "NLP", "Transformers", "XGBoost"],
  },
  {
    id: "backend",
    label: "Backend",
    items: [
      "FastAPI", "REST APIs", "Async Programming", "Node.js", "Express", "Docker",
      "SQLite", "PostgreSQL", "Convex",
    ],
  },
  { id: "lang", label: "Programming", items: ["Python", "SQL", "TypeScript", "JavaScript"] },
  { id: "frontend", label: "Frontend", items: ["React", "TypeScript", "Flutter", "Vite", "Tailwind CSS"] },
  {
    id: "tools",
    label: "Tools",
    items: ["Git", "GitHub", "n8n", "Pandas", "Matplotlib", "Power BI", "Tableau"],
  },
];

export const achievements = {
  hackathons: [
    { name: "Smart India Hackathon", year: "2024", tag: "National Finalist" },
    { name: "Advaya 2K25", year: "2025", tag: "National Finalist" },
    { name: "Vihansa", year: "2025", tag: "National Finalist" },
    { name: "iTech AI Innovation Hackathon", year: "2026", tag: "AI Innovation" },
  ],
  certifications: [
    { name: "Data Visualization: Empowering Business with Effective Insights", issuer: "Tata Group / Forage", year: "2025" },
    { name: "Databricks Fundamentals", issuer: "Databricks", year: "2025" },
    { name: "AI Fundamentals", issuer: "IBM", year: "2025" },
  ],
} as const;

export const nav = [
  { id: "about", label: "About" },
  { id: "work", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "achievements", label: "Achievements" },
  { id: "contact", label: "Contact" },
] as const;
