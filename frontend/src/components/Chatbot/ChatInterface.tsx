import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
  Divider,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatInterfaceProps {
  courseId?: string;
  contentId?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ courseId, contentId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_CHATBOT_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'current-user-id', // Replace with actual user ID
          message: input,
          course_id: courseId,
          content_id: contentId,
          context: messages.slice(-5).map((m) => m.text), // Last 5 messages for context
        }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '600px',
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="div">
          AI Learning Assistant
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'flex-start',
              flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
            }}
          >
            {message.sender === 'bot' ? (
              <SmartToyIcon color="primary" />
            ) : (
              <PersonIcon color="action" />
            )}
            <Paper
              elevation={1}
              sx={{
                p: 1.5,
                maxWidth: '70%',
                backgroundColor: message.sender === 'user' ? 'primary.light' : 'background.paper',
                color: message.sender === 'user' ? 'primary.contrastText' : 'text.primary',
              }}
            >
              <Typography variant="body1">{message.text}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {message.timestamp.toLocaleTimeString()}
              </Typography>
            </Paper>
          </Box>
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <SmartToyIcon color="primary" />
            <CircularProgress size={20} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question..."
          variant="outlined"
          size="small"
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default ChatInterface; 