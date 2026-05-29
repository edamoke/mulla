# Mulla Enterprise & Retail System Analysis

This document provides a deep, comprehensive analysis of the system architecture, database layout, existing pages/features, and identifies missing API routes, potential vulnerabilities, and an actionable roadmap for production readiness.

---

## 1. System Architecture Overview

Mulla is a Next.js (App Router) enterprise and hospitality platform integrated with Supabase for real-time data synchronization, multi-role authentication, and asset tracking.

The application has three core domains:
1. **Property & Tenancy Management:** Short-term tourist/guest stays, long-term leasing, rent collections, housekeeping dispatch, and logging.
2. **Retail & E-Commerce:** Storefront online shop with shopping cart, structured checkout flow, integrated POS (Point of Sale) terminal for physical storefront sales, and live inventory control.
3. **Core Administration Panel:** A cohesive administrative portal (`/admin`) grouping inventory trackers, products management, booking administration, cleaning staff tracking, financial ledger, and CRM.
4. **AI-Enabled Virtual Concierge:** Powered by the Vercel AI SDK and OpenAI/similar models, the boty chatbot (`/api/chat`) performs dynamic tool execution to query live categories, products, apartments, and adapts its persona dynamically from settings.

---

## 2. Directory & Route Map

Below is a detailed map of existing routes, endpoints, and storage files.

### 2.1 Public Front-Facing Pages
* `app/page.tsx` - Homepage with Hero section, local recommendations, and trust badges.
* `app/shop/page.tsx` - Catalog view for e-commerce products with categories and quick cart hooks.
* `app/product/[id]/page.tsx` - Product details page with image gallery, specs, and add-to-cart controls.
* `app/apartments/page.tsx` - Rental catalog with filters for short-term and long-term properties.
* `app/apartments/[slug]/page.tsx` - Property listing detailing layout, pricing, check-in, check-out dates, and active calendar checks.
* `app/checkout/page.tsx` - Secure cart-to-purchase page with customer details and mpesa triggering.

### 2.2 Customer Portal (`/account`)
* `app/account/page.tsx` - Portal landing with user details and quick tabs.
* `app/account/orders/page.tsx` - Order tracking with history and fulfillment status.
* `app/account/bookings/page.tsx` - Live list of current, upcoming, and historical short-term apartment stays.
* `app/account/tenant/page.tsx` - Long-term tenancy dashboard displaying rent invoices, partial balances, utilities due, and real-time payment methods.

### 2.3 Administrative Dashboards (`/admin`)
* `app/admin/page.tsx` - High-level metrics (Total Revenue, Total Orders, Active Bookings, Recent Activity streams).
* `app/admin/pos/page.tsx` - Virtual cash register for staff handling in-person custom checkout orders, barcode lookup emulation, and payment choice logging.
* `app/admin/products/page.tsx` - Product grid with quick controls to create, modify, or retire items.
* `app/admin/inventory/page.tsx` - Stock tracking grid matching stock levels, low-stock thresholds, and physical stock history.
* `app/admin/orders/page.tsx` - Order grid showing online and POS transactions.
* `app/admin/apartments/page.tsx` - Property registry with fields for unit number, bedrooms, pricing model, and description.
* `app/admin/bookings/page.tsx` - Guest list detailing check-ins, check-outs, guest metadata, and billing.
* `app/admin/rent/page.tsx` - Recurring rent registry detailing tenant names, billing terms, overdue flagging, and payment allocations.
* `app/admin/cleaning/page.tsx` - Housekeeper assignment log, clock-in tracking, dynamic checklists, and structural issues reporter.
* `app/admin/accounting/page.tsx` - Ledgers grouped by charts of accounts, operational expenses, gross revenue, and tax logs.
* `app/admin/crm/page.tsx` - Customer ledger tracking consumer segments, feedback, and aggregate lifetime values.
* `app/admin/staff/page.tsx` - Employee directory with role settings, departments, and onboarding metadata.
* `app/admin/cms/page.tsx` - Editor for landing page layouts and hero subtitles.
* `app/admin/settings/page.tsx` - Configuration of tax rates, currencies, POS capabilities, and AI bot behaviors.

---

## 3. Database Schema Overview (Supabase Tables)

The system relies on the following database schema in Supabase:

* `profiles` - Extended metadata for authenticated users (roles: `customer`, `staff`, `admin`).
* `categories` - Product groups (e.g., jewelry, beachwear).
* `products` - Dynamic retail listings with stock control and automatic inventory hooks.
* `inventory_transactions` - Historic records of stock variations (types: `sale`, `manual-adjustment`, `restock`, `return`).
* `orders` - Order records (online or POS).
* `order_items` - Product items, quantities, and prices matching each order.
* `apartments` - Short-term and long-term units with pricing types and availability status.
* `apartment_bookings` - Short-term stay records including payment details, guest counts, and check dates.
* `rent_payments` - Recurring monthly billing records for long-term tenants.
* `cleaning_logs` - Cleaning tasks, duration, clock-in status, and issue logs.
* `cleaning_checklists` - Standard templates of tasks by cleaning type.
* `staff` - Core worker registry, roles, departments, and active statuses.
* `expenses` - Internal ledger for corporate payments, recurring bills, utilities, and wages.
* `chart_of_accounts` - Bookkeeping categories used to organize the accounting module.
* `pos_transactions` & `pos_transaction_items` - Core records for in-person storefront checkouts.

---

## 4. Missing API Routes and Architectural Gaps

Although the system is highly comprehensive and the frontend flows are fully implemented, there are several key backend structural improvements needed to move from a mock/staging architecture to a production-grade enterprise system:

### 4.1 Missing API Endpoints for Admin Write Actions
* **The Gap:** Many admin sub-dashboards (such as `/admin/staff`, `/admin/apartments`, `/admin/inventory`, `/admin/cleaning`, `/admin/accounting`, `/admin/crm`) perform database mutations directly using the client-side Supabase client (`createClient` from `@/lib/supabase/client`).
* **The Impact:** If Row-Level Security (RLS) is misconfigured or disabled on any table, a malicious authenticated user (with role `customer`) can execute direct mutations from the browser console, altering staff rosters, changing pricing, or wiping accounting logs.
* **The Solution:** Consolidate these mutations behind server-side API endpoints (`/api/admin/products`, `/api/admin/apartments`, `/api/admin/staff`, etc.) that enforce secure session checks on the server.

### 4.2 M-Pesa Callback Webhook Endpoint
* **The Gap:** While orders and rent checkouts trigger simulated STK push requests and wait on loading indicators, there is no public IPN (Instant Payment Notification) callback route.
* **The Solution:** Introduce `/api/payments/mpesa-callback` which Safaricom's API will hit asynchronously with JSON payment success payloads (e.g., matching the `CheckoutRequestID`). This endpoint will securely look up the booking, order, or rent payment record and update the state to `paid`.

### 4.3 Missing Unified System Auditing Ledger
* **The Gap:** While changes to product inventory levels are logged in `inventory_transactions`, other critical actions (like changing user roles, modifying staff payroll metadata, or deleting active booking histories) do not have a corresponding audit trail.
* **The Solution:** Implement a centralized database log and secure API endpoint to store system-wide administrative audit trails.

---

## 5. Security & Production-Readiness Recommendations

1. **Role-Based Server-Side Middleware Enforcement:**
   Add a strict interceptor layer to `middleware.ts` to ensure that any request under `/admin` or `/api/admin` is validated server-side for `user.metadata.role === 'admin' || 'staff'`.
2. **Restrictive Supabase RLS Policies:**
   Configure strict table policies where only server-side service-role requests or authorized administrative identities can run `INSERT`, `UPDATE`, or `DELETE` operations on core system logs.
3. **Automated Low-Stock Email Notifications:**
   Implement an automated trigger inside `/api/orders` to send email alerts to management when inventory hits standard low-stock thresholds.

---

This complete system analysis serves as a developmental roadmap for building production-ready features across the Mulla enterprise application.
