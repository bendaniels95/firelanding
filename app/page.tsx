'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

// ============================================
// TYPES
// ============================================

type Section = 'home' | 'features' | 'how-it-works' | 'pricing' | 'privacy' | 'terms' | 'support';

// ============================================
// CONSTANTS
// ============================================

const COLORS = {
  bg: '#09090B',
  bgAlt: '#0F0F12',
  card: '#18181B',
  cardHover: '#1F1F23',
  border: '#27272A',
  text: '#FAFAFA',
  textMuted: '#A1A1AA',
  textDim: '#71717A',
  accent: '#F97316',
  accentLight: '#FB923C',
  accentDark: '#EA580C',
  accentGlow: 'rgba(249, 115, 22, 0.15)',
  success: '#22C55E',
  successMuted: '#16A34A',
  gold: '#FBBF24',
  error: '#EF4444',
};

// ============================================
// COMPONENTS
// ============================================

const FireIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2C6.5 8 4 12 4 15C4 19.4183 7.58172 23 12 23C16.4183 23 20 19.4183 20 15C20 12 17.5 8 12 2Z"
      fill="url(#fireGradient)"
    />
    <path
      d="M12 9C9.5 12 8.5 14 8.5 16C8.5 18.2091 10.2909 20 12.5 20C14.7091 20 16.5 18.2091 16.5 16C16.5 14 15.5 12 13 9C12.6667 9.33333 12.3333 9.66667 12 9Z"
      fill="url(#fireInnerGradient)"
    />
    <defs>
      <linearGradient id="fireGradient" x1="12" y1="2" x2="12" y2="23" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FBBF24" />
        <stop offset="0.5" stopColor="#F97316" />
        <stop offset="1" stopColor="#DC2626" />
      </linearGradient>
      <linearGradient id="fireInnerGradient" x1="12.5" y1="9" x2="12.5" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FEF3C7" />
        <stop offset="1" stopColor="#FBBF24" />
      </linearGradient>
    </defs>
  </svg>
);

const GlowOrb = ({ delay = 0, size = 400, color = COLORS.accent, top, left, right, bottom }: {
  delay?: number;
  size?: number;
  color?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 0.4, scale: 1 }}
    transition={{ duration: 2, delay, repeat: Infinity, repeatType: 'reverse' }}
    style={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
      filter: 'blur(60px)',
      top,
      left,
      right,
      bottom,
      pointerEvents: 'none',
    }}
  />
);

// ============================================
// HERO CHART COMPONENT
// ============================================

const HeroChart = () => {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(chartRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setIsVisible(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  // Chart dimensions
  const width = 600;
  const height = 280;
  const padding = { top: 30, right: 20, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Generate realistic-looking data
  const historicalMonths = 8;
  
  // Historical data (last 12 months with some volatility)
  const startValue = 285000;
  const currentValue = 678000;
  const historicalData = Array.from({ length: historicalMonths + 1 }, (_, i) => {
    const progress = i / historicalMonths;
    const baseValue = startValue + (currentValue - startValue) * progress;
    const volatility = Math.sin(i * 1.5) * 8000 + Math.cos(i * 0.7) * 5000;
    return Math.round(baseValue + volatility);
  });
  historicalData[historicalData.length - 1] = currentValue; // Ensure last point is current

  // Projection data (to FIRE target)
  const fireTarget = 1500000;
  const annualReturn = 0.08;
  const projectionMonths = 144; // 12 years
  const projectionData = Array.from({ length: Math.ceil(projectionMonths / 6) + 1 }, (_, i) => {
    const months = i * 6;
    const years = months / 12;
    return Math.round(currentValue * Math.pow(1 + annualReturn, years));
  }).filter(v => v <= fireTarget * 1.1);

  // Years to FIRE
  const yearsToFire = Math.log(fireTarget / currentValue) / Math.log(1 + annualReturn);
  
  // Combined data for scaling
  const allValues = [...historicalData, ...projectionData, fireTarget];
  const minValue = Math.min(...allValues) * 0.9;
  const maxValue = Math.max(...allValues) * 1.05;

  // Scale functions
  const scaleX = (index: number, total: number) => 
    padding.left + (index / (total - 1)) * (chartWidth * 0.3);
  
  const scaleY = (value: number) => 
    padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;

  // Historical path
  const historicalPath = historicalData.map((value, i) => {
    const x = scaleX(i, historicalData.length);
    const y = scaleY(value);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Historical area
  const historicalArea = `${historicalPath} L ${scaleX(historicalData.length - 1, historicalData.length)} ${padding.top + chartHeight} L ${scaleX(0, historicalData.length)} ${padding.top + chartHeight} Z`;

  // Projection path (starts from last historical point)
  const projectionStartX = scaleX(historicalData.length - 1, historicalData.length);
  const projectionPath = projectionData.map((value, i) => {
    const x = projectionStartX + (i / (projectionData.length - 1)) * (chartWidth * 0.7);
    const y = scaleY(value);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Fire target line Y
  const fireTargetY = scaleY(fireTarget);

  // Find intersection point
  const fireIntersectionX = projectionStartX + (chartWidth * 0.7) * (yearsToFire / (projectionData.length * 0.5));

  // Y-axis labels
  const yLabels = [0, 0.25, 0.5, 0.75, 1].map(p => ({
    value: minValue + (maxValue - minValue) * p,
    y: scaleY(minValue + (maxValue - minValue) * p),
  }));

  // Format currency
  const formatValue = (v: number) => {
    if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
    return `$${v}`;
  };

  return (
    <motion.div
      ref={chartRef}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 40 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      style={{
        background: `linear-gradient(180deg, ${COLORS.card} 0%, ${COLORS.bgAlt} 100%)`,
        borderRadius: 24,
        padding: 24,
        border: `1px solid ${COLORS.border}`,
        maxWidth: 650,
        margin: '0 auto',
        boxShadow: `0 40px 80px ${COLORS.bg}80`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow effect */}
      <div style={{
        position: 'absolute',
        top: -100,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 300,
        height: 200,
        background: `radial-gradient(ellipse, ${COLORS.accent}20 0%, transparent 70%)`,
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />

      {/* Chart header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
        position: 'relative',
        zIndex: 1,
      }}>
        <div>
          <div style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 4 }}>Portfolio Value</div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{ fontSize: 28, fontWeight: 700, color: COLORS.text }}
          >
            $678,000
          </motion.div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 4 }}>FIRE Target</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: COLORS.gold }}>$1.5M</div>
        </div>
      </div>

      {/* SVG Chart */}
      <svg 
        width="100%" 
        height={height} 
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Historical gradient */}
          <linearGradient id="historicalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={COLORS.success} stopOpacity="0.4" />
            <stop offset="100%" stopColor={COLORS.success} stopOpacity="0" />
          </linearGradient>
          
          {/* Projection gradient */}
          <linearGradient id="projectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={COLORS.accent} stopOpacity="0.8" />
            <stop offset="100%" stopColor={COLORS.gold} stopOpacity="0.8" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {yLabels.map((label, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={label.y}
              x2={width - padding.right}
              y2={label.y}
              stroke={COLORS.border}
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.5}
            />
            <text
              x={padding.left - 10}
              y={label.y + 4}
              fill={COLORS.textDim}
              fontSize={11}
              textAnchor="end"
              fontFamily="system-ui"
            >
              {formatValue(label.value)}
            </text>
          </g>
        ))}

        {/* Projection zone background */}
        <motion.rect
          x={projectionStartX}
          y={padding.top}
          width={chartWidth * 0.7}
          height={chartHeight}
          fill={COLORS.accent}
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 0.05 : 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        />

        {/* FIRE target line */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <line
            x1={padding.left}
            y1={fireTargetY}
            x2={width - padding.right}
            y2={fireTargetY}
            stroke={COLORS.gold}
            strokeWidth={2}
            strokeDasharray="8 4"
            opacity={0.8}
          />
          <text
            x={width - padding.right - 5}
            y={fireTargetY - 8}
            fill={COLORS.gold}
            fontSize={12}
            fontWeight={600}
            textAnchor="end"
            fontFamily="system-ui"
          >
            🔥 FIRE
          </text>
        </motion.g>

        {/* Historical area */}
        <motion.path
          d={historicalArea}
          fill="url(#historicalGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />

        {/* Historical line */}
        <motion.path
          d={historicalPath}
          fill="none"
          stroke={COLORS.success}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: isVisible ? 1 : 0, opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          filter="url(#glow)"
        />

        {/* Projection line */}
        <motion.path
          d={projectionPath}
          fill="none"
          stroke="url(#projectionGradient)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="8 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: isVisible ? 1 : 0, opacity: isVisible ? 0.9 : 0 }}
          transition={{ duration: 2, delay: 1.5, ease: "easeOut" }}
        />

        {/* Current value point */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: isVisible ? 1 : 0, opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 1.8 }}
        >
          <circle
            cx={projectionStartX}
            cy={scaleY(currentValue)}
            r={8}
            fill={COLORS.bg}
            stroke={COLORS.success}
            strokeWidth={3}
          />
          <circle
            cx={projectionStartX}
            cy={scaleY(currentValue)}
            r={4}
            fill={COLORS.success}
          />
        </motion.g>

        {/* FIRE intersection point */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: isVisible ? 1 : 0, opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 2.5 }}
        >
          <circle
            cx={Math.min(fireIntersectionX, width - padding.right - 20)}
            cy={fireTargetY}
            r={8}
            fill={COLORS.bg}
            stroke={COLORS.gold}
            strokeWidth={3}
          />
          <circle
            cx={Math.min(fireIntersectionX, width - padding.right - 20)}
            cy={fireTargetY}
            r={4}
            fill={COLORS.gold}
          />
        </motion.g>

        {/* X-axis labels */}
        <g>
          <text x={padding.left} y={height - 10} fill={COLORS.textDim} fontSize={10} textAnchor="start" fontFamily="system-ui">12mo ago</text>
          <text x={projectionStartX} y={height - 10} fill={COLORS.text} fontSize={11} fontWeight={600} textAnchor="middle" fontFamily="system-ui">Today</text>
          <text x={width - padding.right} y={height - 10} fill={COLORS.gold} fontSize={11} fontWeight={600} textAnchor="end" fontFamily="system-ui">~10 years</text>
        </g>
      </svg>

      {/* Chart legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 24,
        marginTop: 16,
        paddingTop: 16,
        borderTop: `1px solid ${COLORS.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 3, borderRadius: 2, background: COLORS.success }} />
          <span style={{ fontSize: 12, color: COLORS.textMuted }}>Historical</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 0, borderTop: `2px dashed ${COLORS.accent}` }} />
          <span style={{ fontSize: 12, color: COLORS.textMuted }}>Projected (8%/yr)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 0, borderTop: `2px dashed ${COLORS.gold}` }} />
          <span style={{ fontSize: 12, color: COLORS.textMuted }}>FIRE Target</span>
        </div>
      </div>

      {/* FIRE date badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
        transition={{ duration: 0.5, delay: 2.8 }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 16,
        }}
      >
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 20px',
          borderRadius: 99,
          background: `linear-gradient(135deg, ${COLORS.gold}20 0%, ${COLORS.accent}20 100%)`,
          border: `1px solid ${COLORS.gold}40`,
        }}>
          <span style={{ fontSize: 24 }}>🔥</span>
          <div>
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>Financial Freedom</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text }}>
              December 2037
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const SectionTitle = ({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) => (
  <div style={{ textAlign: 'center', marginBottom: 64 }}>
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      style={{
        fontSize: 'clamp(2rem, 5vw, 3rem)',
        fontWeight: 700,
        color: COLORS.text,
        margin: 0,
        letterSpacing: '-0.02em',
      }}
    >
      {children}
    </motion.h2>
    {subtitle && (
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{
          fontSize: 18,
          color: COLORS.textMuted,
          marginTop: 16,
          maxWidth: 600,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);

const FeatureCard = ({ icon, title, description, delay = 0 }: {
  icon: string;
  title: string;
  description: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -8, transition: { duration: 0.2 } }}
    style={{
      background: `linear-gradient(135deg, ${COLORS.card} 0%, ${COLORS.bgAlt} 100%)`,
      borderRadius: 24,
      padding: 32,
      border: `1px solid ${COLORS.border}`,
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 1,
      background: `linear-gradient(90deg, transparent, ${COLORS.accent}40, transparent)`,
    }} />
    <div style={{
      width: 56,
      height: 56,
      borderRadius: 16,
      background: COLORS.accentGlow,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 28,
      marginBottom: 20,
    }}>
      {icon}
    </div>
    <h3 style={{
      fontSize: 20,
      fontWeight: 600,
      color: COLORS.text,
      margin: 0,
      marginBottom: 12,
    }}>
      {title}
    </h3>
    <p style={{
      fontSize: 15,
      color: COLORS.textMuted,
      margin: 0,
      lineHeight: 1.6,
    }}>
      {description}
    </p>
  </motion.div>
);

const StepCard = ({ number, title, description, delay = 0 }: {
  number: number;
  title: string;
  description: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    style={{
      display: 'flex',
      gap: 24,
      alignItems: 'flex-start',
    }}
  >
    <div style={{
      width: 48,
      height: 48,
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentDark} 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
      fontWeight: 700,
      color: COLORS.text,
      flexShrink: 0,
    }}>
      {number}
    </div>
    <div>
      <h3 style={{
        fontSize: 20,
        fontWeight: 600,
        color: COLORS.text,
        margin: 0,
        marginBottom: 8,
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: 15,
        color: COLORS.textMuted,
        margin: 0,
        lineHeight: 1.6,
      }}>
        {description}
      </p>
    </div>
  </motion.div>
);

const PricingCard = ({ name, price, period, features, popular = false, delay = 0 }: {
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    style={{
      background: popular
        ? `linear-gradient(135deg, ${COLORS.card} 0%, ${COLORS.accentGlow} 100%)`
        : COLORS.card,
      borderRadius: 24,
      padding: 32,
      border: `1px solid ${popular ? COLORS.accent : COLORS.border}`,
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {popular && (
      <div style={{
        position: 'absolute',
        top: 16,
        right: 16,
        background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentDark} 100%)`,
        padding: '6px 12px',
        borderRadius: 99,
        fontSize: 12,
        fontWeight: 600,
        color: COLORS.text,
      }}>
        BEST VALUE
      </div>
    )}
    <h3 style={{
      fontSize: 18,
      fontWeight: 500,
      color: COLORS.textMuted,
      margin: 0,
      marginBottom: 8,
    }}>
      {name}
    </h3>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
      <span style={{ fontSize: 48, fontWeight: 700, color: COLORS.text }}>{price}</span>
      <span style={{ fontSize: 16, color: COLORS.textMuted }}>{period}</span>
    </div>
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {features.map((feature, i) => (
        <li key={i} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 12,
          fontSize: 15,
          color: COLORS.text,
        }}>
          <span style={{ color: COLORS.success }}>✓</span>
          {feature}
        </li>
      ))}
    </ul>
    <button
      style={{
        width: '100%',
        marginTop: 24,
        padding: '14px 24px',
        borderRadius: 12,
        border: popular ? 'none' : `1px solid ${COLORS.border}`,
        background: popular
          ? `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentDark} 100%)`
          : 'transparent',
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {popular ? 'Get Pro' : 'Download Free'}
    </button>
  </motion.div>
);

const LegalSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{
    maxWidth: 800,
    margin: '0 auto',
    padding: '120px 24px',
  }}>
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        fontSize: 'clamp(2rem, 5vw, 3rem)',
        fontWeight: 700,
        color: COLORS.text,
        marginBottom: 48,
        letterSpacing: '-0.02em',
      }}
    >
      {title}
    </motion.h1>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{
        color: COLORS.textMuted,
        fontSize: 16,
        lineHeight: 1.8,
      }}
    >
      {children}
    </motion.div>
  </section>
);

// ============================================
// MAIN PAGE
// ============================================

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const headerBg = useTransform(scrollY, [0, 100], ['rgba(9,9,11,0)', 'rgba(9,9,11,0.95)']);

  const navItems: { label: string; section: Section }[] = [
    { label: 'Features', section: 'features' },
    { label: 'How It Works', section: 'how-it-works' },
    { label: 'Pricing', section: 'pricing' },
    { label: 'Privacy', section: 'privacy' },
    { label: 'Terms', section: 'terms' },
    { label: 'Support', section: 'support' },
  ];

  const scrollToSection = (section: Section) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    if (section === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(section);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.bg,
      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
      color: COLORS.text,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <motion.header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: headerBg,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${COLORS.border}20`,
        }}
      >
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={() => scrollToSection('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <FireIcon size={28} />
            <span style={{
              fontSize: 22,
              fontWeight: 700,
              color: COLORS.text,
              letterSpacing: '-0.02em',
            }}>
              FirePal
            </span>
          </button>

          {/* Desktop Nav */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: 32,
          }} className="desktop-nav">
            {navItems.slice(0, 3).map((item) => (
              <button
                key={item.section}
                onClick={() => scrollToSection(item.section)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: COLORS.textMuted,
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = COLORS.text}
                onMouseLeave={(e) => e.currentTarget.style.color = COLORS.textMuted}
              >
                {item.label}
              </button>
            ))}
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 10,
                background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentDark} 100%)`,
                color: COLORS.text,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 30px ${COLORS.accent}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
              </svg>
              Download
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: COLORS.text,
              fontSize: 24,
              cursor: 'pointer',
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: COLORS.bg,
              borderBottom: `1px solid ${COLORS.border}`,
              padding: 24,
            }}
          >
            {navItems.map((item) => (
              <button
                key={item.section}
                onClick={() => scrollToSection(item.section)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 0',
                  background: 'none',
                  border: 'none',
                  color: COLORS.textMuted,
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </motion.header>

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px 80px',
        overflow: 'hidden',
      }}>
        <GlowOrb size={600} color={COLORS.accent} top="-200px" left="-200px" delay={0} />
        <GlowOrb size={500} color={COLORS.gold} bottom="-150px" right="-150px" delay={0.5} />
        
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${COLORS.accentGlow} 0%, transparent 50%)`,
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1100, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 99,
              background: COLORS.accentGlow,
              border: `1px solid ${COLORS.accent}30`,
              marginBottom: 24,
            }}
          >
            <FireIcon size={18} />
            <span style={{ fontSize: 14, fontWeight: 500, color: COLORS.accent }}>
              Financial Independence Calculator
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              margin: 0,
              marginBottom: 24,
              letterSpacing: '-0.03em',
            }}
          >
            Your path to{' '}
            <span style={{
              background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.accent} 50%, ${COLORS.accentLight} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              financial freedom
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)',
              color: COLORS.textMuted,
              maxWidth: 600,
              margin: '0 auto 40px',
              lineHeight: 1.6,
            }}
          >
            Speak your portfolio, see your FIRE date. AI-powered calculations 
            show exactly when you can retire early.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}
          >
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 32px',
                borderRadius: 14,
                background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentDark} 100%)`,
                color: COLORS.text,
                fontSize: 18,
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: `0 8px 40px ${COLORS.accent}30`,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 12px 50px ${COLORS.accent}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 8px 40px ${COLORS.accent}30`;
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
              </svg>
              Download for iOS
            </a>
            <button
              onClick={() => scrollToSection('features')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '16px 32px',
                borderRadius: 14,
                background: 'transparent',
                border: `1px solid ${COLORS.border}`,
                color: COLORS.text,
                fontSize: 18,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = COLORS.card;
                e.currentTarget.style.borderColor = COLORS.textMuted;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = COLORS.border;
              }}
            >
              Learn More
              <span style={{ fontSize: 14 }}>↓</span>
            </button>
          </motion.div>

          {/* Interactive Chart */}
          <HeroChart />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: '120px 24px',
        position: 'relative',
      }}>
        <GlowOrb size={400} color={COLORS.success} top="20%" right="-100px" delay={0.3} />
        
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <SectionTitle subtitle="Everything you need to plan your early retirement">
            Powerful Features
          </SectionTitle>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}>
            <FeatureCard
              icon="🎙️"
              title="Voice Input"
              description="Just speak your portfolio naturally. Say '50 shares of Tesla, 2 Bitcoin, $10k in savings' and we'll parse it instantly."
              delay={0}
            />
            <FeatureCard
              icon="🤖"
              title="AI-Powered Parsing"
              description="Our AI understands natural language and accurately extracts tickers, amounts, and asset types from your description."
              delay={0.1}
            />
            <FeatureCard
              icon="📊"
              title="Real Market Data"
              description="Connect to live market prices for stocks, ETFs, and crypto. See your true portfolio value updated in real-time."
              delay={0.2}
            />
            <FeatureCard
              icon="🎯"
              title="FIRE Projections"
              description="Calculate exactly when you'll reach financial independence based on your historical returns or market averages."
              delay={0.3}
            />
            <FeatureCard
              icon="📈"
              title="Growth Visualization"
              description="Beautiful charts showing your portfolio history and projected growth path to your FIRE target."
              delay={0.4}
            />
            <FeatureCard
              icon="🔔"
              title="Daily Progress"
              description="Get notified daily about your FIRE progress. 'You moved 2 days closer to financial freedom today!'"
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{
        padding: '120px 24px',
        background: COLORS.bgAlt,
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${COLORS.bg} 0%, transparent 10%, transparent 90%, ${COLORS.bg} 100%)`,
          pointerEvents: 'none',
        }} />
        
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <SectionTitle subtitle="From portfolio to FIRE date in under 60 seconds">
            How It Works
          </SectionTitle>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
            <StepCard
              number={1}
              title="Speak or type your portfolio"
              description="Tell FirePal what you own in plain English. '100 shares of VOO, 50 shares of Apple, $5000 in my savings account, half a Bitcoin.' We understand it all."
              delay={0}
            />
            <StepCard
              number={2}
              title="Review and adjust"
              description="Our AI parses your input and shows you a clean breakdown. Quickly fix any misinterpretations or add missing positions."
              delay={0.1}
            />
            <StepCard
              number={3}
              title="See your FIRE date"
              description="We fetch real market prices, calculate your portfolio's historical return, and project exactly when you'll hit financial independence."
              delay={0.2}
            />
            <StepCard
              number={4}
              title="Track your progress"
              description="Save your portfolio, set a custom FIRE target, add monthly contributions, and get daily notifications about your journey to freedom."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{
        padding: '120px 24px',
        position: 'relative',
      }}>
        <GlowOrb size={500} color={COLORS.gold} top="10%" left="-150px" delay={0.2} />
        
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <SectionTitle subtitle="Start free, upgrade when you're ready to get serious">
            Simple Pricing
          </SectionTitle>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}>
            <PricingCard
              name="Free"
              price="$0"
              period=""
              features={[
                'Voice & text portfolio input',
                'AI-powered parsing',
                'Real market data',
                'FIRE date calculation',
                'Historical & projected charts',
              ]}
              delay={0}
            />
            <PricingCard
              name="Pro"
              price="$4.99"
              period="/month"
              popular
              features={[
                'Everything in Free',
                'Save unlimited portfolios',
                'Custom FIRE target',
                'Monthly contribution scenarios',
                'Daily progress notifications',
                'Export & share your plan',
              ]}
              delay={0.1}
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            style={{
              textAlign: 'center',
              marginTop: 32,
              color: COLORS.textDim,
              fontSize: 14,
            }}
          >
            Annual plan available at $49.99/year (save 17%)
          </motion.p>
        </div>
      </section>

      {/* Privacy Policy Section */}
      <section id="privacy" style={{ background: COLORS.bgAlt }}>
        <LegalSection title="Privacy Policy">
          <p><strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          
          <h2 style={{ color: COLORS.text, marginTop: 32 }}>Introduction</h2>
          <p>FirePal (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our mobile application.</p>

          <h2 style={{ color: COLORS.text, marginTop: 32 }}>Information We Collect</h2>
          <p><strong>Portfolio Data:</strong> When you input your investment portfolio (via voice or text), this data is processed locally on your device and through our secure AI parsing service. We do not permanently store your portfolio details on our servers.</p>
          <p><strong>Usage Data:</strong> We collect anonymized analytics about app usage to improve our service, including feature usage patterns and crash reports.</p>
          <p><strong>Purchase Information:</strong> If you subscribe to FirePal Pro, Apple handles all payment processing. We only receive confirmation of your subscription status, not your payment details.</p>

          <h2 style={{ color: COLORS.text, marginTop: 32 }}>How We Use Your Information</h2>
          <ul style={{ paddingLeft: 20 }}>
            <li>To provide and maintain our service</li>
            <li>To calculate your FIRE projections</li>
            <li>To send you notifications (only if you opt-in)</li>
            <li>To improve and optimize our app</li>
          </ul>

          <h2 style={{ color: COLORS.text, marginTop: 32 }}>Data Storage &amp; Security</h2>
          <p>Your portfolio data is stored locally on your device using secure storage. We use industry-standard encryption for any data transmitted to our servers. We do not sell, trade, or rent your personal information to third parties.</p>

          <h2 style={{ color: COLORS.text, marginTop: 32 }}>Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul style={{ paddingLeft: 20 }}>
            <li><strong>Twelve Data:</strong> For fetching real-time market prices</li>
            <li><strong>OpenAI:</strong> For AI-powered portfolio parsing</li>
            <li><strong>Apple App Store:</strong> For payment processing</li>
          </ul>

          <h2 style={{ color: COLORS.text, marginTop: 32 }}>Your Rights</h2>
          <p>You have the right to:</p>
          <ul style={{ paddingLeft: 20 }}>
            <li>Access your personal data</li>
            <li>Delete your data (by uninstalling the app)</li>
            <li>Opt-out of notifications</li>
            <li>Request information about how your data is used</li>
          </ul>

          <h2 style={{ color: COLORS.text, marginTop: 32 }}>Children&apos;s Privacy</h2>
          <p>FirePal is not intended for use by children under 13. We do not knowingly collect personal information from children under 13.</p>

          <h2 style={{ color: COLORS.text, marginTop: 32 }}>Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.</p>

          <h2 style={{ color: COLORS.text, marginTop: 32 }}>Contact Us</h2>
          <p>If you have questions about this privacy policy, please contact us at <a href="mailto:privacy@firepal.app" style={{ color: COLORS.accent }}>privacy@firepal.app</a></p>
        </LegalSection>
      </section>

      {/* Terms of Service Section */}
      <section id="terms">
        <LegalSection title="Terms of Service">
          <p><strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          
          <h2 style={{ color: COLORS.text, marginTop: 32 }}>Agreement to Terms</h2>
          <p>By downloading or using FirePal, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not use our service.</p>

          <h2 style={{ color: COLORS.text, marginTop: 32 }}>Description of Service</h2>
          <p>FirePal is a financial calculator app that helps users estimate their path to financial independence (FIRE). The app provides projections based on user-provided portfolio data and market information.</p>

          <h2 style={{ color: COLORS.text, marginTop: 32 }}>Financial Disclaimer</h2>
          <p><strong>IMPORTANT:</strong> FirePal is not a financial advisor. The projections and calculations provided are for informational and educational purposes only. They should not be considered as financial, investment, tax, or legal advice.</p>
          <ul style={{ paddingLeft: 20 }}>
            <li>Past performance does not guarantee future results</li>
            <li>Market returns are unpredictable and may differ significantly from projections</li>
            <li>You should consult with qualified professionals before making financial decisions</li>
            <li>We are not responsible for any financial losses based on app projections</li>
          </ul>

          <h2 style={{ color: COLORS.text, marginTop: 32 }}>Subscriptions</h2>
          <p><strong>Free Tier:</strong> Basic features are available at no cost.</p>
          <p><strong>Pro Subscription:</strong> Premium features require a paid subscription. Subscriptions are billed monthly or annually through your Apple ID account. Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period.</p>
          <p>To cancel your subscription, go to your Apple ID Account Settings and select Subscriptions.</p>

          <h2 style={{ color: COLORS.text, marginTop: 32 }}>User Responsibilities</h2>
          <p>You agree to:</p>
          <ul style={{ paddingLeft: 20 }}>
            <li>Provide accurate portfolio information</li>
            <li>Use the app for lawful purposes only</li>
            <li>Not attempt to reverse engineer or compromise the app</li>
            <li>Understand that projections are estimates, not guarantees</li>
          </ul>

          <h2 style={{ color: COLORS.text, marginTop: 32 }}>Intellectual Property</h2>
          <p>FirePal and its original content, features, and functionality are owned by FirePal and are protected by international copyright, trademark, and other intellectual property laws.</p>

          <h2 style={{ color: COLORS.text, marginTop: 32 }}>Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, FirePal shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or other intangible losses resulting from your use of the service.</p>

          <h2 style={{ color: COLORS.text, marginTop: 32 }}>Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of the app after changes constitutes acceptance of the new terms.</p>

          <h2 style={{ color: COLORS.text, marginTop: 32 }}>Governing Law</h2>
          <p>These terms shall be governed by and construed in accordance with the laws of Switzerland, without regard to its conflict of law provisions.</p>

          <h2 style={{ color: COLORS.text, marginTop: 32 }}>Contact</h2>
          <p>For questions about these Terms, contact us at <a href="mailto:legal@firepal.app" style={{ color: COLORS.accent }}>legal@firepal.app</a></p>
        </LegalSection>
      </section>

      {/* Support Section */}
      <section id="support" style={{ background: COLORS.bgAlt }}>
        <LegalSection title="Support">
          <div style={{
            background: COLORS.card,
            borderRadius: 24,
            padding: 32,
            border: `1px solid ${COLORS.border}`,
            marginBottom: 32,
          }}>
            <h2 style={{ color: COLORS.text, marginTop: 0 }}>Contact Us</h2>
            <p>Have questions, feedback, or need help? We&apos;re here for you.</p>
            <p><strong>Email:</strong> <a href="mailto:support@firepal.app" style={{ color: COLORS.accent }}>support@firepal.app</a></p>
            <p>We typically respond within 24-48 hours.</p>
          </div>

          <h2 style={{ color: COLORS.text }}>Frequently Asked Questions</h2>

          <h3 style={{ color: COLORS.text, marginTop: 24 }}>How accurate are the FIRE projections?</h3>
          <p>Our projections are based on your portfolio&apos;s historical performance or standard market averages (7% annually). However, actual market returns are unpredictable. Use our projections as a planning tool, not a guarantee.</p>

          <h3 style={{ color: COLORS.text, marginTop: 24 }}>How do I cancel my subscription?</h3>
          <p>To cancel your FirePal Pro subscription:</p>
          <ol style={{ paddingLeft: 20 }}>
            <li>Open the Settings app on your iPhone</li>
            <li>Tap your name at the top</li>
            <li>Tap Subscriptions</li>
            <li>Find FirePal and tap Cancel Subscription</li>
          </ol>

          <h3 style={{ color: COLORS.text, marginTop: 24 }}>Is my financial data secure?</h3>
          <p>Yes. Your portfolio data is stored locally on your device using secure storage. We don&apos;t store your portfolio details on our servers. See our Privacy Policy for more details.</p>

          <h3 style={{ color: COLORS.text, marginTop: 24 }}>What assets can FirePal track?</h3>
          <p>FirePal supports stocks, ETFs, cryptocurrencies, cash, bonds, and other assets. For stocks, ETFs, and crypto, we fetch real market prices. Other assets are tracked at the value you specify.</p>

          <h3 style={{ color: COLORS.text, marginTop: 24 }}>How do daily notifications work?</h3>
          <p>Pro subscribers can enable daily notifications that show your progress toward FIRE. These are scheduled around market close (10 PM local time) and show how many days closer (or further) you are from your goal.</p>

          <h3 style={{ color: COLORS.text, marginTop: 24 }}>Can I request a refund?</h3>
          <p>Refunds are handled by Apple. To request a refund, visit <a href="https://reportaproblem.apple.com" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.accent }}>reportaproblem.apple.com</a> or contact Apple Support.</p>
        </LegalSection>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '48px 24px',
        borderTop: `1px solid ${COLORS.border}`,
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FireIcon size={24} />
            <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.text }}>FirePal</span>
          </div>
          
          <nav style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 24,
          }}>
            {navItems.map((item) => (
              <button
                key={item.section}
                onClick={() => scrollToSection(item.section)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: COLORS.textMuted,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = COLORS.text}
                onMouseLeave={(e) => e.currentTarget.style.color = COLORS.textMuted}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <p style={{
            color: COLORS.textDim,
            fontSize: 13,
            textAlign: 'center',
          }}>
            © {new Date().getFullYear()} FirePal. All rights reserved.
            <br />
            Not financial advice. Consult a professional for investment decisions.
          </p>
        </div>
      </footer>

      {/* Global Styles */}
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        
        html {
          scroll-behavior: smooth;
        }
        
        body {
          margin: 0;
          padding: 0;
        }

        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }

        @media (min-width: 769px) {
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}