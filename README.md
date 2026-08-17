# PR-Scribe — AI Git Diff to PR Description & Review Guide

## The Problem

As a developer working across multiple feature branches daily, I kept writing one-line pull request descriptions such as "fixed bug" or "updated code" when rushing to push changes. My team lead repeatedly sent every single pull request back, demanding clear explanations of what changed, why the change was necessary, and what reviewers should specifically test. I wasted 10 to 15 minutes per PR manually parsing git diffs and structuring release notes. This frustration is experienced by developers across software engineering teams worldwide who struggle to maintain descriptive documentation without breaking their coding flow.

## What It Does

PR-Scribe provides an instant, AI-powered solution where developers paste their raw git diff (`git diff`) into a responsive web interface. The backend securely processes the diff using advanced language models to generate a professional, structured Pull Request description containing three mandatory sections:
1. **Summary of Changes**: Clear bullet points detailing exact modifications.
2. **Why This Change Was Made**: Architectural context and rationale.
3. **Reviewer Checklist**: Actionable items for code reviewers.

Users can copy the formatted markdown with a single click and paste it directly into GitHub.

## AI Integration

* **API Provider:** OpenAI / OpenRouter API Proxy
* **Model:** `gpt-4.1-mini`
* **Location:** `backend/server.js` inside the `POST /api/generate-pr` route handler.
* **What the AI does:** Analyzes raw git diff text with a specialized prompt to extract technical modifications and synthesize professional developer-facing documentation.

## What I Intentionally Excluded

1. **User Authentication & Persistent Database:** I decided not to implement user accounts or persistent database storage because PR-Scribe is designed as a lightweight, session-based utility tool. Adding OAuth and user persistence would triple development time without adding core value to the diff-to-PR workflow.
2. **Direct GitHub OAuth Auto-Publishing:** I intentionally omitted direct GitHub API repository integration to push PRs automatically. Having developers copy-paste the generated Markdown into GitHub keeps the tool decoupled, lightweight, and secure without requiring extensive OAuth app credentials and permissions.

## Monthly Cost Calculation

To ensure engineering efficiency and financial predictability, the monthly cost for running the AI backend feature is calculated below with full arithmetic:

* **Model:** `openai/gpt-4.1-mini`
* **Input Token Rate:** $0.15 per 1,000,000 tokens
* **Output Token Rate:** $0.60 per 1,000,000 tokens
* **Average Tokens per Call:** ~600 input tokens + ~400 output tokens = 1,000 tokens total per call
* **Cost per Call:** 
  $$\text{Input Cost} = \frac{600}{1,000,000} \times \$0.15 = \$0.000090$$
  $$\text{Output Cost} = \frac{400}{1,000,000} \times \$0.60 = \$0.000240$$
  $$\text{Total Cost per Call} = \$0.000090 + \$0.000240 = \$0.000330$$
* **Expected Monthly Calls:** 300 calls per month (approx. 10 PRs per workday)
* **Monthly Total:** $$300 \times \$0.000330 = \$0.099 \ (\approx \$0.10/\text{month})$$

## Live Deployment

* **Frontend:** Deployed via GitHub Pages / Netlify (`https://your-username.github.io/pr-scribe`)
* **Backend:** Deployed via Render Web Service (`https://pr-scribe-backend.onrender.com`)
* **Health Check Endpoint:** `https://pr-scribe-backend.onrender.com/health` returns `{"status":"ok"}`.

---
*Built with engineering rigor for Kalvium Frontend Product Challenge.*
