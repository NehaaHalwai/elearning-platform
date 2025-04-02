import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  PlayCircleOutline,
  Assignment,
  Quiz,
  Description,
  CheckCircle,
  Lock,
} from '@mui/icons-material';
import ChatInterface from '../../components/Chatbot/ChatInterface';

interface CourseContent {
  _id: string;
  title: string;
  type: 'video' | 'quiz' | 'assignment' | 'document';
  duration?: string;
  isCompleted?: boolean;
  isLocked?: boolean;
}

interface CourseDetails {
  _id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    bio: string;
  };
  topics: string[];
  difficulty_level: string;
  duration: string;
  progress: number;
  content: CourseContent[];
}

const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/courses/${courseId}`);
      if (!response.ok) throw new Error('Failed to fetch course details');
      const data = await response.json();
      setCourse(data);
    } catch (err) {
      setError('Failed to load course details. Please try again later.');
      console.error('Error fetching course details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getContentIcon = (type: CourseContent['type']) => {
    switch (type) {
      case 'video':
        return <PlayCircleOutline />;
      case 'quiz':
        return <Quiz />;
      case 'assignment':
        return <Assignment />;
      case 'document':
        return <Description />;
      default:
        return <Description />;
    }
  };

  const handleContentClick = (content: CourseContent) => {
    if (content.isLocked) return;
    
    switch (content.type) {
      case 'video':
        navigate(`/courses/${courseId}/content/${content._id}`);
        break;
      case 'quiz':
        navigate(`/courses/${courseId}/quiz/${content._id}`);
        break;
      case 'assignment':
        navigate(`/courses/${courseId}/assignment/${content._id}`);
        break;
      case 'document':
        navigate(`/courses/${courseId}/document/${content._id}`);
        break;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !course) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Course not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flexBasis: { xs: '100%', md: '66.666%' } }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {course.title}
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={course.difficulty_level}
                color={
                  course.difficulty_level === 'Beginner'
                    ? 'success'
                    : course.difficulty_level === 'Intermediate'
                    ? 'warning'
                    : 'error'
                }
                sx={{ mr: 1 }}
              />
              <Chip label={course.duration} variant="outlined" sx={{ mr: 1 }} />
              {course.topics.map((topic) => (
                <Chip key={topic} label={topic} variant="outlined" sx={{ mr: 1 }} />
              ))}
            </Box>
            <Typography variant="body1" paragraph>
              {course.description}
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Course Progress: {Math.round(course.progress * 100)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={course.progress * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Course Content
            </Typography>
            <List>
              {course.content.map((content, index) => (
                <React.Fragment key={content._id}>
                  <Box 
                    component="li"
                    sx={{
                      display: 'flex',
                      p: 2,
                      opacity: content.isLocked ? 0.7 : 1,
                      cursor: content.isLocked ? 'default' : 'pointer',
                      '&:hover': {
                        backgroundColor: content.isLocked ? 'transparent' : 'action.hover',
                      },
                    }}
                    onClick={content.isLocked ? undefined : () => handleContentClick(content)}
                  >
                    <Box sx={{ mr: 2 }}>
                      {content.isCompleted ? (
                        <CheckCircle color="success" />
                      ) : content.isLocked ? (
                        <Lock color="action" />
                      ) : (
                        getContentIcon(content.type)
                      )}
                    </Box>
                    <Box>
                      <Typography variant="body1">{content.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{content.duration}</Typography>
                    </Box>
                  </Box>
                  {index < course.content.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>

        <Box sx={{ flexBasis: { xs: '100%', md: '33.333%' } }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Instructor
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              {course.instructor.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {course.instructor.bio}
            </Typography>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => setShowChat(!showChat)}
              >
                {showChat ? 'Hide AI Assistant' : 'Show AI Assistant'}
              </Button>
            </Box>
            {showChat && (
              <Box sx={{ height: '400px' }}>
                <ChatInterface courseId={courseId} />
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default CourseDetails;