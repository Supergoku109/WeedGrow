# WeedGrow Design System & Refactoring Guide

## Overview

This refactoring introduces a comprehensive design system to ensure consistency, maintainability, and professional code quality across the WeedGrow application.

## Design System Structure

```
design-system/
├── tokens/              # Design tokens (colors, spacing, typography)
│   ├── colors.ts        # Color palette and semantic colors
│   ├── spacing.ts       # Consistent spacing scale
│   ├── typography.ts    # Font styles and hierarchy
│   ├── radius.ts        # Border radius values
│   ├── shadows.ts       # Shadow/elevation styles
│   └── index.ts         # Combined exports
├── components/          # Enhanced base components
│   ├── Text/            # Improved text component
│   ├── Container/       # Layout container component
│   ├── Button/          # Enhanced button component
│   ├── Input/           # Improved input component
│   └── index.ts         # Component exports
├── utils/               # Design system utilities
│   ├── useTheme.ts      # Enhanced theme hook
│   └── createStyles.ts  # Style creation helpers
└── index.ts             # Main export file
```

## Key Improvements

### 1. Design Tokens
- **Colors**: Semantic color system with theme support
- **Spacing**: Consistent spacing scale (4px base unit)
- **Typography**: Structured font hierarchy
- **Shadows**: Standardized elevation system
- **Radius**: Consistent border radius values

### 2. Enhanced Components
- **Text**: Type-safe text component with variants
- **Container**: Flexible layout component with spacing control
- **Button**: Full-featured button with multiple variants
- **Input**: Improved input with proper validation states

### 3. Backward Compatibility
- Legacy components still work during migration
- Gradual migration path without breaking existing functionality
- Updated constants that reference design tokens

## Migration Strategy

### Phase 1: Foundation ✅
- [x] Create design system tokens
- [x] Build base components
- [x] Update constants for backward compatibility
- [x] Refactor simple components (LoadingView, NotFoundView)

### Phase 2: Core Components (In Progress)
- [ ] Migrate ThemedText usage to new Text component
- [ ] Update form components to use design system
- [ ] Refactor card components
- [ ] Update button usage across the app

### Phase 3: Complex Components
- [ ] Migrate complex screens (HomeScreen, PlantDetailScreen)
- [ ] Update navigation components
- [ ] Refactor calendar components
- [ ] Migrate modal and sheet components

### Phase 4: Polish & Optimization
- [ ] Remove deprecated components
- [ ] Optimize performance
- [ ] Add responsive design support
- [ ] Create component documentation

## Usage Examples

### Before (Old Pattern)
```tsx
import { ThemedText } from '@/ui/ThemedText';
import { Colors } from '@/constants/Colors';

<ThemedText style={{ color: Colors.dark.tint, fontSize: 16 }}>
  Hello World
</ThemedText>
```

### After (Design System)
```tsx
import { Text } from '@/design-system/components';

<Text variant="body" color="accent">
  Hello World
</Text>
```

### Spacing Example
```tsx
// Before
<View style={{ marginTop: 16, paddingHorizontal: 20 }}>

// After
import { Spacing } from '@/design-system/tokens';
<Container padding="screenPadding" margin="md">
```

## Benefits

1. **Consistency**: Unified visual language across the app
2. **Maintainability**: Centralized design decisions
3. **Developer Experience**: Type-safe components with IntelliSense
4. **Performance**: Optimized component rendering
5. **Scalability**: Easy to extend and modify
6. **Professional Quality**: Industry-standard patterns

## Best Practices

### Do's
- Use design tokens instead of magic numbers
- Prefer semantic spacing over custom values
- Use component variants over custom styling
- Follow the component composition patterns
- Keep backward compatibility during migration

### Don'ts
- Don't hardcode colors or spacing values
- Avoid creating custom components without checking existing ones
- Don't break existing functionality during refactoring
- Avoid mixing old and new patterns in the same component

## Next Steps

1. Continue migrating components in priority order
2. Update existing screens to use new components
3. Create comprehensive component library documentation
4. Add automated testing for design system components
5. Implement responsive design patterns

## Component Migration Checklist

When migrating a component:
- [ ] Replace hardcoded values with design tokens
- [ ] Use design system components where possible
- [ ] Ensure consistent spacing and typography
- [ ] Test on multiple screen sizes
- [ ] Verify no functionality is broken
- [ ] Update TypeScript types if needed

## Current Progress Status

### ✅ Completed Components

#### Design System Foundation
- **Design Tokens**: All tokens (colors, spacing, typography, radius, shadows) ✅
- **Base Components**: Text, Container, Button, Input, Card, Row ✅
- **Theme Utils**: useTheme, createStyles ✅

#### Refactored UI Components
- **ThemedText**: Now uses Typography and ColorTokens ✅
- **ThemedView**: Updated to use Container with backward compatibility ✅
- **WeedGrowCard**: Now uses Card component ✅
- **WeedGrowButtonRow**: Uses Row and design tokens ✅
- **WeedGrowFormSection**: Uses Container/Text and semantic spacing ✅
- **WeedGrowDivider**: Uses ColorTokens ✅
- **WeedGrowEnvBadge**: Uses Row/Text and semantic colors ✅
- **WeedGrowTextInput**: Wraps new Input component ✅
- **WeedGrowDropdownInput**: Uses Container/Text and design tokens ✅
- **WeedGrowLogForm**: Modal using Container/Text/Button/Input ✅
- **WeedGrowLogTypeSheet**: Modal with design system components ✅
- **SuggestionCatalog**: Uses Container/Text and design tokens ✅
- **AppHeader**: Header component using Container and design tokens ✅
- **Step1BasicInfo**: Clean screen structure ✅
- **Row Component**: Created additional utility component for layouts ✅

### 🚧 In Progress Components

#### Complex UI Components
- **SwipeTabs**: Tab component with design tokens
- **MapPicker**: Complex component with design system
- **InfoTooltip**: Tooltip component
- **Collapsible**: Animated component with design tokens
- **CollapsingHeaderWithGallery**: Complex header component

### ❌ Pending Components

#### Form & Input Components  
- **Add Plant Steps**: Steps 2-6 need refactoring
- **EditGroupModal**: Group editing form
- **AddSensorProfile**: Sensor profile forms

#### Screen Components
- **HomeScreen**: Main screen with complex layouts
- **PlantDetailScreen**: Detailed plant view
- **GroupDetailScreen**: Group management screen

#### Calendar & Progress Components
- **LogHistoryCalendar**: Calendar component
- **ProgressGallery**: Gallery with design system
- **WeeklyPlantCalendarBar**: Calendar bar component
- **WateringHistoryBar**: History visualization

#### Sensor & Profile Components
- **SensorProfileBar**: Profile component

#### Advanced UI Components
- **ExpandedLogPanel**: Expandable panels
- **GradientOverlay**: Gradient component (may stay as-is)
- **HapticTab**: Tab with haptic feedback
- **IconSymbol**: Icon wrapper component
- **TabBarBackground**: Tab bar styling

## Refactoring Session Summary

### Components Successfully Refactored This Session:

1. **ThemedView** - Updated to use Container with backward compatibility
2. **WeedGrowLogForm** - Complete modal refactor using design system components
3. **WeedGrowDropdownInput** - Integrated with design tokens and theme system
4. **WeedGrowLogTypeSheet** - Modal sheet component with clean design system usage
5. **SuggestionCatalog** - Card-based catalog component using Container/Text
6. **AppHeader** - Header component using Container and design tokens
7. **Step1BasicInfo** - Screen component cleanup
8. **Row Component** - Created additional utility component for layouts

### Key Achievements:

- **13+ components** migrated to use design system
- **Modal components** now use consistent styling with design tokens
- **Form components** properly integrated with Input/Button components
- **Layout components** use Container and Row for consistent spacing
- **All refactored components** compile without errors
- **Backward compatibility** maintained for gradual migration

### Next Priority Components:

1. **Complex Screens**: HomeScreen, PlantDetailScreen with heavy styling
2. **Calendar Components**: LogHistoryCalendar, WeeklyPlantCalendarBar
3. **Form Steps**: Remaining Add Plant steps (Step2-Step6)
4. **Advanced UI**: SwipeTabs, Collapsible, CollapsingHeaderWithGallery

The design system is now mature enough to handle most component refactoring needs. The foundation is solid and consistent patterns are established.

---

This refactoring maintains all existing functionality while significantly improving code quality, consistency, and maintainability.
