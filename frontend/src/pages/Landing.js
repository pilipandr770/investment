import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

function Landing() {
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: '🎯',
      title: 'Прозорість',
      description: 'Всі умови та комісії чітко вказані. Ніяких прихованих платежів.'
    },
    {
      icon: '🔒',
      title: 'Безпека',
      description: 'Ваші кошти та дані захищені сучасними технологіями шифрування.'
    },
    {
      icon: '💰',
      title: 'Високий дохід',
      description: 'Конкурентні ставки прибутковості від 8% до 25% річних.'
    },
    {
      icon: '⚡',
      title: 'Швидкість',
      description: 'Миттєве зарахування платежів та швидке виведення прибутку.'
    },
    {
      icon: '📊',
      title: 'Аналітика',
      description: 'Детальна статистика та звіти по всім вашим інвестиціям.'
    },
    {
      icon: '🎓',
      title: 'Простота',
      description: 'Інтуїтивний інтерфейс. Почніть інвестувати за 5 хвилин.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Реєстрація',
      description: 'Створіть безкоштовний обліковий запис за 2 хвилини',
      icon: '👤'
    },
    {
      number: '02',
      title: 'Оберіть продукт',
      description: 'Виберіть інвестиційний план, що відповідає вашим цілям',
      icon: '🎯'
    },
    {
      number: '03',
      title: 'Поповніть рахунок',
      description: 'Використайте банківську карту або криптовалюту',
      icon: '💳'
    },
    {
      number: '04',
      title: 'Отримуйте прибуток',
      description: 'Спостерігайте за зростанням вашого капіталу щодня',
      icon: '📈'
    }
  ];

  const stats = [
    { value: '5000+', label: 'Активних інвесторів' },
    { value: '$10M+', label: 'Інвестовано коштів' },
    { value: '18%', label: 'Середня дохідність' },
    { value: '24/7', label: 'Підтримка клієнтів' }
  ];

  const testimonials = [
    {
      name: 'Олександр К.',
      role: 'Підприємець',
      text: 'Інвестую вже 8 місяців. Прибуток стабільний, платформа надійна. Рекомендую!',
      rating: 5
    },
    {
      name: 'Марія С.',
      role: 'Фрілансер',
      text: 'Почала з мінімальної суми. Через 3 місяці збільшила інвестицію втричі. Дуже задоволена!',
      rating: 5
    },
    {
      name: 'Дмитро В.',
      role: 'IT-спеціаліст',
      text: 'Зручний інтерфейс, швидка підтримка. Все працює як годинник.',
      rating: 5
    }
  ];

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Інвестуйте в своє майбутнє
              <span className="gradient-text"> вже сьогодні</span>
            </h1>
            <p className="hero-subtitle">
              Надійна платформа для пасивного доходу. Прозорі умови, високі ставки, 
              безпечні інвестиції. Почніть заробляти від 8% до 25% річних.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                Почати інвестувати
                <span className="btn-icon">→</span>
              </Link>
              <Link to="/how-it-works" className="btn btn-secondary btn-large">
                Як це працює
              </Link>
            </div>
            <div className="hero-trust">
              <div className="trust-badges">
                <div className="badge">
                  <span className="badge-icon">✓</span>
                  <span>SSL шифрування</span>
                </div>
                <div className="badge">
                  <span className="badge-icon">✓</span>
                  <span>Ліцензована платформа</span>
                </div>
                <div className="badge">
                  <span className="badge-icon">✓</span>
                  <span>5000+ інвесторів</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card animate-on-scroll" id={`stat-${index}`}>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Чому обирають нас</h2>
            <p className="section-subtitle">
              Ми створили найкращі умови для вашого фінансового зростання
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`feature-card animate-on-scroll ${isVisible[`feature-${index}`] ? 'visible' : ''}`}
                id={`feature-${index}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Як почати інвестувати</h2>
            <p className="section-subtitle">
              Всього 4 простих кроки відділяють вас від пасивного доходу
            </p>
          </div>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`step-card animate-on-scroll ${isVisible[`step-${index}`] ? 'visible' : ''}`}
                id={`step-${index}`}
              >
                <div className="step-number">{step.number}</div>
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
                {index < steps.length - 1 && <div className="step-connector">→</div>}
              </div>
            ))}
          </div>
          <div className="steps-cta">
            <Link to="/register" className="btn btn-primary btn-large">
              Почати зараз
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Що кажуть наші клієнти</h2>
            <p className="section-subtitle">
              Реальні відгуки від реальних людей
            </p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className={`testimonial-card animate-on-scroll ${isVisible[`testimonial-${index}`] ? 'visible' : ''}`}
                id={`testimonial-${index}`}
              >
                <div className="testimonial-rating">
                  {'⭐'.repeat(testimonial.rating)}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="author-info">
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Готові почати заробляти?</h2>
            <p className="cta-subtitle">
              Приєднуйтесь до тисяч успішних інвесторів вже сьогодні
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-white btn-large">
                Створити акаунт безкоштовно
              </Link>
              <Link to="/login" className="btn btn-outline btn-large">
                Вже маєте акаунт? Увійти
              </Link>
            </div>
            <p className="cta-note">
              ⚠️ Інвестиції містять ризики. Рекомендуємо ознайомитись з <Link to="/disclaimer">відмовою від відповідальності</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Landing;
