// ════════════════════════════════════════════════
// tampos.js · Work Kit · Hélder Melo
// Catálogo Anigraco — Tampos & Pedra
// ════════════════════════════════════════════════

// ── Firebase — importado do contexto da app ─────────
import { doc, setDoc, getDoc, getDocs, collection } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getDb, toast, setSyncOk, mostrarErroDB } from './utils.js';

// ── Fornecedor ────────────────────────────────────
export const ANIGRACO = {
  nome: 'ANIGRACO',
  cod:  '207849',
};

// ── Transporte ────────────────────────────────────
export const TRANSPORTE = [
  { label: 'Viseu',   c1: 19000, pvp: 300  },
  { label: '> 30 km', c1: 30000, pvp: 480  },
  { label: '> 50 km', c1: 45000, pvp: 720  },
];

// ── Acabamentos por material ──────────────────────
const ACB_GRANITO = [
  { id: 'rodatampo',  nome: 'Rodatampo',             unid: 'ml', c1: 1160,  pvp: 21  },
  { id: 'cortebruto', nome: 'Corte Bruto',            unid: 'un', c1: 1260,  pvp: 23  },
  { id: 'rebaixo',    nome: 'Rebaixo à Face',          unid: 'un', c1: 4410,  pvp: 80  },
  { id: 'polido',     nome: 'Transformação Polido',    unid: 'un', c1: 3500,  pvp: 56  },
  { id: 'furo',       nome: 'Furo',                   unid: 'un', c1: 950,   pvp: 17  },
  { id: 'esquadria',  nome: 'Corte ½ Esquadria',       unid: 'un', c1: 2310,  pvp: 47  },
];
const ACB_SILESTONE = [
  { id: 'rodatampo',  nome: 'Rodatampo',             unid: 'ml', c1: 1320,  pvp: 24  },
  { id: 'cortebruto', nome: 'Corte Bruto',            unid: 'un', c1: 1260,  pvp: 23  },
  { id: 'rebaixo',    nome: 'Rebaixo à Face',          unid: 'un', c1: 4410,  pvp: 80  },
  { id: 'polido',     nome: 'Transformação Polido',    unid: 'un', c1: 3500,  pvp: 56  },
  { id: 'furo',       nome: 'Furo',                   unid: 'un', c1: 950,   pvp: 17  },
  { id: 'esquadria',  nome: 'Corte ½ Esquadria',       unid: 'un', c1: 2310,  pvp: 47  },
  { id: 'silicone',   nome: 'Silicone',               unid: 'un', c1: 1000,  pvp: 18  },
];
const ACB_COMPAC = [
  { id: 'rodatampo',  nome: 'Rodatampo',             unid: 'ml', c1: 1320,  pvp: 24  },
  { id: 'cortebruto', nome: 'Corte Bruto',            unid: 'un', c1: 1260,  pvp: 26  },
  { id: 'rebaixo',    nome: 'Rebaixo à Face',          unid: 'un', c1: 4410,  pvp: 90  },
  { id: 'polido',     nome: 'Transformação Polido',    unid: 'un', c1: 3500,  pvp: 56  },
  { id: 'furo',       nome: 'Furo',                   unid: 'un', c1: 950,   pvp: 19  },
  { id: 'esquadria',  nome: 'Corte ½ Esquadria',       unid: 'un', c1: 2310,  pvp: 47  },
  { id: 'silicone',   nome: 'Silicone',               unid: 'un', c1: 1000,  pvp: 18  },
];
const ACB_DEKTON = [
  { id: 'rodatampo',  nome: 'Rodatampo',             unid: 'ml', c1: 3200,  pvp: 59  },
  { id: 'cortebruto', nome: 'Corte Bruto',            unid: 'un', c1: 3200,  pvp: 66  },
  { id: 'rebaixo',    nome: 'Rebaixo à Face',          unid: 'un', c1: 5670,  pvp: 116 },
  { id: 'polido',     nome: 'Transformação Polido',    unid: 'un', c1: 5000,  pvp: 90  },
  { id: 'furo',       nome: 'Furo',                   unid: 'un', c1: 1260,  pvp: 26  },
  { id: 'esquadria',  nome: 'Corte ½ Esquadria',       unid: 'un', c1: 2840,  pvp: 58  },
  { id: 'silicone',   nome: 'Silicone',               unid: 'un', c1: 1000,  pvp: 18  },
];

// ── Base de dados completa ────────────────────────
export const TAMPOS_DB = {
  Granito: {
    cor: '#7A7070', acabamentos: ACB_GRANITO,
    espessuras: ['2cm', '3cm'],
    artigos: [
      { nome: 'Verde Lavrador',   c1: { '2cm': 27022, '3cm': 29444 }, pvp: { '2cm': 475, '3cm': 517 } },
      { nome: 'Negro Zimbabwe',   c1: { '2cm': 26656, '3cm': 29912 }, pvp: { '2cm': 468, '3cm': 526 } },
      { nome: 'Azul Lavrador',    c1: { '2cm': 24132, '3cm': 30889 }, pvp: { '2cm': 424, '3cm': 543 } },
      { nome: 'Shivakashy',       c1: { '2cm': 21599, '3cm': 28679 }, pvp: { '2cm': 380, '3cm': 504 } },
      { nome: 'Patas de Gato',    c1: { '2cm': 19261, '3cm': 25041 }, pvp: { '2cm': 338, '3cm': 440 } },
      { nome: 'Negro Angola',     c1: { '2cm': 16218, '3cm': 19975 }, pvp: { '2cm': 285, '3cm': 351 } },
      { nome: 'Negro Impala',     c1: { '2cm': 14476, '3cm': 20579 }, pvp: { '2cm': 254, '3cm': 362 } },
      { nome: 'Amarelo Figueira', c1: { '2cm': 11407, '3cm': 12365 }, pvp: { '2cm': 200, '3cm': 217 } },
      { nome: 'Amarelo Macieira', c1: { '2cm': 10651, '3cm': 11713 }, pvp: { '2cm': 187, '3cm': 206 } },
      { nome: 'Amarelo Vimieiro', c1: { '2cm': 12551, '3cm': 13613 }, pvp: { '2cm': 221, '3cm': 239 } },
      { nome: 'Branco Coral',     c1: { '2cm': 10651, '3cm': 11713 }, pvp: { '2cm': 187, '3cm': 206 } },
      { nome: 'Cinza Évora',      c1: { '2cm': 14551, '3cm': 15613 }, pvp: { '2cm': 256, '3cm': 274 } },
      { nome: 'Pedras Salgadas',  c1: { '2cm': 12551, '3cm': 13613 }, pvp: { '2cm': 221, '3cm': 239 } },
      { nome: 'Cinza Penalva',    c1: { '2cm': 8874,  '3cm': 10999 }, pvp: { '2cm': 156, '3cm': 193 } },
      { nome: 'Cinza Antas',      c1: { '2cm': 8874,  '3cm': 10999 }, pvp: { '2cm': 156, '3cm': 193 } },
      { nome: 'Cinza Pinhel',     c1: { '2cm': 8874,  '3cm': 10617 }, pvp: { '2cm': 156, '3cm': 187 } },
      { nome: 'Rosa Porrinho',    c1: { '2cm': 8874,  '3cm': 10141 }, pvp: { '2cm': 156, '3cm': 178 } },
      { nome: 'Rosa Monção',      c1: { '2cm': 8874,  '3cm': 10141 }, pvp: { '2cm': 156, '3cm': 178 } },
      { nome: 'Negro Galáxia',    c1: { '2cm': null,  '3cm': null  }, pvp: { '2cm': null,'3cm': null }, consulta: true },
    ],
  },
  Silestone: {
    cor: '#4A5A9A', acabamentos: ACB_SILESTONE,
    espessuras: ['2cm', '1.2cm'],
    grupos: ['P', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'XM'],
    artigos: [
      { grupo: 'P',  nome: 'Linen Cream',       c1: { '2cm': 20272, '1.2cm': 17872 }, pvp: { '2cm': 356, '1.2cm': 314 } },
      { grupo: 'P',  nome: 'Motion Grey',        c1: { '2cm': 20272, '1.2cm': 17872 }, pvp: { '2cm': 356, '1.2cm': 314 } },
      { grupo: 'P',  nome: 'Miami White',        c1: { '2cm': 20272, '1.2cm': 17872 }, pvp: { '2cm': 356, '1.2cm': 314 } },
      { grupo: 'P',  nome: 'Lime Delight',       c1: { '2cm': 20272, '1.2cm': 17872 }, pvp: { '2cm': 356, '1.2cm': 314 } },
      { grupo: 'P',  nome: 'Persian White',      c1: { '2cm': 20272, '1.2cm': 17872 }, pvp: { '2cm': 356, '1.2cm': 314 } },
      { grupo: 'P',  nome: 'Siberian',           c1: { '2cm': 20272, '1.2cm': 17872 }, pvp: { '2cm': 356, '1.2cm': 314 } },
      { grupo: 'P',  nome: 'Lagoon',             c1: { '2cm': 20272, '1.2cm': 17872 }, pvp: { '2cm': 356, '1.2cm': 314 } },
      { grupo: 'P',  nome: 'Concrete Pulse',     c1: { '2cm': 20272, '1.2cm': 17872 }, pvp: { '2cm': 356, '1.2cm': 314 } },
      { grupo: 'P',  nome: 'Coral Clay',         c1: { '2cm': 20272, '1.2cm': 17872 }, pvp: { '2cm': 356, '1.2cm': 314 } },
      { grupo: 'P',  nome: 'Negro Tebas',        c1: { '2cm': 20272, '1.2cm': 17872 }, pvp: { '2cm': 356, '1.2cm': 314 } },
      { grupo: 'G1', nome: 'Blanco Maple 14',    c1: { '2cm': 23064, '1.2cm': null  }, pvp: { '2cm': 405, '1.2cm': null } },
      { grupo: 'G1', nome: 'Blanco Norte 14',    c1: { '2cm': 23064, '1.2cm': null  }, pvp: { '2cm': 405, '1.2cm': null } },
      { grupo: 'G1', nome: 'Linen Cream G1',     c1: { '2cm': 23064, '1.2cm': null  }, pvp: { '2cm': 405, '1.2cm': null } },
      { grupo: 'G1', nome: 'White Storm 14',     c1: { '2cm': 23064, '1.2cm': null  }, pvp: { '2cm': 405, '1.2cm': null } },
      { grupo: 'G1', nome: 'Motion Grey G1',     c1: { '2cm': 23064, '1.2cm': null  }, pvp: { '2cm': 405, '1.2cm': null } },
      { grupo: 'G1', nome: 'Rougui',             c1: { '2cm': 23064, '1.2cm': null  }, pvp: { '2cm': 405, '1.2cm': null } },
      { grupo: 'G1', nome: 'Gris Expo',          c1: { '2cm': 23064, '1.2cm': null  }, pvp: { '2cm': 405, '1.2cm': null } },
      { grupo: 'G1', nome: 'Marengo',            c1: { '2cm': 23064, '1.2cm': null  }, pvp: { '2cm': 405, '1.2cm': null } },
      { grupo: 'G2', nome: 'Miami White 17',     c1: { '2cm': 26784, '1.2cm': null  }, pvp: { '2cm': 471, '1.2cm': null } },
      { grupo: 'G2', nome: 'Lime Delight G2',    c1: { '2cm': 26784, '1.2cm': null  }, pvp: { '2cm': 471, '1.2cm': null } },
      { grupo: 'G2', nome: 'Persian White G2',   c1: { '2cm': 26784, '1.2cm': null  }, pvp: { '2cm': 471, '1.2cm': null } },
      { grupo: 'G2', nome: 'Siberian G2',        c1: { '2cm': 26784, '1.2cm': null  }, pvp: { '2cm': 471, '1.2cm': null } },
      { grupo: 'G2', nome: 'Lagoon G2',          c1: { '2cm': 26784, '1.2cm': null  }, pvp: { '2cm': 471, '1.2cm': null } },
      { grupo: 'G2', nome: 'Concrete Pulse G2',  c1: { '2cm': 26784, '1.2cm': null  }, pvp: { '2cm': 471, '1.2cm': null } },
      { grupo: 'G2', nome: 'Coral Clay Colour',  c1: { '2cm': 26784, '1.2cm': null  }, pvp: { '2cm': 471, '1.2cm': null } },
      { grupo: 'G2', nome: 'Brass Relish',       c1: { '2cm': 26784, '1.2cm': null  }, pvp: { '2cm': 471, '1.2cm': null } },
      { grupo: 'G2', nome: 'Cinder Craze',       c1: { '2cm': 26784, '1.2cm': null  }, pvp: { '2cm': 471, '1.2cm': null } },
      { grupo: 'G2', nome: 'Night Tebas',        c1: { '2cm': 26784, '1.2cm': null  }, pvp: { '2cm': 471, '1.2cm': null } },
      { grupo: 'G3', nome: 'Miami Vena',         c1: { '2cm': 29672, '1.2cm': null  }, pvp: { '2cm': 521, '1.2cm': null } },
      { grupo: 'G3', nome: 'Bronze Rivers',      c1: { '2cm': 29672, '1.2cm': null  }, pvp: { '2cm': 521, '1.2cm': null } },
      { grupo: 'G3', nome: 'Snowy Ibiza',        c1: { '2cm': 29672, '1.2cm': null  }, pvp: { '2cm': 521, '1.2cm': null } },
      { grupo: 'G3', nome: 'Desert Silver',      c1: { '2cm': 29672, '1.2cm': null  }, pvp: { '2cm': 521, '1.2cm': null } },
      { grupo: 'G3', nome: 'Et. Marfil',         c1: { '2cm': 29672, '1.2cm': null  }, pvp: { '2cm': 521, '1.2cm': null } },
      { grupo: 'G3', nome: 'Charcoal Soapstone', c1: { '2cm': 29672, '1.2cm': null  }, pvp: { '2cm': 521, '1.2cm': null } },
      { grupo: 'G3', nome: 'Calacatta Tova',     c1: { '2cm': 29672, '1.2cm': null  }, pvp: { '2cm': 521, '1.2cm': null } },
      { grupo: 'G4', nome: 'Blanco Zeus',        c1: { '2cm': 40600, '1.2cm': null  }, pvp: { '2cm': 713, '1.2cm': null } },
      { grupo: 'G4', nome: 'XM Nolita 23',       c1: { '2cm': 40600, '1.2cm': null  }, pvp: { '2cm': 713, '1.2cm': null } },
      { grupo: 'G4', nome: 'Et. Statuario',      c1: { '2cm': 40600, '1.2cm': null  }, pvp: { '2cm': 713, '1.2cm': null } },
      { grupo: 'G4', nome: 'XM Raw A',           c1: { '2cm': 40600, '1.2cm': null  }, pvp: { '2cm': 713, '1.2cm': null } },
      { grupo: 'G4', nome: 'Pearl Jasmine',      c1: { '2cm': 40600, '1.2cm': null  }, pvp: { '2cm': 713, '1.2cm': null } },
      { grupo: 'G4', nome: 'XM Poblenou',        c1: { '2cm': 40600, '1.2cm': null  }, pvp: { '2cm': 713, '1.2cm': null } },
      { grupo: 'G4', nome: 'XM Ffrom 01',        c1: { '2cm': 40600, '1.2cm': null  }, pvp: { '2cm': 713, '1.2cm': null } },
      { grupo: 'G4', nome: 'XM Raw G',           c1: { '2cm': 40600, '1.2cm': null  }, pvp: { '2cm': 713, '1.2cm': null } },
      { grupo: 'G4', nome: 'XM Ffrom 02',        c1: { '2cm': 40600, '1.2cm': null  }, pvp: { '2cm': 713, '1.2cm': null } },
      { grupo: 'G4', nome: 'XM Ffrom 03',        c1: { '2cm': 40600, '1.2cm': null  }, pvp: { '2cm': 713, '1.2cm': null } },
      { grupo: 'G4', nome: 'XM Raw D',           c1: { '2cm': 40600, '1.2cm': null  }, pvp: { '2cm': 713, '1.2cm': null } },
      { grupo: 'G5', nome: 'Et. Marquina',       c1: { '2cm': 46808, '1.2cm': null  }, pvp: { '2cm': 822, '1.2cm': null } },
      { grupo: 'G6', nome: 'Et Calacatta Gold',  c1: { '2cm': 54272, '1.2cm': null  }, pvp: { '2cm': 954, '1.2cm': null } },
      { grupo: 'G6', nome: 'Ethereal Noctis',    c1: { '2cm': 54272, '1.2cm': null  }, pvp: { '2cm': 954, '1.2cm': null } },
      { grupo: 'G6', nome: 'Ethereal Glow',      c1: { '2cm': 54272, '1.2cm': null  }, pvp: { '2cm': 954, '1.2cm': null } },
      { grupo: 'XM', nome: 'XM Blanc Élisée',    c1: { '2cm': 63912, '1.2cm': null  }, pvp: { '2cm': 1123,'1.2cm': null } },
      { grupo: 'XM', nome: 'XM Rivière Rose',    c1: { '2cm': 63912, '1.2cm': null  }, pvp: { '2cm': 1123,'1.2cm': null } },
      { grupo: 'XM', nome: 'Versailles Ivory',   c1: { '2cm': 63912, '1.2cm': null  }, pvp: { '2cm': 1123,'1.2cm': null } },
      { grupo: 'XM', nome: 'Eclectic Pearl',     c1: { '2cm': 63912, '1.2cm': null  }, pvp: { '2cm': 1123,'1.2cm': null } },
      { grupo: 'XM', nome: 'Victorian Silver',   c1: { '2cm': 63912, '1.2cm': null  }, pvp: { '2cm': 1123,'1.2cm': null } },
      { grupo: 'XM', nome: 'XM Jardín Esmeralda',c1: { '2cm': 63912, '1.2cm': null  }, pvp: { '2cm': 1123,'1.2cm': null } },
      { grupo: 'XM', nome: 'XM Parisien Bleu',   c1: { '2cm': 63912, '1.2cm': null  }, pvp: { '2cm': 1123,'1.2cm': null } },
      { grupo: 'XM', nome: 'Romantic Ash',       c1: { '2cm': 63912, '1.2cm': null  }, pvp: { '2cm': 1123,'1.2cm': null } },
    ],
  },
  Compac: {
    cor: '#4A7A6A', acabamentos: ACB_COMPAC,
    espessuras: ['2cm'],
    artigos: [
      { grupo: 'G1', nome: 'Glaciar',    c1: { '2cm': 20856 }, pvp: { '2cm': 366 } },
      { grupo: 'G1', nome: 'Luna',       c1: { '2cm': 20856 }, pvp: { '2cm': 366 } },
      { grupo: 'G1', nome: 'Alaska',     c1: { '2cm': 20856 }, pvp: { '2cm': 366 } },
      { grupo: 'G1', nome: 'Arena',      c1: { '2cm': 20856 }, pvp: { '2cm': 366 } },
      { grupo: 'G1', nome: 'Ceniza',     c1: { '2cm': 20856 }, pvp: { '2cm': 366 } },
      { grupo: 'G1', nome: 'Plomo',      c1: { '2cm': 20856 }, pvp: { '2cm': 366 } },
      { grupo: 'G1', nome: 'Nocturno',   c1: { '2cm': 20856 }, pvp: { '2cm': 366 } },
      { grupo: 'G2', nome: 'Snow',       c1: { '2cm': 24512 }, pvp: { '2cm': 431 } },
      { grupo: 'G2', nome: 'Moon',       c1: { '2cm': 24512 }, pvp: { '2cm': 431 } },
      { grupo: 'G2', nome: 'Smoke Grey', c1: { '2cm': 24512 }, pvp: { '2cm': 431 } },
    ],
  },
  Dekton: {
    cor: '#2A2A3A', acabamentos: ACB_DEKTON,
    espessuras: ['2cm', '1.2cm'],
    grupos: ['P', 'G0', 'G1', 'G2', 'G3'],
    artigos: [
      { grupo: 'P',  nome: 'Keena',         c1: { '2cm': 26584, '1.2cm': 21952 }, pvp: { '2cm': 467, '1.2cm': 386 } },
      { grupo: 'P',  nome: 'Marina',        c1: { '2cm': 26584, '1.2cm': 21952 }, pvp: { '2cm': 467, '1.2cm': 386 } },
      { grupo: 'P',  nome: 'Thala',         c1: { '2cm': 26584, '1.2cm': 21952 }, pvp: { '2cm': 467, '1.2cm': 386 } },
      { grupo: 'P',  nome: 'Evok',          c1: { '2cm': 26584, '1.2cm': 21952 }, pvp: { '2cm': 467, '1.2cm': 386 } },
      { grupo: 'P',  nome: 'Nacre',         c1: { '2cm': 26584, '1.2cm': 21952 }, pvp: { '2cm': 467, '1.2cm': 386 } },
      { grupo: 'P',  nome: 'Argentium',     c1: { '2cm': 26584, '1.2cm': 21952 }, pvp: { '2cm': 467, '1.2cm': 386 } },
      { grupo: 'P',  nome: 'Kelya',         c1: { '2cm': 26584, '1.2cm': 21952 }, pvp: { '2cm': 467, '1.2cm': 386 } },
      { grupo: 'P',  nome: 'Entzo',         c1: { '2cm': 28928, '1.2cm': 23832 }, pvp: { '2cm': 508, '1.2cm': 419 } },
      { grupo: 'G0', nome: 'Kairos 22 KC',  c1: { '2cm': 30320, '1.2cm': 25792 }, pvp: { '2cm': 533, '1.2cm': 453 } },
      { grupo: 'G0', nome: 'Monné KC',      c1: { '2cm': 30320, '1.2cm': 25792 }, pvp: { '2cm': 533, '1.2cm': 453 } },
      { grupo: 'G0', nome: 'Lunar 22 KC',   c1: { '2cm': 30320, '1.2cm': 25792 }, pvp: { '2cm': 533, '1.2cm': 453 } },
      { grupo: 'G0', nome: 'Aeris KC',      c1: { '2cm': 30320, '1.2cm': 25792 }, pvp: { '2cm': 533, '1.2cm': 453 } },
      { grupo: 'G0', nome: 'Danae KC',      c1: { '2cm': 30320, '1.2cm': 25792 }, pvp: { '2cm': 533, '1.2cm': 453 } },
      { grupo: 'G0', nome: 'Dunna KC',      c1: { '2cm': 30320, '1.2cm': 25792 }, pvp: { '2cm': 533, '1.2cm': 453 } },
      { grupo: 'G0', nome: 'Kovik',         c1: { '2cm': 30320, '1.2cm': 25792 }, pvp: { '2cm': 533, '1.2cm': 453 } },
      { grupo: 'G0', nome: 'Keon',          c1: { '2cm': 30320, '1.2cm': 25792 }, pvp: { '2cm': 533, '1.2cm': 453 } },
      { grupo: 'G0', nome: 'Trilium',       c1: { '2cm': 30320, '1.2cm': 25792 }, pvp: { '2cm': 533, '1.2cm': 453 } },
      { grupo: 'G0', nome: 'Eter',          c1: { '2cm': 30320, '1.2cm': 25792 }, pvp: { '2cm': 533, '1.2cm': 453 } },
      { grupo: 'G0', nome: 'Keena G0',      c1: { '2cm': 30320, '1.2cm': 25792 }, pvp: { '2cm': 533, '1.2cm': 453 } },
      { grupo: 'G0', nome: 'Thala G0',      c1: { '2cm': 30320, '1.2cm': 25792 }, pvp: { '2cm': 533, '1.2cm': 453 } },
      { grupo: 'G0', nome: 'Evok G0',       c1: { '2cm': 30320, '1.2cm': 25792 }, pvp: { '2cm': 533, '1.2cm': 453 } },
      { grupo: 'G1', nome: 'Halo KC',       c1: { '2cm': 44112, '1.2cm': 37912 }, pvp: { '2cm': 775, '1.2cm': 666 } },
      { grupo: 'G1', nome: 'Nacre KC',      c1: { '2cm': 44112, '1.2cm': 37912 }, pvp: { '2cm': 775, '1.2cm': 666 } },
      { grupo: 'G1', nome: 'Sirius25',      c1: { '2cm': 44112, '1.2cm': 37912 }, pvp: { '2cm': 775, '1.2cm': 666 } },
      { grupo: 'G1', nome: 'Kreta',         c1: { '2cm': 44112, '1.2cm': 37912 }, pvp: { '2cm': 775, '1.2cm': 666 } },
      { grupo: 'G1', nome: 'Kira',          c1: { '2cm': 44112, '1.2cm': 37912 }, pvp: { '2cm': 775, '1.2cm': 666 } },
      { grupo: 'G1', nome: 'Bromo',         c1: { '2cm': 44112, '1.2cm': 37912 }, pvp: { '2cm': 775, '1.2cm': 666 } },
      { grupo: 'G2', nome: 'Aura 22 KC',    c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G2', nome: 'Zenith KC',     c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G2', nome: 'Polar KC',      c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G2', nome: 'Marina KC',     c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G2', nome: 'Sandik KC',     c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G2', nome: 'Albarium 22 KC',c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G2', nome: 'Argentium KC',  c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G2', nome: 'Nebbia KC',     c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G2', nome: 'Trevi KC',      c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G2', nome: 'Marmorio KC',   c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G2', nome: 'Sabbia KC',     c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G2', nome: 'Ava KC',        c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G2', nome: 'Avorio KC',     c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G2', nome: 'Adia KC',       c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G2', nome: 'Umber',         c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G2', nome: 'Nebu KC',       c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G2', nome: 'Grigio KC',     c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G2', nome: 'Soke',          c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G2', nome: 'Ceppo KC',      c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G2', nome: 'Grafite',       c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G2', nome: 'Laos',          c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G2', nome: 'Kelya G2',      c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G2', nome: 'Domoos 25',     c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G2', nome: 'Kedar',         c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G2', nome: 'Zira',          c1: { '2cm': 52048, '1.2cm': 44304 }, pvp: { '2cm': 915, '1.2cm': 778 } },
      { grupo: 'G3', nome: 'Uyuni KC',      c1: { '2cm': 60272, '1.2cm': 48218 }, pvp: { '2cm': 1324,'1.2cm': 847  } },
      { grupo: 'G3', nome: 'Neural KC',     c1: { '2cm': 60272, '1.2cm': 48218 }, pvp: { '2cm': 1324,'1.2cm': 847  } },
      { grupo: 'G3', nome: 'Rem KC',        c1: { '2cm': 60272, '1.2cm': 48218 }, pvp: { '2cm': 1324,'1.2cm': 847  } },
      { grupo: 'G3', nome: 'Nara',          c1: { '2cm': 60272, '1.2cm': 48218 }, pvp: { '2cm': 1324,'1.2cm': 847  } },
      { grupo: 'G3', nome: 'Natura 22 KC',  c1: { '2cm': 60272, '1.2cm': 48218 }, pvp: { '2cm': 1324,'1.2cm': 847  } },
      { grupo: 'G3', nome: 'Vigil KC',      c1: { '2cm': 60272, '1.2cm': 48218 }, pvp: { '2cm': 1324,'1.2cm': 847  } },
    ],
  },
};

// ════════════════════════════════════════════════
// ESTADO DO MÓDULO
// ════════════════════════════════════════════════
let TS = {
  tab:           'catalogo',    // 'catalogo' | 'calculadora' | 'comparador'
  material:      'Silestone',
  grupoFiltro:   '',
  pesquisa:      '',
  pvpMin:        null,
  pvpMax:        null,
  vistaGlobal:   false,   // todos os materiais numa vista
  ordenacao:     'nome',  // 'nome' | 'pvp_asc' | 'pvp_desc'
  margemPadrao:  0.25,    // carregada do Firebase ao iniciar
  // Calculadora
  calc: {
    material:    'Silestone',
    artigo:      null,          // artigo seleccionado
    espessura:   '2cm',
    espRev:      '1.2cm',       // espessura do revestimento
    desconto:    10,            // % desconto (default 10%)
    pecas:       [],            // [{id, comp, larg}]
    revestimento:[],            // [{id, comp, larg}]
    acabamentos: {},            // {rodatampo: 0, cortebruto: 0, ...}
    transporte:  null,          // índice do TRANSPORTE
  },
  // Comparador
  comp: {
    lado: {
      A: { material: 'Silestone', artigo: null, espessura: '2cm' },
      B: { material: 'Dekton',    artigo: null, espessura: '2cm' },
    },
    pecas:       [{ id: 'comp-p1', comp: '', larg: '0.65' }],
    revestimento:[],
    acabamentos: {},
    transporte:  null,
  },
};

// ════════════════════════════════════════════════
// UTILS
// ════════════════════════════════════════════════
function fmtC1(c1cents) {
  if (!c1cents) return '—';
  return String(Math.round(c1cents)); // formato código — não revela margem
}
function fmtPVP(pvp) {
  if (!pvp) return '—';
  return pvp.toLocaleString('pt-PT', { minimumFractionDigits: 2 }) + ' €';
}
function fmtM2(m2) {
  return m2.toFixed(4) + ' m²';
}
function gerarIdPeca() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}
function copiar(txt, btn) {
  navigator.clipboard.writeText(txt).then(() => {
    toast('✓ Copiado: ' + txt);
    if (btn) { const o = btn.textContent; btn.textContent = '✓'; setTimeout(() => btn.textContent = o, 1400); }
  });
}

// ════════════════════════════════════════════════
// PERSISTÊNCIA DO CÁLCULO
// ════════════════════════════════════════════════
const TAMPO_SESSION_KEY = 'wk_tampos_calc';
const TAMPO_DOC_CALC    = 'tampos_calc';

export async function tampoCarregarCalc() {
  // 1. Tentar Firestore (persistência permanente)
  const db = getDb();
  if (db) {
    try {
      const snap = await getDoc(doc(db, 'wk_estado', TAMPO_DOC_CALC));
      if (snap.exists()) {
        const d = snap.data();
        if (d.calc) Object.assign(TS.calc, d.calc);
        if (d.tab)  TS.tab = d.tab;
        return;
      }
    } catch(e) { console.warn('Tampos: Firebase indisponível, a usar sessionStorage', e); }
  }
  // 2. Fallback sessionStorage
  try {
    const raw = sessionStorage.getItem(TAMPO_SESSION_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d.calc) Object.assign(TS.calc, d.calc);
      if (d.tab)  TS.tab = d.tab;
    }
  } catch(e) { console.warn('Tampos: erro ao carregar calc local', e); }
}

async function tampoGuardarCalc() {
  const payload = { calc: TS.calc, tab: TS.tab };
  // Guardar no Firestore
  const db = getDb();
  if (db) {
    try {
      await setDoc(doc(db, 'wk_estado', TAMPO_DOC_CALC), { ...payload, ts: Date.now() });
      setSyncOk();
    } catch(e) { console.warn('Tampos: erro ao guardar no Firebase', e); }
  }
  // Sempre guardar localmente como backup
  try {
    sessionStorage.setItem(TAMPO_SESSION_KEY, JSON.stringify(payload));
  } catch(e) { /* ignorar */ }
}

// ════════════════════════════════════════════════
// INIT PRINCIPAL
// ════════════════════════════════════════════════
export async function tampoInit() {
  await tampoCarregarOverrides();
  renderTampoHeader();
  renderTampoTabs();
  switchTampoTab(TS.tab);
}

async function tampoCarregarOverrides() {
  const db = getDb();
  if (!db) return;

  // Carregar margem configurada
  try {
    const { getDoc: _getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
    const mSnap = await _getDoc(doc(db, 'wk_configuracoes', 'margem'));
    if (mSnap.exists()) {
      const m = mSnap.data().valor;
      if (m > 0 && m < 1) TS.margemPadrao = m;
    }
  } catch(e) { /* silencioso — usa default 0.25 */ }

  try {
    const snap = await getDocs(collection(db, 'wk_tampos_overrides'));
    snap.forEach(d => {
      const data = d.data();
      const mat  = TAMPOS_DB[data.material];
      if (!mat) return;
      // Encontrar artigo pelo índice ou pelo nome
      let artigo = mat.artigos[data.idx];
      if (!artigo || artigo.nome !== data.nome) {
        artigo = mat.artigos.find(a => a.nome === data.nome);
      }
      if (!artigo) return;
      // Aplicar override
      artigo.nome     = data.nome;
      artigo.grupo    = data.grupo;
      artigo.consulta = data.consulta;
      if (data.c1)  artigo.c1  = { ...artigo.c1,  ...data.c1  };
      if (data.pvp) artigo.pvp = { ...artigo.pvp, ...data.pvp };
    });
    console.log('Tampos: overrides carregados do Firebase');
  } catch(e) { console.warn('Tampos: erro ao carregar overrides:', e); }
}

function renderTampoHeader() {
  const ct = document.getElementById('tampo-header');
  if (!ct) return;
  ct.innerHTML = `
    <div class="tampo-header-wrap">
      <!-- Título + sub -->
      <div class="tampo-header-titulo-blk">
        <div class="page-titulo">Tampos & Pedra</div>
        <div class="page-sub">Catálogo Anigraco · Calculadora · Comparador</div>
      </div>
      <!-- Linha de acções -->
      <div class="tampo-header-acoes">
        <!-- Badge Anigraco compacto -->
        <div class="tampo-anigraco-badge">
          <span style="font-size:9px;color:var(--t4);font-weight:700;text-transform:uppercase;letter-spacing:.08em">Forn.</span>
          <button onclick="copiar('207849',this)"
            style="font-family:var(--mono);font-size:11px;font-weight:700;padding:2px 8px;border-radius:5px;
            background:rgba(196,97,42,.12);border:1px solid rgba(196,97,42,.25);color:rgba(255,190,152,.7);
            cursor:pointer;transition:all .15s" title="Copiar cód. fornecedor LM">207849</button>
          <span style="width:1px;height:12px;background:rgba(255,255,255,.1);flex-shrink:0"></span>
          <button onclick="copiar('COD 48 SILES',this)"
            style="font-family:var(--mono);font-size:10px;font-weight:700;padding:2px 8px;border-radius:5px;
            background:rgba(42,107,122,.12);border:1px solid rgba(42,107,122,.3);color:rgba(150,220,230,.7);
            cursor:pointer;transition:all .15s" title="Acesso à tabela Anigraco">COD 48 SILES</button>
        </div>
        <!-- Tabs -->
        <div class="tampo-tabs-row">
          ${['catalogo','calculadora','comparador'].map(t => `
            <button onclick="window.switchTampoTab('${t}')" id="tampo-tab-${t}"
              class="btn-sec ${TS.tab === t ? 'active' : ''}">
              ${{ catalogo:'📋 Catálogo', calculadora:'🧮 Calc.', comparador:'⚖️ Comparar' }[t]}
            </button>`).join('')}
        </div>
      </div>
    </div>`;
  window.copiar = copiar;
}

function renderTampoTabs() {
  // Garante que os contentores existem
  ['catalogo','calculadora','comparador'].forEach(t => {
    let el = document.getElementById('tampo-ct-' + t);
    if (!el) {
      el = document.createElement('div');
      el.id = 'tampo-ct-' + t;
      el.style.display = 'none';
      document.getElementById('tampo-body')?.appendChild(el);
    }
  });
}

export function switchTampoTab(tab) {
  TS.tab = tab;
  ['catalogo','calculadora','comparador'].forEach(t => {
    const el = document.getElementById('tampo-ct-' + t);
    if (el) el.style.display = t === tab ? '' : 'none';
    const btn = document.getElementById('tampo-tab-' + t);
    if (btn) { btn.classList.toggle('active', t === tab); }
  });
  if (tab === 'catalogo')    renderCatalogo();
  if (tab === 'calculadora') renderCalculadora();
  if (tab === 'comparador')  renderComparador();
}

// ════════════════════════════════════════════════
// CATÁLOGO
// ════════════════════════════════════════════════
function renderCatalogo() {
  const ct = document.getElementById('tampo-ct-catalogo'); if (!ct) return;

  const materiais = Object.keys(TAMPOS_DB);
  const mat    = TAMPOS_DB[TS.material];
  const grupos = mat.grupos || [];

  const ddStyle = `padding:8px 12px;border-radius:9px;background:rgba(255,255,255,.05);
    border:1px solid rgba(255,255,255,.1);color:var(--t2);font-family:var(--sans);
    font-size:12px;font-weight:500;cursor:pointer;outline:none;transition:border-color .15s;
    appearance:none;-webkit-appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,.25)'/%3E%3C/svg%3E");
    background-repeat:no-repeat;background-position:right 10px center;padding-right:28px;`;

  ct.innerHTML = `
    <!-- Linha de filtros: Material · Grupo · Ordenar · Vista · Pesquisa -->
    <div class="tampo-filtros-row">

      <!-- Material -->
      <select id="tampo-sel-material" onchange="window.tampoSelectMaterial(this.value)"
        style="${ddStyle}border-color:rgba(196,97,42,.3);min-width:130px">
        ${materiais.map(m => `<option value="${m}" ${TS.material===m?'selected':''}>${m} (${TAMPOS_DB[m].artigos.length})</option>`).join('')}
      </select>

      <!-- Grupo (só se existir) -->
      ${grupos.length ? `
        <select id="tampo-sel-grupo" onchange="window.tampoFiltroGrupo(this.value)"
          style="${ddStyle}min-width:90px;border-color:${TS.grupoFiltro?'rgba(196,97,42,.4)':'rgba(255,255,255,.1)'}">
          <option value="">Todos</option>
          ${grupos.map(g=>`<option value="${g}" ${TS.grupoFiltro===g?'selected':''}>${g}</option>`).join('')}
        </select>` : ''}

      <!-- Ordenar -->
      <select id="tampo-sel-ord" onchange="window.tampoOrdenar(this.value)"
        style="${ddStyle}min-width:100px">
        <option value="nome"     ${TS.ordenacao==='nome'    ?'selected':''}>A → Z</option>
        <option value="pvp_asc"  ${TS.ordenacao==='pvp_asc' ?'selected':''}>Preço ↑</option>
        <option value="pvp_desc" ${TS.ordenacao==='pvp_desc'?'selected':''}>Preço ↓</option>
      </select>

      <!-- Vista global toggle -->
      <button onclick="window.tampoToggleGlobal()"
        style="padding:8px 12px;border-radius:9px;font-family:var(--sans);font-size:11px;font-weight:600;
        cursor:pointer;white-space:nowrap;transition:all .15s;
        ${TS.vistaGlobal
          ? 'background:rgba(196,97,42,.15);border:1px solid rgba(196,97,42,.35);color:rgba(255,190,152,.8)'
          : 'background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:var(--t3)'}">
        🌐 Todos
      </button>

      <!-- Pesquisa -->
      <div class="search-wrap" style="flex:1;min-width:140px;position:relative">
        <span class="search-icon">⌕</span>
        <input type="text" id="tampo-pesquisa-input" class="search-input"
          placeholder="Pesquisar cor…"
          value="${TS.pesquisa}"
          oninput="window.tampoPesquisar(this.value)"
          onkeydown="if(event.key==='Escape'){window.tampoClearPesquisa();this.blur()}"
          style="padding-right:28px">
        <button onclick="window.tampoClearPesquisa()"
          style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;
          color:${TS.pesquisa?'var(--t2)':'var(--t4)'};font-size:15px;cursor:pointer;padding:2px 4px">×</button>
      </div>
    </div>

    <!-- Calculadora C1→PVP — discreta -->
    <div style="margin-bottom:12px">
      <button onclick="window.toggleCalcRapida()"
        style="display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:7px;background:transparent;
        border:1px solid rgba(196,97,42,.2);color:rgba(196,97,42,.6);font-family:var(--sans);font-size:11px;
        font-weight:600;cursor:pointer;transition:all .15s" id="btn-calc-rapida">
        ƒ C1 → PVP
      </button>
      <div id="calc-rapida-painel" style="display:none;margin-top:8px;background:rgba(196,97,42,.06);
        border:1px solid rgba(196,97,42,.15);border-radius:10px;padding:12px 14px">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <div style="display:flex;flex-direction:column;gap:3px">
            <label style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--t4)">C1</label>
            <input type="number" id="calc-c1-rapido" placeholder="ex: 44100"
              oninput="window.calcPvpRapido()"
              style="width:110px;padding:6px 10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);
              border-radius:7px;font-family:var(--mono);font-size:12px;color:var(--t1);outline:none">
          </div>
          <div style="display:flex;flex-direction:column;gap:3px">
            <label style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--t4)">Margem %</label>
            <input type="number" id="calc-margem" min="0" max="99" step="0.5"
              value="${(TS.margemPadrao * 100).toFixed(1)}"
              oninput="window.calcMargemUpdate(this.value)"
              style="width:60px;padding:6px 10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);
              border-radius:7px;font-family:var(--mono);font-size:12px;color:var(--t1);outline:none">
          </div>
          <span style="font-size:16px;color:var(--t4);padding-top:14px">=</span>
          <div style="display:flex;flex-direction:column;gap:3px">
            <label style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--t4)">PVP c/ IVA</label>
            <div style="display:flex;align-items:center;gap:6px">
              <div id="calc-pvp-resultado" style="font-family:var(--mono);font-size:16px;font-weight:700;color:rgba(255,190,152,.9);min-width:80px">—</div>
              <button onclick="window.calcPvpCopiar()" id="calc-pvp-copiar"
                style="display:none;padding:4px 9px;border-radius:6px;background:rgba(196,97,42,.15);
                border:1px solid rgba(196,97,42,.3);color:rgba(255,190,152,.7);font-size:10px;font-weight:700;cursor:pointer">⎘</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Info bar + botão novo -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:8px;flex-wrap:wrap">
      <div class="bib-info" style="margin:0" id="tampo-info-bar"></div>
      <button onclick="window.tampoNovoArtigo('${TS.material}')"
        style="padding:5px 12px;border-radius:7px;background:rgba(58,122,68,.12);border:1px solid rgba(58,122,68,.25);
        color:rgba(150,220,150,.7);font-family:var(--sans);font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap">
        + Novo artigo
      </button>
    </div>

    <!-- Grid de cards -->
    <div class="cards-grid" id="tampo-grid-cards"></div>`;

  renderCatalogGrid();
}

function ordenarArtigos(lista, pvpFn, nomeFn) {
  return [...lista].sort((a, b) => {
    if (TS.ordenacao === 'pvp_asc')  return (pvpFn(a) || 9999) - (pvpFn(b) || 9999);
    if (TS.ordenacao === 'pvp_desc') return (pvpFn(b) || 0)    - (pvpFn(a) || 0);
    return nomeFn(a).localeCompare(nomeFn(b), 'pt');
  });
}

function labelOrdenacao() {
  return { nome: 'A→Z', pvp_asc: 'preço ↑', pvp_desc: 'preço ↓' }[TS.ordenacao] || '';
}

function renderCatalogGrid() {
  const pesq = TS.pesquisa.toLowerCase().trim();
  const grid = document.getElementById('tampo-grid-cards');
  const info = document.getElementById('tampo-info-bar');
  if (!grid) return;

  if (TS.vistaGlobal) {
    // Vista global — todos os materiais juntos ordenados
    let todos = [];
    Object.entries(TAMPOS_DB).forEach(([matNome, matData]) => {
      const esp0 = matData.espessuras[0];
      matData.artigos
        .filter(a => !a.consulta && (!pesq || a.nome.toLowerCase().includes(pesq)))
        .forEach(a => todos.push({ ...a, _mat: matNome, _matData: matData, _esp: esp0 }));
    });
    todos = ordenarArtigos(todos, a => a.pvp?.[a._esp] || 0, a => a.nome);
    if (info) info.textContent = todos.length + ' artigos · todos os materiais · ' + labelOrdenacao();
    grid.innerHTML = todos.map(a => renderCardTampoGlobal(a)).join('');
  } else {
    // Vista por material
    const mat  = TAMPOS_DB[TS.material];
    const esp0 = mat.espessuras[0];
    let artigos = mat.artigos.filter(a => {
      const matchGrupo = !TS.grupoFiltro || a.grupo === TS.grupoFiltro;
      const matchPesq  = !pesq || a.nome.toLowerCase().includes(pesq);
      return matchGrupo && matchPesq && !a.consulta;
    });
    artigos = ordenarArtigos(artigos, a => a.pvp?.[esp0] || 0, a => a.nome);
    if (info) info.textContent = artigos.length + ' artigos · ' + TS.material + ' · ' + labelOrdenacao();
    grid.innerHTML = artigos.map(a => renderCardTampo(a, mat)).join('');
  }
}

function renderCardTampoGlobal(a) {
  const esp     = a._esp;
  const c1      = a.c1?.[esp];
  const pvp     = a.pvp?.[esp];
  const matNome = a._mat;
  const mat     = a._matData;
  return `
    <div class="tampo-card" style="display:flex;flex-direction:column;gap:8px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:9px;font-weight:700;padding:2px 8px;border-radius:99px;
          background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:var(--t3)">
          ${matNome}${a.grupo ? ' · ' + a.grupo : ''}
        </span>
        ${mat.espessuras.length > 1 ? `<span style="font-size:9px;color:var(--t4)">${esp}</span>` : ''}
      </div>
      <div style="font-size:14px;font-weight:600;color:var(--t1);line-height:1.2">${a.nome}</div>
      <div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px">
        <button onclick="window.copiar('${c1}',this)"
          data-c1btn data-val="${c1}"
          style="display:flex;flex-direction:column;align-items:flex-start;background:rgba(196,97,42,.08);border:1px solid rgba(196,97,42,.2);border-radius:7px;padding:5px 9px;cursor:pointer;transition:all .15s;min-width:0"
          title="Clica para copiar C1">
          <span style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(196,97,42,.6)">C1 ⎘</span>
          <span data-c1val style="font-family:var(--mono);font-size:13px;font-weight:700;color:rgba(255,190,152,.8)">${fmtC1(c1)}</span>
        </button>
        <div style="text-align:right">
          <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--t4)">PVP / m²</div>
          <div data-pvpval style="font-family:var(--mono);font-size:15px;font-weight:600;color:var(--t1)">${fmtPVP(pvp)}</div>
        </div>
      </div>
      <div style="display:flex;gap:5px;margin-top:2px">
        <button onclick="window.tampoAbrirCalc('${a.nome}','${matNome}')"
          style="flex:1;padding:6px 8px;border-radius:7px;background:rgba(196,97,42,.1);border:1px solid rgba(196,97,42,.2);color:rgba(255,190,152,.7);font-size:10px;font-weight:700;cursor:pointer">
          🧮 Calcular
        </button>
        <button onclick="window.tampoAbrirComp('${a.nome}','${matNome}')"
          style="flex:1;padding:6px 8px;border-radius:7px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:var(--t3);font-size:10px;font-weight:700;cursor:pointer">
          ⚖️ Comparar
        </button>
        <button onclick="window.tampoEditar('${a.nome}','${matNome}')"
          style="padding:6px 9px;border-radius:7px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);color:var(--t4);font-size:10px;cursor:pointer"
          title="Editar">✏️</button>
      </div>
    </div>`;
}

function renderCardTampo(a, mat) {
  const esp = mat.espessuras[0]; // espessura default
  const c1  = a.c1?.[esp];
  const pvp = a.pvp?.[esp];
  const consulta = a.consulta;

  const espBtns = mat.espessuras.map(e => `
    <button onclick="window.tampoVerC1('${a.nome}','${e}',this)"
      style="padding:2px 7px;border-radius:4px;font-size:9px;font-weight:700;cursor:pointer;transition:all .15s;
      background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:var(--t4)">
      ${e}
    </button>`).join('');

  return `
    <div class="tampo-card" style="display:flex;flex-direction:column;gap:8px">
      <!-- Topo: grupo + espessuras -->
      <div style="display:flex;align-items:center;justify-content:space-between">
        ${a.grupo ? `<span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--t4)">${a.grupo}</span>` : '<span></span>'}
        <div style="display:flex;gap:3px">${espBtns}</div>
      </div>

      <!-- Nome -->
      <div style="font-size:14px;font-weight:600;color:var(--t1);line-height:1.2">${a.nome}</div>

      <!-- Preços -->
      ${consulta ? `
        <div style="font-size:12px;color:rgba(196,97,42,.7);font-style:italic">Sob consulta</div>
      ` : `
        <div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px">
          <!-- C1 clicável -->
          <button data-c1btn data-val="${c1}" onclick="window.copiar('${c1}',this)"
            style="display:flex;flex-direction:column;align-items:flex-start;background:rgba(196,97,42,.08);border:1px solid rgba(196,97,42,.2);border-radius:7px;padding:5px 9px;cursor:pointer;transition:all .15s;min-width:0"
            title="Clica para copiar C1">
            <span style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(196,97,42,.6)">C1 ⎘</span>
            <span data-c1val style="font-family:var(--mono);font-size:13px;font-weight:700;color:rgba(255,190,152,.8)">${fmtC1(c1)}</span>
          </button>
          <!-- PVP -->
          <div style="text-align:right">
            <div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--t4)">PVP / m²</div>
            <div data-pvpval style="font-family:var(--mono);font-size:15px;font-weight:600;color:var(--t1)">${fmtPVP(pvp)}</div>
          </div>
        </div>
      `}

      <!-- Acções -->
      <div style="display:flex;gap:5px;margin-top:2px">
        <button onclick="window.tampoAbrirCalc('${a.nome}','${TS.material}')"
          style="flex:1;padding:6px 8px;border-radius:7px;background:rgba(196,97,42,.1);border:1px solid rgba(196,97,42,.2);color:rgba(255,190,152,.7);font-size:10px;font-weight:700;cursor:pointer;transition:all .15s">
          🧮 Calcular
        </button>
        <button onclick="window.tampoAbrirComp('${a.nome}','${TS.material}')"
          style="flex:1;padding:6px 8px;border-radius:7px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:var(--t3);font-size:10px;font-weight:700;cursor:pointer;transition:all .15s">
          ⚖️ Comparar
        </button>
        <button onclick="window.tampoEditar('${a.nome}','${TS.material}')"
          style="padding:6px 9px;border-radius:7px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);color:var(--t4);font-size:10px;cursor:pointer;transition:all .15s"
          title="Editar este artigo">✏️</button>
      </div>
    </div>`;
}

// ── Calculadora rápida C1 → PVP ─────────────────────────────────
const IVA = 1.23;
let _pvpRapidoVal = null;

window.toggleCalcRapida = function() {
  const p = document.getElementById('calc-rapida-painel');
  const b = document.getElementById('btn-calc-rapida');
  if (!p) return;
  const aberto = p.style.display !== 'none';
  p.style.display = aberto ? 'none' : '';
  if (b) b.style.color = aberto ? 'rgba(196,97,42,.6)' : 'rgba(255,190,152,.8)';
  if (!aberto) setTimeout(() => document.getElementById('calc-c1-rapido')?.focus(), 50);
};

window.calcPvpRapido = function() {
  const inp    = document.getElementById('calc-c1-rapido');
  const res    = document.getElementById('calc-pvp-resultado');
  const btn    = document.getElementById('calc-pvp-copiar');
  if (!inp || !res) return;

  const c1raw  = parseNum(inp.value);
  const margem = TS.margemPadrao;

  if (!c1raw || c1raw <= 0 || margem <= 0 || margem >= 1) {
    res.textContent = '—'; _pvpRapidoVal = null;
    if (btn) btn.style.display = 'none';
    return;
  }

  // C1 > 1000 → assume cêntimos, divide por 100
  const c1euros = c1raw > 1000 ? c1raw / 100 : c1raw;
  const pvp     = (c1euros / (1 - margem)) * IVA;
  _pvpRapidoVal = pvp;

  res.textContent = pvp.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  if (btn) btn.style.display = '';
};

window.calcMargemUpdate = async function(val) {
  const m = parseNum(val) / 100;
  if (isNaN(m) || m <= 0 || m >= 1) return;
  TS.margemPadrao = m;
  window.calcPvpRapido(); // recalcular imediatamente

  // Persistir no Firebase
  const db = getDb();
  if (db) {
    try {
      await setDoc(doc(db, 'wk_configuracoes', 'margem'), { valor: m, ts: Date.now() });
      setSyncOk();
    } catch(e) { console.warn('Erro ao guardar margem:', e); }
  }
};

window.calcPvpCopiar = function() {
  if (!_pvpRapidoVal) return;
  const txt = _pvpRapidoVal.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  navigator.clipboard.writeText(txt).then(() => toast('✓ PVP copiado: ' + txt + ' €'));
};

window.tampoSelectMaterial = function(m) {
  TS.material = m; TS.grupoFiltro = ''; TS.pesquisa = '';
  TS.pvpMin = null; TS.pvpMax = null; TS.vistaGlobal = false;
  renderCatalogo();
};
window.tampoFiltroGrupo   = function(g) { TS.grupoFiltro = g; renderCatalogGrid(); };
window.tampoPesquisar     = function(v) { TS.pesquisa = v; renderCatalogGrid(); };
window.tampoOrdenar       = function(ord) { TS.ordenacao = ord; renderCatalogo(); };
window.tampoToggleGlobal  = function() {
  TS.vistaGlobal = !TS.vistaGlobal;
  TS.grupoFiltro = '';
  renderCatalogo();
};
window.tampoClearPesquisa  = function() {
  TS.pesquisa = '';
  const inp = document.getElementById('tampo-pesquisa-input');
  if (inp) inp.value = '';
  renderCatalogGrid();
};

window.tampoVerC1 = function(nome, esp, btn) {
  const mat = TAMPOS_DB[TS.material];
  const a = mat.artigos.find(x => x.nome === nome);
  if (!a) return;
  const card = btn.closest('.tampo-card');
  if (card) {
    // Actualizar C1 — valor e onclick
    const c1btn = card.querySelector('[data-c1btn]');
    if (c1btn && a.c1[esp]) {
      c1btn.querySelector('[data-c1val]').textContent = fmtC1(a.c1[esp]);
      c1btn.setAttribute('data-val', a.c1[esp]);
      c1btn.onclick = () => copiar(String(a.c1[esp]), c1btn);
    }
    // Actualizar PVP — correcção do bug
    const pvpVal = card.querySelector('[data-pvpval]');
    if (pvpVal) pvpVal.textContent = fmtPVP(a.pvp[esp] || null);
  }
  // Highlight botão espessura activa
  btn.parentElement.querySelectorAll('button').forEach(b => {
    b.style.background = 'rgba(255,255,255,.06)';
    b.style.color = 'var(--t4)';
    b.style.borderColor = 'rgba(255,255,255,.1)';
  });
  btn.style.background = 'rgba(196,97,42,.15)';
  btn.style.color = 'rgba(255,190,152,.8)';
  btn.style.borderColor = 'rgba(196,97,42,.3)';
};

window.tampoAbrirCalc = function(nome, material) {
  const mat = TAMPOS_DB[material];
  const artigo = mat.artigos.find(a => a.nome === nome);
  TS.calc.material  = material;
  TS.calc.artigo    = artigo;
  TS.calc.espessura = mat.espessuras[0];
  tampoGuardarCalc();
  if (!TS.calc.pecas.length) {
    TS.calc.pecas = [{ id: gerarIdPeca(), comp: '', larg: '0.65' }];
  }
  TS.calc.acabamentos = {};
  switchTampoTab('calculadora');
};

window.tampoAbrirComp = function(nome, material) {
  const mat = TAMPOS_DB[material];
  const artigo = mat.artigos.find(a => a.nome === nome);
  TS.comp.lado.A.material = material;
  TS.comp.lado.A.artigo   = artigo;
  TS.comp.lado.A.espessura = mat.espessuras[0];
  if (!TS.comp.pecas.length) {
    TS.comp.pecas = [{ id: gerarIdPeca(), comp: '', larg: '0.65' }];
  }
  switchTampoTab('comparador');
};

// ════════════════════════════════════════════════
// CALCULADORA
// ════════════════════════════════════════════════
function renderCalculadora() {
  const ct = document.getElementById('tampo-ct-calculadora'); if (!ct) return;

  const materiais = Object.keys(TAMPOS_DB);
  const mat   = TAMPOS_DB[TS.calc.material];
  const acbs  = mat.acabamentos;
  const artigo = TS.calc.artigo;
  const esp   = TS.calc.espessura;

  ct.innerHTML = `
    <!-- Botão limpar tudo — topo da calculadora -->
    <div style="display:flex;justify-content:flex-end;margin-bottom:12px">
      <button onclick="window.calcLimpar()"
        style="padding:7px 14px;border-radius:8px;background:rgba(192,57,43,.1);border:1px solid rgba(192,57,43,.2);color:#ffb3a0;font-family:var(--sans);font-size:11px;font-weight:700;cursor:pointer;transition:all .15s">
        ↺ Limpar tudo
      </button>
    </div>

    <div class="tampo-calc-grid">

      <!-- COLUNA ESQUERDA — inputs -->
      <div style="display:flex;flex-direction:column;gap:14px">

        <!-- Selecção de material e artigo -->
        <div class="glass-card" style="padding:16px">
          <div class="tampo-calc-label">Material & Artigo</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;align-items:center">
            <select onchange="window.calcSelectMaterial(this.value)"
              style="padding:8px 28px 8px 12px;border-radius:9px;background:rgba(255,255,255,.05);
              border:1px solid rgba(196,97,42,.3);color:var(--t2);font-family:var(--sans);font-size:12px;
              cursor:pointer;outline:none;appearance:none;-webkit-appearance:none;
              background-image:url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\'%3E%3Cpath d=\'M0 0l5 6 5-6z\' fill=\'rgba(255,255,255,.25)\'/%3E%3C/svg%3E');
              background-repeat:no-repeat;background-position:right 10px center">
              ${materiais.map(m=>`<option value="${m}" ${TS.calc.material===m?'selected':''}>${m}</option>`).join('')}
            </select>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <select id="calc-artigo" onchange="window.calcSelectArtigo(this.value)"
              style="flex:1;min-width:180px;padding:8px 10px;background:#1C1C1F;border:1px solid var(--glass-brd);border-radius:8px;font-family:var(--sans);font-size:12px;color:var(--t1)">
              <option value="">— Seleccionar artigo —</option>
              ${mat.artigos.filter(a => !a.consulta).map(a =>
                `<option value="${a.nome}" ${artigo?.nome === a.nome ? 'selected' : ''}>${a.grupo ? '['+a.grupo+'] ' : ''}${a.nome}</option>`
              ).join('')}
            </select>
            <div style="display:flex;gap:4px">
              ${mat.espessuras.map(e => `
                <button onclick="window.calcSelectEsp('${e}')"
                  class="btn-sec ${TS.calc.espessura === e ? 'active' : ''}" style="padding:6px 12px;font-size:11px">
                  ${e}
                </button>`).join('')}
            </div>
          </div>
          ${artigo ? `
            <div style="display:flex;align-items:center;gap:10px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.07)">
              <div style="flex:1;font-size:13px;font-weight:600;color:var(--t1)">${artigo.nome}</div>
              <button onclick="window.copiar('${artigo.c1[esp]}',this)"
                style="padding:4px 10px;border-radius:6px;background:rgba(196,97,42,.1);border:1px solid rgba(196,97,42,.25);color:rgba(255,190,152,.7);font-family:var(--mono);font-size:11px;font-weight:700;cursor:pointer"
                title="Copiar C1 base">
                C1: ${fmtC1(artigo.c1[esp])} ⎘
              </button>
              <div style="font-family:var(--mono);font-size:13px;color:var(--t2)">
                PVP: ${fmtPVP(artigo.pvp[esp])}/m²
              </div>
            </div>` : ''}
        </div>

        <!-- Peças de tampo -->
        ${renderSecaoPecas('calc', 'pecas', '🪨 Tampo — Peças')}

        <!-- Revestimento -->
        <!-- Revestimento com espessura -->
      <div class="glass-card" style="padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <div class="tampo-calc-label">🧱 Revestimento — Peças</div>
          <div style="display:flex;gap:4px;align-items:center">
            <span style="font-size:9px;color:var(--t4);margin-right:2px">Espessura:</span>
            ${(TAMPOS_DB[TS.calc.material].espessuras).map(e => `
              <button onclick="window.calcSelectEspRev('${e}')"
                class="btn-sec ${(TS.calc.espRev||TS.calc.espessura) === e ? 'active' : ''}"
                style="padding:4px 9px;font-size:10px">${e}</button>`).join('')}
          </div>
        </div>
        ${renderSecaoPecasInner('calc', 'revestimento')}
      </div>

        <!-- Acabamentos -->
        <div style="padding:16px;background:var(--glass-bg);border:1px solid var(--glass-brd);border-radius:18px">
          <div class="tampo-calc-label" style="margin-bottom:12px">⚙️ Acabamentos</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${acbs.map(acb => `
              <div style="display:flex;align-items:center;gap:10px;padding:7px 10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:8px">
                <div style="flex:1;font-size:12px;color:var(--t2)">${acb.nome}</div>
                <button onclick="window.copiar('${acb.c1}',this)" title="Copiar C1"
                  style="font-family:var(--mono);font-size:10px;padding:2px 6px;border-radius:4px;background:rgba(196,97,42,.08);border:1px solid rgba(196,97,42,.18);color:rgba(255,190,152,.6);cursor:pointer;white-space:nowrap">
                  C1:${fmtC1(acb.c1)} ⎘
                </button>
                <div style="font-family:var(--mono);font-size:10px;color:var(--t4);white-space:nowrap">PVP:${fmtPVP(acb.pvp)}/${acb.unid}</div>
                <input type="number" min="0" step="${acb.unid === 'ml' ? '0.1' : '1'}"
                  value="${TS.calc.acabamentos[acb.id] || ''}"
                  placeholder="0"
                  oninput="window.calcAcabamento('${acb.id}',this.value)"
                  style="width:64px;padding:5px 8px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:6px;font-family:var(--mono);font-size:12px;color:var(--t1);text-align:center">
                <span style="font-size:10px;color:var(--t4);width:20px">${acb.unid}</span>
              </div>`).join('')}
          </div>
        </div>

        <!-- Transporte -->
        <div class="glass-card" style="padding:16px">
        <div class="tampo-calc-label" style="margin-bottom:10px">🚚 Transporte e Montagem</div>
          <select onchange="window.calcTransporte(this.value === '' ? null : parseInt(this.value))"
            style="width:100%;padding:8px 28px 8px 12px;border-radius:9px;background:rgba(255,255,255,.05);
            border:1px solid rgba(255,255,255,.1);color:var(--t2);font-family:var(--sans);font-size:12px;
            cursor:pointer;outline:none;appearance:none;-webkit-appearance:none;
            background-image:url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\'%3E%3Cpath d=\'M0 0l5 6 5-6z\' fill=\'rgba(255,255,255,.25)\'/%3E%3C/svg%3E');
            background-repeat:no-repeat;background-position:right 10px center">
            <option value="" ${TS.calc.transporte===null?'selected':''}>Sem transporte</option>
            ${TRANSPORTE.map((t,i)=>`<option value="${i}" ${TS.calc.transporte===i?'selected':''}>${t.label} — ${fmtPVP(t.pvp)}</option>`).join('')}
          </select>
        </div>

      </div>

      <!-- COLUNA DIREITA — resumo -->
      ${renderResumoCalc()}
    </div>`;
}

function renderSecaoPecas(ctx, campo, titulo) {
  const state = TS[ctx];
  const pecas = state[campo];
  let totalM2 = 0;
  pecas.forEach(p => {
    const c = parseFloat(p.comp) || 0;
    const l = parseFloat(p.larg) || 0;
    if (c > 0 && l > 0) totalM2 += c * l;
  });

  return `
    <div class="glass-card" style="padding:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div class="tampo-calc-label">${titulo}</div>
        <div id="${ctx}-${campo}-total" style="font-family:var(--mono);font-size:12px;font-weight:700;color:rgba(255,190,152,.7)">
          Total: ${totalM2.toFixed(4)} m²
        </div>
      </div>

      <!-- Cabeçalho -->
      <div class="tampo-pecas-header">
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--t4)">Comp (m)</div>
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--t4)">Larg (m)</div>
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--t4);text-align:right">m²</div>
        <div></div>
      </div>

      <!-- Linhas de peças -->
      <div id="${ctx}-${campo}-linhas">
        ${pecas.map((p, i) => renderLinhaPeca(ctx, campo, p, i)).join('')}
      </div>

      <button onclick="window.calcAddPeca('${ctx}','${campo}')"
        style="width:100%;margin-top:8px;padding:7px;border-radius:7px;background:rgba(255,255,255,.04);border:1px dashed rgba(255,255,255,.12);color:var(--t4);font-size:11px;font-weight:600;cursor:pointer;transition:all .15s">
        + Adicionar peça
      </button>
    </div>`;
}

function renderLinhaPeca(ctx, campo, p, idx) {
  const c = parseFloat(p.comp) || 0;
  const l = parseFloat(p.larg) || 0;
  const m2 = c > 0 && l > 0 ? (c * l).toFixed(4) : '—';
  return `
    <div class="tampo-peca-row" id="peca-${p.id}">
      <input type="number" min="0" step="0.01" value="${p.comp}"
        placeholder="ex: 3.65"
        oninput="window.calcUpdatePeca('${ctx}','${campo}','${p.id}','comp',this.value)"
        style="padding:7px 9px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:7px;font-family:var(--mono);font-size:12px;color:var(--t1)">
      <input type="number" min="0" step="0.01" value="${p.larg}"
        placeholder="0.65"
        oninput="window.calcUpdatePeca('${ctx}','${campo}','${p.id}','larg',this.value)"
        style="padding:7px 9px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:7px;font-family:var(--mono);font-size:12px;color:var(--t1)">
      <div data-m2 style="padding:7px 4px;font-family:var(--mono);font-size:12px;color:rgba(255,190,152,.7);text-align:right;align-self:center">${m2}</div>
      <button onclick="window.calcRemPeca('${ctx}','${campo}','${p.id}')"
        style="width:26px;height:26px;border-radius:6px;background:rgba(192,57,43,.2);border:1px solid rgba(192,57,43,.3);color:#ffb3a0;font-size:13px;cursor:pointer;align-self:center">×</button>
    </div>`;
}

function parseNum(v) {
  if (v === null || v === undefined || v === '') return 0;
  return parseFloat(String(v).replace(',', '.')) || 0;
}

function calcTotalM2(pecas) {
  return pecas.reduce((s, p) => {
    const c = parseNum(p.comp);
    const l = parseNum(p.larg);
    return s + (c > 0 && l > 0 ? c * l : 0);
  }, 0);
}

function renderResumoCalc() {
  const artigo  = TS.calc.artigo;
  const esp     = TS.calc.espessura;
  const mat     = TAMPOS_DB[TS.calc.material];
  const acbs    = mat.acabamentos;

  const m2Tampo = calcTotalM2(TS.calc.pecas);
  const m2Rev   = calcTotalM2(TS.calc.revestimento);
  const pvpTampo= artigo ? (artigo.pvp[esp] || 0) * m2Tampo : 0;
  const espRevAtual = TS.calc.espRev && artigo?.pvp[TS.calc.espRev] ? TS.calc.espRev : esp;
  const pvpRev  = artigo ? (artigo.pvp[espRevAtual] || 0) * m2Rev : 0;

  let pvpAcb = 0;
  let linhasAcb = '';
  acbs.forEach(acb => {
    const qty = parseFloat(TS.calc.acabamentos[acb.id]) || 0;
    if (qty > 0) {
      const val = acb.pvp * qty;
      pvpAcb += val;
      linhasAcb += `
        <div style="display:grid;grid-template-columns:1fr 90px 90px;gap:4px;padding:4px 0;font-size:11px;align-items:center">
          <span style="color:var(--t3)">${acb.nome} ×${qty}${acb.unid}</span>
          <button onclick="window.copiar('${acb.c1}',this)"
            style="font-family:var(--mono);font-size:11px;font-weight:700;text-align:right;background:none;border:none;color:rgba(255,190,152,.6);cursor:pointer;padding:0">
            ${fmtC1(acb.c1)} ⎘
          </button>
          <span style="font-family:var(--mono);color:var(--t2);text-align:right">${fmtPVP(val)}</span>
        </div>`;
    }
  });

  const transp    = TS.calc.transporte !== null ? TRANSPORTE[TS.calc.transporte] : null;
  const pvpTransp = transp ? transp.pvp : 0;
  const pvpBruto  = pvpTampo + pvpRev + pvpAcb + pvpTransp;
  const descPct   = parseNum(TS.calc.desconto) || 0;
  const pvpDesc   = pvpBruto * (descPct / 100);
  const pvpTotal  = pvpBruto - pvpDesc;

  return `
    <div id="calc-resumo-wrap" style="position:sticky;top:74px">
      <div class="glass-card" style="padding:18px;display:flex;flex-direction:column;gap:12px">
        <!-- Cabeçalho resumo -->
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:var(--t4)">
          Resumo
        </div>

        ${artigo ? `
          <!-- Artigo seleccionado + C1 base -->
          <div style="padding:10px;background:rgba(196,97,42,.07);border:1px solid rgba(196,97,42,.18);border-radius:10px">
            <div style="font-size:11px;color:var(--t3);margin-bottom:4px">Artigo seleccionado</div>
            <div style="font-size:13px;font-weight:600;color:var(--t1);margin-bottom:8px">${artigo.nome} · ${esp}</div>
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:10px;color:var(--t4)">C1 base (para copiar)</span>
              <button onclick="window.copiar('${artigo.c1[esp]}',this)"
                style="font-family:var(--mono);font-size:13px;font-weight:700;padding:4px 10px;border-radius:6px;background:rgba(196,97,42,.15);border:1px solid rgba(196,97,42,.3);color:rgba(255,190,152,.85);cursor:pointer;transition:all .15s">
                ${fmtC1(artigo.c1[esp])} ⎘
              </button>
            </div>
          </div>
        ` : `
          <div style="font-size:12px;color:var(--t4);text-align:center;padding:20px 0">
            Selecciona um artigo para ver o resumo
          </div>`}

        <!-- Linhas de detalhe PVP -->
        ${artigo && (m2Tampo > 0 || m2Rev > 0) ? `
          <div style="border-top:1px solid rgba(255,255,255,.07);padding-top:10px;display:flex;flex-direction:column;gap:3px">
            <!-- cabeçalho colunas -->
            <div style="display:grid;grid-template-columns:1fr 90px 90px;gap:4px;padding:2px 0 6px;border-bottom:1px solid rgba(255,255,255,.06)">
              <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--t4)">Descrição</span>
              <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(196,97,42,.5);text-align:right">C1</span>
              <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--t4);text-align:right">PVP</span>
            </div>
            ${m2Tampo > 0 ? `
              <div id="resumo-linha-tampo" style="display:grid;grid-template-columns:1fr 90px 90px;gap:4px;padding:4px 0;font-size:11px;align-items:center">
                <span data-desc style="color:var(--t3)">Tampo ${m2Tampo.toFixed(4)}m²</span>
                <button onclick="window.copiar('${artigo.c1[esp]}',this)"
                  style="font-family:var(--mono);font-size:11px;font-weight:700;text-align:right;background:none;border:none;color:rgba(255,190,152,.6);cursor:pointer;padding:0">
                  ${fmtC1(artigo.c1[esp])} ⎘
                </button>
                <span data-pvp style="font-family:var(--mono);color:var(--t2);text-align:right">${fmtPVP(pvpTampo)}</span>
              </div>` : ''}
            ${m2Rev > 0 ? `
              <div id="resumo-linha-rev" style="display:grid;grid-template-columns:1fr 90px 90px;gap:4px;padding:4px 0;font-size:11px;align-items:center">
                <span data-desc style="color:var(--t3)">Revestimento ${m2Rev.toFixed(4)}m²</span>
                <button onclick="window.copiar(String(artigo.c1[TS.calc.espRev] || artigo.c1[esp] || ''),this)"
                  style="font-family:var(--mono);font-size:11px;font-weight:700;text-align:right;background:none;border:none;color:rgba(255,190,152,.6);cursor:pointer;padding:0">
                  ${fmtC1(artigo.c1[TS.calc.espRev] || artigo.c1[esp])} ⎘
                </button>
                <span data-pvp style="font-family:var(--mono);color:var(--t2);text-align:right">${fmtPVP(pvpRev)}</span>
              </div>` : ''}
            ${linhasAcb}
            ${transp ? `
              <div style="display:grid;grid-template-columns:1fr 90px 90px;gap:4px;padding:4px 0;font-size:11px;align-items:center">
                <span style="color:var(--t3)">Transporte ${transp.label}</span>
                <button onclick="window.copiar('${transp.c1}',this)"
                  style="font-family:var(--mono);font-size:11px;font-weight:700;text-align:right;background:none;border:none;color:rgba(255,190,152,.6);cursor:pointer;padding:0">
                  ${fmtC1(transp.c1)} ⎘
                </button>
                <span style="font-family:var(--mono);color:var(--t2);text-align:right">${fmtPVP(pvpTransp)}</span>
              </div>` : ''}
          </div>

          <!-- Desconto -->
          <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:9px">
            <span style="flex:1;font-size:11px;color:var(--t3)">Desconto</span>
            <div style="display:flex;align-items:center;gap:4px">
              <input type="number" id="resumo-desconto" min="0" max="100" step="0.5"
                value="${descPct}"
                oninput="window.calcDescontoUpdate(this.value)"
                style="width:52px;padding:4px 8px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:6px;font-family:var(--mono);font-size:12px;color:var(--t1);text-align:center;outline:none">
              <span style="font-size:11px;color:var(--t4)">%</span>
            </div>
            <span id="resumo-pvp-desc" style="font-family:var(--mono);font-size:12px;color:#ff8a80;min-width:70px;text-align:right">
              ${descPct > 0 ? '- ' + fmtPVP(pvpDesc) : '—'}
            </span>
          </div>

          <!-- Total PVP -->
          <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:12px 14px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--t4)">
                Total PVP (cliente)
              </div>
              ${descPct > 0 ? `<div style="font-size:10px;color:var(--t4);text-decoration:line-through;font-family:var(--mono)">${fmtPVP(pvpBruto)}</div>` : ''}
            </div>
            <div id="resumo-pvp-total" style="font-family:var(--serif);font-size:26px;color:var(--t1)">
              ${fmtPVP(pvpTotal)}
            </div>
          </div>
        ` : ''}

        <!-- Comparar -->
        ${artigo ? `
          <button onclick="window.calcParaComparador()"
            style="width:100%;padding:8px;border-radius:7px;background:rgba(42,107,122,.1);border:1px solid rgba(42,107,122,.25);color:rgba(150,220,230,.7);font-size:11px;font-weight:700;cursor:pointer;transition:all .15s">
            ⚖️ Comparar com outro tampo →
          </button>` : ''}
      </div>
    </div>`;
}

// Funções de estado da calculadora
window.calcSelectMaterial = function(m) {
  TS.calc.material  = m;
  TS.calc.artigo    = null;
  TS.calc.espessura = TAMPOS_DB[m].espessuras[0];
  renderCalculadora();
};
window.calcSelectArtigo = function(nome) {
  const mat = TAMPOS_DB[TS.calc.material];
  TS.calc.artigo = mat.artigos.find(a => a.nome === nome) || null;
  renderCalculadora();
};
window.calcSelectEsp = function(esp) {
  TS.calc.espessura = esp;
  renderCalculadora();
};
window.calcAddPeca = function(ctx, campo) {
  const novaPeca = { id: gerarIdPeca(), comp: '', larg: '0.65' };
  TS[ctx][campo].push(novaPeca);

  // Tentar adicionar linha directamente ao DOM
  const linhasEl = document.getElementById(ctx + '-' + campo + '-linhas');
  if (linhasEl) {
    const div = document.createElement('div');
    div.innerHTML = renderLinhaPeca(ctx, campo, novaPeca, TS[ctx][campo].length - 1);
    linhasEl.appendChild(div.firstElementChild);
    // Actualizar total
    const totalEl3 = document.getElementById(ctx + '-' + campo + '-total');
    if (totalEl3) totalEl3.textContent = 'Total: ' + calcTotalM2(TS[ctx][campo]).toFixed(4) + ' m²';
  } else {
    // Fallback: re-render completo
    if (ctx === 'calc') renderCalculadora();
    else renderComparador();
  }
};
window.calcRemPeca = function(ctx, campo, id) {
  TS[ctx][campo] = TS[ctx][campo].filter(p => p.id !== id);
  // Remover linha do DOM sem re-render
  const linha = document.getElementById('peca-' + id);
  if (linha) linha.remove();
  // Actualizar total
  const totalEl2 = document.getElementById(ctx + '-' + campo + '-total');
  if (totalEl2) totalEl2.textContent = 'Total: ' + calcTotalM2(TS[ctx][campo]).toFixed(4) + ' m²';
  // Actualizar resumo
  if (ctx === 'calc') updateResumoCalc();
  if (ctx === 'comp') updateResultadoComp();
};
window.calcUpdatePeca = function(ctx, campo, id, key, val) {
  const p = TS[ctx][campo].find(x => x.id === id);
  if (p) p[key] = val;

  // Actualizar m² da linha específica
  const linha = document.getElementById('peca-' + id);
  if (linha) {
    const peca = TS[ctx][campo].find(x => x.id === id);
    const cv = parseNum(peca?.comp);
    const lv = parseNum(peca?.larg);
    const m2el = linha.querySelector('[data-m2]');
    if (m2el) m2el.textContent = cv > 0 && lv > 0 ? (cv * lv).toFixed(4) : '—';
  }

  // Actualizar total do campo
  const totalEl = document.getElementById(ctx + '-' + campo + '-total');
  if (totalEl) {
    const total = calcTotalM2(TS[ctx][campo]);
    totalEl.textContent = 'Total: ' + total.toFixed(4) + ' m²';
  }

  // Actualizar resumo — se os ids não existem, re-renderiza o resumo completo
  if (ctx === 'calc') {
    const resumoTotal = document.getElementById('resumo-pvp-total');
    if (resumoTotal) {
      updateResumoCalc();
    } else if (TS.calc.artigo) {
      // Artigo existe mas resumo ainda não tem as linhas — re-render
      const resumoWrap = document.getElementById('calc-resumo-wrap');
      if (resumoWrap) resumoWrap.innerHTML = renderResumoCalc();
      else renderCalculadora();
    }
  }
  if (ctx === 'comp') {
    // Actualizar total da secção sem re-renderizar
    const totalComp = document.getElementById(ctx + '-' + campo + '-total');
    if (totalComp) {
      const t = calcTotalM2(TS[ctx][campo]);
      totalComp.textContent = 'Total: ' + t.toFixed(4) + ' m²';
    }
    // Actualizar resultado comparativo
    updateResultadoComp();
  }
};
window.calcAcabamento = function(id, val) {
  TS.calc.acabamentos[id] = parseNum(val);
  updateResumoCalc();
};
window.calcTransporte = function(idx) {
  TS.calc.transporte = idx;
  renderCalculadora();
};
window.calcDescontoUpdate = function(val) {
  TS.calc.desconto = parseNum(val);
  updateResumoCalc();
};

window.calcLimpar = function() {
  TS.calc.pecas        = [{ id: gerarIdPeca(), comp: '', larg: '0.65' }];
  TS.calc.revestimento = [];
  TS.calc.acabamentos  = {};
  TS.calc.transporte   = null;
  TS.calc.desconto     = 10;
  renderCalculadora();
  toast('Calculadora limpa');
};

function updateResumoCalc() {
  const mat    = TAMPOS_DB[TS.calc.material];
  const esp    = TS.calc.espessura;
  const artigo = TS.calc.artigo;
  if (!artigo) return;

  // Se o wrapper existe mas o total não, re-render do resumo completo
  const wrap = document.getElementById('calc-resumo-wrap');
  const totalEl = document.getElementById('resumo-pvp-total');
  if (wrap && !totalEl) {
    wrap.innerHTML = renderResumoCalc();
    return;
  }

  const m2Tampo = calcTotalM2(TS.calc.pecas);
  const m2Rev   = calcTotalM2(TS.calc.revestimento);
  const espRevAtual = TS.calc.espRev && artigo.pvp[TS.calc.espRev] ? TS.calc.espRev : esp;
  const pvpTampo = (artigo.pvp[esp] || 0) * m2Tampo;
  const pvpRev   = (artigo.pvp[espRevAtual] || 0) * m2Rev;
  let pvpAcb = 0;
  mat.acabamentos.forEach(acb => {
    pvpAcb += acb.pvp * (parseNum(TS.calc.acabamentos[acb.id]) || 0);
  });
  const transp   = TS.calc.transporte !== null ? TRANSPORTE[TS.calc.transporte] : null;
  const pvpTotal = pvpTampo + pvpRev + pvpAcb + (transp ? transp.pvp : 0);

  // Calcular desconto
  const descPct2  = parseNum(TS.calc.desconto) || 0;
  const pvpDesc2  = (pvpTampo + pvpRev + pvpAcb + (transp ? transp.pvp : 0)) * (descPct2 / 100);
  const pvpFinal  = pvpTampo + pvpRev + pvpAcb + (transp ? transp.pvp : 0) - pvpDesc2;

  // Actualizar total PVP — reutilizar totalEl já declarado acima
  if (totalEl) totalEl.textContent = fmtPVP(pvpFinal);
  tampoGuardarCalc();

  // Actualizar linha desconto
  const descEl = document.getElementById('resumo-pvp-desc');
  if (descEl) descEl.textContent = descPct2 > 0 ? '- ' + fmtPVP(pvpDesc2) : '—';

  // Actualizar linha tampo no resumo
  const linTampo = document.getElementById('resumo-linha-tampo');
  if (linTampo && m2Tampo > 0) {
    linTampo.querySelector('[data-desc]').textContent = 'Tampo ' + m2Tampo.toFixed(4) + 'm²';
    linTampo.querySelector('[data-pvp]').textContent  = fmtPVP(pvpTampo);
  }

  // Actualizar linha revestimento no resumo
  const linRev = document.getElementById('resumo-linha-rev');
  if (linRev && m2Rev > 0) {
    linRev.querySelector('[data-desc]').textContent = 'Revestimento ' + m2Rev.toFixed(4) + 'm²';
    linRev.querySelector('[data-pvp]').textContent  = fmtPVP(pvpRev);
  }
}

// ════════════════════════════════════════════════
// COMPARADOR
// ════════════════════════════════════════════════
function renderComparador() {
  const ct = document.getElementById('tampo-ct-comparador'); if (!ct) return;

  const materiais = Object.keys(TAMPOS_DB);
  const lados = ['A', 'B'];

  ct.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:14px">

      <!-- Botões comparador -->
      <div style="display:flex;justify-content:flex-end;gap:8px">
        <button onclick="window.compLimparTudo()" style="padding:7px 14px;border-radius:8px;background:rgba(192,57,43,.1);border:1px solid rgba(192,57,43,.2);color:#ffb3a0;font-family:var(--sans);font-size:11px;font-weight:700;cursor:pointer">↺ Limpar tudo</button>
        <button onclick="window.tampoModoApresentacao()"
          style="display:flex;align-items:center;gap:7px;padding:8px 16px;border-radius:8px;background:rgba(42,107,122,.12);border:1px solid rgba(42,107,122,.3);color:rgba(150,220,230,.75);font-family:var(--sans);font-size:12px;font-weight:700;cursor:pointer;transition:all .15s"
          title="Abrir vista limpa para mostrar ao cliente">
          🖥️ Modo Apresentação
        </button>
      </div>

      <!-- Selecção de artigos A e B -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        ${lados.map(l => {
          const s   = TS.comp.lado[l];
          const mat = TAMPOS_DB[s.material];
          return `
            <div class="glass-card" style="padding:14px">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px">
                <span style="width:22px;height:22px;border-radius:50%;background:${l==='A' ? 'rgba(196,97,42,.3)' : 'rgba(42,107,122,.3)'};border:1px solid ${l==='A' ? 'rgba(196,97,42,.5)' : 'rgba(42,107,122,.5)'};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:${l==='A' ? 'rgba(255,190,152,.8)' : 'rgba(150,220,230,.8)'}">${l}</span>
                <div class="tampo-calc-label" style="flex:1">Tampo ${l}</div>
                ${TS.comp.lado[l].artigo ? `
                  <button onclick="window.compLimparLado('${l}')" title="Limpar este lado"
                    style="padding:3px 8px;border-radius:5px;background:rgba(192,57,43,.15);border:1px solid rgba(192,57,43,.25);color:#ffb3a0;font-size:10px;cursor:pointer">
                    ✕ Limpar
                  </button>` : ''}
              </div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
                ${materiais.map(m => `
                  <button onclick="window.compSelectMaterial('${l}','${m}')"
                    class="chip ${s.material === m ? 'active' : ''}" style="font-size:10px;padding:3px 8px">${m}</button>`).join('')}
              </div>
              <select onchange="window.compSelectArtigo('${l}',this.value)"
                style="width:100%;padding:8px 10px;background:#1C1C1F;border:1px solid var(--glass-brd);border-radius:8px;font-family:var(--sans);font-size:12px;color:var(--t1);margin-bottom:8px">
                <option value="">— Seleccionar —</option>
                ${mat.artigos.filter(a => !a.consulta).map(a =>
                  `<option value="${a.nome}" ${s.artigo?.nome === a.nome ? 'selected' : ''}>${a.grupo ? '['+a.grupo+'] ' : ''}${a.nome}</option>`
                ).join('')}
              </select>
              <div style="display:flex;gap:4px">
                ${mat.espessuras.map(e => `
                  <button onclick="window.compSelectEsp('${l}','${e}')"
                    class="btn-sec ${s.espessura === e ? 'active' : ''}" style="padding:5px 10px;font-size:10px">${e}</button>`).join('')}
              </div>
              ${s.artigo ? `
                <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.07)">
                  <div style="display:flex;justify-content:space-between;align-items:center">
                    <button onclick="window.copiar('${s.artigo.c1[s.espessura]}',this)"
                      style="font-family:var(--mono);font-size:11px;padding:3px 8px;border-radius:5px;background:rgba(196,97,42,.1);border:1px solid rgba(196,97,42,.2);color:rgba(255,190,152,.7);cursor:pointer">
                      C1: ${fmtC1(s.artigo.c1[s.espessura])} ⎘
                    </button>
                    <span style="font-family:var(--mono);font-size:12px;color:var(--t2)">${fmtPVP(s.artigo.pvp[s.espessura])}/m²</span>
                  </div>
                </div>` : ''}
            </div>`;
        }).join('')}
      </div>

      <!-- Peças partilhadas -->
      <div class="tampo-comp-pecas-grid">
        <div>
          ${renderSecaoPecas('comp', 'pecas', '🪨 Tampo — Peças (partilhadas)')}
        </div>
        <div>
          ${renderSecaoPecas('comp', 'revestimento', '🧱 Revestimento (partilhado)')}
        </div>
      </div>

      <!-- Transporte -->
      <div class="glass-card" style="padding:14px">
        <div class="tampo-calc-label" style="margin-bottom:8px">🚚 Transporte (partilhado)</div>
        <select onchange="window.compTransporte(this.value === '' ? null : parseInt(this.value))"
          style="width:100%;padding:8px 28px 8px 12px;border-radius:9px;background:rgba(255,255,255,.05);
          border:1px solid rgba(255,255,255,.1);color:var(--t2);font-family:var(--sans);font-size:12px;
          cursor:pointer;outline:none;appearance:none;-webkit-appearance:none;
          background-image:url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\'%3E%3Cpath d=\'M0 0l5 6 5-6z\' fill=\'rgba(255,255,255,.25)\'/%3E%3C/svg%3E');
          background-repeat:no-repeat;background-position:right 10px center">
          <option value="" ${TS.comp.transporte===null?'selected':''}>Sem transporte</option>
          ${TRANSPORTE.map((t,i)=>`<option value="${i}" ${TS.comp.transporte===i?'selected':''}>${t.label} — ${fmtPVP(t.pvp)}</option>`).join('')}
        </select>
      </div>

      <!-- RESULTADO COMPARATIVO -->
      <div id="comp-resultado-bloco">${renderResultadoComp()}</div>
    </div>`;
}

function renderResultadoComp() {
  const lados = ['A', 'B'];
  const m2Tampo = calcTotalM2(TS.comp.pecas);
  const m2Rev   = calcTotalM2(TS.comp.revestimento);
  const transp  = TS.comp.transporte !== null ? TRANSPORTE[TS.comp.transporte] : null;
  const pvpTransp = transp ? transp.pvp : 0;

  const totais = lados.map(l => {
    const s   = TS.comp.lado[l];
    const mat = TAMPOS_DB[s.material];
    if (!s.artigo) return null;
    const esp = s.espessura;
    const pvpM2 = s.artigo.pvp[esp] || 0;
    const pvpTampo = pvpM2 * m2Tampo;
    const pvpRev   = pvpM2 * m2Rev;
    let pvpAcb = 0;
    mat.acabamentos.forEach(acb => {
      const qty = parseFloat(TS.comp.acabamentos[acb.id]) || 0;
      pvpAcb += acb.pvp * qty;
    });
    return pvpTampo + pvpRev + pvpAcb + pvpTransp;
  });

  if (!totais[0] && !totais[1]) {
    return `<div style="text-align:center;padding:24px;color:var(--t4);font-size:12px">Selecciona dois artigos para ver a comparação</div>`;
  }

  const diff    = totais[0] !== null && totais[1] !== null ? Math.abs(totais[0] - totais[1]) : null;
  const maisCaroL = diff !== null ? (totais[0] > totais[1] ? 'A' : 'B') : null;

  return `
    <div class="tampo-comp-resultado-grid">
      ${lados.map((l, i) => {
        const s = TS.comp.lado[l];
        const total = totais[i];
        const cor = l === 'A' ? 'rgba(196,97,42,.3)' : 'rgba(42,107,122,.3)';
        const corT = l === 'A' ? 'rgba(255,190,152,.9)' : 'rgba(150,220,230,.9)';
        const maiorBg = maisCaroL === l ? 'rgba(192,57,43,.1)' : 'rgba(58,122,68,.1)';
        const maiorBrd= maisCaroL === l ? 'rgba(192,57,43,.25)' : 'rgba(58,122,68,.25)';
        return `
          <div style="background:${maiorBg};border:1.5px solid ${maiorBrd};border-radius:14px;padding:16px;text-align:center">
            <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:8px">
              <span style="width:20px;height:20px;border-radius:50%;background:${cor};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:${corT}">${l}</span>
              <span style="font-size:12px;font-weight:600;color:var(--t1)">${s.artigo ? s.artigo.nome : '—'}</span>
            </div>
            ${s.artigo ? `
              <div id="comp-total-${l}" style="font-family:var(--serif);font-size:28px;color:var(--t1);margin-bottom:4px">
                ${total !== null ? fmtPVP(total) : '—'}
              </div>
              <div style="font-size:10px;color:var(--t4)">${s.material} · ${s.espessura}</div>
              ${maisCaroL === l ?
                `<div style="margin-top:8px;font-size:10px;font-weight:700;color:#ff8a80">▲ Mais caro</div>` :
                `<div style="margin-top:8px;font-size:10px;font-weight:700;color:rgba(150,220,150,.8)">▼ Mais económico</div>`}
            ` : '<div style="font-size:12px;color:var(--t4)">Sem artigo</div>'}
          </div>`;
      }).join('')}

      <!-- Delta central -->
      <div style="text-align:center">
        ${diff !== null ? `
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--t4);margin-bottom:6px">Diferença</div>
          <div style="font-family:var(--mono);font-size:20px;font-weight:700;color:rgba(255,190,152,.8)">
            ${fmtPVP(diff)}
          </div>
          <div style="font-size:10px;color:var(--t4);margin-top:4px">
            +${((diff / Math.min(...totais.filter(t => t !== null))) * 100).toFixed(1)}%
          </div>
        ` : '<div style="font-size:22px;color:var(--t4)">vs</div>'}
      </div>
    </div>`;
}

// Funções de estado do comparador
window.compSelectMaterial = function(l, m) {
  TS.comp.lado[l].material  = m;
  TS.comp.lado[l].artigo    = null;
  TS.comp.lado[l].espessura = TAMPOS_DB[m].espessuras[0];
  renderComparador();
};
window.compSelectArtigo = function(l, nome) {
  const mat = TAMPOS_DB[TS.comp.lado[l].material];
  TS.comp.lado[l].artigo = mat.artigos.find(a => a.nome === nome) || null;
  renderComparador();
};
window.compSelectEsp = function(l, esp) {
  TS.comp.lado[l].espessura = esp;
  renderComparador();
};
window.compTransporte = function(idx) {
  TS.comp.transporte = idx;
  renderComparador();
};
function updateResumoComp() { updateResultadoComp(); }

function calcTotalLadoComp(l, m2Tampo, m2Rev, pvpTransp) {
  const s   = TS.comp.lado[l];
  if (!s.artigo) return null;
  const mat   = TAMPOS_DB[s.material];
  const esp   = s.espessura;
  const pvpM2 = s.artigo.pvp[esp] || 0;
  let pvpAcb  = 0;
  mat.acabamentos.forEach(acb => {
    pvpAcb += acb.pvp * (parseNum(TS.comp.acabamentos?.[acb.id]) || 0);
  });
  return pvpM2 * m2Tampo + pvpM2 * m2Rev + pvpAcb + pvpTransp;
}

function updateResultadoComp() {
  const m2Tampo   = calcTotalM2(TS.comp.pecas);
  const m2Rev     = calcTotalM2(TS.comp.revestimento);
  const transp    = TS.comp.transporte !== null ? TRANSPORTE[TS.comp.transporte] : null;
  const pvpTransp = transp ? transp.pvp : 0;

  // Tentar actualizar ids existentes
  const elA = document.getElementById('comp-total-A');
  const elB = document.getElementById('comp-total-B');
  const elD = document.getElementById('comp-delta');

  if (!elA && !elB) {
    // Ids não existem — re-renderizar só o bloco de resultado
    const resBlock = document.getElementById('comp-resultado-bloco');
    if (resBlock) resBlock.innerHTML = renderResultadoComp();
    return;
  }

  // Actualizar cada lado
  ['A','B'].forEach(l => {
    const el    = document.getElementById('comp-total-' + l);
    const total = calcTotalLadoComp(l, m2Tampo, m2Rev, pvpTransp);
    if (el && total !== null) el.textContent = fmtPVP(total);
  });

  // Actualizar delta
  const totA = calcTotalLadoComp('A', m2Tampo, m2Rev, pvpTransp);
  const totB = calcTotalLadoComp('B', m2Tampo, m2Rev, pvpTransp);
  if (elD && totA !== null && totB !== null) {
    const diff = Math.abs(totA - totB);
    const pct  = diff > 0 ? ((diff / Math.min(totA, totB)) * 100).toFixed(1) : '0';
    elD.innerHTML = 'Δ ' + fmtPVP(diff) + '<br><span style="font-size:11px;opacity:.6">+' + pct + '%</span>';
  }
}

// Expor init
window.switchTampoTab = switchTampoTab;
window.tampoInit      = tampoInit;

// ── Funções adicionais ────────────────────────────────────────────

// renderSecaoPecasInner — versão sem card wrapper (para uso dentro de card próprio)
function renderSecaoPecasInner(ctx, campo) {
  const state = TS[ctx];
  const pecas = state[campo];
  let totalM2 = 0;
  pecas.forEach(p => {
    const c = parseFloat(p.comp) || 0;
    const l = parseFloat(p.larg) || 0;
    if (c > 0 && l > 0) totalM2 += c * l;
  });
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <div></div>
      <div id="${ctx}-${campo}-total" style="font-family:var(--mono);font-size:12px;font-weight:700;color:rgba(255,190,152,.7)">
        Total: ${totalM2.toFixed(4)} m²
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 80px 28px;gap:6px;margin-bottom:6px;padding:0 4px">
      <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--t4)">Comp (m)</div>
      <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--t4)">Larg (m)</div>
      <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--t4);text-align:right">m²</div>
      <div></div>
    </div>
    <div id="${ctx}-${campo}-linhas">
      ${pecas.map((p, i) => renderLinhaPeca(ctx, campo, p, i)).join('')}
    </div>
    <button onclick="window.calcAddPeca('${ctx}','${campo}')"
      style="width:100%;margin-top:8px;padding:7px;border-radius:7px;background:rgba(255,255,255,.04);border:1px dashed rgba(255,255,255,.12);color:var(--t4);font-size:11px;font-weight:600;cursor:pointer">
      + Adicionar peça
    </button>`;
}

// Espessura do revestimento
window.calcSelectEspRev = function(esp) {
  TS.calc.espRev = esp;
  renderCalculadora();
};

// Transferir calc → comparador (aproveitando todas as medidas)
window.calcParaComparador = function() {
  // Copiar peças e acabamentos para o comparador
  TS.comp.pecas        = TS.calc.pecas.map(p => ({...p}));
  TS.comp.revestimento = TS.calc.revestimento.map(p => ({...p}));
  TS.comp.acabamentos  = {...TS.calc.acabamentos};
  TS.comp.transporte   = TS.calc.transporte;
  // Lado A = artigo actual da calculadora
  TS.comp.lado.A.material  = TS.calc.material;
  TS.comp.lado.A.artigo    = TS.calc.artigo;
  TS.comp.lado.A.espessura = TS.calc.espessura;
  // Lado B — material diferente, sem artigo (para o utilizador escolher)
  const outroMat = Object.keys(TAMPOS_DB).find(m => m !== TS.calc.material) || 'Dekton';
  TS.comp.lado.B.material  = outroMat;
  TS.comp.lado.B.artigo    = null;
  TS.comp.lado.B.espessura = TAMPOS_DB[outroMat].espessuras[0];
  switchTampoTab('comparador');
};

// Limpar um lado do comparador
window.compLimparLado = function(l) {
  TS.comp.lado[l].artigo = null;
  renderComparador();
};

// Limpar comparador completo
window.compLimparTudo = function() {
  TS.comp.lado.A.artigo = null;
  TS.comp.lado.B.artigo = null;
  TS.comp.pecas         = [{ id: gerarIdPeca(), comp: '', larg: '0.65' }];
  TS.comp.revestimento  = [];
  TS.comp.acabamentos   = {};
  TS.comp.transporte    = null;
  renderComparador();
  toast('Comparador limpo');
};


// ════════════════════════════════════════════════
// EDITAR ARTIGO DE TAMPO
// ════════════════════════════════════════════════
window.tampoNovoArtigo = function(material) {
  // Artigo vazio para criação
  const mat  = TAMPOS_DB[material];
  const vazio = { nome: '', grupo: '', c1: {}, pvp: {}, consulta: false, _novo: true };
  mat.espessuras.forEach(e => { vazio.c1[e] = null; vazio.pvp[e] = null; });
  _abrirModalTampo(material, -1, vazio);
};

window.tampoEditar = function(nome, material) {
  const mat    = TAMPOS_DB[material];
  const idx    = mat.artigos.findIndex(a => a.nome === nome);
  const artigo = mat.artigos[idx];
  if (!artigo) return;

  _abrirModalTampo(material, idx, artigo);
};

function _abrirModalTampo(material, idx, artigo) {
  const mat = TAMPOS_DB[material];
  // Criar modal
  let modal = document.getElementById('tampo-modal-editar');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'tampo-modal-editar';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.72);backdrop-filter:blur(8px);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px';
    document.body.appendChild(modal);
  }

  const esps = mat.espessuras;
  const c1Fields  = esps.map(e => `
    <div style="display:flex;flex-direction:column;gap:4px">
      <label style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--t4)">C1 ${e} (cêntimos)</label>
      <input type="number" id="edit-c1-${e.replace('.','_')}" value="${artigo.c1[e] || ''}"
        style="padding:8px 10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:7px;font-family:var(--mono);font-size:13px;color:var(--t1);outline:none">
    </div>`).join('');
  const pvpFields = esps.map(e => `
    <div style="display:flex;flex-direction:column;gap:4px">
      <label style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--t4)">PVP ${e} (€/m²)</label>
      <input type="number" id="edit-pvp-${e.replace('.','_')}" value="${artigo.pvp[e] || ''}"
        style="padding:8px 10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:7px;font-family:var(--mono);font-size:13px;color:var(--t1);outline:none">
    </div>`).join('');

  modal.innerHTML = `
    <div style="background:#1C1C1F;border-radius:18px;width:100%;max-width:480px;border:1px solid rgba(255,255,255,.1);position:relative;overflow:hidden">
      <!-- linha brasa topo -->
      <div style="position:absolute;top:0;left:20px;right:20px;height:1px;background:linear-gradient(90deg,transparent,rgba(196,97,42,.4),transparent)"></div>

      <div style="padding:20px 22px 16px;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-family:Georgia,serif;font-size:18px;color:var(--t1)">${artigo._novo ? 'Novo Artigo' : 'Editar Artigo'}</div>
          <div style="font-size:11px;color:var(--t4);margin-top:2px">${material}${artigo.grupo ? ' · ' + artigo.grupo : ''}</div>
        </div>
        <button onclick="document.getElementById('tampo-modal-editar').remove()"
          style="background:none;border:none;font-size:20px;color:var(--t4);cursor:pointer">×</button>
      </div>

      <div style="padding:20px 22px;display:flex;flex-direction:column;gap:14px">
        <!-- Nome -->
        <div style="display:flex;flex-direction:column;gap:4px">
          <label style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--t4)">Nome</label>
          <input type="text" id="edit-nome" value="${artigo.nome}"
            style="padding:8px 10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:7px;font-family:var(--sans);font-size:13px;color:var(--t1);outline:none">
        </div>
        <!-- C1 por espessura -->
        <div style="display:grid;grid-template-columns:${esps.map(()=>'1fr').join(' ')};gap:10px">
          ${c1Fields}
        </div>
        <!-- PVP por espessura -->
        <div style="display:grid;grid-template-columns:${esps.map(()=>'1fr').join(' ')};gap:10px">
          ${pvpFields}
        </div>
        <!-- Grupo -->
        <div style="display:flex;flex-direction:column;gap:4px">
          <label style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--t4)">Grupo / Gama</label>
          <input type="text" id="edit-grupo" value="${artigo.grupo || ''}"
            style="padding:8px 10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:7px;font-family:var(--sans);font-size:12px;color:var(--t1);outline:none">
        </div>
        <!-- Disponibilidade -->
        <label style="display:flex;align-items:center;gap:10px;cursor:pointer">
          <input type="checkbox" id="edit-consulta" ${artigo.consulta ? 'checked' : ''}
            style="width:16px;height:16px;accent-color:var(--peach-dark)">
          <span style="font-size:12px;color:var(--t2)">Sob consulta / indisponível</span>
        </label>
      </div>

      <div style="padding:14px 22px 20px;display:flex;justify-content:flex-end;gap:8px;border-top:1px solid rgba(255,255,255,.07)">
        <button onclick="document.getElementById('tampo-modal-editar').remove()"
          style="padding:9px 18px;border-radius:8px;background:transparent;border:1px solid rgba(255,255,255,.1);color:var(--t3);font-family:var(--sans);font-size:13px;cursor:pointer">
          Cancelar
        </button>
        <button onclick="window.tampoGuardarEdicao('${material}',${idx})"
          style="padding:9px 20px;border-radius:8px;background:rgba(196,97,42,.15);border:1px solid rgba(196,97,42,.3);color:rgba(255,190,152,.85);font-family:var(--sans);font-size:13px;font-weight:700;cursor:pointer">
          ${artigo._novo ? 'Criar artigo' : 'Guardar'}
        </button>
      </div>
    </div>`;

  // Focus no nome
  setTimeout(() => document.getElementById('edit-nome')?.focus(), 100);
};

window.tampoGuardarEdicao = async function(material, idx) {
  const mat  = TAMPOS_DB[material];
  const esps = mat.espessuras;
  const novo = idx === -1; // modo criação

  // Criar novo artigo ou editar existente
  let artigo;
  if (novo) {
    artigo = { nome: '', grupo: '', c1: {}, pvp: {}, consulta: false, _novo: true };
    esps.forEach(e => { artigo.c1[e] = null; artigo.pvp[e] = null; });
  } else {
    artigo = mat.artigos[idx];
  }

  artigo.nome    = document.getElementById('edit-nome')?.value?.trim() || '';
  artigo.grupo   = document.getElementById('edit-grupo')?.value?.trim() || '';
  artigo.consulta= document.getElementById('edit-consulta')?.checked || false;

  if (!artigo.nome) { toast('⚠️ Nome obrigatório'); return; }

  esps.forEach(e => {
    const key = e.replace('.','_');
    const c1v = parseFloat(document.getElementById('edit-c1-' + key)?.value);
    const pvpv= parseFloat(document.getElementById('edit-pvp-' + key)?.value);
    if (!isNaN(c1v))  artigo.c1[e]  = c1v;
    if (!isNaN(pvpv)) artigo.pvp[e] = pvpv;
  });

  if (novo) {
    delete artigo._novo;
    mat.artigos.push(artigo);
    idx = mat.artigos.length - 1;
  }

  // Persistir no Firebase
  const db = getDb();
  if (db) {
    try {
      const id = material + '_' + artigo.nome.replace(/[^a-zA-Z0-9]/g, '_');
      await setDoc(doc(db, 'wk_tampos_overrides', id), {
        material,
        idx,
        nome:     artigo.nome,
        grupo:    artigo.grupo || '',
        c1:       artigo.c1,
        pvp:      artigo.pvp,
        consulta: artigo.consulta || false,
        ts:       Date.now(),
      });
      setSyncOk();
    } catch(e) { console.error('Erro ao guardar tampo:', e); mostrarErroDB(e); }
  }

  document.getElementById('tampo-modal-editar')?.remove();
  renderCatalogGrid();
  toast(novo ? '✓ Artigo criado' : '✓ Artigo actualizado');
};

// ════════════════════════════════════════════════
// MODO APRESENTAÇÃO — COMPARADOR
// ════════════════════════════════════════════════
window.tampoModoApresentacao = function() {
  const lados = ['A','B'];
  const m2Tampo = calcTotalM2(TS.comp.pecas);
  const m2Rev   = calcTotalM2(TS.comp.revestimento);
  const transp  = TS.comp.transporte !== null ? TRANSPORTE[TS.comp.transporte] : null;
  const pvpTransp = transp ? transp.pvp : 0;

  const dados = lados.map(l => {
    const s   = TS.comp.lado[l];
    const mat = TAMPOS_DB[s.material];
    if (!s.artigo) return null;
    const esp    = s.espessura;
    const pvpM2  = s.artigo.pvp[esp] || 0;
    const pvpT   = pvpM2 * m2Tampo;
    const pvpR   = pvpM2 * m2Rev;
    let pvpAcb   = 0;
    mat.acabamentos.forEach(acb => {
      pvpAcb += acb.pvp * (parseFloat(TS.comp.acabamentos[acb.id]) || 0);
    });
    return { nome: s.artigo.nome, material: s.material, esp, total: pvpT + pvpR + pvpAcb + pvpTransp };
  });

  if (!dados[0] && !dados[1]) { toast('⚠️ Selecciona dois artigos primeiro'); return; }

  const win = window.open('', '_blank', 'width=900,height=600');
  const corA = '#C4612A', corB = '#2A6B7A';

  const diff    = dados[0] && dados[1] ? Math.abs(dados[0].total - dados[1].total) : null;
  const maisEco = diff !== null ? (dados[0].total < dados[1].total ? 'A' : 'B') : null;

  const fmtP = v => v.toLocaleString('pt-PT', { minimumFractionDigits: 2 }) + ' €';

  win.document.write(`<!DOCTYPE html><html lang="pt"><head>
    <meta charset="UTF-8">
    <title>Comparação de Tampos</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;600&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
    <style>
      *{box-sizing:border-box;margin:0;padding:0;}
      body{font-family:'DM Sans',sans-serif;background:#0E0E10;color:#fff;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;}
      .titulo{font-family:'DM Serif Display',serif;font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.25);margin-bottom:40px;text-align:center}
      .grid{display:grid;grid-template-columns:1fr auto 1fr;gap:24px;align-items:center;width:100%;max-width:760px;}
      .lado{border-radius:20px;padding:28px 24px;text-align:center;}
      .lado-nome{font-family:'DM Serif Display',serif;font-size:20px;margin-bottom:4px;}
      .lado-mat{font-size:11px;letter-spacing:.1em;text-transform:uppercase;margin-bottom:20px;}
      .lado-total{font-family:'DM Serif Display',serif;font-size:42px;margin-bottom:8px;}
      .lado-tag{display:inline-block;padding:4px 12px;border-radius:99px;font-size:11px;font-weight:600;margin-top:8px;}
      .versus{font-family:'JetBrains Mono',monospace;font-size:11px;color:rgba(255,255,255,.2);text-align:center;}
      .diff-val{font-family:'DM Serif Display',serif;font-size:22px;color:rgba(255,255,255,.6);text-align:center;margin-top:8px;}
      .diff-pct{font-size:11px;color:rgba(255,255,255,.3);text-align:center;margin-top:4px;}
      .fechar{position:fixed;top:16px;right:16px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:7px 14px;color:rgba(255,255,255,.4);font-family:'DM Sans',sans-serif;font-size:12px;cursor:pointer;}
      .nota{font-size:11px;color:rgba(255,255,255,.15);text-align:center;margin-top:40px;letter-spacing:.05em;}
    </style>
  </head><body>
    <button class="fechar" onclick="window.close()">× Fechar</button>
    <div class="titulo">Comparação de Tampos · ${new Date().toLocaleDateString('pt-PT')}</div>
    <div class="grid">
      ${dados.map((d, i) => {
        if (!d) return '<div></div>';
        const l   = lados[i];
        const cor = l === 'A' ? corA : corB;
        const eco = maisEco === l;
        return `<div class="lado" style="background:${cor}18;border:1.5px solid ${cor}44">
          <div class="lado-nome" style="color:${cor === corA ? '#FFD4B5' : '#A8D8E0'}">${d.nome}</div>
          <div class="lado-mat" style="color:rgba(255,255,255,.3)">${d.material} · ${d.esp}</div>
          <div class="lado-total" style="color:#fff">${fmtP(d.total)}</div>
          <div class="lado-tag" style="background:${eco ? 'rgba(58,122,68,.3)' : 'rgba(192,57,43,.2)'};color:${eco ? '#a8e6a8' : '#ffb3a0'}">
            ${eco ? '▼ Mais económico' : '▲ Mais caro'}
          </div>
        </div>`;
      }).join('')}
      <div>
        <div class="versus">vs</div>
        ${diff !== null ? `
          <div class="diff-val">Δ ${fmtP(diff)}</div>
          <div class="diff-pct">+${((diff / Math.min(...dados.filter(Boolean).map(d=>d.total)))*100).toFixed(1)}%</div>
        ` : ''}
      </div>
    </div>
    ${transp ? `<div class="nota">Inclui transporte ${transp.label} · ${fmtP(pvpTransp)}</div>` : ''}
  </body></html>`);
  win.document.close();
};
