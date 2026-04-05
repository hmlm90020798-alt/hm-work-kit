import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, doc, onSnapshot, setDoc, deleteDoc, addDoc } from 'firebase/firestore'

// ── Base de dados ANIGRACO completa ────────────────────────────────────────
const ANIGRACO = {
  GRANITOS: {
    materiais: [
      {desc:'VERDE LAVRADOR',   grupo:null, espessuras:{  '2cm':{c1:27022,pvp:475},'3cm':{c1:29444,pvp:517}}},
      {desc:'NEGRO ZIMBABWE',   grupo:null, espessuras:{  '2cm':{c1:26656,pvp:468},'3cm':{c1:29912,pvp:526}}},
      {desc:'AZUL LAVRADOR',    grupo:null, espessuras:{  '2cm':{c1:24132,pvp:424},'3cm':{c1:30889,pvp:543}}},
      {desc:'SHIVAKASHY',       grupo:null, espessuras:{  '2cm':{c1:21599,pvp:380},'3cm':{c1:28679,pvp:504}}},
      {desc:'PATAS DE GATO',    grupo:null, espessuras:{  '2cm':{c1:19261,pvp:338},'3cm':{c1:25041,pvp:440}}},
      {desc:'NEGRO ANGOLA',     grupo:null, espessuras:{  '2cm':{c1:16218,pvp:285},'3cm':{c1:19975,pvp:351}}},
      {desc:'NEGRO IMPALA',     grupo:null, espessuras:{  '2cm':{c1:14476,pvp:254},'3cm':{c1:20579,pvp:362}}},
      {desc:'AMARELO FIGUEIRA', grupo:null, espessuras:{  '2cm':{c1:11407,pvp:200},'3cm':{c1:12365,pvp:217}}},
      {desc:'AMARELO MACIEIRA', grupo:null, espessuras:{  '2cm':{c1:10651,pvp:187},'3cm':{c1:11713,pvp:206}}},
      {desc:'AMARELO VIMIEIRO', grupo:null, espessuras:{  '2cm':{c1:12551,pvp:221},'3cm':{c1:13613,pvp:239}}},
      {desc:'BRANCO CORAL',     grupo:null, espessuras:{  '2cm':{c1:10651,pvp:187},'3cm':{c1:11713,pvp:206}}},
      {desc:'CINZA EVORA',      grupo:null, espessuras:{  '2cm':{c1:14551,pvp:256},'3cm':{c1:15613,pvp:274}}},
      {desc:'PEDRAS SALGADAS',  grupo:null, espessuras:{  '2cm':{c1:12551,pvp:221},'3cm':{c1:13613,pvp:239}}},
      {desc:'CINZA PENALVA',    grupo:null, espessuras:{  '2cm':{c1:8874,pvp:156}, '3cm':{c1:10999,pvp:193}}},
      {desc:'CINZA ANTAS',      grupo:null, espessuras:{  '2cm':{c1:8874,pvp:156}, '3cm':{c1:10999,pvp:193}}},
      {desc:'CINZA PINHEL',     grupo:null, espessuras:{  '2cm':{c1:8874,pvp:156}, '3cm':{c1:10617,pvp:187}}},
      {desc:'ROSA PORRINHO',    grupo:null, espessuras:{  '2cm':{c1:8874,pvp:156}, '3cm':{c1:10141,pvp:178}}},
      {desc:'ROSA MONÇÃO',      grupo:null, espessuras:{  '2cm':{c1:8874,pvp:156}, '3cm':{c1:10141,pvp:178}}},
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
  SILESTONES: {
    materiais: [
      // PROMOÇÃO
      {desc:'LINEN CREAM',        grupo:'PROMOÇÃO', espessuras:{'2cm':{c1:20272,pvp:356},'1.2cm':{c1:17872,pvp:314}}},
      {desc:'MOTION GREY',        grupo:'PROMOÇÃO', espessuras:{'2cm':{c1:20272,pvp:356},'1.2cm':{c1:17872,pvp:314}}},
      {desc:'MIAMI WHITE',        grupo:'PROMOÇÃO', espessuras:{'2cm':{c1:20272,pvp:356},'1.2cm':{c1:17872,pvp:314}}},
      {desc:'LIME DELIGHT',       grupo:'PROMOÇÃO', espessuras:{'2cm':{c1:20272,pvp:356},'1.2cm':{c1:17872,pvp:314}}},
      {desc:'PERSIAN WHITE',      grupo:'PROMOÇÃO', espessuras:{'2cm':{c1:20272,pvp:356},'1.2cm':{c1:17872,pvp:314}}},
      {desc:'SIBERIAN',           grupo:'PROMOÇÃO', espessuras:{'2cm':{c1:20272,pvp:356},'1.2cm':{c1:17872,pvp:314}}},
      {desc:'LAGOON',             grupo:'PROMOÇÃO', espessuras:{'2cm':{c1:20272,pvp:356},'1.2cm':{c1:17872,pvp:314}}},
      {desc:'CONCRETE PULSE',     grupo:'PROMOÇÃO', espessuras:{'2cm':{c1:20272,pvp:356},'1.2cm':{c1:17872,pvp:314}}},
      {desc:'CORAL CLAY',         grupo:'PROMOÇÃO', espessuras:{'2cm':{c1:20272,pvp:356},'1.2cm':{c1:17872,pvp:314}}},
      {desc:'NEGRO TEBAS',        grupo:'PROMOÇÃO', espessuras:{'2cm':{c1:20272,pvp:356},'1.2cm':{c1:17872,pvp:314}}},
      // G1
      {desc:'BLANCO MAPLE 14',    grupo:'G1', espessuras:{'2cm':{c1:23064,pvp:405}}},
      {desc:'BLANCO NORTE 14',    grupo:'G1', espessuras:{'2cm':{c1:23064,pvp:405}}},
      {desc:'LINEN CREAM',        grupo:'G1', espessuras:{'2cm':{c1:23064,pvp:405}}},
      {desc:'WHITE STORM 14',     grupo:'G1', espessuras:{'2cm':{c1:23064,pvp:405}}},
      {desc:'MOTION GREY',        grupo:'G1', espessuras:{'2cm':{c1:23064,pvp:405}}},
      {desc:'ROUGUI',             grupo:'G1', espessuras:{'2cm':{c1:23064,pvp:405}}},
      {desc:'GRIS EXPO',          grupo:'G1', espessuras:{'2cm':{c1:23064,pvp:405}}},
      {desc:'MARENGO',            grupo:'G1', espessuras:{'2cm':{c1:23064,pvp:405}}},
      // G2
      {desc:'MIAMI WHITE 17',     grupo:'G2', espessuras:{'2cm':{c1:26784,pvp:471}}},
      {desc:'LIME DELIGHT',       grupo:'G2', espessuras:{'2cm':{c1:26784,pvp:471}}},
      {desc:'PERSIAN WHITE',      grupo:'G2', espessuras:{'2cm':{c1:26784,pvp:471}}},
      {desc:'SIBERIAN',           grupo:'G2', espessuras:{'2cm':{c1:26784,pvp:471}}},
      {desc:'LAGOON',             grupo:'G2', espessuras:{'2cm':{c1:26784,pvp:471}}},
      {desc:'CONCRETE PULSE',     grupo:'G2', espessuras:{'2cm':{c1:26784,pvp:471}}},
      {desc:'CORAL CLAY COLOUR',  grupo:'G2', espessuras:{'2cm':{c1:26784,pvp:471}}},
      {desc:'BRASS RELISH',       grupo:'G2', espessuras:{'2cm':{c1:26784,pvp:471}}},
      {desc:'CINDER CRAZE',       grupo:'G2', espessuras:{'2cm':{c1:26784,pvp:471}}},
      {desc:'NIGHT TEBAS',        grupo:'G2', espessuras:{'2cm':{c1:26784,pvp:471}}},
      // G3
      {desc:'MIAMI VENA',         grupo:'G3', espessuras:{'2cm':{c1:29672,pvp:521}}},
      {desc:'BRONZE RIVERS',      grupo:'G3', espessuras:{'2cm':{c1:29672,pvp:521}}},
      {desc:'SNOWY IBIZA',        grupo:'G3', espessuras:{'2cm':{c1:29672,pvp:521}}},
      {desc:'DERSERT SILVER',     grupo:'G3', espessuras:{'2cm':{c1:29672,pvp:521}}},
      {desc:'ET. MARFIL',         grupo:'G3', espessuras:{'2cm':{c1:29672,pvp:521}}},
      {desc:'CHARCOAL SOAPSTONE', grupo:'G3', espessuras:{'2cm':{c1:29672,pvp:521}}},
      {desc:'CALACATTA TOVA',     grupo:'G3', espessuras:{'2cm':{c1:29672,pvp:521}}},
      // G4
      {desc:'BLANCO ZEUS',        grupo:'G4', espessuras:{'2cm':{c1:40600,pvp:713}}},
      {desc:'XM NOLITA 23',       grupo:'G4', espessuras:{'2cm':{c1:40600,pvp:713}}},
      {desc:'ET. STATUARIO',      grupo:'G4', espessuras:{'2cm':{c1:40600,pvp:713}}},
      {desc:'XM RAW A',           grupo:'G4', espessuras:{'2cm':{c1:40600,pvp:713}}},
      {desc:'PEARL JASMINE',      grupo:'G4', espessuras:{'2cm':{c1:40600,pvp:713}}},
      {desc:'XM POBLENOU',        grupo:'G4', espessuras:{'2cm':{c1:40600,pvp:713}}},
      {desc:'XM FFROM 01',        grupo:'G4', espessuras:{'2cm':{c1:40600,pvp:713}}},
      {desc:'XM RAW G',           grupo:'G4', espessuras:{'2cm':{c1:40600,pvp:713}}},
      {desc:'XM FFROM 02',        grupo:'G4', espessuras:{'2cm':{c1:40600,pvp:713}}},
      {desc:'XM FFROM 03',        grupo:'G4', espessuras:{'2cm':{c1:40600,pvp:713}}},
      {desc:'XM RAW D',           grupo:'G4', espessuras:{'2cm':{c1:40600,pvp:713}}},
      // G5
      {desc:'ET. MARQUINA',       grupo:'G5', espessuras:{'2cm':{c1:46808,pvp:822}}},
      // G6
      {desc:'ET CALACATTA GOLD',  grupo:'G6', espessuras:{'2cm':{c1:54272,pvp:954}}},
      {desc:'ETHEREAL NOCTIS',    grupo:'G6', espessuras:{'2cm':{c1:54272,pvp:954}}},
      {desc:'ETHEREAL GLOW',      grupo:'G6', espessuras:{'2cm':{c1:54272,pvp:954}}},
      // Sem grupo (preço único)
      {desc:'XM BLANC ÉLISÉE',    grupo:null, espessuras:{'2cm':{c1:63912,pvp:1123}}},
      {desc:'XM RIVIÈRE ROSE',    grupo:null, espessuras:{'2cm':{c1:63912,pvp:1123}}},
      {desc:'VERSAILLES IVORY',   grupo:null, espessuras:{'2cm':{c1:63912,pvp:1123}}},
      {desc:'ECLECTIC PEARL',     grupo:null, espessuras:{'2cm':{c1:63912,pvp:1123}}},
      {desc:'VICTORIAN SILVER',   grupo:null, espessuras:{'2cm':{c1:63912,pvp:1123}}},
      {desc:'XM JARDÍN EMERAL',   grupo:null, espessuras:{'2cm':{c1:63912,pvp:1123}}},
      {desc:'XM PARISIEN BLEU',   grupo:null, espessuras:{'2cm':{c1:63912,pvp:1123}}},
      {desc:'ROMANTIC ASH',       grupo:null, espessuras:{'2cm':{c1:63912,pvp:1123}}},
      {desc:'XM BOHEMIAN FLAME',  grupo:null, espessuras:{'2cm':{c1:63912,pvp:1123}}},
      {desc:'XM CHATEAU BROWN',   grupo:null, espessuras:{'2cm':{c1:63912,pvp:1123}}},
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
  COMPAC: {
    materiais: [
      {desc:'GLACIAR',    grupo:'G1', espessuras:{'2cm':{c1:20856,pvp:366}}},
      {desc:'LUNA',       grupo:'G1', espessuras:{'2cm':{c1:20856,pvp:366}}},
      {desc:'ALASKA',     grupo:'G1', espessuras:{'2cm':{c1:20856,pvp:366}}},
      {desc:'ARENA',      grupo:'G1', espessuras:{'2cm':{c1:20856,pvp:366}}},
      {desc:'CENIZA',     grupo:'G1', espessuras:{'2cm':{c1:20856,pvp:366}}},
      {desc:'PLOMO',      grupo:'G1', espessuras:{'2cm':{c1:20856,pvp:366}}},
      {desc:'NOCTURNO',   grupo:'G1', espessuras:{'2cm':{c1:20856,pvp:366}}},
      {desc:'SNOW',       grupo:null, espessuras:{'2cm':{c1:24512,pvp:431}}},
      {desc:'MOON',       grupo:null, espessuras:{'2cm':{c1:24512,pvp:431}}},
      {desc:'SMOKE GREY', grupo:null, espessuras:{'2cm':{c1:24512,pvp:431}}},
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
  DEKTON: {
    materiais: [
      // PROMOÇÃO
      {desc:'KEENA',      grupo:'PROMOÇÃO', espessuras:{'2cm':{c1:26584,pvp:467},'1.2cm':{c1:21952,pvp:386}}},
      {desc:'MARINA',     grupo:'PROMOÇÃO', espessuras:{'2cm':{c1:26584,pvp:467},'1.2cm':{c1:21952,pvp:386}}},
      {desc:'THALA',      grupo:'PROMOÇÃO', espessuras:{'2cm':{c1:26584,pvp:467},'1.2cm':{c1:21952,pvp:386}}},
      {desc:'EVOK',       grupo:'PROMOÇÃO', espessuras:{'2cm':{c1:26584,pvp:467},'1.2cm':{c1:21952,pvp:386}}},
      {desc:'NACRE',      grupo:'PROMOÇÃO', espessuras:{'2cm':{c1:26584,pvp:467},'1.2cm':{c1:21952,pvp:386}}},
      {desc:'ARGENTIUM',  grupo:'PROMOÇÃO', espessuras:{'2cm':{c1:26584,pvp:467},'1.2cm':{c1:21952,pvp:386}}},
      {desc:'KELYA',      grupo:'PROMOÇÃO', espessuras:{'2cm':{c1:26584,pvp:467},'1.2cm':{c1:21952,pvp:386}}},
      {desc:'ENTZO',      grupo:null,       espessuras:{'2cm':{c1:28928,pvp:508},'1.2cm':{c1:23832,pvp:419}}},
      // G0
      {desc:'KAIROS 22 KC',  grupo:'G0', espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'MONNÉ KC',      grupo:'G0', espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'LUNAR 22 KC',   grupo:'G0', espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'AERIS KC',      grupo:'G0', espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'DANAE KC',      grupo:'G0', espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'DUNNA KC',      grupo:'G0', espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'KOVIK',         grupo:'G0', espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'KEON',          grupo:'G0', espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'TRILIUM',       grupo:'G0', espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'ETER',          grupo:'G0', espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'KEENA',         grupo:'G0', espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'THALA',         grupo:'G0', espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      {desc:'EVOK',          grupo:'G0', espessuras:{'2cm':{c1:30320,pvp:533},'1.2cm':{c1:25792,pvp:453}}},
      // G1
      {desc:'HALO KC',    grupo:'G1', espessuras:{'2cm':{c1:44112,pvp:775},'1.2cm':{c1:37912,pvp:666}}},
      {desc:'NACRE KC',   grupo:'G1', espessuras:{'2cm':{c1:44112,pvp:775},'1.2cm':{c1:37912,pvp:666}}},
      {desc:'SIRIUS25',   grupo:'G1', espessuras:{'2cm':{c1:44112,pvp:775},'1.2cm':{c1:37912,pvp:666}}},
      {desc:'KRETA',      grupo:'G1', espessuras:{'2cm':{c1:44112,pvp:775},'1.2cm':{c1:37912,pvp:666}}},
      {desc:'KIRA',       grupo:'G1', espessuras:{'2cm':{c1:44112,pvp:775},'1.2cm':{c1:37912,pvp:666}}},
      {desc:'BROMO',      grupo:'G1', espessuras:{'2cm':{c1:44112,pvp:775},'1.2cm':{c1:37912,pvp:666}}},
      // G2
      {desc:'AURA 22 KC',    grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'ZENITH KC',     grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'POLAR KC',      grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'MARINA KC',     grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'SANDIK KC',     grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'ALBARIUM 22 KC',grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'ARGENTIUM KC',  grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'NEBBIA KC',     grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'TREVI KC',      grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'MARMORIO KC',   grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'SABBIA KC',     grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'AVA KC',        grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'AVORIO KC',     grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'ADIA KC',       grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'UMBER',         grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'NEBU KC',       grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'GRIGIO KC',     grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'SOKE',          grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'CEPPO KC',      grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'GRAFITE',       grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'LAOS',          grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'KELYA',         grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'DOMOOS 25',     grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'KEDAR',         grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      {desc:'ZIRA',          grupo:'G2', espessuras:{'2cm':{c1:52048,pvp:915},'1.2cm':{c1:44304,pvp:778}}},
      // G3
      {desc:'UYUNI KC',      grupo:'G3', espessuras:{'2cm':{c1:60272,pvp:1324},'1.2cm':{c1:48218,pvp:847}}},
      {desc:'NEURAL KC',     grupo:'G3', espessuras:{'2cm':{c1:60272,pvp:1324},'1.2cm':{c1:48218,pvp:847}}},
      {desc:'REM KC',        grupo:'G3', espessuras:{'2cm':{c1:60272,pvp:1324},'1.2cm':{c1:48218,pvp:847}}},
      {desc:'NARA',          grupo:'G3', espessuras:{'2cm':{c1:60272,pvp:1324},'1.2cm':{c1:48218,pvp:847}}},
      {desc:'NATURA 22 KC',  grupo:'G3', espessuras:{'2cm':{c1:60272,pvp:1324},'1.2cm':{c1:48218,pvp:847}}},
      {desc:'VIGIL KC',      grupo:'G3', espessuras:{'2cm':{c1:60272,pvp:1324},'1.2cm':{c1:48218,pvp:847}}},
      {desc:'LAURENT',       grupo:'G3', espessuras:{'2cm':{c1:60272,pvp:1324},'1.2cm':{c1:48218,pvp:847}}},
      {desc:'SOMNIA',        grupo:'G3', espessuras:{'2cm':{c1:60272,pvp:1324},'1.2cm':{c1:48218,pvp:847}}},
      {desc:'MORPHEUS KC',   grupo:'G3', espessuras:{'2cm':{c1:60272,pvp:1324},'1.2cm':{c1:48218,pvp:847}}},
      {desc:'REVERIE KC',    grupo:'G3', espessuras:{'2cm':{c1:60272,pvp:1324},'1.2cm':{c1:48218,pvp:847}}},
      // G4
      {desc:'HELENA 22 KC',  grupo:'G4', espessuras:{'2cm':{c1:72240,pvp:1587},'1.2cm':{c1:57792,pvp:1015}}},
      {desc:'LUCID KC',      grupo:'G4', espessuras:{'2cm':{c1:72240,pvp:1587},'1.2cm':{c1:57792,pvp:1015}}},
      {desc:'BERGEN KC',     grupo:'G4', espessuras:{'2cm':{c1:72240,pvp:1587},'1.2cm':{c1:57792,pvp:1015}}},
      {desc:'TRANCE KC',     grupo:'G4', espessuras:{'2cm':{c1:72240,pvp:1587},'1.2cm':{c1:57792,pvp:1015}}},
      {desc:'AWAKE KC',      grupo:'G4', espessuras:{'2cm':{c1:72240,pvp:1587},'1.2cm':{c1:57792,pvp:1015}}},
      {desc:'ARGA KC',       grupo:'G4', espessuras:{'2cm':{c1:72240,pvp:1587},'1.2cm':{c1:57792,pvp:1015}}},
      {desc:'KHALO KC',      grupo:'G4', espessuras:{'2cm':{c1:72240,pvp:1587},'1.2cm':{c1:57792,pvp:1015}}},
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
  {label:'VISEU',   c1:19000, pvp:300},
  {label:'> 30 KM', c1:30000, pvp:480},
  {label:'> 50 KM', c1:45000, pvp:720},
]

const TIPOS = ['GRANITOS','SILESTONES','COMPAC','DEKTON','AGLOMERADO','MADEIRA','FENÓLICO']
const TIPOS_PEDRA = ['GRANITOS','SILESTONES','COMPAC','DEKTON']

function uuid() { return Math.random().toString(36).slice(2,9) }
function fmt2(n) { return parseFloat(n||0).toFixed(2) }
function c1fmt(c1) { return (c1/100).toFixed(2) }

// ── Componente principal ───────────────────────────────────────────────────
export default function Tampos({ showToast }) {
  const [calculos, setCalculos] = useState([])
  const [orcamentos, setOrcamentos] = useState([])
  const [view, setView] = useState('list')
  const [current, setCurrent] = useState(null)
  const [tipoFiltro, setTipoFiltro] = useState('TODOS')

  useEffect(() => {
    const u1 = onSnapshot(collection(db,'tampos'), snap => setCalculos(snap.docs.map(d=>({id:d.id,...d.data()}))))
    const u2 = onSnapshot(collection(db,'orcamentos'), snap => setOrcamentos(snap.docs.map(d=>({id:d.id,...d.data()}))))
    return () => { u1(); u2() }
  }, [])

  const novoProjeto = (tipo) => {
    setCurrent({
      id:null, nome:'', cliente:'',
      tipo: tipo,
      pecas:[{id:uuid(),label:'Peça 1',tipo,desc:'',grupo:null,espessura:'2cm',segmentos:[{id:uuid(),label:'Seg.1',comp:0,larg:0}],acabamentos:[]}],
      transporte:null, desconto:0, descontoTipo:'%', notas:''
    })
    setView('calc')
  }

  const limpar = async () => {
    if (!confirm('Eliminar todos os cálculos de tampo?')) return
    for (const c of calculos) await deleteDoc(doc(db,'tampos',c.id))
    showToast('Dados limpos')
  }

  const totalProjeto = (c) => {
    let pvp=0, c1=0
    ;(c.pecas||[]).forEach(p=>{
      const r = calcPeca(p)
      pvp += r.pvp; c1 += r.c1raw
    })
    if (c.transporte) { pvp+=c.transporte.pvp; c1+=c.transporte.c1 }
    let desc=0
    if (c.desconto>0) desc = c.descontoTipo==='%' ? pvp*(c.desconto/100) : parseFloat(c.desconto)
    return { pvp:pvp-desc, c1, desc }
  }

  const calcsPorTipo = TIPOS.reduce((acc,t) => {
    acc[t] = calculos.filter(c=>c.tipo===t)
    return acc
  }, {})

  if (view==='calc' && current) {
    return <Calculadora current={current} setCurrent={setCurrent}
      orcamentos={orcamentos} onBack={()=>setView('list')} showToast={showToast} />
  }

  const S = {
    label9: { fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase' },
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>

      {/* BARRA */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', height:48, borderBottom:'1px solid var(--line)', flexShrink:0 }}>
        <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text)' }}>
          Tampos <span style={{ fontSize:9, color:'var(--text3)', marginLeft:8 }}>{calculos.length}</span>
        </span>
        {calculos.length>0 && (
          <button onClick={limpar} style={{ background:'transparent', border:'1px solid var(--danger)', padding:'0 12px', height:28, cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--danger)' }}>
            Limpar
          </button>
        )}
      </div>

      {/* LISTA */}
      <div style={{ flex:1, overflowY:'auto' }}>
        {TIPOS.map(tipo => {
          const mat = ANIGRACO[tipo]
          const calcs = calcsPorTipo[tipo]||[]
          const isPedra = TIPOS_PEDRA.includes(tipo)
          return (
            <div key={tipo}>
              {/* Cabeçalho do tipo */}
              <div style={{ padding:'14px 20px 10px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontFamily:"'Barlow Condensed'", fontSize:14, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text)' }}>{tipo}</div>
                  {isPedra && <div style={{ ...S.label9, color:'var(--text3)', marginTop:2 }}>{mat.materiais.length} referências · ANIGRACO</div>}
                </div>
                <button onClick={()=>novoProjeto(tipo)} style={{ background:'transparent', border:'1px solid var(--line2)', padding:'0 12px', height:28, cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text2)', transition:'all .15s' }}>
                  + Cálculo
                </button>
              </div>

              {/* Cálculos guardados deste tipo */}
              {calcs.map(c => {
                const res = totalProjeto(c)
                return (
                  <div key={c.id} onClick={()=>{ setCurrent({...c}); setView('calc') }}
                    style={{ padding:'12px 20px 12px 32px', borderBottom:'1px solid var(--line)', cursor:'pointer', display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:500, letterSpacing:'0.06em', color:'var(--text)', textTransform:'uppercase' }}>{c.nome||'Sem nome'}</div>
                      {c.cliente && <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--text3)', letterSpacing:'0.1em', textTransform:'uppercase', marginTop:2 }}>{c.cliente}</div>}
                    </div>
                    <div style={{ fontFamily:"'Barlow Condensed'", fontSize:13, color:'var(--gold)', fontWeight:500 }}>{fmt2(res.pvp)} €</div>
                    <button onClick={e=>{ e.stopPropagation(); if(confirm('Eliminar?')) deleteDoc(doc(db,'tampos',c.id)) }}
                      style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:12, padding:'4px' }}>✕</button>
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

// ── Cálculo de uma peça ────────────────────────────────────────────────────
function calcPeca(p) {
  const m2 = (p.segmentos||[]).reduce((s,sg)=>s+(parseFloat(sg.comp)||0)*(parseFloat(sg.larg)||0),0)
  let pvpTampo=0, c1Tampo=0, esp=null
  if (TIPOS_PEDRA.includes(p.tipo) && p.desc) {
    const mat = ANIGRACO[p.tipo]
    const ref = mat?.materiais.find(m=>m.desc===p.desc && m.grupo===p.grupo)
             || mat?.materiais.find(m=>m.desc===p.desc)
    esp = ref?.espessuras[p.espessura]
    if (esp) { pvpTampo=esp.pvp*m2; c1Tampo=esp.c1*m2 }
  } else if (!TIPOS_PEDRA.includes(p.tipo)) {
    pvpTampo = (parseFloat(p.precoPvp)||0)*m2
    c1Tampo  = (parseFloat(p.precoC1)||0)*m2
  }
  const pvpAcab = (p.acabamentos||[]).reduce((s,a)=>s+(a.pvp||0)*(a.qty||1),0)
  const c1Acab  = (p.acabamentos||[]).reduce((s,a)=>s+(a.c1||0)*(a.qty||1),0)
  return { m2, pvpTampo, c1Tampo, pvpAcab, c1Acab, pvp:pvpTampo+pvpAcab, c1raw:c1Tampo+c1Acab, esp }
}

const TIPOS_PEDRA = ['GRANITOS','SILESTONES','COMPAC','DEKTON']

// ── Calculadora ────────────────────────────────────────────────────────────
function Calculadora({ current, setCurrent, orcamentos, onBack, showToast }) {
  const [tab, setTab] = useState('pecas')
  const [matModal, setMatModal] = useState(null)
  const [exportModal, setExportModal] = useState(false)
  const [formulaOpen, setFormulaOpen] = useState(false)
  const [margem, setMargem] = useState(25)

  const upd = (k,v) => setCurrent(c=>({...c,[k]:v}))

  const save = async () => {
    if (!current.nome.trim()) { showToast('Nome obrigatório'); return }
    const data={...current}; delete data.id
    if (current.id) { await setDoc(doc(db,'tampos',current.id),data) }
    else { const r=await addDoc(collection(db,'tampos'),data); setCurrent(c=>({...c,id:r.id})) }
    showToast('Guardado')
  }

  const addPeca = () => {
    const n=(current.pecas||[]).length+1
    upd('pecas',[...(current.pecas||[]),{id:uuid(),label:`Peça ${n}`,tipo:current.tipo,desc:'',grupo:null,espessura:'2cm',segmentos:[{id:uuid(),label:'Seg.1',comp:0,larg:0}],acabamentos:[]}])
  }
  const updPeca=(id,k,v)=>upd('pecas',current.pecas.map(p=>p.id===id?{...p,[k]:v}:p))
  const delPeca=(id)=>{ if(current.pecas.length<=1){showToast('Mínimo 1 peça');return}; upd('pecas',current.pecas.filter(p=>p.id!==id)) }
  const addSeg=(pid)=>{ const p=current.pecas.find(x=>x.id===pid); const n=(p.segmentos||[]).length+1; updPeca(pid,'segmentos',[...(p.segmentos||[]),{id:uuid(),label:`Seg.${n}`,comp:0,larg:0}]) }
  const updSeg=(pid,sid,k,v)=>{ const p=current.pecas.find(x=>x.id===pid); updPeca(pid,'segmentos',p.segmentos.map(s=>s.id===sid?{...s,[k]:v}:s)) }
  const delSeg=(pid,sid)=>{ const p=current.pecas.find(x=>x.id===pid); if((p.segmentos||[]).length<=1){showToast('Mínimo 1');return}; updPeca(pid,'segmentos',p.segmentos.filter(s=>s.id!==sid)) }
  const toggleAcab=(pid,acab)=>{ const p=current.pecas.find(x=>x.id===pid); const ex=(p.acabamentos||[]).find(a=>a.nome===acab.nome); updPeca(pid,'acabamentos',ex?(p.acabamentos||[]).filter(a=>a.nome!==acab.nome):[...(p.acabamentos||[]),{...acab,qty:1}]) }
  const updAcabQty=(pid,nome,qty)=>{ const p=current.pecas.find(x=>x.id===pid); updPeca(pid,'acabamentos',(p.acabamentos||[]).map(a=>a.nome===nome?{...a,qty:Math.max(1,parseInt(qty)||1)}:a)) }

  const tot = () => {
    let pvp=0,c1=0
    ;(current.pecas||[]).forEach(p=>{const r=calcPeca(p);pvp+=r.pvp;c1+=r.c1raw})
    if(current.transporte){pvp+=current.transporte.pvp;c1+=current.transporte.c1}
    let desc=0
    if(current.desconto>0) desc=current.descontoTipo==='%'?pvp*(current.desconto/100):parseFloat(current.desconto)
    return {pvp:pvp-desc,c1,desc,pvpBruto:pvp}
  }
  const T=tot()

  const exportarOrc = async (orcId) => {
    const orc=orcamentos.find(o=>o.id===orcId); if(!orc)return
    const items=[...(orc.items||[])]
    ;(current.pecas||[]).forEach(p=>{
      const r=calcPeca(p)
      if(r.m2>0&&(p.desc||!TIPOS_PEDRA.includes(p.tipo))) items.push({artId:'t_'+uuid(),ref:'TAMPO',desc:`${p.label}${p.desc?' — '+p.desc:''} ${p.espessura||''} (${r.m2.toFixed(3)} m²)`,cat:'Tampos',price:r.pvpTampo,qty:1})
      ;(p.acabamentos||[]).forEach(a=>items.push({artId:'t_'+uuid(),ref:'ACAB',desc:`${p.label} — ${a.nome} ×${a.qty}`,cat:'Tampos',price:(a.pvp||0)*(a.qty||1),qty:1}))
    })
    if(current.transporte) items.push({artId:'t_'+uuid(),ref:'TRANSP',desc:`Transporte — ${current.transporte.label}`,cat:'Tampos',price:current.transporte.pvp,qty:1})
    await setDoc(doc(db,'orcamentos',orcId),{...orc,items})
    showToast('Exportado'); setExportModal(false)
  }

  const gerarPDF = () => {
    const T=tot(); const hoje=new Date().toLocaleDateString('pt-PT')
    let h=`<html><head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;margin:0;padding:32px;font-size:13px;color:#111}
.hdr{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #111;padding-bottom:16px;margin-bottom:20px}
.logo{font-size:22px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase}
.logo span{color:#c8a96e}
.ind{background:#fff8e8;border:1px solid #c8a96e;padding:8px;text-align:center;font-size:11px;color:#8a6e3a;margin-bottom:18px;letter-spacing:0.06em}
.sec{margin-bottom:16px}
.sec-t{font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#888;border-bottom:1px solid #eee;padding-bottom:4px;margin-bottom:8px}
.row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f5f5f5;font-size:12px}
.tot{background:#f5f5f5;padding:16px;display:flex;justify-content:space-between;align-items:center;margin-top:20px}
.tot-v{font-size:24px;font-weight:700}
.note{font-size:11px;color:#888;margin-top:16px;font-style:italic}
</style></head><body>`
    h+=`<div class="hdr"><div class="logo">HM·<span>Work</span>·Kit</div><div style="font-size:11px;color:#666;text-align:right"><div><b>${current.nome||'Projecto de Tampo'}</b></div>${current.cliente?`<div>${current.cliente}</div>`:''}<div>${hoje}</div></div></div>`
    h+=`<div class="ind">DOCUMENTO INDICATIVO — VALORES SUJEITOS A CONFIRMAÇÃO</div>`
    ;(current.pecas||[]).forEach(p=>{
      const r=calcPeca(p)
      h+=`<div class="sec"><div class="sec-t">${p.label}${p.desc?' — '+p.desc:''}</div>`
      if(r.m2>0){
        if(r.esp) h+=`<div class="row"><span>Tampo ${p.espessura} — ${r.m2.toFixed(3)} m² × ${fmt2(r.esp.pvp)} €/m²</span><span><b>${fmt2(r.pvpTampo)} €</b></span></div>`
        else if(!TIPOS_PEDRA.includes(p.tipo)&&p.precoPvp) h+=`<div class="row"><span>${p.tipo} — ${r.m2.toFixed(3)} m²</span><span><b>${fmt2(r.pvpTampo)} €</b></span></div>`
      }
      ;(p.acabamentos||[]).forEach(a=>{ h+=`<div class="row"><span>${a.nome}${a.unidade==='ml'?' ('+a.qty+' ml)':' ×'+a.qty}</span><span><b>${fmt2((a.pvp||0)*(a.qty||1))} €</b></span></div>` })
      h+=`</div>`
    })
    if(current.transporte) h+=`<div class="sec"><div class="sec-t">Transporte e Montagem</div><div class="row"><span>ANIGRACO — ${current.transporte.label}</span><span><b>${fmt2(current.transporte.pvp)} €</b></span></div></div>`
    if(T.desc>0) h+=`<div class="row"><span>Desconto${current.descontoTipo==='%'?' ('+current.desconto+'%)':''}</span><span>− ${fmt2(T.desc)} €</span></div>`
    h+=`<div class="tot"><span style="font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#666">Total PVP</span><span class="tot-v">${fmt2(T.pvp)} €</span></div>`
    if(current.notas) h+=`<div class="note">${current.notas}</div>`
    h+=`</body></html>`
    const w=window.open('','_blank'); w.document.write(h); w.document.close(); setTimeout(()=>w.print(),400)
  }

  const S={
    lbl:{fontFamily:"'Barlow Condensed'",fontSize:9,fontWeight:600,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--text2)',display:'block',marginBottom:8},
    inp:{width:'100%',background:'transparent',border:'none',borderBottom:'1px solid var(--line2)',padding:'8px 0',fontFamily:"'Barlow'",fontSize:14,fontWeight:300,color:'var(--text)',outline:'none'},
    num:{background:'transparent',border:'none',borderBottom:'1px solid var(--line2)',padding:'6px 0',fontFamily:"'Barlow Condensed'",fontSize:14,color:'var(--text)',outline:'none',textAlign:'right',width:'100%'},
    sec:{padding:'16px 20px',borderBottom:'1px solid var(--line)'},
    muted:{fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--text3)'},
  }

  return (<>
  <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>

    {/* BARRA */}
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px',height:48,borderBottom:'1px solid var(--line)',flexShrink:0}}>
      <button onClick={onBack} style={{background:'transparent',border:'none',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:10,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--text3)'}}>← Tampos</button>
      <div style={{display:'flex',gap:6}}>
        <button onClick={gerarPDF} className="btn btn-outline" style={{height:28,padding:'0 10px',fontSize:9}}>PDF</button>
        <button onClick={()=>setExportModal(true)} className="btn btn-outline" style={{height:28,padding:'0 10px',fontSize:9}}>↗ Orc.</button>
        <button onClick={save} className="btn btn-gold" style={{height:28,padding:'0 12px',fontSize:9}}>Guardar</button>
      </div>
    </div>

    {/* TOTAIS */}
    <div style={{padding:'10px 20px',background:'var(--bg)',borderBottom:'1px solid var(--line)',flexShrink:0,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div>
        <div style={S.muted}>C1</div>
        <CopyVal val={c1fmt(T.c1)} label="C1 total" showToast={showToast} />
      </div>
      <div style={{textAlign:'right'}}>
        <div style={S.muted}>PVP</div>
        <div style={{fontFamily:"'Barlow Condensed'",fontSize:22,fontWeight:700,color:'var(--gold)'}}>{fmt2(T.pvp)} €</div>
      </div>
    </div>

    {/* TABS */}
    <div style={{display:'flex',borderBottom:'1px solid var(--line)',flexShrink:0}}>
      {[['pecas','Peças'],['resumo','Resumo C1']].map(([id,lbl])=>(
        <button key={id} onClick={()=>setTab(id)} style={{flex:1,height:36,background:'transparent',border:'none',borderBottom:tab===id?'2px solid var(--gold)':'2px solid transparent',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:10,fontWeight:600,letterSpacing:'0.14em',textTransform:'uppercase',color:tab===id?'var(--gold)':'var(--text3)'}}>
          {lbl}
        </button>
      ))}
    </div>

    <div style={{flex:1,overflowY:'auto'}}>

    {/* ── TAB PEÇAS ── */}
    {tab==='pecas' && <>

      {/* Identificação */}
      <div style={S.sec}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div><label style={S.lbl}>Nome</label><input value={current.nome} onChange={e=>upd('nome',e.target.value)} placeholder="ex: Cozinha Lisboa" style={S.inp}/></div>
          <div><label style={S.lbl}>Cliente</label><input value={current.cliente||''} onChange={e=>upd('cliente',e.target.value)} placeholder="Nome do cliente" style={S.inp}/></div>
        </div>
      </div>

      {/* Fórmula (discreta) */}
      <div style={{padding:'10px 20px',borderBottom:'1px solid var(--line)',background:'var(--bg2)'}}>
        <button onClick={()=>setFormulaOpen(o=>!o)} style={{background:'transparent',border:'none',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--text3)',display:'flex',alignItems:'center',gap:6}}>
          <span style={{fontSize:8}}>{formulaOpen?'▼':'▶'}</span> Fórmula PVP
        </button>
        {formulaOpen && (
          <div style={{marginTop:12,padding:'12px 14px',background:'var(--bg3)',borderLeft:'2px solid var(--line2)'}}>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--text3)',letterSpacing:'0.1em',marginBottom:10}}>PVP = (C1 ÷ (1 − margem)) × 1.23</div>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <label style={{...S.lbl,marginBottom:0}}>Margem</label>
              <input type="number" value={margem} onChange={e=>setMargem(parseFloat(e.target.value)||0)} style={{width:60,...S.num,fontSize:13}} />
              <span style={{fontFamily:"'Barlow Condensed'",fontSize:11,color:'var(--text3)'}}>%</span>
              <div style={{marginLeft:'auto',fontFamily:"'Barlow Condensed'",fontSize:13,color:'var(--gold)'}}>
                PVP = (C1 ÷ {fmt2(1-margem/100)}) × 1.23
              </div>
            </div>
            {T.c1>0 && (
              <div style={{marginTop:8,fontFamily:"'Barlow Condensed'",fontSize:11,color:'var(--text2)'}}>
                Com margem {margem}%: {fmt2((T.c1/100/(1-margem/100))*1.23)} € PVP calculado
              </div>
            )}
          </div>
        )}
      </div>

      {/* Peças */}
      {(current.pecas||[]).map((p,pi)=>{
        const res=calcPeca(p)
        const isPedra=TIPOS_PEDRA.includes(p.tipo)
        const mat=ANIGRACO[p.tipo]
        const ref=mat?.materiais.find(m=>m.desc===p.desc&&m.grupo===p.grupo)||mat?.materiais.find(m=>m.desc===p.desc)
        const espDisp=ref?Object.keys(ref.espessuras):[]
        const acabDisp=mat?.acabamentos||[]
        const grupos=mat?[...new Set(mat.materiais.map(m=>m.grupo||'SEM GRUPO'))]:[]

        return (
          <div key={p.id} style={{...S.sec,background:pi%2===0?'transparent':'var(--bg2)'}}>
            {/* cabeçalho peça */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <input value={p.label} onChange={e=>updPeca(p.id,'label',e.target.value)} style={{background:'transparent',border:'none',fontFamily:"'Barlow Condensed'",fontSize:11,fontWeight:600,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--text2)',outline:'none',width:70}}/>
                {res.m2>0&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--text3)'}}>{res.m2.toFixed(3)} m²</span>}
                {res.pvp>0&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:11,color:'var(--gold2)'}}>{fmt2(res.pvp)} €</span>}
              </div>
              {(current.pecas||[]).length>1&&<button onClick={()=>delPeca(p.id)} style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--text3)',fontSize:12}}>✕</button>}
            </div>

            {/* botão escolha material */}
            <button onClick={()=>setMatModal(p.id)} style={{width:'100%',background:'var(--bg3)',border:'1px solid var(--line2)',padding:'12px 14px',cursor:'pointer',textAlign:'left',marginBottom:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{...S.lbl,marginBottom:4}}>Material</div>
                <div style={{fontFamily:"'Barlow Condensed'",fontSize:14,fontWeight:600,color:p.desc?'var(--text)':'var(--text3)',letterSpacing:'0.06em',textTransform:'uppercase'}}>
                  {p.desc?`${p.tipo.charAt(0)+p.tipo.slice(1).toLowerCase()} — ${p.desc}`:'Seleccionar →'}
                </div>
                {p.grupo&&<div style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--text3)',marginTop:2}}>Grupo {p.grupo}</div>}
              </div>
              {res.esp&&<div style={{textAlign:'right'}}><div style={S.muted}>PVP/m²</div><div style={{fontFamily:"'Barlow Condensed'",fontSize:14,color:'var(--gold)'}}>{fmt2(res.esp.pvp)} €</div></div>}
            </button>

            {/* preço manual (não pedra) */}
            {!isPedra&&(
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div><label style={S.lbl}>PVP / m² (€)</label><input type="number" value={p.precoPvp||''} onChange={e=>updPeca(p.id,'precoPvp',e.target.value)} placeholder="0.00" style={S.num}/></div>
                <div><label style={S.lbl}>C1 / m² (€)</label><input type="number" value={p.precoC1||''} onChange={e=>updPeca(p.id,'precoC1',e.target.value)} placeholder="0.00" style={S.num}/></div>
              </div>
            )}

            {/* espessuras */}
            {espDisp.length>0&&(
              <div style={{marginBottom:12}}>
                <label style={S.lbl}>Espessura</label>
                <div style={{display:'flex',gap:8}}>
                  {espDisp.map(e=>{
                    const ed=ref.espessuras[e]
                    return(
                      <button key={e} onClick={()=>updPeca(p.id,'espessura',e)} style={{flex:1,padding:'8px',background:p.espessura===e?'var(--gold)':'transparent',border:'1px solid',borderColor:p.espessura===e?'var(--gold)':'var(--line2)',cursor:'pointer'}}>
                        <div style={{fontFamily:"'Barlow Condensed'",fontSize:13,fontWeight:600,color:p.espessura===e?'var(--bg)':'var(--text)'}}>{e}</div>
                        {ed&&<div style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:p.espessura===e?'var(--bg)':'var(--text3)',marginTop:2}}>{fmt2(ed.pvp)} €/m²</div>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* segmentos */}
            <div style={{marginBottom:12}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                <label style={{...S.lbl,marginBottom:0}}>Segmentos (metros)</label>
                <button onClick={()=>addSeg(p.id)} style={{background:'transparent',border:'none',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--gold)'}}>+ Seg.</button>
              </div>
              {(p.segmentos||[]).map(seg=>(
                <div key={seg.id} style={{display:'grid',gridTemplateColumns:'auto 1fr 1fr 80px auto',gap:8,alignItems:'center',marginBottom:6,padding:'8px 10px',background:'var(--bg3)',borderLeft:'2px solid var(--line2)'}}>
                  <input value={seg.label} onChange={e=>updSeg(p.id,seg.id,'label',e.target.value)} style={{background:'transparent',border:'none',fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--text3)',outline:'none',width:44}}/>
                  <div>
                    <div style={{...S.lbl,fontSize:8,marginBottom:3}}>Comp. (m)</div>
                    <input type="number" value={seg.comp||''} onChange={e=>updSeg(p.id,seg.id,'comp',e.target.value)} placeholder="2.40" step="0.01" min="0" style={{...S.num,fontSize:13}}/>
                  </div>
                  <div>
                    <div style={{...S.lbl,fontSize:8,marginBottom:3}}>Larg. (m)</div>
                    <input type="number" value={seg.larg||''} onChange={e=>updSeg(p.id,seg.id,'larg',e.target.value)} placeholder="0.60" step="0.01" min="0" style={{...S.num,fontSize:13}}/>
                  </div>
                  <div style={{textAlign:'right',paddingTop:14}}>
                    <div style={{fontFamily:"'Barlow Condensed'",fontSize:13,fontWeight:600,color:'var(--gold)'}}>{fmt2((parseFloat(seg.comp)||0)*(parseFloat(seg.larg)||0))} m²</div>
                  </div>
                  {(p.segmentos||[]).length>1&&<button onClick={()=>delSeg(p.id,seg.id)} style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--text3)',fontSize:11}}>✕</button>}
                </div>
              ))}
              {(p.segmentos||[]).length>1&&(
                <div style={{display:'flex',justifyContent:'flex-end',padding:'6px 0'}}>
                  <span style={S.muted}>Total&nbsp;</span>
                  <span style={{fontFamily:"'Barlow Condensed'",fontSize:13,fontWeight:600,color:'var(--text)'}}>{res.m2.toFixed(4)} m²</span>
                </div>
              )}
            </div>

            {/* rodatampo (campo dedicado em ml) */}
            {(isPedra||p.desc)&&acabDisp.length>0&&(()=>{
              const rodaAcab = acabDisp.find(a=>a.nome==='RODATAMPO')
              const rodaActive = rodaAcab&&(p.acabamentos||[]).find(a=>a.nome==='RODATAMPO')
              return rodaAcab?(
                <div style={{marginBottom:12}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div onClick={()=>toggleAcab(p.id,rodaAcab)} style={{width:30,height:18,borderRadius:9,background:rodaActive?'var(--gold)':'var(--line2)',position:'relative',cursor:'pointer',transition:'background .2s',flexShrink:0}}>
                      <div style={{position:'absolute',top:2,left:rodaActive?13:2,width:14,height:14,borderRadius:'50%',background:'#fff',transition:'left .2s'}}/>
                    </div>
                    <label style={{...S.lbl,marginBottom:0}}>Rodatampo</label>
                    {rodaActive&&(
                      <>
                      <input type="number" value={rodaActive.qty||''} onChange={e=>updAcabQty(p.id,'RODATAMPO',parseFloat(e.target.value)||0)} placeholder="0.00" step="0.01" min="0" style={{...S.num,width:70,fontSize:13}}/>
                      <span style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--text3)'}}>ml</span>
                      <span style={{fontFamily:"'Barlow Condensed'",fontSize:12,color:'var(--gold2)',marginLeft:'auto'}}>{fmt2((rodaAcab.pvp||0)*(rodaActive.qty||0))} €</span>
                      </>
                    )}
                    {!rodaActive&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--text3)',marginLeft:'auto'}}>{fmt2(rodaAcab.pvp)} €/ml</span>}
                  </div>
                </div>
              ):null
            })()}

            {/* restantes acabamentos */}
            {acabDisp.filter(a=>a.nome!=='RODATAMPO').map(acab=>{
              const active=(p.acabamentos||[]).find(a=>a.nome===acab.nome)
              return(
                <div key={acab.nome} style={{borderTop:'1px solid var(--line)',paddingTop:8,marginBottom:8}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div onClick={()=>toggleAcab(p.id,acab)} style={{width:30,height:18,borderRadius:9,background:active?'var(--gold)':'var(--line2)',position:'relative',cursor:'pointer',transition:'background .2s',flexShrink:0}}>
                      <div style={{position:'absolute',top:2,left:active?13:2,width:14,height:14,borderRadius:'50%',background:'#fff',transition:'left .2s'}}/>
                    </div>
                    <span style={{flex:1,fontFamily:"'Barlow Condensed'",fontSize:11,letterSpacing:'0.04em',color:active?'var(--text)':'var(--text2)'}}>{acab.nome}</span>
                    {active?(
                      <>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <button onClick={()=>updAcabQty(p.id,acab.nome,(active.qty||1)-1)} style={{width:22,height:22,background:'transparent',border:'1px solid var(--line2)',cursor:'pointer',color:'var(--text2)',display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
                        <span style={{fontFamily:"'Barlow Condensed'",fontSize:13,color:'var(--text)',minWidth:18,textAlign:'center'}}>{active.qty||1}</span>
                        <button onClick={()=>updAcabQty(p.id,acab.nome,(active.qty||1)+1)} style={{width:22,height:22,background:'transparent',border:'1px solid var(--line2)',cursor:'pointer',color:'var(--text2)',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                      </div>
                      <span style={{fontFamily:"'Barlow Condensed'",fontSize:12,color:'var(--gold2)',minWidth:60,textAlign:'right'}}>{fmt2((acab.pvp||0)*(active.qty||1))} €</span>
                      </>
                    ):(
                      <span style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--text3)'}}>{fmt2(acab.pvp)} €/un</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}

      {/* + Peça */}
      <div style={{padding:'12px 20px',borderBottom:'1px solid var(--line)'}}>
        <button onClick={addPeca} style={{width:'100%',background:'transparent',border:'1px dashed var(--line2)',padding:'10px',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--text3)'}}>
          + Adicionar peça
        </button>
      </div>

      {/* Transporte */}
      <div style={S.sec}>
        <label style={S.lbl}>Transporte e Montagem</label>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
          {TRANSPORTE.map(t=>(
            <button key={t.label} onClick={()=>upd('transporte',current.transporte?.label===t.label?null:t)} style={{padding:'10px 6px',background:current.transporte?.label===t.label?'var(--gold)':'transparent',border:'1px solid',borderColor:current.transporte?.label===t.label?'var(--gold)':'var(--line2)',cursor:'pointer',textAlign:'center'}}>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:11,fontWeight:600,color:current.transporte?.label===t.label?'var(--bg)':'var(--text)',letterSpacing:'0.06em'}}>{t.label}</div>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:current.transporte?.label===t.label?'var(--bg)':'var(--text3)',marginTop:2}}>{fmt2(t.pvp)} €</div>
            </button>
          ))}
        </div>
      </div>

      {/* Desconto */}
      <div style={S.sec}>
        <label style={S.lbl}>Desconto</label>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <input type="number" value={current.desconto||''} onChange={e=>upd('desconto',e.target.value)} placeholder="0" min="0" style={{...S.num,width:80}}/>
          {['%','€'].map(t=>(
            <button key={t} onClick={()=>upd('descontoTipo',t)} style={{width:32,height:30,background:current.descontoTipo===t?'var(--gold)':'transparent',border:'1px solid',borderColor:current.descontoTipo===t?'var(--gold)':'var(--line2)',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:12,fontWeight:600,color:current.descontoTipo===t?'var(--bg)':'var(--text2)'}}>
              {t}
            </button>
          ))}
          {T.desc>0&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:13,color:'var(--text2)',marginLeft:'auto'}}>− {fmt2(T.desc)} €</span>}
        </div>
      </div>

      {/* Notas */}
      <div style={{padding:'14px 20px 32px'}}>
        <label style={S.lbl}>Notas</label>
        <textarea value={current.notas||''} onChange={e=>upd('notas',e.target.value)} placeholder="Observações…" style={{width:'100%',background:'transparent',border:'none',borderBottom:'1px solid var(--line2)',padding:'6px 0',fontFamily:"'Barlow'",fontSize:13,fontWeight:300,color:'var(--text)',outline:'none',resize:'none',minHeight:50}}/>
      </div>
    </>}

    {/* ── TAB RESUMO C1 ── */}
    {tab==='resumo'&&(
      <div style={{paddingBottom:32}}>
        {(current.pecas||[]).map(p=>{
          const r=calcPeca(p)
          const isPedra=TIPOS_PEDRA.includes(p.tipo)
          if(!p.desc&&isPedra) return null
          return(
            <div key={p.id} style={{borderBottom:'1px solid var(--line)'}}>
              <div style={{padding:'12px 20px 6px',fontFamily:"'Barlow Condensed'",fontSize:10,fontWeight:600,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--text2)'}}>{p.label}{p.desc?' — '+p.desc:''}{p.espessura?' '+p.espessura:''}</div>
              {r.m2>0&&r.esp&&<ResumoRow label={`Tampo ${r.m2.toFixed(3)} m²`} c1={r.c1Tampo} pvp={r.pvpTampo} extra={`${c1fmt(r.esp.c1)} €/m² × ${r.m2.toFixed(3)}`} showToast={showToast}/>}
              {r.m2>0&&!isPedra&&p.precoC1&&<ResumoRow label={`${p.tipo} ${r.m2.toFixed(3)} m²`} c1={r.c1Tampo} pvp={r.pvpTampo} showToast={showToast}/>}
              {(p.acabamentos||[]).map(a=>(
                <ResumoRow key={a.nome} label={`${a.nome}${a.unidade==='ml'?' '+a.qty+' ml':' ×'+a.qty}`} c1={(a.c1||0)*(a.qty||1)} pvp={(a.pvp||0)*(a.qty||1)} showToast={showToast}/>
              ))}
            </div>
          )
        })}
        {current.transporte&&(
          <div style={{borderBottom:'1px solid var(--line)'}}>
            <div style={{padding:'12px 20px 6px',fontFamily:"'Barlow Condensed'",fontSize:10,fontWeight:600,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--text2)'}}>Transporte</div>
            <ResumoRow label={current.transporte.label} c1={current.transporte.c1} pvp={current.transporte.pvp} showToast={showToast}/>
          </div>
        )}
        {T.desc>0&&(
          <div style={{padding:'10px 20px',display:'flex',justifyContent:'space-between'}}>
            <span style={{fontFamily:"'Barlow Condensed'",fontSize:11,color:'var(--text2)'}}>Desconto</span>
            <span style={{fontFamily:"'Barlow Condensed'",fontSize:12,color:'var(--text2)'}}>− {fmt2(T.desc)} €</span>
          </div>
        )}
        <div style={{padding:'16px 20px',background:'var(--bg3)',margin:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--text3)',marginBottom:6}}>C1 total</div>
            <CopyVal val={c1fmt(T.c1)} label="C1 total" showToast={showToast} large/>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--text3)',marginBottom:4}}>PVP total</div>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:22,fontWeight:700,color:'var(--gold)'}}>{fmt2(T.pvp)} €</div>
          </div>
        </div>
      </div>
    )}

    </div>
  </div>

  {/* Modal material */}
  {matModal&&<MaterialModal pecaId={matModal} tipoProjeto={current.tipo}
    onSelect={(tipo,desc,grupo,espessura)=>{
      upd('pecas',current.pecas.map(p=>p.id===matModal?{...p,tipo,desc,grupo,espessura,acabamentos:[]}:p))
      setMatModal(null)
    }}
    onClose={()=>setMatModal(null)}/>}

  {/* Modal exportar */}
  <div className={`overlay ${exportModal?'open':''}`}>
    <div className="modal">
      <div className="modal-head">Exportar para orçamento<button className="modal-close" onClick={()=>setExportModal(false)}>✕</button></div>
      {orcamentos.length===0&&<div style={{padding:'20px 0',textAlign:'center',fontFamily:"'Barlow Condensed'",fontSize:10,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--text3)'}}>Nenhum orçamento</div>}
      {orcamentos.map(o=>(
        <div key={o.id} onClick={()=>exportarOrc(o.id)} style={{padding:'14px 0',borderBottom:'1px solid var(--line)',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:14,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--text)'}}>{o.name}</div>
            {o.cliente&&<div style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--text3)',marginTop:2}}>{o.cliente}</div>}
          </div>
          <span style={{color:'var(--gold)'}}>→</span>
        </div>
      ))}
      <div className="modal-actions"><button className="btn btn-outline" onClick={()=>setExportModal(false)}>Cancelar</button></div>
    </div>
  </div>
  </>)
}

// ── Modal escolha de material ──────────────────────────────────────────────
function MaterialModal({ tipoProjeto, onSelect, onClose }) {
  const [tipo, setTipo] = useState(TIPOS_PEDRA.includes(tipoProjeto)?tipoProjeto:'SILESTONES')
  const [grupo, setGrupo] = useState('TODOS')
  const [search, setSearch] = useState('')

  const mat = ANIGRACO[tipo]
  const grupos = ['TODOS',...new Set(mat.materiais.map(m=>m.grupo||'SEM GRUPO'))]
  const lista = mat.materiais.filter(m=>{
    const matchG = grupo==='TODOS'||(m.grupo||'SEM GRUPO')===grupo
    const matchS = !search||m.desc.toLowerCase().includes(search.toLowerCase())
    return matchG&&matchS
  })

  return(
    <div className="overlay open">
      <div className="modal" style={{width:'100%',maxWidth:460}}>
        <div className="modal-head">Material<button className="modal-close" onClick={onClose}>✕</button></div>

        {/* tipo */}
        <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap'}}>
          {TIPOS_PEDRA.map(t=>(
            <button key={t} onClick={()=>{setTipo(t);setGrupo('TODOS');setSearch('')}} style={{padding:'5px 10px',background:tipo===t?'var(--gold)':'transparent',border:'1px solid',borderColor:tipo===t?'var(--gold)':'var(--line2)',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.1em',textTransform:'uppercase',color:tipo===t?'var(--bg)':'var(--text2)'}}>
              {t.charAt(0)+t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* grupos */}
        {grupos.length>2&&(
          <div style={{display:'flex',gap:4,marginBottom:10,flexWrap:'wrap'}}>
            {grupos.map(g=>(
              <button key={g} onClick={()=>setGrupo(g)} style={{padding:'3px 8px',background:grupo===g?'var(--bg3)':'transparent',border:'1px solid',borderColor:grupo===g?'var(--text2)':'var(--line2)',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.08em',color:grupo===g?'var(--text)':'var(--text3)'}}>
                {g}
              </button>
            ))}
          </div>
        )}

        {/* pesquisa */}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar…" style={{width:'100%',background:'transparent',border:'none',borderBottom:'1px solid var(--gold)',padding:'7px 0',fontFamily:"'Barlow'",fontSize:13,fontWeight:300,color:'var(--text)',outline:'none',marginBottom:10}}/>

        {/* lista */}
        <div style={{maxHeight:'42vh',overflowY:'auto'}}>
          {lista.map((m,i)=>{
            const esps=Object.entries(m.espessuras)
            return(
              <div key={i} style={{padding:'10px 0',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}}
                onClick={()=>onSelect(tipo,m.desc,m.grupo,esps[0][0])}>
                <div>
                  <div style={{fontFamily:"'Barlow Condensed'",fontSize:13,fontWeight:500,letterSpacing:'0.06em',color:'var(--text)',textTransform:'uppercase'}}>{m.desc}</div>
                  {m.grupo&&<div style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--text3)',marginTop:1}}>Grupo {m.grupo}</div>}
                </div>
                <div style={{textAlign:'right'}}>
                  {esps.map(([e,v])=>(
                    <div key={e} style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--text3)'}}>{e}: {fmt2(v.pvp)} €/m²</div>
                  ))}
                </div>
              </div>
            )
          })}
          {lista.length===0&&<div style={{padding:'20px',textAlign:'center',fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--text3)'}}>Sem resultados</div>}
        </div>
        <div className="modal-actions"><button className="btn btn-outline" onClick={onClose}>Cancelar</button></div>
      </div>
    </div>
  )
}

// ── ResumoRow ──────────────────────────────────────────────────────────────
function ResumoRow({label,c1,pvp,extra,showToast}){
  return(
    <div style={{display:'flex',alignItems:'center',padding:'9px 20px',gap:10,borderBottom:'1px solid var(--line)'}}>
      <div style={{flex:1}}>
        <div style={{fontSize:12,color:'var(--text)',fontWeight:300}}>{label}</div>
        {extra&&<div style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--text3)',marginTop:1}}>{extra}</div>}
      </div>
      <CopyVal val={c1fmt(c1)} label="C1" showToast={showToast}/>
      <div style={{fontFamily:"'Barlow Condensed'",fontSize:12,fontWeight:500,color:'var(--text2)',minWidth:60,textAlign:'right'}}>{fmt2(pvp)} €</div>
    </div>
  )
}

// ── CopyVal ────────────────────────────────────────────────────────────────
function CopyVal({val,label,showToast,large}){
  const [copied,setCopied]=useState(false)
  return(
    <button onClick={()=>{navigator.clipboard.writeText(val).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),1600);showToast(`${label} copiado — ${val}`)}}
      style={{display:'flex',alignItems:'center',gap:5,background:'transparent',border:'1px solid',borderColor:copied?'var(--gold)':'var(--line2)',padding:large?'6px 12px':'3px 8px',cursor:'pointer',transition:'all .15s'}}>
      <span style={{fontFamily:"'Barlow Condensed'",fontSize:large?16:12,fontWeight:large?600:400,color:copied?'var(--gold)':'var(--text)',letterSpacing:'0.08em'}}>{val}</span>
      <span style={{fontFamily:"'Barlow Condensed'",fontSize:8,color:copied?'var(--gold)':'var(--text3)'}}>{copied?'✓':'⎘'}</span>
    </button>
  )
}
