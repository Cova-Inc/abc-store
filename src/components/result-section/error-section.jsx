'use client';

import { m } from 'framer-motion';
import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { SimpleLayout } from 'src/layouts/simple';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {
  PageNotFoundIllustration,
  ForbiddenIllustration,
  ServerErrorIllustration
} from 'src/assets/illustrations';

import { varBounce, MotionContainer } from 'src/components/animate';
import { Iconify } from '../iconify';

// ----------------------------------------------------------------------

const ERROR_CONFIGS = {
  403: {
    title: 'No permission',
    description: "You don't have permission to access this resource. Please contact your administrator.",
    illustration: ForbiddenIllustration,
  },
  404: {
    title: 'Not found',
    description: "The resource you're looking for doesn't exist or has been removed.",
    illustration: PageNotFoundIllustration,
  },
  500: {
    title: 'Server error',
    description: 'Something went wrong on our end. Please try again later.',
    illustration: ServerErrorIllustration,
  },
  default: {
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try again.',
    illustration: ServerErrorIllustration,
  },
};

// ----------------------------------------------------------------------

export function ErrorSection({
  error = 'default',
  title,
  description,
  action,
  onAction,
  actionText = 'Back',
  icon = <Iconify icon="eva:arrow-back-fill" />,
  sx,
}) {
  const config = ERROR_CONFIGS[error] || ERROR_CONFIGS.default;
  const Illustration = config.illustration;

  const finalTitle = title || config.title;
  const finalDescription = description || config.description;

  return (
    <SimpleLayout content={{ compact: true }} sx={sx} header={action || onAction ? (
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', p: 2 }}>
        {action || onAction ? (
          <Button onClick={onAction} size="large" startIcon={icon} >
            {actionText}
          </Button>
        ) : null}
      </Box>
    ) : null}>

      <Container component={MotionContainer}>
        <m.div variants={varBounce().in}>
          <Typography variant="h2" sx={{ mb: 2 }}>
            {finalTitle}
          </Typography>
        </m.div>


        {Illustration && (
          <m.div variants={varBounce().in}>
            <Illustration
              sx={{
                height: 260,
                my: { xs: 3, sm: 5 },
              }}
            />
          </m.div>
        )}

        <m.div variants={varBounce().in}>
          <Typography sx={{ color: 'text.secondary', mb: 5 }}>
            {finalDescription}
          </Typography>
        </m.div>

      </Container>
    </SimpleLayout>
  );
}

ErrorSection.propTypes = {
  error: PropTypes.oneOf(['403', '404', '500', 'default']),
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.node,
  onAction: PropTypes.func,
  actionText: PropTypes.string,
  sx: PropTypes.object,
};