import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Button,
  LinearProgress,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

interface Question {
  _id: string;
  text: string;
  options: string[];
  correct_option: number;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  time_limit?: number; // in minutes
  passing_score: number;
}

const QuizInterface: React.FC = () => {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quiz?.time_limit && timeLeft !== null) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz?.time_limit, timeLeft]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/courses/${courseId}/quizzes/${quizId}`
      );
      if (!response.ok) throw new Error('Failed to fetch quiz');
      const data = await response.json();
      setQuiz(data);
      setTimeLeft(data.time_limit ? data.time_limit * 60 : null);
      setAnswers(new Array(data.questions.length).fill(-1));
      setLoading(false);
    } catch (err) {
      setError('Failed to load quiz. Please try again later.');
      console.error('Error fetching quiz:', err);
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = answerIndex;
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/courses/${courseId}/quizzes/${quizId}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ answers }),
        }
      );

      if (!response.ok) throw new Error('Failed to submit quiz');
      const result = await response.json();
      
      // Navigate to results page
      navigate(`/courses/${courseId}/quiz/${quizId}/results`, {
        state: { result },
      });
    } catch (err) {
      setError('Failed to submit quiz. Please try again.');
      console.error('Error submitting quiz:', err);
    } finally {
      setSubmitting(false);
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

  if (error || !quiz) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Quiz not found'}</Alert>
      </Box>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" component="h1">
            {quiz.title}
          </Typography>
          {timeLeft !== null && (
            <Typography variant="h6" color="primary">
              Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </Typography>
          )}
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8, borderRadius: 4, mb: 3 }}
        />
        <Typography variant="body1" paragraph>
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </Typography>
        <Typography variant="h6" gutterBottom>
          {currentQuestion.text}
        </Typography>
        <FormControl component="fieldset" sx={{ mt: 2 }}>
          <RadioGroup
            value={answers[currentQuestionIndex]}
            onChange={(e) =>
              handleAnswerChange(currentQuestionIndex, parseInt(e.target.value))
            }
          >
            {currentQuestion.options.map((option, index) => (
              <FormControlLabel
                key={index}
                value={index}
                control={<Radio />}
                label={option}
                sx={{ mb: 1 }}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || answers.includes(-1)}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={answers[currentQuestionIndex] === -1}
          >
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default QuizInterface; 