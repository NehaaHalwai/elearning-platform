import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  LinearProgress,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface CourseCardProps {
  course: {
    _id: string;
    title: string;
    description: string;
    instructor_id: string;
    topics: string[];
    difficulty_level: string;
    progress?: number;
    image_url?: string;
  };
  onEnroll?: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onEnroll }) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ maxWidth: 345, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="140"
        image={course.image_url || 'https://source.unsplash.com/random/345x140?education'}
        alt={course.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div">
          {course.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {course.description.substring(0, 100)}...
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
            size="small"
            sx={{ mr: 1 }}
          />
          <Chip
            label={`${course.topics.length} Topics`}
            variant="outlined"
            size="small"
          />
        </Box>
        {course.progress !== undefined && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Progress: {Math.round(course.progress * 100)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={course.progress * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}
      </CardContent>
      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate(`/courses/${course._id}`)}
        >
          {course.progress !== undefined ? 'Continue Learning' : 'View Course'}
        </Button>
      </Box>
    </Card>
  );
};

export default CourseCard; 