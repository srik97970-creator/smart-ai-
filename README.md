# 🏪 SmartShop AI

### "Your AI Business Assistant for Smarter Stock, Better Offers & Higher Profit"

SmartShop AI is a modern retail management application designed for small and medium-sized shopkeepers. It integrates inventory management, sales tracking, expenses ledger, and profit analysis with proactive AI recommendations, a profit-aware offer engine, and a customizable flyer/pamphlet generator.

---

## 🚀 Features

1. **Dashboard**: Live aggregates of today's sales, gross margins, net profit, low-stock warnings, and slow-moving items. Includes a mini "Ask AI" widget.
2. **Inventory**: Stock management table with search, category filtering, min-stock triggers, and quick stock replenishment modals.
3. **Point of Sale (POS)**: Cashier billing panel featuring offer price deduction calculations, customer selection trackers, and invoice logging.
4. **Customers (CRM)**: Customer profiles, contact numbers, lifetime spending, and dates of last transaction.
5. **Expense Ledger**: Category costs logger (Rent, helper salary, transport, packaging, utilities) that automatically deducts from gross profit to get net profit.
6. **Profit-Aware Offer Engine**: Creates percentage, flat, and BOGO discounts. Performs unit-level margin analysis (buying price vs. selling price vs. discounted price) and restricts negative-profit discounts unless clearance override is explicitly checked.
7. **Pamphlet Designer**: Creates offer poster templates (Festival Sale, Clearance, BOGO, Supermarket) with multi-lingual title/validity text overrides (English, Telugu, Hindi). Generates Whatsapp message scripts and social captions automatically.
8. **AI Business Agent**: Conversational chat interface grounded on actual shop database values to query profits, best-sellers, restocking lists, and promote slow-moving items.
9. **Analytics**: Visual data charts utilizing Recharts for sales revenue trends, category splits, and top sold items.
10. **Reports**: Compiles daily, weekly, monthly financial performance ledgers. Supports exporting to CSV and print-optimized PDF outputs.
11. **Settings**: Edit shop parameters (name, logo URL, address, contact) and customize designer fee metrics.

---

## 📈 Flowchart

```text
                         ┌─────────────────┐
                         │    SHOPKEEPER   │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │     LOGIN /     │
                         │    REGISTER     │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │    DASHBOARD    │
                         └────────┬────────┘
                                  │
                 ┌────────────────┼────────────────┐
                 │                │                │
                 ▼                ▼                ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │  INVENTORY   │ │    SALES     │ │   EXPENSES   │
        └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
               │                │                │
               └────────────────┼────────────────┘
                                ▼
                       ┌──────────────────┐
                       │   AI ANALYSIS    │
                       └────────┬─────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
       ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
       │ LOW STOCK   │  │ SLOW STOCK  │  │ PROFIT      │
       │ DETECTION   │  │ DETECTION   │  │ ANALYSIS    │
       └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
              │                 │                 │
              └─────────────────┼─────────────────┘
                                ▼
                     ┌─────────────────────┐
                     │ AI RECOMMENDATIONS  │
                     └──────────┬──────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │   OFFER GENERATOR   │
                     └──────────┬──────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │ SHOPKEEPER APPROVAL │
                     └──────────┬──────────┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │ PAMPHLET GENERATOR   │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┼─────────────┐
                 ▼             ▼             ▼
           ┌──────────┐ ┌───────────┐ ┌────────────┐
           │ DOWNLOAD │ │ WHATSAPP  │ │ SOCIAL     │
           │          │ │  SHARE    │ │  MEDIA     │
           └──────────┘ └───────────┘ └────────────┘
```

---

## 🗄️ ER Diagram

```text
┌─────────────────────┐
│       SHOP          │
├─────────────────────┤
│ PK shop_id          │
│ shop_name           │
│ owner_name          │
│ phone               │
│ address             │
│ logo_url            │
│ designer_cost       │
└──────────┬──────────┘
           │
           │ 1:N
           ▼
┌─────────────────────┐
│      PRODUCT        │
├─────────────────────┤
│ PK product_id       │
│ FK shop_id          │
│ product_name        │
│ category            │
│ sku                 │
│ barcode             │
│ purchase_price      │
│ selling_price       │
│ quantity            │
│ minimum_stock       │
│ expiry_date         │
└──────────┬──────────┘
           │
           │ 1:N
           ▼
┌─────────────────────┐
│    SALE_ITEM        │
├─────────────────────┤
│ PK sale_item_id     │
│ FK sale_id          │
│ FK product_id       │
│ quantity            │
│ selling_price       │
│ purchase_price      │
│ profit              │
└──────────┬──────────┘
           │
           │ N:1
           ▼
┌─────────────────────┐
│        SALE         │
├─────────────────────┤
│ PK sale_id          │
│ FK shop_id          │
│ FK customer_id      │
│ total_amount        │
│ total_cost          │
│ total_profit        │
│ sale_date           │
└─────────────────────┘


┌─────────────────────┐
│      CUSTOMER       │
├─────────────────────┤
│ PK customer_id      │
│ FK shop_id          │
│ name                │
│ phone               │
│ total_spending      │
│ last_purchase       │
└─────────────────────┘


┌─────────────────────┐
│      EXPENSE        │
├─────────────────────┤
│ PK expense_id       │
│ FK shop_id          │
│ category            │
│ amount              │
│ description         │
│ expense_date        │
└─────────────────────┘


┌─────────────────────┐
│       OFFER         │
├─────────────────────┤
│ PK offer_id         │
│ FK shop_id          │
│ FK product_id       │
│ offer_type          │
│ original_price      │
│ discount            │
│ offer_price         │
│ start_date          │
│ end_date            │
│ status              │
└──────────┬──────────┘
           │
           │ 1:N
           ▼
┌─────────────────────┐
│      PAMPHLET       │
├─────────────────────┤
│ PK pamphlet_id      │
│ FK offer_id         │
│ FK shop_id          │
│ template            │
│ language            │
│ title               │
│ description         │
│ image_url           │
│ generated_date      │
└─────────────────────┘


┌─────────────────────┐
│    AI_INSIGHT       │
├─────────────────────┤
│ PK insight_id       │
│ FK shop_id          │
│ type                │
│ message             │
│ recommendation      │
│ priority            │
│ created_at          │
└─────────────────────┘
```

---

## 🛠️ Installation & Run Instructions

To download all required dependencies and boot up both backend API server and Vite frontend, run:

1. **Install Dependencies**
   ```bash
   npm run install-all
   ```

2. **Database Seeding**
   (Pre-loaded with 20 realistic Indian shop products, customer profiles, expenses, and over 60 historical sale invoice items)
   ```bash
   npm run seed
   ```

3. **Start Development Servers**
   Runs backend server on port `5000` and React Vite dev server on port `3000` with hot-module reloading and local proxy mappings.
   ```bash
   npm run dev
   ```

---

## 🔍 Validation Testing

To execute unit-style assertions validating transaction cascade decreases, margin profit formulas, and AI alerts updates, run:

```bash
node backend/database/test-db.js
```
