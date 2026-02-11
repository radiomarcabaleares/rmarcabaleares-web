export const BRAND = {
  name: 'Radio Marca Baleares',
  colors: {
    radioBlue: '#1B3C6E',
    radioBlueLight: '#2A5294',
    radioBlueDark: '#0F2544',
    marcaRed: '#E2001A',
    marcaRedLight: '#FF1A33',
    marcaRedDark: '#B80015',
  },
  company: {
    legalName: 'XELAGROUP SL',
    address: 'Carretera Valldemossa S/n KM 7.4',
    postalCode: '07010',
    city: 'Palma De Mallorca',
    region: 'Illes Balears',
    country: 'Espana',
  },
  contacts: {
    atencionCliente: {
      label: 'Atencion al Cliente',
      email: 'direccion@rmarcabaleares.com',
      phone: '+34 617 02 04 92',
    },
    comercial: {
      label: 'Venta / Marketing',
      email: 'comercial@rmarcabaleares.com',
      phone: '+34 617 02 04 92',
    },
    disclaimer: 'direccion@rmarcabaleares.com',
  },
  logos: {
    horizontal: '/images/logos/logo-horizontal-radio-marca-baleares.png',
    vertical: '/images/logos/RadioMarcaVertical.svg',
    banner: '/images/banner-1920x1080-radio-marca-baleares.png',
  },
} as const;

export const BENTO_SLOTS = {
  large: { width: 1024, height: 1024, label: 'Grande (Favorito)', aspect: '1:1' },
  horizontal: { width: 960, height: 600, label: 'Horizontal', aspect: '8:5' },
  small_1: { width: 480, height: 480, label: 'Pequeno 1', aspect: '1:1' },
  small_2: { width: 480, height: 480, label: 'Pequeno 2', aspect: '1:1' },
} as const;

export const FUTBOL_SLOTS = {
  futbol_1: { width: 480, height: 480, label: 'Futbol Balear 1', aspect: '1:1' },
  futbol_2: { width: 480, height: 480, label: 'Futbol Balear 2', aspect: '1:1' },
  futbol_3: { width: 480, height: 480, label: 'Futbol Balear 3', aspect: '1:1' },
} as const;
