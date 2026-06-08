// ============================================
// DATOS DE EMPRESAS Y SUCURSALES
// ============================================

export const empresas = [
  "BADIE",
  "DON PEDRO",
  "EL BAYEH",
//   "FERNANDO MANZUR",
  "EL SILENCIO",
  "SLEIMAN",
  "SURIA",
];

export const sucursalesPorEmpresa = {
  BADIE: [
    "CAFAYATE",
    "GÜEMES",
    "HUMAHUACA",
    "JOAQUIN GONZALEZ",
    "LA QUIACA",
    "LIBERTADOR",
    "MAIMARA",
    "METAN",
    "ORAN",
    "PERICO",
    "SALTA",
    "SAN PEDRO",
    "TARTAGAL",
    "TILCARA",
  ],
  "DON PEDRO": ["JUJUY", "LA QUIACA"],
  "EL BAYEH": ["HUACALERA", "MAIMARA"],
//   "FERNANDO MANZUR": [
//     "ABRA PAMPA",
//     "HUMAHUACA",
//     "LA QUIACA",
//     "LIBERTADOR",
//     "MAIMARA",
//     "SAN PEDRO",
//   ],
  "EL SILENCIO": ["PURMAMARCA"],
  SLEIMAN: ["HUA PLANTA", "HUA TAMBO"],
  SURIA: ["HUMAHUACA", "JUJUY", "LA QUIACA", "MAIMARA"],
};

// ============================================
// ÁREAS DE LA EMPRESA
// ============================================

export const areas = [
  "AUDITORIA BEBIDAS",
  "AUDITORIA PRODUCCION",
  "CALIDAD",
  "COMPRAS",
  "CONTABLE",
  "DATA ANALYTICS",
  "FINANZAS",
  "HABILITACIONES E INOCUIDAD",
  "MARKETING",
  "RRHH HARD",
  "RRHH SOFT",
  "RSE",
  "SISTEMAS",
];

// ============================================
// PROVINCIAS
// ============================================

export const provincias = ["JUJUY", "SALTA"];

// ============================================
// UTILIDADES ADICIONALES (opcional)
// ============================================

// Función para obtener sucursales de una empresa
export const getSucursalesByEmpresa = (empresa) => {
  return sucursalesPorEmpresa[empresa] || [];
};

// Función para validar si una empresa existe
export const isValidEmpresa = (empresa) => {
  return empresas.includes(empresa);
};

// Función para validar si un área existe
export const isValidArea = (area) => {
  return areas.includes(area);
};

// Función para validar si una provincia existe
export const isValidProvincia = (provincia) => {
  return provincias.includes(provincia);
};
