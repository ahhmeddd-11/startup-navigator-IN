export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  role: string;
  readingTime: number;
  updated: string;
  toc: { id: string; label: string }[];
  body: string[];
};

export type Scheme = {
  slug: string;
  name: string;
  ministry: string;
  category: string;
  eligibility: string[];
  benefits: string[];
  summary: string;
  website: string;
  status: "Open" | "Rolling" | "Closing soon";
};

export type Resource = {
  slug: string;
  title: string;
  type: "Template" | "Guide" | "Checklist" | "Toolkit";
  description: string;
  category: string;
  duration: string;
};

export const categories = [
  "Foundations",
  "Incorporation",
  "Funding",
  "Compliance",
  "Growth",
  "Product",
  "Hiring",
  "Taxation",
];

export const articles: Article[] = [
  {
    slug: "dpiit-recognition-explained",
    title: "DPIIT Recognition, explained end-to-end",
    excerpt:
      "A practical walkthrough of the DPIIT startup recognition process — eligibility, documents, and what changes once you're recognised.",
    category: "Incorporation",
    tags: ["DPIIT", "Startup India", "Compliance"],
    author: "Ananya Rao",
    role: "Regulatory Advisor",
    readingTime: 9,
    updated: "2026-06-04",
    toc: [
      { id: "why", label: "Why DPIIT recognition matters" },
      { id: "eligibility", label: "Eligibility criteria" },
      { id: "documents", label: "Documents required" },
      { id: "process", label: "Step-by-step process" },
      { id: "benefits", label: "Benefits after recognition" },
    ],
    body: [
      "DPIIT recognition is the gateway to most Startup India benefits — tax exemptions, self-certification for labour laws, and access to funding programs. For a young company, getting this right early avoids months of paperwork later.",
      "Eligibility is straightforward: your entity must be a Private Limited Company, LLP, or Registered Partnership, incorporated within the last 10 years, with turnover under ₹100 crore in any financial year since incorporation.",
      "The recognition application is filed on the Startup India portal. You'll need your Certificate of Incorporation, a short pitch or product description, and details of directors and founders. Approval typically takes 5–7 working days.",
      "Once recognised, you unlock Section 80-IAC income tax exemption (subject to IMB approval), angel tax exemption under Section 56, faster patent examination, and eligibility for the Fund of Funds for Startups.",
    ],
  },
  {
    slug: "seed-fund-scheme-guide",
    title: "Startup India Seed Fund Scheme: a founder's guide",
    excerpt:
      "SISFS provides up to ₹50 lakh in grants and debt. Here's how to structure your application and pick the right incubator.",
    category: "Funding",
    tags: ["SISFS", "Seed", "Grants"],
    author: "Rohan Mehta",
    role: "Venture Partner",
    readingTime: 12,
    updated: "2026-05-22",
    toc: [
      { id: "overview", label: "Scheme overview" },
      { id: "amounts", label: "Grant vs debt amounts" },
      { id: "incubators", label: "Choosing an incubator" },
      { id: "pitch", label: "Preparing the pitch" },
    ],
    body: [
      "SISFS is disbursed through DPIIT-approved incubators. Up to ₹20 lakh as a grant for proof-of-concept and up to ₹50 lakh as convertible debt for market entry, commercialisation, or scale-up.",
      "The scheme prioritises startups solving real problems with a functional prototype. Your application should demonstrate technical readiness, a clear go-to-market, and coachability.",
      "Pick incubators aligned with your sector. IIM Bangalore's NSRCEL, IIT Madras Incubation Cell, and T-Hub Hyderabad each have distinct thesis areas.",
      "The pitch is 12 minutes with 8 minutes of Q&A. Lead with the problem, show traction proof, and be explicit about how you'll deploy the capital across 12–18 months.",
    ],
  },
  {
    slug: "gst-basics-for-founders",
    title: "GST basics every early-stage founder should know",
    excerpt: "Registration thresholds, invoicing rules, and the compliance calendar that will keep you out of trouble.",
    category: "Taxation",
    tags: ["GST", "Compliance"],
    author: "Priya Nair",
    role: "Chartered Accountant",
    readingTime: 7,
    updated: "2026-05-10",
    toc: [
      { id: "when", label: "When to register" },
      { id: "invoicing", label: "Invoicing correctly" },
      { id: "returns", label: "Returns calendar" },
    ],
    body: [
      "GST registration is mandatory once your aggregate turnover crosses ₹20 lakh (₹10 lakh in special states) or if you sell across states, on marketplaces, or provide certain notified services.",
      "Every tax invoice must carry your GSTIN, place of supply, HSN/SAC code, and the applicable CGST/SGST or IGST breakdown. Automate this early — spreadsheets don't scale past a few dozen invoices.",
      "GSTR-1 is due monthly on the 11th (or quarterly under QRMP), GSTR-3B on the 20th. Late filing attracts interest at 18% p.a. plus late fees.",
    ],
  },
  {
    slug: "hiring-your-first-ten",
    title: "Hiring your first ten: playbook for founders",
    excerpt: "Structuring roles, negotiating equity, and running interview loops that actually predict performance.",
    category: "Hiring",
    tags: ["Team", "ESOPs"],
    author: "Vikram Shah",
    role: "Talent Advisor",
    readingTime: 11,
    updated: "2026-04-28",
    toc: [
      { id: "roles", label: "First ten roles" },
      { id: "equity", label: "Equity bands" },
      { id: "loops", label: "Interview loops" },
    ],
    body: [
      "Your first ten hires define culture. Resist the urge to hire senior generalists — early-stage teams win with owners who ship, not managers who plan.",
      "Typical seed-stage ESOP pool is 10–15%. Reserve 1.0–2.5% for a first engineer, 0.5–1.5% for early product/design, and 0.1–0.5% for functional specialists.",
      "Run structured loops: a work-sample task, a technical deep-dive, a values conversation, and a founder alignment call. Rate on evidence, not vibes.",
    ],
  },
  {
    slug: "product-market-fit-signals",
    title: "Reading real product-market fit signals",
    excerpt: "Beyond retention curves — the qualitative signals that tell you before the metrics do.",
    category: "Product",
    tags: ["PMF", "Product"],
    author: "Sana Kapoor",
    role: "Product Lead",
    readingTime: 8,
    updated: "2026-04-14",
    toc: [
      { id: "signals", label: "Leading signals" },
      { id: "pull", label: "The pull test" },
    ],
    body: [
      "PMF isn't a number. It's the moment users start pulling your product from you — asking for access, referring peers unprompted, working around missing features.",
      "The clearest leading signal is unforced usage growth from a single wedge segment. If growth needs constant sales effort, you're still searching.",
    ],
  },
  {
    slug: "raising-your-pre-seed",
    title: "Raising your pre-seed in India: 2026 edition",
    excerpt: "Investor landscape, realistic valuations, and how to run a two-week close.",
    category: "Funding",
    tags: ["Pre-seed", "Fundraising"],
    author: "Rohan Mehta",
    role: "Venture Partner",
    readingTime: 10,
    updated: "2026-06-11",
    toc: [
      { id: "landscape", label: "Investor landscape" },
      { id: "valuation", label: "Realistic valuations" },
      { id: "close", label: "Running a tight close" },
    ],
    body: [
      "The Indian pre-seed market has matured. Dedicated funds like Better Capital, All In Capital, and Neon Fund now write conviction-first cheques from ₹50L to ₹3Cr.",
      "Fair pre-seed valuations sit between ₹8–25Cr post-money depending on team pedigree, early traction, and sector tailwinds. Avoid anchoring on the outliers you read about.",
      "Run a compressed process. Warm intros in week one, first meetings in week two, term sheets by week three. Momentum closes rounds.",
    ],
  },
  {
    slug: "unit-economics-that-scale",
    title: "Unit economics that scale, not just spreadsheets that model",
    excerpt: "How to build a P&L narrative investors and operators both believe.",
    category: "Growth",
    tags: ["Metrics", "Unit economics"],
    author: "Aditya Iyer",
    role: "Growth Advisor",
    readingTime: 9,
    updated: "2026-03-30",
    toc: [
      { id: "cac", label: "Real CAC math" },
      { id: "payback", label: "Payback windows" },
    ],
    body: [
      "Blended CAC hides the truth. Split paid, organic, and referral, then track payback by cohort. Investors will do this in the DD anyway — do it first.",
      "Under 12-month payback earns you the right to spend. Over 18 months and you're funding growth from equity, not from customers.",
    ],
  },
  {
    slug: "compliance-calendar-2026",
    title: "The 2026 startup compliance calendar",
    excerpt: "ROC, GST, TDS, PT and ESIC — the recurring filings you cannot miss.",
    category: "Compliance",
    tags: ["ROC", "Compliance"],
    author: "Priya Nair",
    role: "Chartered Accountant",
    readingTime: 6,
    updated: "2026-02-18",
    toc: [{ id: "monthly", label: "Monthly filings" }, { id: "annual", label: "Annual filings" }],
    body: [
      "Monthly: GSTR-1 (11th), GSTR-3B (20th), TDS payment (7th), PF/ESIC (15th). Automate reminders — penalties compound fast.",
      "Annual: AOC-4 and MGT-7 for ROC, ITR-6 for the company, DIR-3 KYC for directors, and Form 11 for LLPs.",
    ],
  },
];

export const schemes: Scheme[] = [
  {
    slug: "startup-india-seed-fund",
    name: "Startup India Seed Fund Scheme",
    ministry: "DPIIT, Ministry of Commerce & Industry",
    category: "Funding",
    eligibility: [
      "DPIIT-recognised startup",
      "Incorporated less than 2 years ago at time of application",
      "Business idea with market fit potential",
    ],
    benefits: [
      "Up to ₹20 lakh grant for proof of concept",
      "Up to ₹50 lakh convertible debt for scale",
      "Access to a curated incubator network",
    ],
    summary: "Financial assistance for proof of concept, prototype, product trials, market entry and commercialisation.",
    website: "https://seedfund.startupindia.gov.in",
    status: "Rolling",
  },
  {
    slug: "credit-guarantee-scheme-startups",
    name: "Credit Guarantee Scheme for Startups (CGSS)",
    ministry: "DPIIT",
    category: "Funding",
    eligibility: ["DPIIT-recognised startup", "Loan sanctioned by member lending institution"],
    benefits: ["Collateral-free loans up to ₹10 crore", "Credit guarantee cover up to 85%"],
    summary: "Credit guarantees for loans extended to DPIIT-recognised startups by scheduled banks and NBFCs.",
    website: "https://www.startupindia.gov.in",
    status: "Open",
  },
  {
    slug: "section-80-iac",
    name: "Section 80-IAC Tax Exemption",
    ministry: "CBDT, Ministry of Finance",
    category: "Taxation",
    eligibility: [
      "DPIIT-recognised startup incorporated between 1 Apr 2016 and 31 Mar 2025",
      "Annual turnover under ₹100 crore",
      "IMB certification required",
    ],
    benefits: ["100% tax rebate on profits for 3 consecutive years out of the first 10 years"],
    summary: "Income tax exemption for eligible startups, subject to Inter-Ministerial Board approval.",
    website: "https://www.startupindia.gov.in/content/sih/en/reources/tax_exemption.html",
    status: "Open",
  },
  {
    slug: "atal-innovation-mission",
    name: "Atal Innovation Mission (AIM)",
    ministry: "NITI Aayog",
    category: "Innovation",
    eligibility: ["Early stage innovators, students, and startups working on frontier technologies"],
    benefits: [
      "Access to Atal Incubation Centres",
      "Grants of up to ₹10 crore over 5 years for incubators",
      "Mentor network and industry connect",
    ],
    summary: "Flagship innovation initiative promoting a culture of innovation and entrepreneurship.",
    website: "https://aim.gov.in",
    status: "Rolling",
  },
  {
    slug: "mudra-yojana",
    name: "Pradhan Mantri MUDRA Yojana",
    ministry: "Ministry of Finance",
    category: "Funding",
    eligibility: ["Non-corporate small business segment", "Micro enterprises with credit needs up to ₹10 lakh"],
    benefits: ["Loans up to ₹10 lakh under Shishu, Kishor and Tarun categories", "No collateral required"],
    summary: "Refinance support for micro-enterprises through banks, MFIs and NBFCs.",
    website: "https://www.mudra.org.in",
    status: "Rolling",
  },
  {
    slug: "sidbi-fund-of-funds",
    name: "Fund of Funds for Startups (FFS)",
    ministry: "SIDBI",
    category: "Funding",
    eligibility: ["SEBI-registered Alternative Investment Funds"],
    benefits: ["₹10,000 crore corpus deployed via AIFs into DPIIT-recognised startups"],
    summary: "Indirect capital support for Indian startups by contributing to SEBI-registered AIFs.",
    website: "https://www.sidbi.in",
    status: "Open",
  },
  {
    slug: "sisfs-women",
    name: "Stand-Up India",
    ministry: "Department of Financial Services",
    category: "Inclusion",
    eligibility: ["Women entrepreneurs and SC/ST entrepreneurs", "Greenfield enterprises"],
    benefits: ["Bank loans between ₹10 lakh and ₹1 crore", "Handholding support and margin money assistance"],
    summary: "Bank loans to promote entrepreneurship among women, SC and ST communities.",
    website: "https://www.standupmitra.in",
    status: "Rolling",
  },
  {
    slug: "digital-india-genesis",
    name: "Digital India GENESIS",
    ministry: "MeitY",
    category: "Innovation",
    eligibility: ["Tech startups from Tier-2 and Tier-3 cities"],
    benefits: ["Funding, mentorship and access to incubation infrastructure"],
    summary: "Support to tech entrepreneurs from smaller cities across India.",
    website: "https://www.meity.gov.in",
    status: "Closing soon",
  },
];

export const resources: Resource[] = [
  {
    slug: "founder-pitch-deck",
    title: "Founder pitch deck template (Seed edition)",
    type: "Template",
    description: "The 12-slide deck we've seen close over ₹400Cr in seed rounds — with detailed speaker notes.",
    category: "Funding",
    duration: "30 min",
  },
  {
    slug: "esop-planning-toolkit",
    title: "ESOP planning toolkit",
    type: "Toolkit",
    description: "Cap-table model, vesting schedules, and communication templates for a fair, motivating ESOP program.",
    category: "Hiring",
    duration: "45 min",
  },
  {
    slug: "incorporation-checklist",
    title: "Pvt Ltd incorporation checklist",
    type: "Checklist",
    description: "Everything from DSC to PAN, TAN, MSME and Startup India recognition — sequenced correctly.",
    category: "Incorporation",
    duration: "20 min",
  },
  {
    slug: "founding-team-agreement",
    title: "Founders' agreement template",
    type: "Template",
    description: "Equity vesting, IP assignment, decision rights, and exit terms — reviewed by Indian corporate counsel.",
    category: "Foundations",
    duration: "40 min",
  },
  {
    slug: "gtm-first-hundred-customers",
    title: "Getting to your first 100 customers",
    type: "Guide",
    description: "Channel-by-channel playbook for B2B, B2C, and marketplace startups in the Indian context.",
    category: "Growth",
    duration: "60 min",
  },
  {
    slug: "annual-compliance-calendar",
    title: "Annual compliance calendar",
    type: "Checklist",
    description: "Every ROC, tax, and labour filing your startup must complete this year, with due dates and owners.",
    category: "Compliance",
    duration: "15 min",
  },
];

export const suggestedPrompts = [
  "What are the tax benefits of DPIIT recognition?",
  "Compare Startup India Seed Fund vs MUDRA loan for a SaaS company",
  "How should I structure ESOPs at pre-seed?",
  "What compliance filings am I missing in my first year?",
  "Draft an outreach email for angel investors in fintech",
  "Explain Section 56 angel tax exemption in plain English",
];

export const seededConversations = [
  { id: "c1", title: "DPIIT recognition strategy", updated: "2h ago" },
  { id: "c2", title: "Seed round investor list", updated: "Yesterday" },
  { id: "c3", title: "GST for SaaS exports", updated: "3d ago" },
  { id: "c4", title: "Founders agreement review", updated: "1w ago" },
];
