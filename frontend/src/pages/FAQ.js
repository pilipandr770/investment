import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './InfoPage.css';

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Як почати інвестувати на платформі?",
      answer: "Зареєструйтеся на платформі, оберіть інвестиційний продукт, поповніть рахунок та підтвердіть платіж. Детальніше на сторінці 'Як це працює'."
    },
    {
      question: "Яка мінімальна сума інвестицій?",
      answer: "Мінімальна сума залежить від конкретного інвестиційного продукту і вказана в його описі. Зазвичай це від $100 до $1000."
    },
    {
      question: "Які способи оплати доступні?",
      answer: "Ми приймаємо оплату банківськими картами через Stripe, а також криптовалюти: Bitcoin, USDT TRC-20 та USDT ERC-20."
    },
    {
      question: "Як довго обробляється платіж?",
      answer: "Платежі через Stripe обробляються миттєво. Криптовалютні платежі обробляються протягом 24 годин після підтвердження транзакції та завантаження скріншота."
    },
    {
      question: "Чи можу я вивести кошти достроково?",
      answer: "Умови дострокового виведення залежать від конкретного інвестиційного продукту. Зазвичай дострокове виведення можливе, але з втратою частини прибутку."
    },
    {
      question: "Як виводяться кошти?",
      answer: "Після закінчення терміну інвестування ви можете вивести кошти через особистий кабінет. Виведення відбувається протягом 1-3 робочих днів."
    },
    {
      question: "Чи безпечно інвестувати на вашій платформі?",
      answer: "Ми використовуємо найсучасніші технології захисту: SSL шифрування, двофакторну автентифікацію, холодне зберігання криптовалют. Однак пам'ятайте, що всі інвестиції містять ризики."
    },
    {
      question: "Чи є гарантія прибутку?",
      answer: "Ні, ми не гарантуємо прибуток. Всі інвестиції містять ризики, і минулі результати не гарантують майбутніх прибутків. Інвестуйте тільки ті кошти, які можете дозволити собі втратити."
    },
    {
      question: "Чи потрібна верифікація акаунту?",
      answer: "Базова реєстрація не потребує верифікації. Однак для виведення великих сум або відповідно до законодавства може знадобитися підтвердження особи."
    },
    {
      question: "Які комісії стягуються?",
      answer: "Всі комісії чітко вказані в описі кожного інвестиційного продукту. Прихованих платежів немає."
    },
    {
      question: "Чи можу я реінвестувати прибуток?",
      answer: "Так, ви можете реінвестувати отриманий прибуток в той самий або інший інвестиційний продукт для максимізації доходу."
    },
    {
      question: "Як зв'язатися з підтримкою?",
      answer: "Зв'яжіться з нами через сторінку контактів, напишіть на email, використайте онлайн чат або зателефонуйте. Ми відповідаємо протягом 24 годин."
    },
    {
      question: "Чи платять податки з прибутку?",
      answer: "Податкові зобов'язання залежать від законодавства вашої країни. Рекомендуємо проконсультуватися з податковим радником. Ми надаємо всі необхідні документи для звітності."
    },
    {
      question: "Що робити, якщо забув пароль?",
      answer: "На сторінці входу натисніть 'Забули пароль?', введіть свій email, і ми надішлемо вам інструкції для відновлення."
    },
    {
      question: "Чи можна змінити email акаунту?",
      answer: "Так, ви можете змінити email в налаштуваннях особистого кабінету. Для безпеки буде потрібно підтвердження на старий та новий email."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="info-page">
      <div className="container">
        <div className="info-header">
          <Link to="/" className="back-link">← Назад на головну</Link>
          <h1>Часті питання (FAQ)</h1>
          <p className="last-updated">Відповіді на найпопулярніші запитання</p>
        </div>

        <div className="info-content">
          <p style={{fontSize: '1.1rem', marginBottom: '2rem'}}>
            Не знайшли відповідь на своє питання? Зв'яжіться з нами через <Link to="/contacts">сторінку контактів</Link>.
          </p>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item-accordion ${openIndex === index ? 'open' : ''}`}
                style={{
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                  overflow: 'hidden',
                  border: openIndex === index ? '2px solid #667eea' : '2px solid transparent',
                  transition: 'all 0.3s'
                }}
              >
                <div 
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                  style={{
                    padding: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: '600',
                    color: '#2c3e50',
                    fontSize: '1.05rem',
                    userSelect: 'none'
                  }}
                >
                  <span>{faq.question}</span>
                  <span style={{
                    fontSize: '1.5rem',
                    color: '#667eea',
                    transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.3s'
                  }}>
                    ▼
                  </span>
                </div>
                {openIndex === index && (
                  <div 
                    className="faq-answer"
                    style={{
                      padding: '0 1.5rem 1.5rem',
                      color: '#7f8c8d',
                      lineHeight: '1.7',
                      animation: 'fadeIn 0.3s ease-in'
                    }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <section style={{marginTop: '3rem', padding: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', color: 'white', textAlign: 'center'}}>
            <h2 style={{color: 'white', marginBottom: '1rem'}}>Все ще маєте питання?</h2>
            <p style={{marginBottom: '1.5rem', opacity: 0.9}}>
              Наша команда підтримки завжди готова допомогти вам
            </p>
            <Link to="/contacts" style={{
              background: 'white',
              color: '#667eea',
              padding: '1rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              display: 'inline-block',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}>
              Зв'язатися з нами
            </Link>
          </section>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default FAQ;
