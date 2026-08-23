# Voice Shopping Assistant 🛒🎤

A minimalist, mobile-first, voice-activated smart shopping list web application built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4**, and **Firebase SDK v12**.

Designed for one-handed phone use, this assistant uses browser-native speech recognition paired with a lightweight NLP command parser to turn natural spoken phrases into structured shopping list actions, catalog searches, and intelligent recommendations.

---

## ✨ Features

- **🎤 Voice Input (Web Speech API)**: Native speech-to-text recognition with continuous interim transcript feedback, audio frequency wave animations, and multi-ring pulse indicators.
- **🧠 Natural Language Processing (NLP)**: Lightweight intent parser extracting structured commands:
  - **Add**: *"Add 2 bottles of water"*, *"I need 5 apples"*
  - **Remove**: *"Remove milk from my list"*
  - **Update Quantity**: *"Change apples to 8"*, *"Set water to 3"*
  - **Voice Search**: *"Find me organic apples"*, *"Find toothpaste under $5"*
  - **Entity Extraction**: Item name, quantity, min/max price bounds, brands (*Colgate*, *Crest*, *Tom's*, *Sensodyne*), and tags (*organic*, *fresh*).
- **🌐 Multilingual Support**: Language selector with instant switching and `localStorage` persistence across session restarts:
  - 🇺🇸 English (`en-US`)
  - 🇮🇳 Hindi (`hi-IN`)
  - 🇪🇸 Spanish (`es-ES`)
  - 🇫🇷 French (`fr-FR`)
- **💡 Intelligent 3-Source Suggestions Engine**:
  1. **Real Purchase History**: Queries Firestore `purchaseHistory/{userId}/entries` to suggest restocks (*"You're running low on X"*).
  2. **Seasonal Recommendations**: Static monthly dataset (`src/data/seasonal.json`) suggesting items in season or on sale.
  3. **Product Substitutes**: Reads `src/data/substitutes.json` to suggest healthy alternatives (e.g. Milk ➔ Almond Milk / Oat Milk) as dismissible chips.
- **📂 Categorized Shopping List**: Auto-categorizes items into *Dairy*, *Produce*, *Bakery*, *Snacks*, *Beverages*, *Household*, or *Other* with quantity adjustment controls (`+`/`-`), purchase checkboxes, and clear actions.
- **🔍 Voice-Activated Catalog Search**: Filters a 30-item mock catalog (`src/data/products.json`) by keyword, brand, price range, and tags with 1-tap **`+ Add to List`** action buttons.
- **🔥 Firebase Backend & Real-Time Sync**:
  - **Anonymous Auth**: Automatic session creation without requiring signup.
  - **Firestore Collections**: Real-time sync for `shoppingLists/{userId}/items` and logging for `purchaseHistory/{userId}/entries`.
  - **Offline Sync & Resilience**: IndexedDB offline caching with a user-visible status banner (*"Offline mode — changes will sync when reconnected"*).
- **🛡️ Robust Error Handling & Edge-Case Pass**:
  - Unsupported browser fallback text input box with automatic focus.
  - Microphone permission denied handling (`not-allowed`).
  - No speech timeout guidance (`no-speech`).
  - Unrecognized command fallback toast (*"Sorry, I didn't catch that — try saying 'Add milk'"*).

---

## 🛠️ Tech Stack

- **Frontend Core**: React 19, Vite 8, TypeScript 5
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) with dark glassmorphism design system
- **Backend & Persistence**: Firebase SDK 12 (Anonymous Auth, Cloud Firestore, IndexedDB offline persistence)
- **Speech Engine**: Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)
- **Tooling & Test Runners**: `tsx`, ESLint 9, Prettier

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18.0.0 or higher) and `npm` installed.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/voice-shopping-assistant.git
   cd voice-shopping-assistant
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` to supply your Firebase project configuration credentials:*
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyA_placeholder_api_key_12345
   VITE_FIREBASE_AUTH_DOMAIN=voice-shopping-assistant-dev.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=voice-shopping-assistant-dev
   VITE_FIREBASE_STORAGE_BUCKET=voice-shopping-assistant-dev.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🎤 How to Test Voice Commands

Tap the **Center Microphone Button** or use the text input fallback box to test the following phrasings:

### English (`en-US`)
- **Add Items**:
  - *"Add 2 bottles of water"*
  - *"I need 5 apples"*
  - *"Buy almond milk"*
- **Voice Search Catalog**:
  - *"Find me organic apples"* (Filters organic apples under $5)
  - *"Find toothpaste under $5"* (Filters toothpaste under $5, excluding Sensodyne)
- **Update Quantities**:
  - *"Change apples to 8"*
  - *"Set water to 4"*
- **Remove Items**:
  - *"Remove milk from my list"*

### Hindi (`hi-IN`)
- *"दूध जोड़ें"* (Add milk)
- *"२ पानी की बोतल जोड़ें"* (Add 2 bottles of water)
- *"सेब हटाएं"* (Remove apples)

### Spanish (`es-ES`)
- *"Añadir 2 botellas de agua"* (Add 2 bottles of water)
- *"Comprar leche"* (Buy milk)
- *"Eliminar manzanas"* (Remove apples)

### French (`fr-FR`)
- *"Ajouter du lait"* (Add milk)
- *"Acheter 3 pommes"* (Buy 3 apples)
- *"Supprimer l'eau"* (Remove water)

---

## 🧪 Running Unit Tests

Run the automated test suites using `npx tsx`:

```bash
# Test NLP Voice Command Parser & Multilingual Dictionaries (16 tests)
npx tsx src/services/runTests.ts

# Test Auto-Categorizer & Shopping List Operations (13 tests)
npx tsx src/services/shoppingList.test.ts

# Test Intelligent 3-Source Suggestions Engine (8 tests)
npx tsx src/services/suggestions.test.ts

# Test Voice-Activated Product Catalog Search (11 tests)
npx tsx src/services/productSearch.test.ts

# Test Firebase SDK, Anonymous Auth & Firestore Writes (5 tests)
npx tsx src/services/firebase.test.ts

# Test Error Handling & Edge Cases (8 tests)
npx tsx src/services/errorHandling.test.ts
```

---

## 📄 License

This project is licensed under the MIT License.
