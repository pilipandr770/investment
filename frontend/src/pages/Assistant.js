import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Assistant.css';
import { API_URL } from '../config/api';

function Assistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Вітаю! Я AI-асистент інвестиційної платформи. Допоможу вам розібратися з функціоналом сайту.\n\n📌 Можете запитати:\n• Як почати інвестувати?\n• Як поповнити рахунок?\n• Як вивести кошти?\n• Де переглянути мої інвестиції?\n• Як зв\'язатися з підтримкою?\n\nПитайте, буду радий допомогти! 😊'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const suggestedQuestions = [
    '🚀 Як почати інвестувати?',
    '💳 Які способи оплати доступні?',
    '📊 Де переглянути мої інвестиції?',
    '💰 Як вивести кошти?',
    '📞 Як зв\'язатися з підтримкою?',
    '❓ Яка мінімальна сума інвестиції?'
  ];

  const handleSendMessage = async (messageText = null) => {
    const message = messageText || inputMessage.trim();
    
    if (!message) return;

    // Додаємо повідомлення користувача
    const userMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/assistant/chat`, {
        message,
        conversationHistory
      });

      // Додаємо відповідь асистента
      const assistantMessage = {
        role: 'assistant',
        content: response.data.message
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationHistory(response.data.conversationHistory);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: '❌ Вибачте, виникла помилка при обробці вашого запиту. Будь ласка, спробуйте ще раз або зв\'яжіться з підтримкою через сторінку /contacts'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: '👋 Чат очищено. Чим можу допомогти?'
      }
    ]);
    setConversationHistory([]);
  };

  return (
    <div className="assistant-page">
      <div className="assistant-container">
        <div className="assistant-header">
          <div className="header-info">
            <div className="assistant-avatar">🤖</div>
            <div>
              <h1 className="assistant-title">AI-Асистент</h1>
              <p className="assistant-subtitle">Гід по платформі • Онлайн</p>
            </div>
          </div>
          <button onClick={handleClearChat} className="clear-chat-btn" title="Очистити чат">
            🗑️ Очистити
          </button>
        </div>

        <div className="assistant-info-banner">
          <span className="info-icon">ℹ️</span>
          <p>
            Я допоможу розібратися з функціоналом платформи. 
            Для інвестиційних консультацій зверніться до служби підтримки.
          </p>
        </div>

        <div className="messages-container">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              <div className="message-avatar">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                <div className="message-text">{msg.content}</div>
                <div className="message-time">
                  {new Date().toLocaleTimeString('uk-UA', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message assistant-message">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className="suggested-questions">
            <p className="suggested-title">💡 Популярні питання:</p>
            <div className="questions-grid">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  className="suggested-question"
                  onClick={() => handleSendMessage(question.replace(/^[🚀💳📊💰📞❓]\s/, ''))}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Напишіть ваше питання..."
              className="message-input"
              rows="1"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="send-button"
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </div>
          <div className="input-hint">
            <span>💡 Підказка: Натисніть Enter для відправки, Shift+Enter для нового рядка</span>
          </div>
        </div>
      </div>

      <div className="assistant-sidebar">
        <div className="sidebar-card">
          <h3>🎯 Про асистента</h3>
          <p>
            Я створений для того, щоб допомогти вам швидко знайти потрібну інформацію 
            про роботу платформи.
          </p>
        </div>

        <div className="sidebar-card">
          <h3>✅ Я можу допомогти з:</h3>
          <ul>
            <li>Навігацією по сайту</li>
            <li>Інструкціями по використанню</li>
            <li>Поясненням функцій</li>
            <li>Відповідями на технічні питання</li>
          </ul>
        </div>

        <div className="sidebar-card">
          <h3>⚠️ Не надаю консультацій з:</h3>
          <ul>
            <li>Інвестиційних стратегій</li>
            <li>Фінансових порад</li>
            <li>Конкретних активів</li>
          </ul>
          <p className="sidebar-note">
            Для таких питань зверніться до служби підтримки через <a href="/contacts">сторінку контактів</a>
          </p>
        </div>

        <div className="sidebar-card quick-links">
          <h3>🔗 Корисні посилання</h3>
          <a href="/how-it-works">Як це працює</a>
          <a href="/faq">Часті питання</a>
          <a href="/contacts">Контакти</a>
          <a href="/terms">Правила</a>
        </div>
      </div>
    </div>
  );
}

export default Assistant;
