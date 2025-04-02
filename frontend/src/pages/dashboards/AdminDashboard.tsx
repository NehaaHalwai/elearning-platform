import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { Grid } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';

interface DashboardItem {
  title: string;
  description: string;
}

interface CustomGridProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  container?: boolean;
  item?: boolean;
  xs?: number;
  md?: number;
  spacing?: number; // Add spacing prop
}

const CustomGrid: React.FC<CustomGridProps> = ({ children, ...props }) => (
  <Grid {...props}>{children}</Grid>
);

const AdminDashboard = () => {
  const dashboardItems: DashboardItem[] = [
    {
      title: 'User Management',
      description: 'Manage all system users and permissions'
    },
    {
      title: 'System Settings',
      description: 'Configure application settings'
    },
    {
      title: 'Reports',
      description: 'View and generate system reports'
    }
  ];

  return (
    <DashboardLayout title="Admin Dashboard">
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <CustomGrid container spacing={3}>
          {dashboardItems.map((item, index) => (
            <CustomGrid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', width: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body1">
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </CustomGrid>
          ))}
        </CustomGrid>
      </Box>
    </DashboardLayout>
  );
};

export default AdminDashboard;