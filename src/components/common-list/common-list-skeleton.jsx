import React from 'react';

import {
    Box,
    Card,
    List,
    Stack,
    Skeleton,
    ListItem,
    useTheme,
    useMediaQuery
} from '@mui/material';

export function CommonListSkeleton({
    itemCount = 5,
    showSelectionHeader = true,
    showActionButtons = true,
    actionButtonCount = 3
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const renderSkeletonItem = () => (
        <ListItem
            sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'stretch', md: 'center' },
                gap: { xs: 1, md: 0 },
            }}
        >
            <Box sx={{ mr: { xs: 0, md: 2 }, display: 'flex', alignItems: 'center' }}>
                <Skeleton variant="rectangular" width={20} height={20} />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                    <Skeleton variant="text" width={200} height={24} />
                    <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                </Stack>

                <Stack spacing={1}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Skeleton variant="text" width={150} height={16} />
                        <Skeleton variant="text" width={120} height={16} />
                    </Stack>

                    {!isMobile && (
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Skeleton variant="text" width={140} height={16} />
                            <Skeleton variant="text" width={180} height={16} />
                            <Skeleton variant="text" width={180} height={16} />
                        </Stack>
                    )}

                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                        sx={{
                            gap: { xs: 0.5, md: 1 }
                        }}
                    >
                        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 12 }} />
                        <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 12 }} />
                        <Skeleton variant="rectangular" width={65} height={24} sx={{ borderRadius: 12 }} />
                        <Skeleton variant="rectangular" width={90} height={24} sx={{ borderRadius: 12 }} />
                    </Stack>
                </Stack>
            </Box>

            {showActionButtons && (
                <Box sx={{
                    display: 'flex',
                    justifyContent: { xs: 'center', md: 'flex-end' },
                    mt: { xs: 1, md: 0 },
                    ml: { xs: 0, md: 'auto' },
                    flexShrink: 0
                }}>
                    <Stack direction="row" spacing={1}>
                        {Array.from({ length: actionButtonCount }).map((_, index) => (
                            <Skeleton key={index} variant="circular" width={32} height={32} />
                        ))}
                    </Stack>
                </Box>
            )}
        </ListItem>
    );

    return (
        <Card>
            {showSelectionHeader && (
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Skeleton variant="rectangular" width={20} height={20} />
                            <Skeleton variant="text" width={120} height={16} />
                        </Stack>
                    </Stack>
                </Box>
            )}

            <Box sx={{ minHeight: 400, maxHeight: 600, overflow: 'auto' }}>
                <List sx={{ p: 2 }}>
                    {Array.from({ length: itemCount }).map((_, index) => (
                        <Box key={index}>{renderSkeletonItem()}</Box>
                    ))}
                </List>
            </Box>
        </Card>
    );
} 