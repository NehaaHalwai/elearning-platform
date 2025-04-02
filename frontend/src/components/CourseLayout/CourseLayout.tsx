import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Grid as MuiGrid } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { useParams } from 'react-router-dom';
import CourseNavigation from '../CourseNavigation/CourseNavigation';
import ContentViewer from '../ContentViewer/ContentViewer';
import ChatInterface from '../Chatbot/ChatInterface';

interface GridProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  container?: boolean;
  item?: boolean;
  xs?: number;
  md?: number;
  spacing?: number;
}

const Grid: React.FC<GridProps> = ({ children, ...props }) => (
  <MuiGrid {...props}>{children}</MuiGrid>
);

interface Content {
  _id: string;
  title: string;
  type: 'video' | 'document' | 'quiz';
  content: string;
  video_url?: string;
  duration?: string;
  next_content_id?: string;
  previous_content_id?: string;
}

interface ContentViewerProps {
  content: Content;
}

// Define CourseContent interface
interface CourseContent {
  _id: string;
  title: string;
  type: 'video' | 'quiz' | 'assignment' | 'document';
  duration?: string;
  isCompleted?: boolean;
  isLocked?: boolean;
}

// Define CourseSection interface
interface CourseSection {
  _id: string;
  title: string;
  content: CourseContent[]; // Changed from 'contents' to 'content' to match usage
}

// Update the props interface
interface CourseLayoutProps {
  courseId: string;
  sections: CourseSection[];
  currentContentId: string;
  currentContent?: CourseContent | null;
  setCurrentContent?: React.Dispatch<React.SetStateAction<CourseContent | null>>;
}

const CourseLayout: React.FC<CourseLayoutProps> = ({
  courseId,
  sections,
  currentContentId,
  setCurrentContent,
}) => {
  // Add state for contentIdState
  const [contentIdState, setContentIdState] = useState(currentContentId);
  
  // Handle content selection
  const handleContentSelect = (contentId: string) => {
    setContentIdState(contentId);
    // Find the content by ID and set it if setCurrentContent is provided
    const foundContent = sections
      .flatMap((section) => section.content)
      .find((content) => content._id === contentId);
      
    if (foundContent && setCurrentContent) {
      setCurrentContent(foundContent);
    }
  };
  
  // Find current content
  const displayContent = sections
    .flatMap((section) => section.content)
    .find((content) => content._id === currentContentId);

  return (
    <Box sx={{ flexGrow: 1, height: '100%' }}>
      <Grid container spacing={3} sx={{ height: 'calc(100vh - 64px)' }}>
        {/* Navigation Sidebar */}
        <Grid item xs={12} md={3} sx={{ height: '100%' }}>
          <CourseNavigation
            courseId={courseId}
            sections={sections}
            currentContentId={currentContentId}
            onContentSelect={handleContentSelect}
          />
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={12} md={6} sx={{ height: '100%' }}>
          <Paper sx={{ height: '100%', overflow: 'auto', p: 3 }}>
            {displayContent ? (
              <ContentViewer content={displayContent as unknown as Content} />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Select content from the navigation menu
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Chat Interface */}
        <Grid item xs={12} md={3} sx={{ height: '100%' }}>
          <Paper sx={{ height: '100%', overflow: 'hidden' }}>
            <ChatInterface contentId={contentIdState} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CourseLayout;