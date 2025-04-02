import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { Theme } from '@mui/material/styles';

const Item = styled(Paper)(({ theme }: { theme: Theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const InstructorDashboard = () => {
  const dashboardItems = [
    {
      title: 'Manage Courses',
      description: 'Create and manage your courses'
    },
    {
      title: 'Students',
      description: 'View and manage enrolled students'
    },
    {
      title: 'Content',
      description: 'Create and manage course content'
    }
  ];

  return (
    <DashboardLayout title="Instructor Dashboard">
      <Box sx={{ 
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3
      }}>
        {dashboardItems.map((item, index) => (
          <Box key={index} sx={{ 
            flexBasis: {
              xs: '100%',
              md: 'calc(33.33% - 16px)'
            }
          }}>
            <Card>
              <CardContent>
                <Typography variant="h6">{item.title}</Typography>
                <Typography>{item.description}</Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </DashboardLayout>
  );
};

export default InstructorDashboard;