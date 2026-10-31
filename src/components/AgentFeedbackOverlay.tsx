import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { inspectElement, InspectedElementInfo } from './fiberInspector';
import { buildAgentPrompt, FeedbackNote } from './promptBuilder';

export const AgentFeedbackOverlay: React.FC = () => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [hoveredElement, setHoveredElement] = useState<InspectedElementInfo | null>(null);
  const [selectedElement, setSelectedElement] = useState<InspectedElementInfo | null>(null);
  const [userComment, setUserComment] = useState<string>('');
  const [expectedBehavior, setExpectedBehavior] = useState<string>('');
  const [category, setCategory] = useState<'bug' | 'feature' | 'style' | 'logic'>('bug');
  const [copied, setCopied] = useState<boolean>(false);

  const overlayRef = useRef<HTMLDivElement>(null);

  // Горячая клавиша: Ctrl + Shift + F для быстрого вызова
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'F' || e.key === 'f' || e.key === 'А' || e.key === 'а')) {
        e.preventDefault();
        setIsActive((prev) => !prev);
      } else if (e.key === 'Escape' && isActive) {
        if (selectedElement) {
          setSelectedElement(null);
        } else {
          setIsActive(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, selectedElement]);

  // Обработка наведения мыши в режиме инспекции
  useEffect(() => {
    if (!isActive || selectedElement) return;

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement | SVGElement;
      if (!target || target.closest('[data-agent-feedback-ui]')) {
        return;
      }
      const info = inspectElement(target);
      setHoveredElement(info);
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | SVGElement;
      if (!target || target.closest('[data-agent-feedback-ui]')) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      const info = inspectElement(target);
      setSelectedElement(info);
    };

    window.addEventListener('mousemove', handleMouseMove, true);
    window.addEventListener('click', handleClick, true);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove, true);
      window.removeEventListener('click', handleClick, true);
    };
  }, [isActive, selectedElement]);

  const handleCopyPrompt = () => {
    if (!selectedElement) return;
    const note: FeedbackNote = {
      element: selectedElement,
      userComment,
      expectedBehavior,
      category,
      timestamp: new Date().toLocaleString('ru-RU')
    };
    const promptText = buildAgentPrompt(note);
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!selectedElement) return;
    const note: FeedbackNote = {
      element: selectedElement,
      userComment,
      expectedBehavior,
      category,
      timestamp: new Date().toLocaleString('ru-RU')
    };
    const promptText = buildAgentPrompt(note);
    const blob = new Blob([promptText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent_feedback_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCloseModal = () => {
    setSelectedElement(null);
    setUserComment('');
    setExpectedBehavior('');
  };

  return createPortal(
    <div ref={overlayRef} data-agent-feedback-ui="true">
      {/* 1. Плавающая кнопка вызова в правом нижнем углу */}
      {!isActive && (
        <button
          onClick={() => setIsActive(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 999999,
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '24px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'system-ui, sans-serif'
          }}
          title="Нажмите или используйте Ctrl+Shift+F для создания заметки ИИ-агенту"
        >
          <span>🎯</span>
          <span>Заметка для Агента</span>
        </button>
      )}

      {/* 2. Подсветка инспектируемого элемента при наведении */}
      {isActive && hoveredElement && !selectedElement && (
        <div
          style={{
            position: 'fixed',
            left: `${hoveredElement.rect.left}px`,
            top: `${hoveredElement.rect.top}px`,
            width: `${hoveredElement.rect.width}px`,
            height: `${hoveredElement.rect.height}px`,
            pointerEvents: 'none',
            border: '2px solid #2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            zIndex: 999990,
            transition: 'all 0.05s ease-out'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-24px',
              left: '0',
              backgroundColor: '#1e293b',
              color: '#38bdf8',
              fontSize: '11px',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              padding: '2px 8px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
          >
            &lt;{hoveredElement.componentName}&gt; {hoveredElement.selector}
          </div>
        </div>
      )}

      {/* 3. Панель подсказки режима инспекции */}
      {isActive && !selectedElement && (
        <div
          style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '8px 20px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 500,
            zIndex: 999999,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontFamily: 'system-ui, sans-serif'
          }}
        >
          <span>🎯 <strong>Режим инспекции:</strong> Кликните по элементу с ошибкой</span>
          <button
            onClick={() => setIsActive(false)}
            style={{
              background: '#334155',
              border: 'none',
              color: '#e2e8f0',
              borderRadius: '12px',
              padding: '3px 10px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            Выход (ESC)
          </button>
        </div>
      )}

      {/* 4. Модальное окно создания тикета для агента */}
      {selectedElement && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            fontFamily: 'system-ui, sans-serif'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '540px',
              maxWidth: '92vw',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🐞</span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  Заметка для ИИ-Агента
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ✕
              </button>
            </div>

            {/* Target element badge */}
            <div
              style={{
                backgroundColor: '#f1f5f9',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#1e293b',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div><strong>Компонент:</strong> &lt;{selectedElement.componentName}&gt;</div>
              <div><strong>Селектор:</strong> {selectedElement.selector}</div>
              {selectedElement.sourceFile && (
                <div style={{ color: '#0284c7' }}>
                  <strong>Файл:</strong> {selectedElement.sourceFile}
                </div>
              )}
            </div>

            {/* Category selection */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Тип задачи:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['bug', 'logic', 'style', 'feature'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: category === cat ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: category === cat ? '#eff6ff' : '#ffffff',
                      color: category === cat ? '#1d4ed8' : '#475569',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {cat === 'bug' && '🐛 Баг'}
                    {cat === 'logic' && '⚙️ Логика'}
                    {cat === 'style' && '🎨 Стили/UI'}
                    {cat === 'feature' && '✨ Фича'}
                  </button>
                ))}
              </div>
            </div>

            {/* User comment input */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Что нужно исправить? (Суть проблемы):
              </label>
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Например: Линия не строится при вводе цифр, или при нажатии ESC рисовка не сбрасывается..."
                rows={3}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #94a3b8',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />
            </div>

            {/* Expected behavior */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Как должно работать (Ожидание):
              </label>
              <input
                type="text"
                value={expectedBehavior}
                onChange={(e) => setExpectedBehavior(e.target.value)}
                placeholder="Например: Нажатие клавиши ESC должно отменять вторую точку и очищать превью"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #94a3b8',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                onClick={handleCopyPrompt}
                style={{
                  flex: 1,
                  backgroundColor: copied ? '#16a34a' : '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {copied ? '✓ Скопировано в буфер!' : '📋 Скопировать для Агента'}
              </button>

              <button
                onClick={handleDownloadMarkdown}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
                title="Скачать структурированный .md файл"
              >
                💾 Скачать .md
              </button>

              <button
                onClick={handleCloseModal}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontWeight: 500,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
