# Project Approach & Summary 💡

### The Problem
Managing shopping lists on mobile while cooking or multitasking is slow and clumsy with manual text typing.

### Tech Stack & Rationale
- **React 19 + Vite**: Provides ultra-fast component rendering and responsive state updates.
- **Web Speech API**: Delivers native, zero-dependency browser speech recognition with low latency.
- **Firebase SDK v12**: Uses Anonymous Authentication for zero-friction user sessions, Cloud Firestore for real-time cross-device sync, and IndexedDB offline persistence for network resilience.

### Key Features Implemented
- **NLP Command Engine**: Extracts intent (`add`, `remove`, `update`, `search`), quantities, brands, price bounds (*"under $5"*), and tags (*"organic"*).
- **Multilingual Support**: Real-time language switching across English, Hindi, Spanish, and French.
- **Intelligent 3-Source Recommendations**: Combines Firestore purchase history (*"running low on X"*), seasonal dataset items, and product substitute chips.
- **Voice Catalog Search**: Filters 30 products with 1-tap list addition.
- **Mobile-First UX**: 44px+ touch targets, audio wave animations, skeleton loaders, and toast confirmations.

### Future Improvement
With more time, I would integrate a lightweight client-side transformer model (ONNX Runtime) or vector embeddings for richer semantic query understanding beyond keyword maps.
