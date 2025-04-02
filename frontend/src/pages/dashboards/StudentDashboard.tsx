import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions 
} from '@mui/material';
import { Grid as MuiGrid } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// Create a Grid wrapper component to handle the type issues
interface GridProps {
  children: React.ReactNode;
  item?: boolean;
  container?: boolean;
  xs?: number;
  sm?: number;
  md?: number;
  spacing?: number;
  sx?: SxProps<Theme>;
  key?: string;
}

const Grid: React.FC<GridProps> = ({ children, ...props }) => (
  <MuiGrid {...props}>{children}</MuiGrid>
);

// Define proper interfaces
interface User {
  id: string; // Using id instead of _id
  name: string;
  email: string;
  role: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor_id: string;
  topics: string[];
  difficulty_level: string;
  progress?: number;
  image_url?: string;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch enrolled courses
        const coursesResponse = await api.get('/courses/enrolled');
        setEnrolledCourses(coursesResponse.data);
        
        // Fetch recommended courses
        if (user) {
          const recommendationsResponse = await api.get('/recommendations');
          setRecommendedCourses(recommendationsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              Welcome back, {user?.name || 'Student'}!
            </Typography>
            <Typography variant="body1">
              Continue your learning journey or explore new courses.
            </Typography>
          </Paper>
        </Grid>

        {/* Enrolled Courses */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            My Courses
          </Typography>
          <Grid container spacing={3}>
            {enrolledCourses.length > 0 ? (
              enrolledCourses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course._id}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="140"
                      image={course.image_url || '/course-placeholder.jpg'}
                      alt={course.title}
                    />
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {course.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {course.description.substring(0, 100)}...
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          Progress: {Math.round((course.progress || 0) * 100)}%
                        </Typography>
                        <Box
                          sx={{
                            mt: 1,
                            width: '100%',
                            height: 8,
                            bgcolor: 'grey.300',
                            borderRadius: 4,
                            position: 'relative',
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              height: '100%',
                              borderRadius: 4,
                              bgcolor: 'primary.main',
                              width: `${Math.round((course.progress || 0) * 100)}%`,
                            }}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        onClick={() => handleCourseClick(course._id)}
                      >
                        Continue
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1">
                    You are not enrolled in any courses yet.
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/courses')}
                  >
                    Browse Courses
                  </Button>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* Recommended Courses */}
        <Grid item xs={12} sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Recommended for You
          </Typography>
          <Grid container spacing={3}>
            {recommendedCourses.length > 0 ? (
              recommendedCourses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course._id}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="140"
                      image={course.image_url || '/course-placeholder.jpg'}
                      alt={course.title}
                    />
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {course.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {course.description.substring(0, 100)}...
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        onClick={() => handleCourseClick(course._id)}
                      >
                        View Course
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1">
                    No recommendations available at this time.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentDashboard;