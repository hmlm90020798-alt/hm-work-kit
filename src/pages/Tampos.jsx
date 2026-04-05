import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, doc, onSnapshot, setDoc, deleteDoc, addDoc } from 'firebase/firestore'
import '../styles/tampos.css'

// ── Dados ANIGRACO ─────────────────────────────────────────────────────────
const ANIGRACO = {
  GRANITOS: {
    materiais: [
      {desc:'VERDE LAVRADOR',   grupo:null, espessuras:{'2cm':{c1:27022,pvp:475},'3cm':{c1:29444,pvp:517}}},
      {desc:'NEGRO ZIMBABWE',   grupo:null, espessuras:{'2cm':{c1:26656,pvp:468},'3cm':{c1:29912,pvp:526}}},
      {desc:'AZUL LAVRADOR',    grupo:null, espessuras:{'2cm':{c1:24132,pvp:424},'3cm':{c1:30889,pvp:543}}},
      {desc:'SHIVAKASHY',       grupo:null, espessuras:{'2cm':{c1:21599,pvp:380},'3cm':{c1:28679,pvp:504}}},
      {desc:'PATAS DE GATO',    grupo:null, espessuras:{'2cm':{c1:19261,pvp:338},'3cm':{c1:25041,pvp:440}}},
      {desc:'NEGRO ANGOLA',     grupo:null, espessuras:{'2cm':{c1:16218,pvp:285},'3cm':{c1:19975,pvp:351}}},
      {desc:'NEGRO IMPALA',     grupo:null, espessuras:{'2cm':{c1:14476,pvp:254},'3cm':{c1:20579,pvp:362}}},
      {desc:'AMARELO FIGUEIRA', grupo:null, espessuras:{'2cm':{c1:11407,pvp:200},'3cm':{c1:12365,pvp:217}}},
      {desc:'AMARELO MACIEIRA', grupo:null, espessuras:{'2cm':{c1:10651,pvp:187},'3cm':{c1:11713,pvp:206}}},
      {desc:'AMARELO VIMIEIRO', grupo:null, espessuras:{'2cm':{c1:12551,pvp:221},'3cm':{c1:13613,pvp:239}}},
      {desc:'BRANCO CORAL',     grupo:null, espessuras:{'2cm':{c1:10651,pvp:187},'3cm':{c1:11713,pvp:206}}},
      {desc:'CINZA EVORA',      grupo:null, espessuras:{'2cm':{c1:14551,pvp:256},'3cm':{c1:15613,pvp:274}}},
      {desc:'PEDRAS SALGADAS',  grupo:null, espessuras:{'2cm':{c1:12551,pvp:221},'3cm':{c1:13613,pvp:239}}},
      {desc:'CINZA PENALVA',    grupo:null, espessuras:{'2cm':{c1:8874,pvp:156}, '3cm':{c1:10999,pvp:193}}},
      {desc:'CINZA ANTAS',      grupo:null, espessuras:{'2cm':{c1:8874,pvp:156}, '3cm':{c1:10999,pvp:193}}},
      {desc:'CINZA PINHEL',     grupo:null, espessuras:{'2cm':{c1:8874,pvp:156}, '3cm':{c1:10617,pvp:187}}},
      {desc:'ROSA PORRINHO',    grupo:null, espessuras:{'2cm':{c1:8874,pvp:156}, '3cm':{c1:10141,pvp:178}}},
      {desc:'ROSA MONÇÃO',      grupo:null, espessuras:{'2cm':{c1:8874,pvp:156}, '3cm':{c1:10141,pvp:178}}},
    ],
    acabamentos:[
      {nome:'RODATAMPO',           c1:1160,pvp:21, unidade:'ml'},
      {nome:'CORTE BRUTO',         c1:1260,pvp:23, unidade:'un'},
      {nome:'REBAIXO À FACE',      c1:4410,pvp:80, unidade:'un'},
      {nome:'TRANSFORMAÇÃO POLIDO',c1:3500,pvp:56, unidade:'un'},
      {nome:'FURO',                c1:950, pvp:17, unidade:'un'},
      {nome:'CORTE 1/2 ESQUADRIA', c1:2310,pvp:47, unidade:'un'},
    ]
  },
  SILESTONES:{
    materiais:[
      {desc:'LINEN CREAM',       grupo:'PROMOÇÃO',espessuras:{'2cm':{c1:20272,pvp:356},'1.2cm':{c1:17872,pvp:314}}},
      {desc:'MOTION GREY',       grupo:'PROMOÇÃO',espessuras:{'2cm':{c1:20272,pvp:356},'1.2cm':{c1:17872,pvp:314}}},
      {desc:'MIAMI WHITE',       grupo:'PROMOÇÃO',espessuras:{'2cm':{c1:20272,pvp:356},'1.2cm':{c1:17872,pvp:314}}},
      {desc:'LIME DELIGHT',      grupo:'PROMOÇÃO',espessuras:{'2cm':{c1:20272,pvp:356},'1.2cm':{c1:17872,pvp:314}}},
      {desc:'PERSIAN WHITE',     grupo:'PROMOÇÃO',espessuras:{'2cm':{c1:20272,pvp:356},'1.2cm':{c1:17872,pvp:314}}},
      {desc:'SIBERIAN',          grupo:'PROMOÇÃO',espessuras:{'2cm':{c1:20272,pvp:356},'1.2cm':{c1:17872,pvp:314}}},
      {desc:'LAGOON',            grupo:'PROMOÇÃO',espessuras:{'2cm':{c1:20272,pvp:356},'1.2cm':{c1:17872,pvp:314}}},
      {desc:'CONCRETE PULSE',    grupo:'PROMOÇÃO',espessuras:{'2cm':{c1:20272,pvp:356},'1.2cm':{c1:17872,pvp:314}}},
      {desc:'CORAL CLAY',        grupo:'PROMOÇÃO',espessuras:{'2cm':{c1:20272,pvp:356},'1.2cm':{c1:17872,pvp:314}}},
      {desc:'NEGRO TEBAS',       grupo:'PROMOÇÃO',espessuras:{'2cm':{c1:20272,pvp:356},'1.2cm':{c1:17872,pvp:314}}},
      {desc:'BLANCO MAPLE 14',   grupo:'G1',espessuras:{'2cm':{c1:23064,pvp:405}}},
      {desc:'BLANCO NORTE 14',   grupo:'G1',espessuras:{'2cm':{c1:23064,pvp:405}}},
      {desc:'LINEN CREAM',       grupo:'G1',espessuras:{'2cm':{c1:23064,pvp:405}}},
      {desc:'WHITE STORM 14',    grupo:'G1',espessuras:{'2cm':{c1:23064,pvp:405}}},
      {desc:'MOTION GREY',       grupo:'G1',espessuras:{'2cm':{c1:23064,pvp:405}}},
      {desc:'ROUGUI',            grupo:'G1',espessuras:{'2cm':{c1:23064,pvp:405}}},
      {desc:'GRIS EXPO',         grupo:'G1',espessuras:{'2cm':{c1:23064,pvp:405}}},
      {desc:'MARENGO',           grupo:'G1',espessuras:{'2cm':{c1:23064,pvp:405}}},
      {desc:'MIAMI WHITE 17',    grupo:'G2',espessuras:{'2cm':{c1:26784,pvp:471}}},
      {desc:'LIME DELIGHT',      grupo:'G2',espessuras:{'2cm':{c1:26784,pvp:471}}},
      {desc:'PERSIAN WHITE',     grupo:'G2',espessuras:{'2cm':{c1:26784,pvp:471}}},
      {desc:'SIBERIAN',          grupo:'G2',espessuras:{'2cm':{c1:26784,pvp:471}}},
      {desc:'LAGOON',            grupo:'G2',espessuras:{'2cm':{c1:26784,pvp:471}}},
      {desc:'CONCRETE PULSE',    grupo:'G2',espessuras:{'2cm':{c1:26784,pvp:471}}},
      {desc:'CORAL CLAY COLOUR', grupo:'G2',espessuras:{'2cm':{c1:26784,pvp:471}}},
      {desc:'BRASS RELISH',      grupo:'G2',espessuras:{'2cm':{c1:26784,pvp:471}}},
      {desc:'CINDER CRAZE',      grupo:'G2',espessuras:{'2cm':{c1:26784,pvp:471}}},
      {desc:'NIGHT TEBAS',       grupo:'G2',espessuras:{'2cm':{c1:26784,pvp:471}}},
      {desc:'MIAMI VENA',        grupo:'G3',espessuras:{'2cm':{c1:29672,pvp:521}}},
      {desc:'BRONZE RIVERS',     grupo:'G3',espessuras:{'2cm':{c1:29672,pvp:521}}},
      {desc:'SNOWY IBIZA',       grupo:'G3',espessuras:{'2cm':{c1:29672,pvp:521}}},
      {desc:'DERSERT SILVER',    grupo:'G3',espessuras:{'2cm':{c1:29672,pvp:521}}},
      {desc:'ET. MARFIL',        grupo:'G3',espessuras:{'2cm':{c1:29672,pvp:521}}},
      {desc:'CHARCOAL SOAPSTONE',grupo:'G3',espessuras:{'2cm':{c1:29672,pvp:521}}},
      {desc:'CALACATTA TOVA',    grupo:'G3',espessuras:{'2cm':{c1:29672,pvp:521}}},
      {desc:'BLANCO ZEUS',       grupo:'G4',espessuras:{'2cm':{c1:40600,pvp:713}}},
      {desc:'XM NOLITA 23',      grupo:'G4',espessuras:{'2cm':{c1:40600,pvp:713}}},
      {desc:'ET. STATUARIO',     grupo:'G4',espessuras:{'2cm':{c1:40600,pvp:713}}},
      {desc:'XM RAW A',          grupo:'G4',espessuras:{'2cm':{c1:40600,pvp:713}}},
      {desc:'PEARL JASMINE',     grupo:'G4',espessuras:{'2cm':{c1:40600,pvp:713}}},
      {desc:'XM POBLENOU',       grupo:'G4',espessuras:{'2cm':{c1:40600,pvp:713}}},
      {desc:'XM FFROM 01',       grupo:'G4',espessuras:{'2cm':{c1:40600,pvp:713}}},
      {desc:'XM RAW G',          grupo:'G4',espessuras:{'2cm':{c1:40600,pvp:713}}},
      {desc:'XM FFROM 02',       grupo:'G4',espessuras:{'2cm':{c1:40600,pvp:713}}},
      {desc:'XM FFROM 03',       grupo:'G4',espessuras:{'2cm':{c1:40600,pvp:713}}},
      {desc:'XM RAW D',          grupo:'G4',espessuras:{'2cm':{c1:40600,pvp:713}}},
      {desc:'ET. MARQUINA',      grupo:'G5',espessuras:{'2cm':{c1:46808,pvp:822}}},
      {desc:'ET CALACATTA GOLD', grupo:'G6',espessuras:{'2cm':{c1:54272,pvp:954}}},
      {desc:'ETHEREAL NOCTIS',   grupo:'G6',espessuras:{'2cm':{c1:54272,pvp:954}}},
      {desc:'ETHEREAL GLOW',     grupo:'G6',espessuras:{'2cm':{c1:54272,pvp:954}}},
      {desc:'XM BLANC ÉLISÉE',   grupo:null,espessuras:{'2cm':{c1:63912,pvp:1123}}},
      {desc:'XM RIVIÈRE ROSE',   grupo:null,espessuras:{'2cm':{c1:63912,pvp:1123}}},
      {desc:'VERSAILLES IVORY',  grupo:null,espessuras:{'2cm':{c1:63912,pvp:1123}}},
      {desc:'ECLECTIC PEARL',    grupo:null,espessuras:{'2cm':{c1:63912,pvp:1123}}},
      {desc:'VICTORIAN SILVER',  grupo:null,espessuras:{'2cm':{c1:63912,pvp:1123}}},
      {desc:'XM JARDÍN EMERAL',  grupo:null,espessuras:{'2cm':{c1:63912,pvp:1123}}},
      {desc:'XM PARISIEN BLEU',  grupo:null,espessuras:{'2cm':{c1:63912,pvp:1123}}},
      {desc:'ROMANTIC ASH',      grupo:null,espessuras:{'2cm':{c1:63912,pvp:1123}}},
      {desc:'XM BOHEMIAN FLAME', grupo:null,espessuras:{'2cm':{c1:63912,pvp:1123}}},
      {desc:'XM CHATEAU BROWN',  grupo:null,espessuras:{'2cm':{c1:63912,pvp:1123}}},
    ],
    acabamentos:[
      {nome:'RODATAMPO',           c1:1320,pvp:24, unidade:'ml'},
      {nome:'CORTE BRUTO',         c1:1260,pvp:23, unidade:'un'},
      {nome:'REBAIXO À FACE',      c1:4410,pvp:80, unidade:'un'},
      {nome:'TRANSFORMAÇÃO POLIDO',c1:35,  pvp:56, unidade:'un'},
      {nome:'FURO',                c1:950, pvp:17, unidade:'un'},
      {nome:'CORTE 1/2 ESQUADRIA', c1:2310,pvp:47, unidade:'un'},
      {nome:'SILICONE',            c1:10,  pvp:18, unidade:'un'},
    ]
  },
  COMPAC:{
    materiais:[
      {desc:'GLACIAR',   grupo:'G1',espessuras:{'2cm':{c1:20856,pvp:366}}},
      {desc:'LUNA',      grupo:'G1',espessuras:{'2cm':{c1:20856,pvp:366}}},
      {desc:'ALASKA',    grupo:'G1',espessuras:{'2cm':{c1:20856,pvp:366}}},
      {desc:'ARENA',     grupo:'G1',espessuras:{'2cm':{c1:20856,pvp:366}}},
      {desc:'CENIZA',    grupo:'G1',espessuras:{'2cm':{c1:20856,pvp:366}}},
      {desc:'PLOMO',     grupo:'G1',espessuras:{'2cm':{c1:20856,pvp:366}}},
      {desc:'NOCTURNO',  grupo:'G1',espessuras:{'2cm':{c1:20856,pvp:366}}},
      {desc:'SNOW',      grupo:null, espessuras:{'2cm':{c1:24512,pvp:431}}},
      {desc:'MOON',      grupo:null, espessuras:{'2cm':{c1:24512,pvp:431}}},
      {desc:'SMOKE GREY',grupo:null, espessuras:{'2cm':{c1:24512,pvp:431}}},
    ],
    acabamentos:[
      {nome:'RODATAMPO',           c1:1320,pvp:24, unidade:'ml'},
      {nome:'CORTE BRUTO',         c1:1260,pvp:26, unidade:'un'},
      {nome:'REBAIXO À FACE',      c1:4410,pvp:90, unidade:'un'},
      {nome:'TRANSFORMAÇÃO POLIDO',c1:35,  pvp:56, unidade:'un'},
      {nome:'FURO',                c1:950, pvp:19, unidade:'un'},
      {nome:'CORTE 1/2 ESQUADRIA', c1:2310,pvp:47, unidade:'un'},
      {nome:'SILICONE',            c1:10,  pvp:18, unidade:'un'},
    ]
  },
  DEKTON:{
    materiais:[
      {desc:'KEENA',        grupo:'PROMOÇÃO',espessuras:{'2cm':{c1:26584,pvp:467},'1.2cm':{c1:21952,pvp:386}}},
      {desc:'MARINA',       grupo:'PROMOÇÃO',espessuras:{'2cm':{c1:26584,pvp:467},'1.2cm':{c1:21952,pvp:386}}},
      {desc:'THALA',        grupo:'PROMOÇÃO',espessuras:{'2cm':{c1:26584,pvp:467},'1.2cm':{c1:21952,pvp:386}}},
      {desc:'EVOK',         grupo:'PROMOÇÃO',espessuras:{'2cm':{c1:26584,pvp:467},'1.2cm':{c1:21952,pvp:386}}},
      {desc:'NACRE',        grupo:'PROMOÇÃO',espessuras:{'2cm':{c1:26584,pvp:467},'1.2cm':{c1:21952,pvp:386}}},
      {desc:'ARGENTIUM',    grupo:'PROMOÇÃO',espessuras:{'2cm':{c1:26584,pvp:467},'1.2cm':{c1:21952,pvp:386}}},
      {desc:'KELYA',        grupo:'PROMOÇÃO',espessuras:{'2cm':{c1:26584,pvp:467},'1.2cm':{c1:21952,pvp:386}}},
      {desc:'ENTZO',        grupo:null,      espessuras:{'2cm':{c1:28928,pvp:508},'1.2cm':{c1:23832,pvp:419}}},
      {desc:'KAIROS 22 KC', grupo:'G0',espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'MONNÉ KC',     grupo:'G0',espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'LUNAR 22 KC',  grupo:'G0',espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'AERIS KC',     grupo:'G0',espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'DANAE KC',     grupo:'G0',espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'DUNNA KC',     grupo:'G0',espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'KOVIK',        grupo:'G0',espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'KEON',         grupo:'G0',espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'TRILIUM',      grupo:'G0',espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'ETER',         grupo:'G0',espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'KEENA',        grupo:'G0',espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'THALA',        grupo:'G0',espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'EVOK',         grupo:'G0',espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'HALO KC',      grupo:'G1',espessuras:{'2cm':{c1:44112,pvp:775},'1.2cm':{c1:37912,pvp:666}}},
      {desc:'NACRE KC',     grupo:'G1',espessuras:{'2cm':{c1:44112,pvp:775},'1.2cm':{c1:37912,pvp:666}}},
      {desc:'SIRIUS25',     grupo:'G1',espessuras:{'2cm':{c1:44112,pvp:775},'1.2cm':{c1:37912,pvp:666}}},
      {desc:'KRETA',        grupo:'G1',espessuras:{'2cm':{c1:44112,pvp:775},'1.2cm':{c1:37912,pvp:666}}},
      {desc:'KIRA',         grupo:'G1',espessuras:{'2cm':{c1:44112,pvp:775},'1.2cm':{c1:37912,pvp:666}}},
      {desc:'BROMO',        grupo:'G1',espessuras:{'2cm':{c1:44112,pvp:775},'1.2cm':{c1:37912,pvp:666}}},
      {desc:'AURA 22 KC',   grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'ZENITH KC',    grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'POLAR KC',     grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'MARINA KC',    grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'SANDIK KC',    grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'ALBARIUM 22 KC',grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'ARGENTIUM KC', grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'NEBBIA KC',    grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'TREVI KC',     grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'MARMORIO KC',  grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'SABBIA KC',    grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'AVA KC',       grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'AVORIO KC',    grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'ADIA KC',      grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'UMBER',        grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'NEBU KC',      grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'GRIGIO KC',    grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'SOKE',         grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'CEPPO KC',     grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'GRAFITE',      grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'LAOS',         grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'KELYA',        grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'DOMOOS 25',    grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'KEDAR',        grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'ZIRA',         grupo:'G2',espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'UYUNI KC',     grupo:'G3',espessuras:{'2cm':{c1:60272,pvp:1324},'1.2cm':{c1:48218,pvp:847}}},
      {desc:'NEURAL KC',    grupo:'G3',espessuras:{'2cm':{c1:60272,pvp:1324},'1.2cm':{c1:48218,pvp:847}}},
      {desc:'REM KC',       grupo:'G3',espessuras:{'2cm':{c1:60272,pvp:1324},'1.2cm':{c1:48218,pvp:847}}},
      {desc:'NARA',         grupo:'G3',espessuras:{'2cm':{c1:60272,pvp:1324},'1.2cm':{c1:48218,pvp:847}}},
      {desc:'NATURA 22 KC', grupo:'G3',espessuras:{'2cm':{c1:60272,pvp:1324},'1.2cm':{c1:48218,pvp:847}}},
      {desc:'VIGIL KC',     grupo:'G3',espessuras:{'2cm':{c1:60272,pvp:1324},'1.2cm':{c1:48218,pvp:847}}},
      {desc:'LAURENT',      grupo:'G3',espessuras:{'2cm':{c1:60272,pvp:1324},'1.2cm':{c1:48218,pvp:847}}},
      {desc:'SOMNIA',       grupo:'G3',espessuras:{'2cm':{c1:60272,pvp:1324},'1.2cm':{c1:48218,pvp:847}}},
      {desc:'MORPHEUS KC',  grupo:'G3',espessuras:{'2cm':{c1:60272,pvp:1324},'1.2cm':{c1:48218,pvp:847}}},
      {desc:'REVERIE KC',   grupo:'G3',espessuras:{'2cm':{c1:60272,pvp:1324},'1.2cm':{c1:48218,pvp:847}}},
      {desc:'HELENA 22 KC', grupo:'G4',espessuras:{'2cm':{c1:72240,pvp:1587},'1.2cm':{c1:57792,pvp:1015}}},
      {desc:'LUCID KC',     grupo:'G4',espessuras:{'2cm':{c1:72240,pvp:1587},'1.2cm':{c1:57792,pvp:1015}}},
      {desc:'BERGEN KC',    grupo:'G4',espessuras:{'2cm':{c1:72240,pvp:1587},'1.2cm':{c1:57792,pvp:1015}}},
      {desc:'TRANCE KC',    grupo:'G4',espessuras:{'2cm':{c1:72240,pvp:1587},'1.2cm':{c1:57792,pvp:1015}}},
      {desc:'AWAKE KC',     grupo:'G4',espessuras:{'2cm':{c1:72240,pvp:1587},'1.2cm':{c1:57792,pvp:1015}}},
      {desc:'ARGA KC',      grupo:'G4',espessuras:{'2cm':{c1:72240,pvp:1587},'1.2cm':{c1:57792,pvp:1015}}},
      {desc:'KHALO KC',     grupo:'G4',espessuras:{'2cm':{c1:72240,pvp:1587},'1.2cm':{c1:57792,pvp:1015}}},
    ],
    acabamentos:[
      {nome:'RODATAMPO',           c1:3200,pvp:59,  unidade:'ml'},
      {nome:'CORTE BRUTO',         c1:3200,pvp:66,  unidade:'un'},
      {nome:'REBAIXO À FACE',      c1:5670,pvp:116, unidade:'un'},
      {nome:'TRANSFORMAÇÃO POLIDO',c1:5000,pvp:90,  unidade:'un'},
      {nome:'FURO',                c1:1260,pvp:26,  unidade:'un'},
      {nome:'CORTE 1/2 ESQUADRIA', c1:2840,pvp:58,  unidade:'un'},
      {nome:'SILICONE',            c1:10,  pvp:18,  unidade:'un'},
    ]
  }
}

const TRANSPORTE = [
  {label:'VISEU',   c1:19000,pvp:300},
  {label:'> 30 KM', c1:30000,pvp:480},
  {label:'> 50 KM', c1:45000,pvp:720},
]

const TIPOS_PEDRA = ['GRANITOS','SILESTONES','COMPAC','DEKTON']
const TIPOS_OUTROS = ['AGLOMERADO','MADEIRA','FENÓLICO']
const TIPOS_ALL = [...TIPOS_PEDRA, ...TIPOS_OUTROS]

function uuid() { return Math.random().toString(36).slice(2,9) }
function f2(n)  { return parseFloat(n||0).toFixed(2) }
function c1fmt(c1) { return (c1/100).toFixed(2) }

function calcPeca(p) {
  const m2 = (p.segmentos||[]).reduce((s,sg)=>s+(parseFloat(sg.comp)||0)*(parseFloat(sg.larg)||0),0)
  let pvpTampo=0, c1Tampo=0, esp=null
  if (TIPOS_PEDRA.includes(p.tipo) && p.desc) {
    const mat = ANIGRACO[p.tipo]
    const ref = mat?.materiais.find(m=>m.desc===p.desc && m.grupo===p.grupo)
             || mat?.materiais.find(m=>m.desc===p.desc)
    esp = ref?.espessuras[p.espessura]
    if (esp) { pvpTampo=esp.pvp*m2; c1Tampo=esp.c1*m2 }
  } else {
    pvpTampo=(parseFloat(p.precoPvp)||0)*m2
    c1Tampo =(parseFloat(p.precoC1)||0)*100*m2
  }
  const pvpAcab=(p.acabamentos||[]).reduce((s,a)=>s+(a.pvp||0)*(a.qty||1),0)
  const c1Acab =(p.acabamentos||[]).reduce((s,a)=>s+(a.c1||0)*(a.qty||1),0)
  return { m2, pvpTampo, c1Tampo, pvpAcab, c1Acab, pvp:pvpTampo+pvpAcab, c1raw:c1Tampo+c1Acab, esp }
}

// ── Lista principal ────────────────────────────────────────────────────────
export default function Tampos({ showToast }) {
  const [calculos, setCalculos]   = useState([])
  const [orcamentos, setOrcamentos] = useState([])
  const [current, setCurrent]     = useState(null)

  useEffect(() => {
    const u1=onSnapshot(collection(db,'tampos'),snap=>setCalculos(snap.docs.map(d=>({id:d.id,...d.data()}))))
    const u2=onSnapshot(collection(db,'orcamentos'),snap=>setOrcamentos(snap.docs.map(d=>({id:d.id,...d.data()}))))
    return ()=>{u1();u2()}
  },[])

  const novoProjeto = (tipo) => setCurrent({
    id:null, nome:'', cliente:'', tipo,
    pecas:[{id:uuid(),label:'Peça 1',tipo,desc:'',grupo:null,espessura:'2cm',
            segmentos:[{id:uuid(),label:'Seg.1',comp:'',larg:''}],acabamentos:[]}],
    transporte:null, desconto:'', descontoTipo:'%', notas:''
  })

  const totProj = (c) => {
    let pvp=0,c1=0
    ;(c.pecas||[]).forEach(p=>{const r=calcPeca(p);pvp+=r.pvp;c1+=r.c1raw})
    if(c.transporte){pvp+=c.transporte.pvp;c1+=c.transporte.c1}
    const desc=c.desconto>0?(c.descontoTipo==='%'?pvp*(c.desconto/100):parseFloat(c.desconto)):0
    return {pvp:pvp-desc,c1}
  }

  if (current) return <Calculadora current={current} setCurrent={setCurrent}
    orcamentos={orcamentos} showToast={showToast} onBack={()=>setCurrent(null)} />

  return (
    <div className="neo-screen">
      {/* Topbar */}
      <div className="neo-topbar">
        <span style={{fontFamily:"'Barlow Condensed'",fontSize:13,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-text)'}}>
          Tampos
        </span>
        {calculos.length>0 && (
          <button className="neo-btn neo-btn-danger" style={{height:28,fontSize:8}}
            onClick={()=>{ if(confirm('Limpar todos os cálculos?')) calculos.forEach(c=>deleteDoc(doc(db,'tampos',c.id))) }}>
            Limpar
          </button>
        )}
      </div>

      <div className="neo-scroll" style={{flex:1,overflowY:'auto',padding:'16px 16px 32px'}}>

        {/* Secções por tipo */}
        {TIPOS_ALL.map(tipo => {
          const calcs = calculos.filter(c=>c.tipo===tipo)
          const isPedra = TIPOS_PEDRA.includes(tipo)
          const mat = ANIGRACO[tipo]
          return (
            <div key={tipo} style={{marginBottom:20}}>
              {/* Header tipo */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10,paddingLeft:4}}>
                <div>
                  <span style={{fontFamily:"'Barlow Condensed'",fontSize:13,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--neo-text)'}}>{tipo}</span>
                  {isPedra && <span style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--neo-text3)',letterSpacing:'0.1em',marginLeft:10}}>{mat.materiais.length} refs · ANIGRACO</span>}
                </div>
                <button className="neo-btn neo-btn-ghost" style={{height:28,fontSize:9}}
                  onClick={()=>novoProjeto(tipo)}>
                  + Cálculo
                </button>
              </div>

              {/* Cálculos guardados */}
              {calcs.length===0 && (
                <div className="neo-well" style={{padding:'16px',textAlign:'center'}}>
                  <span style={{fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-text3)'}}>Nenhum cálculo</span>
                </div>
              )}
              {calcs.map(c=>{
                const res=totProj(c)
                return (
                  <div key={c.id} className="neo-surface" style={{padding:'14px 16px',marginBottom:8,display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}
                    onClick={()=>setCurrent({...c})}>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'Barlow Condensed'",fontSize:14,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--neo-text)',marginBottom:3}}>{c.nome||'Sem nome'}</div>
                      {c.cliente&&<div style={{fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--neo-text3)'}}>{c.cliente}</div>}
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontFamily:"'Barlow Condensed'",fontSize:16,fontWeight:700,color:'var(--neo-gold)'}}>{f2(res.pvp)} €</div>
                      <div style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--neo-text3)',marginTop:1}}>C1: {c1fmt(res.c1)}</div>
                    </div>
                    <button onClick={e=>{e.stopPropagation();if(confirm('Eliminar?'))deleteDoc(doc(db,'tampos',c.id))}}
                      style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--neo-text3)',fontSize:13,padding:'4px',lineHeight:1}}>✕</button>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Calculadora ────────────────────────────────────────────────────────────
function Calculadora({ current, setCurrent, orcamentos, showToast, onBack }) {
  const [tab, setTab]           = useState('pecas')
  const [matModal, setMatModal] = useState(null)
  const [exportModal, setExportModal] = useState(false)
  const [formulaOpen, setFormulaOpen] = useState(false)
  const [margem, setMargem]     = useState(25)

  const upd = (k,v) => setCurrent(c=>({...c,[k]:v}))
  const updPeca=(id,k,v)=>upd('pecas',current.pecas.map(p=>p.id===id?{...p,[k]:v}:p))

  const addPeca = () => {
    const n=(current.pecas||[]).length+1
    upd('pecas',[...current.pecas,{id:uuid(),label:`Peça ${n}`,tipo:current.tipo,desc:'',grupo:null,espessura:'2cm',segmentos:[{id:uuid(),label:'Seg.1',comp:'',larg:''}],acabamentos:[]}])
  }
  const delPeca=(id)=>{if(current.pecas.length<=1){showToast('Mínimo 1 peça');return};upd('pecas',current.pecas.filter(p=>p.id!==id))}
  const addSeg=(pid)=>{const p=current.pecas.find(x=>x.id===pid);const n=(p.segmentos||[]).length+1;updPeca(pid,'segmentos',[...(p.segmentos||[]),{id:uuid(),label:`Seg.${n}`,comp:'',larg:''}])}
  const updSeg=(pid,sid,k,v)=>{const p=current.pecas.find(x=>x.id===pid);updPeca(pid,'segmentos',p.segmentos.map(s=>s.id===sid?{...s,[k]:v}:s))}
  const delSeg=(pid,sid)=>{const p=current.pecas.find(x=>x.id===pid);if((p.segmentos||[]).length<=1){showToast('Mínimo 1');return};updPeca(pid,'segmentos',p.segmentos.filter(s=>s.id!==sid))}
  const toggleAcab=(pid,acab)=>{const p=current.pecas.find(x=>x.id===pid);const ex=(p.acabamentos||[]).find(a=>a.nome===acab.nome);updPeca(pid,'acabamentos',ex?(p.acabamentos||[]).filter(a=>a.nome!==acab.nome):[...(p.acabamentos||[]),{...acab,qty:1}])}
  const updAcabQty=(pid,nome,qty)=>{const p=current.pecas.find(x=>x.id===pid);updPeca(pid,'acabamentos',(p.acabamentos||[]).map(a=>a.nome===nome?{...a,qty:Math.max(1,parseInt(qty)||1)}:a))}
  const updAcabMl=(pid,nome,ml)=>{const p=current.pecas.find(x=>x.id===pid);updPeca(pid,'acabamentos',(p.acabamentos||[]).map(a=>a.nome===nome?{...a,qty:parseFloat(ml)||0}:a))}

  const totGeral = () => {
    let pvp=0,c1=0
    ;(current.pecas||[]).forEach(p=>{const r=calcPeca(p);pvp+=r.pvp;c1+=r.c1raw})
    if(current.transporte){pvp+=current.transporte.pvp;c1+=current.transporte.c1}
    const desc=parseFloat(current.desconto)>0?(current.descontoTipo==='%'?pvp*(parseFloat(current.desconto)/100):parseFloat(current.desconto)):0
    return {pvp:pvp-desc,c1,desc,pvpBruto:pvp}
  }
  const T=totGeral()

  const save = async () => {
    if(!current.nome.trim()){showToast('Nome obrigatório');return}
    const data={...current};delete data.id
    if(current.id){await setDoc(doc(db,'tampos',current.id),data)}
    else{const r=await addDoc(collection(db,'tampos'),data);setCurrent(c=>({...c,id:r.id}))}
    showToast('Guardado')
  }

  const exportarOrc = async (orcId) => {
    const orc=orcamentos.find(o=>o.id===orcId);if(!orc)return
    const items=[...(orc.items||[])]
    ;(current.pecas||[]).forEach(p=>{
      const r=calcPeca(p)
      if(r.m2>0) items.push({artId:'t_'+uuid(),ref:'TAMPO',desc:`${p.label}${p.desc?' — '+p.desc:''} ${p.espessura||''} (${r.m2.toFixed(3)} m²)`,cat:'Tampos',price:r.pvpTampo,qty:1})
      ;(p.acabamentos||[]).forEach(a=>items.push({artId:'t_'+uuid(),ref:'ACAB',desc:`${p.label} — ${a.nome} ${a.unidade==='ml'?a.qty+' ml':'×'+a.qty}`,cat:'Tampos',price:(a.pvp||0)*(a.qty||1),qty:1}))
    })
    if(current.transporte) items.push({artId:'t_'+uuid(),ref:'TRANSP',desc:`Transporte — ${current.transporte.label}`,cat:'Tampos',price:current.transporte.pvp,qty:1})
    await setDoc(doc(db,'orcamentos',orcId),{...orc,items})
    showToast('Exportado');setExportModal(false)
  }

  const gerarPDF = () => {
    const hoje=new Date().toLocaleDateString('pt-PT')
    let h=`<html><head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;margin:0;padding:32px;font-size:13px;color:#111;background:#fff}
.hdr{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #111;padding-bottom:16px;margin-bottom:20px}
.logo{font-size:22px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase}
.logo span{color:#c8a96e}
.ind{background:#fff8e8;border:1px solid #c8a96e;padding:8px;text-align:center;font-size:11px;color:#8a6e3a;margin-bottom:20px;letter-spacing:0.06em}
.sec{margin-bottom:18px}
.sec-t{font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#888;border-bottom:1px solid #eee;padding-bottom:4px;margin-bottom:8px}
.row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f5f5f5;font-size:12px}
.tot-box{background:#f5f5f5;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;margin-top:24px}
.note{font-size:11px;color:#888;margin-top:16px;font-style:italic}
</style></head><body>`
    h+=`<div class="hdr"><div class="logo">HM·<span>Work</span>·Kit</div><div style="font-size:11px;color:#666;text-align:right"><b>${current.nome||'Projecto de Tampo'}</b>${current.cliente?`<br>${current.cliente}`:''}<br>${hoje}</div></div>`
    h+=`<div class="ind">DOCUMENTO INDICATIVO — SUJEITO A CONFIRMAÇÃO</div>`
    ;(current.pecas||[]).forEach(p=>{
      const r=calcPeca(p)
      h+=`<div class="sec"><div class="sec-t">${p.label}${p.desc?' — '+p.desc:''}</div>`
      if(r.m2>0&&r.esp) h+=`<div class="row"><span>Tampo ${p.espessura} · ${r.m2.toFixed(3)} m² × ${f2(r.esp.pvp)} €/m²</span><span><b>${f2(r.pvpTampo)} €</b></span></div>`
      else if(r.m2>0&&!TIPOS_PEDRA.includes(p.tipo)&&p.precoPvp) h+=`<div class="row"><span>${p.tipo} · ${r.m2.toFixed(3)} m²</span><span><b>${f2(r.pvpTampo)} €</b></span></div>`
      ;(p.acabamentos||[]).forEach(a=>h+=`<div class="row"><span>${a.nome} ${a.unidade==='ml'?a.qty+' ml':'×'+a.qty}</span><span><b>${f2((a.pvp||0)*(a.qty||1))} €</b></span></div>`)
      h+=`</div>`
    })
    if(current.transporte) h+=`<div class="sec"><div class="sec-t">Transporte e Montagem</div><div class="row"><span>${current.transporte.label}</span><span><b>${f2(current.transporte.pvp)} €</b></span></div></div>`
    if(T.desc>0) h+=`<div class="row" style="color:#888"><span>Desconto${current.descontoTipo==='%'?' ('+current.desconto+'%)':''}</span><span>− ${f2(T.desc)} €</span></div>`
    h+=`<div class="tot-box"><span style="font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#666">Total PVP</span><span style="font-size:26px;font-weight:800">${f2(T.pvp)} €</span></div>`
    if(current.notas) h+=`<div class="note">${current.notas}</div>`
    h+=`</body></html>`
    const w=window.open('','_blank');w.document.write(h);w.document.close();setTimeout(()=>w.print(),400)
  }

  return (
    <div className="neo-screen">
      {/* Topbar */}
      <div className="neo-topbar">
        <button className="neo-btn neo-btn-ghost" style={{padding:'0 10px',fontSize:10}} onClick={onBack}>← Tampos</button>
        <div style={{display:'flex',gap:8}}>
          <button className="neo-btn neo-btn-ghost" style={{height:30,padding:'0 10px',fontSize:9}} onClick={gerarPDF}>PDF</button>
          <button className="neo-btn neo-btn-ghost" style={{height:30,padding:'0 10px',fontSize:9}} onClick={()=>setExportModal(true)}>↗ Orc.</button>
          <button className="neo-btn neo-btn-gold" style={{height:30,padding:'0 14px',fontSize:9}} onClick={save}>Guardar</button>
        </div>
      </div>

      {/* Total */}
      <div className="neo-total-bar">
        <div>
          <div style={{fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--neo-text3)',marginBottom:4}}>C1 total</div>
          <CopyVal val={c1fmt(T.c1)} label="C1" showToast={showToast} large />
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--neo-text3)',marginBottom:4}}>PVP total</div>
          <div style={{fontFamily:"'Barlow Condensed'",fontSize:24,fontWeight:700,color:'var(--neo-gold)'}}>{f2(T.pvp)} €</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="neo-tabs">
        <button className={`neo-tab ${tab==='pecas'?'active':''}`} onClick={()=>setTab('pecas')}>Peças</button>
        <button className={`neo-tab ${tab==='resumo'?'active':''}`} onClick={()=>setTab('resumo')}>Resumo C1</button>
      </div>

      <div className="neo-scroll" style={{flex:1,overflowY:'auto'}}>

      {/* ── TAB PEÇAS ── */}
      {tab==='pecas' && <>
        {/* Identificação */}
        <div style={{padding:'0 16px 4px'}}>
          <div className="neo-surface" style={{padding:'16px'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <div><label className="neo-label">Nome</label><input className="neo-input" value={current.nome} onChange={e=>upd('nome',e.target.value)} placeholder="ex: Cozinha Lisboa"/></div>
              <div><label className="neo-label">Cliente</label><input className="neo-input" value={current.cliente||''} onChange={e=>upd('cliente',e.target.value)} placeholder="Cliente"/></div>
            </div>
          </div>
        </div>

        {/* Fórmula */}
        <div style={{padding:'8px 16px 0'}}>
          <button onClick={()=>setFormulaOpen(o=>!o)}
            style={{background:'transparent',border:'none',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-text3)',display:'flex',alignItems:'center',gap:6,padding:'6px 0'}}>
            <span style={{fontSize:8}}>{formulaOpen?'▼':'▶'}</span> Fórmula PVP
          </button>
          {formulaOpen && (
            <div className="neo-well" style={{padding:'14px',marginBottom:8}}>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--neo-text3)',letterSpacing:'0.1em',marginBottom:12}}>
                PVP = (C1 ÷ (1 − margem)) × 1.23
              </div>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <label className="neo-label" style={{marginBottom:0,whiteSpace:'nowrap'}}>Margem %</label>
                <input type="number" className="neo-input-num" value={margem} onChange={e=>setMargem(parseFloat(e.target.value)||0)} style={{width:70}}/>
                {T.c1>0 && (
                  <div style={{marginLeft:'auto',fontFamily:"'Barlow Condensed'",fontSize:12,color:'var(--neo-gold)'}}>
                    = {f2((T.c1/100/(1-margem/100))*1.23)} €
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Peças */}
        {(current.pecas||[]).map((p,pi) => {
          const res=calcPeca(p)
          const isPedra=TIPOS_PEDRA.includes(p.tipo)
          const mat=ANIGRACO[p.tipo]
          const ref=mat?.materiais.find(m=>m.desc===p.desc&&m.grupo===p.grupo)||mat?.materiais.find(m=>m.desc===p.desc)
          const espDisp=ref?Object.keys(ref.espessuras):[]
          const acabDisp=mat?.acabamentos||[]

          return (
            <div key={p.id} className="neo-peca">
              {/* Header peça */}
              <div className="neo-peca-header">
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <input value={p.label} onChange={e=>updPeca(p.id,'label',e.target.value)}
                    style={{background:'transparent',border:'none',fontFamily:"'Barlow Condensed'",fontSize:12,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--neo-text2)',outline:'none',width:70}}/>
                  {res.m2>0 && <span style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--neo-text3)'}}>{res.m2.toFixed(3)} m²</span>}
                  {res.pvp>0 && <span style={{fontFamily:"'Barlow Condensed'",fontSize:12,color:'var(--neo-gold)'}}>{f2(res.pvp)} €</span>}
                </div>
                {current.pecas.length>1 && (
                  <button onClick={()=>delPeca(p.id)} style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--neo-text3)',fontSize:13}}>✕</button>
                )}
              </div>

              <div className="neo-peca-body">
                {/* Botão material */}
                <button className="neo-mat-btn" onClick={()=>setMatModal(p.id)} style={{marginBottom:12}}>
                  <div>
                    <label className="neo-label" style={{marginBottom:4,pointerEvents:'none'}}>Material</label>
                    <div style={{fontFamily:"'Barlow Condensed'",fontSize:15,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase',color:p.desc?'var(--neo-text)':'var(--neo-text3)'}}>
                      {p.desc?`${p.tipo.charAt(0)+p.tipo.slice(1).toLowerCase()} — ${p.desc}`:'Seleccionar →'}
                    </div>
                    {p.grupo&&<div style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--neo-text3)',marginTop:2}}>Grupo {p.grupo}</div>}
                  </div>
                  {res.esp&&(
                    <div style={{textAlign:'right',flexShrink:0}}>
                      <div style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--neo-text3)'}}>PVP/m²</div>
                      <div style={{fontFamily:"'Barlow Condensed'",fontSize:16,color:'var(--neo-gold)',fontWeight:600}}>{f2(res.esp.pvp)} €</div>
                    </div>
                  )}
                </button>

                {/* Preços manuais (não pedra) */}
                {!isPedra && (
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                    <div><label className="neo-label">PVP/m² (€)</label><input type="number" className="neo-input-num" value={p.precoPvp||''} onChange={e=>updPeca(p.id,'precoPvp',e.target.value)} placeholder="0.00"/></div>
                    <div><label className="neo-label">C1/m² (€)</label><input type="number" className="neo-input-num" value={p.precoC1||''} onChange={e=>updPeca(p.id,'precoC1',e.target.value)} placeholder="0.00"/></div>
                  </div>
                )}

                {/* Espessuras */}
                {espDisp.length>0 && (
                  <div style={{marginBottom:14}}>
                    <label className="neo-label">Espessura</label>
                    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                      {espDisp.map(e=>{
                        const ed=ref.espessuras[e]
                        return(
                          <button key={e} className={`neo-chip ${p.espessura===e?'active':''}`} onClick={()=>updPeca(p.id,'espessura',e)}>
                            {e}{ed&&<span style={{fontWeight:300,marginLeft:6,fontSize:9}}>{f2(ed.pvp)} €/m²</span>}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Segmentos */}
                <div style={{marginBottom:14}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                    <label className="neo-label" style={{marginBottom:0}}>Segmentos (metros)</label>
                    <button onClick={()=>addSeg(p.id)} style={{background:'transparent',border:'none',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--neo-gold)'}}>+ Seg.</button>
                  </div>
                  {(p.segmentos||[]).map(seg=>(
                    <div key={seg.id} className="neo-seg" style={{gridTemplateColumns:'auto 1fr 1fr 70px'+(p.segmentos.length>1?' auto':'')}}>
                      <input value={seg.label} onChange={e=>updSeg(p.id,seg.id,'label',e.target.value)}
                        style={{background:'transparent',border:'none',fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--neo-text3)',outline:'none',width:44,alignSelf:'end',paddingBottom:4}}/>
                      <div>
                        <label className="neo-label" style={{fontSize:8}}>Comp. (m)</label>
                        <input type="number" className="neo-input-num" value={seg.comp} onChange={e=>updSeg(p.id,seg.id,'comp',e.target.value)} placeholder="2.40" step="0.01" min="0"/>
                      </div>
                      <div>
                        <label className="neo-label" style={{fontSize:8}}>Larg. (m)</label>
                        <input type="number" className="neo-input-num" value={seg.larg} onChange={e=>updSeg(p.id,seg.id,'larg',e.target.value)} placeholder="0.60" step="0.01" min="0"/>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <label className="neo-label" style={{fontSize:8}}>m²</label>
                        <div style={{fontFamily:"'Barlow Condensed'",fontSize:16,fontWeight:700,color:'var(--neo-gold)',paddingTop:4}}>
                          {f2((parseFloat(seg.comp)||0)*(parseFloat(seg.larg)||0))}
                        </div>
                      </div>
                      {p.segmentos.length>1&&(
                        <button onClick={()=>delSeg(p.id,seg.id)} style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--neo-text3)',fontSize:11,alignSelf:'end',paddingBottom:4}}>✕</button>
                      )}
                    </div>
                  ))}
                  {(p.segmentos||[]).length>1&&(
                    <div style={{display:'flex',justifyContent:'flex-end',padding:'6px 4px 0',gap:8}}>
                      <span style={{fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--neo-text3)'}}>Total</span>
                      <span style={{fontFamily:"'Barlow Condensed'",fontSize:13,fontWeight:700,color:'var(--neo-text)'}}>{res.m2.toFixed(4)} m²</span>
                    </div>
                  )}
                </div>

                {/* Rodatampo */}
                {acabDisp.length>0 && (()=>{
                  const ra=acabDisp.find(a=>a.nome==='RODATAMPO')
                  const rActive=(p.acabamentos||[]).find(a=>a.nome==='RODATAMPO')
                  if(!ra) return null
                  return (
                    <div style={{marginBottom:12,padding:'12px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div className={`neo-toggle ${rActive?'on':''}`} onClick={()=>toggleAcab(p.id,ra)}>
                          <div className="neo-toggle-knob"/>
                        </div>
                        <label className="neo-label" style={{marginBottom:0,flex:1}}>Rodatampo</label>
                        {rActive ? (
                          <>
                          <input type="number" className="neo-input-num" value={rActive.qty||''} onChange={e=>updAcabMl(p.id,'RODATAMPO',e.target.value)} placeholder="0.00" step="0.01" min="0" style={{width:70}}/>
                          <span style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--neo-text3)'}}>ml</span>
                          <span style={{fontFamily:"'Barlow Condensed'",fontSize:13,color:'var(--neo-gold)',marginLeft:4,minWidth:60,textAlign:'right'}}>{f2((ra.pvp||0)*(rActive.qty||0))} €</span>
                          </>
                        ) : (
                          <span style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--neo-text3)'}}>{f2(ra.pvp)} €/ml</span>
                        )}
                      </div>
                    </div>
                  )
                })()}

                {/* Acabamentos */}
                {acabDisp.filter(a=>a.nome!=='RODATAMPO').map(acab=>{
                  const active=(p.acabamentos||[]).find(a=>a.nome===acab.nome)
                  return(
                    <div key={acab.nome} style={{padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div className={`neo-toggle ${active?'on':''}`} onClick={()=>toggleAcab(p.id,acab)}>
                          <div className="neo-toggle-knob"/>
                        </div>
                        <span style={{flex:1,fontFamily:"'Barlow Condensed'",fontSize:11,letterSpacing:'0.04em',color:active?'var(--neo-text)':'var(--neo-text2)'}}>{acab.nome}</span>
                        {active ? (
                          <>
                          <div className="neo-qty">
                            <button className="neo-qty-btn" onClick={()=>updAcabQty(p.id,acab.nome,(active.qty||1)-1)}>−</button>
                            <span className="neo-qty-val">{active.qty||1}</span>
                            <button className="neo-qty-btn" onClick={()=>updAcabQty(p.id,acab.nome,(active.qty||1)+1)}>+</button>
                          </div>
                          <span style={{fontFamily:"'Barlow Condensed'",fontSize:13,color:'var(--neo-gold)',minWidth:60,textAlign:'right'}}>{f2((acab.pvp||0)*(active.qty||1))} €</span>
                          </>
                        ) : (
                          <span style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--neo-text3)'}}>{f2(acab.pvp)} €/un</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* + Peça */}
        <div style={{padding:'8px 16px'}}>
          <button className="neo-btn neo-btn-ghost" style={{width:'100%',height:38,border:'1px dashed rgba(255,255,255,0.08)'}} onClick={addPeca}>
            + Adicionar peça
          </button>
        </div>

        {/* Transporte */}
        <div style={{padding:'8px 16px'}}>
          <div className="neo-surface" style={{padding:'16px'}}>
            <label className="neo-label">Transporte e Montagem</label>
            <div style={{display:'flex',gap:10}}>
              {TRANSPORTE.map(t=>(
                <button key={t.label} className={`neo-transp ${current.transporte?.label===t.label?'active':''}`}
                  onClick={()=>upd('transporte',current.transporte?.label===t.label?null:t)}>
                  <div style={{fontFamily:"'Barlow Condensed'",fontSize:12,fontWeight:700,letterSpacing:'0.08em',color:current.transporte?.label===t.label?'var(--neo-gold)':'var(--neo-text)'}}>{t.label}</div>
                  <div style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--neo-text3)',marginTop:3}}>{f2(t.pvp)} €</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desconto */}
        <div style={{padding:'8px 16px'}}>
          <div className="neo-surface" style={{padding:'16px'}}>
            <label className="neo-label">Desconto</label>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <input type="number" className="neo-input-num" value={current.desconto||''} onChange={e=>upd('desconto',e.target.value)} placeholder="0" min="0" style={{width:90}}/>
              {['%','€'].map(t=>(
                <button key={t} className={`neo-chip ${current.descontoTipo===t?'active':''}`} style={{padding:'6px 14px'}} onClick={()=>upd('descontoTipo',t)}>{t}</button>
              ))}
              {parseFloat(current.desconto)>0 && (
                <span style={{fontFamily:"'Barlow Condensed'",fontSize:13,color:'var(--neo-text2)',marginLeft:'auto'}}>− {f2(T.desc)} €</span>
              )}
            </div>
          </div>
        </div>

        {/* Notas */}
        <div style={{padding:'8px 16px 32px'}}>
          <label className="neo-label">Notas</label>
          <textarea className="neo-input" value={current.notas||''} onChange={e=>upd('notas',e.target.value)} placeholder="Observações…" style={{resize:'none',minHeight:52}}/>
        </div>
      </>}

      {/* ── TAB RESUMO C1 ── */}
      {tab==='resumo' && (
        <div style={{padding:'8px 0 32px'}}>
          {(current.pecas||[]).map(p=>{
            const r=calcPeca(p)
            if(!p.desc && TIPOS_PEDRA.includes(p.tipo)) return null
            return(
              <div key={p.id} style={{marginBottom:4}}>
                <div style={{padding:'12px 16px 6px',fontFamily:"'Barlow Condensed'",fontSize:10,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--neo-text2)'}}>{p.label}{p.desc?' — '+p.desc:''}{p.espessura?' '+p.espessura:''}</div>
                {r.m2>0&&r.esp&&<ResumoRow label={`Tampo · ${r.m2.toFixed(3)} m²`} c1={r.c1Tampo} pvp={r.pvpTampo} extra={`${c1fmt(r.esp.c1)} €/m² × ${r.m2.toFixed(3)}`} showToast={showToast}/>}
                {r.m2>0&&!TIPOS_PEDRA.includes(p.tipo)&&p.precoC1&&<ResumoRow label={`${p.tipo} · ${r.m2.toFixed(3)} m²`} c1={r.c1Tampo} pvp={r.pvpTampo} showToast={showToast}/>}
                {(p.acabamentos||[]).map(a=>(
                  <ResumoRow key={a.nome} label={`${a.nome} ${a.unidade==='ml'?a.qty+' ml':'×'+a.qty}`} c1={(a.c1||0)*(a.qty||1)} pvp={(a.pvp||0)*(a.qty||1)} showToast={showToast}/>
                ))}
              </div>
            )
          })}
          {current.transporte&&(
            <div>
              <div style={{padding:'12px 16px 6px',fontFamily:"'Barlow Condensed'",fontSize:10,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--neo-text2)'}}>Transporte</div>
              <ResumoRow label={current.transporte.label} c1={current.transporte.c1} pvp={current.transporte.pvp} showToast={showToast}/>
            </div>
          )}
          {T.desc>0&&(
            <div style={{padding:'10px 16px',display:'flex',justifyContent:'space-between'}}>
              <span style={{fontFamily:"'Barlow Condensed'",fontSize:11,color:'var(--neo-text2)'}}>Desconto</span>
              <span style={{fontFamily:"'Barlow Condensed'",fontSize:12,color:'var(--neo-text2)'}}>− {f2(T.desc)} €</span>
            </div>
          )}
          {/* Total */}
          <div style={{margin:'16px 16px 0'}}>
            <div className="neo-surface" style={{padding:'18px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--neo-text3)',marginBottom:8}}>C1 total</div>
                <CopyVal val={c1fmt(T.c1)} label="C1 total" showToast={showToast} large/>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--neo-text3)',marginBottom:4}}>PVP total</div>
                <div style={{fontFamily:"'Barlow Condensed'",fontSize:24,fontWeight:700,color:'var(--neo-gold)'}}>{f2(T.pvp)} €</div>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>

      {/* Modal material */}
      {matModal && (
        <MaterialModal tipoProjeto={current.tipo}
          onSelect={(tipo,desc,grupo,espessura)=>{
            upd('pecas',current.pecas.map(p=>p.id===matModal?{...p,tipo,desc,grupo,espessura,acabamentos:[]}:p))
            setMatModal(null)
          }}
          onClose={()=>setMatModal(null)}/>
      )}

      {/* Modal exportar */}
      <div className={`neo-overlay ${exportModal?'open':''}`}>
        <div className="neo-modal">
          <div className="neo-modal-head">Exportar para orçamento<button className="neo-modal-close" onClick={()=>setExportModal(false)}>✕</button></div>
          {orcamentos.length===0&&<div style={{padding:'20px 0',textAlign:'center',fontFamily:"'Barlow Condensed'",fontSize:10,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-text3)'}}>Nenhum orçamento</div>}
          {orcamentos.map(o=>(
            <div key={o.id} onClick={()=>exportarOrc(o.id)} style={{padding:'14px 0',borderBottom:'1px solid rgba(255,255,255,0.05)',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontFamily:"'Barlow Condensed'",fontSize:14,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--neo-text)'}}>{o.name}</div>
                {o.cliente&&<div style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--neo-text3)',marginTop:2}}>{o.cliente}</div>}
              </div>
              <span style={{color:'var(--neo-gold)'}}>→</span>
            </div>
          ))}
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:20}}>
            <button className="neo-btn neo-btn-ghost" onClick={()=>setExportModal(false)}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Modal material ─────────────────────────────────────────────────────────
function MaterialModal({ tipoProjeto, onSelect, onClose }) {
  const [tipo, setTipo] = useState(TIPOS_PEDRA.includes(tipoProjeto)?tipoProjeto:'SILESTONES')
  const [grupo, setGrupo] = useState('TODOS')
  const [search, setSearch] = useState('')

  const mat=ANIGRACO[tipo]
  const grupos=['TODOS',...new Set(mat.materiais.map(m=>m.grupo||'SEM GRUPO'))]
  const lista=mat.materiais.filter(m=>{
    const mg=grupo==='TODOS'||(m.grupo||'SEM GRUPO')===grupo
    const ms=!search||m.desc.toLowerCase().includes(search.toLowerCase())
    return mg&&ms
  })

  return(
    <div className="neo-overlay open">
      <div className="neo-modal" style={{maxWidth:480}}>
        <div className="neo-modal-head">Material<button className="neo-modal-close" onClick={onClose}>✕</button></div>

        {/* Tipo */}
        <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap'}}>
          {TIPOS_PEDRA.map(t=>(
            <button key={t} className={`neo-chip-sm ${tipo===t?'active':''}`} onClick={()=>{setTipo(t);setGrupo('TODOS');setSearch('')}}>
              {t.charAt(0)+t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Grupos */}
        {grupos.length>2&&(
          <div style={{display:'flex',gap:4,marginBottom:10,flexWrap:'wrap'}}>
            {grupos.map(g=>(
              <button key={g} className={`neo-chip-sm ${grupo===g?'active':''}`} onClick={()=>setGrupo(g)}>{g}</button>
            ))}
          </div>
        )}

        {/* Pesquisa */}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar modelo…" className="neo-input" style={{marginBottom:10}}/>

        {/* Lista */}
        <div className="neo-scroll neo-well" style={{maxHeight:'42vh',overflowY:'auto',padding:'4px 0'}}>
          {lista.map((m,i)=>{
            const esps=Object.entries(m.espessuras)
            return(
              <div key={i} onClick={()=>onSelect(tipo,m.desc,m.grupo,esps[0][0])}
                style={{padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.04)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontFamily:"'Barlow Condensed'",fontSize:13,fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase',color:'var(--neo-text)'}}>{m.desc}</div>
                  {m.grupo&&<div style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--neo-text3)',marginTop:1}}>Grupo {m.grupo}</div>}
                </div>
                <div style={{textAlign:'right'}}>
                  {esps.map(([e,v])=>(
                    <div key={e} style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--neo-text3)'}}>{e}: {f2(v.pvp)} €/m²</div>
                  ))}
                </div>
              </div>
            )
          })}
          {lista.length===0&&<div style={{padding:'20px',textAlign:'center',fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-text3)'}}>Sem resultados</div>}
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
          <button className="neo-btn neo-btn-ghost" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}

// ── ResumoRow ──────────────────────────────────────────────────────────────
function ResumoRow({label,c1,pvp,extra,showToast}){
  return(
    <div style={{display:'flex',alignItems:'center',padding:'9px 16px',gap:10,borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
      <div style={{flex:1}}>
        <div style={{fontSize:12,color:'var(--neo-text)',fontWeight:300}}>{label}</div>
        {extra&&<div style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--neo-text3)',marginTop:1}}>{extra}</div>}
      </div>
      <CopyVal val={c1fmt(c1)} label="C1" showToast={showToast}/>
      <div style={{fontFamily:"'Barlow Condensed'",fontSize:12,fontWeight:500,color:'var(--neo-text2)',minWidth:60,textAlign:'right'}}>{f2(pvp)} €</div>
    </div>
  )
}

// ── CopyVal ────────────────────────────────────────────────────────────────
function CopyVal({val,label,showToast,large}){
  const [copied,setCopied]=useState(false)
  const copy=()=>{
    navigator.clipboard.writeText(val).catch(()=>{})
    setCopied(true);setTimeout(()=>setCopied(false),1600)
    showToast(`${label} copiado — ${val}`)
  }
  return(
    <button className={`neo-copy ${copied?'copied':''}`} onClick={copy}>
      <span style={{fontSize:large?16:12,fontWeight:large?700:400}}>{val}</span>
      <span className="neo-copy-icon">{copied?'✓':'⎘'}</span>
    </button>
  )
}
