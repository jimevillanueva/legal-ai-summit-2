import React from 'react';

interface AppleCalendarLogoProps {
  className?: string;
}

const AppleCalendarLogo: React.FC<AppleCalendarLogoProps> = ({ className = "w-5 h-5" }) => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = domingo, 1 = lunes, etc.
  const dayOfMonth = now.getDate();

  const daysInSpanish = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  const currentDay = daysInSpanish[dayOfWeek];

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fondo del calendario */}
      <rect x="2" y="3" width="20" height="18" rx="2" fill="white" stroke="#d1d5db" strokeWidth="1"/>
      
      {/* Barra superior */}
      <rect x="2" y="3" width="20" height="6" rx="2" fill="#f3f4f6"/>
      
      {/* Día de la semana */}
      <text 
        x="12" 
        y="7.5" 
        textAnchor="middle" 
        fontSize="3" 
        fill="#ef4444" 
        fontFamily="system-ui, -apple-system, sans-serif" 
        fontWeight="500"
      >
        {currentDay}
      </text>
      
      {/* Número del día */}
      <text 
        x="12" 
        y="15" 
        textAnchor="middle" 
        fontSize="6" 
        fill="#1f2937" 
        fontFamily="system-ui, -apple-system, sans-serif" 
        fontWeight="600"
      >
        {dayOfMonth}
      </text>
    </svg>
  );
};

export default AppleCalendarLogo;
