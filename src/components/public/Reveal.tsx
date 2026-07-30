'use client';
import { useEffect, useRef, type ReactNode, type ElementType } from 'react';

// Animación de entrada al hacer scroll (reemplaza el IntersectionObserver de support.js).
export default function Reveal({
  children, as: Tag = 'div', className, style, delay = 0,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { el.classList.add('is-visible'); io.unobserve(el); }
      });
    }, { threshold: 0.01, rootMargin: '0px 0px 200px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} data-reveal className={className} style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </Tag>
  );
}
