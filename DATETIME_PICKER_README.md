# Date & Time Picker Component

A modern, lightweight Date & Time Picker component for the ScaleForge Members Dashboard, built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Date Selection**: Single date picker with time selection
- **Range Selection**: Optional date range picker with start/end dates
- **Time Selection**: 15-minute interval time picker
- **Quick Date Options**: Predefined date ranges (Today, Yesterday, Last 7 days, etc.)
- **Dark Mode Support**: Fully compatible with dark/light themes
- **Mobile Responsive**: Fallback native inputs for mobile devices
- **SSR Compatible**: Works seamlessly with Next.js
- **Custom Styling**: Tailwind CSS classes with custom dark theme support

## 📦 Installation

### 1. Install Dependencies

```bash
npm install react-datepicker @types/react-datepicker date-fns
```

### 2. Import CSS

The component automatically imports the required CSS files:
- `react-datepicker/dist/react-datepicker.css` (base styles)
- Custom dark theme styles (included in the component)

### 3. Import Component

```typescript
import { DateTimePicker } from '@/components/date-time-picker';
```

## 🎯 Usage

### Basic Implementation

```typescript
import { DateTimePicker } from '@/components/date-time-picker';

function MyComponent() {
  const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
    console.log('Date range changed:', { startDate, endDate });
    // Implement your filtering logic here
  };

  return (
    <DateTimePicker
      onDateRangeChange={handleDateRangeChange}
      className="mb-6"
    />
  );
}
```

### Advanced Usage with State Management

```typescript
import { useState } from 'react';
import { DateTimePicker } from '@/components/date-time-picker';

function DashboardPage() {
  const [dateFilter, setDateFilter] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null
  });

  const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
    setDateFilter({ startDate, endDate });
    
    // Filter members based on date range
    if (startDate || endDate) {
      // Example: Filter by dateCreated or lastActive
      const filteredMembers = members.filter(member => {
        const memberDate = new Date(member.dateCreated);
        
        if (startDate && endDate) {
          return memberDate >= startDate && memberDate <= endDate;
        } else if (startDate) {
          return memberDate >= startDate;
        } else if (endDate) {
          return memberDate <= endDate;
        }
        
        return true;
      });
      
      // Update your members list or trigger a new API call
      console.log('Filtered members:', filteredMembers);
    }
  };

  return (
    <div>
      <DateTimePicker
        onDateRangeChange={handleDateRangeChange}
        className="mb-6"
      />
      
      {/* Display current filter state */}
      {dateFilter.startDate && (
        <div className="text-sm text-gray-600">
          Filtering from: {dateFilter.startDate.toLocaleDateString()}
          {dateFilter.endDate && ` to: ${dateFilter.endDate.toLocaleDateString()}`}
        </div>
      )}
    </div>
  );
}
```

## ⚙️ Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onDateRangeChange` | `(startDate: Date \| null, endDate: Date \| null) => void` | ✅ | - | Callback function when date range changes |
| `className` | `string` | ❌ | `''` | Additional CSS classes for styling |

## 🎨 Customization

### Styling

The component uses Tailwind CSS classes and can be customized by:

1. **Adding custom classes** via the `className` prop
2. **Modifying the custom CSS** in `src/styles/datepicker-custom.css`
3. **Overriding Tailwind classes** in your component

### Theme Colors

The component automatically adapts to your theme:
- **Light Mode**: Uses gray and blue color palette
- **Dark Mode**: Uses dark gray and blue color palette

### Quick Date Options

You can customize the quick date options by modifying the `quickDateOptions` array in the component:

```typescript
const quickDateOptions: QuickDateOption[] = [
  {
    label: 'Custom Range',
    startDate: subDays(new Date(), 14),
    endDate: new Date()
  },
  // Add more options...
];
```

## 📱 Mobile Support

### Native Inputs

On mobile devices, the component provides native HTML inputs:
- `type="date"` for date selection
- `type="time"` for time selection

### Responsive Design

- **Desktop**: Full DatePicker with calendar and time picker
- **Mobile**: Native inputs with responsive layout
- **Tablet**: Adaptive layout based on screen size

## 🔧 Integration with GraphQL

### Example: Adding Date Filters to Queries

```typescript
// In your GraphQL query
const GET_MEMBERS = gql`
  query GetMembers($input: MembersInput!) {
    members(input: $input) {
      edges {
        node {
          id
          firstName
          lastName
          dateCreated
          lastActive
          # ... other fields
        }
      }
    }
  }
`;

// In your component
const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
  const variables = {
    input: {
      first: 20,
      filter: {
        // Add date filters to your GraphQL query
        dateCreatedFrom: startDate?.toISOString(),
        dateCreatedTo: endDate?.toISOString(),
        // ... other filters
      }
    }
  };
  
  // Refetch with new variables
  fetchMembers({ variables });
};
```

## 🎯 Best Practices

### 1. Performance

- Use `useCallback` for the `onDateRangeChange` handler if it's passed as a prop
- Consider debouncing the callback if you're making API calls
- Use `useMemo` for expensive filtering operations

### 2. Accessibility

- The component includes proper ARIA labels
- Keyboard navigation is supported
- Screen reader compatible

### 3. Error Handling

```typescript
const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
  try {
    // Validate dates
    if (startDate && endDate && startDate > endDate) {
      console.warn('Start date cannot be after end date');
      return;
    }
    
    // Process date range
    processDateFilter(startDate, endDate);
  } catch (error) {
    console.error('Error processing date filter:', error);
    // Handle error appropriately
  }
};
```

## 🐛 Troubleshooting

### Common Issues

1. **DatePicker not opening**
   - Check z-index conflicts
   - Ensure proper positioning context

2. **Styling issues**
   - Verify CSS imports are correct
   - Check for conflicting Tailwind classes

3. **Mobile input issues**
   - Test on actual mobile devices
   - Verify browser compatibility

### Debug Mode

Enable debug logging by adding console logs:

```typescript
const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
  console.log('DatePicker Debug:', {
    startDate,
    endDate,
    startDateISO: startDate?.toISOString(),
    endDateISO: endDate?.toISOString()
  });
  
  // Your logic here
};
```

## 📚 Additional Resources

- [react-datepicker Documentation](https://reactdatepicker.com/)
- [date-fns Documentation](https://date-fns.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

To modify the DatePicker component:

1. Edit `src/components/date-time-picker.tsx`
2. Update styles in `src/styles/datepicker-custom.css`
3. Test in both light and dark modes
4. Verify mobile responsiveness

## 📄 License

This component is part of the ScaleForge project and follows the same licensing terms.
