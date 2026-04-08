import React, { useState } from 'react'

// ── Guia operacional KC ──────────────────────────────────────────────────────
const GUIA = [
  {
    fase: 'FASE ORÇAMENTO',
    cor: '#c8a96e',
    seccoes: [
      {
        titulo: '1. Acolhimento e Qualificação',
        passos: [
          'Explorar as necessidades do cliente — enquadramento das vantagens das Cozinhas Centralizadas.',
          'Abertura de Oportunidade em LM CARE. Se não tens licença, recorre ao pedido de proposta ao HUB Orçamentista.',
          'Agendamento em Scheduler — registar o 1º momento de atendimento caso seja atendimento na hora.',
        ]
      },
      {
        titulo: '2. 1º Atendimento e Contacto com o HUB Orçamentista',
        passos: [
          'Recolher a informação — triar se o interesse é real/imediato.',
          'Registar a informação em LM CARE — garantir que todos os dados do projecto estão registados na Oportunidade.',
          'Submeter o FORM\'S Orçamentista — recorre sempre ao HUB (excepção: venda na hora). Garante que te focas no atendimento e venda.',
          'Coloca sempre a nota "Cozinha Centralizadas" nas notas finais no FORM\'S.',
          'A equipa do HUB conhece todos os procedimentos e listagem de artigos KC.',
          'Agendar 2º momento de entrega de proposta no Scheduler — antes do cliente sair da loja (idealmente 48h/72h depois).',
          'Venda de Visita Técnica (SOP) — garantir a venda e o agendamento da retificação de medidas. Informar o cliente da necessidade de retificação ou assinatura de termo de responsabilidade.',
          'Códigos a usar para a visita: 49015230 – KC_ORÇ P INST MOBILIÁRIO COZINHA_SFW e 49013434 – Verificação de Medidas Cozinhas.',
        ],
        nota: 'Caso o cliente não pretenda adquirir o serviço de retificação, garantir assinatura do termo de responsabilidade e guardar em pasta interna da loja.'
      },
      {
        titulo: '3. Preparação da Proposta',
        passos: [
          'Validar Entregáveis do HUB — confirmar a receção do Projecto + Orçamento + Simulação de instalação e financiamento.',
          'Atualização LM CARE — confirmar que 100% da proposta está espelhada na Oportunidade.',
          'Conformidade em SOP — garantir que a visita técnica já ocorreu e que todos os dados do parceiro e datas estão alinhados e carregados.',
          'Ajustar o orçamento final (se necessário) com base nas medidas reais enviadas pelo instalador/parceiro.',
        ]
      },
      {
        titulo: '4. 2º Atendimento e Fecho',
        passos: [
          'Apresentação de Valor — rever o projecto com o cliente e validar tudo.',
          'Agendar novo momento em caso de não fechar negócio — deixar em LM CARE nova tarefa para contacto ou marcar novo agendamento.',
        ],
        nota: 'Se o cliente decidir adjudicar e não tiver adquirido ainda a Visita Técnica, garantir a venda e o agendamento da retificação de medidas.'
      },
      {
        titulo: '⚡ Regras de Ouro',
        destaque: true,
        passos: [
          'Nunca duplicar ou anular orçamentos do HUB Orçamentista e fazer novos — evita penalizar as taxas de transformação e a produtividade da loja.',
          'Consultar diariamente o LM CARE para cumprir as tarefas de follow-up e não perder negócios.',
        ]
      },
    ]
  },
  {
    fase: 'FASE DE PEDIDO',
    cor: '#4a9ec0',
    seccoes: [
      {
        titulo: '1. Fase de Transformação (Configuração do Pedido)',
        passos: [
          'Modo Multitransação — usar o modo multitransação para toda a venda.',
        ],
        subseccoes: [
          {
            sub: 'Mobiliário, Portas e Complementares',
            passos: [
              'Garantir que todos os artigos estão em PF — artigos do pedido de cozinhas centralizadas devem ficar todos em PF.',
              'Garantir entrega em SFW.',
              'Alinhar data de todos os artigos.',
              'Isolar artigos fora do projecto centralizado em pedidos à parte.',
              'Garantir que é colocado no pedido o código 49015288 - PROJETO COZINHAS SFW para facilitar o seguimento da entrega.',
            ]
          },
          {
            sub: 'Tampos (Pedra e Compósito) — Processos com Marmorista',
            passos: [
              'Separar tampo em pedido isolado.',
              'Colocar todas as linhas do tampo com PF em pausa.',
              'Designação complementar Pyxis — colocar na designação complementar o nº da OS de instalação.',
              'Alinhar todas as datas dos PF em pausa.',
              'Carregar dados/documentos em SOP — upload dos documentos necessários à retificação do marmorista.',
            ]
          },
          {
            sub: 'Serviço de Instalação (quando existe)',
            passos: [
              'Vender Serviço de Instalação — usar o código 49015229 (Instalação Módulos Cozinha).',
              'Caso não seja possível colocar os códigos de instalação no pedido de produto, garantir a colocação do código de tracking 49014163.',
              'Upload no SOP (se necessário actualizar) — carregar os documentos do projecto final.',
              'Garantir data de instalação alinhada — agendar para no mínimo 3 dias úteis após a entrega total da mercadoria.',
            ]
          },
        ]
      },
      {
        titulo: '2. Fase de Validação e Pagamento',
        passos: [
          'Validar todos os campos antes da confirmação — atenção: não são permitidas alterações após a validação.',
          'Garantir o pagamento total no prazo máximo de 48 horas — os pedidos cozinhas centralizadas têm de ser 100% liquidados.',
          'Registar em LM CARE a conversão — alterar estado da oportunidade para "Fechada Ganha".',
          'Registar em LM CARE os pendentes — gerar os pendentes de Produto e de Instalação (se aplicável).',
        ]
      },
      {
        titulo: '✅ VENDA CONCLUÍDA COM SUCESSO',
        destaque: true,
        passos: [
          'Garantir sempre a colocação de referências KC em Orçamento e Multitransação — as que não tenham esta designação não seguirão o mesmo circuito e tempos de promessa.',
        ]
      },
    ]
  },
]

// ── Catálogo KC — dados estáticos (actualizar quando o ficheiro mudar) ──────
const KC_DATA = [
  { cat:'KC · Complementares', sub:'Frentes de Gaveta Interiores', items:[
    { ref:'79952474', desc:'KC_FRENTE GAVETA INT M400 CZ' },
    { ref:'79952481', desc:'KC_FRENTE GAVETA INT M450 CZ' },
    { ref:'79952495', desc:'KC_FRENTE GAVETA INT M600 CZ' },
    { ref:'79952502', desc:'KC_FRENTE GAVETA INT M800 CZ' },
    { ref:'79952516', desc:'KC_FRENTE GAVETA INT M900 CZ' },
    { ref:'79952544', desc:'KC_FRENTE GAVT INT M450 CZ' },
    { ref:'79952551', desc:'KC_FRENTE GAVT INT M600 CZ' },
    { ref:'79952530', desc:'FRENTE GAVT INT M400 CZ' },
  ]},
  { cat:'KC · Complementares', sub:'Organizadores Talheres', items:[
    { ref:'80050453', desc:'KC_ORG GAV TALH M400 CZ DELI ID' },
    { ref:'80050460', desc:'KC_ORG GAV TALH M450 CZ DELI ID' },
    { ref:'80050474', desc:'KC_ORG GAV TALH M600 CZ DELI ID' },
    { ref:'80050481', desc:'KC_ORG GAV TALH M800 CZ DELI ID' },
    { ref:'405654',   desc:'KC_ORG GAV TALH M900 CZ DELI ID' },
    { ref:'80050502', desc:'KC_ORG GAV TALH M1200 CZ DELI ID' },
    { ref:'437148',   desc:'KC_CLIP PARA GAVETA INTERIOR CZ' },
  ]},
  { cat:'KC · Complementares', sub:'Sistema Push Open', items:[
    { ref:'956655',   desc:'KC_KIT PUSH OPEN GAV GAVT 800-1200 (50KG)' },
    { ref:'437146',   desc:'KC_KIT PUSH OPEN P GAVETA 400-600' },
    { ref:'956645',   desc:'KC_BAR SINCRONIZACAO P GAVET PUSH OPEN' },
    { ref:'956663',   desc:'KC_LOT 2 SIST PUSH OPEN P PT BCO DI' },
    { ref:'80136649', desc:'KC_LOT 2 SIST PUSH OPEN P PT CZ DI' },
  ]},
  { cat:'KC · Complementares', sub:'Grelhas de Ventilação', items:[
    { ref:'10689000', desc:'KC_GRELHA VENTIL FORN-FRIG BCO' },
    { ref:'10689014', desc:'KC_GRELHA VENTIL FORN-FRIG PR' },
    { ref:'11896283', desc:'KC_GRELHA VENTIL CR MT (ALUM)' },
    { ref:'15293075', desc:'KC_GRELHA VENTIL FORN INOX 60X12.5' },
    { ref:'15664390', desc:'KC_GRELHA VENTIL INOX' },
    { ref:'956902',   desc:'KC_KIT SUPORTE PARA FORN BCO' },
    { ref:'14798602', desc:'KC_GRELHA VENTIL RODA CZ' },
    { ref:'14798616', desc:'KC_GRELHA VENTIL RODA BCO' },
    { ref:'956894',   desc:'KIT 2 PRAT 30MM P/ MOD FRIG 600 CINZ/BCO' },
  ]},
  { cat:'KC · Complementares', sub:'Barras de Reforço', items:[
    { ref:'16353582', desc:'KC_REGUA 410MM P FORN 45' },
    { ref:'15664383', desc:'KC_BAR REFORCO MOV 60' },
    { ref:'35924952', desc:'KC_BAR REFORCO MOV 80' },
    { ref:'35924931', desc:'KC_BAR REFORCO MOV 90' },
    { ref:'35924903', desc:'KC_BAR REFORCO MOV 120' },
  ]},
  { cat:'KC · Complementares', sub:'Chapas Anti-Humidade', items:[
    { ref:'82584710', desc:'KC_CHAPA ANTI-HUMIDADE ALUM M45' },
    { ref:'82584712', desc:'KC_CHAPA ANTI-HUMIDADE ALUM M60' },
    { ref:'82584711', desc:'KC_CHAPA ANTI-HUMIDADE ALUM M80' },
    { ref:'82584715', desc:'KC_CHAPA ANTI-HUMIDADE ALUM M90' },
    { ref:'82584716', desc:'KC_CHAPA ANTI-HUMIDADE ALUM M120' },
  ]},
  { cat:'KC · Complementares', sub:'Extraíveis Lava-Loiças', items:[
    { ref:'89310932', desc:'KC_KIT EXTR GAV INF LAVA-LOICAS M600 CZ' },
    { ref:'89134165', desc:'KC_KIT EXTR GAV INF LAVA-LOICAS M800 CZ' },
    { ref:'89134161', desc:'KC_KIT EXTR GAV INF LAVA-LOICAS M900 CZ' },
  ]},
  { cat:'KC · Complementares', sub:'Extraíveis Reciclagem', items:[
    { ref:'89134163', desc:'KC_KIT EXTR 2X16L B LIX REC M600 CZ' },
    { ref:'89134164', desc:'KC_KIT EXTR 3X15L B LIX REC M800 CZ' },
    { ref:'89134162', desc:'KC_KIT EXTR 4X16L B LIX INT EXT M900' },
    { ref:'92114346', desc:'KC_KIT EXTR 2X24L B LIX INT EXT 45CM' },
    { ref:'92114347', desc:'KC_KIT EXTR 2X35L B LIX INT EXT 60CM' },
    { ref:'92114348', desc:'KC_KIT EXTR 2X24L+2X8L B LIX INT EXT 60CM' },
    { ref:'81986042', desc:'KC_B LIX 24L P INT GAV CZ' },
  ]},
  { cat:'KC · Complementares', sub:'Prateleiras', items:[
    { ref:'82399528', desc:'KC_KIT 2 PRATEL P M450 P580 BCO' },
    { ref:'82399529', desc:'KC_KIT 2 PRATEL P M600 P580 BCO' },
    { ref:'82399530', desc:'KC_KIT 2 PRATEL P M450 P350 BCO' },
    { ref:'82399531', desc:'KC_KIT 2 PRATEL P M600 P350 BCO' },
    { ref:'82399533', desc:'KC_KIT 2 PRATEL P M450 P580 CZ' },
    { ref:'82399534', desc:'KC_KIT 2 PRATEL P M600 P580 CZ' },
    { ref:'82399535', desc:'KC_KIT 2 PRATEL P M450 P350 CZ' },
    { ref:'82399536', desc:'KC_KIT 2 PRATEL P M600 P350 CZ' },
  ]},
  { cat:'KC · Complementares', sub:'Instalação Lava-Loiça', items:[
    { ref:'19868366', desc:'KC_SIFAO GARRAFA D40' },
    { ref:'91779066', desc:'KC_SIFAO GARRAFA PLASTICO EXTENS 1/2 D40' },
    { ref:'91779105', desc:'KC_TUBO EXTENSIVEL 1.1/2 40-50MM BRAN' },
    { ref:'17309145', desc:'KC_SILICONE COZ WC UHU SUPER 300ML BR' },
    { ref:'17309173', desc:'KC_SILICONE COZ UHU SUPER 300ML TR' },
  ]},
  { cat:'KC · Complementares', sub:'Inst. Placa / Exaustor', items:[
    { ref:'81963200', desc:'FITA DE CALAFETAGEM' },
    { ref:'84299215', desc:'KC_TUBO FLEXIVEL ALU D120 C35 A 200CM' },
    { ref:'15765806', desc:'KC_FITA ALUMINIO 50MM X 10 METROS SANITOP' },
    { ref:'82764046', desc:'KC_PROT EXAST 35X27 C 1 DOB.' },
    { ref:'84232725', desc:'KC_PARAFUSO OCULTO TAM BANCADA 13MM' },
  ]},
  { cat:'KC · Rodapés', sub:'Rodapés Brancos', items:[
    { ref:'905830',   desc:'KC_RODA 240X10 PTS BRANCAS' },
    { ref:'917079',   desc:'KC_RODA 240X10 PVC DELI' },
    { ref:'82764034', desc:'KC_RODA PL BRAN BRIL 9.6X200CM' },
    { ref:'82764033', desc:'KC_RODA PL BRAN BRIL 9.6X400CM' },
    { ref:'82764035', desc:'KC_UNIA 90º ROD BRAN BRIL 9.6CM' },
    { ref:'82764036', desc:'KC_UNIA MULTI-ANG BRAN BRIL 9.6CM' },
    { ref:'82764038', desc:'KC_RODA PL BRAN RUGOSO 9.6X200CM' },
    { ref:'82764037', desc:'KC_RODA PL BRAN RUGOSO 9.6X400CM' },
    { ref:'82764040', desc:'KC_UNIA MULTI-ANG BRAN RUGOSO 9.6CM' },
    { ref:'82764039', desc:'KC_UNIA 90º ROD BRAN RUGOSO 9.6CM' },
  ]},
  { cat:'KC · Rodapés', sub:'Rodapés Alumínio', items:[
    { ref:'917077',   desc:'KC_RODA H.10X240CM PVC ALUMINIO' },
    { ref:'98371898', desc:'KC_RODA PVC ALUM 9.6X200CM' },
    { ref:'81978515', desc:'KC_RODA PVC ALUM 9.6X400CM' },
    { ref:'82764041', desc:'KC_CANT 90º ROD ALUM.805 9.6CM' },
    { ref:'82764042', desc:'KC_UNIA MULTI-ANG ALUM 805 10CM' },
    { ref:'15007034', desc:'KC_RODA PVC ALUM 14.6X200CM' },
    { ref:'15869161', desc:'KC_RODA PVC ALUM 14.6X400CM' },
    { ref:'15007055', desc:'KC_UNIA RODA MULTI-ANG 15CM ALUM' },
    { ref:'15847461', desc:'KC_UNIA RODA PVC 14.6CM ALUM' },
    { ref:'15007076', desc:'KC_CANT RODA 90º 14.6CM ALUM' },
  ]},
  { cat:'KC · Rodapés', sub:'Acessórios Rodapé', items:[
    { ref:'940507',   desc:'KC_LOT 10 ABRACADEIRAS PARA RODA PVC' },
    { ref:'940509',   desc:'KC_LOT 10 ABRACADEIRAS PARA RODA MAD.' },
    { ref:'940935',   desc:'KC_LOT 4 PES 100 REG(95-118) C ABRAC PT' },
    { ref:'16329194', desc:'KC_PE TELESOPICO RED A700-1100 D60 CROM' },
    { ref:'14722050', desc:'KC_16 BATENTES 2 PONTAS PEQ BR' },
  ]},
  { cat:'KC · Fixação', sub:'Parafusos e Fixação', items:[
    { ref:'13803370', desc:'KC_36 CAPA PARAF ADESIVO PVC D17MM BRANC' },
    { ref:'17449264', desc:'KC_PACK 30 PARAFUSOS+BUCHAS TACO' },
    { ref:'81933022', desc:'KC_50BUCH+PARAF MULTIMAT D8X50MM' },
    { ref:'82231803', desc:'KC_35PARAF C.PLAN OVAL PZ A.CROM 4X16' },
    { ref:'82231851', desc:'KC_250PARAF C.PLAN OVAL PZ A.CROM 4X30' },
    { ref:'82240466', desc:'KC_100TAPA PARAF PLAST ADES BR D13MM' },
    { ref:'956665',   desc:'KC_LOT TAMAS PARA FUROS DOB BCO' },
    { ref:'956667',   desc:'KC_LOT TAMAS PARA FUROS DOB CZ' },
    { ref:'947979',   desc:'KC_LOT 120 TAMAS P FURO MODULO BCO' },
    { ref:'947981',   desc:'KC_LOT 120 TAMAS P FURO MODULO CZ' },
    { ref:'15872003', desc:'KC_BATNTE ADESIVO 10X3MM 25UN' },
    { ref:'79783074', desc:'KC_ESQUADRO ANG INOX 40X15X2MM' },
  ]},
  { cat:'KC · Dobradiças', sub:'Dobradiças', items:[
    { ref:'80129468', desc:'KC_LOT 2 DOBA 110º C AMORT C BUCHA' },
    { ref:'80129470', desc:'KC_LOT 2 DOBA 110º C AMORT P VITRINE' },
    { ref:'80129469', desc:'KC_LOT 2 DOBA 165º C AMORT C BUCHA' },
    { ref:'15042734', desc:'DOB ESPECIAL D35 P PT FRIGO' },
    { ref:'88884906', desc:'KC_DOBAD. P PT ELEV. FREESPACE MINI TYPE C' },
    { ref:'81880308', desc:'KC_6 DOB INV RECTA C CLIP 35MM' },
    { ref:'88884907', desc:'KC_DOBAD. P PT ELEV. FREESPACE MINI TYPE D' },
    { ref:'923439',   desc:'KC_SIST ELEVATORIO COMP BASICO' },
    { ref:'14959476', desc:'COMP PTA ELEV 247MM TELESCOPICO A GAS' },
    { ref:'16010610', desc:'10 BUCHAS 10MM+PARAF P/DOB' },
  ]},
  { cat:'KC · Perfis de Tampo', sub:'Perfil 1', items:[
    { ref:'17541321', desc:'KC_TERMINAL TAM PR PERF 1 30MM' },
    { ref:'17541580', desc:'UNIAO RECTA PR PERFIL 1 30MM' },
    { ref:'17541762', desc:'KC_UNIA EM L TAM PR PERF 1 30MM' },
    { ref:'17541650', desc:'KC_TERMINAL TAM BR PERF 1 30MM' },
    { ref:'17541363', desc:'UNIAO RECTA BR PERFIL 1 30MM' },
    { ref:'17541440', desc:'KC_UNIA EM L TAM BR PERF 1 30MM' },
    { ref:'17541825', desc:'KC_TERMINAL TAM ALUM MT PERF 1 30MM' },
    { ref:'17541881', desc:'KC_UNIA RECTA ALUM MT PERF 1 30MM' },
    { ref:'17541594', desc:'KC_UNIA EM L TAM ALUM MT PERF 2 30MM' },
    { ref:'17541741', desc:'KC_TERMINAL TAM PRT PERF 2 30MM' },
    { ref:'17541391', desc:'KC_UNIA RECTA TAM PRT PERF 1 30MM' },
    { ref:'17541923', desc:'UNIAO EM L TAMPO PRT PERFIL 2 30MM' },
  ]},
  { cat:'KC · Perfis de Tampo', sub:'Perfil 2', items:[
    { ref:'17541783', desc:'KC_TERMINAL TAM PR PERF 2 30MM' },
    { ref:'17541776', desc:'KC_UNIA RECTA TAM PR PERF 2 30MM' },
    { ref:'17541965', desc:'KC_UNIA EM L TAM PR PERF 2 30MM' },
    { ref:'17541811', desc:'KC_TERMINAL TAM BR PERF 2 30MM' },
    { ref:'17541622', desc:'KC_UNIA RECTA TAM BR PERF 2 30MM' },
    { ref:'17542175', desc:'KC_UNIA EM L TAM BR PERF 2 30MM' },
    { ref:'17520426', desc:'KC_TERMINAL TAM ALUM MT P2 30MM' },
    { ref:'17541503', desc:'KC_UNIA RECTA TAM ALUM MT PERF 2 30MM' },
    { ref:'17541853', desc:'KC_UNIA EM L TAM ALUM MT PERF 1 30MM' },
    { ref:'17541335', desc:'KC_TERMINAL TAM PRT PERF 1 30MM' },
    { ref:'17541846', desc:'KC_UNIA EM L TAM PRT PERF 2 30MM' },
  ]},
  { cat:'KC · Perfis de Tampo', sub:'Perfil 3', items:[
    { ref:'17541573', desc:'KC_TERMINAL TAM RECTO P3 30MM PR' },
    { ref:'17541643', desc:'KC_UNIA TAM RECTA P3 30MM PR' },
    { ref:'17541454', desc:'KC_UNIA EM L TAM P3 30MM PR' },
    { ref:'17541433', desc:'KC_TERMINAL TAM RECTO P3 30MM BRAN' },
    { ref:'17541734', desc:'KC_UNIA TAM RECTA P3 30MM BRANCA' },
    { ref:'17541482', desc:'KC_UNIA EM L TAM 30MM P3 BRANCA' },
    { ref:'17541664', desc:'KC_TERMINAL TAM RECTO P3 30MM PRATA MT' },
    { ref:'17541944', desc:'KC_UNIA TAM RECTA P3 30MM PRATA MT' },
    { ref:'17541790', desc:'KC_UNIA EM L TAM P3 30MM PRATA MT' },
    { ref:'17541895', desc:'KC_TERMINAL TAM RECTO 30MM PRATA BR' },
    { ref:'17541986', desc:'KC_UNIA TAM RECTA 30MM PRATA BR' },
    { ref:'17541475', desc:'KC_UNIA EM L TAM 30MM PRATA BR' },
  ]},
  { cat:'KC · Perfis de Tampo', sub:'Perfil Recto 40mm', items:[
    { ref:'17542021', desc:'KC_TERMINAL TAM RECTO 40MM BRAN' },
    { ref:'17541405', desc:'KC_UNIA TAM RECTA 40MM BRANCA' },
    { ref:'17541370', desc:'KC_UNIA EM L TAM RECTA 40MM BRANCA' },
    { ref:'17542161', desc:'KC_TERMINAL TAM RECTO 40MM PR' },
    { ref:'17541706', desc:'KC_UNIA TAM RECTA 40MM PR' },
    { ref:'17541601', desc:'KC_UNIA EM L TAM RECTA 40MM PR' },
    { ref:'17542210', desc:'KC_TERMINAL TAM RECTO 40MM PRATA MT' },
    { ref:'17541951', desc:'KC_UNIA TAM RECTA 40MM PRATA MT' },
    { ref:'17542070', desc:'KC_UNIA EM L TAM RECTA 40MM PRATA MT' },
    { ref:'17542091', desc:'KC_TERMINAL TAM RECTO 40MM PRATA BR' },
    { ref:'17542042', desc:'KC_UNIA EM L TAM RECTA 40MM PRATA BR' },
    { ref:'17542000', desc:'KC_UNIA TAM RECTA 40MM PRATA BR' },
  ]},
  { cat:'KC · Perfis de Tampo', sub:'Copetes', items:[
    { ref:'17522883', desc:'COPETE CONCAVO PR 4M' },
    { ref:'15854111', desc:'KC_COPETE CONCAVO PR 2.4M DL' },
    { ref:'17541916', desc:'KC_TERMINAL COPETE CONCAVO PR' },
    { ref:'17541832', desc:'KC_COPETE CANT CONCAVO PR' },
    { ref:'17542182', desc:'KC_COPETE ESQUINA CONCAVO PR' },
    { ref:'17522855', desc:'COPETE CONCAVO BR 4M' },
    { ref:'15854090', desc:'KC_COPETE CONCAVO BR 2.4M DL' },
    { ref:'17541685', desc:'KC_TERMINAL COPETE CONCAVO BRAN' },
    { ref:'17541993', desc:'KC_COPETE CANT CONCAVO BRAN' },
    { ref:'17542231', desc:'KC_COPETE ESQUINA BRAN MT' },
    { ref:'17522862', desc:'COPETE CONCAVO PRATA MATE 4M' },
    { ref:'15854104', desc:'KC_COPETE CONCAVO PRT MT 2.4M DL' },
    { ref:'17520412', desc:'KC_TERMINAL COPETE CONCAVO PRATA MT' },
    { ref:'17541902', desc:'KC_COPETE CANT CONCAVO PRATA MT' },
    { ref:'17542063', desc:'KC_COPETE ESQUINA PRATA MT' },
    { ref:'17522876', desc:'COPETE CONCAVO PRATA BR 4M' },
    { ref:'16468620', desc:'COPETE CONCAVO PRT BRILHO 2.4MTS' },
    { ref:'17542224', desc:'KC_TERMINAL COPETE CONCAVO PRATA BR' },
    { ref:'17541524', desc:'KC_COPETE CANT CONCAVO PRATA BR' },
    { ref:'17542140', desc:'KC_COPETE ESQUINA PRATA BR' },
  ]},
  { cat:'KC · Tampos de Madeira', sub:'Proteção Tampo Madeira', items:[
    { ref:'14080094', desc:'TAPA POROS BONDEX 750ML' },
    { ref:'16700096', desc:'VZ WC&COZ AQ MT LUXENS 0.75L INC' },
    { ref:'16700166', desc:'VZ WC&COZ AQ ACET LUXENS 0.75L INC' },
    { ref:'16699704', desc:'VZ WC&COZ AQ BR LUXENS 0.75L INC' },
  ]},
  { cat:'KC · Iluminação', sub:'Iluminação LED', items:[
    { ref:'87978126', desc:'KC_FIT LED CUTFX REG 6500K 600LM 5M INSP' },
    { ref:'87978102', desc:'KC_FIT LED CUTFLEX 4000K 1000LM 5M INSP' },
    { ref:'87978111', desc:'KC_FIT LED FLEX REG 6500K 600LM 10M INSP' },
    { ref:'87978139', desc:'KC_PERF LED 2MX2CM ALU BR INSP' },
  ]},
  { cat:'KC · Instalações', sub:'Serviços de Instalação', items:[
    { ref:'49015288', desc:'PROJETO COZINHAS CENTRALIZADAS' },
    { ref:'49014163', desc:'PEDIDO DE PRODUTO PARA INSTALACAO' },
    { ref:'49015229', desc:'INSTALACAO MODULOS COZINHA - PROJETO SFW' },
    { ref:'49015230', desc:'ORC P INST MOBILIARIO COZINHA PROJETOSFW' },
    { ref:'49010649', desc:'TRABALHO COMPLEMENTAR MOBILIARIO COZINHA' },
    { ref:'49010617', desc:'REMOCAO ECO COZINHA ML' },
    { ref:'49010618', desc:'REMOCAO SIMPLES COZINHA ML' },
    { ref:'49010611', desc:'INSTALACAO EXTRAIVEL COLUNA OU CANTO' },
    { ref:'49010612', desc:'ADAPTACAO DE MODULOS DE COZINHA' },
    { ref:'49010610', desc:'INSTALACAO EXTRAIVEL STANDART' },
    { ref:'49010613', desc:'CORTES SIMPLES' },
    { ref:'49010609', desc:'INSTALACAO GAVETA/GAV. INTERIOR/GAVETAO' },
  ]},
  { cat:'KC · Instalações', sub:'Extensão Garantia 3+2', items:[
    { ref:'49014135', desc:'EXTENSAO GARANTIA 0-250' },
    { ref:'49014136', desc:'EXTENSAO GARANTIA 250-500' },
    { ref:'49014137', desc:'EXTENSAO GARANTIA 500-750' },
    { ref:'49014138', desc:'EXTENSAO GARANTIA 750-1000' },
    { ref:'49014139', desc:'EXTENSAO GARANTIA 1000-1500' },
    { ref:'49014140', desc:'EXTENSAO GARANTIA 1500-2500' },
    { ref:'49014141', desc:'EXTENSAO GARANTIA 2500-5000' },
  ]},
  { cat:'KC · Instalações', sub:'Extensão Garantia 3+1', items:[
    { ref:'49014228', desc:'EXTENSAO GARANTIA 0-25' },
    { ref:'49014229', desc:'EXTENSAO GARANTIA 25-50' },
    { ref:'49014231', desc:'EXTENSAO GARANTIA 50-75' },
    { ref:'49014232', desc:'EXTENSAO GARANTIA 75-100' },
    { ref:'49014233', desc:'EXTENSAO GARANTIA 100-125' },
    { ref:'49014234', desc:'EXTENSAO GARANTIA 125-150' },
    { ref:'49014235', desc:'EXTENSAO GARANTIA 150-175' },
    { ref:'49014236', desc:'EXTENSAO GARANTIA 175-200' },
  ]},
]

// flatten todos os itens com cat+sub
const ALL_ITEMS = KC_DATA.flatMap(g => g.items.map(i => ({ ...i, cat: g.cat, sub: g.sub })))
const CATS = ['Todas', ...new Set(KC_DATA.map(g => g.cat))]

export default function KC({ showToast }) {
  const [tab,       setTab]       = useState('guia')
  const [search,    setSearch]    = useState('')
  const [activeCat, setActiveCat] = useState('Todas')
  const [activeSub, setActiveSub] = useState('')
  const [catOpen,   setCatOpen]   = useState(false)

  const KC_BLUE     = '#4a9ec0'
  const KC_BLUE_DIM = 'rgba(74,158,192,0.15)'
  const KC_GOLD     = '#c8a96e'

  // subs da categoria activa
  const subsForCat = activeCat === 'Todas' ? [] :
    [...new Set(KC_DATA.filter(g => g.cat === activeCat).map(g => g.sub))]

  const filtered = ALL_ITEMS.filter(i => {
    const mc  = activeCat === 'Todas' ? true : i.cat === activeCat
    const ms  = !activeSub || i.sub === activeSub
    const q   = search.toLowerCase()
    const mq  = !q || i.ref.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)
    return mc && ms && mq
  })

  const grouped = filtered.reduce((acc, i) => {
    const key = i.cat + '||' + i.sub
    if (!acc[key]) acc[key] = { cat: i.cat, sub: i.sub, items: [] }
    acc[key].items.push(i)
    return acc
  }, {})

  const selectCat = (c) => { setActiveCat(c); setActiveSub(''); setCatOpen(false) }
  const copy = (ref) => {
    navigator.clipboard.writeText(ref).catch(() => {})
    showToast('Referência copiada — ' + ref)
  }

  const TAB_BTN = (id, label) => (
    <button onClick={() => setTab(id)} style={{
      background: 'transparent', border: 'none', cursor: 'pointer',
      padding: '10px 20px', borderBottom: tab === id ? `2px solid ${id === 'guia' ? KC_GOLD : KC_BLUE}` : '2px solid transparent',
      fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: '0.16em',
      textTransform: 'uppercase', color: tab === id ? (id === 'guia' ? KC_GOLD : KC_BLUE) : 'var(--neo-text2)',
      transition: 'all .15s', whiteSpace: 'nowrap',
    }}>{label}</button>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', background:'var(--neo-bg)' }}>

      {/* TABS */}
      <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0, paddingLeft:8 }}>
        {TAB_BTN('guia', '📋 Guia Operacional')}
        {TAB_BTN('refs', '🔍 Referências KC')}
      </div>

      {/* ── TAB GUIA ── */}
      {tab === 'guia' && (
        <div style={{ flex:1, overflowY:'auto', padding:'16px' }} className="neo-scroll">
          {GUIA.map(fase => (
            <div key={fase.fase} style={{ marginBottom: 28 }}>
              {/* Cabeçalho fase */}
              <div style={{
                display:'flex', alignItems:'center', gap:10, marginBottom:16,
                paddingBottom:8, borderBottom:`2px solid ${fase.cor}44`
              }}>
                <div style={{ width:3, height:22, background:fase.cor, borderRadius:2, flexShrink:0 }}/>
                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:16, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:fase.cor }}>
                  {fase.fase}
                </span>
              </div>

              {fase.seccoes.map((sec, si) => (
                <div key={si} style={{
                  marginBottom:14, padding:'12px 14px',
                  background: sec.destaque ? `${fase.cor}0f` : 'var(--neo-bg2)',
                  borderRadius:'var(--neo-radius-sm)',
                  border: sec.destaque ? `1px solid ${fase.cor}33` : '1px solid rgba(255,255,255,0.04)',
                  boxShadow:'var(--neo-shadow-out-sm)',
                }}>
                  <div style={{ fontFamily:"'Barlow Condensed'", fontSize:12, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color: sec.destaque ? fase.cor : 'var(--neo-text)', marginBottom:10 }}>
                    {sec.titulo}
                  </div>

                  {sec.passos && sec.passos.map((p, pi) => (
                    <div key={pi} style={{ display:'flex', gap:8, marginBottom:6, alignItems:'flex-start' }}>
                      <span style={{ color:fase.cor, fontSize:10, flexShrink:0, marginTop:3, opacity:.7 }}>▸</span>
                      <span style={{ fontFamily:"'Barlow'", fontSize:12, fontWeight:300, color:'var(--neo-text)', lineHeight:1.6 }}>{p}</span>
                    </div>
                  ))}

                  {sec.subseccoes && sec.subseccoes.map((ss, ssi) => (
                    <div key={ssi} style={{ marginTop:10, paddingLeft:12, borderLeft:`2px solid ${fase.cor}33` }}>
                      <div style={{ fontFamily:"'Barlow Condensed'", fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:fase.cor, marginBottom:6, opacity:.8 }}>
                        {ss.sub}
                      </div>
                      {ss.passos.map((p, pi) => (
                        <div key={pi} style={{ display:'flex', gap:8, marginBottom:5, alignItems:'flex-start' }}>
                          <span style={{ color:fase.cor, fontSize:10, flexShrink:0, marginTop:3, opacity:.5 }}>·</span>
                          <span style={{ fontFamily:"'Barlow'", fontSize:12, fontWeight:300, color:'var(--neo-text2)', lineHeight:1.6 }}>{p}</span>
                        </div>
                      ))}
                    </div>
                  ))}

                  {sec.nota && (
                    <div style={{ marginTop:8, padding:'8px 10px', background:'rgba(255,255,255,0.03)', borderRadius:6, borderLeft:`2px solid ${fase.cor}55` }}>
                      <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:fase.cor, opacity:.7 }}>Nota </span>
                      <span style={{ fontFamily:"'Barlow'", fontSize:11, fontWeight:300, color:'var(--neo-text2)', lineHeight:1.5 }}>{sec.nota}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── TAB REFERÊNCIAS ── */}
      {tab === 'refs' && (
        <>
      {/* TOPBAR refs */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', flexShrink:0, borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ position:'relative', flexShrink:0 }}>
          <button onClick={() => setCatOpen(o => !o)} style={{
            background: activeCat !== 'Todas' ? KC_BLUE_DIM : 'var(--neo-bg2)',
            border: activeCat !== 'Todas' ? `1px solid ${KC_BLUE}44` : '1px solid transparent',
            borderRadius:'var(--neo-radius-pill)', padding:'0 14px', height:34, cursor:'pointer',
            fontFamily:"'Barlow Condensed'", fontSize:10, fontWeight:700, letterSpacing:'0.12em',
            textTransform:'uppercase', color: activeCat !== 'Todas' ? KC_BLUE : 'var(--neo-text2)',
            boxShadow:'var(--neo-shadow-out-sm)', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap',
          }}>
            {activeCat === 'Todas' ? 'Categoria' : activeCat.replace('KC · ','')}
            <span style={{ fontSize:8, opacity:.6 }}>▼</span>
          </button>
          {catOpen && (
            <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, background:'var(--neo-bg2)', borderRadius:'var(--neo-radius-sm)', boxShadow:'var(--neo-shadow-out)', zIndex:50, minWidth:200, overflow:'hidden' }}>
              {CATS.map(c => (
                <button key={c} onClick={() => selectCat(c)} style={{
                  display:'block', width:'100%', padding:'10px 14px', background: activeCat===c ? 'var(--neo-bg)' : 'transparent',
                  border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:10,
                  letterSpacing:'0.1em', textTransform:'uppercase',
                  color: activeCat===c ? KC_BLUE : 'var(--neo-text2)', textAlign:'left',
                }}>
                  {c === 'Todas' ? 'Todas as categorias' : c.replace('KC · ','')}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ flex:1, position:'relative' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar ref. ou descrição…"
            style={{ width:'100%', background:'var(--neo-bg)', border:'none', borderRadius:'var(--neo-radius-sm)', boxShadow:'var(--neo-shadow-in-sm)', padding:'9px 36px 9px 14px', fontFamily:"'Barlow'", fontSize:13, fontWeight:300, color:'var(--neo-text)', outline:'none', boxSizing:'border-box' }}
          />
          {search
            ? <button onClick={() => setSearch('')} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'transparent', border:'none', cursor:'pointer', color:'var(--neo-text2)', fontSize:13 }}>✕</button>
            : <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:'var(--neo-text2)', fontSize:14, pointerEvents:'none' }}>⌕</span>
          }
        </div>
        <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--neo-text2)', flexShrink:0 }}>
          {filtered.length} ref.
        </span>
      </div>

      {/* SUBS */}
      {subsForCat.length > 0 && (
        <div style={{ display:'flex', gap:6, padding:'8px 16px', overflowX:'auto', flexShrink:0, borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
          <button onClick={() => setActiveSub('')} style={{
            flexShrink:0, background: activeSub==='' ? KC_BLUE_DIM : 'var(--neo-bg2)',
            border: activeSub==='' ? `1px solid ${KC_BLUE}55` : '1px solid transparent',
            borderRadius:'var(--neo-radius-pill)', padding:'4px 12px', cursor:'pointer',
            fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:600, letterSpacing:'0.12em',
            textTransform:'uppercase', color: activeSub==='' ? KC_BLUE : 'var(--neo-text2)',
          }}>Todas</button>
          {subsForCat.map(s => (
            <button key={s} onClick={() => setActiveSub(s)} style={{
              flexShrink:0, background: activeSub===s ? KC_BLUE_DIM : 'var(--neo-bg2)',
              border: activeSub===s ? `1px solid ${KC_BLUE}55` : '1px solid transparent',
              borderRadius:'var(--neo-radius-pill)', padding:'4px 12px', cursor:'pointer',
              fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:600, letterSpacing:'0.12em',
              textTransform:'uppercase', color: activeSub===s ? KC_BLUE : 'var(--neo-text2)',
            }}>{s}</button>
          ))}
        </div>
      )}

      {/* LISTA */}
      <div style={{ flex:1, overflowY:'auto', padding:'8px 16px 16px' }} className="neo-scroll">
        {Object.values(grouped).length === 0 && (
          <div style={{ textAlign:'center', padding:'48px 0', fontFamily:"'Barlow Condensed'", fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--neo-text2)' }}>
            Nenhum resultado
          </div>
        )}
        {Object.values(grouped).map(group => (
          <div key={group.cat + group.sub} style={{ marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, paddingBottom:6, borderBottom:`1px solid ${KC_BLUE}22` }}>
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color: KC_BLUE, opacity:.7 }}>
                {group.cat.replace('KC · ','')}
              </span>
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--neo-text)' }}>
                {group.sub}
              </span>
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-text2)', letterSpacing:'0.1em', marginLeft:'auto' }}>
                {group.items.length}
              </span>
            </div>
            {group.items.map(item => (
              <KCRow key={item.ref} item={item} onCopy={copy} kcBlue={KC_BLUE} />
            ))}
          </div>
        ))}
      </div>
        </>
      )}
    </div>
  )
}

function KCRow({ item, onCopy, kcBlue }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    onCopy(item.ref)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:10,
      padding:'8px 10px', marginBottom:3,
      background:'var(--neo-bg2)', borderRadius:'var(--neo-radius-sm)',
      borderLeft:`2px solid ${kcBlue}44`,
      boxShadow:'var(--neo-shadow-out-sm)',
    }}>
      {/* Ref */}
      <span className="neo-h3" style={{ fontFamily:"'Barlow Condensed'", fontSize:15, fontWeight:700, letterSpacing:'0.06em', color: kcBlue, flexShrink:0, minWidth:80 }}>
        {item.ref}
      </span>

      {/* Desc */}
      <span className="neo-h1" style={{ fontFamily:"'Barlow'", fontSize:12, fontWeight:300, color:'var(--neo-text)', flex:1, lineHeight:1.3 }}>
        {item.desc}
      </span>

      {/* Copy */}
      <button onClick={handleCopy} style={{
        flexShrink:0, background: copied ? `linear-gradient(145deg,${kcBlue},#2a6a8a)` : 'var(--neo-bg)',
        border:'none', borderRadius:'var(--neo-radius-pill)', width:28, height:28,
        cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow: copied ? 'var(--neo-shadow-in-sm)' : 'var(--neo-shadow-out-sm)',
        color: copied ? '#fff' : 'var(--neo-text2)', transition:'all .15s',
      }}>
        {copied ? '✓' : '⎘'}
      </button>
    </div>
  )
}
