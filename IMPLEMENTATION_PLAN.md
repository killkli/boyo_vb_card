# VBCards - Vocabulary Flashcard Learning Web App

## Project Overview

A static web application for vocabulary learning using flashcards, built with Vite + React/Vue. Students can browse 18 levels of vocabulary words with accompanying images and flip cards to memorize English words with Chinese meanings.

## Data Structure Analysis

**Manifest File Structure** (18 files: `level_1_manifest.json` to `level_18_manifest.json`):
```json
{
  "level": 1,
  "levelName": "英文單字認讀基礎級(一)",
  "totalWords": 33,
  "successCount": 33,
  "errorCount": 0,
  "outputDir": "...",
  "results": [
    {
      "word": "I",
      "meaning": "我",
      "level": 1,
      "boyo_id": 1,
      "id": 1,
      "filename": "0001_I.png",
      "filepath": "...",
      "success": true
    }
  ]
}
```

**Key Data Points**:
- 18 levels total
- Each word has: English word, Chinese meaning, image filename
- Images stored in `level_{number}/` subdirectories
- Total data size: ~2.6GB

## Technology Stack

**Framework**: React 18 + TypeScript (chosen for component reusability and type safety)
**Build Tool**: Vite 5 (fast development and optimized production builds)
**Styling**: TailwindCSS (rapid UI development with utility classes)
**State Management**: React Context (simple, no external dependencies needed)
**Routing**: React Router (for level navigation)

## Architecture Design

### Directory Structure
```
VBCards/
├── public/
│   └── data/                    # Vocabulary data and images
│       ├── level_1/
│       │   ├── 0001_I.png
│       │   └── ...
│       ├── level_1_manifest.json
│       └── ... (level_2 to level_18)
├── src/
│   ├── components/
│   │   ├── FlashCard.tsx        # Single flashcard component with flip animation
│   │   ├── CardDeck.tsx         # Card deck container with navigation
│   │   ├── LevelSelector.tsx   # Level selection grid
│   │   ├── ProgressBar.tsx     # Learning progress indicator
│   │   └── Header.tsx          # App header with navigation
│   ├── pages/
│   │   ├── Home.tsx            # Landing page with level selector
│   │   └── Learn.tsx           # Flashcard learning page
│   ├── hooks/
│   │   ├── useFlashCards.ts    # Custom hook for card state management
│   │   └── useLevelData.ts     # Hook for loading level data
│   ├── types/
│   │   └── vocabulary.ts       # TypeScript interfaces for data
│   ├── utils/
│   │   ├── dataLoader.ts       # Manifest JSON loading utilities
│   │   └── shuffle.ts          # Array shuffle for random mode
│   ├── context/
│   │   └── AppContext.tsx      # Global app state
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

### Core Features

1. **Level Selection Page**
   - Display 18 levels in a grid layout
   - Show level name and word count for each level
   - Navigate to learning page on selection

2. **Flashcard Learning Page**
   - Display one card at a time with flip animation
   - **Front (正面)**: Chinese meaning (中文意思) + Image (圖片)
   - **Back (背面)**: English word (英文單字) + Detailed explanation (詳細解釋) + Example sentence (例句)
   - Navigation: Previous/Next buttons
   - Progress indicator (e.g., "5 / 33")
   - Shuffle mode toggle
   - Return to level selection

3. **Flashcard Component**
   - 3D flip animation on click/tap
   - Front side shows: Large Chinese text + visual image
   - Back side shows: English word (large), pronunciation guide, detailed meaning, example sentence
   - Responsive design (mobile-first)
   - Image loading with placeholder
   - Accessibility support (keyboard navigation)

4. **Progress Tracking** (Optional enhancement)
   - LocalStorage to save learned words
   - Mark cards as "known" or "review needed"
   - Filter to show only unlearned cards

## Flashcard Design Specification

### Card Layout Design

**Front Side (正面) - 中文學習面**:
```
┌──────────────────────────────┐
│                              │
│      [Visual Image]          │
│         (圖片)               │
│                              │
│                              │
│    ┌──────────────────┐     │
│    │   中文意思        │     │
│    │   (Large Text)    │     │
│    └──────────────────┘     │
│                              │
│    💡 點擊翻卡查看英文       │
│                              │
└──────────────────────────────┘
```

**Back Side (背面) - 英文詳解面**:
```
┌──────────────────────────────┐
│                              │
│   ┌────────────────────┐    │
│   │  English Word      │    │
│   │  (Large, Bold)     │    │
│   └────────────────────┘    │
│                              │
│   📖 詳細解釋:               │
│   • Part of speech (詞性)   │
│   • Extended meaning         │
│   • Usage notes              │
│                              │
│   📝 例句:                   │
│   "Example sentence here"    │
│   「中文翻譯」               │
│                              │
│   🔄 點擊翻回正面            │
│                              │
└──────────────────────────────┘
```

### Data Enhancement Strategy

Since current manifest only has `word` and `meaning`, we need to:

1. **Use existing data** for MVP:
   - Front: `meaning` (中文) + image
   - Back: `word` (英文) + basic meaning repeat

2. **Future data enrichment** (optional):
   - Add pronunciation (phonetic symbols)
   - Add detailed explanation field
   - Add example sentences
   - Add part of speech tags

3. **Temporary mock data** for demo:
   - Generate simple example sentences from word
   - Use word type inference (verb, noun, adjective)

### Card Interaction Flow

```
User Flow:
1. Card displays → Front side visible (Chinese + Image)
2. User clicks card → Flip animation (0.6s)
3. Back side visible (English + Details)
4. User clicks again → Flip back to front
5. User clicks "Next" → Auto-flip to front, load next card

Keyboard shortcuts:
- Space: Flip card
- Left Arrow: Previous card
- Right Arrow: Next card
- Escape: Return to level selection
```

## Implementation Stages

### Stage 1: Project Setup and Data Integration
**Goal**: Initialize project and load vocabulary data
**Success Criteria**:
- ✅ Vite + React 19 + TypeScript project running
- ⏳ All manifest files and images accessible (in progress)
- ⏳ TypeScript types defined for vocabulary data (pending)
**Status**: In Progress (75% complete)
**Completed**:
- ✅ Vite project initialized with React + TypeScript
- ✅ React Router DOM 7.1.3 installed
- ✅ Tailwind CSS 4.0 + PostCSS configured
- ✅ Custom CSS for 3D flip animation added
- ✅ Card specification updated (Front: 中文+圖片, Back: 英文+解釋+例句)
**Next**: Move images to public/data, create TypeScript types

### Stage 2: Core UI Components
**Goal**: Build flashcard and navigation components
**Success Criteria**:
- ✅ FlashCard component with flip animation works
- ✅ CardDeck manages card state and navigation (via hooks)
- ✅ LevelSelector displays all 18 levels
**Status**: Completed
**Completed**:
- ✅ FlashCard.tsx with 3D flip animation
- ✅ Front side: 中文意思 + 圖片
- ✅ Back side: 英文單字 + 解釋 + 例句
- ✅ LevelSelector.tsx grid layout (18 levels)
- ✅ ProgressBar.tsx for tracking progress
- ✅ useFlashCards hook for state management
- ✅ useLevelData hook for data loading

### Stage 3: Page Routing and Integration
**Goal**: Connect pages with routing and state management
**Success Criteria**:
- ✅ Home page shows level selector
- ✅ Learn page loads selected level data
- ✅ Navigation between pages works smoothly
**Status**: Completed
**Completed**:
- ✅ Home.tsx with level selector integration
- ✅ Learn.tsx with flashcard display and navigation
- ✅ React Router setup (/ and /learn/:level routes)
- ✅ Keyboard shortcuts (Space, Arrow keys, ESC)
- ✅ Error handling and loading states
- ✅ Responsive design with Tailwind CSS

### Stage 4: Polish and Build Optimization
**Goal**: Optimize for production deployment
**Success Criteria**:
- ⏳ Vite build produces optimized static files (ready)
- ✅ Images load efficiently (lazy loading implemented)
- ✅ Mobile responsive design verified (Tailwind breakpoints)
- ⏳ Build size optimized (Vite auto-optimization)
**Status**: Ready for Testing
**Completed**:
- ✅ Image lazy loading with loading="lazy"
- ✅ Responsive design (mobile-first Tailwind)
- ✅ CSS 3D transforms (GPU-accelerated)
- ✅ Code organized for tree-shaking
**Next**: Run npm run build and test production build

### Stage 5: Multi-User Profile System (Phase 0)
**Goal**: Enable multiple users to maintain separate learning progress
**Success Criteria**:
- ✅ User profile creation and management
- ✅ Profile selection on app startup
- ✅ User switching functionality
- ✅ IndexedDB for persistent storage
**Status**: Completed
**Completed**:
- ✅ UserContext for global user state management
- ✅ ProfileSelector page for choosing/creating profiles
- ✅ ProfileCreator page with avatar and theme color customization
- ✅ IndexedDB schema with userProfiles and appSettings stores
- ✅ User indicator component showing current user info
- ✅ Profile switching and last active user persistence

### Stage 6: Progress Tracking System (Phase 1)
**Goal**: Track individual word learning progress with spaced repetition
**Success Criteria**:
- ✅ Record learning attempts (correct/incorrect)
- ✅ Calculate proficiency levels (new → learning → familiar → mastered)
- ✅ Spaced repetition algorithm for review scheduling
- ✅ Track input methods (speech vs keyboard)
**Status**: Completed
**Completed**:
- ✅ WordProgress data structure with proficiency tracking
- ✅ LearningHistory for individual attempt records
- ✅ DailyStats for daily learning statistics
- ✅ Spaced repetition algorithm (1hr → 4-10hrs → 1-2 days → 1-3 weeks)
- ✅ Proficiency level calculation based on accuracy and streak
- ✅ User statistics aggregation (total words, accuracy, streak)
- ✅ Integration with FlashCard component for automatic tracking

### Stage 7: Visual Progress Indicators (Phase 2)
**Goal**: Provide visual feedback and motivation through progress indicators
**Success Criteria**:
- ✅ Proficiency badges on flashcards
- ✅ Progress indicators on level cards
- ✅ Color-coded proficiency levels
- ✅ Overall progress statistics dashboard
- ✅ Celebration animations for achievements
**Status**: Completed
**Completed**:
- ✅ ProficiencyBadge component with 4 levels (🆕📖✓⭐)
- ✅ LevelProgressIndicator showing per-level progress
- ✅ Color-coded card borders (gray/yellow/green/purple)
- ✅ OverallProgressStats component for homepage
- ✅ Streak celebration animations (3, 5, 10, 20, 50 milestones)
- ✅ useLevelProgress hook for level-specific statistics
- ✅ Fixed TypeScript type mismatches in progressTracking

## Technical Considerations

### Build Optimization
- **Image Strategy**: Keep images in public folder, reference by path (no bundling)
- **Code Splitting**: Use React lazy loading for page components
- **Manifest Loading**: Load manifests on-demand per level (not all at once)
- **Base Path**: Configure Vite base for deployment (e.g., GitHub Pages)

### Performance
- Lazy load images using native `loading="lazy"` attribute
- Virtualization not needed (one card visible at a time)
- Preload next/previous card images for smooth navigation
- Use CSS transforms for flip animation (GPU-accelerated)

### Accessibility
- Keyboard navigation (Arrow keys, Space to flip)
- ARIA labels for screen readers
- Focus management
- High contrast mode support

### Mobile Considerations
- Touch gestures: Swipe to navigate cards
- Prevent double-tap zoom on card flip
- Responsive breakpoints: mobile-first design
- PWA manifest for "Add to Home Screen" capability

## Data Processing Script

Create a build-time script to:
1. Read all 18 manifest files
2. Generate index file with level metadata
3. Validate image file paths
4. Create optimized data structure for runtime loading

## Deployment Strategy

**Build Output**: `dist/` folder contains all static assets
**Hosting Options**:
- GitHub Pages (free, needs base path config)
- Netlify/Vercel (auto-deploy from git)
- AWS S3 + CloudFront (scalable)
- Self-hosted static server

**Build Command**: `npm run build`
**Preview**: `npm run preview`

## Testing Strategy

- Component testing: Vitest + React Testing Library
- E2E testing: Playwright (optional)
- Manual testing: Cross-browser and mobile devices
- Accessibility audit: Lighthouse CI

## Next Steps

1. Initialize Vite project with React + TypeScript
2. Install dependencies (React Router, TailwindCSS)
3. Move `output/images` to `VBCards/public/data`
4. Create TypeScript types from manifest structure
5. Build LevelSelector component first (simplest)
6. Implement FlashCard with flip animation
7. Add routing and state management
8. Test and iterate
