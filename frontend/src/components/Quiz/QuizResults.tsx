import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  EmojiEvents,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';

interface QuizResult {
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken: number;
  questions: {
    _id: string;
    text: string;
    correct_option: number;
    user_answer: number;
    options: string[];
  }[];
}

const QuizResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as QuizResult;

  if (!result) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">No quiz results found.</Alert>
      </Box>
    );
  }

  const percentage = (result.score / result.total_questions) * 100;
  const isPassed = percentage >= 70; // Assuming 70% is passing score

  const getPerformanceMessage = () => {
    if (percentage >= 90) {
      return {
        message: 'Excellent! You have mastered this topic!',
        icon: <EmojiEvents color="success" />,
      };
    } else if (percentage >= 80) {
      return {
        message: 'Great job! You have a strong understanding.',
        icon: <TrendingUp color="success" />,
      };
    } else if (percentage >= 70) {
      return {
        message: 'Good work! You have passed the quiz.',
        icon: <CheckCircle color="success" />,
      };
    } else {
      return {
        message: 'Keep practicing! You can do better.',
        icon: <TrendingDown color="error" />,
      };
    }
  };

  const performance = getPerformanceMessage();

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          {performance.icon}
          <Typography variant="h5" component="h1" sx={{ ml: 2 }}>
            Quiz Results
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color={isPassed ? 'success.main' : 'error.main'}>
              {percentage.toFixed(1)}%
            </Typography>
            <Typography variant="body1">Score</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4">
              {result.correct_answers}/{result.total_questions}
            </Typography>
            <Typography variant="body1">Correct Answers</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4">
              {Math.floor(result.time_taken / 60)}:{(result.time_taken % 60)
                .toString()
                .padStart(2, '0')}
            </Typography>
            <Typography variant="body1">Time Taken</Typography>
          </Box>
        </Box>

        <Typography variant="h6" gutterBottom>
          {performance.message}
        </Typography>

        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
          Question Review
        </Typography>

        <List>
          {result.questions.map((question, index) => (
            <Paper key={question._id} sx={{ mb: 2, p: 2 }}>
              <ListItem>
                <ListItemIcon>
                  {question.user_answer === question.correct_option ? (
                    <CheckCircle color="success" />
                  ) : (
                    <Cancel color="error" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1">
                      Question {index + 1}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body1" paragraph>
                        {question.text}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Your answer:{' '}
                        {question.options[question.user_answer]}
                      </Typography>
                      {question.user_answer !== question.correct_option && (
                        <Typography
                          variant="body2"
                          color="success.main"
                          sx={{ mt: 1 }}
                        >
                          Correct answer:{' '}
                          {question.options[question.correct_option]}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          variant="contained"
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          Back to Course
        </Button>
        {!isPassed && (
          <Button
            variant="outlined"
            onClick={() => navigate(0)}
          >
            Retry Quiz
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default QuizResults; 