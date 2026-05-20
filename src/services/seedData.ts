export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  role: 'adoptante' | 'dador';
  avatar: string;
  verified: 'pending' | 'verified' | 'rejected';
  rating: number;
  reviewsCount: number;
  documents: {
    ineFront?: string;
    ineBack?: string;
    proofOfAddress?: string;
    selfieWithIne?: string;
    commitmentLetter?: string;
    homeSpace?: string;
  };
  reviews: Review[];
  bio: string;
}

export interface Review {
  id: string;
  fromUser: string;
  fromName: string;
  fromAvatar: string;
  rating: number;
  comment: string;
  date: string;
  tags: string[];
}

export interface Pet {
  id: string;
  name: string;
  species: 'Perro' | 'Gato' | 'Conejo' | 'Ave' | 'Otro';
  breed: string;
  age: string;
  sex: 'Macho' | 'Hembra';
  size: 'Pequeño' | 'Mediano' | 'Grande';
  health: {
    castrated: boolean;
    vaccinated: boolean;
    dewormed: boolean;
    chipped: boolean;
    specialNeeds: boolean;
    specialNeedsDetails?: string;
  };
  description: string;
  tags: string[];
  conditions: string[];
  city: string;
  images: string[];
  ownerId: string;
  adopterId?: string; // ID of the adopter once adopted
  createdAt: string;
  status: 'disponible' | 'proceso' | 'adoptado';
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export interface AdoptionRequest {
  id: string;
  petId: string;
  petName: string;
  petImage: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  status: 'pendiente' | 'info_requerida' | 'aceptado' | 'rechazado' | 'entregado';
  step: number; // 1 to 5
  handoverConfirmedByAdopter: boolean;
  handoverConfirmedByRescuer: boolean;
  presentationMessage: string;
  hasOtherPets: boolean;
  hasChildren: boolean;
  hasGarden: boolean;
  hoursAlone: number;
  createdAt: string;
}


export interface ChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface PostAdoptionUpdate {
  id: string;
  petId: string;
  petName: string;
  updaterId: string;
  updaterName: string;
  updaterAvatar: string;
  description: string;
  images: string[];
  likes: number;
  likedBy: string[]; // User IDs who liked this
  comments: Comment[];
  isPublic: boolean;
  createdAt: string;
  timeLabel: string; // "Semana 1", "Mes 1", etc.
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'request' | 'status' | 'comment' | 'like' | 'review' | 'system';
  referenceId: string; // petId, requestId, reviewId, etc.
  read: boolean;
  createdAt: string;
}

export const seedUsers: User[] = [
  {
    id: 'u1',
    username: 'rescate_patitas_gdl',
    fullName: 'Rescate Patitas Gdl',
    email: 'contacto@patitasgdl.org',
    phone: '3312345678',
    city: 'Guadalajara, Jalisco',
    role: 'dador',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    verified: 'verified',
    rating: 4.9,
    reviewsCount: 47,
    bio: 'Rescate independiente enfocado en perritos y gatitos de la calle en la ZMG. ¡Buscamos hogares de amor!',
    documents: {},
    reviews: [
      {
        id: 'r1',
        fromUser: 'u5',
        fromName: 'Carlos García',
        fromAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        rating: 5,
        comment: 'Excelente comunicación. Adoptamos a Nala con ellos y el proceso fue muy transparente. Súper recomendados.',
        date: '2026-04-10',
        tags: ['Muy responsable', 'Responde rápido', 'Excelente trato']
      },
      {
        id: 'r2',
        fromUser: 'u7',
        fromName: 'Andrea Villa',
        fromAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        rating: 4,
        comment: 'Tienen un protocolo estricto de adopción, lo cual me da confianza de que realmente cuidan el destino de los animales.',
        date: '2026-03-15',
        tags: ['Animal en excelentes condiciones', 'Responde rápido']
      }
    ]
  },
  {
    id: 'u2',
    username: 'sofia_mendez',
    fullName: 'Sofía Méndez',
    email: 'sofia.m@gmail.com',
    phone: '3398765432',
    city: 'Tlaquepaque, Jalisco',
    role: 'dador',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    verified: 'verified',
    rating: 4.8,
    reviewsCount: 12,
    bio: 'Amante de los animales, hogar temporal independiente. Rescato de forma particular en mi zona.',
    documents: {},
    reviews: []
  },
  {
    id: 'u3',
    username: 'casa_bigotes',
    fullName: 'Asociación Casa Bigotes',
    email: 'adopciones@casabigotes.org',
    phone: '5511223344',
    city: 'CDMX',
    role: 'dador',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    verified: 'verified',
    rating: 5.0,
    reviewsCount: 103,
    bio: 'AC dedicada a la rehabilitación y adopción de animales maltratados y abandonados en la Ciudad de México.',
    documents: {},
    reviews: []
  },
  {
    id: 'u4',
    username: 'daniela_rescata',
    fullName: 'Daniela Torres',
    email: 'daniela.torres@live.com.mx',
    phone: '8122334455',
    city: 'Monterrey, Nuevo León',
    role: 'dador',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    verified: 'verified',
    rating: 4.7,
    reviewsCount: 8,
    bio: 'Rescatista independiente en la zona metropolitana de Monterrey. Encontrando segundas oportunidades.',
    documents: {},
    reviews: []
  },
  {
    id: 'u5',
    username: 'carlos_garcia_mty',
    fullName: 'Carlos García',
    email: 'carlos.garcia@outlook.com',
    phone: '8182838485',
    city: 'Monterrey, Nuevo León',
    role: 'adoptante',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    verified: 'verified',
    rating: 4.9,
    reviewsCount: 2,
    bio: 'Amante de la naturaleza, el senderismo y los perros. Adoptante feliz de dos perritos rescatados.',
    documents: {},
    reviews: []
  },
  {
    id: 'u6',
    username: 'familia_ramirez',
    fullName: 'Familia Ramírez',
    email: 'contacto.ramirez@hotmail.com',
    phone: '5544332211',
    city: 'CDMX',
    role: 'adoptante',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    verified: 'verified',
    rating: 5.0,
    reviewsCount: 1,
    bio: 'Familia unida con casa amplia y jardín buscando un nuevo integrante de cuatro patas. ¡Amamos a los animales!',
    documents: {},
    reviews: []
  },
  {
    id: 'u7',
    username: 'andrea_vm',
    fullName: 'Andrea Villa',
    email: 'andrea.v@outlook.com',
    phone: '3334445555',
    city: 'Guadalajara, Jalisco',
    role: 'adoptante',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    verified: 'verified',
    rating: 4.6,
    reviewsCount: 3,
    bio: 'Médico veterinaria y adoptante activa de animales viejitos o con necesidades especiales. ¡Dando amor al final de su camino!',
    documents: {},
    reviews: []
  },
  {
    id: 'u8',
    username: 'rodrigo_lopez',
    fullName: 'Rodrigo López',
    email: 'rodrigo.l@gmail.com',
    phone: '5599887766',
    city: 'CDMX',
    role: 'adoptante',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    verified: 'pending',
    rating: 4.5,
    reviewsCount: 0,
    bio: 'Diseñador gráfico. Vivo solo en un departamento pet-friendly en la Condesa y quiero un compañero felino.',
    documents: {},
    reviews: []
  },
  {
    id: 'u9',
    username: 'patricia_gomez',
    fullName: 'Patricia Gómez',
    email: 'paty.g@gmail.com',
    phone: '3355667788',
    city: 'Zapopan, Jalisco',
    role: 'adoptante',
    avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150',
    verified: 'rejected',
    rating: 4.0,
    reviewsCount: 1,
    bio: 'Estudiante universitaria. Me gusta leer y correr. Busco adoptar a un conejo o roedor pequeño.',
    documents: {},
    reviews: []
  },
  {
    id: 'u10',
    username: 'juan_perez',
    fullName: 'Juan Pérez',
    email: 'juan@perez.com',
    phone: '3311122233',
    city: 'Guadalajara, Jalisco',
    role: 'adoptante',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    verified: 'pending',
    rating: 5.0,
    reviewsCount: 0,
    bio: 'Ingeniero de software en Guadalajara. Vivo en casa propia con patio mediano.',
    documents: {},
    reviews: []
  },
  {
    id: 'u11',
    username: 'alberto_vet',
    fullName: 'Alberto Castro',
    email: 'alberto@vet.com',
    phone: '8111223344',
    city: 'San Pedro, Nuevo León',
    role: 'dador',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150',
    verified: 'verified',
    rating: 4.9,
    reviewsCount: 5,
    bio: 'Veterinario clínico en Mty. Rescato y opero animales heridos de la calle para darlos rehabilitados.',
    documents: {},
    reviews: []
  },
  {
    id: 'u12',
    username: 'gaby_rescates',
    fullName: 'Gabriela Ortiz',
    email: 'gaby.ortiz@gmail.com',
    phone: '5566778899',
    city: 'Coyoacán, CDMX',
    role: 'dador',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150',
    verified: 'verified',
    rating: 4.8,
    reviewsCount: 9,
    bio: 'Hogar temporal independiente para gatitos bebés en el sur de la CDMX.',
    documents: {},
    reviews: []
  }
];

export const seedPets: Pet[] = [
  {
    id: 'p1',
    name: 'Milo',
    species: 'Gato',
    breed: 'Mestizo',
    age: '2 años',
    sex: 'Macho',
    size: 'Mediano',
    health: {
      castrated: true,
      vaccinated: true,
      dewormed: true,
      chipped: false,
      specialNeeds: false
    },
    description: 'Milo fue rescatado de una cochera cuando era un gatito. Es extremadamente ronroneador, juguetón y le encanta dormir en los hombros. Convive excelente con otros gatos y niños.',
    tags: ['Tranquilo', 'Cariñoso', 'Bueno con niños'],
    conditions: ['Solo interiores', 'Redes de protección en ventanas', 'Alimento de buena calidad'],
    city: 'Guadalajara, Jalisco',
    images: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600',
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600',
      'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600'
    ],
    ownerId: 'u1',
    createdAt: '2026-05-10T12:00:00Z',
    status: 'disponible',
    comments: [
      {
        id: 'c1',
        userId: 'u7',
        username: 'andrea_vm',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        text: '¿Ya está esterilizado?',
        createdAt: '2026-05-11T14:30:00Z'
      },
      {
        id: 'c2',
        userId: 'u1',
        username: 'rescate_patitas_gdl',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        text: '¡Sí! Operado hace 3 meses 🏥',
        createdAt: '2026-05-11T15:00:00Z'
      }
    ]
  },
  {
    id: 'p2',
    name: 'Max',
    species: 'Perro',
    breed: 'Labrador Mestizo',
    age: '3 años',
    sex: 'Macho',
    size: 'Grande',
    health: {
      castrated: true,
      vaccinated: true,
      dewormed: true,
      chipped: true,
      specialNeeds: false
    },
    description: 'Max es un labrador muy sociable y activo. Le encantan los paseos largos y jugar a traer la pelota. Sabe sentarse y dar la pata. Excelente compañero para una familia activa.',
    tags: ['Juguetón', 'Bueno con niños', 'Activo'],
    conditions: ['Casa con jardín', 'Paseos diarios mínimos de 30 mins', 'Nivel de actividad alto'],
    city: 'Guadalajara, Jalisco',
    images: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600',
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600',
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600'
    ],
    ownerId: 'u1',
    createdAt: '2026-05-11T10:00:00Z',
    status: 'disponible',
    comments: []
  },
  {
    id: 'p3',
    name: 'Luna',
    species: 'Perro',
    breed: 'Mestiza',
    age: '1 año',
    sex: 'Hembra',
    size: 'Mediano',
    health: {
      castrated: true,
      vaccinated: true,
      dewormed: true,
      chipped: false,
      specialNeeds: false
    },
    description: 'Luna es una perrita de tamaño mediano muy dulce y algo tímida al principio. Una vez que toma confianza, es tu sombra protectora. Ideal para una persona sola o pareja tranquila.',
    tags: ['Tranquilo', 'Cariñoso', 'Tímido'],
    conditions: ['Paciencia para su adaptación', 'Hogar preferentemente sin ruidos excesivos'],
    city: 'Guadalajara, Jalisco',
    images: [
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600',
      'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=600'
    ],
    ownerId: 'u2',
    createdAt: '2026-05-12T09:00:00Z',
    status: 'disponible',
    comments: []
  },
  {
    id: 'p4',
    name: 'Copito',
    species: 'Gato',
    breed: 'Persa Mestizo',
    age: '3 años',
    sex: 'Macho',
    size: 'Mediano',
    health: {
      castrated: true,
      vaccinated: true,
      dewormed: true,
      chipped: false,
      specialNeeds: true,
      specialNeedsDetails: 'Requiere limpieza diaria de lagrimales por su raza.'
    },
    description: 'Copito es un gato majestuoso de pelaje blanco y ojos de color. Es muy independiente pero disfruta de compañía humana pasiva. Prefiere ser el único felino del hogar.',
    tags: ['Independiente', 'Tranquilo'],
    conditions: ['Cepillado de pelo diario', 'Unico gato', 'Visitas periódicas al veterinario'],
    city: 'Tlaquepaque, Jalisco',
    images: [
      'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?w=600',
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600'
    ],
    ownerId: 'u2',
    createdAt: '2026-05-13T15:00:00Z',
    status: 'disponible',
    comments: []
  },
  {
    id: 'p5',
    name: 'Oreo',
    species: 'Conejo',
    breed: 'Holandés enano',
    age: '6 meses',
    sex: 'Macho',
    size: 'Pequeño',
    health: {
      castrated: false,
      vaccinated: true,
      dewormed: true,
      chipped: false,
      specialNeeds: false
    },
    description: 'Oreo es un conejito muy curioso y activo. Le encanta comer heno de alfalfa y rodajas de zanahoria como premio. Sabe hacer sus necesidades en su bandeja sanitaria.',
    tags: ['Juguetón', 'Curioso'],
    conditions: ['Espacio libre para saltar', 'No estar enjaulado todo el día', 'Dieta estricta de heno y verduras frescas'],
    city: 'CDMX',
    images: [
      'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600',
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600'
    ],
    ownerId: 'u3',
    createdAt: '2026-05-14T11:00:00Z',
    status: 'disponible',
    comments: []
  },
  {
    id: 'p6',
    name: 'Bruno',
    species: 'Perro',
    breed: 'Bulldog Francés',
    age: '5 años',
    sex: 'Macho',
    size: 'Pequeño',
    health: {
      castrated: true,
      vaccinated: true,
      dewormed: true,
      chipped: true,
      specialNeeds: true,
      specialNeedsDetails: 'Sufre de alergia alimentaria, requiere croquetas especiales hidrolizadas.'
    },
    description: 'Bruno es un perrito muy cariñoso y dormilón. Su actividad favorita es ver televisión en el sillón con su dueño. Convive bien con otros perros pequeños.',
    tags: ['Tranquilo', 'Cariñoso', 'Bueno con otros animales'],
    conditions: ['Croquetas especiales e hipoalergénicas', 'Evitar temperaturas extremas de calor por braquicefalia'],
    city: 'CDMX',
    images: [
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600'
    ],
    ownerId: 'u3',
    createdAt: '2026-05-14T14:00:00Z',
    status: 'disponible',
    comments: []
  },
  {
    id: 'p7',
    name: 'Nala',
    species: 'Gato',
    breed: 'Tuxedo',
    age: '4 meses',
    sex: 'Hembra',
    size: 'Pequeño',
    health: {
      castrated: false,
      vaccinated: true,
      dewormed: true,
      chipped: false,
      specialNeeds: false
    },
    description: 'Nala es una gatita activa y traviesa de color negro con blanco. Le encantan los juguetes con plumas y los rascadores altos. Es sumamente sociable con humanos.',
    tags: ['Juguetón', 'Activo', 'Curioso'],
    conditions: ['Compromiso de esterilización obligatoria a los 6 meses', 'Hogar seguro anti-escapes'],
    city: 'Coyoacán, CDMX',
    images: [
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600'
    ],
    ownerId: 'u12',
    createdAt: '2026-05-15T08:00:00Z',
    status: 'disponible',
    comments: []
  },
  {
    id: 'p8',
    name: 'Toby',
    species: 'Perro',
    breed: 'Chihuahua',
    age: '7 años',
    sex: 'Macho',
    size: 'Pequeño',
    health: {
      castrated: true,
      vaccinated: true,
      dewormed: true,
      chipped: false,
      specialNeeds: false
    },
    description: 'Toby es un chihuahua senior muy leal y faldero. Le cuesta confiar en extraños pero una vez que te acepta no se separará de ti. Busca un hogar tranquilo sin niños pequeños.',
    tags: ['Tranquilo', 'Cariñoso', 'Leal'],
    conditions: ['Hogar sin niños pequeños', 'Mucha paciencia al inicio'],
    city: 'Monterrey, Nuevo León',
    images: [
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600'
    ],
    ownerId: 'u4',
    createdAt: '2026-05-15T10:00:00Z',
    status: 'disponible',
    comments: []
  },
  {
    id: 'p9',
    name: 'Kiki',
    species: 'Ave',
    breed: 'Ninfa Carolina',
    age: '1 año',
    sex: 'Macho',
    size: 'Pequeño',
    health: {
      castrated: false,
      vaccinated: false,
      dewormed: true,
      chipped: false,
      specialNeeds: false
    },
    description: 'Kiki es una ninfa cantadora y muy alegre. Le gusta silbar melodías sencillas y comer fruta fresca. Se entrega con jaula amplia pero requiere tiempo fuera de ella diariamente.',
    tags: ['Juguetón', 'Curioso'],
    conditions: ['Dieta de semillas de calidad y vegetales', 'Volar libre en habitación cerrada al menos 1 hora al día'],
    city: 'Monterrey, Nuevo León',
    images: [
      'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?w=600'
    ],
    ownerId: 'u11',
    createdAt: '2026-05-16T12:00:00Z',
    status: 'disponible',
    comments: []
  },
  {
    id: 'p10',
    name: 'Rocco',
    species: 'Perro',
    breed: 'Pitbull Mestizo',
    age: '4 años',
    sex: 'Macho',
    size: 'Grande',
    health: {
      castrated: true,
      vaccinated: true,
      dewormed: true,
      chipped: true,
      specialNeeds: false
    },
    description: 'Rocco fue rescatado de una situación de maltrato. A pesar de su pasado, es un perro amoroso, dócil y sumiso. Tiene un excelente comportamiento al caminar con correa.',
    tags: ['Bueno con niños', 'Cariñoso', 'Tranquilo'],
    conditions: ['Casa segura con barda alta', 'Familia dispuesta a brindarle mucho amor'],
    city: 'Monterrey, Nuevo León',
    images: [
      'https://images.unsplash.com/photo-1544568100-847a948585b9?w=600'
    ],
    ownerId: 'u4',
    createdAt: '2026-05-16T15:00:00Z',
    status: 'disponible',
    comments: []
  }
];

export const seedUpdates: PostAdoptionUpdate[] = [
  {
    id: 'up1',
    petId: 'p2',
    petName: 'Max',
    updaterId: 'u5',
    updaterName: 'Carlos García',
    updaterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    description: '¡Milo cumplió 3 meses con nosotros! Ya conoce a todos en el parque y es el rey de la casa. Gracias a @rescate_patitas_gdl por confiar en nosotros.',
    images: ['https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600'],
    likes: 42,
    likedBy: ['u1', 'u2', 'u3'],
    comments: [
      {
        id: 'c_up1',
        userId: 'u1',
        username: 'rescate_patitas_gdl',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        text: '¡Nos da demasiada felicidad ver lo hermoso que está! Gracias por cuidarlo tanto.',
        createdAt: '2026-05-18T10:00:00Z'
      }
    ],
    isPublic: true,
    createdAt: '2026-05-18T08:00:00Z',
    timeLabel: 'Mes 3'
  },
  {
    id: 'up2',
    petId: 'p3',
    petName: 'Luna',
    updaterId: 'u6',
    updaterName: 'Familia Ramírez',
    updaterAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    description: 'Semana 1 de Luna en su nuevo hogar. Ya duerme en su camita y se adaptó súper rápido a los niños.',
    images: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600'],
    likes: 18,
    likedBy: ['u2'],
    comments: [],
    isPublic: true,
    createdAt: '2026-05-19T14:00:00Z',
    timeLabel: 'Semana 1'
  }
];
