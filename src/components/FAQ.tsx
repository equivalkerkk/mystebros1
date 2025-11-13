import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const FAQ: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const toggleFAQ = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="faq-section">
      <div className="faq-header" onClick={toggleFAQ}>
        <div className="faq-content">
          <div className="faq-title">{t.faqTitle}</div>
          <div className="faq-subtitle">{t.faqSubtitle}</div>
        </div>
        <div className="faq-toggle-btn">
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 20 20" 
            fill="none" 
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}
          >
            <path 
              d="M5 7.5L10 12.5L15 7.5" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {isOpen && (
        <div className="faq-list">
          <div className="faq-item">
            <div className="faq-question">{t.faq1Q}</div>
            <div className="faq-answer">{t.faq1A}</div>
          </div>
          <div className="faq-item">
            <div className="faq-question">{t.faq2Q}</div>
            <div className="faq-answer">{t.faq2A}</div>
          </div>
          <div className="faq-item">
            <div className="faq-question">{t.faq3Q}</div>
            <div className="faq-answer">{t.faq3A}</div>
          </div>
          <div className="faq-item">
            <div className="faq-question">{t.faq4Q}</div>
            <div className="faq-answer">{t.faq4A}</div>
          </div>
          <div className="faq-item">
            <div className="faq-question">{t.faq5Q}</div>
            <div className="faq-answer">{t.faq5A}</div>
          </div>
          <div className="faq-item">
            <div className="faq-question">{t.faq6Q}</div>
            <div className="faq-answer">{t.faq6A}</div>
          </div>
          <div className="faq-item">
            <div className="faq-question">{t.faq7Q}</div>
            <div className="faq-answer">{t.faq7A}</div>
          </div>
          <div className="faq-item">
            <div className="faq-question">{t.faq8Q}</div>
            <div className="faq-answer">{t.faq8A}</div>
          </div>
          <div className="faq-item">
            <div className="faq-question">{t.faq9Q}</div>
            <div className="faq-answer">{t.faq9A}</div>
          </div>
          <div className="faq-item">
            <div className="faq-question">{t.faq10Q}</div>
            <div className="faq-answer">{t.faq10A}</div>
          </div>
          <div className="faq-item">
            <div className="faq-question">{t.faq11Q}</div>
            <div className="faq-answer">{t.faq11A}</div>
          </div>
          <div className="faq-item">
            <div className="faq-question">{t.faq12Q}</div>
            <div className="faq-answer">{t.faq12A}</div>
          </div>
          <div className="faq-item">
            <div className="faq-question">{t.faq13Q}</div>
            <div className="faq-answer">{t.faq13A}</div>
          </div>
          <div className="faq-item">
            <div className="faq-question">{t.faq14Q}</div>
            <div className="faq-answer">{t.faq14A}</div>
          </div>
          <div className="faq-item">
            <div className="faq-question">{t.faq15Q}</div>
            <div className="faq-answer">{t.faq15A}</div>
          </div>
          <div className="faq-item">
            <div className="faq-question">{t.faq16Q}</div>
            <div className="faq-answer">{t.faq16A}</div>
          </div>
          <div className="faq-item">
            <div className="faq-question">{t.faq17Q}</div>
            <div className="faq-answer">{t.faq17A}</div>
          </div>
          <div className="faq-item">
            <div className="faq-question">{t.faq18Q}</div>
            <div className="faq-answer">{t.faq18A}</div>
          </div>
          <div className="faq-item">
            <div className="faq-question">{t.faq19Q}</div>
            <div className="faq-answer">{t.faq19A}</div>
          </div>
          <div className="faq-item">
            <div className="faq-question">{t.faq20Q}</div>
            <div className="faq-answer">{t.faq20A}</div>
          </div>
        </div>
      )}
    </div>
  );
};
