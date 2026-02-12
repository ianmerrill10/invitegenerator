/**
 * InviteGenerator AI Testing Agent
 *
 * This script uses Claude API to perform comprehensive testing of the InviteGenerator app.
 * It tests all features, validates functionality, and generates detailed reports.
 *
 * Usage:
 *   npx tsx scripts/ai-test-agent.ts
 *
 * Environment Variables:
 *   CLAUDE_API_KEY - Your Claude API key
 *   NEXT_PUBLIC_APP_URL - The URL of the app to test (defaults to http://localhost:3000)
 */

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

if (!CLAUDE_API_KEY) {
  console.error("Error: CLAUDE_API_KEY is not set in environment variables");
  process.exit(1);
}

const anthropic = new Anthropic({
  apiKey: CLAUDE_API_KEY,
});

// Test categories and their endpoints/features
const TEST_CATEGORIES = {
  api_health: {
    name: "API Health Checks",
    tests: [
      { name: "Health endpoint", endpoint: "/api/health", method: "GET" },
      { name: "CSRF token", endpoint: "/api/auth/csrf", method: "GET" },
    ],
  },
  authentication: {
    name: "Authentication System",
    tests: [
      { name: "Login page loads", endpoint: "/auth/login", method: "GET" },
      { name: "Signup page loads", endpoint: "/auth/signup", method: "GET" },
      { name: "Login API", endpoint: "/api/auth/login", method: "POST" },
      { name: "Signup API", endpoint: "/api/auth/signup", method: "POST" },
      { name: "Logout API", endpoint: "/api/auth/logout", method: "POST" },
    ],
  },
  pages: {
    name: "Page Loading",
    tests: [
      { name: "Homepage", endpoint: "/", method: "GET" },
      { name: "Pricing page", endpoint: "/pricing", method: "GET" },
      { name: "Features page", endpoint: "/features", method: "GET" },
      { name: "Templates page", endpoint: "/templates", method: "GET" },
      { name: "Blog page", endpoint: "/blog", method: "GET" },
      { name: "FAQ page", endpoint: "/faq", method: "GET" },
      { name: "Contact page", endpoint: "/contact", method: "GET" },
      { name: "Help page", endpoint: "/help", method: "GET" },
      { name: "About page", endpoint: "/about", method: "GET" },
      { name: "Privacy page", endpoint: "/privacy", method: "GET" },
      { name: "Terms page", endpoint: "/terms", method: "GET" },
    ],
  },
  dashboard: {
    name: "Dashboard Pages",
    tests: [
      { name: "Dashboard home", endpoint: "/dashboard", method: "GET" },
      { name: "Create page", endpoint: "/dashboard/create", method: "GET" },
      { name: "Templates gallery", endpoint: "/dashboard/templates", method: "GET" },
      { name: "Invitations list", endpoint: "/dashboard/invitations", method: "GET" },
      { name: "Analytics page", endpoint: "/dashboard/analytics", method: "GET" },
      { name: "Settings page", endpoint: "/dashboard/settings", method: "GET" },
      { name: "Billing page", endpoint: "/dashboard/billing", method: "GET" },
      { name: "RSVP dashboard", endpoint: "/dashboard/rsvp", method: "GET" },
    ],
  },
  invitations_api: {
    name: "Invitations API",
    tests: [
      { name: "List invitations", endpoint: "/api/invitations", method: "GET" },
      { name: "Create invitation", endpoint: "/api/invitations", method: "POST" },
    ],
  },
  templates_api: {
    name: "Templates API",
    tests: [
      { name: "List templates", endpoint: "/api/templates", method: "GET" },
      { name: "Protected templates", endpoint: "/api/templates/protected", method: "GET" },
    ],
  },
  affiliates: {
    name: "Affiliate System",
    tests: [
      { name: "Affiliates landing", endpoint: "/affiliates", method: "GET" },
      { name: "Affiliate join page", endpoint: "/affiliates/join", method: "GET" },
      { name: "Affiliate terms", endpoint: "/affiliates/terms", method: "GET" },
      { name: "Apply API", endpoint: "/api/affiliates/apply", method: "POST" },
    ],
  },
  admin: {
    name: "Admin System",
    tests: [
      { name: "Admin dashboard", endpoint: "/admin", method: "GET" },
      { name: "Admin contacts", endpoint: "/admin/contacts", method: "GET" },
      { name: "Contacts API", endpoint: "/api/admin/contacts", method: "GET" },
    ],
  },
  upload: {
    name: "Upload System",
    tests: [
      { name: "Upload API", endpoint: "/api/upload", method: "POST" },
    ],
  },
  rsvp: {
    name: "RSVP System",
    tests: [
      { name: "RSVP API", endpoint: "/api/rsvp", method: "GET" },
    ],
  },
};

interface TestResult {
  category: string;
  testName: string;
  endpoint: string;
  status: "pass" | "fail" | "skip";
  statusCode?: number;
  responseTime?: number;
  error?: string;
  timestamp: string;
}

const testResults: TestResult[] = [];

async function runHttpTest(
  category: string,
  testName: string,
  endpoint: string,
  method: string
): Promise<TestResult> {
  const url = `${APP_URL}${endpoint}`;
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json,text/html",
      },
      // For POST requests, send minimal body
      ...(method === "POST" && {
        body: JSON.stringify({ test: true }),
      }),
    });

    const responseTime = Date.now() - startTime;

    // Consider 2xx, 3xx as pass, 401/403 as pass (auth required), others based on context
    const isPass =
      response.ok ||
      response.status === 401 ||
      response.status === 403 ||
      response.status === 400; // Bad request is expected for test data

    return {
      category,
      testName,
      endpoint,
      status: isPass ? "pass" : "fail",
      statusCode: response.status,
      responseTime,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      category,
      testName,
      endpoint,
      status: "fail",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

async function runAllTests(): Promise<void> {
  console.log("\n========================================");
  console.log("   InviteGenerator AI Testing Agent");
  console.log("========================================\n");
  console.log(`Testing: ${APP_URL}\n`);

  for (const [categoryKey, category] of Object.entries(TEST_CATEGORIES)) {
    console.log(`\n--- ${category.name} ---`);

    for (const test of category.tests) {
      process.stdout.write(`  Testing: ${test.name}... `);

      const result = await runHttpTest(
        category.name,
        test.name,
        test.endpoint,
        test.method
      );

      testResults.push(result);

      if (result.status === "pass") {
        console.log(`PASS (${result.statusCode}, ${result.responseTime}ms)`);
      } else {
        console.log(`FAIL (${result.error || result.statusCode})`);
      }

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

async function analyzeResultsWithClaude(): Promise<string> {
  console.log("\n--- Analyzing results with Claude AI ---\n");

  const passCount = testResults.filter((r) => r.status === "pass").length;
  const failCount = testResults.filter((r) => r.status === "fail").length;
  const totalCount = testResults.length;

  const resultsSummary = testResults
    .map(
      (r) =>
        `- ${r.testName} (${r.endpoint}): ${r.status.toUpperCase()}${
          r.statusCode ? ` [${r.statusCode}]` : ""
        }${r.responseTime ? ` ${r.responseTime}ms` : ""}${
          r.error ? ` Error: ${r.error}` : ""
        }`
    )
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `You are a QA engineer analyzing test results for InviteGenerator, a wedding invitation web app.

Test Results Summary:
- Total Tests: ${totalCount}
- Passed: ${passCount}
- Failed: ${failCount}
- Pass Rate: ${((passCount / totalCount) * 100).toFixed(1)}%

Detailed Results:
${resultsSummary}

Please provide:
1. A brief overall assessment (2-3 sentences)
2. Critical issues that need immediate attention (if any)
3. Recommendations for improving test coverage
4. A readiness score from 1-10 for production launch

Format your response as a clean report.`,
      },
    ],
  });

  const textContent = message.content.find((block) => block.type === "text");
  return textContent ? textContent.text : "No analysis available";
}

function generateReport(analysis: string): void {
  const reportDate = new Date().toISOString().split("T")[0];
  const reportTime = new Date().toLocaleTimeString();

  const passCount = testResults.filter((r) => r.status === "pass").length;
  const failCount = testResults.filter((r) => r.status === "fail").length;
  const totalCount = testResults.length;

  const report = `# InviteGenerator Test Report

**Generated:** ${reportDate} at ${reportTime}
**Test URL:** ${APP_URL}

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | ${totalCount} |
| Passed | ${passCount} |
| Failed | ${failCount} |
| Pass Rate | ${((passCount / totalCount) * 100).toFixed(1)}% |

---

## Detailed Results

${Object.entries(TEST_CATEGORIES)
  .map(([_, category]) => {
    const categoryResults = testResults.filter(
      (r) => r.category === category.name
    );
    return `### ${category.name}

| Test | Endpoint | Status | Response Time |
|------|----------|--------|---------------|
${categoryResults
  .map(
    (r) =>
      `| ${r.testName} | \`${r.endpoint}\` | ${
        r.status === "pass" ? "PASS" : "**FAIL**"
      } | ${r.responseTime ? `${r.responseTime}ms` : "N/A"} |`
  )
  .join("\n")}
`;
  })
  .join("\n")}

---

## AI Analysis

${analysis}

---

## Failed Tests Details

${
  testResults
    .filter((r) => r.status === "fail")
    .map(
      (r) => `- **${r.testName}** (${r.endpoint})
  - Status Code: ${r.statusCode || "N/A"}
  - Error: ${r.error || "No error message"}`
    )
    .join("\n\n") || "No failed tests! Great job!"
}

---

*Report generated by InviteGenerator AI Testing Agent*
`;

  // Save report
  const reportsDir = path.join(process.cwd(), "test-reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, `test-report-${reportDate}.md`);
  fs.writeFileSync(reportPath, report);

  // Also update the main testing log
  const testingLogPath = path.join(process.cwd(), "TESTING_LOG.md");
  const logEntry = `
## Test Run: ${reportDate} ${reportTime}

- **Pass Rate:** ${((passCount / totalCount) * 100).toFixed(1)}%
- **Tests:** ${passCount}/${totalCount} passed
- **Report:** [test-report-${reportDate}.md](./test-reports/test-report-${reportDate}.md)

`;

  if (fs.existsSync(testingLogPath)) {
    const existingLog = fs.readFileSync(testingLogPath, "utf-8");
    fs.writeFileSync(testingLogPath, existingLog + logEntry);
  } else {
    fs.writeFileSync(
      testingLogPath,
      `# InviteGenerator Testing Log

This log is automatically updated by the AI Testing Agent.

---
${logEntry}`
    );
  }

  console.log(`\nReport saved to: ${reportPath}`);
  console.log(`Testing log updated: ${testingLogPath}`);
}

async function main() {
  try {
    // Run all tests
    await runAllTests();

    // Analyze with Claude
    const analysis = await analyzeResultsWithClaude();

    // Generate report
    generateReport(analysis);

    console.log("\n========================================");
    console.log("   Testing Complete!");
    console.log("========================================\n");

    const passCount = testResults.filter((r) => r.status === "pass").length;
    const totalCount = testResults.length;
    console.log(
      `Final Score: ${passCount}/${totalCount} (${(
        (passCount / totalCount) *
        100
      ).toFixed(1)}%)\n`
    );

    // Exit with error code if too many failures
    if (passCount / totalCount < 0.7) {
      console.log("Warning: Pass rate below 70%. Review failed tests.");
      process.exit(1);
    }
  } catch (error) {
    console.error("Testing agent error:", error);
    process.exit(1);
  }
}

main();
