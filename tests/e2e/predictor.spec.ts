import { expect, test, type Page } from "@playwright/test";

async function fillDesktopCandidate(
  page: Page,
  answers: { varcRight?: number; dilrRight?: number; qaRight?: number } = {},
) {
  await page.goto("/predictor");
  await expect(page.getByRole("heading", { name: "Candidate profile" })).toBeVisible();
  await page.getByLabel("Class 10 percentage").fill("92");
  await page.getByLabel("Class 12 percentage").fill("90");
  await page.getByLabel("Bachelor / professional %").fill("86");
  await page.getByLabel("Eligible completed work-experience months").fill("24");

  for (const [section, right] of [
    ["VARC", answers.varcRight ?? 7],
    ["DILR", answers.dilrRight ?? 7],
    ["QA", answers.qaRight ?? 7],
  ] as const) {
    await page.getByLabel(`${section} MCQ right`).fill(String(right));
    await page.getByLabel(`${section} MCQ wrong`).fill("1");
  }
  await page.getByLabel("Date of birth").fill("2003-05-12");
  await expect(page.getByLabel("Date of birth")).toHaveValue("2003-05-12");
}

function instituteRow(page: Page, instituteName: string) {
  return page.getByRole("row").filter({ hasText: instituteName }).first();
}

test("landing page opens the 21-IIM predictor", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Which IIM may call you? Check your interview-call chances" })).toBeVisible();
  await Promise.all([
    page.waitForURL(/\/predictor\/?$/, { timeout: 15_000 }),
    page.getByRole("link", { name: "Predict my IIM calls" }).click(),
  ]);
  await expect(page.getByRole("heading", { name: "Candidate profile" })).toBeVisible();
});

test("a borderline profile produces parameter-based medium call chances", async ({ page }) => {
  await fillDesktopCandidate(page);
  await expect(page.getByText("95.25%", { exact: true })).toHaveCount(3);

  await page.getByRole("button", { name: "Analyze all 21 IIM Chances", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your IIM results" })).toBeVisible();

  const sambalpur = instituteRow(page, "IIM Sambalpur");
  await expect(sambalpur.getByLabel("Expected call chance: medium")).toBeVisible();
  await expect(page.getByRole("button", { name: /medium call chances?/i })).toBeVisible();

  await page.getByRole("button", { name: "View more details for IIM Sambalpur" }).click();
  await expect(page.getByText("Expected interview-call chance", { exact: true })).toBeVisible();
  await expect(page.getByLabel(/Expected interview-call chance MEDIUM/)).toBeVisible();
  await expect(page.getByText("Expected seat chance", { exact: true })).toHaveCount(0);
});

test("an official sectional failure remains a low call chance", async ({ page }) => {
  await fillDesktopCandidate(page, { varcRight: 4, dilrRight: 9, qaRight: 9 });
  await page.getByRole("button", { name: "Analyze all 21 IIM Chances", exact: true }).click();

  const ahmedabad = instituteRow(page, "IIM Ahmedabad");
  await expect(ahmedabad).toContainText("LESS LIKELY");
  await expect(ahmedabad.getByLabel("Expected call chance: low")).toBeVisible();

  await page.getByRole("button", { name: "View more details for IIM Ahmedabad" }).click();
  await expect(page.getByText("LESS LIKELY", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("VARC cutoff deficit", { exact: true })).toBeVisible();
});

test("work experience replaces the initial zero instead of prefixing it", async ({ page }) => {
  await page.goto("/predictor");
  const workExperience = page.getByLabel("Eligible completed work-experience months");
  await workExperience.click();
  await page.keyboard.type("24");
  await expect(workExperience).toHaveValue("24");
});

test("mobile completes the candidate form and shows results", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/predictor");
  await expect(page.getByRole("heading", { name: "Candidate profile" })).toBeVisible();
  await page.getByLabel("Class 10 percentage").fill("92");
  await page.getByLabel("Class 12 percentage").fill("90");
  await page.getByLabel("Bachelor / professional %").fill("86");
  const workExperience = page.getByLabel("Eligible completed work-experience months");
  await workExperience.click();
  await page.keyboard.type("24");
  await expect(workExperience).toHaveValue("24");
  for (const section of ["VARC", "DILR", "QA"] as const) {
    await page.getByLabel(`${section} MCQ right`).fill("7");
    await page.getByLabel(`${section} MCQ wrong`).fill("1");
  }
  await page.getByLabel("Date of birth").fill("2003-05-12");
  await page.getByRole("button", { name: "Analyze all 21 IIM Chances", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your IIM results" })).toBeVisible();
  await expect(instituteRow(page, "IIM Sambalpur").getByLabel("Expected call chance: medium")).toBeVisible();
});

test("admin endpoint rejects missing authorization", async ({ request }) => {
  const response = await request.get("/api/iima/policy");
  expect(response.status()).toBe(401);
});
