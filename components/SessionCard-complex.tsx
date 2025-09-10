import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Session, Track } from '../types';
import { AlertTriangleIcon } from './icons';
import { exportToGoogleCalendar, exportSelectedSessions } from '../utils/calendarExport';

interface SessionCardProps {
  session: Session;
  tracks: Track[];
  onDoubleClick: (session: Session) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, session: Session) => void;
  isCompact?: boolean;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, tracks, onDoubleClick, onDragStart, isCompact = false }) => {
  const track = tracks.find(t => t.id === session.trackId) || tracks[0];

  // Borde uniforme (todas confirmadas)
  const baseBorder = 'border-l-4 border-blue-600';

  const handleExportToGoogle = (e: React.MouseEvent) => {
    e.stopPropagation();
    exportToGoogleCalendar(session);
  };

  const handleExportToApple = (e: React.MouseEvent) => {
    e.stopPropagation();
    exportSelectedSessions([session], `${session.title.replace(/\s+/g, '-').toLowerCase()}.ics`);
  };

  const handleZoomClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (session.zoomLink) {
      window.open(session.zoomLink, '_blank');
    }
  };

  // Utilidad para obtener iniciales del ponente (2 letras)
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const SpeakersAvatars = () => (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Avatares superpuestos pequeños */}
      <div className="flex -space-x-2">
        {session.speakers.slice(0, 4).map((s, idx) => (
          <div
            key={s.id + idx}
            className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 border border-white flex items-center justify-center text-[10px] font-semibold shadow-sm"
            title={s.name}
          >
            {getInitials(s.name)}
          </div>
        ))}
      </div>
      {/* N más */}
      {session.speakers.length > 4 && (
        <span className="text-[10px] text-gray-500">+{session.speakers.length - 4}</span>
      )}
    </div>
  );

  const SpeakersList = () => (
    <div className="space-y-1">
      {session.speakers.map((s, idx) => (
        <div key={s.id + '-' + idx} className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 border border-white flex items-center justify-center text-[11px] font-semibold shadow-sm">
            {getInitials(s.name)}
          </div>
          <span className="text-sm text-blue-700 dark:text-blue-200">{s.name}</span>
        </div>
      ))}
    </div>
  );

  // Overlay flotante (fuera de la caja)
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayPos, setOverlayPos] = useState<{ top: number; left: number } | null>(null);
  const hideTimer = useRef<number | null>(null);

  const openOverlay = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const width = 380;
    const height = 260; // estimado para posicionamiento
    const margin = 12;
    // Centrado horizontal respecto a la tarjeta
    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));
    // Preferir debajo de la tarjeta
    let top = rect.bottom + margin;
    if (top + height > window.innerHeight - margin) {
      top = Math.max(margin, rect.top - height - margin); // si no cabe, arriba
    }
    setOverlayPos({ top, left });
    setShowOverlay(true);
  };

  const scheduleHide = () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShowOverlay(false), 120);
  };

  const cancelHide = () => {
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  if (isCompact) {
    return (
      <div
        draggable
        onDragStart={(e) => onDragStart(e, session)}
        onDoubleClick={() => onDoubleClick(session)}
        className={`p-1.5 rounded-md flex flex-col cursor-pointer transition-all duration-200 ease-in-out relative group hover:z-10 min-h-14 ${baseBorder}`}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(156, 163, 175, 0.3)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
          openOverlay(e.currentTarget);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
          scheduleHide();
        }}
      >
        <div className="flex-1 overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-xs leading-snug text-blue-900 dark:text-blue-100 truncate pr-2">{session.title}</h4>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {session.zoomLink && (
                <button
                  onClick={handleZoomClick}
                  className="px-1.5 py-0.5 bg-blue-500 hover:bg-blue-600 rounded text-white text-[10px]"
                  title="Unirse por Zoom"
                >
                  Zoom
                </button>
              )}
            </div>
          </div>

          {/* SOLO título y ponentes visibles por defecto */}
          <p className="text-[11px] mt-0.5 text-blue-700 dark:text-blue-200 opacity-80 leading-tight truncate transition-opacity duration-150 group-hover:opacity-0">
            {session.speakers.length > 0 ? session.speakers.map(s => s.name).join(', ') : 'Ponente por confirmar'}
          </p>
        </div>
        {session.hasConflict && (
          <div className="absolute top-1 right-1 text-red-500" title="Conflicto de ponentes detectado!">
            <AlertTriangleIcon className="h-3 w-3" />
          </div>
        )}
        {/* Acciones de exportación solo en hover */}
        <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
          <button onClick={handleExportToGoogle} title="Exportar a Google Calendar" className="w-5 h-5 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center border border-gray-200">
            <img src="/logos/google.svg" alt="Google" className="w-2.5 h-2.5" />
          </button>
          <button onClick={handleExportToApple} title="Exportar a Apple Calendar / Outlook" className="w-5 h-5 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center border border-gray-200">
            <img src="/logos/apple.svg" alt="Apple" className="w-2.5 h-2.5" />
          </button>
        </div>
        {/* Overlay flotante (compacto) */}
        {showOverlay && overlayPos && createPortal(
          <div
            onMouseEnter={cancelHide}
            onMouseLeave={scheduleHide}
            style={{ position: 'fixed', top: overlayPos.top, left: overlayPos.left, zIndex: 1000, width: 380 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-3 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 pr-6">{session.title}</h4>
              <div className="flex items-center gap-1">
                {session.zoomLink && (
                  <button onClick={handleZoomClick} className="px-2 py-0.5 bg-blue-500 hover:bg-blue-600 rounded text-white text-xs">Zoom</button>
                )}
                <button onClick={handleExportToGoogle} className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center border border-gray-200" title="Exportar a Google Calendar">
                  <img src="/logos/google.svg" alt="Google" className="w-3 h-3" />
                </button>
                <button onClick={handleExportToApple} className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center border border-gray-200" title="Exportar a Apple Calendar / Outlook">
                  <img src="/logos/apple.svg" alt="Apple" className="w-3 h-3" />
                </button>
              </div>
            </div>
            <SpeakersList />
            <div className="inline-flex rounded-md overflow-hidden border border-gray-200">
              <span className="text-xs font-medium bg-gray-900 text-white px-2 py-0.5">Resumen</span>
              <span className="text-xs font-medium text-gray-600 px-2 py-0.5 hover:bg-gray-100">Detalles</span>
              <span className="text-xs font-medium text-gray-600 px-2 py-0.5 hover:bg-gray-100">Asistir</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{track.name}</span>
              <span className="truncate">📍 {session.room}</span>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, session)}
      onDoubleClick={() => onDoubleClick(session)}
      className={`h-full p-1.5 rounded-md flex flex-col cursor-pointer transition-all duration-200 ease-in-out relative group hover:z-10 ${baseBorder}`}
      style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(156, 163, 175, 0.4)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05) translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.2)';
        openOverlay(e.currentTarget);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) translateY(0)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.12)';
        scheduleHide();
      }}
    >
      <div className="flex-1">
        {/* Encabezado con acciones a la derecha */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm leading-tight text-blue-900 dark:text-blue-100 pr-6 truncate">{session.title}</h3>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {session.zoomLink && (
              <button
                onClick={handleZoomClick}
                className="px-2 py-0.5 bg-blue-500 hover:bg-blue-600 rounded text-white text-xs"
                title="Unirse por Zoom"
              >
                Zoom
              </button>
            )}
            <button
              onClick={handleExportToGoogle}
              className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center border border-gray-200"
              title="Exportar a Google Calendar"
            >
              <img src="/logos/google.svg" alt="Google" className="w-3 h-3" />
            </button>
            <button
              onClick={handleExportToApple}
              className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center border border-gray-200"
              title="Exportar a Apple Calendar / Outlook"
            >
              <img src="/logos/apple.svg" alt="Apple" className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* SOLO título y ponentes visibles por defecto */}
        <p className="text-xs mt-0.5 text-blue-700 dark:text-blue-200 opacity-80 leading-tight truncate transition-opacity duration-150 group-hover:opacity-0">
          {session.speakers.length > 0 ? session.speakers.map(s => s.name).join(', ') : 'Ponente por confirmar'}
        </p>
        {/* La info extendida vive en el overlay flotante */}
      </div>
      {session.hasConflict && (
        <div className="absolute top-2 right-2 text-red-500" title="Conflicto de ponentes detectado!">
          <AlertTriangleIcon className="h-4 w-4" />
        </div>
      )}
      {/* Botonera inferior eliminada: ahora las acciones viven en el encabezado */}
      {/* Overlay flotante (normal) */}
      {showOverlay && overlayPos && createPortal(
        <div
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
          style={{ position: 'fixed', top: overlayPos.top, left: overlayPos.left, zIndex: 1000, width: 380 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-base text-blue-900 dark:text-blue-100 pr-6">{session.title}</h4>
            <div className="flex items-center gap-1">
              {session.zoomLink && (
                <button onClick={handleZoomClick} className="px-2 py-0.5 bg-blue-500 hover:bg-blue-600 rounded text-white text-xs">Zoom</button>
              )}
              <button onClick={handleExportToGoogle} className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center border border-gray-200" title="Exportar a Google Calendar">
                <img src="/logos/google.svg" alt="Google" className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleExportToApple} className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center border border-gray-200" title="Exportar a Apple Calendar / Outlook">
                <img src="/logos/apple.svg" alt="Apple" className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <SpeakersList />
          <div className="inline-flex rounded-md overflow-hidden border border-gray-200">
            <span className="text-xs font-medium bg-gray-900 text-white px-2 py-0.5">Resumen</span>
            <span className="text-xs font-medium text-gray-600 px-2 py-0.5 hover:bg-gray-100">Detalles</span>
            <span className="text-xs font-medium text-gray-600 px-2 py-0.5 hover:bg-gray-100">Asistir</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{track.name}</span>
            <span className="truncate">📍 {session.room}</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SessionCard;
