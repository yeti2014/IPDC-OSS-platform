// src/components/common/AnnouncementBanner.tsx
import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, Box, IconButton, Collapse } from '@mui/material';
import { Close as CloseIcon, Campaign as CampaignIcon } from '@mui/icons-material';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Announcement } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export const AnnouncementBanner: React.FC = () => {
  const { userData } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userData) return;

    const q = query(
      collection(db, 'announcements'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const announcementData: Announcement[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const announcement: Announcement = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          expiresAt: data.expiresAt?.toDate(),
        } as Announcement;

        // Check if expired
        if (announcement.expiresAt && announcement.expiresAt < new Date()) {
          return;
        }

        // Check if announcement is for this user's role
        // Handle both singular (tenant/admin/operations) and plural (tenants) formats
        const isForThisUser =
          announcement.targetAudience === 'all' ||
          announcement.targetAudience === userData.role ||
          (userData.role === 'tenant' && announcement.targetAudience === 'tenants') ||
          (userData.role === 'admin' && announcement.targetAudience === 'admins') ||
          (userData.role === 'operations' && announcement.targetAudience === 'operations');

        if (isForThisUser) {
          announcementData.push(announcement);
        }
      });

      setAnnouncements(announcementData);
    });

    return () => unsubscribe();
  }, [userData]);

  const handleDismiss = (id: string) => {
    setDismissed(new Set([...dismissed, id]));
  };

  const getSeverity = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'success';
    }
  };

  const visibleAnnouncements = announcements.filter(a => !dismissed.has(a.id));

  if (visibleAnnouncements.length === 0) return null;

  return (
    <Box>
      {visibleAnnouncements.map((announcement) => (
        <Collapse key={announcement.id} in={!dismissed.has(announcement.id)}>
          <Alert
            severity={getSeverity(announcement.priority)}
            icon={<CampaignIcon />}
            action={
              <IconButton
                size="small"
                onClick={() => handleDismiss(announcement.id)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
            sx={{ borderRadius: 0, mb: 0 }}
          >
            <AlertTitle sx={{ fontWeight: 'bold' }}>{announcement.title}</AlertTitle>
            {announcement.message}
          </Alert>
        </Collapse>
      ))}
    </Box>
  );
};

export default AnnouncementBanner;