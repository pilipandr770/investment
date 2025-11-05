import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Footer.css';
import { API_URL } from '../config/api';

function Footer() {
  const [socialLinks, setSocialLinks] = useState({});

  useEffect(() => {
    loadSocialLinks();
  }, []);

  const loadSocialLinks = async () => {
    try {
      const response = await axios.get(`${API_URL}/social-links`);
      setSocialLinks(response.data);
    } catch (err) {
      console.error('Failed to load social links:', err);
    }
  };

  const socialPlatforms = [
    {
      key: 'facebook',
      label: 'Facebook',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: '#1877F2'
    },
    {
      key: 'instagram',
      label: 'Instagram',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      ),
      color: '#E4405F'
    },
    {
      key: 'twitter',
      label: 'Twitter',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      color: '#1DA1F2'
    },
    {
      key: 'telegram',
      label: 'Telegram',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      ),
      color: '#0088CC'
    }
  ];

  // Фільтруємо тільки активні соціальні мережі
  const activeSocials = socialPlatforms.filter(platform => socialLinks[platform.key]);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Інформація про компанію */}
          <div className="footer-section">
            <h3>Інвестиційна платформа</h3>
            <p className="footer-description">
              Надійні інвестиції з прозорими умовами.<br />
              Ваш шлях до фінансової свободи.
            </p>
            <p className="footer-copyright">© 2024 Всі права захищені</p>
          </div>

          {/* Корисні посилання */}
          <div className="footer-section">
            <h4>Інформація</h4>
            <ul className="footer-links">
              <li><Link to="/about">Про нас</Link></li>
              <li><Link to="/how-it-works">Як це працює</Link></li>
              <li><Link to="/assistant">🤖 AI-Асистент</Link></li>
              <li><Link to="/faq">Часті питання</Link></li>
              <li><Link to="/contacts">Контакти</Link></li>
            </ul>
          </div>

          {/* Правова інформація */}
          <div className="footer-section">
            <h4>Правова інформація</h4>
            <ul className="footer-links">
              <li><Link to="/terms">Правила користування</Link></li>
              <li><Link to="/privacy">Політика конфіденційності</Link></li>
              <li><Link to="/cookie-policy">Політика cookies</Link></li>
              <li><Link to="/disclaimer">Відмова від відповідальності</Link></li>
            </ul>
          </div>

          {/* Соціальні мережі */}
          {activeSocials.length > 0 && (
            <div className="footer-section">
              <h4>Слідкуйте за нами</h4>
              <div className="social-icons">
                {activeSocials.map(platform => (
                  <a
                    key={platform.key}
                    href={socialLinks[platform.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    style={{ '--hover-color': platform.color }}
                    title={platform.label}
                    aria-label={platform.label}
                  >
                    {platform.icon}
                  </a>
                ))}
              </div>
              <p className="social-description">
                Підписуйтесь на наші соціальні мережі для отримання останніх новин та оновлень
              </p>
            </div>
          )}
        </div>

        {/* Додаткова інформація */}
        <div className="footer-bottom">
          <p className="footer-disclaimer">
            ⚠️ Інвестиції містять ризики. Минулі результати не гарантують майбутніх прибутків. 
            Перед прийняттям інвестиційних рішень рекомендуємо проконсультуватися з фінансовим радником.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
