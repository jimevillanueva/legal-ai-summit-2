import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../utils/db';
import styles from './UserTicket.module.css';

interface TicketData {
  attendeeName: string;
  attendeeEmail: string;
  eventTitle: string;
  eventDates: string;
  organizer: string;
  ticketCode: string;
}

const UserTicket: React.FC = () => {
  const { contactId } = useParams<{ contactId: string }>();
  const [ticketData, setTicketData] = useState<TicketData>({
    attendeeName: 'Cargando...',
    attendeeEmail: '',
    eventTitle: 'LEGAL AI SUMMIT 2025',
    eventDates: 'DEL 29 DE SEPTIEMBRE AL 3 OCTUBRE',
    organizer: 'LAWGIC',
    ticketCode: `LAI2025-${contactId || 'USER'}-001`
  });
  const [loading, setLoading] = useState(true);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Cargar datos del contacto desde la base de datos
  useEffect(() => {
    const loadContactData = async () => {
      if (!contactId) {
        setLoading(false);
        return;
      }

      try {
        const contact = await db.getContactById(contactId);
        if (contact) {
          setTicketData(prev => ({
            ...prev,
            attendeeName: contact.name.toUpperCase(),
            attendeeEmail: contact.email,
            ticketCode: `LAI2025-${contact.id.slice(-6).toUpperCase()}-001`
          }));
        } else {
          setTicketData(prev => ({
            ...prev,
            attendeeName: 'USUARIO NO ENCONTRADO',
            attendeeEmail: '',
            ticketCode: `LAI2025-${contactId.slice(-6).toUpperCase()}-001`
          }));
        }
      } catch (error) {
        console.error('Error loading contact:', error);
        setTicketData(prev => ({
          ...prev,
          attendeeName: 'ERROR AL CARGAR',
          attendeeEmail: '',
          ticketCode: `LAI2025-${contactId.slice(-6).toUpperCase()}-001`
        }));
      } finally {
        setLoading(false);
      }
    };

    loadContactData();
  }, [contactId]);

  // Generar QR Code dinámicamente
  useEffect(() => {
    const generateQR = async () => {
      if (qrCanvasRef.current) {
        try {
          // Usar la librería QRCode si está disponible
          const QRCode = (window as any).QRCode;
          if (QRCode) {
            const targetUrl = `https://lawgic.institute/legal-ai-summit-mexico-2025?contact=${contactId}`;
            new QRCode(qrCanvasRef.current, {
              text: targetUrl,
              width: 140,
              height: 140,
              colorDark: '#0b1220',
              colorLight: '#ffffff',
              correctLevel: QRCode.CorrectLevel.H
            });
          } else {
            // Fallback: crear un patrón simple
            const canvas = qrCanvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              canvas.width = 140;
              canvas.height = 140;
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, 140, 140);
              ctx.fillStyle = '#0b1220';
              
              // Crear un patrón simple de QR
              for (let i = 0; i < 140; i += 4) {
                for (let j = 0; j < 140; j += 4) {
                  if (Math.random() > 0.5) {
                    ctx.fillRect(i, j, 3, 3);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      }
    };

    generateQR();
  }, [contactId]);


  // Generar código de barras
  const generateBarcode = () => {
    const barcodeLines = [];
    for (let i = 0; i < 40; i++) {
      const height = Math.random() > 0.5 ? '20px' : '15px';
      const width = Math.random() > 0.7 ? '3px' : '2px';
      barcodeLines.push(
        <div
          key={i}
          className={styles.barcodeLine}
          style={{
            height,
            width,
            backgroundColor: '#b8b8b8',
            opacity: 0.8,
            display: 'inline-block',
            margin: '0 1px'
          }}
        />
      );
    }
    return barcodeLines;
  };

  if (loading) {
    return (
      <div className={styles.userTicket}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando ticket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.userTicket}>
      {/* Background Effects */}
      <div className={styles.backgroundImageContainer} />
      
      {/* Ticket Container */}
      <div className={styles.ticketContainer}>
        {/* Ticket Main */}
        <div className={styles.ticketMain}>
          {/* Header */}
          <div className={styles.ticketHeader}>
            <div className={styles.logoContainer}>
              <img 
                src="/Summit.png" 
                alt={ticketData.eventTitle} 
                className={styles.summitLogoImage}
              />
            </div>
            <p className={styles.eventDates}>{ticketData.eventDates}</p>
          </div>

          {/* Center Area with Hexagons and QR */}
          <div className={styles.ticketCenter}>
            <div className={styles.hexagonPattern}>
              {/* Hexagon Grid */}
              <div className={styles.hexagonGrid}>
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className={styles.hexagon} />
                ))}
              </div>
              
              {/* QR Code */}
              <div className={styles.centralDataMatrix}>
                <div className={styles.dataMatrix}>
                  <img src="/frame.png" alt="QR Code Frame" />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.ticketFooter}>
            <p className={styles.ticketCode}>CODE: {ticketData.ticketCode}</p>
            <div className={styles.barcode}>
              {generateBarcode()}
            </div>
            <img 
              src="/lawgic-logo-blanco.png" 
              alt="LAWGIC" 
              className={styles.lawgicLogo}
            />
          </div>
        </div>

        {/* Ticket Info Section */}
        <div className={styles.ticketInfo}>
          {/* Holographic Sticker */}
          <div className={styles.holoSticker} aria-label="Holograma de seguridad">
            <div className={styles.holoFoil} />
            <div className={styles.holoEngrave} aria-hidden="true">
              <div className={styles.holoEngraveMask} />
            </div>
          </div>
          
          <div className={styles.infoContent}>
            <h2 className={styles.infoTitle}>{ticketData.eventTitle}</h2>
            <p className={styles.infoDates}>{ticketData.eventDates}</p>
            <p className={styles.infoOrganizer}>ORGANIZADO POR: {ticketData.organizer}</p>
                    <div className={styles.attendeeName}>
                      <span className={styles.nameHighlight}>
                        {ticketData.attendeeName || ticketData.attendeeEmail}
                      </span>
                    </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTicket;
