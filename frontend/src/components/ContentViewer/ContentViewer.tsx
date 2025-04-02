import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Divider,
} from '@mui/material';
import VideoPlayer from '../VideoPlayer/VideoPlayer';

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

const ContentViewer: React.FC<ContentViewerProps> = ({ content }) => {
  const renderContent = () => {
    switch (content.type) {
      case 'video':
        return (
          <VideoPlayer
            videoUrl={content.video_url || ''}
            title={content.title}
            onProgressUpdate={handleProgressUpdate}
            onComplete={handleContentComplete}
          />
        );
      case 'document':
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="body1">{content.content}</Typography>
          </Box>
        );
      case 'quiz':
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="body1">Quiz content will be rendered here</Typography>
          </Box>
        );
      default:
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="body1">Unsupported content type</Typography>
          </Box>
        );
    }
  };

  const handleProgressUpdate = async (progress: number) => {
    try {
      await fetch(
        `${process.env.REACT_APP_API_URL}/api/courses/${content._id}/progress`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ progress }),
        }
      );
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const handleContentComplete = async () => {
    try {
      await fetch(
        `${process.env.REACT_APP_API_URL}/api/courses/${content._id}/complete`,
        {
          method: 'POST',
        }
      );
    } catch (err) {
      console.error('Error marking content as complete:', err);
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {content.title}
        </Typography>
        <Divider sx={{ my: 2 }} />
        {renderContent()}
      </Paper>
    </Container>
  );
};

export default ContentViewer; 