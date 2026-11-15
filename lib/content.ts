/**
 * Portfolio content layer — Prasanna Raj R.
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
    { name: "iTech AI Innovation Hackathon", year: "2026", tag: "Hackathon" },
  ],
  certifications: [
    { name: "Data Visualization: Empowering Business with Effective Insights", issuer: "Tata Group / Forage", year: "2025" },
    { name: "Databricks Fundamentals", issuer: "Databricks", year: "2025" },
    { name: "AI Fundamentals", issuer: "IBM", year: "2025" },
  ],
} as const;

export const brand = {
  mark: "PRASANNA.",
  monogram: "PR",
  edition: "Personal Portfolio · 2026",
  index: "Portfolio / 001",
} as const;

export const hero = {
  statement: "Building what comes next.",
  role: "AI Engineer",
  disciplines: "AI Engineer · Generative AI · Intelligent Systems",
  tagline: "Building Intelligent, Real-World AI Solutions.",
  headline: "I turn ambitious ideas into intelligent systems.",
  intro:
    "I specialise in generative AI, LLM applications and agentic systems — multi-agent pipelines, retrieval workflows and fine-tuned open-weight models.",
} as const;

export const resumeUrl = "/Prasanna-Raj-R-Resume.pdf";

export const portraits = {
  /**
   * HERO PORTRAIT SLOT — replace with the original high-resolution photograph
   * (e.g. /images/portraits/original/prasanna.jpg) and update w/h. The current
   * file is a 600×451 crop of a generated image and is shown near native size.
   */
  hero: {
    src: "/images/portraits/edit/hero-tall.webp",
    w: 400,
    h: 451,
    position: "50% 30%",
    placeholder: true,
  },
  monochrome: { src: "/images/portraits/edit/monochrome.webp", w: 796, h: 470 },
  doubleExposure: { src: "/images/portraits/edit/double-exposure.webp", w: 836, h: 451 },
  studio: { src: "/images/portraits/edit/studio.webp", w: 814, h: 451 },
} as const;

/** Perspective statements — each one maps to work listed in the résumé. */
export const perspective = [
  { lead: "Agents", rest: "that reason.", ref: "AgentDB — LangGraph ReAct" },
  { lead: "Models", rest: "that adapt.", ref: "Qwen — QLoRA / PEFT" },
  { lead: "Pipelines", rest: "that keep watch.", ref: "CrawlNews — 15-minute cycle" },
] as const;

export const nav = [
  { id: "ideas", label: "Ideas", n: "01" },
  { id: "journey", label: "About", n: "02" },
  { id: "experience", label: "Experience", n: "02b" },
  { id: "laboratory", label: "Work", n: "03" },
  { id: "intelligence", label: "Skills", n: "04" },
  { id: "recognition", label: "Recognition", n: "05" },
  { id: "connection", label: "Contact", n: "06" },
] as const;

/* ───────────── Exhibition diagram data (Laboratory) ───────────── */

export const agentdbTools = [
  { id: "schema", name: "Schema reader", does: "Reads tables and columns of the connected SQLite database." },
  { id: "sql", name: "SQL executor", does: "Runs the query the agent composed and returns rows." },
  { id: "chart", name: "Chart generator", does: "Turns result sets into charts." },
  { id: "diagram", name: "Diagram renderer", does: "Renders database structure as a diagram." },
  { id: "insight", name: "Insight generator", does: "Summarizes what the results mean." },
] as const;

export const qwenStages = [
  { id: "base", name: "Open-weight Qwen", tool: "Hugging Face Transformers", does: "Load the base model; its weights stay frozen." },
  { id: "quant", name: "4-bit quantization", tool: "bitsandbytes", does: "Quantize the frozen weights to 4-bit to cut memory." },
  { id: "lora", name: "LoRA adapters", tool: "PEFT", does: "Attach small low-rank adapter matrices — the only trainable parameters." },
  { id: "sft", name: "Supervised fine-tuning", tool: "TRL · Unsloth", does: "Train the adapters on instruction data (QLoRA)." },
  { id: "deploy", name: "Validate & deploy", tool: "Inference", does: "Validate outputs, then deploy for optimized inference." },
] as const;

export const crawlStages = [
  { id: "collect", name: "Collect", does: "Pull articles from 31 RSS sources." },
  { id: "dedupe", name: "Deduplicate", does: "Drop repeated stories." },
  { id: "cluster", name: "Cluster", does: "Group articles into events." },
  { id: "filter", name: "Filter", does: "Keep what is relevant." },
  { id: "verify", name: "Verify", does: "Fact-verification stage." },
  { id: "summarize", name: "Summarize", does: "LLM-based summaries." },
] as const;

export const rymLayers = [
  { id: "client", name: "Client", tech: "Flutter" },
  { id: "api", name: "API", tech: "Node.js · Express" },
  { id: "data", name: "Data & auth", tech: "PostgreSQL · Firebase" },
] as const;

export const rymTrust = [
  { id: "kyc", name: "KYC", does: "Identity verification." },
  { id: "selfie", name: "Selfie check", does: "Selfie verification against the profile." },
  { id: "roles", name: "Role-based access", does: "Permissions scoped per role." },
  { id: "booking", name: "Booking", does: "Secure booking workflow." },
  { id: "payment", name: "Payment", does: "Secure payment workflow." },
] as const;


/* ───────────── Archive (additional projects) ─────────────
   Source: project READMEs and the owner's previous portfolio data.
   Only descriptions and pipeline stages are used — no unverified results. */

export type ArchiveProject = {
  id: string;
  title: string;
  subtitle: string;
  domain: string;
  context?: string;
  overview: string;
  pipeline: string[];
  stack: string[];
  link?: { label: string; href: string };
};

export const archive: ArchiveProject[] = [
  {
    id: "qwen",
    title: "Qwen Fine-Tuning",
    subtitle: "LLM fine-tuning with QLoRA / PEFT",
    domain: "Generative AI · Fine-tuning",
    overview:
      "Fine-tuned an open-weight Qwen model end-to-end using supervised fine-tuning with LoRA/QLoRA and PEFT, applied bitsandbytes 4-bit quantization and validated outputs before deploying for optimized inference.",
    pipeline: ["Open-weight Qwen base", "4-bit quantization (bitsandbytes)", "LoRA adapters (PEFT)", "Supervised fine-tuning (TRL · Unsloth)", "Validate & deploy"],
    stack: ["Hugging Face Transformers", "PEFT", "TRL", "Unsloth", "bitsandbytes"],
  },
  {
    id: "trust-cv",
    title: "TRUST-CV",
    subtitle: "Zero-trust computer-vision integrity assurance",
    domain: "Computer Vision · Security",
    context: "Smart India Hackathon — SIH26228",
    overview:
      "An air-gapped assurance platform that keeps a cryptographic chain of custody across a computer-vision pipeline — from dataset ingestion to model identity to signed inference provenance.",
    pipeline: [
      "Dataset ingestion & Merkle sealing",
      "Training-data integrity checks",
      "Model identity hashing",
      "Behavioural fingerprinting",
      "Signed inference provenance",
      "Assurance reports",
    ],
    stack: ["Python", "SHA-256 Merkle trees", "ECDSA", "SQLite", "NumPy", "Computer Vision"],
    link: { label: "GitHub — Block-Sentinal", href: "https://github.com/prasannaraj12/Block-Sentinal" },
  },
  {
    id: "satquery",
    title: "SatQuery AI",
    subtitle: "Remote-sensing vision-language assistant",
    domain: "Computer Vision · Vision-Language",
    context: "Smart India Hackathon — problem statement 26167",
    overview:
      "A multimodal assistant for remote-sensing imagery: visual question answering, grounding and captioning, optical + SAR reasoning and bi-temporal change analysis.",
    pipeline: [
      "GeoTIFF ingestion & metadata",
      "Optical / SAR modality classification",
      "Multispectral encoder (BigEarthNet adaptation)",
      "Agentic reasoning tools",
      "VQA · grounding · captioning",
    ],
    stack: ["PyTorch", "GeoTIFF", "BigEarthNet", "Multispectral", "SAR", "Docker"],
    link: { label: "GitHub — SATQuery", href: "https://github.com/prasannaraj12/SATQuery" },
  },
  {
    id: "fakeo",
    title: "Fakeo",
    subtitle: "Multimodal misinformation detection",
    domain: "Machine Learning · NLP",
    overview:
      "Fake-news detection across raw text and screenshots: OCR extracts text from images, spaCy picks out entities, and a TF-IDF + XGBoost classifier scores the claim.",
    pipeline: ["Text or screenshot input", "OCR (pytesseract)", "Named entities (spaCy)", "TF-IDF features", "XGBoost classifier", "Flask API"],
    stack: ["XGBoost", "TF-IDF", "pytesseract", "spaCy", "Flask", "Python"],
  },
  {
    id: "urbanbloom",
    title: "UrbanBloom AI",
    subtitle: "Smart irrigation and soil-moisture system",
    domain: "IoT · Applied AI",
    overview:
      "An ESP32-based irrigation system: soil-moisture sensing drives relay-controlled pumps, while telemetry feeds a Gemini-assisted app.",
    pipeline: ["Soil-moisture sensors", "ESP32 / Arduino controller", "Relay & pump actuation", "Wi-Fi telemetry", "Gemini integration", "Mobile & web UI"],
    stack: ["ESP32", "Arduino", "C++", "React Native", "Gemini"],
  },
  {
    id: "pocketai",
    title: "PocketAI",
    subtitle: "Portable, offline local-LLM desktop assistant",
    domain: "Generative AI · On-device",
    overview:
      "A self-contained local LLM that runs from a USB drive on an ordinary Windows laptop — CPU inference with llama.cpp and a quantized Qwen2.5 model, no GPU or install required.",
    pipeline: ["USB launcher", "Hardware readiness check", "llama.cpp runtime (CPU)", "Qwen2.5 GGUF model", "Desktop assistant UI"],
    stack: ["llama.cpp", "Qwen2.5 (GGUF)", "Windows", "Local inference"],
  },
  {
    id: "player-reid",
    title: "Player Re-Identification",
    subtitle: "Sports tracking and re-identification",
    domain: "Computer Vision",
    overview:
      "Detects players with YOLOv5 and keeps their identities across frames with DeepSORT appearance embeddings and Kalman-filter tracking.",
    pipeline: ["Video frames", "YOLOv5 detection", "Appearance embeddings", "Association", "Kalman tracking", "Re-ID annotation"],
    stack: ["YOLOv5", "DeepSORT", "PyTorch", "OpenCV"],
  },
  {
    id: "chest-xray",
    title: "Chest X-Ray AI",
    subtitle: "Radiograph classification with explainability",
    domain: "Computer Vision · Medical imaging (research)",
    overview:
      "A research pipeline combining U-Net lung segmentation, DenseNet121 classification and Grad-CAM heatmaps so predictions come with visual evidence.",
    pipeline: ["Radiograph input", "U-Net lung segmentation", "DenseNet121 classification", "Grad-CAM saliency", "Heatmap overlay"],
    stack: ["PyTorch", "U-Net", "DenseNet121", "Grad-CAM", "OpenCV"],
  },
];

/* ───────────── The Doors of Experience ─────────────
   Every statement below is taken from the résumé (internship entries
   and the CrawlNews / RentYourMate project lines). */

export type DoorPanel = { id: string; kicker: string; title: string; body: string; points?: string[] };

export type ExperienceDoor = {
  id: string;
  number: string;
  plate: string;
  company: string;
  role: string;
  period: string;
  environment: string;
  summary: string;
  /** Tools named on the résumé for this role (omitted when none are). */
  tech?: string[];
  panels: DoorPanel[];
};

export const doors: ExperienceDoor[] = [
  {
    id: "crawlcorp",
    number: "01",
    plate: "01 · CRAWL CORP",
    company: "Crawl Corp India Private Limited",
    role: "Junior AI Engineer Intern",
    period: "Jul 2026 — Present",
    environment: "The Intelligence Studio",
    summary:
      "Engineering CrawlNews and RentYourMate end-to-end — AI pipeline design, LLM fine-tuning, and full-stack development.",
    tech: ["LLMs", "Multi-agent pipelines", "Flutter", "Node.js", "Express", "PostgreSQL", "Firebase"],
    panels: [
      {
        id: "crawlnews",
        kicker: "Exhibit A — CrawlNews",
        title: "A multi-agent news intelligence pipeline",
        body: "An AI-agent pipeline across 31 RSS sources on a 15-minute scheduled cycle.",
        points: ["Collection", "Deduplication", "Event clustering", "Relevance filtering", "Fact verification", "LLM summarization"],
      },
      {
        id: "rentyourmate",
        kicker: "Exhibit B — RentYourMate",
        title: "A verified-companion marketplace",
        body: "Full-stack: Flutter, Node.js / Express, PostgreSQL and Firebase — with secure booking and payment workflows, KYC / selfie verification and role-based access.",
        points: ["Flutter client", "Node.js · Express API", "PostgreSQL · Firebase"],
      },
      {
        id: "practice",
        kicker: "Exhibit C — Engineering practice",
        title: "Three disciplines, end-to-end",
        body: "The work at Crawl Corp spans the whole stack of an AI product.",
        points: ["AI pipeline design", "LLM fine-tuning", "Full-stack development"],
      },
    ],
  },
  {
    id: "1m1b",
    number: "02",
    plate: "02 · 1M1B",
    company: "1M1B (1 Million for 1 Billion)",
    role: "Green Intern",
    period: "Sep — Oct 2025",
    environment: "The Sustainability Gallery",
    summary:
      "Contributed data-driven research to sustainability-focused technology initiatives serving 1M+ beneficiaries.",
    panels: [
      {
        id: "green",
        kicker: "Green internship",
        title: "Research for sustainability-focused technology",
        body: "Contributed data-driven research to sustainability-focused technology initiatives.",
        points: ["Data-driven research", "Sustainability-focused technology initiatives", "Initiatives serving 1M+ beneficiaries"],
      },
    ],
  },
  {
    id: "novitech",
    number: "03",
    plate: "03 · NOVITECH",
    company: "NoviTech R&D Private Limited",
    role: "Data Analyst Intern",
    period: "Sep — Oct 2024",
    environment: "The Data Laboratory",
    summary:
      "Built data-cleaning and visualization pipelines (Python, Pandas, Matplotlib), cutting preprocessing time 40% for recurring reporting cycles.",
    tech: ["Python", "Pandas", "Matplotlib"],
    panels: [
      {
        id: "data",
        kicker: "Data cleaning & visualization",
        title: "From raw data to clear reporting",
        body: "Built data-cleaning and visualization pipelines for recurring reporting cycles.",
        points: ["Python", "Pandas", "Matplotlib", "Data-cleaning pipelines", "Visualization pipelines", "Preprocessing time cut by 40%"],
      },
    ],
  },
];
