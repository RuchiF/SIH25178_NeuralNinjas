# Homepage Components Structure

## Directory Layout

```
frontend/src/
├── pages/
│   └── Homepage.jsx                    # Main page component (orchestrator)
├── components/
    └── homepage/                       # Homepage-specific components
        ├── index.js                    # Barrel export file
        ├── HeroSection.jsx            # Hero/banner section
        ├── FeatureCard.jsx            # Individual feature card
        ├── FeaturesSection.jsx        # Features grid section
        ├── CoverageSection.jsx        # Coverage & performance section
        └── FooterSection.jsx          # Footer CTA section
```

## Component Responsibilities

### `Homepage.jsx` (Main Orchestrator)

- **Role**: Page-level component that composes all sections
- **Responsibilities**:
  - Manages navigation logic
  - Defines data (features, cities, pollutants)
  - Passes props to child components
  - Minimal UI, mostly composition
- **Size**: ~50 lines (down from ~300 lines)

### `HeroSection.jsx`

- **Role**: Landing hero section
- **Props**: `onGetStarted` (callback function)
- **Features**:
  - Main title and tagline
  - Call-to-action button
  - Background gradients and patterns

### `FeatureCard.jsx`

- **Role**: Reusable card component for individual features
- **Props**: `feature` (object), `index` (number)
- **Features**:
  - Icon display
  - Title and description
  - Hover effects

### `FeaturesSection.jsx`

- **Role**: Features grid container
- **Props**: `features` (array of feature objects)
- **Features**:
  - Section header
  - Responsive grid layout
  - Maps over features and renders FeatureCard components

### `CoverageSection.jsx`

- **Role**: Shows coverage information and model performance
- **Props**: `cities` (array), `pollutants` (array)
- **Features**:
  - Two-column layout
  - City and pollutant badges
  - Model performance metrics card

### `FooterSection.jsx`

- **Role**: Footer call-to-action section
- **Props**: `onLaunchDashboard` (callback function)
- **Features**:
  - Final CTA message
  - Launch dashboard button
  - Dark themed section

## Benefits of This Structure

### ✅ Modularity

- Each component has a single, clear responsibility
- Easy to find and modify specific sections
- Components can be reused or moved easily

### ✅ Maintainability

- Smaller files are easier to understand
- Changes to one section don't affect others
- Clear props interface for each component

### ✅ Testability

- Each component can be unit tested independently
- Easy to mock props for testing
- Isolated component behavior

### ✅ Scalability

- Easy to add new sections
- Simple to create variants of existing components
- Clear structure for team collaboration

### ✅ Code Organization

- Clear separation of concerns
- Easy navigation through codebase
- Logical file structure

## Usage Examples

### Importing Components

```jsx
// Import all at once from barrel export
import {
  HeroSection,
  FeaturesSection,
  CoverageSection,
  FooterSection,
} from "@/components/homepage";

// Or import individually
import HeroSection from "@/components/homepage/HeroSection";
```

### Using in Homepage

```jsx
const Homepage = () => {
  const navigate = useNavigate();

  const handleNavigate = () => navigate("/dashboard");

  return (
    <div>
      <HeroSection onGetStarted={handleNavigate} />
      <FeaturesSection features={featuresData} />
      <CoverageSection cities={cities} pollutants={pollutants} />
      <FooterSection onLaunchDashboard={handleNavigate} />
    </div>
  );
};
```

### Reusing Components

```jsx
// Use HeroSection in another page with different props
<HeroSection
  onGetStarted={handleDifferentAction}
/>

// Use FeatureCard independently
<FeatureCard
  feature={{ icon: <Icon />, title: "Title", description: "Desc" }}
  index={0}
/>
```

## Component Props Interface

### HeroSection

```typescript
{
  onGetStarted: () => void
}
```

### FeatureCard

```typescript
{
  feature: {
    icon: ReactNode,
    title: string,
    description: string
  },
  index: number
}
```

### FeaturesSection

```typescript
{
  features: Array<{
    icon: ReactNode;
    title: string;
    description: string;
  }>;
}
```

### CoverageSection

```typescript
{
  cities: string[],
  pollutants: string[]
}
```

### FooterSection

```typescript
{
  onLaunchDashboard: () => void
}
```

## File Sizes Comparison

### Before (Monolithic)

- `Homepage.jsx`: ~300 lines

### After (Modular)

- `Homepage.jsx`: ~50 lines
- `HeroSection.jsx`: ~50 lines
- `FeatureCard.jsx`: ~20 lines
- `FeaturesSection.jsx`: ~30 lines
- `CoverageSection.jsx`: ~80 lines
- `FooterSection.jsx`: ~30 lines
- `index.js`: ~5 lines

**Total**: ~265 lines (similar to before, but much better organized)

## Next Steps & Recommendations

1. **Add PropTypes or TypeScript**: Type-check component props
2. **Create Storybook Stories**: Document components visually
3. **Add Unit Tests**: Test each component independently
4. **Extract Constants**: Move static data to separate config files
5. **Add Loading States**: Handle async data loading
6. **Optimize Performance**: Use React.memo for expensive renders

## Migration from Old Structure

If you had components importing from the old location:

```jsx
// Old
import Homepage from "./components/Homepage";

// New
import Homepage from "./pages/Homepage";
```

All homepage section components are now in `@/components/homepage/`.
