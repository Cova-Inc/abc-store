'use client';

import { Controller, FormProvider } from 'react-hook-form';
import React, { useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Grid,
  Chip,
  Stack,
  Button,
  Rating,
  Divider,
  MenuItem,
  TextField,
  Typography,
  Autocomplete,
} from '@mui/material';

import {
  MAX_UPLOAD_SIZE,
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_CATEGORY_OPTIONS,
} from 'src/config-global';

import { Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const PRODUCT_TAGS_OPTIONS = ['新品', '割引', '皮', '手作り'];

export function ProductForm({
  methods,
  onSubmit,
  isSubmitting,
  onReset,
  defaultValues,
  currentUser,
}) {
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isDirty },
  } = methods;

  // Watch form fields to trigger re-renders
  const images = watch('images');
  const watchedTags = watch('tags');

  // Initialize selectedTags with watched value
  const [selectedTags, setSelectedTags] = useState(watchedTags || []);

  // Update selectedTags when form value changes (e.g., when editing)
  useEffect(() => {
    if (watchedTags && Array.isArray(watchedTags)) {
      setSelectedTags(watchedTags);
    } else if (watchedTags === undefined && defaultValues?.tags) {
      // Fallback to defaultValues if watchedTags is not yet initialized
      setSelectedTags(defaultValues.tags);
    }
  }, [watchedTags, defaultValues]);

  // Handle image drop with duplicate prevention
  const handleImageDrop = useCallback(
    (acceptedFiles) => {
      const existingFiles = getValues('images') || [];
      // Filter out duplicates based on file name and size
      const newFiles = acceptedFiles.filter(
        (newFile) =>
          !existingFiles.some((existing) => {
            // For URL strings (existing images), compare URLs
            if (typeof existing === 'string') {
              return false; // Can't compare new file with existing URL
            }
            // For File objects, compare name and size
            return existing.name === newFile.name && existing.size === newFile.size;
          })
      );
      const updatedFiles = [...existingFiles, ...newFiles];
      setValue('images', updatedFiles, { shouldDirty: true });
    },
    [getValues, setValue]
  );

  // Handle single image removal
  const handleImageRemove = useCallback(
    (inputFile) => {
      const filtered = getValues('images')?.filter((file) => file !== inputFile);
      setValue('images', filtered, { shouldDirty: true });
    },
    [getValues, setValue]
  );

  // Handle remove all images
  const handleImageRemoveAll = useCallback(() => {
    setValue('images', [], { shouldDirty: true });
  }, [setValue]);

  // Handle tags change
  const handleTagsChange = useCallback(
    (_, newValue) => {
      // newValue can contain both predefined and custom tags
      const validTags = newValue.filter((tag) => tag && tag.trim() !== '');
      setSelectedTags(validTags);
      setValue('tags', validTags, { shouldDirty: true });
    },
    [setValue]
  );

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Product Images */}
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                商品画像（最大10枚）
              </Typography>
              <Field.Upload
                name="images"
                accept={{
                  'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
                }}
                maxSize={MAX_UPLOAD_SIZE} // 50MB
                multiple
                onDrop={handleImageDrop}
                helperText={
                  <Typography variant="caption" color="text.secondary">
                    Max 10 images, 50MB each, JPG, PNG, GIF, BMP, WEBP
                  </Typography>
                }
                // files={images}
                slotProps={{
                  thumbnail: {
                    imageView: true, // Show actual image preview
                    sx: { width: 52, height: 52 },
                  },
                }}
                onRemove={handleImageRemove}
                onRemoveAll={handleImageRemoveAll}
                disabled={images?.length >= 10}
              />
            </Box>
          </Grid>

          {/* Product Details */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Basic Information */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  基本情報
                </Typography>
                <Stack spacing={2}>
                  <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                  <Field.Text
                    required
                    name="name"
                    label="商品名"
                    placeholder="Enter product name"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field.Select
                      required
                      name="category"
                      label="カテゴリー"
                      error={!!errors.category}
                      helperText={errors.category?.message}
                    >
                      {PRODUCT_CATEGORY_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Field.Select>
                  </Grid>
                  </Grid>
                  <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field.Text
                      required
                      name="price"
                      label="値段"
                      type="number"
                      placeholder="0.00"
                      InputProps={{
                        startAdornment: '¥',
                      }}
                      error={!!errors.price}
                      helperText={errors.price?.message}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field.Text
                      required
                      name="stock"
                      label="在庫数量"
                      type="number"
                      placeholder="1"
                      error={!!errors.stock}
                      helperText={errors.stock?.message}
                    />
                  </Grid>
                  
                </Grid>

                  <Field.Text
                    name="description"
                    label="詳細説明"
                    multiline
                    rows={3}
                    placeholder="Enter product description"
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Field.Text
                        name="sku"
                        label="SKU"
                        placeholder="Enter SKU"
                        error={!!errors.sku}
                        helperText={errors.sku?.message}
                      />
                    </Grid>
                    {/* Only show status field for admin users */}
                    {currentUser?.role === 'admin' && (
                      <Grid item xs={12} sm={6}>
                        <Field.Select
                          name="status"
                          label="Status"
                          error={!!errors.status}
                          helperText={errors.status?.message}
                        >
                          {PRODUCT_STATUS_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Field.Select>
                      </Grid>
                    )}
                  </Grid>
                </Stack>
              </Box>

              <Divider sx={{ borderStyle: 'dashed' }} />

              {/* Rating & Reviews - Admin Only */}
              {currentUser?.role === 'admin' && (
                <>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Rating & Reviews
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="rating"
                          control={control}
                          render={({ field }) => (
                            <Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Product Rating
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Rating
                                  {...field}
                                  value={field.value || 0}
                                  precision={0.5}
                                  onChange={(_, value) => {
                                    field.onChange(value);
                                    setValue('rating', value, { shouldDirty: true });
                                  }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                  {field.value || 0} / 5
                                </Typography>
                              </Stack>
                            </Box>
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field.Text
                          name="reviewCount"
                          label="Review Count"
                          type="number"
                          placeholder="0"
                          error={!!errors.reviewCount}
                          helperText={errors.reviewCount?.message}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                </>
              )}

              {/* Inventory */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  サプライヤー情報
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                  <Field.Text
                    name="supplier"
                    label="仕入先"
                    placeholder="仕入先を入力してください"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field.Text
                      name="originalPrice"
                      label="元の価格（定価）"
                      type="number"
                      placeholder="0.00"
                      InputProps={{
                        startAdornment: '¥',
                      }}
                      error={!!errors.originalPrice}
                      helperText={
                        errors.originalPrice?.message ||
                        '元の価格は現在の値段以上でなければなりません。'
                      }
                    />
                  </Grid>
                  
                </Grid>
              </Box>

              <Divider sx={{ borderStyle: 'dashed' }} />

              {/* Tags */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  タグ
                </Typography>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      multiple
                      freeSolo
                      options={PRODUCT_TAGS_OPTIONS}
                      value={selectedTags || []}
                      onChange={handleTagsChange}
                      getOptionLabel={(option) => option}
                      filterSelectedOptions
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={`tag-${index}-${option}`}
                            label={option}
                            size="small"
                            color={PRODUCT_TAGS_OPTIONS.includes(option) ? 'default' : 'primary'}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="タグを追加...(Enterキーでカスタムタグを追加)"
                          error={!!errors.tags}
                          helperText={
                            errors.tags?.message ||
                            '候補から選択するか入力し、Enterキーでカスタムタグを追加'
                          }
                        />
                      )}
                    />
                  )}
                />
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Form Actions */}
        <Box sx={{ mt: 4, pt: 3, borderTop: '1px dashed', borderColor: 'divider' }}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => {
                onReset();
                setSelectedTags([]);
              }}
              disabled={isSubmitting}
            >
              リセット
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting}
              disabled={!isDirty}
            >
              {defaultValues ? '商品を更新' : '商品を作成'}
            </LoadingButton>
          </Stack>
        </Box>
      </Box>
    </FormProvider>
  );
}
