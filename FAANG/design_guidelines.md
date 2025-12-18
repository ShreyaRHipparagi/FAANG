# PrepOS Design Guidelines

## Design Approach

**Selected System:** Microsoft Fluent Design System
**Rationale:** Optimal for productivity-focused, information-dense applications requiring clear data visualization and efficient user workflows. Fluent's emphasis on clarity, structured layouts, and accessible interactions perfectly aligns with an educational platform serving CSE students who prioritize function over flash.

**Core Principles:**
- Clarity and efficiency over decorative elements
- Structured information hierarchy for complex data
- Consistent patterns that reduce cognitive load
- Performance-oriented design for daily use

---

## Typography

**Font Family:**
- Primary: Inter (Google Fonts)
- Monospace: JetBrains Mono (for code snippets, problem IDs)

**Hierarchy:**
- Hero/Page Titles: text-4xl to text-5xl, font-bold
- Section Headers: text-2xl to text-3xl, font-semibold
- Card Titles: text-lg to text-xl, font-semibold
- Body Text: text-base, font-normal
- Metadata/Stats: text-sm to text-base, font-medium
- Captions/Helper: text-xs to text-sm, font-normal

---

## Layout System

**Spacing Primitives:**
Core units: **2, 4, 6, 8, 12, 16** (Tailwind scale)
- Tight spacing (cards, buttons): p-4, gap-2
- Standard sections: p-6, gap-4, py-8
- Major sections: py-12, gap-6
- Page-level: py-16, gap-8

**Grid System:**
- Dashboard: 12-column grid (grid-cols-12)
- Roadmap/Problem Lists: Single column on mobile, 2-3 columns on desktop
- Analytics: 2-column layout (md:grid-cols-2)
- Max container width: max-w-7xl with mx-auto

---

## Component Library

### Navigation
**Top Navigation Bar:**
- Fixed header with logo left, navigation center, user profile right
- Height: h-16
- Items: Dashboard, Roadmap, Patterns, Analytics, Profile
- Sticky positioning for persistent access

### Dashboard Components

**Stats Cards (4-column grid):**
- Compact metric cards showing: Problems Solved, Current Streak, XP Points, Topics Mastered
- Each card: rounded-lg border, p-6
- Large number (text-3xl font-bold), label beneath (text-sm)
- Icon on right side for visual balance

**Progress Section:**
- Horizontal progress bars for each topic (Arrays, Graphs, DP, etc.)
- Bar height: h-3, rounded-full
- Topic name + completion percentage displayed
- Stack vertically with gap-3

**Daily Recommendations:**
- Card-based layout showcasing 3-5 recommended problems
- Each problem card includes: Title, Difficulty badge, Pattern tag, External link button
- Horizontal scroll on mobile, grid on desktop

**Activity Chart:**
- GitHub-style contribution graph showing daily solve activity
- Grid of small squares representing last 90 days
- Hover reveals date and problem count

### Roadmap Interface

**Topic Cards (Accordion/Expandable):**
- Primary topics as expandable sections
- Each shows: Topic name, completion ring chart, problem count
- Clicking expands to reveal subtopics and patterns
- Nested indentation for hierarchy

**Problem List Items:**
- Checkbox for completion status (left)
- Problem title (clickable, opens modal or external link)
- Difficulty pill badge (Easy/Medium/Hard)
- Pattern tags (small rounded badges)
- Action button: "View Problem" linking externally

### Pattern Learning Paths

**Pattern Cards:**
- Grid layout (3 columns desktop, 1 mobile)
- Each pattern card: Icon, Pattern name, Problem count, Mastery percentage
- Clicking navigates to filtered problem view

### Analytics Dashboard

**Charts Section:**
- Topic Performance: Horizontal bar chart
- Pattern Mastery: Radar/spider chart
- Solve Trends: Line chart over time
- Difficulty Distribution: Donut chart
- 2-column layout on desktop, stacked on mobile

### Gamification Elements

**Badge Display:**
- Medal/trophy icons in grid layout
- Locked badges shown in grayscale
- Tooltip on hover explaining achievement criteria

**XP Progress Bar:**
- Prominent progress bar showing current level
- XP to next level displayed
- Small celebratory animation on level up (minimal)

**Leaderboard (Future Phase):**
- Ranked list with rank number, user avatar, username, XP score
- Current user highlighted

### Forms & Inputs

**Profile Settings:**
- Standard form layout with labels above inputs
- Input fields: rounded-md border, p-3
- Submit button: Primary CTA style

### Modals & Overlays

**Problem Detail Modal (if used):**
- Centered overlay with max-w-2xl
- Close button top-right
- Problem metadata, description placeholder, external link CTA

---

## Images

**Hero Section:**
No large hero image. Instead, use a focused header with:
- Concise headline: "Master DSA. Ace Placements."
- Subheadline explaining the platform
- Primary CTA: "Start Learning" button
- Compact height (roughly 40vh), centered content

**Decorative Graphics:**
- Small abstract tech/code-themed illustrations in empty states
- Pattern icons representing algorithmic concepts (tree structure, graph nodes)
- Badge/achievement icons for gamification
- Keep illustrations minimalist and aligned with productivity aesthetic

**User Profile:**
- Avatar/profile pictures (circular, small: w-10 h-10, large: w-24 h-24)

---

## Animations

**Use Sparingly:**
- Smooth transitions on accordion expand/collapse (duration-200)
- Fade-in on data loading
- Celebrate level-ups with subtle confetti burst (one-time)
- No continuous animations, parallax, or scroll-driven effects