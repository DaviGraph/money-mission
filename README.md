# Money Mission

LOVABLE MASTER PROMPT: 60-DAY ₦500,000 BUSINESS CHALLENGE TRACKER

Build a fully functional, modern personal finance and business performance tracking web application called 60-Day Money Mission.

1. PRODUCT OVERVIEW

The application is designed to help me track my progress toward earning ₦500,000 within 60 days through:

- Website development services.
- AI automation services.
- AI Automation Masterclasses and training.
- Other legitimate business income.

Challenge configuration:

- Starting date: November 2, 2026.
- Deadline: December 31, 2026.
- Duration: 60 days.
- Financial target: ₦500,000.
- Currency: Nigerian Naira (₦).
- Timezone: Africa/Lagos.

The application should function as a personal business financial command center, combining income tracking, expense management, sales pipeline management, daily productivity, and financial analytics.

This must be a working application, not just a beautiful dashboard mockup.

2. DESIGN DIRECTION AND USER EXPERIENCE

Create a premium, modern fintech dashboard.

Design inspiration:

- Linear's clean interface.
- Stripe's financial dashboard.
- Modern personal finance applications.
- Professional SaaS analytics dashboards.

Visual direction:

- Clean, minimal, sophisticated.
- Dark sidebar navigation with a light main dashboard.
- White and soft-gray surfaces.
- Deep green for positive financial performance.
- Subtle red for expenses and negative performance.
- Blue for pipeline and pending payments.
- Large, readable financial figures.
- Beautiful charts and progress indicators.
- Rounded cards with subtle borders and shadows.
- Consistent spacing and typography.

Avoid:

- Excessive gradients.
- Overcrowded dashboards.
- Unnecessary animations.
- Childish gamification.
- Decorative elements that reduce readability.

The application must be responsive and optimized for mobile, tablet, and desktop.

3. APPLICATION NAVIGATION

Create the following navigation:

1. Overview (Dashboard)
2. Income
3. Expenses
4. Deals & Pipeline
5. Daily Activity
6. Analytics
7. Settings

Use a collapsible sidebar on desktop and a mobile-friendly navigation system.

4. OVERVIEW DASHBOARD

This is the most important screen.

All essential financial information must be visible immediately without scrolling on a standard desktop viewport.

A. Main Financial Progress Card

Display:

- Target: ₦500,000.
- Actual collected income.
- Remaining amount.
- Percentage completed.
- A large animated horizontal progress bar.

Example:

Target: ₦500,000
Collected: ₦150,000
Remaining: ₦350,000
Progress: 30%.

Only successfully received payments should contribute to this progress.

B. Daily Required Run Rate

Calculate the amount I must earn daily to reach the target.

Formula:

Remaining Target ÷ Remaining Challenge Days.

Example:

If ₦350,000 remains and 35 days remain:

Required daily income = ₦10,000.

This value must automatically recalculate every day.

If I miss my target on certain days, the required daily amount should increase accordingly.

Display:

- Required daily income.
- Today's income.
- Difference between today's income and daily target.
- Whether I am ahead or behind schedule.

C. Net Income / Profit Summary

Display three financial metrics:

1. Total collected income.
2. Total recorded business expenses.
3. Net profit.

Formula:

Net Profit = Collected Income - Expenses.

Clearly distinguish revenue from profit.

D. Countdown Widget

Show:

- Days elapsed.
- Days remaining.
- Challenge end date.
- Current challenge day (e.g. Day 15 of 60).

Use a real-time date calculation based on Africa/Lagos.

E. Quick Financial Cards

Include:

- Total paid income.
- Pending payments.
- Outstanding pipeline value.
- Total expenses.
- Net profit.
- Expense-to-income ratio.

F. Revenue Breakdown

Show a chart of collected income by source:

- Website Development.
- AI Automation.
- Masterclass / Training.
- Other.

Use a clean doughnut chart.

G. Recent Transactions

Display the latest income and expense records with:

- Description.
- Category.
- Date.
- Amount.
- Status.

Include a quick action to add income or expense.

5. INCOME MANAGEMENT

Create a dedicated income management page.

Allow me to record and manage every payment.

Income Form Fields

- Client or source name.
- Service/project name.
- Revenue category:
  - Website Development.
  - AI Automation.
  - Masterclass.
  - Other.
- Project/deal total value.
- Amount received.
- Payment status:
  - Paid.
  - Partially Paid.
  - Pending / Invoice Sent.
- Payment date.
- Description or notes.

Important Payment Logic

Support partial payments.

Example:

A client agrees to pay ₦150,000.

They pay ₦75,000 upfront.

The application should display:

- Deal value: ₦150,000.
- Amount collected: ₦75,000.
- Outstanding balance: ₦75,000.
- Payment status: Partially Paid.

When the remaining ₦75,000 is received, update the existing payment record or add a linked payment entry.

Never count the outstanding balance as collected income.

Income Table

Include:

- Client.
- Project.
- Category.
- Deal value.
- Amount received.
- Outstanding balance.
- Status.
- Date.

Features:

- Search.
- Filter by category.
- Filter by payment status.
- Sort by date and amount.
- Edit records.
- Delete records with confirmation.

6. DEALS AND SALES PIPELINE

Build a lightweight CRM-style pipeline.

I need to track potential clients before they pay.

Deal Information

- Business/client name.
- Contact information (optional).
- Business industry.
- Service being offered.
- Estimated deal value.
- Deal stage.
- Expected closing date.
- Notes.
- Next follow-up date.

Deal Stages

Use a visual Kanban board:

1. New Lead.
2. Contacted.
3. Interested.
4. Discovery Call.
5. Proposal Sent.
6. Negotiation.
7. Won.
8. Lost.

Allow me to move deals between stages.

Pipeline Analytics

Display:

- Total potential deal value.
- Number of active prospects.
- Number of proposals sent.
- Number of deals won.
- Number of lost deals.
- Deal conversion rate.

Important:

Won deals should only contribute to actual collected income when payments are recorded.

Pending and estimated deals must remain separate from actual revenue.

7. EXPENSE MANAGEMENT

Build a dedicated expense tracking page.

Expense Form

Fields:

- Expense description.
- Amount (₦).
- Category.
- Expense date.
- ROI classification.
- Optional notes.

Expense Categories

- Tools / Software.
- Ads / Marketing.
- Data / Internet.
- Transport.
- Education / Learning.
- Miscellaneous.

ROI Classification

Two classifications:

1. Essential / Income-Generating.
2. Non-Essential.

Expense Analytics

Calculate:

Total Expenses = Sum of all recorded expenses.

Expense-to-Income Ratio:

(Total Expenses ÷ Collected Income) × 100.

Display:

- Total expenses.
- Essential expenses.
- Non-essential expenses.
- Monthly expense breakdown.
- Expense category breakdown.
- Expense-to-income ratio.

Warn me when expenses become disproportionately high relative to collected income.

If income is zero, avoid division-by-zero errors and display an appropriate message.

8. DAILY ACTIVITY AND STREAK SYSTEM

Build a daily productivity tracking system.

The goal is to encourage consistent actions that generate business revenue.

Daily Activity Checklist

Allow me to record:

- New businesses researched.
- Personalized pitches sent.
- Follow-up messages sent.
- Discovery calls completed.
- Proposals sent.
- Deals closed.
- Content published.
- Client work completed.

Include a checkbox for each activity.

Daily Income Streak

Create a streak counter.

A qualifying day is a day when I either:

- Receive and record income, OR
- Complete at least one qualifying income-generating business activity, such as sending a personalized pitch, following up with a prospect, completing a sales call, or sending a proposal.

Display:

- Current streak.
- Longest streak.
- Total active days.
- Missed days.

Do not count simply opening the application as an activity.

The streak must be calculated from saved daily records, not random animations.

Daily Reflection

Add a daily journal section with:

- What did I accomplish today?
- What went wrong?
- What did I learn?
- What will I improve tomorrow?

Save reflections with their respective dates.

Display previous entries in chronological order.

9. ANALYTICS AND FINANCIAL REPORTS

Create an analytics page with meaningful financial insights.

Include:

Income Analytics

- Daily income chart.
- Weekly income chart.
- Cumulative income chart.
- Revenue by service category.
- Revenue by client/source.

Expense Analytics

- Daily and weekly expenses.
- Expense category distribution.
- Essential vs non-essential spending.

Business Performance

- Average daily revenue.
- Average deal value.
- Total deals closed.
- Conversion rate.
- Average expenses.
- Net profit.
- Progress against target.

Financial Projection

Calculate whether my current sales pipeline and historical earning pace suggest that I can reach ₦500,000.

Show three separate figures:

1. Actual collected revenue.
2. Weighted pipeline projection.
3. Remaining revenue gap.

For weighted pipeline projections, use configurable probability percentages based on deal stages. Clearly label projections as estimates, not guaranteed earnings.

10. QUICK ACTIONS

Make it easy to record transactions.

Add a floating or prominent quick-action button with:

- Add Income.
- Add Expense.
- Add New Deal.
- Log Daily Activity.

Forms should be simple and quick to complete.

Use confirmation messages after successful saves.

11. DATABASE AND BACKEND

Use Supabase with PostgreSQL for persistent data storage.

Use Supabase authentication so that the financial information remains private.

Enable Row Level Security (RLS) on every user-owned table.

A user must only be able to access their own records.

Create an appropriate database structure.

Suggested tables:

profiles

- id (UUID, linked to auth.users).
- full_name.
- created_at.

goals

- id (UUID).
- user_id.
- target_amount (numeric, default 500000).
- start_date (date).
- end_date (date).
- currency (default NGN).
- created_at.

transactions

- id (UUID).
- user_id.
- type (income or expense).
- amount (numeric).
- category (text).
- status (text).
- description (text).
- transaction_date (date).
- created_at.

income_records

- id (UUID).
- user_id.
- client_name.
- project_name.
- category.
- deal_value (numeric).
- amount_received (numeric).
- payment_status.
- payment_date.
- notes.
- created_at.

deals

- id (UUID).
- user_id.
- client_name.
- contact_information.
- service_type.
- estimated_value (numeric).
- stage.
- probability (numeric).
- expected_close_date.
- next_follow_up_date.
- notes.
- created_at.

expenses

- id (UUID).
- user_id.
- description.
- amount (numeric).
- category.
- roi_classification.
- expense_date.
- notes.
- created_at.

daily_activities

- id (UUID).
- user_id.
- activity_date.
- researched_businesses (integer).
- pitches_sent (integer).
- followups_sent (integer).
- calls_completed (integer).
- proposals_sent (integer).
- deals_closed (integer).
- content_published (integer).
- client_work_completed (integer).
- reflection.
- created_at.

Ensure that financial records are not duplicated across multiple tables when calculating totals.

Use reliable database queries or views to calculate totals and financial summaries.

Use appropriate constraints and indexes.

12. SETTINGS

Create a settings page where I can:

- Edit my financial target.
- Change challenge start and end dates.
- Update my personal profile.
- Set daily outreach targets.
- Configure pipeline probability percentages.
- Choose light or dark theme.
- Export financial records to CSV.
- View account information.

Default settings should be configured for the ₦500,000 / 60-day challenge.

13. FUNCTIONAL REQUIREMENTS

This is extremely important.

Do not build a static UI.

Every major feature must work.

Requirements:

- All forms must save data.
- All records must be editable.
- All records must be deletable with confirmation.
- Dashboard figures must update immediately after a transaction is saved.
- Charts must use real database records.
- Financial calculations must be accurate.
- Dates must use the Africa/Lagos timezone.
- Empty states must be designed properly.
- Loading states and error handling must exist.
- Authentication must work.
- Database security must be implemented.
- The application must work on mobile devices.
- CSV export must generate actual downloadable files.

Do not use fake financial data in the production dashboard.

If the database is empty, display ₦0 and helpful empty states.

14. FINANCIAL CALCULATION RULES

Use these definitions consistently:

Collected Revenue = Sum of successfully received income payments.

Pending Revenue = Outstanding unpaid balances.

Total Expenses = Sum of recorded business expenses.

Net Profit = Collected Revenue - Total Expenses.

Remaining Target = Maximum of zero and (Target - Collected Revenue).

Progress Percentage = (Collected Revenue / Target) × 100.

Daily Required Run Rate = Remaining Target / Remaining Challenge Days.

Expense Ratio = (Total Expenses / Collected Revenue) × 100.

Weighted Pipeline = Sum of (Estimated Deal Value × Stage Probability) for active deals.

Do not include pending invoices or unclosed deals in actual revenue.

For partial payments, count only the amount received.

Do not allow duplicate counting when payments are updated.

Handle dates before the challenge, during the challenge, and after the deadline correctly.

15. DEVELOPMENT APPROACH

Before implementation:

1. Plan the application architecture.
2. Identify the required pages and reusable components.
3. Design the database schema.
4. Plan financial calculation logic.
5. Establish authentication and security.

Then implement the complete application.

Use:

- React.
- TypeScript.
- Tailwind CSS.
- shadcn/ui where appropriate.
- Supabase.
- Recharts for analytics.

Write clean, maintainable, reusable code.

Do not introduce unnecessary dependencies.

Do not expose Supabase service-role keys in frontend code.

Do not create mock backend operations that only simulate saving data.

If Supabase credentials or configuration are missing, clearly identify what needs connecting rather than pretending persistence is working.

16. FINAL PRODUCT EXPECTATION

I want this application to feel like a professional personal business finance command center.

When I open the dashboard, I should immediately understand:

- How much I have earned.
- How much I have spent.
- How much profit I have made.
- How many days remain.
- How much I must earn daily.
- Whether I am on track.
- How much money is sitting in my sales pipeline.
- What business activities I need to complete.

The product should motivate me through real progress, accurate financial information, and actionable insights.

Build a polished, production-minded application, not a landing page or static dashboard.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://money-mission.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/52b0a54d-3fe1-403a-9198-fe098772531e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
