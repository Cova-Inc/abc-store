import { useRef, useState } from 'react';

import {
  Paper,
  Popper,
  Checkbox,
  MenuItem,
  TextField,
  IconButton,
  FormControl,
  ListItemText,
  InputAdornment,
  ClickAwayListener,
} from '@mui/material';

import { useTranslate } from 'src/locales/use-locales';

import { Iconify } from 'src/components/iconify';

export function SearchWithFields({
  search,
  setSearch,
  filterFields,
  setFilterFields,
  onFilter,
  onClear,
  filterFieldOptions,
  placeholder = 'Search...',
  minWidth = 250,
}) {
  const { t } = useTranslate('products');
  const inputRef = useRef(null);
  const [popperOpen, setPopperOpen] = useState(false);

  const handleFieldToggle = (value) => {
    if (filterFields.includes(value)) {
      setFilterFields(filterFields.filter((v) => v !== value));
    } else {
      setFilterFields([...filterFields, value]);
    }
  };

  const handleClickAway = () => {
    setPopperOpen(false);
  };

  const handleClear = () => {
    setSearch('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div>
        <TextField
          placeholder={placeholder}
          value={search}
          inputRef={inputRef}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setPopperOpen(true)}
          onKeyUp={(e) => e.code === 'Enter' && onFilter()}
          sx={{ minWidth }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClear} sx={{ color: 'text.disabled' }}>
                  <Iconify icon="mingcute:close-line" width={16} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {filterFieldOptions && filterFieldOptions.length > 0 && (
          <Popper
            open={popperOpen}
            anchorEl={inputRef.current}
            placement="bottom-start"
            style={{ zIndex: 1300 }}
          >
            <Paper sx={{ mt: 1, p: 1, width: minWidth }}>
              <FormControl fullWidth>
                {filterFieldOptions.map((field) => (
                  <MenuItem key={field.value} onClick={() => handleFieldToggle(field.value)}>
                    <Checkbox checked={filterFields.includes(field.value)} />
                    <ListItemText primary={['name', 'description', 'sku', 'category', 'tags'].includes(field.label) ? t(field.label) : field.label} />
                  </MenuItem>
                ))}
              </FormControl>
            </Paper>
          </Popper>
        )}
      </div>
    </ClickAwayListener>
  );
}
