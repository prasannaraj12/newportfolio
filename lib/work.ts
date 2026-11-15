/**
 * Selected Work — exhibition content.
 *
 * Sources (nothing here is invented):
 *  - Résumé: AgentDB, CrawlNews, RentYourMate bullets and Crawl Corp role.
 *  - Project READMEs: TRUST-CV (Block-Sentinal), SatQuery, RentYourMate
 *    (roles, Firebase Auth, Razorpay, admin KYC approvals).
 *  - Verified public repos only (HTTP 200): AgentDB, Block-Sentinal, SATQuery.
 * Where a personal contribution is not documented, the field is omitted.
 */

export type WorkProject = {
  id: "agentdb" | "crawlnews" | "rentyourmate" | "trustcv" | "satquery";
  number: string;
  name: string;
  tagline: string;
  context?: string;
  problem: string;
  built: string;
  architecture: string[];
  tech: string[];
  features: string[];
  contribution?: string;
  link?: { label: string; href: string };
};

export const work: WorkProject[] = [
  {
    id: "agentdb",
    number: "01",
    name: "AgentDB",
    tagline: "The intelligence engine.",
    problem:
      "Querying and visualizing a relational database usually means writing SQL by hand, hunting through the schema and building reports separately.",
    built:
      "An agentic database assistant: a LangGraph ReAct pipeline with five custom LangChain tools that reasons autonomously over any SQLite database.",
    architecture: ["Question", "LangGraph ReAct agent", "Five LangChain tools", "Answer, chart or diagram"],
    tech: ["LangGraph", "LangChain", "FastAPI", "React", "Vite", "Docker", "SQLite"],
    features: ["Response time: hours → under 2 seconds", "Validated across 50+ queries", "Works over any SQLite database"],
    contribution: "Architected the ReAct pipeline and its five tools, and shipped it via FastAPI, React/Vite and Docker.",
    link: { label: "GitHub — AgentDB", href: "https://github.com/prasannaraj12/AgentDB" },
  },
  {
    id: "crawlnews",
    number: "02",
    name: "CrawlNews",
    tagline: "The newsroom of the future.",
    context: "Crawl Corp India",
    problem:
      "Repetitive syndicated feeds and information overload make verification and unbiased summarization slow, manual work.",
    built:
      "A multi-agent news-intelligence pipeline that collects, deduplicates, clusters, filters, verifies and summarizes news on a schedule.",
    architecture: ["Collection", "Deduplication", "Event clustering", "Relevance filtering", "Fact verification", "LLM summarization"],
    tech: ["Multi-agent pipeline", "LLMs", "RSS ingestion", "Scheduling"],
    features: ["31 RSS sources", "15-minute scheduled cycle", "Fact-verification stage", "LLM-based summaries"],
    contribution: "Engineering it end-to-end at Crawl Corp — AI pipeline design and LLM work.",
  },
  {
    id: "rentyourmate",
    number: "03",
    name: "RentYourMate",
    tagline: "The architecture of trust.",
    context: "Crawl Corp India",
    problem:
      "Hiring a verified companion for a real-world service only works if customers and companions can both trust the booking.",
    built:
      "A full-stack verified-companion marketplace: Flutter apps, a Flutter Web admin panel and a Node.js / Express backend.",
    architecture: ["Flutter apps", "Node.js · Express API", "PostgreSQL", "Firebase Auth · Razorpay"],
    tech: ["Flutter", "Node.js", "Express", "PostgreSQL", "Firebase", "Razorpay"],
    features: ["KYC / selfie verification", "Secure booking and payment workflows", "Role-based access", "Admin KYC approvals and dispute resolution"],
    contribution: "Engineering it end-to-end at Crawl Corp — full-stack development.",
  },
  {
    id: "trustcv",
    number: "04",
    name: "TRUST-CV",
    tagline: "A secure digital evidence vault.",
    context: "Smart India Hackathon — SIH26228",
    problem:
      "Computer-vision datasets, model weights and inference results can be silently tampered with — and in air-gapped environments there is no cloud service to vouch for them.",
    built:
      "An air-gapped, zero-trust assurance platform that keeps a cryptographic chain of custody from dataset ingestion to signed inference provenance.",
    architecture: ["Evidence ingestion", "Cryptographic hashing", "Chain of custody", "Integrity verification", "Signed assurance report"],
    tech: ["Python", "SHA-256 Merkle trees", "ECDSA", "SQLite", "NumPy", "Computer Vision"],
    features: ["Runs fully offline (air-gapped)", "Hash-chained evidence records", "Model identity hashing", "Signed inference provenance"],
    link: { label: "GitHub — Block-Sentinal", href: "https://github.com/prasannaraj12/Block-Sentinal" },
  },
  {
    id: "satquery",
    number: "05",
    name: "SatQuery AI",
    tagline: "Intelligence from above.",
    context: "Smart India Hackathon — problem statement 26167",
    problem:
      "Standard vision models only understand three-band RGB, but Earth-observation data carries near-infrared, short-wave infrared and SAR bands.",
    built:
      "A multimodal remote-sensing assistant for visual question answering, grounding and captioning, with optical + SAR reasoning and bi-temporal change analysis.",
    architecture: ["GeoTIFF ingestion", "Optical / SAR classification", "Multispectral encoder", "Agentic reasoning", "VQA · grounding · captioning"],
    tech: ["PyTorch", "GeoTIFF", "BigEarthNet-19", "Sentinel-2", "SAR", "Docker"],
    features: ["CRS, resolution and band metadata extraction", "Optical vs. SAR modality detection", "19-class land-cover adaptation", "Bi-temporal change analysis"],
    link: { label: "GitHub — SATQuery", href: "https://github.com/prasannaraj12/SATQuery" },
  },
];
