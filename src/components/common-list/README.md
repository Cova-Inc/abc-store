# Common List Components

This directory contains reusable components for list pages across the application. These components provide consistent UI patterns for filtering, searching, pagination, and loading states.

## Components

### CommonToolbar
A generic toolbar component that provides filtering and search functionality.

**Props:**
- `filterValue` - Current filter value
- `setFilterValue` - Function to update filter value
- `filterOptions` - Array of filter options `[{value, label}]`
- `filterLabel` - Label for the filter dropdown (default: "Filter")
- `searchInput` - Current search input value
- `setSearchInput` - Function to update search input
- `search` - Current search value
- `filterFields` - Array of selected filter fields
- `setFilterFields` - Function to update filter fields
- `filterFieldOptions` - Array of available filter field options
- `onSearchEnter` - Function called when search is triggered
- `onFilter` - Function called when filter button is clicked
- `onClear` - Function called when clear button is clicked
- `placeholder` - Search input placeholder (default: "Search...")
- `minFilterWidth` - Minimum width for filter dropdown (default: 200)
- `minSearchWidth` - Minimum width for search input (default: 250)

**Usage:**
```jsx
<CommonToolbar
    filterValue={typeFilter}
    setFilterValue={setTypeFilter}
    filterOptions={POLICY_TYPE_OPTIONS}
    filterLabel="Type"
    searchInput={searchInput}
    setSearchInput={setSearchInput}
    search={search}
    filterFields={filterFields}
    setFilterFields={setFilterFields}
    filterFieldOptions={POLICY_FILTER_FIELD_OPTIONS}
    onSearchEnter={handleSearchEnter}
    onFilter={applyFilter}
    onClear={clearFilter}
    placeholder="Search policies..."
/>
```

### SearchWithFields
A search input component with optional field selection dropdown.

**Props:**
- `search` - Current search value
- `setSearch` - Function to update search value
- `filterFields` - Array of selected filter fields
- `setFilterFields` - Function to update filter fields
- `onFilter` - Function called when search is triggered
- `filterFieldOptions` - Array of available filter field options
- `placeholder` - Search input placeholder (default: "Search...")
- `minWidth` - Minimum width for search input (default: 250)

### ActionButton
A floating action button that shows either "Filter" or "Clear" based on current state.

**Props:**
- `filterValue` - Current filter value
- `search` - Current search value
- `onClear` - Function called when clear button is clicked
- `onFilter` - Function called when filter button is clicked
- `clearText` - Text for clear button (default: "Clear")
- `filterText` - Text for filter button (default: "Filter")

### CommonListPagination
A wrapper around the existing CommonPagination component.

**Props:**
- All props are passed through to CommonPagination

### CommonListSkeleton
A skeleton loading component for list pages.

**Props:**
- `itemCount` - Number of skeleton items to show (default: 5)
- `showSelectionHeader` - Whether to show selection header skeleton (default: true)
- `showActionButtons` - Whether to show action button skeletons (default: true)
- `actionButtonCount` - Number of action button skeletons to show (default: 3)

## Migration Guide

To migrate existing list pages to use these common components:

1. **Replace toolbar:**
```jsx
// Before
import { Toolbar } from '../toolbar';

// After
import { CommonToolbar } from 'src/components/common-list';

// Update component to use CommonToolbar
export function Toolbar(props) {
    return (
        <CommonToolbar
            {...props}
            filterValue={props.industryFilter}
            setFilterValue={props.setIndustryFilter}
            filterOptions={props.industryOptions}
            filterLabel="Industry"
            placeholder="Search companies..."
        />
    );
}
```

2. **Replace pagination:**
```jsx
// Before
import { CommonPagination } from 'src/components/pagination';

// After
import { CommonListPagination } from 'src/components/common-list';

export function CustomPagination(props) {
    return <CommonListPagination {...props} />;
}
```

3. **Replace skeleton:**
```jsx
// Before
// Custom skeleton implementation

// After
import { CommonListSkeleton } from 'src/components/common-list';

export function ListSkeleton() {
    return (
        <CommonListSkeleton
            itemCount={5}
            showSelectionHeader={true}
            showActionButtons={true}
            actionButtonCount={3}
        />
    );
}
```

## Benefits

- **Consistency**: All list pages now have the same UI patterns
- **Maintainability**: Changes to common components affect all list pages
- **Reusability**: New list pages can easily use these components
- **Customization**: Components are flexible and can be customized per page
- **Performance**: Reduced bundle size by eliminating duplicate code 