import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
// Change this import
import api from '../services/api';
import CourseLayout from '../components/CourseLayout/CourseLayout';

interface CourseContent {
  _id: string;
  title: string;
  type: 'video' | 'quiz' | 'assignment' | 'document';
  content: any;
  isCompleted?: boolean;
  isLocked?: boolean;
}

interface CourseSection {
  _id: string;
  title: string;
  content: CourseContent[];
}

const CoursePage: React.FC = () => {
  const { courseId, contentId } = useParams<{ courseId: string; contentId?: string }>();
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [currentContent, setCurrentContent] = useState<CourseContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch course sections
        const sectionsResponse = await api.get(`/courses/${courseId}/sections`);
        setSections(sectionsResponse.data);

        // If contentId is provided, fetch the specific content
        if (contentId) {
          const contentResponse = await api.get(`/courses/${courseId}/content/${contentId}`);
          setCurrentContent(contentResponse.data);
        }
      } catch (err) {
        setError('Failed to load course data. Please try again later.');
        console.error('Error fetching course data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, contentId]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 64px)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 64px)',
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <CourseLayout
      courseId={courseId!}
      sections={sections}
      currentContentId={contentId || ''}
      // Remove or comment out these props if they're not in the CourseLayoutProps interface
      // currentContent={currentContent}
      // setCurrentContent={setCurrentContent}
    />
  );
};

export default CoursePage;