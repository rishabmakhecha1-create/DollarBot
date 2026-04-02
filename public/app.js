const navButtons = document.querySelectorAll(".nav-button");
const pages = document.querySelectorAll(".page");
const getStartedButton = document.getElementById("getStartedButton");
const openToolsButton = document.getElementById("openToolsButton");
const refreshStatusButton = document.getElementById("refreshStatusButton");

const chatLog = document.getElementById("chatLog");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const starterButtons = document.querySelectorAll(".starter");
const lessonButtons = document.querySelectorAll(".lesson-card");
const apiStatus = document.getElementById("apiStatus");
const clearChatButton = document.getElementById("clearChatButton");

const budgetToolButton = document.getElementById("budgetToolButton");
const paycheckToolButton = document.getElementById("paycheckToolButton");
const toolEyebrow = document.getElementById("toolEyebrow");
const toolTitle = document.getElementById("toolTitle");
const toolDescription = document.getElementById("toolDescription");
const budgetForm = document.getElementById("budgetForm");
const paycheckForm = document.getElementById("paycheckForm");
const toolResult = document.getElementById("toolResult");

const budgetIncome = document.getElementById("budgetIncome");
const budgetNeeds = document.getElementById("budgetNeeds");
const budgetWants = document.getElementById("budgetWants");
const budgetSavings = document.getElementById("budgetSavings");

const payRate = document.getElementById("payRate");
const hoursWorked = document.getElementById("hoursWorked");
const federalTax = document.getElementById("federalTax");
const stateTax = document.getElementById("stateTax");

const budgetCategoryInput = document.getElementById("budgetCategoryInput");
const addBudgetCategoryButton = document.getElementById("addBudgetCategoryButton");
const budgetCategoryList = document.getElementById("budgetCategoryList");
const paycheckCategoryInput = document.getElementById("paycheckCategoryInput");
const addPaycheckCategoryButton = document.getElementById("addPaycheckCategoryButton");
const paycheckCategoryList = document.getElementById("paycheckCategoryList");
const categoryPills = document.querySelectorAll(".category-pill");

let isAwaitingReply = false;
let serverReady = false;
let conversationHistory = [];
let currentPage = "home";
let currentTool = "budget";
const selectedCategories = {
  budget: ["School", "Emergency Fund"],
  paycheck: ["Part-time Job", "Saving for School"]
};

const introMessage = `I’m DollarBot. I can help with budgeting, savings, bank accounts, credit basics, paychecks, taxes, student money choices, and spotting scams.

I keep things simple and educational. For legal, tax, or investment decisions with serious consequences, I’ll tell you when it makes sense to talk to a trusted adult or licensed professional.

Try asking:
- “How should I split my paycheck?”
- “What even is a credit score?”
- “How do I avoid overdraft fees?”`;

const knowledgeBase = [
  {
    keywords: ["budget", "budgeting", "split paycheck", "monthly"],
    title: "Starting a simple budget",
    body: [
      "Try a 3-bucket system first: needs, savings, and wants.",
      "A solid starter version is 50% needs, 30% wants, and 20% savings. If your income is tight, protect savings with even 5% to 10% so the habit starts now.",
      "Track only your top categories at first: food, transportation, subscriptions, fun, and savings. A budget that is simple enough to keep using beats a perfect one you quit after three days.",
      "If you want, I can help you turn your actual monthly income into a sample budget."
    ]
  },
  {
    keywords: ["save", "saving", "emergency fund", "emergency"],
    title: "Building savings when money is tight",
    body: [
      "Start with a small emergency goal like $100, then $250, then one month of basic expenses.",
      "Set up an automatic transfer on payday, even if it is only $5 or $10. Consistency matters more than size at the beginning.",
      "Keep emergency savings somewhere safe and boring, like a savings account, not in cash you can spend easily.",
      "Use savings for real surprises like a phone repair, medical cost, or ride to work, not random shopping."
    ]
  },
  {
    keywords: ["credit", "credit card", "credit score", "score"],
    title: "Credit basics",
    body: [
      "Credit lets you borrow money now and repay it later. Your credit score is basically a trust score lenders use to guess how risky it is to lend to you.",
      "For most beginners, the safest rule is this: only put small, planned purchases on a credit card, and pay the full statement balance on time every month.",
      "Missing payments hurts much more than not having a credit card at all.",
      "If you are under 18, you may need a parent or guardian involved depending on the account type."
    ]
  },
  {
    keywords: ["debit", "checking", "bank account", "overdraft"],
    title: "Debit and bank account basics",
    body: [
      "A debit card spends money you already have in your checking account. That usually makes it the easier first step.",
      "Watch out for overdraft fees. If your bank allows overdraft, you can spend more than you have and get charged for it.",
      "Good beginner habits: turn on balance alerts, check your account twice a week, and keep a small buffer in checking.",
      "If you want a first account, I can help you compare checking vs savings and what fees to avoid."
    ]
  },
  {
    keywords: ["paycheck", "taxes", "withholding", "w2", "w-2", "job"],
    title: "Why your paycheck is smaller than expected",
    body: [
      "Your gross pay is the full amount you earned before deductions. Your net pay is what you actually take home.",
      "Common deductions include federal taxes, state taxes, Social Security, Medicare, and sometimes benefits.",
      "That is why your paycheck can feel lower than the hourly wage math you did in your head.",
      "If you send me your hourly rate and hours worked, I can help you estimate the difference in plain English."
    ]
  },
  {
    keywords: ["loan", "student loan", "college", "fafsa", "tuition"],
    title: "Student money choices",
    body: [
      "Before borrowing, compare the total cost of school, not just the yearly number. Loans can follow you for years.",
      "Start with aid and money you do not have to repay first, like grants, scholarships, and work-study.",
      "If you do borrow, understand the interest rate, monthly payment after graduation, and total amount repaid over time.",
      "A useful rule: do not treat student loans like free money just because repayment starts later."
    ]
  },
  {
    keywords: ["scam", "fraud", "crypto", "dm", "cash app", "zelle"],
    title: "Avoiding money scams",
    body: [
      "If someone pressures you to act fast, hide it from parents, pay with gift cards, send crypto, or refund them first, that is a giant red flag.",
      "Do not trust screenshots of payments. Verify money directly inside your own banking app.",
      "Never share one-time codes, debit card PINs, or login details.",
      "When something feels weird, pause and ask a trusted adult before sending money."
    ]
  }
];

const fallbackTips = [
  "Start by protecting the basics: spend less than you make, build a small savings buffer, and avoid high-interest debt if you can.",
  "If money feels messy, write down just three things first: income, fixed bills, and how much is left after those bills.",
  "The best financial system is one you can repeat every week, not one that looks impressive for one day."
];

const toolConfigs = {
  budget: {
    eyebrow: "Premium Tool",
    title: "Budget Planner",
    description: "Use one monthly income number to build a beginner-friendly spending plan."
  },
  paycheck: {
    eyebrow: "Premium Tool",
    title: "Paycheck Estimator",
    description: "Estimate take-home pay after common taxes and see where your check is going."
  }
};

function showPage(pageName) {
  currentPage = pageName;

  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.page === pageName);
  });

  pages.forEach((page) => {
    page.classList.toggle("active", page.dataset.page === pageName);
  });

  if (window.location.hash !== `#${pageName}`) {
    history.replaceState(null, "", `#${pageName}`);
  }

  if (pageName === "chat") {
    userInput.focus();
  }
}

function resolveInitialPage() {
  const hashPage = window.location.hash.replace("#", "");
  const validPages = new Set(["home", "chat", "tools", "troubleshooting"]);
  showPage(validPages.has(hashPage) ? hashPage : "home");
}

function addMessage(role, text) {
  const message = document.createElement("div");
  message.className = `message ${role}`;
  message.innerHTML = role === "bot" ? formatBotMessage(text) : formatUserMessage(text);
  chatLog.appendChild(message);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatUserMessage(text) {
  return `<p class="message-paragraph">${escapeHtml(text)}</p>`;
}

function formatBotMessage(text) {
  const cleaned = text
    .replaceAll("\r\n", "\n")
    .replace(/^\s*[*•]\s+/gm, "")
    .replace(/^\s*-\s+/gm, "")
    .trim();

  const blocks = cleaned.split(/\n{2,}/).filter(Boolean);
  const html = blocks
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);

      if (lines.length === 0) {
        return "";
      }

      if (lines.length > 1 && lines.every((line) => /^\d+[.)]\s+/.test(line))) {
        const items = lines
          .map((line) => line.replace(/^\d+[.)]\s+/, ""))
          .map((line) => `<li>${escapeHtml(line)}</li>`)
          .join("");

        return `<ol class="message-list">${items}</ol>`;
      }

      if (lines.length > 1 && lines.every((line) => /^[A-Z][A-Za-z\s]+:\s/.test(line))) {
        const items = lines
          .map((line) => {
            const [label, ...rest] = line.split(":");
            return `<li><span class="message-label">${escapeHtml(label)}:</span> ${escapeHtml(rest.join(":").trim())}</li>`;
          })
          .join("");

        return `<ul class="message-list message-list-clean">${items}</ul>`;
      }

      if (lines[0].endsWith(":") && lines.length > 1) {
        const title = `<p class="message-heading">${escapeHtml(lines[0].slice(0, -1))}</p>`;
        const items = lines
          .slice(1)
          .map((line) => line.replace(/^\d+[.)]\s+/, ""))
          .map((line) => `<li>${escapeHtml(line)}</li>`)
          .join("");

        return `${title}<ul class="message-list message-list-clean">${items}</ul>`;
      }

      return lines
        .map((line, index) => {
          if (index === 0 && lines.length === 1 && line.length < 42 && !/[.?!]$/.test(line)) {
            return `<p class="message-heading">${escapeHtml(line)}</p>`;
          }

          return `<p class="message-paragraph">${escapeHtml(line)}</p>`;
        })
        .join("");
    })
    .join("");

  return html || `<p class="message-paragraph">${escapeHtml(cleaned)}</p>`;
}

function resetChat() {
  chatLog.innerHTML = "";
  conversationHistory = [];
  addMessage("bot", introMessage);
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

function setStatus(message, isLive) {
  apiStatus.textContent = message;
  apiStatus.style.color = isLive ? "var(--secondary)" : "var(--muted)";
}

async function checkServer() {
  try {
    const response = await fetch("/api/health");

    if (!response.ok) {
      throw new Error("Health check failed.");
    }

    const payload = await response.json();

    if (payload.liveAiReady) {
      serverReady = true;
      setStatus(
        `Live AI mode is on with Cloudflare Workers AI using ${payload.model || "the configured beta model"}.`,
        true
      );
      return;
    }

    serverReady = false;

    if (payload.reason === "cloudflare_ai_binding_missing") {
      setStatus(
        "Cloudflare Pages is running, but the Workers AI binding is missing in this environment. Chat will use built-in guidance for now.",
        false
      );
      return;
    }

    setStatus("Live AI is not ready right now. DollarBot is using built-in guidance mode.", false);
  } catch {
    serverReady = false;
    setStatus("Cloudflare runtime not detected. Chat is in built-in guidance mode right now.", false);
  }
}

function autoResize() {
  userInput.style.height = "auto";
  userInput.style.height = `${Math.min(userInput.scrollHeight, 180)}px`;
}

function openTool(toolName) {
  currentTool = toolName;
  const config = toolConfigs[toolName];

  toolEyebrow.textContent = config.eyebrow;
  toolTitle.textContent = config.title;
  toolDescription.textContent = config.description;
  toolResult.classList.add("hidden");
  toolResult.textContent = "";

  budgetToolButton.classList.toggle("active", toolName === "budget");
  budgetToolButton.setAttribute("aria-selected", String(toolName === "budget"));
  paycheckToolButton.classList.toggle("active", toolName === "paycheck");
  paycheckToolButton.setAttribute("aria-selected", String(toolName === "paycheck"));

  budgetForm.classList.toggle("hidden", toolName !== "budget");
  paycheckForm.classList.toggle("hidden", toolName !== "paycheck");
}

function showToolResult(text) {
  toolResult.innerHTML = formatBotMessage(text);
  toolResult.classList.remove("hidden");
}

function normalizeCategory(value) {
  return value.trim().replace(/\s+/g, " ");
}

function addCategory(target, rawValue) {
  const value = normalizeCategory(rawValue);

  if (!value) {
    return;
  }

  if (!selectedCategories[target].some((entry) => entry.toLowerCase() === value.toLowerCase())) {
    selectedCategories[target].push(value);
  }

  renderCategoryList(target);
}

function removeCategory(target, value) {
  selectedCategories[target] = selectedCategories[target].filter((entry) => entry !== value);
  renderCategoryList(target);
}

function renderCategoryList(target) {
  const container = target === "budget" ? budgetCategoryList : paycheckCategoryList;
  const categories = selectedCategories[target];

  if (categories.length === 0) {
    container.innerHTML = `<p class="category-empty">No categories added yet. Add a few to make the output feel more personal.</p>`;
    return;
  }

  container.innerHTML = categories
    .map(
      (category) =>
        `<span class="category-tag">${escapeHtml(category)} <button type="button" class="category-remove" data-target="${target}" data-value="${escapeHtml(category)}">x</button></span>`
    )
    .join("");
}

function getCategoryText(target) {
  const categories = selectedCategories[target];
  return categories.length > 0 ? categories.join(", ") : "your top priorities";
}

function getBudgetCategoryAdvice() {
  const categories = selectedCategories.budget.map((entry) => entry.toLowerCase());

  if (categories.includes("emergency fund")) {
    return "Keep your emergency fund category automatic if you can. That one works best when it is protected first.";
  }

  if (categories.includes("transportation")) {
    return "Transportation is a sneaky budget category, so build in a little cushion for rides, gas, or transit passes.";
  }

  if (categories.includes("subscriptions")) {
    return "Subscriptions should stay on a short leash. They feel small, but they stack fast.";
  }

  return "Use your categories to decide what deserves protection first and what can flex if money gets tight.";
}

function getPaycheckCategoryAdvice() {
  const categories = selectedCategories.paycheck.map((entry) => entry.toLowerCase());

  if (categories.includes("tips")) {
    return "If tips are part of your paycheck rhythm, treat them like variable money and avoid building fixed expenses around them.";
  }

  if (categories.includes("saving for school")) {
    return "If school savings is one of your categories, move that money out early before it gets absorbed into everyday spending.";
  }

  if (categories.includes("helping family")) {
    return "If part of your paycheck supports family, split that amount out first so the rest of the plan stays honest.";
  }

  return "Use your categories to decide where this paycheck should go before the money starts disappearing.";
}

function buildBudgetPlan() {
  const income = Number(budgetIncome.value);
  const needsPercent = Number(budgetNeeds.value);
  const wantsPercent = Number(budgetWants.value);
  const savingsPercent = Number(budgetSavings.value);
  const totalPercent = needsPercent + wantsPercent + savingsPercent;

  if (!income || income <= 0) {
    showToolResult("Enter a monthly income above 0 so DollarBot can build a real plan.");
    return;
  }

  if (totalPercent !== 100) {
    showToolResult(`Your percentages currently add up to ${totalPercent}%. Make them total 100% for a clean plan.`);
    return;
  }

  const needsAmount = income * (needsPercent / 100);
  const wantsAmount = income * (wantsPercent / 100);
  const savingsAmount = income * (savingsPercent / 100);
  const emergencyFundMonths = savingsAmount > 0 ? Math.ceil(500 / savingsAmount) : null;

  showToolResult(
    `Monthly income: ${formatMoney(income)}

Priority categories: ${getCategoryText("budget")}

Needs: ${formatMoney(needsAmount)} (${needsPercent}%)
Wants: ${formatMoney(wantsAmount)} (${wantsPercent}%)
Savings: ${formatMoney(savingsAmount)} (${savingsPercent}%)

DollarBot take:
${getBudgetCategoryAdvice()}

Next move:
If you saved ${formatMoney(savingsAmount)} per month, you could reach a starter $500 emergency buffer in about ${
      emergencyFundMonths ? `${emergencyFundMonths} month${emergencyFundMonths === 1 ? "" : "s"}` : "an unknown amount of time"
    }.`
  );
}

function estimatePaycheck() {
  const hourlyRate = Number(payRate.value);
  const hours = Number(hoursWorked.value);
  const federal = Number(federalTax.value);
  const state = Number(stateTax.value);

  if (!hourlyRate || !hours || hourlyRate <= 0 || hours <= 0) {
    showToolResult("Enter a real hourly rate and hours worked so DollarBot can estimate your paycheck.");
    return;
  }

  const grossPay = hourlyRate * hours;
  const socialSecurity = grossPay * 0.062;
  const medicare = grossPay * 0.0145;
  const federalWithholding = grossPay * (federal / 100);
  const stateWithholding = grossPay * (state / 100);
  const totalTaxes = socialSecurity + medicare + federalWithholding + stateWithholding;
  const netPay = grossPay - totalTaxes;

  showToolResult(
    `Estimated gross pay: ${formatMoney(grossPay)}
Estimated take-home pay: ${formatMoney(netPay)}

Priority categories: ${getCategoryText("paycheck")}

Estimated deductions:
Federal withholding: ${formatMoney(federalWithholding)}
State withholding: ${formatMoney(stateWithholding)}
Social Security: ${formatMoney(socialSecurity)}
Medicare: ${formatMoney(medicare)}

DollarBot take:
${getPaycheckCategoryAdvice()}

Next move:
Plan your budget around ${formatMoney(netPay)}, not your gross pay, so you do not accidentally overspend.`
  );
}

function hasAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function getLastUserMessage() {
  for (let index = conversationHistory.length - 1; index >= 0; index -= 1) {
    const entry = conversationHistory[index];

    if (entry.role === "user") {
      return entry.text.toLowerCase();
    }
  }

  return "";
}

function buildCoachingReply(title, points, nextStep) {
  return `${title}\n\n${points.join("\n\n")}\n\nNext step:\n${nextStep}`;
}

function getReply(input) {
  const text = input.toLowerCase();
  const lastUserMessage = getLastUserMessage();

  if (!text.trim()) {
    return "Send me a question and I’ll help break it down.";
  }

  if (text.includes("invest") || text.includes("stock") || text.includes("options")) {
    return [
      "I can explain the basics, but I want to be careful here because investing choices can carry real risk.",
      "For most beginners, the bigger wins usually come first from building an emergency fund, avoiding bad debt, and learning how accounts and risk work.",
      "If you want, I can explain investing in plain English without giving personalized buy or sell advice."
    ].join("\n\n");
  }

  if (text.includes("depressed") || text.includes("hopeless") || text.includes("suicide")) {
    return [
      "I’m really sorry you’re carrying that.",
      "If you might act on thoughts of hurting yourself, call or text 988 right now in the U.S. for immediate support.",
      "If this is about money stress, we can still work through the financial part too, but your safety comes first."
    ].join("\n\n");
  }

  if (hasAny(text, ["budget", "budgeting"])) {
    const detailedBudget = /\$?\d+/.test(text);

    return buildCoachingReply(
      "Budget game plan",
      detailedBudget
        ? [
            "Start with three buckets: needs, wants, and savings. That keeps the decision simple.",
            "A strong beginner split is 50% needs, 30% wants, and 20% savings, but if money is tight, even 5% savings is still a win.",
            "Before you lock a budget in, list your fixed costs first: phone, rides, food, subscriptions, and school or work costs."
          ]
        : [
            "The goal of a budget is not to make life miserable. It is to tell your money where to go before it disappears.",
            "Start by writing down monthly income, fixed costs, and how much is left after those fixed costs.",
            "Then give every remaining dollar a job: spend, save, or keep as a cushion."
          ],
      detailedBudget
        ? "Open Premium Tools if you want to personalize a budget with your own categories."
        : "Reply with your monthly income and your main bills, and I’ll help you sketch a simple version."
    );
  }

  if (hasAny(text, ["save", "saving", "emergency fund"])) {
    return buildCoachingReply(
      "How to start saving without feeling broke",
      [
        "Shrink the goal first. Your first savings target does not need to be $1,000. Start with $100, then $250, then build from there.",
        "Automate something small on payday, even if it is only $5 or $10. Tiny and automatic beats ambitious and inconsistent.",
        "Keep the emergency fund for actual surprises like transport, repairs, medicine, or a work expense, not random shopping."
      ],
      "Pick one starter target, like $100, and I can help you make a plan to reach it."
    );
  }

  if (hasAny(text, ["credit", "credit card", "credit score"])) {
    return buildCoachingReply(
      "Credit basics without the fluff",
      [
        "A credit card is not extra money. It is borrowed money that gets expensive fast if you do not pay it off.",
        "If you want to build credit safely, only charge small planned purchases and pay the full statement balance on time every month.",
        "The biggest beginner mistake is carrying a balance because the minimum payment looks small. That is how interest starts eating your money."
      ],
      "If you want, ask me whether a beginner should start with debit first, secured credit, or wait."
    );
  }

  if (hasAny(text, ["debit", "checking", "bank account", "overdraft"])) {
    return buildCoachingReply(
      "Bank account basics",
      [
        "Debit is usually the easier beginner tool because it spends money you already have.",
        "The main trap is overdraft. That means spending more than is in the account and getting hit with fees.",
        "Turn on balance alerts, check your account a couple times a week, and keep a small buffer in checking if you can."
      ],
      "If you want, I can help you figure out what to look for in a first checking account."
    );
  }

  if (hasAny(text, ["paycheck", "w-2", "w2", "tax", "taxes", "withholding"])) {
    return buildCoachingReply(
      "Why your paycheck feels smaller than your math",
      [
        "Gross pay is the full amount you earned. Net pay is what actually lands in your account.",
        "A normal paycheck often has federal withholding, state withholding, Social Security, and Medicare taken out before you see it.",
        "That means your real budget should be based on take-home pay, not your hourly rate times hours worked."
      ],
      "Open Premium Tools if you want to personalize a paycheck plan with your own categories."
    );
  }

  if (hasAny(text, ["college", "student loan", "loan", "fafsa", "tuition"])) {
    return buildCoachingReply(
      "Student money choices",
      [
        "Before borrowing, compare the full cost of the school, not just the yearly sticker price.",
        "Use money you do not have to pay back first: grants, scholarships, work-study, and lower-cost school options.",
        "If you do take loans, understand the monthly payment after graduation and the total amount repaid, not just the amount borrowed."
      ],
      "If you want, tell me the school cost and how much aid you already have, and I’ll help you think it through."
    );
  }

  if (hasAny(text, ["scam", "fraud", "cash app", "zelle", "crypto"])) {
    return buildCoachingReply(
      "Scam check",
      [
        "If someone pressures you to move fast, keep it secret, or send money first, that is a major red flag.",
        "Never trust screenshots as proof of payment. Verify money inside your own app or account.",
        "Do not share one-time codes, PINs, or logins, even if the person sounds official."
      ],
      "If you want, paste the exact situation and I’ll tell you the red flags I see."
    );
  }

  if (hasAny(text, ["should i", "what should i do", "help me decide"])) {
    return buildCoachingReply(
      "Decision framework",
      [
        "When money decisions feel messy, compare them using three questions: does this help me stay safe, does it keep me out of debt, and can I repeat it next month?",
        "Usually the better move is the one that protects cash flow and keeps future options open.",
        "If two choices still seem close, write out the cost now, the cost later, and the risk if something goes wrong."
      ],
      "Send me the two choices you are deciding between and I’ll compare them with you."
    );
  }

  if (hasAny(text, ["yes", "yeah", "ok", "okay", "sure"]) && hasAny(lastUserMessage, ["income", "bills", "monthly"])) {
    return "Send me your monthly income, your fixed bills, and any savings target you care about. I’ll turn that into a rough plan.";
  }

  const match = knowledgeBase.find((entry) =>
    entry.keywords.some((keyword) => text.includes(keyword))
  );

  if (match) {
    return `${match.title}\n\n${match.body.join("\n\n")}`;
  }

  if (/\$?\d+/.test(text) && (text.includes("month") || text.includes("paycheck"))) {
    return [
      "I see numbers in your question, which is useful.",
      "A simple next step is to split the money into needs, savings, and wants before you decide anything else.",
      "Reply with your income, fixed bills, and savings goal, and I can turn it into a rough plan."
    ].join("\n\n");
  }

  return [
    fallbackTips[Math.floor(Math.random() * fallbackTips.length)],
    "If you want a sharper answer, include your age range, whether this is about school or work, and the exact money decision you’re trying to make."
  ].join("\n\n");
}

async function getLiveReply(input) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: input,
      history: conversationHistory.slice(-10)
    })
  });

  if (!response.ok) {
    let errorMessage = "Live AI request failed.";

    try {
      const errorPayload = await response.json();
      errorMessage = errorPayload.error?.message || errorPayload.error || errorMessage;
    } catch (error) {
      errorMessage = `${errorMessage} Status ${response.status}.`;
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.reply?.trim() || "I got a response back, but it was empty.";
}

async function handlePrompt(prompt) {
  if (isAwaitingReply) {
    return;
  }

  showPage("chat");
  isAwaitingReply = true;
  addMessage("user", prompt);
  conversationHistory.push({ role: "user", text: prompt });
  addMessage("bot", serverReady ? "Thinking..." : "Using built-in guidance mode...");

  const placeholder = chatLog.lastElementChild;

  try {
    const reply = serverReady ? await getLiveReply(prompt) : getReply(prompt);
    placeholder.innerHTML = formatBotMessage(reply);
    conversationHistory.push({ role: "assistant", text: reply });
  } catch (error) {
    const fallbackReply =
      `Live AI is temporarily unavailable.\n\n${error.message}\n\nUsing built-in guidance instead:\n\n${getReply(prompt)}`;
    placeholder.innerHTML = formatBotMessage(fallbackReply);
    conversationHistory.push({ role: "assistant", text: fallbackReply });
    setStatus("Live AI hit a temporary issue. This answer used built-in guidance instead.", false);
  } finally {
    isAwaitingReply = false;
  }
}

function handleCategorySubmission(target) {
  const input = target === "budget" ? budgetCategoryInput : paycheckCategoryInput;
  addCategory(target, input.value);
  input.value = "";
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const prompt = userInput.value.trim();

  if (!prompt) {
    return;
  }

  handlePrompt(prompt);
  userInput.value = "";
  autoResize();
});

userInput.addEventListener("input", autoResize);

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

getStartedButton.addEventListener("click", () => {
  showPage("chat");
});

openToolsButton.addEventListener("click", () => {
  showPage("tools");
});

refreshStatusButton.addEventListener("click", () => {
  checkServer();
  showPage("troubleshooting");
});

starterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    handlePrompt(button.dataset.prompt);
  });
});

lessonButtons.forEach((button) => {
  button.addEventListener("click", () => {
    handlePrompt(button.dataset.prompt);
  });
});

clearChatButton.addEventListener("click", () => {
  resetChat();
});

budgetToolButton.addEventListener("click", () => {
  openTool("budget");
});

paycheckToolButton.addEventListener("click", () => {
  openTool("paycheck");
});

budgetForm.addEventListener("submit", (event) => {
  event.preventDefault();
  buildBudgetPlan();
});

paycheckForm.addEventListener("submit", (event) => {
  event.preventDefault();
  estimatePaycheck();
});

addBudgetCategoryButton.addEventListener("click", () => {
  handleCategorySubmission("budget");
});

addPaycheckCategoryButton.addEventListener("click", () => {
  handleCategorySubmission("paycheck");
});

budgetCategoryInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleCategorySubmission("budget");
  }
});

paycheckCategoryInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleCategorySubmission("paycheck");
  }
});

categoryPills.forEach((button) => {
  button.addEventListener("click", () => {
    addCategory(button.dataset.target, button.dataset.value);
  });
});

budgetCategoryList.addEventListener("click", (event) => {
  const target = event.target;

  if (target instanceof HTMLElement && target.classList.contains("category-remove")) {
    removeCategory(target.dataset.target, target.dataset.value);
  }
});

paycheckCategoryList.addEventListener("click", (event) => {
  const target = event.target;

  if (target instanceof HTMLElement && target.classList.contains("category-remove")) {
    removeCategory(target.dataset.target, target.dataset.value);
  }
});

checkServer();
resetChat();
renderCategoryList("budget");
renderCategoryList("paycheck");
openTool("budget");
resolveInitialPage();
