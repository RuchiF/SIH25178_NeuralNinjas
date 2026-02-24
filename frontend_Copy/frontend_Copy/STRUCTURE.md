# Frontend Structure Documentation

## Overview

The frontend has been reorganized to follow a more modular architecture with clear separation of concerns.

## New Structure

```
frontend/src/
├── pages/                  # Page components (route-level)
│   ├── index.js           # Barrel export for cleaner imports
│   ├── Homepage.jsx       # Landing page with modular sub-components
│   └── Dashboard.jsx      # Dashboard page with modular layout
├── components/            # Reusable components
│   ├── dashboard/         # Dashboard-specific components
│   │   ├── Overview.jsx
│   │   ├── Forecast.jsx
│   │   ├── UploadData.jsx
│   │   └── ModelMetrics.jsx
│   └── ui/               # UI primitives (shadcn components)
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── App.js               # Main app component with routing
```

## Changes Made

### 1. **Pages Folder Structure**

- Created `src/pages/` directory for top-level route components
- Moved `Homepage.jsx` and `Dashboard.jsx` from `components/` to `pages/`

### 2. **Modular Homepage (`pages/Homepage.jsx`)**

Broken down into reusable sub-components:

- `HeroSection` - Main landing section with title and CTA
- `FeatureCard` - Individual feature display card
- `FeaturesSection` - Features grid layout
- `CoverageSection` - Coverage information and model performance
- `FooterSection` - Footer CTA section

**Benefits:**

- Each section is independently testable
- Easier to modify individual sections
- Better code organization and readability

### 3. **Modular Dashboard (`pages/Dashboard.jsx`)**

Broken down into focused components:

- `DashboardHeader` - Top navigation bar with refresh and home buttons
- `SidebarNavigation` - Left sidebar with navigation items
- `PageHeader` - Dynamic page title and description
- `navigationItems` - Configuration object for easy navigation management

**Benefits:**

- Cleaner separation of UI concerns
- Navigation configuration centralized for easy updates
- Each component has a single responsibility

### 4. **Updated Imports**

- Updated `App.js` to import from `pages/` instead of `components/`
- Created `pages/index.js` for barrel exports
- Cleaner import syntax: `import { Homepage, Dashboard } from './pages'`

### 5. **Import Path Corrections**

All imports now use the correct paths:

- UI components: `@/components/ui/...`
- Dashboard components: `@/components/dashboard/...`
- Pages: `./pages` or `./pages/...`

## Benefits of New Structure

1. **Separation of Concerns**

   - Pages handle routing and page-level logic
   - Components are reusable and focused

2. **Modularity**

   - Each component has a single, well-defined purpose
   - Easy to test, modify, and extend

3. **Scalability**

   - Easy to add new pages
   - Simple to create new modular components
   - Clear structure for team collaboration

4. **Maintainability**
   - Code is organized logically
   - Easy to locate specific functionality
   - Clear component hierarchy

## Usage

### Adding a New Page

1. Create the page component in `src/pages/`
2. Export it from `src/pages/index.js`
3. Add route in `App.js`

Example:

```jsx
// src/pages/NewPage.jsx
import React from "react";

const NewPage = () => {
  return <div>New Page Content</div>;
};

export default NewPage;

// src/pages/index.js
export { default as NewPage } from "./NewPage";

// src/App.js
import { Homepage, Dashboard, NewPage } from "./pages";
// Add route
<Route path="/new-page" element={<NewPage />} />;
```

### Creating Modular Components

When a component becomes too large (>200 lines), consider breaking it down:

1. Identify distinct UI sections or logical groupings
2. Extract them into separate components
3. Pass data and callbacks via props
4. Keep the main component as a composition of sub-components

Example:

```jsx
// Before: One large component
const LargePage = () => {
  // 300+ lines of JSX
};

// After: Modular approach
const Header = ({ title }) => {
  /* ... */
};
const Content = ({ data }) => {
  /* ... */
};
const Footer = ({ onAction }) => {
  /* ... */
};

const LargePage = () => {
  return (
    <>
      <Header title="Page Title" />
      <Content data={pageData} />
      <Footer onAction={handleAction} />
    </>
  );
};
```

## Testing

Components can now be tested independently:

- Test each modular component in isolation
- Mock props and verify rendering
- Test page composition separately

## Next Steps

Consider these improvements:

1. Add PropTypes or TypeScript for type safety
2. Create a `layouts/` folder for layout components
3. Add unit tests for each modular component
4. Document component props with JSDoc or TypeScript interfaces
5. Consider adding Storybook for component documentation
