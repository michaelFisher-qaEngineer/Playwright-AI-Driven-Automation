# Playwright AI-Driven Automation

**AI-generated end-to-end test automation using Playwright Test Agents (Planner, Generator, and Healer).**

---

## Overview

This project demonstrates an **AI-driven test automation workflow using Playwright’s built-in AI agents**.  
The entire automation process — from **test planning to test scripting and maintenance** — was performed using Playwright's AI capabilities rather than manually written test code.

The project showcases how modern AI-assisted tooling can dramatically accelerate the creation and maintenance of end-to-end automation suites.

Instead of writing tests manually, the Playwright AI agents were used to:

1. **Explore the application**
2. **Generate a structured test plan**
3. **Create executable Playwright tests**
4. **Automatically repair failing tests**

This repository exists primarily as a **technical demonstration of AI-assisted test automation capabilities**.

---

## AI Workflow Used

Playwright includes three AI agents that automate the lifecycle of test creation and maintenance. These agents were used sequentially in this project.

### Planner Agent

The **Planner** agent explores the application and generates a structured Markdown test plan describing:

- Application flows
- User actions
- Validation points
- Edge cases

This becomes the blueprint for the test suite.

### Generator Agent

The **Generator** converts the Markdown test plan into executable Playwright tests.

The generated tests:

- Follow Playwright test conventions
- Use resilient locator strategies
- Implement assertions and navigation logic
- Create maintainable test structures

### Healer Agent

The **Healer** agent monitors test execution and attempts to automatically repair failing tests.

When UI elements change or selectors break, the healer can:

- Detect locator failures
- Identify alternative elements
- Update the test automatically

This creates **self-healing test automation** and reduces maintenance overhead.

Playwright's AI agents work together to **explore applications, generate tests, and repair failures automatically**. :contentReference[oaicite:0]{index=0}

---

## What This Project Demonstrates

This project highlights several modern automation concepts:

- AI-assisted test planning
- Automated Playwright test generation
- Self-healing test execution
- Reduced manual scripting
- Rapid automation bootstrapping

Traditional automation requires engineers to manually design test plans, write test scripts, and maintain broken selectors. AI-driven tooling can automate much of that work by generating tests from high-level intent and adapting when UI changes occur. :contentReference[oaicite:1]{index=1}

---

## Tech Stack

- **Playwright**
- **Playwright Test Runner**
- **Playwright AI Agents**
  - Planner
  - Generator
  - Healer
- **Node.js**
- **VS Code Playwright Extension**

---

## Project Structure


playwright-ai-driven-automation/
│
├── tests/ # Generated Playwright test cases
├── test-plan/ # AI-generated test plan (Markdown)
├── playwright.config.ts # Playwright configuration
├── package.json
└── README.md


---

## Running the Tests

Install dependencies:

```bash
npm install

Run the test suite:

npx playwright test

Run tests in UI mode:

npx playwright test --ui
```
---

## Running the Tests

This repository demonstrates how AI-assisted tooling is changing test automation workflows.

Instead of writing large volumes of automation code manually, engineers can now:

Define testing intent

Allow AI to explore the application

Generate executable tests

Automatically maintain them as the application evolves

The goal of this project is to experiment with and showcase the practical capabilities of AI-driven test automation using Playwright.