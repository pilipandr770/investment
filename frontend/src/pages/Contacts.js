import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './InfoPage.css';

function Contacts() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement API call to send message
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="info-page">
      <div className="container">
        <div className="info-header">
          <Link to="/" className="back-link">← Назад на головну</Link>
          <h1>Контакти</h1>
          <p className="last-updated">Ми завжди раді відповісти на ваші запитання</p>
        </div>

        <div className="contacts-grid">
          <div className="contact-info">
            <h2>Зв'яжіться з нами</h2>
            
            <div className="contact-item">
              <div className="contact-icon">📧</div>
              <div>
                <h3>Email</h3>
                <p>support@investment-platform.com</p>
                <p className="contact-note">Відповідаємо протягом 24 годин</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">📱</div>
              <div>
                <h3>Телефон</h3>
                <p>+380 (XX) XXX-XX-XX</p>
                <p className="contact-note">Пн-Пт: 9:00 - 18:00</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">💬</div>
              <div>
                <h3>Онлайн чат</h3>
                <p>Доступний на сайті</p>
                <p className="contact-note">Середній час відповіді: 5 хвилин</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">📍</div>
              <div>
                <h3>Адреса офісу</h3>
                <p>вул. Хрещатик, 1</p>
                <p>Київ, 01001, Україна</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">🕐</div>
              <div>
                <h3>Робочі години</h3>
                <p>Понеділок - П'ятниця: 9:00 - 18:00</p>
                <p>Субота - Неділя: Вихідний</p>
              </div>
            </div>
          </div>

          <div className="contact-form-wrapper">
            <h2>Напишіть нам</h2>
            {submitted && (
              <div className="success-message">
                ✅ Дякуємо! Ваше повідомлення надіслано. Ми зв'яжемося з вами найближчим часом.
              </div>
            )}
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Ваше ім'я *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Введіть ваше ім'я"
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label>Тема *</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Оберіть тему</option>
                  <option value="general">Загальне питання</option>
                  <option value="investment">Питання по інвестиціям</option>
                  <option value="payment">Питання по оплаті</option>
                  <option value="technical">Технічна підтримка</option>
                  <option value="partnership">Партнерство</option>
                  <option value="other">Інше</option>
                </select>
              </div>

              <div className="form-group">
                <label>Повідомлення *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Опишіть ваше питання детальніше..."
                />
              </div>

              <button type="submit" className="submit-btn">
                Відправити повідомлення
              </button>
            </form>
          </div>
        </div>

        <div className="faq-section">
          <h2>Часті питання</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>Як почати інвестувати?</h3>
              <p>Зареєструйтеся на платформі, пройдіть верифікацію та оберіть інвестиційний продукт, який вас цікавить.</p>
            </div>
            <div className="faq-item">
              <h3>Які способи оплати доступні?</h3>
              <p>Ми приймаємо платежі через Stripe, а також криптовалюти: Bitcoin та USDT (TRC-20, ERC-20).</p>
            </div>
            <div className="faq-item">
              <h3>Як зняти прибуток?</h3>
              <p>Зайдіть в особистий кабінет, оберіть "Мої інвестиції" та натисніть "Зняти кошти" для активного інвестування.</p>
            </div>
            <div className="faq-item">
              <h3>Чи є мінімальна сума інвестицій?</h3>
              <p>Так, мінімальна сума вказана в описі кожного інвестиційного продукту і може відрізнятися.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contacts;
