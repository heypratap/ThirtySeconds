# ⚡ Thirty Seconds

> **AI Portfolio Website Builder for Students and Developers**  
> Generate a complete, beautifully structured developer portfolio in ~30 seconds using Google Gemini AI, polish it visually in a drag-and-drop editor, and publish it instantly to `/p/:username`.

---

## 🎨 Color Theme & Design System
Thirty Seconds features a clean, warm editorial design palette:
- **Warm Vermilion**: `#E43D12` (Primary brand accent & action color)
- **Raspberry Rose**: `#D6536D` (Secondary accent)
- **Blush Pink**: `#FFA2B6` (Highlight & badge glow)
- **Golden Amber**: `#EFB11D` (Warm highlight)
- **Warm Cream**: `#EBE9E1` (Editorial canvas & card base)

---

## 🏗️ Core Architecture
**The AI NEVER writes HTML, CSS, or JS.**  
The AI strictly produces a validated JSON "block tree" adhering to a strict Zod schema:
1. **AI Generator**: Produces or updates the JSON block tree.
2. **Zod Validator**: Enforces schema rules, valid UUIDs, string/array limits, and safe URLs (`http://` / `https://` only). Retries up to 2 times on validation errors.
3. **Site Renderer**: Single source of truth turning JSON blocks into React components for both the visual canvas and public portfolio page (`/p/:username`).

---

## 🚀 Quick Start Guide (Beginner Friendly)

### 1. Install Dependencies
```bash
# In the root folder:
npm --prefix server install
npm --prefix client install
```

### 2. Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
cp server/.env.example server/.env
```
Inside `server/.env`, configure your settings:
- `GEMINI_API_KEY`: Get your free API key at [Google AI Studio](https://aistudio.google.com/)
- `MONGODB_URI`: Your MongoDB connection string (e.g., local `mongodb://localhost:27017/thirty_seconds` or MongoDB Atlas URI)
- `JWT_SECRET`: Any random secret phrase for signing login tokens

*(Note: If no Gemini key is provided, the server features an automatic smart fallback generator so you can test end-to-end flows immediately!)*

### 3. Run the Application
In two separate terminals:

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
```
Server runs at: `http://localhost:5000`

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```
Client runs at: `http://localhost:5173`

---

## 🧪 Running Automated Tests
Vitest tests for the Zod schema, block union, URL safety, and migrations:
```bash
cd server
npm test
```

---

## 📦 Features Implemented
1. **Feature 1: Describe It (Prompt Mode)**:
   - Natural language input ("warm minimal developer portfolio for a frontend engineer").
   - Gemini Flash generation in strict JSON response mode with automatic 2x retry loop on validation failure.
2. **Feature 2: Import My Info**:
   - Accepts Resume PDF (Multer memory storage + `pdf-parse`), GitHub username (GitHub REST API), and pasted bio text.
   - Extract structured profile JSON with prompt-injection defenses.
   - Step 2 editable profile review form to protect privacy and fix typos before site creation.
   - Step 3 style prompt & generation.
3. **Feature 3: Refine with AI**:
   - Chat-like instruction in editor right panel ("make hero bolder", "move projects up", etc.).
   - Modifies block tree as an undoable step.
4. **Feature 4: Visual Drag-and-Drop Editor**:
   - Left palette (add blocks, choose templates: "Warm Sunset", "Minimal Dark", "Modern Editorial").
   - Center canvas (`@dnd-kit/sortable` drag handle, move up/down, duplicate, delete).
   - Responsive switcher (Desktop 100%, Tablet 768px, Mobile 375px).
   - Redux Toolkit history: `undo` (`Ctrl+Z`) and `redo` (`Ctrl+Shift+Z` / `Ctrl+Y`).
   - Debounced autosave (1.5s) with live indicator.
5. **Feature 5: 1-Click Publishing**:
   - Instant live deployment to `/p/:username`.
   - Dynamic document title and meta description.
   - Unpublish support.
6. **Auth & Quotas**:
   - Register, login, delete account.
   - Free plan: 5 AI generations per day with daily auto-reset.
