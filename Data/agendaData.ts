export interface Speaker {
  id: string;
  speakerName: string;
  speakerDescription: string;
  speakerPhoto?: string;
  companyLogo?: string;
}

export interface Session {
  id: string;
  timeSlot: string;
  topic: string;
  speakerName: string;
  speakerDescription?: string;
  speakerPhoto?: string;
  companyLogo?: string;
  isBreak?: boolean;
  speakers?: Speaker[];
}

export interface DayAgenda {
  id: string;
  title: string;
  theme: string;
  colorClass: string;
  sessions: Session[];
}

export const agendaData: DayAgenda[] = [
  {
    id: 'monday',
    title: 'LUNES 29 DE SEPTIEMBRE',
    theme: 'Estado actual de la IA',
    colorClass: '',
    sessions: [
      {
        id: 'alejandro-salinas',
        timeSlot: '9:00 AM',
        topic: 'El Estado del Arte en Inteligencia Artificial Legal: Perspectivas desde Silicon Valley',
        speakerName: 'Alejandro Salinas de León',
        speakerDescription: 'NLP Research Fellow en Stanford Law School. Graduado como Ingeniero Físico y Abogado del Tecnológico de Monterrey. Especialista en computational law, algorithmic fairness y AI governance.',
        speakerPhoto: '/Summit2025_speakers/AlejandroSalinas.jpg',
        companyLogo: '/LOGOS-SUMMIT/STANFORD.png'
      },
      {
        id: 'dani-sanchez',
        timeSlot: '10:00 AM',
        topic: 'Legal Tech Entrepreneurship: Lecciones desde el Ecosistema México-US',
        speakerName: 'Daniela Sánchez Bernal',
        speakerDescription: 'Associate en Carter Ledyard & Milburn LLP y Law, Science and Technology LLM de Stanford Law School.',
        speakerPhoto: '/Summit2025_speakers/DanielaSanchez.jpeg',
        companyLogo: '/LOGOS-SUMMIT/RRS.jpeg'
      },
      {
        id: 'maria-martinez',
        timeSlot: '11:00 AM',
        topic: 'Ecosistema Nacional de Inteligencia Artificial: Diagnóstico y Prospectiva',
        speakerName: 'Dra. María de Lourdes Martínez Villaseñor',
        speakerDescription: 'Profesora Investigadora en la Universidad Panamericana y Presidenta de la Sociedad Mexicana de Inteligencia Artificial.',
        speakerPhoto: '/Summit2025_speakers/Maria de Lourdes Martinez.png',
        companyLogo: '/LOGOS-SUMMIT/SMIA.jpeg'
      },
      {
        id: 'tiffany-saade',
        timeSlot: '11:00 AM',
        topic: 'AI Security by Design: Protegiendo Datos Legales en la Era Digital',
        speakerName: 'Tiffany Saade',
        speakerDescription: 'Product Manager AI Security Policy en Cisco. Especialista en la intersección de IA, ciberseguridad y políticas internacionales.', 
        speakerPhoto: '/Summit2025_speakers/Tiffany Saade.jpg',
        companyLogo: '/LOGOS-SUMMIT/CISCO2.png'
      },
      {
        id: 'elias-rashid',
        timeSlot: '12:00 PM',
        topic: 'E-Government 4.0: Inteligencia Artificial en la Administración Pública',
        speakerName: 'Elías Rashid Morales',
        speakerDescription: 'Especialista en Finanzas y Ciencia de Datos en CIPRE HOLDING. Experto en LLM Embeddings y modelos de difusión, con un enfoque en la innovación tecnológica.',
        speakerPhoto: '/Summit2025_speakers/elias_rashid.jpeg',
      },
      {
        id: 'joel-trevino',
        timeSlot: '12:00 PM',
        topic: 'Estrategias para un uso seguro y responsable de la IA generativa en la abogacía',
        speakerName: 'Joel A. Gómez Treviño',
        speakerDescription: 'Presidente fundador de la Academia Mexicana de Derecho Informático. Abogado corporativo con más de 25 años de experiencia.',
        speakerPhoto: '/Summit2025_speakers/JoelGomez.jpeg',
        companyLogo: '/LOGOS-SUMMIT/EDD.png'
      },
      {
        id: 'erik-huesca',
        timeSlot: '1:00 PM',
        topic: 'Visión 2030: El Futuro de la Inteligencia Artificial en México',
        speakerName: 'Dr. Erik Huesca & Mtra. Ana Paula Rumualdo',
        speakerDescription: 'Erik: Doctor en IA por la Universidad de California en Berkeley y Físico por la UNAM. Consultor en convergencia digital por más de dos décadas. Ana Paula: Legal Manager en Mondelez International. Abogada experimentada en Privacidad, Protección de Datos, IA y Ciberseguridad.',
        speakers: [
          {
            id: 'erik-huesca',
            speakerName: 'Dr. Erik Huesca',
            speakerDescription: 'Doctor en IA por la Universidad de California en Berkeley y Físico por la UNAM. Consultor en convergencia digital por más de dos décadas.',
            speakerPhoto: '/Summit2025_speakers/ErikHuesca.jpeg'
          },
          {
            id: 'ana-paula-rumualdo',
            speakerName: 'Mtra. Ana Paula Rumualdo',
            speakerDescription: 'Legal Manager en Mondelez International. Abogada experimentada en Privacidad, Protección de Datos, IA y Ciberseguridad.',
            speakerPhoto: '/Summit2025_speakers/AnaPaulaRumualdo.jpeg'
          }
        ]
      },
      {
        id: 'break-1',
        timeSlot: '2:00 PM',
        topic: '',
        speakerName: 'BREAK',
        speakerDescription: '',
        isBreak: true
      },
      {
        id: 'thomas-martin',
        timeSlot: '4:00 PM',
        topic: 'Legal Automation Bootcamp: Transformando tu Práctica con IA (Práctica)',
        speakerName: 'Thomas G. Martin',
        speakerDescription: 'CEO y Fundador de LawDroid. Abogado, filósofo y emprendedor con más de 25 años de experiencia en derecho y tecnología.',  
        speakerPhoto: '/Summit2025_speakers/Thomas Martin.jpeg',
        companyLogo: '/LOGOS-SUMMIT/LawDroid.jpeg'
      },
      {
        id: 'daniel-medina',
        timeSlot: '4:00 PM',
        topic: 'Convergencia entre IA y Computación cuántica',
        speakerName: 'Dr. Daniel Medina',
        speakerDescription: 'Chief Legal & Compliance Officer de Eden.',
        speakerPhoto: '/Summit2025_speakers/DanielMedina.jpeg',
      },
      {
        id: 'startupeable-panel',
        timeSlot: '5:00 PM',
        topic: 'The Startupeable X CompuSoluciones: Ecosistema de Inversión en IA en Latam',
        speakerName: 'Enzo Cavalie / Andrés Medina Mora',
        speakerDescription: 'Enzo: Inversionista y podcaster especializado en startups. Andrés: Estratega experimentado en venture capital.',
        speakers: [
          {
            id: 'enzo-andres',
            speakerName: 'Enzo Cavalie',
            speakerDescription: 'Inversionista y podcaster especializado en startups.',
            speakerPhoto: '/Summit2025_speakers/Enzo Cavalie.png',
            companyLogo: '/LOGOS-SUMMIT/Startupeable.png'
          },
          {
            id: 'andres-medina',
            speakerName: 'Andrés Medina Mora',
            speakerDescription: 'Estratega experimentado en venture capital.',
            speakerPhoto: '/Summit2025_speakers/AndresMedinaMora.jpeg',
            companyLogo: '/LOGOS-SUMMIT/CompuSolucionesVentures.jpeg'
          }
        ]
      },
      {
        id: 'creative-tech-panel',
        timeSlot: '6:00 PM',
        topic: 'Retos Legales en la Era de la IA Generativa (Panel)',
        speakerName: 'Dr. Carlos Gutiérrez / Gilberto Balderas / Rodrigo González',
        speakerDescription: 'Carlos: CEO de Metacube Technology & Entertainment. Gilberto: Chief AI Evangelist en Cadis AI. Rodrigo: Founder and CEO de FILMICA AI.',
        speakers: [
          {
            id: 'carlos-gutierrez',
            speakerName: 'Dr. Carlos Gutiérrez',
            speakerDescription: 'CEO de Metacube Technology & Entertainment',
            speakerPhoto: '/Summit2025_speakers/CarlosGutierrez.jpg',
          },
          {
            id: 'gilberto-balderas',
            speakerName: 'Gilberto Balderas',
            speakerDescription: 'Chief AI Evangelist en Cadis AI',
            speakerPhoto: '/Summit2025_speakers/GilbertoBalderas.avif',
          },
          {
            id: 'rodrigo-gonzalez',
            speakerName: 'Rodrigo González',
            speakerDescription: 'Founder and CEO de FILMICA AI.',
            speakerPhoto: '/Summit2025_speakers/RodrigoGonzalez.jpeg',
          }
        ]
      },
      {
        id: 'ricardo-carreon',
        timeSlot: '6:00 PM',
        topic: 'Taller Crea con IA: Agentes Inteligentes para Abogados del Futuro (Práctica)',
        speakerName: 'Ricardo Carreón',
        speakerDescription: 'Chief AI Officer y Co-fundador de Crea con IA. Especialista en transformación empresarial y construcción de agentes inteligentes.',
        speakerPhoto: '/Summit2025_speakers/RicardoCarreon.jpeg',
        companyLogo: '/LOGOS-SUMMIT/CREA_CON_IA.jpeg'
      }
    ]
  },
  {
    id: 'tuesday',
    title: 'MARTES 30 DE SEPTIEMBRE',
    theme: 'Inteligencia Artificial y Propiedad Intelectual',
    colorClass: 'tuesday',
    sessions: [
      {
        id: 'mesa-dialogo-estado',
        timeSlot: '9:00 AM',
        topic: 'Mesa de Diálogo: El Rol del Estado en la Nueva Economía de la IA',
        speakerName: 'Karina Luján, Francisco Medina, Santiago Nieto',
        speakerDescription: 'Directora General de INDAUTOR, Magistrado en el TFJA, y Director General del IMPI. Especialistas en derecho, propiedad intelectual, derechos humanos y administración pública.',
        speakers: [
          {
            id: 'karina-lujan',
            speakerName: 'Mtra. Karina Luján Luján',
            speakerDescription: ' Directora General del INDAUTOR. Experiencia en derecho procesal penal, constitucional y derechos humanos.',
            speakerPhoto: '/Summit2025_speakers/Karina Lujan.png',
            companyLogo: '/LOGOS-SUMMIT/INDAUTOR.png'
          },
          {
            id: 'francisco-medina',
            speakerName: 'Mgdo. Francisco Medina Padilla',
            speakerDescription: 'Magistrado en el TFJA y Presidente de la Sala Especializada en Propiedad Intelectual.',
            speakerPhoto: '/Summit2025_speakers/FranciscoMedinaPadilla.jpeg',
            companyLogo: '/LOGOS-SUMMIT/TFJA.png'
          },
          {
            id: 'santiago-nieto',
            speakerName: 'Dr. Santiago Nieto Castillo',
            speakerDescription: 'Director General del IMPI. Destacada trayectoria en el ámbito jurídico y la administración pública.',
            speakerPhoto: '/Summit2025_speakers/Santiago-Nieto.jpg',
          }
        ]
      },
      {
        id: 'elizabeth-kiyoshi',
        timeSlot: '10:00 AM',
        topic: 'Inteligencia Artificial ante los Tribunales: Retos y Oportunidades',
        speakerName: 'Mgda. Elizabeth Ortiz Guzmán & Dr. Kiyoshi Tsuru',
        speakers: [
          {
            id: 'elizabeth-ortiz',
            speakerName: 'Mgda. Elizabeth Ortiz Guzmán',
            speakerDescription: 'Magistrada Regional en el TFJA. Especialización en Materia Procesal Fiscal.',
            speakerPhoto: '/Summit2025_speakers/Magistrada Elizabeth Ortiz.jpeg',
            companyLogo: '/LOGOS-SUMMIT/TFJA.png'
          },
          {
            id: 'kiyoshi-tsuru',
            speakerName: 'Dr. Kiyoshi Tsuru',
            speakerDescription: 'Presidente de Tsuru Intellectual Property. Especialista en Propiedad Intelectual, Technology Law y Ciberseguridad.',
            speakerPhoto: '/Summit2025_speakers/Kiyoshi Tsuru.png',
            companyLogo: '/LOGOS-SUMMIT/TSURU.png'
          }
        ]
      },
      {
        id: 'leandro-toscano',
        timeSlot: '11:00 AM',
        topic: 'Resolución de Controversias de IA: El Rol de la OMPI.',
        speakerName: 'Leandro Toscano',
        speakerDescription: 'Senior Legal Officer en WIPO. Especialista en resolución de disputas para propiedad intelectual.',
        speakerPhoto: '/Summit2025_speakers/LeandroToscano.jpeg',
        companyLogo: '/LOGOS-SUMMIT/OMPI.png'
      },
      {
        id: 'jose-manuel-magana',
        timeSlot: '11:00 AM',
        topic: 'IA y Derechos de Autor: ¿Quién es el Autor en la Era de la Creatividad Artificial?',
        speakerName: 'Dr. José Manuel Magaña Rufino',
        speakerDescription: 'Profesor Investigador en la Universidad Panamericana.',
        speakerPhoto: '/Summit2025_speakers/JoseManuelMagana.jpeg',
        companyLogo: '/LOGOS-SUMMIT/PANAMERICANA.png'
      },
      {
        id: 'stephany-quetzalli',
        timeSlot: '12:00 PM',
        topic: 'Música, IA y Derecho de Autor: La Perspectiva de la Industria Creativa',
        speakerName: 'Stephany Balao, Quetzalli de la Concha',
        speakers: [
          {
            id: 'stephany-balao',
            speakerName: 'Stephany Balao',
            speakerDescription: 'Directora Jurídica de la SACM.',
            speakerPhoto: '/Summit2025_speakers/StephanyBalao.jpeg',
            companyLogo: '/LOGOS-SUMMIT/SACM.png'
          },
          {
            id: 'quetzalli-concha',
            speakerName: 'Quetzalli de la Concha',
            speakerDescription: 'Gerente Legal en Penguin Random House.',
            speakerPhoto: '/Summit2025_speakers/QuetzallidelaConcha.jpeg',
            companyLogo: '/LOGOS-SUMMIT/AMPPI.jpg'
          }
        ]
      },
      {
        id: 'pablo-pruneda',
        timeSlot: '12:00 PM',
        topic: 'El Abogado y los Retos de la IA',
        speakerName: 'Dr. Pablo Pruneda Gross',
        speakerDescription: 'Abogado con Doctorado y Postdoctorado en Derecho. Especialista en nuevas tecnologías y su regulación.',
        speakerPhoto: '/Summit2025_speakers/PabloPruneda.jpeg',
      },
      {
        id: 'adrian-martinez',
        timeSlot: '1:00 PM',
        topic: 'Tu Rostro, Tu Voz, Tus Derechos: La Imagen Personal frente a la IA Generativa',
        speakerName: 'Adrián Martínez',
        speakerDescription: 'Associate en Von Wobeser y Sierra, S.C. Especialista en Derecho procesal civil y mercantil.',
        speakerPhoto: '/Summit2025_speakers/AdrianMartinez.jpeg',
        companyLogo: '/LOGOS-SUMMIT/VW.png'
      },
      {
        id: 'ana-georgina-luis',
        timeSlot: '1:00 PM',
        topic: 'Arbitraje y Mediación en la Era de la IA',
        speakerName: 'Dra. Ana Georgina Alba Betancourt & Dr. Luis Javier Reynoso Zepeda',
        speakers: [
          {
            id: 'ana-georgina',
            speakerName: 'Dra. Ana Georgina Alba Betancourt',
            speakerDescription: 'Investigadora en el Instituto de Investigaciones Jurídicas de la UNAM. Doctora en derecho mercantil.',
            speakerPhoto: '/Summit2025_speakers/ana-georgina-alba-betancourt.jpg',
          },
          {
            id: 'luis-javier-reynoso',
            speakerName: 'Dr. Luis Javier Reynoso Zepeda',
            speakerDescription: 'Abogado especialista en Derecho Intelectual y de la Competencia.',
            speakerPhoto: '/Summit2025_speakers/LuisReynoso.jpeg',
            companyLogo: '/LOGOS-SUMMIT/Deforest.jpeg'
          }
        ]
      },
      {
        id: 'break-1',
        timeSlot: '2:00 PM',
        topic: '',
        speakerName: 'BREAK',
        speakerDescription: '',
        isBreak: true
      },
      {
        id: 'aldo-rodriguez',
        timeSlot: '3:00 PM',
        topic: 'Originalidad en tiempos de la IA',
        speakerName: 'Aldo Ricardo Rodríguez Cortés',
        speakerDescription: 'CEO en Lawgic Legal AI. Legaltech Founder, Legal AI Developer y UX/UI & Software Specialist. Autor de libros sobre propiedad intelectual e IA.',
        speakerPhoto: '/Summit2025_speakers/AldoRicardo.jpeg',
        companyLogo: '/Logo_lawgic.png'
      },
      {
        id: 'mauricio-jalife',
        timeSlot: '4:00 PM',
        topic: 'El futuro de las patentes y marcas frente a la IA',
        speakerName: 'Dr. Mauricio Jalife Daher',
        speakerDescription: 'Socio fundador de la firma jalife caballero. Doctor en Derecho por la UNAM. Especialista en Propiedad Intelectual.',
        speakerPhoto: '/Summit2025_speakers/MauricioJalife.jpeg',
        companyLogo: '/LOGOS-SUMMIT/JALIFE-CABALLERO.png'
      },
      {
        id: 'berenice-hernandez',
        timeSlot: '5:00 PM',
        topic: 'Taller Práctico: Automatiza tu Despacho con Herramientas de IA (Sin Código) (Práctica)',
        speakerName: 'Dra. Berenice Hernández Deleyja',
        speakerDescription: 'Secretaria de Acuerdos de la Sala Especializada en Propiedad Intelectual del Tribunal Federal de Justicia Fiscal y Administrativa.',
        speakerPhoto: '/Summit2025_speakers/BereniceDeleyja.png',
        companyLogo: '/LOGOS-SUMMIT/TFJA.png'
      },
      {
        id: 'luis-gomez',
        timeSlot: '6:00 PM',
        topic: 'Taller de Automatizaciones Legales',
        speakerName: 'Luis Raúl González Romo',
        speakerDescription: 'Profesor en la Universidad Panamericana. Experto en implementación de soluciones de IA sin código para la práctica legal.',
        speakerPhoto: '/Summit2025_speakers/Luis Gonzalez .jpeg',
        companyLogo: '/LOGOS-SUMMIT/CLUBIA legal.png'
      }
    ]
  },  
  {
    id: 'wednesday',
    title: 'MIÉRCOLES 01 DE OCTUBRE',
    theme: 'I.A Aplicada a la Práctica del Derecho',
    colorClass: 'wednesday',
    sessions: [
      {
        id: 'josep-ma-comes',
        timeSlot: '8:00 AM',
        topic: 'IA Legal vs. IA Generalista en la Práctica del Derecho',
        speakerName: 'Josep Ma Comas',
        speakerDescription: 'Activista LegalTech, creador Guía LegalTech (España). Especialista en transformación digital del sector legal con más de 15 años de experiencia.',
        speakerPhoto: '/Summit2025_speakers/JosepFernandez.jpeg',
        companyLogo: '/LOGOS-SUMMIT/Derecho practico.jpg'
      },
      {
        id: 'ponce-christian',
        timeSlot: '9:00 AM',
        topic: 'Ética Profesional: El Rol de las Asociaciones en el Futuro del Derecho',
        speakers: [
          {
            id: 'nuhad-ponce',
            speakerName: 'Nuhad Ponce',
            speakerDescription: 'Socia en Ponce Kuri S.C. Especialista en Corporate and Privacy Law.',
            speakerPhoto: '/Summit2025_speakers/Nuhad2.png',
            companyLogo: '/LOGOS-SUMMIT/PONCE.avif'
          },
          {
            id: 'christian-paredes',
            speakerName: 'Christian Paredes',
            speakerDescription: 'General Counsel SAP Mexico. Experiencia en derecho corporativo y tecnológico.',
            speakerPhoto: '/Summit2025_speakers/christian_paredes.jpg',
            companyLogo: '/LOGOS-SUMMIT/SAP.webp'
          }
        ],
        speakerName: 'Nuhad Ponce & Christian Paredes'
      },
      {
        id: 'lorena-navarro',
        timeSlot: '10:00 AM',
        topic: 'Mitigación de Riesgos en la Integración de Herramientas de IA en la Práctica Jurídica',
        speakerName: 'Lorena Navarro Manzanilla',
        speakerDescription: 'Legal Manager Latam & Compliance Officer en Medtronic. Experiencia en protección de datos y ciberseguridad.',
        speakerPhoto: '/Summit2025_speakers/LorenaNavarro.jpeg'
      },
      {
        id: 'federico-ast',
        timeSlot: '10:00 AM',
        topic: 'Crowdjury: El Futuro de la Justicia Colaborativa',
        speakerName: 'Federico Ast',
        speakerDescription: 'Fundador y CEO de Kleros, experto en resolución de disputas en línea. Autor de "Crowdjury, a Crowdsourced Justice System for the Collaboration Era".',
        speakerPhoto: '/Summit2025_speakers/FedericoAst.jpeg',
        companyLogo: '/LOGOS-SUMMIT/Kleros.svg'
      },
      {
        id: 'jorge-montiel-tadeo-rios',
        timeSlot: '11:00 AM',
        topic: 'Transformación Digital y el Poder Judicial',
        speakerName: 'Jorge Montiel Romero / Roberto Tadeo Peña Rios',
        speakers: [
          {
            id: 'jorge-montiel',
            speakerName: 'Jorge Montiel Romero',
            speakerDescription: '',
            speakerPhoto: '/Summit2025_speakers/JorgeMontielRomero.jpeg',
            companyLogo: '/LOGOS-SUMMIT/OAJ.png'
          },
          {
            id: 'tadeo-rios',
            speakerName: 'Roberto Tadeo Peña Rios ',
            speakerDescription: ' Director del Centro de Investigaciones sobre la Justicia.',
            speakerPhoto: '/Summit2025_speakers/RobertoTadeoRios.jpeg',
            companyLogo: '/LOGOS-SUMMIT/Logo_Suprema_Corte.png'
          }
        ]
      },
      {
        id: "philippe-prince",
        timeSlot: "11:00 AM",
        speakerName: "Dr. Philippe Prince Tritto",
        topic: "IA aplicada a la práctica del derecho",
        speakerDescription: "Experto en derecho digital y nuevas tecnologías. Profesor universitario con amplia experiencia en investigación jurídica.",
        speakerPhoto: '/Summit2025_speakers/PhillippePrince.jpeg',
        companyLogo: '/LOGOS-SUMMIT/PANAMERICANA.png'
      },
      {
        id: "ivan-diez-david-pizana",
        timeSlot: "12:00 PM",
        speakerName: "Iván Díaz González & David Pizaña",
        topic: "El Código como Testigo: Validez Jurídica en la Era de la IA y Blockchain",
        speakers: [
          {
            id: 'ivan-diez',
            speakerName: 'Iván Díaz González',
            speakerDescription: 'Abogado e ingeniero, especialista en tecnología y derecho.',
            speakerPhoto: '/Summit2025_speakers/IvanDiaz.jpeg',
            companyLogo: '/LOGOS-SUMMIT/TRATO.png'
          },  
          {
            id: 'david-pizana',
            speakerName: 'David Pizaña',
            speakerDescription: 'Legal Tech Manager en TRATO, especialista en blockchain y contratos inteligentes.',
            speakerPhoto: '/Summit2025_speakers/DavidPizana.jpeg',
            companyLogo: '/LOGOS-SUMMIT/TRATO.png'
          }
        ]
      },
      {
        id: "hernandez-matus-villanueva",
        timeSlot: "12:00 PM",
        speakerName: "José Luis Hernández Sánchez, Eileen Matus & Daniel Villanueva Plasencia",
        topic: "Uso de IA dentro de despachos y empresas y políticas de uso, riesgos",
        speakers: [
          {
            id: 'jose-luis-hernandez',
            speakerName: 'José Luis Hernández Sánchez',
            speakerDescription: 'Fundador de White Box Project.',
            speakerPhoto: '/Summit2025_speakers/JoseluisHernandez.jpeg',
            companyLogo: '/LOGOS-SUMMIT/WhiteBox.png'
          },
          {
            id: 'eileen-matus',
            speakerName: 'Eileen Matus',
            speakerDescription: 'Especialista en derecho internacional y tecnología.',
            speakerPhoto: '/Summit2025_speakers/EileenMatus.jpeg',
            companyLogo: '/LOGOS-SUMMIT/WhiteBox.png'
          },
          {
            id: 'daniel-villanueva',
            speakerName: 'Daniel Villanueva Plasencia',
            speakerDescription: 'Socio en Baker McKenzie.',
            speakerPhoto: '/Summit2025_speakers/DanielVillanueva.webp',
            companyLogo: '/LOGOS-SUMMIT/BAKER.jpg'
          }
        ]
      },
      {
        id: "patricia-villa",
        timeSlot: "1:00 PM",
        speakerName: "Patricia Villa Berger",
        topic: "Legal Operations 4.0: Optimizando Despachos con IA",
        speakerDescription: "Especialista en operaciones legales y tecnología aplicada al derecho.",
        speakerPhoto: '/Summit2025_speakers/Paticia Villa Berger.png',
        companyLogo: '/LOGOS-SUMMIT/Kerma.png'
      },
      {
        id: "zinser-herrera",
        timeSlot: "1:00 PM",
        speakerName: "Christian F. Zinser Cieslik & Marco V. Herrera",
        topic: "Los retos del abogado en 2025: IA, Digitalización, Automatización y Resistencias",
        speakers: [
          {
            id: 'christian-zinser',
            speakerName: 'Christian F. Zinser Cieslik',
            speakerDescription: 'Abogado especializado en tecnología y música.',
            speakerPhoto: '/Summit2025_speakers/ChristianZinser.jpeg',
            companyLogo: '/LOGOS-SUMMIT/ZINSER.png'
          },
          {
            id: 'marco-v-herrera',
            speakerName: 'Marco V. Herrera',
            speakerDescription: 'Consultor en transformación digital.',
            speakerPhoto: '/Summit2025_speakers/MarcoVHerrera.jpeg',
            companyLogo: '/LOGOS-SUMMIT/ABOGADODIGITAL.jpg'
          }
        ]
      },
      {
        id: 'break-1',
        timeSlot: '2:00 PM',
        topic: '',
        speakerName: 'BREAK',
        speakerDescription: '',
        isBreak: true
      },
      {
        id: "ortiz-rodriguez",
        timeSlot: "3:00 PM",
        speakerName: "Carlos Ricardo Ortiz Sordo & Aldo Ricardo Rodríguez Cortés",
        topic: "El Abogado Programador: La Nueva Frontera de la Profesión Legal",
        speakers: [
          {
            id: 'carlos-ortiz',
            speakerName: 'Carlos Ricardo Ortiz Sordo',
            speakerDescription: 'Co-fundador de Logiety Tech.',
            speakerPhoto: '/Summit2025_speakers/CarlosRicardoOrtiz.jpeg',
            companyLogo: '/LOGOS-SUMMIT/ Logiety Tech.jpeg'
          },
          {
            id: 'aldo-rodriguez',
            speakerName: 'Aldo Ricardo Rodríguez Cortés',
            speakerDescription: 'CEO en Lawgic Legal AI.',
            speakerPhoto: '/Summit2025_speakers/AldoRicardo.jpeg',
            companyLogo: '/Logo_lawgic.png'
          }
        ]
      },
      {
        id: "juan-jaime-gonzalez",
        timeSlot: "4:00 PM",
        speakerName: "Juan Jaime González Varas",
        topic: "Uso de IA y Jurimetría: Perspectivas desde el Poder Judicial Federal",
        speakerDescription: "Juez de Distrito en el Poder Judicial Federal.",
        speakerPhoto: '/Summit2025_speakers/Juan Jaime Gonzalez.jpeg',
        companyLogo: '/LOGOS-SUMMIT/Poder Judicial.png'
      },
      {
        id: "vera-rodriguez",
        timeSlot: "4:00 PM",
        speakerName: "Antonio Vera & Lautaro Rodríguez",
        topic: "Ecosistema Legaltech LATAM: Competencia y Colaboración",
        speakers: [
          {
            id: 'antonio-vera',
            speakerName: 'Antonio Vera',
            speakerDescription: 'Country Manager de vLex.',
            speakerPhoto: '/Summit2025_speakers/AntonioVera.jpeg',
            companyLogo: '/LOGOS-SUMMIT/VLEX.png'
          },
          {
            id: 'lautaro-rodriguez',
            speakerName: 'Lautaro Rodríguez',
            speakerDescription: 'CEO de Lemontech.',
            speakerPhoto: '/Summit2025_speakers/LautaroRodriguez.jpeg',
            companyLogo: '/LOGOS-SUMMIT/LEMONTECH.png'
          }
        ]
      },
      {
        id: "flores-celis",
        timeSlot: "5:00 PM",
        speakerName: "Diego Flores Olea & Melissa Celis",
        topic: "Cactus vs Vigilancia de Marcas: Innovación en Legaltech de especialidad & Radar Legaltech Latam - ¿Cómo vamos?",
        speakerDescription: "Diego Flores: CEO de Cactus Legal Tech. Melissa Celis: CEO/Founding Partner de Vigilancia de Marcas.",
        speakers: [
          {
            id: 'diego-flores',
            speakerName: 'Diego Flores Olea',
            speakerDescription: 'CEO de Cactus Legal Tech.',
            speakerPhoto: '/Summit2025_speakers/DiegoFlores.jpeg',
            companyLogo: '/LOGOS-SUMMIT/CACTUS.jpg'
          },
          {
            id: 'melissa-celis',
            speakerName: 'Melissa Celis',
            speakerDescription: 'CEO/Founding Partner de Vigilancia de Marcas.',
            speakerPhoto: '/Summit2025_speakers/MelissaCelis.jpeg',
            companyLogo: '/LOGOS-SUMMIT/VIGILANCIA.png'
          }
        ]
      },
      {
        id: "guillermo-huitron",
        timeSlot: "5:00 PM",
        speakerName: "Guillermo Huitrón Nieto",
        topic: "Radar Legaltech Latam - ¿Cómo vamos?",
        speakerDescription: "Abogado y creador de contenido de innovación legal.",
        speakerPhoto: '/Summit2025_speakers/guillermo-nieto.jpeg',
      },
      {
        id: "fatima-toche",
        timeSlot: "6:00 PM",
        speakerName: "Fátima Toche Vega",
        topic: "Notebook LM para abogados: IA Generativa en la Práctica Legal",
        speakerDescription: "Especialista en Derecho Digital, IA y Protección de Datos Personales.",
        speakerPhoto: '/Summit2025_speakers/FatimaToche.jpeg',  
        companyLogo: '/LOGOS-SUMMIT/CLUBIA legal.png'
      }
    ]
  },  
  {
    id: 'thursday',
    title: 'JUEVES 02 DE OCTUBRE',
    theme: 'Regulación, Ética y Responsabilidad',
    colorClass: 'thursday',
    sessions: [
      {
        id: 'jorge-morell',
        timeSlot: '8:00 AM',
        topic: 'Deber y derecho a la transparencia en entidades sintéticas, ya sean chatbots o agentes',
        speakerName: 'Jorge Morell Ramos',
        speakerDescription: 'Fundador en The Legal Letters. Máster en Deusto y UOC. Best Lawyers en IT Law (2023-2024). Creador del primer mapa LegalTech español (2016).',
        companyLogo: '/LOGOS-SUMMIT/theLegalLetters.jpeg',
        speakerPhoto: '/Summit2025_speakers/jorgemorell.jpeg'
      },
      {
        id: 'diego-manuel',
        timeSlot: '9:00 AM',
        topic: 'GovTech México: Políticas Públicas para la IA en el Sector Legal',
        speakerName: 'Diego Flores Jiménez / Manuel Pliego',
        speakers: [
          {
            id: 'diego-flores',
            speakerName: 'Diego Flores Jiménez',
            speakerDescription: 'Titular de sector de industria electrónica y digital en Secretaría de Economía',
            companyLogo: '/LOGOS-SUMMIT/SE_Logo_2019.svg',
            speakerPhoto: '/Summit2025_speakers/DiegoFloresJimenez.jpeg'
          },
          {
            id: 'manuel-pliego',
            speakerName: 'Manuel Pliego',
            speakerDescription: 'Director Government Affairs Microsoft México, VP en CANIETI, LL.M. Arizona, doctorando en Ética e IA.',
            companyLogo: '/LOGOS-SUMMIT/Microsoft.png',
            speakerPhoto: '/Summit2025_speakers/ManuelPliego.jpeg'
          }
        ]
      },
      {
        id: 'xavier-careaga',
        timeSlot: '10:00 AM',
        topic: 'Responsabilidad de la IA: Marcos Legales para la Inteligencia Artificial Corporativa',
        speakerName: 'Xavier Careaga',
        speakerDescription: 'Counsel en Galicia Mexico. LL.M. Harvard. Ex defensa legal de Meta para 35 países LATAM. Nominado a premios Diversity & Inclusion Chambers.',
        companyLogo: '/LOGOS-SUMMIT/galicia_mxico_logo.jpeg',
        speakerPhoto: '/Summit2025_speakers/Xavier Careaga.jpeg'
      },
      {
        id: 'hector-faya',
        timeSlot: '10:00 AM',
        topic: 'Formas en que la IA está Transformando las Políticas Públicas',
        speakerName: 'Héctor Faya Rodríguez',
        speakerDescription: 'Founder & CEO Aurora Policy Solutions. Ex VP Public Policy en Facebook. Máster en Georgetown. Profesor en Ibero. 20+ años en políticas públicas.',
        speakerPhoto: '/Summit2025_speakers/hectorfayarodriguez.jpeg'
      },
      {
        id: 'laura-rodrigo',
        timeSlot: '11:00 AM',
        topic: 'IA con perspectiva de género',
        speakerName: 'Laura Márquez Martínez',
        speakers: [
          {
            id: 'laura-marquez',
            speakerName: 'Laura Márquez Martínez',
            speakerDescription: 'Directora y cofundadora ÏO Justice. LL.M. NYU, maestrías en Derechos Humanos y Argumentación Jurídica. 13 años de experiencia en América, Europa y EE.UU. Fellow en LIDIA UNAM.',
            companyLogo: '/LOGOS-SUMMIT/IIO Justice.png',
            speakerPhoto: '/Summit2025_speakers/LauraMarquez.jpeg'
          }
        ]
      },
      {
        id: 'rolando-zapata',
        timeSlot: '11:00 AM',
        topic: 'Comisión de IA: Construyendo el Marco Legal Mexicano',
        speakerName: 'Rolando Rodrigo Zapata Bello',
        speakerDescription: 'Senador de la República, Presidente Comisión de IA. Ex Gobernador de Yucatán. Abogado UADY. Miembro PRI.',
        companyLogo: '/LOGOS-SUMMIT/senado.jpg',
        speakerPhoto: '/Summit2025_speakers/RZB.png'
      },
      {
        id: 'paola-cicero',
        timeSlot: '12:00 PM',
        topic: 'UNESCO IA: Ética y Gobernanza Global de la Inteligencia Artificial',
        speakerName: 'Paola Cicero Arenas',
        speakerDescription: 'National Programme Officer UNESCO México. LL.M. NYU, Derecho ITAM. Diploma MIT en transformación digital. 17+ años en intersección de ley, política y tecnología. Ex-IFT.',
        companyLogo: '/LOGOS-SUMMIT/UNESCO.svg',
        speakerPhoto: '/Summit2025_speakers/PaolaCisero.jpeg'
      },
      {
        id: 'claudia-jimenez',
        timeSlot: '12:00 PM',
        topic: 'El rol del Chief AI Ethics & Responsibility Officer (CAIERO)',
        speakerName: 'Claudia Jiménez',
        speakerDescription: 'Chief AI Officer-CP. Profesora en el Tec de Monterrey. Politóloga e internacionalista. Doctora en Ciencias Políticas y Sociales. Pionera en IA en educación.',
        companyLogo: '/LOGOS-SUMMIT/silicon_valley.jpeg',
        speakerPhoto: '/Summit2025_speakers/ClaudiaJimenez.jpeg'
      },
      {
        id: 'jose-antonio-arochi',
        timeSlot: '1:00 PM',
        topic: 'IA y Productos Hiper Personalizados vs. Privacidad: Retos Legales del Marketing Digital',
        speakerName: 'José Antonio Arochi / Rodrigo Escartín / Miriam J. Padilla / Miguel Ángel Arévalo',
        speakers: [
          {
            id: 'jose-antonio-arochi',
            speakerName: 'José Antonio Arochi',
            speakerDescription: 'IP, IT.',
            companyLogo: '/LOGOS-SUMMIT/Arochi.jpeg',
            speakerPhoto: '/Summit2025_speakers/JoseAntonioArochi.jpeg'
          },
          {
            id: 'rodrigo-escartin',
            speakerName: 'Rodrigo Escartín',
            speakerDescription: 'Derecho mercantil y civil.',
            speakerPhoto: '/Summit2025_speakers/RodrigoEscartin.jpg'
          },
          {
            id: 'miriam-j-padilla',
            speakerName: 'Miriam J. Padilla',
            speakerDescription: 'Ciberseguridad y datos, CEO TodoPDP.',
            speakerPhoto: '/Summit2025_speakers/Miriam Padilla .jpeg'
          },
          {
            id: 'miguel-angel-arevalo',
            speakerName: 'Miguel Ángel Arévalo',
            speakerDescription: 'Fundador ARVEX, Best Lawyers 2025.',
            speakerPhoto: '/Summit2025_speakers/MiguelAngelArevalo.jpeg'
          }
        ]
      },
      {
        id: 'grecia-macias',
        timeSlot: '1:00 PM',
        topic: 'Transparencia Algorítmica: Derechos Digitales en la Era de la Caja Negra',
        speakerName: 'Grecia Macías',
        speakerDescription: 'LL.M. Stanford Law (Fulbright). Abogada R3D. Especialista en algorithmic justice, gobernanza de Internet, ciberseguridad y derechos digitales.',
        companyLogo: '/LOGOS-SUMMIT/WIKIMEDIA.png',
        speakerPhoto: '/Summit2025_speakers/GreciaMacias.jpeg'
      },
      {
        id: 'break-1',
        timeSlot: '2:00 PM',
        topic: '',
        speakerName: 'BREAK',
        speakerDescription: '',
        isBreak: true
      },
      {
        id: 'daniel-medina',
        timeSlot: '3:00 PM',
        topic: 'Entropía: La Ética más allá del Tiempo y el Espacio en IA',
        speakerName: 'Dr. Daniel Medina',
        speakerDescription: 'Doctor en Derecho. Maestrías en Cumplimiento y Delitos Financieros (UK). Profesor Tec de Monterrey. Autor de Entropía. 21K seguidores.',
        speakerPhoto: '/Summit2025_speakers/DanielMedina.jpeg',
      },
      {
        id: 'sissi-de-la-pena',
        timeSlot: '4:00 PM',
        topic: 'Privacy Enhancing Technologies: Protegiendo Datos en la Era de la IA',
        speakerName: 'Sissi de la Peña',
        speakerDescription: 'Fundadora The DoT Network. Tech Policy Fellow en Berkeley. Senior Advisor DataSphere. Lideró negociaciones T-MEC en comercio digital.',
        speakerPhoto: '/Summit2025_speakers/SissidelaPeña.jpeg',
        companyLogo: '/LOGOS-SUMMIT/TDN Logotype Chartreuse_Stocked_Slogan.png'
      },
      {
        id: 'julio-tellez',
        timeSlot: '5:00 PM',
        topic: 'Dilemas éticos y jurídicos en el uso de dispositivos cerebrales mediante IA',
        speakerName: 'Julio Téllez Valdés',
        speakerDescription: 'Doctor en Derecho. Pionero en informática jurídica en México desde 1980. Autor de Derecho Informático y Derecho y Emprendimiento Digital. Director en Anáhuac Online.',
        speakerPhoto: '/Summit2025_speakers/JulioTellez.jpeg',
        companyLogo: '/LOGOS-SUMMIT/Logotipo AnahuacOnline_Naranja.png'
      },
      {
        id: 'tatiana-lozano',
        timeSlot: '5:00 PM',
        topic: 'Agencia Artificial y responsabilidad moral: ¿quién debe responder por los daños causados por la IA?',
        speakerName: 'Tatiana Lozano Ortega',
        speakerDescription: ' MSc en Ética y Justicia Global (Birmingham). Profesora de ética. Licenciatura en Filosofía UP.',
        speakerPhoto: '/Summit2025_speakers/Tatiana Lozano.png',
        companyLogo: '/LOGOS-SUMMIT/WhiteBox.png'
      },
      {
        id: 'adriana-carolina-vergara',
        timeSlot: '6:00 PM',
        topic: 'Taller VibeCoding Legal: Programación Intuitiva para Abogados',
        speakerName: 'Adriana Carolina Vergara Avila',
        speakerDescription: 'Taller VibeCoding Legal: Programación Intuitiva para AbogadosCEO & Founder Ecolegalia. Certificada en AI (Stanford, Lund). Magíster en Derecho Ambiental. Top 3 LegalTech Colombia. Autora del Prompt Book Disruptivo para Abogados.',
        speakerPhoto: '/Summit2025_speakers/Adriana-Vergara.jpeg',
      },
    ]
  },  
  {
    id: 'friday',
    title: 'VIERNES 03 DE OCTUBRE',
    theme: 'PANELES Y DEBATES',
    colorClass: 'friday',
    sessions: [
      {
        id: 'maria-rios',
        timeSlot: '8:00 AM',
        topic: '',
        speakerName: 'María Fernanda Ríos',
        speakerDescription: 'AI Engineer especializada en RAG Systems. Experta en arquitecturas de recuperación aumentada de información legal desde Argentina. Ingeniera enfocada en optimización de sistemas de IA generativa para aplicaciones jurídicas.',
        speakerPhoto: '/Summit2025_speakers/mariafernanda.jpeg',
      },
      {
        id: 'pablo-ricardo-david',
        timeSlot: '9:00 AM',
        topic: 'El Claustro Algorítmico: Navegando la Tormenta Perfecta de la IA en la Educación Legal',
        speakerName: 'Ricardo H. Phillips Greene / David E. Merino Téllez',
        speakers: [
          {
            id: 'ricardo-phillips',
            speakerName: 'Ricardo H. Phillips Greene',
            speakerDescription: 'Operating Partner Linzor Capital, CEO Univ. Insurgentes. MBA Northwestern Kellogg. Experto en transformación digital educativa.',
            speakerPhoto: '/Summit2025_speakers/RicardoPhillips.jpeg',
          },
        ]
      },
      {
        id: 'david-merino',
        timeSlot: '9:00 AM',
        topic: '',
        speakerName: 'David E. Merino Téllez',
        speakerDescription: 'Vicepresidente Innovación Regulatoria CONCANACO. Experto ONU en regulación digital. Presidente Academia Mexicana de Derecho Digital. Autor de “Introducción al Derecho Digital”. Top Voice LinkedIn.',
        speakerPhoto: '/Summit2025_speakers/David Merino.png',
        companyLogo: '/LOGOS-SUMMIT/SE_Logo_2019.svg'
      },
      {
        id: 'mario-jose-karol',
        timeSlot: '10:00 AM',
        topic: 'Potenciales derechos de los robots, humanoides',
        speakerName: 'Mario David Montes Esparza-Farías / José Ramón Cárdeno Shaadi',
        speakers: [
          {
            id: 'mario-montes',
            speakerName: 'Mario David Montes Esparza-Farías',
            speakerDescription: 'Académico AMCID. Doctor en Derecho Anáhuac Qro. Especialista en roboética y transhumanismo.',
            speakerPhoto: '/Summit2025_speakers/MarioDavidEsparza.jpeg',
          },
          {
            id: 'jose-cardeno',
            speakerName: 'José Ramón Cárdeno Shaadi',
            speakerDescription: 'AI Lawyer, Doctor en Derecho. Autor de “IA como sujeto titular de derechos”. Ex Jefe de Gabinete Veracruz.',
            speakerPhoto: '/Summit2025_speakers/José Ramón Cardeno.jpeg',
          },
         
        ]
      },
      {
        id: 'karol-valencia',
        timeSlot: '10:00 AM',
        topic: '',
        speakerName: 'Karol Andrea Valencia Jaén',
        speakerDescription: 'AI Adoption & Change Manager en Saga. Cofundadora WOWLegalX. FastCase & vLex 50 Honoree (2024). Premio European Women in Legal Tech (2020). Experta en innovación legal con 10+ años de experiencia.',
        speakerPhoto: '/Summit2025_speakers/KarolValencia.jpeg',
        companyLogo: '/LOGOS-SUMMIT/WOW.svg'
      },
      {
        id: 'adrian-lopez',
        timeSlot: '11:00 AM',
        topic: 'Más allá de los LLMs, ecosistema extendido de AI',
        speakerName: 'Adrián López G.G.',
        speakerDescription: '',
        speakerPhoto: '/Summit2025_speakers/AdrianLopez.jpeg',
        companyLogo: '/LOGOS-SUMMIT/xrlivemx_logo.png'
      },
      {
        id: 'panel-latam',
        timeSlot: '11:00 AM',
        topic: 'El Ecosistema IA Legal LATAM',
        speakerName: 'Panel LATAM: Luis Raúl González Romo / Juan J. Pacheco Briceño / Fátima Toche Vega',
        speakerDescription: 'Luis Raúl: Data Scientist, Director Club IA Legal México. Juan J.: Fundador Zevallos Coll & Asociados, especialista en startups y legaltech. Fátima: Gerenta Legal en Iriarte & Asociados, doctoranda en IA y Protección de Datos, fundadora Club IA Legal Perú.',
        speakers: [
          {
            id: 'luis-romo',
            speakerName: 'Luis Raúl González Romo',
            speakerDescription: 'Data Scientist, Director Club IA Legal México.',
            speakerPhoto: '/Summit2025_speakers/Luis Gonzalez .jpeg',
            companyLogo: '/LOGOS-SUMMIT/CLUBIA legal.png'
          },
          {
            id: 'juan-pacheco',
            speakerName: 'Juan J. Pacheco Briceño',
            speakerDescription: 'Fundador Zevallos Coll & Asociados, especialista en startups y legaltech.',
            speakerPhoto: '/Summit2025_speakers/Juan J. Pacheco Briceño.png',
            companyLogo: '/LOGOS-SUMMIT/CLUBIA legal.png'
          },
          {
            id: 'fatima-toche',
            speakerName: 'Fátima Toche Vega',
            speakerDescription: 'Gerenta Legal en Iriarte & Asociados, doctoranda en IA y Protección de Datos, fundadora Club IA Legal Perú.',
            speakerPhoto: '/Summit2025_speakers/FatimaToche.jpeg',
            companyLogo: '/LOGOS-SUMMIT/CLUBIA legal.png'
          }
        ]
      },
      {
        id: 'aldo-rodolfo',
        timeSlot: '12:00 PM',
        topic: '',
        speakerName: 'Aldo Siu / Rodolfo Guerrero Martínez',
        speakerDescription: 'Aldo: Cofundador NegosIA. Economista e ingeniero en IA. Rodolfo: Profesor de Derecho Digital, Vicepresidente Academia Mexicana de Derecho Informático. 400+ conferencias en derecho digital.',
        speakers: [
          {
            id: 'aldo-siu',
            speakerName: 'Aldo Siu',
            speakerDescription: 'Cofundador NegosIA. Economista e ingeniero en IA.',
            speakerPhoto: '/Summit2025_speakers/AldoSiu.jpeg',
          },
          {
            id: 'rodolfo-guerrero',
            speakerName: 'Rodolfo Guerrero Martínez',
            speakerDescription: 'Profesor de Derecho Digital, Vicepresidente Academia Mexicana de Derecho Informático. 400+ conferencias en derecho digital.',
            speakerPhoto: '/Summit2025_speakers/RodolfoGuerrero.jpeg',
            companyLogo: '/LOGOS-SUMMIT/LOGOTIPO COFFEE LAW S.C(1).png'
          }
        ]
      },
      {
        id: 'carlos-valderrama',
        timeSlot: '1:00 PM',
        topic: 'Firmas Legales sin abogados, ¿Es posible?',
        speakerName: 'Carlos Valderrama',
        speakerDescription: 'Founder & Managing Partner Legal Paradox. Fundador Paradox Ventures. Programas en MIT, Cambridge y Yale. Reconocido por Chambers, Leaders League. LinkedIn Top Voice Finanzas LATAM. “Mexico\'s most disruptive digital lawyer” Foro Jurídico (2021).',
        speakerPhoto: '/Summit2025_speakers/CarlosValderrama.jpg',
        companyLogo: '/LOGOS-SUMMIT/LEGALPARADOX.png'
      }
    ]
  }  
];