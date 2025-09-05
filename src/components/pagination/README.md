# Common Pagination Components

This directory contains reusable pagination components with built-in scroll preservation for consistent pagination behavior across your application.

## Components

### CommonPagination
A basic pagination component with scroll preservation.

```jsx
import { CommonPagination } from 'src/components/pagination';

<CommonPagination
    page={page}
    pageSize={pageSize}
    totalCount={totalCount}
    onPageChange={setPage}
    setPageSize={setPageSize}
/>
```

### AdvancedPagination
An advanced pagination component with additional features like info display and customization options.

```jsx
import { AdvancedPagination } from 'src/components/pagination';

<AdvancedPagination
    page={page}
    pageSize={pageSize}
    totalCount={totalCount}
    onPageChange={setPage}
    setPageSize={setPageSize}
    showInfo={true}
    showTotalCount={true}
    showPageInfo={true}
    variant="outlined"
    color="primary"
/>
```

## Hooks

### usePaginationState
A hook to manage pagination state consistently.

```jsx
import { usePaginationState } from 'src/hooks/use-pagination-state';

const { 
    page, 
    pageSize, 
    setPage, 
    setPageSize, 
    resetPagination,
    goToPage,
    goToFirstPage,
    goToLastPage,
    getPaginationInfo 
} = usePaginationState(0, 10);
```

### usePaginationScroll
A hook for scroll preservation during pagination changes.

```jsx
import { usePaginationScroll } from 'src/hooks/use-pagination-scroll';

const { handlePageChange, handlePageSizeChange } = usePaginationScroll();
```

## Props

### CommonPagination Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `page` | `number` | - | Current page (0-based) |
| `pageSize` | `number` | - | Number of items per page |
| `totalCount` | `number` | - | Total number of items |
| `onPageChange` | `function` | - | Callback when page changes |
| `setPageSize` | `function` | - | Callback when page size changes |
| `pageSizeOptions` | `array` | `[5, 10, 25, 50, 100]` | Available page size options |
| `showPageSizeSelector` | `boolean` | `true` | Show page size selector |
| `showPagination` | `boolean` | `true` | Show pagination controls |
| `sx` | `object` | - | Additional styles |

### AdvancedPagination Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| All CommonPagination props | - | - | Inherits all CommonPagination props |
| `showInfo` | `boolean` | `true` | Show info section |
| `showTotalCount` | `boolean` | `true` | Show total count |
| `showPageInfo` | `boolean` | `true` | Show page info |
| `variant` | `string` | `'outlined'` | MUI variant |
| `size` | `string` | `'small'` | MUI size |
| `color` | `string` | `'primary'` | MUI color |
| `infoProps` | `object` | `{}` | Props for info text |

## Usage Examples

### Basic Usage
```jsx
import { CommonPagination } from 'src/components/pagination';
import { usePaginationState } from 'src/hooks/use-pagination-state';

function MyListPage() {
    const { page, pageSize, setPage, setPageSize } = usePaginationState(0, 10);
    const [data, setData] = useState([]);
    const [totalCount, setTotalCount] = useState(0);

    // Fetch data when pagination changes
    useEffect(() => {
        fetchData(page, pageSize);
    }, [page, pageSize]);

    return (
        <div>
            {/* Your list content */}
            <CommonPagination
                page={page}
                pageSize={pageSize}
                totalCount={totalCount}
                onPageChange={setPage}
                setPageSize={setPageSize}
            />
        </div>
    );
}
```

### Advanced Usage with Custom Styling
```jsx
import { AdvancedPagination } from 'src/components/pagination';

<AdvancedPagination
    page={page}
    pageSize={pageSize}
    totalCount={totalCount}
    onPageChange={setPage}
    setPageSize={setPageSize}
    pageSizeOptions={[10, 20, 50, 100]}
    showInfo={true}
    showTotalCount={true}
    showPageInfo={true}
    variant="outlined"
    color="secondary"
    size="medium"
    sx={{ 
        backgroundColor: 'background.paper',
        borderRadius: 1,
        p: 2 
    }}
/>
```

### Minimal Pagination (Pagination Only)
```jsx
<CommonPagination
    page={page}
    pageSize={20}
    totalCount={totalCount}
    onPageChange={setPage}
    setPageSize={() => {}} // No-op
    showPageSizeSelector={false}
/>
```

### Info Only Display
```jsx
<AdvancedPagination
    page={page}
    pageSize={pageSize}
    totalCount={totalCount}
    onPageChange={() => {}} // No-op
    setPageSize={() => {}} // No-op
    showPagination={false}
    showPageSizeSelector={false}
    showInfo={true}
/>
```

## Features

- ✅ **Scroll Preservation**: Automatically preserves scroll position when changing pages
- ✅ **Consistent Behavior**: Same pagination behavior across all pages
- ✅ **Customizable**: Multiple configuration options for different use cases
- ✅ **TypeScript Ready**: Full TypeScript support
- ✅ **Performance Optimized**: Memoized callbacks and efficient re-renders
- ✅ **Accessible**: Follows accessibility best practices

## Migration Guide

### From Custom Pagination Components
Replace your custom pagination with the common components:

```jsx
// Before
<CustomPagination
    page={page}
    pageSize={pageSize}
    totalCount={totalCount}
    onPageChange={setPage}
    setPageSize={setPageSize}
/>

// After
<CommonPagination
    page={page}
    pageSize={pageSize}
    totalCount={totalCount}
    onPageChange={setPage}
    setPageSize={setPageSize}
/>
```

### From Manual State Management
Replace manual pagination state with the hook:

```jsx
// Before
const [page, setPage] = useState(0);
const [pageSize, setPageSize] = useState(10);

// After
const { page, pageSize, setPage, setPageSize } = usePaginationState(0, 10);
```

## Best Practices

1. **Use the hook**: Always use `usePaginationState` for consistent state management
2. **Pass handlers correctly**: Make sure to pass the enhanced handlers from the hook
3. **Handle loading states**: Show loading indicators during pagination changes
4. **Error handling**: Handle pagination errors gracefully
5. **Accessibility**: Ensure pagination is keyboard navigable
6. **Mobile optimization**: Consider mobile pagination patterns for small screens 