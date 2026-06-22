export const LOCALES = [
  {
    id: 'salitre',
    localId: 1,            // → public.locales.id (FK orders.local_id). NO cambiar sin migrar la BD.
    slug: 'salitre',
    nombre: 'CC salitre Plaza',
    direccion: 'Calle 24a # 69-76, Local 372 — Bogotá',
    detalles: 'Dentro de Salitre Plaza, en plena zona empresarial. Perfecto para un almuerzo rápido y cargado de energía real.',
    horarioSemana: '11:30 AM – 8:00 PM',
    horarioFinde: '11:30 AM – 8:00 PM',
    amenidades: ['Pet Friendly', 'Wi-Fi gratis', 'Zona de terraza'],
    mapaUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.6713600984107!2d-74.11326462417742!3d4.652613195321855!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9be4a9efdf87%3A0x6b9ef2df3f486851!2sAv.%20El%20Dorado%20%2369%2C%20Bogot%C3%A1!5e0!3m2!1ses!2sco!4v1715012345678!5m2!1ses!2sco',
  },
  {
    id: 'chile',
    localId: 2,            // → public.locales.id
    slug: 'chile',
    nombre: 'CC av chile',
    direccion: 'Calle 72 # 10-34, Local 408B — Bogotá',
    detalles: 'En el epicentro financiero de Bogotá. La pausa perfecta y nutritiva para tu jornada laboral diaria.',
    horarioSemana: '11:30 AM – 7:00 PM',
    horarioFinde: '11:30 AM – 6:00 PM',
    amenidades: ['Para llevar', 'Estación de carga', 'Opciones Veganas'],
    mapaUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.54347712391!2d-74.05923162417724!3d4.657538995316499!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9a5be41bb59b%3A0xe744e8ec50672e!2sCl.%2072%20%2310-34%2C%20Bogot%C3%A1!5e0!3m2!1ses!2sco!4v1715012355678!5m2!1ses!2sco',
  },
  {
    id: 'nuestro-bogota',
    localId: 3,            // → public.locales.id
    slug: 'nuestro-bogota',
    nombre: 'CC Nuestro Bogota',
    direccion: 'Av. Ciudad de Cali # 52-25, Local L3-127 — Bogotá',
    detalles: 'Ubicados en el Centro Comercial Nuestro Bogotá. El spot ideal para alimentarte sanamente.',
    horarioSemana: '11:00 AM – 9:00 PM',
    horarioFinde: '11:00 AM – 9:00 PM',
    amenidades: ['Zona infantil', 'Parqueadero cubierto', 'Pagos digitales'],
    mapaUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.55621376841!2d-74.12431762417726!3d4.655255995318042!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9b008d5dfd35%3A0x67db23315a6e8b2b!2sCC%20Nuestro%20Bogot%C3%A1!5e0!3m2!1ses!2sco!4v1715012365678!5m2!1ses!2sco',
  },
];
