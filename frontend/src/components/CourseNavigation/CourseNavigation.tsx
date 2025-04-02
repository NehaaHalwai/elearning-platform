import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PlayCircleOutline,
  Assignment,
  Quiz,
  Description,
  ExpandLess,
  ExpandMore,
  CheckCircle,
  Lock,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface CourseContent {
  _id: string;
  title: string;
  type: 'video' | 'quiz' | 'assignment' | 'document';
  isCompleted?: boolean;
  isLocked?: boolean;
}

interface CourseSection {
  _id: string;
  title: string;
  content: CourseContent[];
}

interface CourseNavigationProps {
  courseId: string;
  sections: CourseSection[];
  currentContentId?: string;
  onContentSelect: (contentId: string) => void;
}

const CourseNavigation: React.FC<CourseNavigationProps> = ({
  courseId,
  sections,
  currentContentId,
  onContentSelect,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  useEffect(() => {
    const currentSection = sections.find((section) =>
      section.content.some((content) => content._id === currentContentId)
    );
    if (currentSection) {
      setExpandedSections((prev) => [...new Set([...prev, currentSection._id])]);
    }
  }, [currentContentId, sections]);

  const handleSectionClick = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleContentClick = (contentId: string) => {
    onContentSelect(contentId);
  };

  const getContentIcon = (type: string) => {
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

  return (
    <Paper sx={{ height: '100%', overflow: 'auto' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">Course Content</Typography>
      </Box>

      <List component="nav">
        {sections.map((section) => (
          <React.Fragment key={section._id}>
            <ListItemButton
              onClick={() => handleSectionClick(section._id)}
              sx={{
                bgcolor: expandedSections.includes(section._id)
                  ? 'action.selected'
                  : 'transparent',
              }}
            >
              <ListItemText primary={section.title} />
              {expandedSections.includes(section._id) ? (
                <ExpandLess />
              ) : (
                <ExpandMore />
              )}
            </ListItemButton>

            <Collapse
              in={expandedSections.includes(section._id)}
              timeout="auto"
              unmountOnExit
            >
              <List component="div" disablePadding>
                {section.content.map((content) => (
                  <ListItemButton
                    key={content._id}
                    onClick={() => !content.isLocked && handleContentClick(content._id)}
                    disabled={content.isLocked}
                    sx={{
                      pl: 4,
                      opacity: content.isLocked ? 0.7 : 1,
                      bgcolor:
                        content._id === currentContentId
                          ? 'primary.light'
                          : 'transparent',
                      '&:hover': {
                        bgcolor: content.isLocked
                          ? 'transparent'
                          : content._id === currentContentId
                          ? 'primary.light'
                          : 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon>
                      {content.isCompleted ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Box sx={{ width: 24 }} />
                      )}
                    </ListItemIcon>
                    <ListItemText primary={content.title} />
                    {content.isLocked && (
                      <Tooltip title="This content is locked">
                        <IconButton size="small" color="default">
                          <Lock fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default CourseNavigation; 