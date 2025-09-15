'use client';

import { useState } from 'react';

import { Box, Stack, Button, Popover, MenuItem, Typography } from '@mui/material';

import { allLangs } from 'src/locales/all-langs';
import { useTranslate } from 'src/locales/use-locales';

import { Iconify } from 'src/components/iconify';

export function LanguageSwitcher() {
  const { currentLang, onChangeLang } = useTranslate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChangeLang = (langValue) => {
    onChangeLang(langValue);
    handleClose();
  };

  const filteredLangs = allLangs.filter((lang) => ['en', 'jp', 'cn'].includes(lang.value));

  return (
    <>
      <Button
        onClick={handleOpen}
        sx={{
          p: 1,
          minWidth: 'auto',
          borderRadius: 1.5,
          textTransform: 'none',
          color: 'text.primary',
          bgcolor: 'transparent',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <img
            loading="lazy"
            width="20"
            height="15"
            alt={currentLang.label}
            src={`https://flagcdn.com/w20/${currentLang.countryCode.toLowerCase()}.png`}
            srcSet={`https://flagcdn.com/w40/${currentLang.countryCode.toLowerCase()}.png 2x`}
          />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {currentLang.label}
          </Typography>
          <Iconify icon="eva:chevron-down-fill" width={16} />
        </Stack>
      </Button>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 160,
              overflow: 'visible',
              border: (theme) => `solid 1px ${theme.palette.divider}`,
              boxShadow: (theme) => theme.customShadows.dropdown,
            },
          },
        }}
      >
        {filteredLangs.map((lang) => (
          <MenuItem
            key={lang.value}
            selected={lang.value === currentLang.value}
            onClick={() => handleChangeLang(lang.value)}
            sx={{
              py: 1,
              px: 2,
              typography: 'body2',
              '&.Mui-selected': {
                bgcolor: 'action.selected',
              },
            }}
          >
            <Box
              component="img"
              loading="lazy"
              width="20"
              height="15"
              alt={lang.label}
              src={`https://flagcdn.com/w20/${lang.countryCode.toLowerCase()}.png`}
              srcSet={`https://flagcdn.com/w40/${lang.countryCode.toLowerCase()}.png 2x`}
              sx={{ mr: 1, flexShrink: 0 }}
            />
            {lang.label}
          </MenuItem>
        ))}
      </Popover>
    </>
  );
}
