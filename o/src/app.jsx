// src/App.jsx
import React, { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/*
  App.jsx - Affiliate Microsite (Multi-step wizard)
  - Dependencies: html2canvas, jspdf
  - Usage: save as src/App.jsx in a Vite/React project
*/

// Categories & field labels (must match keys used in answers)
const categories = [
  {
    id: 1,
    title: "Affiliate Product Idea Helper",
    fields: [
      "Questions people ask me are…",
      "My hobbies are…",
      "I’m well researched in…",
      "I’m good at…",
      "I’ve had good results with…",
      "My transformation story is…",
    ],
  },
  {
    id: 2,
    title: "Validate Your Affiliate Product Idea",
    fields: [
      "My idea is…",
      "My target audience is…",
      "The problem they have is…",
      "Current solutions are…",
      "What makes my idea unique is…",
      "They would be willing to pay…",
    ],
  },
  {
    id: 3,
    title: "Affiliate Product Content & Promotion Outline",
    fields: [
      "The main outcome I want my audience to achieve is…",
      "The big 3–5 steps they need to take are…",
      "The format I want (PDF, video, toolkit, etc.) is…",
    ],
  },
  {
    id: 4,
    title: "Affiliate Product Pricing & Commission Strategy",
    fields: [
      "The transformation I’m providing is…",
      "The value of this transformation is…",
      "Competitors charge around…",
      "My audience income level is…",
    ],
  },
  {
    id: 5,
    title: "Make Your Affiliate Offer Irresistible",
    fields: [
      "The unique promise of my product is…",
      "The objections my audience has are…",
      "The emotional benefit is…",
      "The bonuses I can add are…",
    ],
  },
];

// Example prefill (Canva Pro) - optional: used when user clicks "Reset to Example"
const defaultPrefill = {
  1: {
    "Questions people ask me are…": "How can I design social posts quickly? What templates work for my niche?",
    "My hobbies are…": "Content creation, teaching design hacks, travel photography",
    "I’m well researched in…": "Design tools, content marketing, social media growth",
    "I’m good at…": "Explaining design basics, creating templates",
    "I’ve had good results with…": "Increasing engagement using template-based posts",
    "My transformation story is…": "Went from hiring designers to producing polished designs alone using Canva Pro",
  },
  2: {
    "My idea is…": "Promote Canva Pro via tutorial funnels + exclusive template bonuses",
    "My target audience is…": "Freelancers, small business owners, marketers",
    "The problem they have is…": "No time, limited budget for design, lack of skills",
    "Current solutions are…": "Hiring freelancers, Photoshop with steep learning curve, free limited tools",
    "What makes my idea unique is…": "Niche template packs + step-by-step onboarding",
    "They would be willing to pay…": "$12.99/month (Pro subscription) or similar",
  },
  3: {
    "The main outcome I want my audience to achieve is…": "Create professional visuals quickly and consistently",
    "The big 3–5 steps they need to take are…": "1) Sign up 2) Pick template 3) Customize 4) Publish",
    "The format I want (PDF, video, toolkit, etc.) is…": "Short tutorials (TikTok), long-form tutorial (YouTube), PDF template pack",
  },
  4: {
    "The transformation I’m providing is…": "From design overwhelm to publish-ready visuals in minutes",
    "The value of this transformation is…": "Saves $500–$2000/year vs outsourcing; saves hours weekly",
    "Competitors charge around…": "Adobe Suite $20–$50/month; freelance designers $50–$200 per piece",
    "My audience income level is…": "Small biz owners and creators (mid-income)",
  },
  5: {
    "The unique promise of my product is…": "Design like a pro in minutes with Canva Pro + exclusive templates",
    "The objections my audience has are…": "I can use free tools; subscription fatigue; I don't have time to learn",
    "The emotional benefit is…": "Confidence, pride, professional-looking brand visuals",
    "The bonuses I can add are…": "50 niche-ready templates, quick-start guide, onboarding video",
  },
};

// Helper: sanitize text for safe HTML insertion
function escapeHtml(unsafe = "") {
  return String(unsafe)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Convert point sizes to px (1pt ≈ 1.3333px) used for CSS in generated HTML
const ptToPx = (pt) => Math.round(pt * 1.333333);

// Generate category HTML (used for Results View and PDF capture)
function generateCategoryHTML(categoryIndex, data = {}) {
  // Ensure `data` has fields; use placeholders when missing
  const get = (key, fallback = "") => escapeHtml(data[key] ?? fallback);

  // CSS for the generated page (matches PDF style)
  const css = `
    body { font-family: "Calibri", "Arial", sans-serif; color: #111; padding: 28px; }
    .container { max-width: 800px; margin: auto; }
    h1 { font-size: ${ptToPx(26)}px; font-weight: 700; margin-bottom: 8px; }
    h2 { font-size: ${ptToPx(22)}px; font-weight: 700; margin-top: 18px; margin-bottom: 8px; }
    h3 { font-size: ${ptToPx(14)}px; font-weight: 700; margin-top: 12px; margin-bottom: 6px; }
    p, li { font-size: ${ptToPx(14)}px; line-height: 1.6; margin-bottom: 10px; }
    .section { margin-bottom: 14px; }
    .roadmap .item { margin-bottom: 8px; }
    .mono { font-family: "Courier New", monospace; font-size: ${ptToPx(12)}px; }
    .bold { font-weight: 700; }
  `;

  // Build deep-dive and roadmap & narrative depending on category index
  let headerTitle = "";
  let deepDiveHtml = "";
  let roadmapHtml = "";
  let narrativeHtml = "";

  if (categoryIndex === 1) {
    headerTitle = "Affiliate Product Idea Helper";
    deepDiveHtml = `
      <div class="section">
        <h2><span class="bold">Output: Professional Deep-Dive Analysis</span></h2>
        <h3 class="bold">A.1. Core Value Proposition</h3>
        <p>${get("Questions people ask me…", "Users want fast, affordable design solutions")} — this signals the primary demand and result people seek.</p>

        <h3 class="bold">A.2. Target Audience Insights</h3>
        <p>A.2.1 Freelancers — ${get("My hobbies are…", "") || "interested in quick client deliverables"}.<br/>
           A.2.2 Small business owners — ${get("I’m well researched in…", "") || "need affordable, branded assets"}.<br/>
           A.2.3 Marketers & creators — ${get("I’m good at…", "") || "need fast campaign creatives"}.</p>

        <h3 class="bold">A.3. Pain Points Solved</h3>
        <p>1) Lack of design skills; 2) Limited budget; 3) Time constraints. Your product addresses these directly.</p>

        <h3 class="bold">A.4. Unique Differentiators</h3>
        <p>${get("What makes this product stand out compared to others is…", "Template library, collaboration, ease of use, pricing")}</p>

        <h3 class="bold">A.5. Affiliate Positioning Strategy</h3>
        <p>Position messaging around: \"Save time, save money, look professional\" and use your transformation story (${get("My transformation story is…", "")}) as social proof. Offer exclusive niche-ready templates as bonuses.</p>

        <h3 class="bold">A.6. Success Roadmap for Affiliates</h3>
        <p>Content strategy: tutorials + templates. Target audiences: freelancers & SMBs. Funnel: Lead magnet → Email nurture → Tutorial → Affiliate conversion + bonus.</p>

        <h3 class="bold">A.7. Revenue Potential</h3>
        <p>Estimate commission per conversion × conversions/month. Example: 10/mo → modest supplemental income, scale via content to 50–200 conversions for meaningful revenue.</p>
      </div>
    `;

    roadmapHtml = `
      <div class="section roadmap">
        <h3 class="bold">🚀 Roadmap to Affiliate Product Idea</h3>
        <div class="item"><strong>Week 0:</strong> Define 3–4 audience segments and core pain points.</div>
        <div class="item"><strong>Week 1:</strong> Publish 2–3 short tutorials answering common questions.</div>
        <div class="item"><strong>Week 2:</strong> Create lead magnet (template pack) and landing page.</div>
        <div class="item"><strong>Week 3:</strong> Launch organic campaign and collect feedback.</div>
        <div class="item"><strong>Month 2–3:</strong> Scale content cadence and optimize top-performing funnels.</div>
        <div class="item"><strong>Month 4–6:</strong> Build authority resources (mini-course, toolkit) and aim for $2k–$5k/mo.</div>
      </div>
    `;

    const paragraphs = [
      `Start by clarifying the core value proposition: the simpler and faster the tool appears, the easier it is to convert busy creators.`,
      `Segment your audience and tailor messages — freelancers, small business owners, and marketers each respond to different hooks.`,
      `Use real-world examples and short before/after cases to demonstrate the practical benefits and time savings.`,
      `Create tangible bonuses (templates, quick-start guides) to increase the perceived value when people sign up via your affiliate link.`,
      `Repurpose long-form tutorials into short clips and email sequences to maximize the reach of a single creation.`,
      `Track your KPIs (clicks, conversion rate, LTV) and iterate every 2–4 weeks—this will shift you from experimentation to predictable revenue.`
    ];
    narrativeHtml = paragraphs.map(p => `<p>${p}</p>`).join("\n");
  }

  else if (categoryIndex === 2) {
    headerTitle = "Validate Your Affiliate Product Idea";
    deepDiveHtml = `
      <div class="section">
        <h2 class="bold">Output: Professional Deep-Dive Analysis</h2>
        <h3 class="bold">A.1. Demand Validation</h3>
        <p>Your idea: ${get("My idea is…", "")}. Target audience: ${get("My target audience is…", "")}. This indicates initial alignment.</p>

        <h3 class="bold">A.2. Audience Fit</h3>
        <p>Their primary problem is ${get("The problem they have is…", "")} which suggests clear purchase intent for fast solutions.</p>

        <h3 class="bold">A.3. Competitive Landscape</h3>
        <p>Existing solutions: ${get("Current solutions are…", "")}. Identify gaps and position yours to fill them.</p>

        <h3 class="bold">A.4. Uniqueness & Positioning</h3>
        <p>Your uniqueness: ${get("What makes my idea unique is…", "")}. Use niche focus + bonus assets to stand out.</p>

        <h3 class="bold">A.5. Pricing Feasibility</h3>
        <p>Expected willingness to pay: ${get("They would be willing to pay…", "")}. Test price points via small offers.</p>

        <h3 class="bold">A.6. Risk Assessment</h3>
        <p>Risks: saturation, program policy changes, audience mismatch. Mitigate by narrowing niche and building an email list.</p>

        <h3 class="bold">A.7. Recommendation</h3>
        <p>Validated if early tests show consistent CTR → lead conversions. Prioritize organic tests before scaling paid ads.</p>
      </div>
    `;

    roadmapHtml = `
      <div class="section roadmap">
        <h3 class="bold">🚀 Roadmap to Validation</h3>
        <div class="item"><strong>Week 1:</strong> Survey audience, research keywords and competitors.</div>
        <div class="item"><strong>Week 2:</strong> Publish validation content + lead magnet and track CTR.</div>
        <div class="item"><strong>Week 3:</strong> Run small paid test or boosted post for top-performing creative.</div>
        <div class="item"><strong>Week 4:</strong> Review conversion metrics; double down on winners.</div>
        <div class="item"><strong>Month 2–3:</strong> Build funnel and expand to additional platforms.</div>
      </div>
    `;

    const paragraphs = [
      `Validation reduces wasted effort and ensures product-market fit before scaling.`,
      `Measure real behavior (clicks, sign-ups) rather than vanity metrics to inform decisions.`,
      `Narrow niche targeting improves conversion and reduces direct affiliate competition.`,
      `Use bonuses and proof of results to make the offer more compelling during tests.`,
      `Iterate creatives quickly—small changes to hook or CTA often change conversion significantly.`,
      `Document findings and scale the channels that produce predictable ROI.`
    ];
    narrativeHtml = paragraphs.map(p => `<p>${p}</p>`).join("\n");
  }

  else if (categoryIndex === 3) {
    headerTitle = "Affiliate Product Content & Promotion Outline";
    deepDiveHtml = `
      <div class="section">
        <h2 class="bold">Output: Professional Deep-Dive Analysis</h2>
        <h3 class="bold">A.1. Content Strategy</h3>
        <p>Main outcome: ${get("The main outcome I want my audience to achieve is…", "")}.</p>

        <h3 class="bold">A.2. Content Formats</h3>
        <p>Formats: ${get("The format I want (PDF, video, toolkit, etc.) is…", "")} — combine short-form reach + long-form conversion content.</p>

        <h3 class="bold">A.3. Value Ladder</h3>
        <p>Start free (lead magnet) → mid-tier (template packs) → high-ticket (mini-course or workshop).</p>

        <h3 class="bold">A.4. Funnel Design</h3>
        <p>Top: social + SEO. Middle: lead magnet + email nurture. Bottom: conversion page with bonus claim flow.</p>

        <h3 class="bold">A.5. Platform Selection</h3>
        <p>Focus on platforms where tutorials convert (YouTube, TikTok, blog SEO) and repurpose efficiently.</p>

        <h3 class="bold">A.6. Promotion Calendar</h3>
        <p>Plan consistent cadence: 2 tutorials/month, 2–3 shorts/week, weekly email.</p>
      </div>
    `;

    roadmapHtml = `
      <div class="section roadmap">
        <h3 class="bold">🚀 Roadmap to Content & Promotion</h3>
        <div class="item"><strong>Week 1:</strong> Map content themes and lead magnet.</div>
        <div class="item"><strong>Week 2:</strong> Produce first tutorials and template bundle.</div>
        <div class="item"><strong>Week 3:</strong> Build landing page + email sequence.</div>
        <div class="item"><strong>Week 4:</strong> Launch and collect feedback.</div>
        <div class="item"><strong>Month 2–3:</strong> Scale with repurposing and cross-collabs.</div>
      </div>
    `;

    const paragraphs = [
      `Content is the most reliable engine for consistent affiliate conversions.`,
      `Diversify formats to meet users where they consume (short-form for discovery, long-form for trust).`,
      `Lead magnets should be immediately useful and plug-and-play to capture emails fast.`,
      `Use email sequences to turn casual leads into buyers via value-first nurture.`,
      `Repurpose every long piece into multiple short assets to maximize ROI from production work.`,
      `Measure which topics drive signups and double down on those to scale effectively.`
    ];
    narrativeHtml = paragraphs.map(p => `<p>${p}</p>`).join("\n");
  }

  else if (categoryIndex === 4) {
    headerTitle = "Affiliate Product Pricing & Commission Strategy";
    deepDiveHtml = `
      <div class="section">
        <h2 class="bold">Output: Professional Deep-Dive Analysis</h2>
        <h3 class="bold">A.1. Transformation Value</h3>
        <p>${get("The transformation I’m providing is…", "")} — articulate savings and time reclaimed as dollars/hours.</p>

        <h3 class="bold">A.2. Competitive Pricing Benchmark</h3>
        <p>Competitors: ${get("Competitors charge around…", "")}. Use direct comparisons to show ROI for the subscription.</p>

        <h3 class="bold">A.3. Perceived Value Enhancement</h3>
        <p>Bundle bonuses (templates, mini-guides) to raise perceived value above asking price.</p>

        <h3 class="bold">A.4. Commission Analysis</h3>
        <p>Model monthly conversion scenarios and required traffic to reach $500, $2k, $5k per month in commissions.</p>

        <h3 class="bold">A.5. Pricing Tier Strategy</h3>
        <p>Frame as Free → Pro → VIP (with your exclusive bonuses) to increase mid-tier uptake.</p>

        <h3 class="bold">A.6. Audience Affordability</h3>
        <p>Audience income: ${get("My audience income level is…", "")} — ensure price framing as business ROI (expense that pays back).</p>
      </div>
    `;

    roadmapHtml = `
      <div class="section roadmap">
        <h3 class="bold">🚀 Roadmap to Pricing & Commission Strategy</h3>
        <div class="item"><strong>Week 1:</strong> Build pricing comparison and ROI case studies.</div>
        <div class="item"><strong>Week 2:</strong> Create tiered offer structure and bonuses.</div>
        <div class="item"><strong>Week 3:</strong> Test messaging focusing on savings vs cost.</div>
        <div class="item"><strong>Week 4:</strong> Evaluate CPA and scale channels with positive ROI.</div>
        <div class="item"><strong>Month 2–3:</strong> Optimize funnel to improve LTV and retention.</div>
      </div>
    `;

    const paragraphs = [
      `Make the financial impact tangible: show exactly how much money/time customers save.`,
      `Competitor benchmarks help prospects understand relative value and justify switching.`,
      `Bonuses dramatically increase perceived value without increasing product cost.`,
      `Modeling payouts and CPA is essential if you plan to use paid channels.`,
      `Framing the subscription as an investment removes price objections.`,
      `Iterate pricing messages based on real conversion data to maximize revenue.`
    ];
    narrativeHtml = paragraphs.map(p => `<p>${p}</p>`).join("\n");
  }

  else if (categoryIndex === 5) {
    headerTitle = "Make Your Affiliate Offer Irresistible";
    deepDiveHtml = `
      <div class="section">
        <h2 class="bold">Output: Professional Deep-Dive Analysis</h2>
        <h3 class="bold">A.1. Unique Selling Proposition (USP)</h3>
        <p>${get("The unique promise of my product is…", "")} — make that the centerpiece of all copy.</p>

        <h3 class="bold">A.2. Objection Handling</h3>
        <p>Common objections: ${get("The objections my audience has are…", "")}. Build exact responses and micro-demos to counter them.</p>

        <h3 class="bold">A.3. Emotional Benefits</h3>
        <p>Emotional payoff: ${get("The emotional benefit is…", "")} — use storytelling to surface this in headlines and social proof.</p>

        <h3 class="bold">A.4. Bonus Strategy</h3>
        <p>Bonuses: ${get("The bonuses I can add are…", "")} — package these as limited-time exclusives for your affiliate link.</p>

        <h3 class="bold">A.5. Copywriting Angle</h3>
        <p>Combine rational benefits (ROI, time saved) with emotional narratives (confidence, pride) for high-converting copy.</p>

        <h3 class="bold">A.6. Social Proof & Authority</h3>
        <p>Collect testimonials, short case studies, and show real outcomes from people similar to your audience.</p>
      </div>
    `;

    roadmapHtml = `
      <div class="section roadmap">
        <h3 class="bold">🚀 Roadmap to Make Your Offer Irresistible</h3>
        <div class="item"><strong>Week 1:</strong> Finalize headline, USP, and objection scripts.</div>
        <div class="item"><strong>Week 2:</strong> Create bonuses and onboarding materials.</div>
        <div class="item"><strong>Week 3:</strong> Launch landing page with bonus claim flow.</div>
        <div class="item"><strong>Week 4:</strong> Collect testimonials and refine copy.</div>
        <div class="item"><strong>Month 2–3:</strong> Run webinars/workshops to build authority and scale conversions.</div>
      </div>
    `;

    const paragraphs = [
      `An irresistible offer combines an unmistakable promise with real proof and extra perceived value.`,
      `Address objections up front—each objection you resolve reduces friction and improves conversion.`,
      `Emotional benefits often trump features; show transformation through relatable stories.`,
      `Bonuses should be genuine, valuable, and tied directly to the customer’s implementation success.`,
      `Use scarcity/urgency carefully to encourage action without damaging trust.`,
      `Building authority through consistent content and testimonials ensures the offer sustains conversion rates over time.`
    ];
    narrativeHtml = paragraphs.map(p => `<p>${p}</p>`).join("\n");
  }

  // Compose the final HTML
  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Affiliate Blueprint - ${headerTitle}</title>
        <style>${css}</style>
      </head>
      <body>
        <div class="container">
          <h1>Affiliate Digital Product Success Blueprint</h1>
          <h2>${headerTitle}</h2>

          <div class="section">
            <h3 class="bold">Fields (Your Inputs)</h3>
            <p>${Object.entries(data).map(([k, v]) => `<strong>${escapeHtml(k)}</strong>: ${escapeHtml(v)}`).join("<br/>")}</p>
          </div>

          ${deepDiveHtml}
          ${roadmapHtml}

          <div class="section">
            <h2 class="bold">Narrative Analysis</h2>
            ${narrativeHtml}
          </div>

        </div>
      </body>
    </html>
  `;

  return html;
}

// Helper: capture an HTML node (or generated HTML) into a multi-page PDF and save
async function htmlToMultiPagePdfAndSave(htmlString, filename = "document.pdf") {
  // Create temp container
  const temp = document.createElement("div");
  temp.style.position = "fixed";
  temp.style.left = "-9999px";
  temp.style.top = "0";
  temp.style.width = "800px"; // match our generated container width for consistent rendering
  temp.innerHTML = htmlString;
  document.body.appendChild(temp);

  try {
    // Use scale 2 for better resolution
    const canvas = await html2canvas(temp, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Calculate image dimensions in PDF coords
    const imgProps = { width: canvas.width, height: canvas.height };
    const pdfImgHeight = (imgProps.height * pageWidth) / imgProps.width;

    if (pdfImgHeight <= pageHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pdfImgHeight);
    } else {
      // Slice image into pages
      let remainingHeight = imgProps.height;
      let position = 0;
      const canvasPageHeight = Math.floor((imgProps.width * pageHeight) / pageWidth);

      while (remainingHeight > 0) {
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = imgProps.width;
        pageCanvas.height = Math.min(canvasPageHeight, remainingHeight);
        const ctx = pageCanvas.getContext("2d");
        ctx.drawImage(canvas, 0, position, imgProps.width, pageCanvas.height, 0, 0, imgProps.width, pageCanvas.height);

        const pageImgData = pageCanvas.toDataURL("image/png");
        if (position > 0) pdf.addPage();
        pdf.addImage(pageImgData, "PNG", 0, 0, pageWidth, pageHeight);
        position += pageCanvas.height;
        remainingHeight -= pageCanvas.height;
      }
    }

    pdf.save(filename);
  } catch (err) {
    console.error("Error generating PDF:", err);
    alert("Failed to generate PDF. See console for details.");
  } finally {
    document.body.removeChild(temp);
  }
}

// React component
export default function App() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({ ...defaultPrefill }); // prefill with examples
  const totalSteps = categories.length;

  const currentCategory = categories.find((c) => c.id === step);

  function updateField(field, value) {
    setAnswers((prev) => ({
      ...prev,
      [step]: {
        ...prev[step],
        [field]: value,
      },
    }));
  }

  // Results HTML for current step (rendered in page, used for PDF capture & results view)
  const currentHtml = generateCategoryHTML(step, answers[step] || {});

  // Handler: Results (PDF) for current category
  async function handleGeneratePdfForCurrent() {
    const filename = `${currentCategory.title.replace(/\s+/g, "_")}.pdf`;
    await htmlToMultiPagePdfAndSave(currentHtml, filename);
  }

  // Handler: Results View -> open new tab with same HTML
  function handleOpenResultsView() {
    const w = window.open("", "_blank");
    if (!w) {
      alert("Popup blocked — please allow popups for this site.");
      return;
    }
    w.document.write(currentHtml);
    w.document.close();
  }

  // Handler: Next
  function handleNext() {
    if (step < totalSteps) setStep(step + 1);
  }

  // Handler: Prev
  function handlePrev() {
    if (step > 1) setStep(step - 1);
  }

  // Handler: Reset to example prefill for current step
  function handleResetToExample() {
    setAnswers((prev) => ({ ...prev, [step]: { ...defaultPrefill[step] } }));
    alert("Form reset to example inputs for this category.");
  }

  // Handler: Generate Full Blueprint (all categories)
  async function handleGenerateFullBlueprint() {
    // Build combined HTML: concatenate per-category HTML with page-break markers
    const combined = categories
      .map((cat) => {
        const html = generateCategoryHTML(cat.id, answers[cat.id] || {});
        // strip <html> wrapper, keep inner body content by simple extraction
        // but to keep it robust, we will wrap each html as its own full doc and insert page-break
        return html;
      })
      .join('<div style="page-break-after: always;"></div>');

    // Wrap combined in a single doc
    const fullHtml = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1" /></head><body>${combined}</body></html>`;

    await htmlToMultiPagePdfAndSave(fullHtml, "Affiliate_Digital_Product_Success_Blueprint.pdf");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" style={{ fontFamily: "Calibri, Arial, sans-serif" }}>
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <header className="mb-6">
          <h1 style={{ fontSize: ptToPx(26) + "px", fontWeight: 700, marginBottom: 6 }}>
            Affiliate Digital Product Builder
          </h1>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: ptToPx(14) + "px", color: "#374151" }}>
              Step {step} of {totalSteps} — {currentCategory.title}
            </div>
            <div>
              <button
                onClick={() => {
                  setAnswers({ ...defaultPrefill });
                  setStep(1);
                  alert("All categories reset to example inputs.");
                }}
                style={{ background: "#f97316", color: "#fff", padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer" }}
              >
                Reset All to Example
              </button>
            </div>
          </div>
        </header>

        <main>
          <section style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: ptToPx(22) + "px", fontWeight: 700, marginBottom: 12 }}>{currentCategory.title}</h2>

            <div style={{ background: "#f3f4f6", padding: 14, borderRadius: 8 }}>
              {currentCategory.fields.map((field) => (
                <div key={field} style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>{field}</label>
                  <textarea
                    rows={field.length > 40 ? 4 : 2}
                    value={answers[step]?.[field] || ""}
                    onChange={(e) => updateField(field, e.target.value)}
                    style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #d1d5db" }}
                    placeholder="Type your answer..."
                  />
                </div>
              ))}

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={handleResetToExample} style={{ padding: "8px 12px", borderRadius: 6, border: "none", background: "#f3f4f6", cursor: "pointer" }}>
                  Reset to Example (this step)
                </button>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={handleGeneratePdfForCurrent} style={{ background: "#059669", color: "#fff", padding: "10px 14px", borderRadius: 8, border: "none", cursor: "pointer" }}>
                Results (PDF)
              </button>

              <button onClick={handleOpenResultsView} style={{ background: "#3b82f6", color: "#fff", padding: "10px 14px", borderRadius: 8, border: "none", cursor: "pointer" }}>
                Results View
              </button>

              {step < totalSteps ? (
                <button onClick={handleNext} style={{ background: "#7c3aed", color: "#fff", padding: "10px 14px", borderRadius: 8, border: "none", cursor: "pointer" }}>
                  Next
                </button>
              ) : (
                <button
                  onClick={handleGenerateFullBlueprint}
                  style={{ background: "#059669", color: "#fff", padding: "10px 14px", borderRadius: 8, border: "none", cursor: "pointer" }}
                >
                  Generate Full Blueprint
                </button>
              )}

              {step > 1 && (
                <button onClick={handlePrev} style={{ background: "#e5e7eb", color: "#111", padding: "10px 14px", borderRadius: 8, border: "none", cursor: "pointer" }}>
                  Previous
                </button>
              )}
            </div>
          </section>

          <section>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, background: "#fafafa" }}>
              <h3 style={{ fontSize: ptToPx(18) + "px", fontWeight: 700, marginBottom: 10 }}>Results Preview</h3>
              {/* Render the currentHtml inside an iframe-like box for preview */}
              <div
                id="results-preview"
                style={{ background: "#fff", padding: 20, borderRadius: 6, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}
                dangerouslySetInnerHTML={{ __html: generateCategoryHTML(step, answers[step] || {}) }}
              />
            </div>
          </section>
        </main>

        <footer style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "#6b7280" }}>All PDFs follow style: Calibri (fallback), Title 26pt, Subtitle 22pt, Body 14pt.</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>© Affiliate Microsite • Generated locally in browser</div>
        </footer>
      </div>
    </div>
  );
}
