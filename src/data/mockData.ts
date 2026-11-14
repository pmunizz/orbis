import type { Appointment, Combo, Professional, Service } from '../types'

export const services: Service[] = [
  {
    id: 'consultation',
    name: 'Consulta de avaliação',
    category: 'Consultas',
    description: 'Um olhar atento para entender o que você precisa.',
    fullDescription: 'Uma conversa individual para conhecer seus objetivos, avaliar suas necessidades e criar um plano de cuidado personalizado.',
    price: 180,
    duration: 60,
    professionals: ['marina', 'carolina'],
  },
  {
    id: 'facial',
    name: 'Limpeza de pele',
    category: 'Faciais',
    description: 'Pele renovada, leve e com viço natural.',
    fullDescription: 'Tratamento facial completo com higienização profunda, extração cuidadosa e hidratação para devolver frescor e luminosidade.',
    price: 220,
    duration: 75,
    professionals: ['marina', 'luiza'],
  },
  {
    id: 'massage',
    name: 'Massagem relaxante',
    category: 'Bem-estar',
    description: 'Uma pausa restauradora para corpo e mente.',
    fullDescription: 'Movimentos fluidos e óleos aromáticos ajudam a aliviar tensões, desacelerar a rotina e renovar sua energia.',
    price: 240,
    duration: 60,
    professionals: ['rafael', 'carolina'],
  },
  {
    id: 'drainage',
    name: 'Drenagem linfática',
    category: 'Bem-estar',
    description: 'Leveza e cuidado em cada movimento.',
    fullDescription: 'Técnica manual suave que estimula a circulação linfática e promove uma agradável sensação de bem-estar.',
    price: 210,
    duration: 60,
    professionals: ['rafael', 'luiza'],
  },
  {
    id: 'brows',
    name: 'Design de sobrancelhas',
    category: 'Beleza',
    description: 'Desenho natural que valoriza sua expressão.',
    fullDescription: 'Mapeamento personalizado e finalização precisa para realçar a harmonia do seu rosto com naturalidade.',
    price: 95,
    duration: 40,
    professionals: ['luiza', 'carolina'],
  },
  {
    id: 'manicure',
    name: 'Manicure essencial',
    category: 'Beleza',
    description: 'Um cuidado especial, do seu jeito.',
    fullDescription: 'Cuidado completo das unhas com acabamento impecável e produtos selecionados para você.',
    price: 85,
    duration: 45,
    professionals: ['carolina', 'luiza'],
  },
  {
    id: 'laser',
    name: 'Laser — área pequena',
    category: 'Tecnologia',
    description: 'Tecnologia e conforto para a sua rotina.',
    fullDescription: 'Sessão personalizada com tecnologia moderna e acompanhamento de uma profissional especializada.',
    price: 160,
    duration: 30,
    professionals: ['marina', 'rafael'],
  },
  {
    id: 'consultation-plus',
    name: 'Consulta de retorno',
    category: 'Consultas',
    description: 'Acompanhamento próximo da sua evolução.',
    fullDescription: 'Revisão do plano de cuidado e acompanhamento dos resultados com orientações personalizadas.',
    price: 120,
    duration: 40,
    professionals: ['marina', 'carolina'],
  },
]

export const combos: Combo[] = [
  { id: 'ritual', name: 'Ritual de renovação', description: 'Limpeza de pele + consulta de avaliação.', services: ['facial', 'consultation'], price: 350 },
  { id: 'pause', name: 'Pausa completa', description: 'Massagem relaxante + drenagem linfática.', services: ['massage', 'drainage'], price: 399 },
  { id: 'selfcare', name: 'Essenciais de cuidado', description: 'Consulta de retorno + design de sobrancelhas.', services: ['consultation-plus', 'brows'], price: 185 },
]

export const professionals: Professional[] = [
  { id: 'marina', name: 'Marina Costa', specialty: 'Estética facial', description: 'Cuidado personalizado com olhar atento aos detalhes.', services: services.filter((service) => service.professionals.includes('marina')).map((service) => service.id), avatar: 'MC' },
  { id: 'rafael', name: 'Rafael Mendes', specialty: 'Terapias integrativas', description: 'Técnicas de bem-estar para você se sentir renovado.', services: services.filter((service) => service.professionals.includes('rafael')).map((service) => service.id), avatar: 'RM' },
  { id: 'luiza', name: 'Luiza Almeida', specialty: 'Beleza e autocuidado', description: 'Realçando sua beleza com leveza e naturalidade.', services: services.filter((service) => service.professionals.includes('luiza')).map((service) => service.id), avatar: 'LA' },
  { id: 'carolina', name: 'Carolina Prado', specialty: 'Bem-estar e beleza', description: 'Uma experiência de cuidado feita para você.', services: services.filter((service) => service.professionals.includes('carolina')).map((service) => service.id), avatar: 'CP' },
]

const localDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const dayOffset = (amount: number) => {
  const date = new Date()
  date.setDate(date.getDate() + amount)
  return localDateKey(date)
}

export const demoAppointments: Appointment[] = [
  {
    id: 'ORB-2841',
    name: 'Ana Beatriz Oliveira',
    phone: '(11) 99999-1234',
    email: 'ana@email.com',
    serviceIds: ['facial'],
    professionalId: 'marina',
    date: dayOffset(3),
    time: '10:00',
    status: 'Confirmado',
    createdAt: new Date().toISOString(),
    history: [],
  },
  {
    id: 'ORB-1930',
    name: 'Ana Beatriz Oliveira',
    phone: '(11) 99999-1234',
    email: '',
    serviceIds: ['massage'],
    professionalId: 'rafael',
    date: dayOffset(-5),
    time: '14:00',
    status: 'Realizado',
    createdAt: new Date().toISOString(),
    history: [],
  },
  {
    id: 'ORB-3172',
    name: 'Mariana Souza',
    phone: '(21) 98888-4321',
    email: '',
    serviceIds: ['brows'],
    professionalId: 'luiza',
    date: dayOffset(7),
    time: '11:00',
    status: 'Cancelado',
    createdAt: new Date().toISOString(),
    history: [],
  },
]
