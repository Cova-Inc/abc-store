'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { TableNoData } from 'src/components/table';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email' },
  { id: 'role', label: 'Role' },
  { id: 'status', label: 'Status' },
  { id: 'lastLogin', label: 'Last Login' },
  { id: 'actions', label: 'Actions', align: 'center' },
];

// Mock data for now
const MOCK_USERS = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-01-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    status: 'active',
    lastLogin: '2024-01-14',
  },
];

// ----------------------------------------------------------------------

export function UserListView() {
  const confirm = useBoolean();

  const [selected, setSelected] = useState([]);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = MOCK_USERS.map((user) => user.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelectClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const renderHead = (
    <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography variant="h6">User Management</Typography>

      <Button
        component={RouterLink}
        href={paths.main.users.new}
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
      >
        Add User
      </Button>
    </Box>
  );

  const renderTable = (
    <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
      <Scrollbar>
        <Table size="medium" sx={{ minWidth: 960 }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < MOCK_USERS.length}
                  checked={MOCK_USERS.length > 0 && selected.length === MOCK_USERS.length}
                  onChange={handleSelectAllClick}
                />
              </TableCell>

              {TABLE_HEAD.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.align || 'left'}
                  sx={{ width: headCell.width, minWidth: headCell.minWidth }}
                >
                  {headCell.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {MOCK_USERS.map((user) => (
              <TableRow key={user.id} hover selected={selected.indexOf(user.id) !== -1}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.indexOf(user.id) !== -1}
                    onChange={(event) => handleSelectClick(event, user.id)}
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="subtitle2">{user.name}</Typography>
                </TableCell>

                <TableCell>{user.email}</TableCell>

                <TableCell>
                  <Label color={user.role === 'admin' ? 'error' : 'success'}>{user.role}</Label>
                </TableCell>

                <TableCell>
                  <Label color={user.status === 'active' ? 'success' : 'warning'}>
                    {user.status}
                  </Label>
                </TableCell>

                <TableCell>{user.lastLogin}</TableCell>

                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title="View">
                      <IconButton component={RouterLink} href={paths.main.users.details(user.id)}>
                        <Iconify icon="solar:eye-bold" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit">
                      <IconButton component={RouterLink} href={paths.main.users.edit(user.id)}>
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={confirm.onTrue}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}

            <TableNoData notFound={MOCK_USERS.length === 0} />
          </TableBody>
        </Table>
      </Scrollbar>
    </TableContainer>
  );

  return (
    <DashboardContent maxWidth="xl">
      <Card>
        {renderHead}
        {renderTable}
      </Card>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete User"
        content="Are you sure you want to delete this user? This action cannot be undone."
        action={
          <Button variant="contained" color="error" onClick={confirm.onFalse}>
            Delete
          </Button>
        }
      />
    </DashboardContent>
  );
}
