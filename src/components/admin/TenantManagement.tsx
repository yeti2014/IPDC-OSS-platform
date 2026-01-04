// src/components/admin/TenantManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Block as BlockIcon,
  Visibility as ViewIcon,
  PersonAdd as AddTenantIcon,
} from '@mui/icons-material';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { formatDistanceToNow } from 'date-fns';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

export const TenantManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData: User[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === 'tenant') {
          usersData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as User);
        }
      });
      usersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setUsers(usersData);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isActive: !currentStatus,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Tenant Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {users.length} registered tenants
          </Typography>
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tenant Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Registered</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary" py={4}>
                      No tenants registered yet
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {user.displayName}
                      </Typography>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive !== false ? 'Active' : 'Blocked'}
                        color={user.isActive !== false ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {formatDistanceToNow(user.createdAt, { addSuffix: true })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => handleViewDetails(user)}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={user.isActive !== false ? "Block Tenant" : "Activate Tenant"}>
                          <IconButton
                            size="small"
                            color={user.isActive !== false ? "error" : "success"}
                            onClick={() => handleToggleStatus(user.id, user.isActive !== false)}
                          >
                            {user.isActive !== false ? <BlockIcon /> : <ApproveIcon />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>

      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tenant Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                label="Tenant Name"
                value={selectedUser.displayName}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Email"
                value={selectedUser.email}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Role"
                value={selectedUser.role}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Status"
                value={selectedUser.isActive !== false ? 'Active' : 'Blocked'}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Registered"
                value={selectedUser.createdAt.toLocaleDateString()}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default TenantManagement;