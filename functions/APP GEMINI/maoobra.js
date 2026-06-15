// ════════════════════════════════════════════════
// maoobra.js · Work Kit · Hélder Melo
// v4 — dados reais dos Excel LM 2026
//      253 serviços · 59 categorias · 6 secções
// ════════════════════════════════════════════════

import { doc, setDoc, getDoc }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getDb, getST, fmt, toast, setSyncOk, mostrarErroDB } from './utils.js';

// ════════════════════════════════════════════════
// CÓDIGOS GLOBAIS OBRIGATÓRIOS
// ════════════════════════════════════════════════
export const MO_GLOBAIS = [
  { cod: '49014163', nome: 'Pedido de Produto para Instalação', pvp: 0,  nota: '⚠️ OBRIGATÓRIO em todos os pedidos com instalação' },
  { cod: '49013101', nome: 'Deslocação Instalações',            pvp: 30, nota: '⚠️ Adicionar sempre que aplicável' },
  { cod: '49013106', nome: 'Deslocação Manutenção e Reparação', pvp: 30, nota: '⚠️ Para pedidos de manutenção' },
  { cod: '49013102', nome: 'Km Extra Instalações',              pvp: 1,  nota: '💡 1€/km após os 30km (só ida)' },
  { cod: '49013394', nome: 'Km Extra Orçamento',                pvp: 1,  nota: '💡 1€/km após os 30km (só ida)' },
  { cod: '49013103', nome: 'Km Extra Manutenções',              pvp: 1,  nota: '💡 1€/km após os 30km (só ida)' },
];

// ════════════════════════════════════════════════
// BASE DE DADOS — gerado dos Excel LM 2026
// 253 serviços · 59 categorias · 6 secções
// ════════════════════════════════════════════════
// MO_SECCOES — gerado automaticamente a partir dos Excel LM 2026
export const MO_SECCOES = {
  "Cozinhas e Roupeiros": [
    { cat: "(Geral)", icon: '🔧', cor: '#8B4513', servicos: [
      { cod:'49010617', nome:'Remoção ECO Cozinha ML (minimo 3ml)', pvp:43.0, unid:'un', inclui:'Desmontagem e remoção de cozinha antiga ao metro linear  com entrega a ponto de reciclagem', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49010618', nome:'Desinstalação Simples Cozinha ML', pvp:25.0, unid:'un', inclui:'Desinstalação de todos os móveis e equipamentos da cozinha', exclui:'Remoção dos móveis e equipamentos de casa do cliente\nTratamento dos resuidos em ponto de reciclagem adequado', condicoes:'' },
      { cod:'49010619', nome:'Orçamento Remodelação Cozinhas', pvp:30.0, unid:'un', inclui:'Revisão detalhada das medidas existentes na cozinha\nLevantamento de planta da cozinha \nPreenchimento e desenho da planta da cozinha para equipa técnica de loja executar o projeto da Cozinha', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49011142', nome:'Trabalho Complementar Impermeabilização Interior', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49010648', nome:'Visita de Orç. para inst. Mobiliário de Cozinha', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos\nRecolha e transporte do equipamento removido para ponto de reciclagem \nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)"', condicoes:'' },
      { cod:'49010649', nome:'Trabalho complementar Mobiliário de Cozinha', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49014390', nome:'INST. ELETRODOMESTICO ELETRICO - EXTERNO (Não comprado na Leroy Merlin)', pvp:59.0, unid:'un', inclui:'Instalação do eletrodoméstico conforme manual de instalação;\nLigação elétrica até à caixa de derivação mais próxima (max. 1,5mt);\nTeste e funcionamento.\nFixação de exaustor à chaminé ou a móvel apropriado;\nMontagem do tubo de escoamento de fumos, pressupondo:\nEncaixe e fixação do tubo flexível à boca de Saída do Exaustor;\nLigação do tubo flexível à chaminé da casa, desde que se trate de um encaixe ou\nfixação simples.\nLigação eléctrica do exaustor até à caixa de derivação mais próxima (max. 2m);\nTeste e afinação do exaustor', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos\nRecolha e transporte do equipamento removido para ponto de reciclagem \nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)"', condicoes:'Caixa de derivação até 1,5mt\nPara ligação eléctrica do exaustor até à caixa de derivação mais próxima (max. 2m);' },
      { cod:'49014391', nome:'INST. ELETRODOMESTICO ELETRICO - OFERTA', pvp:0.01, unid:'un', inclui:'Instalação do eletrodoméstico conforme manual de instalação;\nLigação elétrica até à caixa de derivação mais próxima (max. 1,5mt);\nTeste e funcionamento.\nFixação de exaustor à chaminé ou a móvel apropriado;\nMontagem do tubo de escoamento de fumos, pressupondo:\nEncaixe e fixação do tubo flexível à boca de Saída do Exaustor;\nLigação do tubo flexível à chaminé da casa, desde que se trate de um encaixe ou\nfixação simples.\nLigação eléctrica do exaustor até à caixa de derivação mais próxima (max. 2m);\nTeste e afinação do exaustor', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos\nRecolha e transporte do equipamento removido para ponto de reciclagem \nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)"', condicoes:'' },
      { cod:'49014856', nome:'«E-LAR» Desinstalação de Eletrodoméstico a gás', pvp:15.0, unid:'un', inclui:'Desinstalação de equipamento a gás antigo;', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos;\nTamponamento do gás.', condicoes:'' },
      { cod:'49014852', nome:'Orçamento para instalação Termoacumulador ou Eletrodoméstico «E-LAR»', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49014857', nome:'Recolha equipamento antigo', pvp:0.01, unid:'un', inclui:'Recolha equipamento antigo', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49015039', nome:'Tamponamento de Gás - Eletrodomésticos', pvp:10.0, unid:'un', inclui:'Tamponamento da saída de gás.', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos.', condicoes:'-' },
      { cod:'49015346', nome:'P&L_REPELENTE PARA GRANITOS', pvp:37.0, unid:'un', inclui:'Aplicação de repelente para granitos', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Remodela\u00e7\u00e3o de Cozinha", icon: '🔧', cor: '#8B4513', servicos: [
      { cod:'49013434', nome:'Verificação de Medidas Cozinhas', pvp:20.0, unid:'un', inclui:'A retificação de medidas inclui o serviço de levantamento de medidas para execução de projeto em simulador nas nossas lojas Leroy Merlin.', exclui:'Deslocação até 30km entre a loja e local da retificação de medidas (Acresce 30€)', condicoes:'' },
      { cod:'49014059', nome:'Ativação iva taxa reduzida mão de obra - remodelação', pvp:0.01, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49012770', nome:'Trabalho Complementar Remod Cozinha (TXNM)', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Mobili\u00e1rio de Cozinha", icon: '🪑', cor: '#C4612A', servicos: [
      { cod:'49010601', nome:'Instalação de Modulos Cozinha (minimo 1ml)', pvp:59.0, unid:'ml', inclui:'Montagem e instalação de todos os móveis/módulos de portas ao metro linear\nInstalação dos rodapés\nInstalação e afinação das portas e puxadores\nInstalação das prateleiras \nInstalação de até 4 eletrodomésticos LM integrados no projeto de cozinhas*', exclui:'O produto a instalar\n\nProdutos essenciais para a instalação\nTrabalhos de canalização, eletricidade  ou construção civil adicionais \nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49010611', nome:'Instalação de extraível de coluna ou de canto', pvp:39.0, unid:'un', inclui:'Montagem e instalação de extraiveis de coluna ou de canto\nAfinamento de rolamentos \nTeste de funcionamento', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49010612', nome:'Adaptação de módulos de cozinha', pvp:40.0, unid:'un', inclui:'Modificação estrutural para, por exemplo, encaixar o móvel no espaço disponível ou para encastrar eletrodoméstico', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49010610', nome:'Instalação Extraivel Standart', pvp:20.0, unid:'un', inclui:'Montagem e instalação de extraiveis simples \nAfinamento de rolamentos \nTeste de funcionamento', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49010613', nome:'Cortes Simples', pvp:5.0, unid:'un', inclui:'Medição precisa do local para o corte.\nUtilização de ferramentas adequadas para o corte preciso.\nCorte controlado por foma a preservar a integridade estrutural do móvel, por exemplo, para instalação de lava-loiça ou torneira', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49010609', nome:'Instalação Gaveta/Gav. Interior/gavetão', pvp:5.0, unid:'un', inclui:'Montagem e instalação de Gaveta/ gaveta interior ou gavetão\nAfinamento de rolamentos \nTeste de funcionamento', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
    ]},
    { cat: "Tampos", icon: '🪨', cor: '#2A7A74', servicos: [
      { cod:'49010602', nome:'Instalação Tampo  Madeira Maciça', pvp:90.0, unid:'un', inclui:'Instalação de uma unidade de tampo de madeira maciça\nTratamento e envernizamento dos tampos de madeira maciça (inclui 2a deslocação pós\ntratamento);\nAplicação de vedante com silicone para isolamento.', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos\nRecolha e transporte do equipamento removido para ponto de reciclagem \nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)"', condicoes:'' },
      { cod:'49010603', nome:'Instalação Tampo Laminado', pvp:60.0, unid:'un', inclui:'Instalação de uma unidade de tampo laminado\nAplicação de vedante com silicone para isolamento.', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos\nRecolha e transporte do equipamento removido para ponto de reciclagem \nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)"', condicoes:'' },
      { cod:'49013081', nome:'Orçamento de Tampo de Cozinha', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013082', nome:'Trabalho Complementar Tampo de Cozinha', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Lava-Lou\u00e7a", icon: '🚰', cor: '#2A5A9A', servicos: [
      { cod:'49010607', nome:'Instalação Lava-loiça', pvp:40.0, unid:'un', inclui:'Instalação de lava-loiça e sifão/tubagem de evacuação de água;\nIsolamento e vedação de lava-loiça;', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos\nRecolha e transporte do equipamento removido para ponto de reciclagem \nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)"', condicoes:'' },
      { cod:'49010608', nome:'Instalação de Torneira Cozinha', pvp:20.0, unid:'un', inclui:'Instalação/fixação de Torneira de Bancada ou Parede;\nLigação de bichas de água;\nNecessário o fecho da água na habitação por parte do Cliente.', exclui:'O produto a instalar\n\nProdutos essenciais para a instalação\nTrabalhos de canalização, eletricidade  ou construção civil adicionais \nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49010615', nome:'Remoção Torneira/ Lava Loiça', pvp:20.0, unid:'un', inclui:'Desinstalação da torneira ou lava loiça antigo', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013107', nome:'Orçamento Lava Loiça/Torneira', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013108', nome:'Trabalho Complementar Lava Loiça/Torneira', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Acess\u00f3rios de Cozinha", icon: '🧰', cor: '#6B4FC4', servicos: [
      { cod:'49010660', nome:'Instalação Acessório Cozinha', pvp:20.0, unid:'un', inclui:'Montagem e fixação de acessórios de cozinha', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
    ]},
    { cat: "Electrodom\u00e9sticos", icon: '⚡', cor: '#8B6914', servicos: [
      { cod:'49010634', nome:'Troca placa a gás por eletrica', pvp:120.0, unid:'un', inclui:'Remoção da placa a gás;\nTamponamento do Gás\nInstalação de placa elétrica,ligação eléctrica à caixa de derivação mais próxima (máx 1.5m)\nTestes de funcionamento;', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos\nRecolha e transporte do equipamento removido para ponto de reciclagem \nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)"', condicoes:'Caixa de derivação até 1,5mt' },
      { cod:'49010606', nome:'Instalação Exaustor de Ilha', pvp:99.0, unid:'un', inclui:'Fixação de exaustor à chaminé ou a móvel apropriado, em ilha;\nMontagem do tubo de escoamento de fumos, pressupondo:\nEncaixe e fixação do tubo flexível à boca de Saída do Exaustor;\nLigação do tubo flexível à chaminé da casa, desde que se trate de um encaixe ou\nfixação simples.\nLigação eléctrica do exaustor até à caixa de derivação mais próxima (max. 2m);\nTeste e afinação do exaustor', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos\nRecolha e transporte do equipamento removido para ponto de reciclagem \nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)"', condicoes:'Para ligação eléctrica do exaustor até à caixa de derivação mais próxima (max. 2m);' },
      { cod:'49010635', nome:'Instalação de Eletrodoméstico a Gás', pvp:59.0, unid:'un', inclui:'Fixação e Instalação de eletrodoméstico de acordo com as indicações do fabricante, em local apropriado;\nLigação do gás por meio de mangueira de borracha normalizada ou tubo de aço conforme o caso, aplicação de boquilha e anel vedante;\nLigação eléctrica à caixa de derivação mais próxima (máx 1.5m)', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos\nRecolha e transporte do equipamento removido para ponto de reciclagem \nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)"', condicoes:'Caixa de derivação até 1,5mt' },
      { cod:'49010604', nome:'Instalação Eletrodoméstico Eletrico', pvp:49.0, unid:'un', inclui:'Instalação do eletrodoméstico conforme manual de instalação;\nLigação elétrica até à caixa de derivação mais próxima (max. 1,5mt);\nTeste e funcionamento.\nFixação de exaustor à chaminé ou a móvel apropriado;\nMontagem do tubo de escoamento de fumos, pressupondo:\nEncaixe e fixação do tubo flexível à boca de Saída do Exaustor;\nLigação do tubo flexível à chaminé da casa, desde que se trate de um encaixe ou\nfixação simples.\nLigação eléctrica do exaustor até à caixa de derivação mais próxima (max. 2m);\nTeste e afinação do exaustor', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos\nRecolha e transporte do equipamento removido para ponto de reciclagem \nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)"\nCircuito elétrico dedicado, com tomada ou ligação direta ao quadro elétrico (com isolamento adequado), para a correta instalação de fornos elétricos de encastre e placas elétricas (indução ou vitrocerâmica).', condicoes:'Caixa de derivação até 1,5mt;\nPara ligação eléctrica do exaustor até à caixa de derivação mais próxima; É da responsabilidade do cliente garantir que a pressão na instalação é a indicada para o bom funcionamento dos equipamentos.\nÉ da responsabilidade do cliente garantir que a potência contratada é suficiente para o bom funcionamento do equipamento a instalar e que a rede elétrica da habitação se encontra preparada com a instalação de tomada elétrica a menos de 1,5mt de distância do equipamento.' },
      { cod:'49010636', nome:'Remoção Eletrodoméstico a Gas', pvp:25.0, unid:'un', inclui:'Desinstalação do eletrodoméstico a gás antigo', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49010614', nome:'Remoção Eletrodomestico Elétrico', pvp:25.0, unid:'un', inclui:'Desinstalação do Eletrodoméstico eletrico antigo', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49010638', nome:'Orç. para instalação Eletrodom. - Gás', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos\nRecolha e transporte do equipamento removido para ponto de reciclagem \nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)"', condicoes:'' },
      { cod:'49010631', nome:'Orç. para instalaçãoEletrodom. - eletrico', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos\nRecolha e transporte do equipamento removido para ponto de reciclagem \nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)"', condicoes:'' },
      { cod:'49010639', nome:'Trabalho complementar Eletrodoméstico Gás', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49010629', nome:'Trabalho Complementar Eletrodomestico Eletrico', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "E-LAR", icon: '🔌', cor: '#4A8A4A', servicos: [
      { cod:'49015268', nome:'«E-LAR» Instalação de circuito elétrico de 32A até 25m para Placa Elétrica', pvp:369.0, unid:'un', inclui:'- Instalação de calha ou tubo para passagem de cabo;\n- Passagem de cabo elétrico dentro de tubo ou calha;\n- Ligação de cabo elétrico a disjuntor e interruptor diferencial;\n- Ligação do circuito a um quadro elétrico apto.', exclui:'- Todo ou qualquer trabalho não mencionado nos serviços incluídos;\n- Quaisquer serviços de alteração a quadro elétrico e disjuntores do quadro principal;\n- Arremates ou acabamentos estéticos.\n- Furação especial em betão, pedra ou em paredes com espessuras a partir de 30cm;\n- Substituição, reforço ou execução do Eléctrodo de Terra (que poderá ser orçamentado à parte, o qual têm um custo associado);\n- Meios elevatórios especiais para instalações em altura superior a 2,70m.\n- Exclui instalalação de Tomada reforçada de 32A.', condicoes:'- O local da instalação deve estar devidamente limpo e desimpedido;\n- O local de instalação ou o quadro elétrico de interligação devem garantir espaço suficiente para a instalação do disjuntor e diferencial.\n- O quadro elétrico de interligação deve estar em boas condições e funcional. \n- O local da instalação deve ter acesso para a ligação a um quadro elétrico principal ou parcial com capacidade de carga adequada. \n- A potência contratada e potência máxima admissível também devem ser superiores à potência do disjuntor e do interruptor diferencial \n- Instalações em prédios que requeiram a utilização das zonas comuns do edifício, o cliente deve-se fazer acompanhar de uma declaração de autorização assinada pela Administração do condomínio. \n- O local da instalação deve garantir a infraestrutura para a passagem de cabo elétrico e de comunicação até ao quadro elétrico principal e parcial. \n- O cliente também deve dar permissão para a perfuração de paredes ou divisórias para a instalação de calhas e tubagens para a passagem de cabos no interior da habitação, se o instalador entender que é necessário para completar a instalação. \n- Circuito elétrico indicado para a ligação de equipamentos elétricos com potências inferiores a 7 kW.' },
    ]},
    { cat: "Tomadas e Interruptores", icon: '🔌', cor: '#4A8A4A', servicos: [
      { cod:'49015265', nome:'Instalação de circuito elétrico de 16A até 25m', pvp:299.0, unid:'un', inclui:'- Instalação de tomada elétrica com ligação a cabo elétrico;\n- Instalação de calha ou tubo para passagem de cabo;\n- Passagem de cabo elétrico dentro de tubo ou calha;\n- Ligação de cabo elétrico a disjuntor e interruptor diferencial;\n- Ligação do circuito a um quadro elétrico apto.', exclui:'- Todo ou qualquer trabalho não mencionado nos serviços incluídos;\n- Quaisquer serviços de alteração a quadro elétrico e disjuntores do quadro principal;\n- Arremates ou acabamentos estéticos.\n- Furação especial em betão, pedra ou em paredes com espessuras a partir de 30cm;\n- Substituição, reforço ou execução do Eléctrodo de Terra (que poderá ser orçamentado à parte, o qual têm um custo associado);\n- Meios elevatórios especiais para instalações em altura superior a 2,70m.', condicoes:'- O local da instalação deve estar devidamente limpo e desimpedido;\n- O local de instalação ou o quadro elétrico de interligação devem garantir espaço suficiente para a instalação do disjuntor e diferencial.\n- O quadro elétrico de interligação deve estar em boas condições e funcional. \n- O local da instalação deve ter acesso para a ligação a um quadro elétrico principal ou parcial com capacidade de carga adequada. \n- A potência contratada e potência máxima admissível também devem ser superiores à potência do disjuntor e do interruptor diferencial \n- Instalações em prédios que requeiram a utilização das zonas comuns do edifício, o cliente deve-se fazer acompanhar de uma declaração de autorização assinada pela Administração do condomínio. \n- O local da instalação deve garantir a infraestrutura para a passagem de cabo elétrico e de comunicação até ao quadro elétrico principal e parcial. \n- O cliente também deve dar permissão para a perfuração de paredes ou divisórias para a instalação de calhas e tubagens para a passagem de cabos no interior da habitação, se o instalador entender que é necessário para completar a instalação. \n- Circuito elétrico indicado para a ligação de equipamentos elétricos com potências inferiores a 3 kW.' },
      { cod:'49015267', nome:'Instalação de circuito elétrico de 32A até 25m', pvp:369.0, unid:'un', inclui:'- Instalação de calha ou tubo para passagem de cabo;\n- Passagem de cabo elétrico dentro de tubo ou calha;\n- Ligação de cabo elétrico a disjuntor e interruptor diferencial;\n- Ligação do circuito a um quadro elétrico apto.', exclui:'- Todo ou qualquer trabalho não mencionado nos serviços incluídos;\n- Quaisquer serviços de alteração a quadro elétrico e disjuntores do quadro principal;\n- Arremates ou acabamentos estéticos;\n- Furação especial em betão, pedra ou em paredes com espessuras a partir de 30cm;\n- Substituição, reforço ou execução do Eléctrodo de Terra (que poderá ser orçamentado à parte, o qual têm um custo associado);\n- Meios elevatórios especiais para instalações em altura superior a 2,70m;\n- Exclui instalalação de Tomada reforçada de 32A.', condicoes:'- O local da instalação deve estar devidamente limpo e desimpedido;\n- O local de instalação ou o quadro elétrico de interligação devem garantir espaço suficiente para a instalação do disjuntor e diferencial.\n- O quadro elétrico de interligação deve estar em boas condições e funcional. \n- O local da instalação deve ter acesso para a ligação a um quadro elétrico principal ou parcial com capacidade de carga adequada. \n- A potência contratada e potência máxima admissível também devem ser superiores à potência do disjuntor e do interruptor diferencial \n- Instalações em prédios que requeiram a utilização das zonas comuns do edifício, o cliente deve-se fazer acompanhar de uma declaração de autorização assinada pela Administração do condomínio. \n- O local da instalação deve garantir a infraestrutura para a passagem de cabo elétrico e de comunicação até ao quadro elétrico principal e parcial. \n- O cliente também deve dar permissão para a perfuração de paredes ou divisórias para a instalação de calhas e tubagens para a passagem de cabos no interior da habitação, se o instalador entender que é necessário para completar a instalação. \n- Circuito elétrico indicado para a ligação de equipamentos elétricos com potências inferiores a 7 kW.' },
    ]},
    { cat: "Roupeiro Medida", icon: '👔', cor: '#6B4FC4', servicos: [
      { cod:'49011254', nome:'Instalação de Roupeiro a Medida (ML)', pvp:59.0, unid:'ml', inclui:'Montagem do Roupeiro;\nFixação interior do Roupeiro;\nFixação a parede;\nMontagem das prateleiras;\nMontagem de varão.', exclui:'Não inclui instalação de remate ou guarnição\nO produto a instalar\nProdutos essenciais para a instalação\nDesmontagem E remoção do equipamento antigo; \nObras de construção civil ou outras necessárias à montagem do equipamento\nAdaptações que sejam necessárias para efectivar a instalação', condicoes:'' },
      { cod:'49013123', nome:'Corte ou adaptação - remate ou guarnição', pvp:10.0, unid:'un', inclui:'Cortes ou adaptações de remate ou guarnição de roupeiros', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49011255', nome:'Orçamentação Roupeiro a Medida', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49011256', nome:'Trabalho Complementar Roupeiro a Medida', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Roupeiro Modular ou Kit", icon: '🗄', cor: '#5A4A8A', servicos: [
      { cod:'49013125', nome:'Instalação de roupeiro em kit (metro)', pvp:49.0, unid:'ml', inclui:'Montagem do Roupeiro;\nFixação interior do Roupeiro;\nFixação a parede;\nMontagem das prateleiras;\nMontagem de varão.', exclui:'Instalação de módulo de gavetas\nInstalação de Portas de correr\nInstalação de Acessórios extraiveis\nInstalação de guarnições ou remates\nO produto a instalar\nProdutos essenciais para a instalação\nDesmontagem E remoção do equipamento antigo; \nObras de construção civil ou outras necessárias à montagem do equipamento', condicoes:'' },
      { cod:'49011262', nome:'Instalação Roupeiro (modulo)', pvp:25.0, unid:'un', inclui:'Montagem do Roupeiro;\nFixação interior do Roupeiro;\nFixação a parede;\nMontagem das prateleiras;\nMontagem de varão;\nMontagem de portas de dobradiça', exclui:'Instalação de módulo de gavetas\nInstalação de Portas de correr\nInstalação de Acessórios extraiveis\nInstalação de guarnições ou remates\nO produto a instalar\nProdutos essenciais para a instalação\nDesmontagem E remoção do equipamento antigo; \nObras de construção civil ou outras necessárias à montagem do equipamento', condicoes:'' },
      { cod:'49012574', nome:'Instalação de mobiliário de organizar e arrumar', pvp:24.99, unid:'un', inclui:'Montagem e fixação de sapateira, comoda, secretária ou pequeno mobiliario de apoio;', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nDesmontagem E remoção do equipamento antigo; \nObras de construção civil ou outras necessárias à montagem do equipamento\nAdaptações que sejam necessárias para efectivar a instalação', condicoes:'' },
      { cod:'49013124', nome:'Complemento de instalação de módulo Gavetas ou acessório extraivel', pvp:15.0, unid:'un', inclui:'Instalação de módulo de gavetas ou de acessórios extraivel', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013126', nome:'Complemento de instalação de portas de correr de roupeiro', pvp:15.0, unid:'un', inclui:'Instalação de Portas de correr', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013070', nome:'Orç. para inst. de roupeiro / mobiliário', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013069', nome:'Trabalho complementar de roupeiro ou mobiliário', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Transversal Roupeiros", icon: '↔️', cor: '#7A6A8A', servicos: [
      { cod:'49012278', nome:'Instalação de Acessório Extraivel', pvp:10.0, unid:'un', inclui:'Fixação do Acessório a Roupeiro', exclui:'Todo ou qualquer trabalho que não esteja referenciado no ponto "o que incluí"', condicoes:'' },
      { cod:'49012277', nome:'Instalação de Módulo Gavetas Interior', pvp:15.0, unid:'un', inclui:'Montagem do módulo Gaveta\nFixação ao Roupeiro', exclui:'Todo ou qualquer trabalho que não esteja referenciado no ponto "o que incluí"', condicoes:'' },
    ]},
  ],
  "Sanit\u00e1rios": [
    { cat: "(Geral)", icon: '🔧', cor: '#8B4513', servicos: [
      { cod:'49014211', nome:'Pack Troca Banheira-Duche Flexivel TXRD', pvp:1390.0, unid:'un', inclui:'Remoção de banheira na zona de duche.\n\nInstalação na zona de duche de Base Duche, Painel ou Porta de Duche ou Porta de Duche + Painel Giratório ou Fixo ou Cabine de Duche (cabine até 450€pvp) Torneira e Coluna de Duche.\n\nInstalação de revestimento (chão e parede) na zona do duche até ao teto (máx. 2,60m de altura) e numa área máxima de 11m².\n\nReadaptação da Canalização na zona de duche (até 30 cm ponto de esgoto, subida ponto de agua até 1,10m).\n\nRecolha e entrega de entulho em ponto verde (exclusivo da zona de duche intervencionada).', exclui:'O produto a instalar e produtos essenciais para a instalação.\n\nRemoção, aplicação de cerâmica, pintura ou reboco nas restantes paredes ou chão da casa de banho fora da zona de duche (extra aos 11m² previstos).\n\nDemolição ou remodelação de murete existente na zona da banheira.\n\nTrabalhos de canalização, eletricidade ou construção civil adicionais.\n\nRecolha de entulho proveniente do resto da casa de banho.\n\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€).', condicoes:'' },
      { cod:'49014218', nome:'Pack Troca Banheira-Duche Essencial TXRD', pvp:1070.0, unid:'un', inclui:'Remoção da banheira existente na zona de duche.\n\nInstalação na zona de duche de Base Duche, Painel ou Porta de Duche, Torneira e Coluna de Duche.\n\nInstalação de revestimento (chão e parede) na zona de duche limitado à altura da antiga banheira (aprox. 60cm) e numa área máxima de 4m².\n\nReadaptação da canalização na zona de duche (até 30cm ponto de esgoto, subida ponto de água até 1,10m).\n\nRecolha e entrega de entulho em ponto verde (exclusivo da zona de duche intervencionada).', exclui:'O produto a instalar e produtos essenciais para a instalação.\n\nRemoção ou aplicação de cerâmica acima dos 60cm de altura na zona do duche.\n\nRemoção, aplicação de cerâmica, pintura ou reboco nas restantes paredes ou chão da casa de banho fora da zona de duche.\n\nDemolição ou remodelação de murete existente na zona da banheira.\n\nTrabalhos de canalização, eletricidade ou construção civil adicionais.\n\nRecolha de entulho proveniente do resto da casa de banho.\n\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€).', condicoes:'' },
      { cod:'49014210', nome:'Pack Substituição Sanita Chão por Sanita Suspensa com estrutura pladur', pvp:500.0, unid:'un', inclui:'Desmontagem da sanita existente ao chão;\nInstalação da estrutura de suporte em pladur para a nova sanita suspensa;\nInstalação da nova sanita suspensa (não fornecida pelo prestador do serviço);\nConexão à canalização e esgotos existentes;\nTestes de funcionalidade básica após a instalação.', exclui:'Fornecimento de materiais, incluindo a sanita suspensa, a estrutura de suporte, tubos, válvulas, ou outros componentes necessários para a execução da instalação;\nAlterações estruturais à construção existente, como reforço de paredes ou adaptações de alvenaria;\nTrabalhos de canalização extensiva que exijam a reconfiguração da rede de esgotos ou abastecimento de água;\nTrabalhos de pintura, acabamentos estéticos ou revestimentos adicionais no local da instalação;\nServiços de descarte de resíduos provenientes da desmontagem da sanita ao chão, salvo estipulação contratual adicional.', condicoes:'' },
      { cod:'49014215', nome:'Execução Base Duche Italiana/ Cota Zero', pvp:700.0, unid:'un', inclui:'Preparação do piso para acomodar a base de duche a cota zero, incluindo nivelamento e ajustes necessários.\nImpermeabilização do Piso\nAplicação de material impermeabilizante para garantir a vedação da área da base de duche e prevenir infiltrações.\nInstalação do Sistema de Drenagem:\nInstalação ou adaptação do ralo linear ou ponto de drenagem adequado ao novo formato.\nLigação do sistema de drenagem à rede de esgotos existente.\nExecução da Base de Duche:\nConstrução ou instalação da base de duche ao nível do chão utilizando materiais fornecidos pelo cliente (ex.: revestimento cerâmico) até um máximo de 120x80cm\nCriação de inclinação no piso para garantir o correto escoamento da água.\nAcabamentos Básicos:\nAplicação de silicone ou outro vedante para acabamento em juntas e extremidades.', exclui:'Materiais Necessários\nBase de duche, ralo, revestimentos cerâmicos, silicone ou qualquer outro material necessário para a execução da obra.\nAlterações na Rede Hidráulica:\nModificações extensivas na rede de esgoto ou abastecimento de água.\nDeslocamento de pontos de drenagem para nova posição (serviço adicional mediante orçamento) [exemplo alteração da zona do duche para outro ponto da casa de banho]\nObras Estruturais:\nReforços ou alterações estruturais no piso ou paredes.\nServiços de impermeabilização fora da área do duche.\nServiços Extra:\nInstalação de divisórias, portas de vidro ou acessórios (poderão ser solicitados como serviços adicionais).\nDescarte de entulho em locais específicos (serviço adicional mediante acordo).', condicoes:'' },
      { cod:'49014216', nome:'Execução/Instalação de Nicho de Casa de Banho', pvp:190.0, unid:'un', inclui:'Preparação do Local:\nCorte ou abertura na parede do local indicado para a instalação do nicho, conforme as dimensões desejadas e compatíveis com a estrutura.\nVerificação da existência de canalizações ou estruturas internas que possam interferir na instalação.\nImpermeabilização do Nicho:\nAplicação de materiais impermeabilizantes adequados no interior da abertura para garantir a proteção contra infiltrações.\nInstalação do Nicho:\nFixação do nicho (prefabricado ou construído no local) utilizando materiais adequados, fornecidos pelo cliente.\nNivelamento e ajuste do nicho para assegurar a funcionalidade e estética.\nRevestimento e Acabamentos:\nAplicação de revestimentos cerâmicos ou outros materiais fornecidos pelo cliente, no interior e bordas do nicho.\nAcabamentos com silicone ou outros vedantes nas juntas para garantir a vedação.', exclui:'Fornecimento de Materiais:\nNicho (prefabricado ou personalizado), revestimentos, silicone, materiais de fixação ou impermeabilizantes devem ser fornecidos pelo cliente.\nObras Estruturais:\nReforços na parede ou alterações estruturais em paredes não preparadas para instalação de nichos.\nReparações adicionais em paredes danificadas durante a remoção de azulejos ou abertura do espaço.\nInstalação de iluminação no nicho\nAlteração de canalizações ou fiação elétrica presentes na área de instalação.\nDescarte de entulho em locais específicos', condicoes:'' },
      { cod:'49011142', nome:'Trabalho Complementar Impermeabilização Interior', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49014214', nome:'Substituição de Tampa de Sanita', pvp:25.0, unid:'un', inclui:'Remoção da Tampa Existente\nDesmontagem da tampa antiga, incluindo a remoção dos parafusos e fixações, de forma segura.\n\nInstalação da Nova Tampa\nPosicionamento correto da nova tampa de sanita sobre a mesma.\nFixação adequada utilizando os suportes e parafusos fornecidos.\nAjuste e nivelamento para garantir o funcionamento adequado, incluindo o fecho amortecido, se aplicável.\n\nTeste de Funcionamento\nVerificação da estabilidade e do correto funcionamento da tampa após a instalação.', exclui:'Fornecimento de Materiais\nNova tampa de sanita, incluindo suportes, parafusos e outros acessórios necessários.  \n\nReparações Adicionais  \nReparações na sanita, como substituição de peças danificadas ou consertos estruturais.  \nTrabalhos na canalização ou reparações hidráulicas associadas à sanita.  \n\nNão Inclui Serviços Extra, como:\nAlterações ou adaptações em sanitas incompatíveis com a nova tampa.\nRemoção e descarte da tampa antiga (poderá ser solicitado como serviço adicional).', condicoes:'' },
      { cod:'49013072', nome:'Trabalho complementar espelho', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49014212', nome:'Instalação de móvel com lavatório de pousar', pvp:190.0, unid:'un', inclui:'Montagem do móvel de casa de banho, incluindo a fixação ao local designado, se necessário.\nAjustes básicos para nivelamento do móvel.\nInstalação do Lavatório de Pousar:\nPosicionamento e fixação do lavatório no móvel, conforme as instruções do fabricante.\nAplicação de silicone ou outro vedante recomendado entre o lavatório e o móvel para evitar infiltrações.\nInstalação da torneira no lavatório\nConexão do sifão e dos tubos de escoamento à rede de esgoto existente.\nLigação das tubagens de abastecimento de água às válvulas existentes.\nTestes de Funcionamento como:\nVerificação de eventuais fugas na instalação hidráulica.\nTeste funcional da torneira e do escoamento da água.', exclui:'Produtos a Instalar como: Móvel, lavatório, torneira, sifão, válvulas ou qualquer outro acessório de instalação.\nTubos ou conexões adicionais, caso sejam necessários para ajustar a instalação hidráulica existente.\nReparações ou Adaptações Estruturais:\nReparos no local onde será instalado o móvel (ex.: reforço de paredes, nivelamento de pisos, etc.).\nAlterações extensivas na rede de esgoto ou abastecimento de água.\nRevestimentos e Acabamentos\nTrabalhos estéticos como pintura, azulejos ou retoques nas paredes e piso.\nDescarte de Embalagens ou Resíduos\nTransporte especializado para descarte de embalagens ou entulho gerado durante a montagem.\nTrabalhos Elétricos:\nInstalação ou modificação de tomadas ou iluminação associada ao móvel.', condicoes:'' },
      { cod:'49014213', nome:'Instalação de móvel com duplo lavatório', pvp:150.0, unid:'un', inclui:'Montagem do móvel de casa de banho, incluindo a fixação ao local indicado, se necessário.\nAjustes para garantir o nivelamento e estabilidade do móvel.\nInstalação dos Lavatórios:\nPosicionamento e fixação dos dois lavatórios no móvel, de acordo com as instruções do fabricante.\nAplicação de silicone ou outro vedante recomendado para evitar infiltrações entre o lavatório e o móvel.\nInstalação das Torneiras:\nFixação das torneiras em cada lavatório\nConexão das torneiras à rede de abastecimento de água existente.\nLigação do sifão duplo ou individual (conforme o design do móvel) aos dois lavatórios.\nConexão do escoamento à rede de esgoto existente.\nInstalação e vedação de válvulas de drenagem em cada lavatório.\nTestes de Funcionamento:\nVerificação de eventuais fugas em todas as conexões hidráulicas.\nTeste funcional do fluxo de água e do sistema de escoamento em ambos os lavatórios.', exclui:'Produtos a Instalar como: Móvel, lavatório, torneira, sifão, válvulas ou qualquer outro acessório de instalação.\nTubos ou conexões adicionais, caso sejam necessários para ajustar a instalação hidráulica existente.\nReparações ou Adaptações Estruturais:\nReparos no local onde será instalado o móvel (ex.: reforço de paredes, nivelamento de pisos, etc.).\nAlterações extensivas na rede de esgoto ou abastecimento de água.\nRevestimentos e Acabamentos\nTrabalhos estéticos como pintura, azulejos ou retoques nas paredes e piso.\nDescarte de Embalagens ou Resíduos\nTransporte especializado para descarte de embalagens ou entulho gerado durante a montagem.\nTrabalhos Elétricos:\nInstalação ou modificação de tomadas ou iluminação associada ao móvel.', condicoes:'' },
    ]},
    { cat: "Remodela\u00e7\u00e3o de  Casas de Banho", icon: '🚿', cor: '#2A6B7A', servicos: [
      { cod:'49011839', nome:'Pack Troca Banheira-Duche Flexivel TXNM', pvp:1613.0, unid:'un', inclui:'Remoção de banheira na zona de duche.\n\nInstalação na zona de duche de Base Duche, Painel ou Porta de Duche ou Porta de Duche + Painel Giratório ou Fixo ou Cabine de Duche (cabine até 450€pvp) Torneira e Coluna de Duche.\n\nInstalação de revestimento (chão e parede) na zona do duche até ao teto (máx. 2,60m de altura) e numa área máxima de 11m².\n\nReadaptação da Canalização na zona de duche (até 30 cm ponto de esgoto, subida ponto de agua até 1,10m).\n\nRecolha e entrega de entulho em ponto verde (exclusivo da zona de duche intervencionada).', exclui:'O produto a instalar e produtos essenciais para a instalação.\n\nRemoção, aplicação de cerâmica, pintura ou reboco nas restantes paredes ou chão da casa de banho fora da zona de duche (extra aos 11m² previstos).\n\nDemolição ou remodelação de murete existente na zona da banheira.\n\nTrabalhos de canalização, eletricidade ou construção civil adicionais.\n\nRecolha de entulho proveniente do resto da casa de banho.\n\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€).', condicoes:'' },
      { cod:'49011838', nome:'Pack Troca Banheira-Duche Essencial TXNM', pvp:1242.0, unid:'un', inclui:'Remoção da banheira existente na zona de duche.\n\nInstalação na zona de duche de Base Duche, Painel ou Porta de Duche, Torneira e Coluna de Duche.\n\nInstalação de revestimento (chão e parede) na zona de duche limitado à altura da antiga banheira (aprox. 60cm) e numa área máxima de 4m².\n\nReadaptação da canalização na zona de duche (até 30cm ponto de esgoto, subida ponto de água até 1,10m).\n\nRecolha e entrega de entulho em ponto verde (exclusivo da zona de duche intervencionada).', exclui:'O produto a instalar e produtos essenciais para a instalação.\n\nRemoção ou aplicação de cerâmica acima dos 60cm de altura na zona do duche.\n\nRemoção, aplicação de cerâmica, pintura ou reboco nas restantes paredes ou chão da casa de banho fora da zona de duche.\n\nDemolição ou remodelação de murete existente na zona da banheira.\n\nTrabalhos de canalização, eletricidade ou construção civil adicionais.\n\nRecolha de entulho proveniente do resto da casa de banho.\n\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€).', condicoes:'' },
      { cod:'49012600', nome:'Pack Troca Cabine Hidro-Duche', pvp:419.0, unid:'un', inclui:'Remoção e entrega de Cabine Hidromassagem em ponto de reciclagem\nInstalação de Base de Duche\nInstalação Frontal de Duche mais até 2 paineis laterais ou Cabine Duche Simples\nInstalação de Conjunto de Duche\nInstalação de 2 acessórios de Fixar', exclui:'O produto a instalar\n\nProdutos essenciais para a instalação\nTrabalhos de canalização, eletricidade  ou construção civil adicionais \nDesmontagem de equipamento existente no local\nRecolha e transporte do equipamento removido para ponto de reciclagem\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49012601', nome:'Pack subtituição Zona Loiças Sanitarias', pvp:270.0, unid:'un', inclui:'Remoção de Loiça Sanitária (sanita+autoclismo, bidé, lavatório +torneira) com entrega a\nponto de reciclagem)\nInstalação de Sanita + Autoclismo Pvc\nInstalação de Bidé\nInstalação de Chuveiro higiénico\nInstalação de 2 acessórios de fixar', exclui:'O produto a instalar\n\nProdutos essenciais para a instalação\nTrabalhos de canalização, eletricidade  ou construção civil adicionais \nDesmontagem de equipamento existente no local\nRecolha e transporte do equipamento removido para ponto de reciclagem que não esteja incluido nos serviços incluidos\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49012610', nome:'Instalação Base Duche', pvp:169.0, unid:'un', inclui:'Instalação da Base de Duche;\nAplicação de Silicone;\nInstalação da Válvula e Sifão na Base de Duche;', exclui:'O produto a instalar\n\nProdutos essenciais para a instalação\nTrabalhos de canalização, eletricidade  ou construção civil adicionais \nDesmontagem e remoção do equipamento antigo\nRecolha e transporte de equipamento removido para local de reciclagem\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49012771', nome:'Orçamento para Remodelação WC', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49012773', nome:'Trabalho Complementar Remod WC (TXNM)', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49014059', nome:'Ativação iva taxa reduzida mão de obra - remodelação', pvp:0.01, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Acess\u00f3rios de Casa de Banho", icon: '🧰', cor: '#3A7A7A', servicos: [
      { cod:'49012604', nome:'Inst Acessorio Mobilidade&Seguranc Extra (minimo 2)', pvp:19.99, unid:'un', inclui:'Fixação de Acessórios de Mobilidade e Segurança: \nBarras de Apoio\nAssentos de Apoio\nAdaptadores para Sanita \nInstalação minima de 2 acessórios de Mobilidade e Segurança', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nFixação de acessórios em paredes de pladur\nProdutos essenciais para a instalação\nTrabalhos de canalização, eletricidade  ou construção civil adicionais \nDesmontagem de equipamento existente no local\nRecolha e transporte do equipamento removido para ponto de reciclagem\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'Cliente deve disponibilizar planta de canalização ao instalador antes da instalação' },
      { cod:'49010540', nome:'Instalação Acessórios de Fixar Casa de Banho (minimo 3)', pvp:9.99, unid:'un', inclui:'Fixação de uma unidade de Toalheiro ou Suporte de papel higiênico, prateleira de duche à parede.\nInstalação de no minimo 3 Acessórios de Fixar', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTrabalhos de canalização, eletricidade  ou construção civil adicionais \nDesmontagem de equipamento existente no local\nRecolha e transporte do equipamento removido para ponto de reciclagem\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'Cliente deve disponibilizar planta de canalização ao instalador antes da instalação' },
      { cod:'49010545', nome:'Remoção ECO Acessórios de Fixar', pvp:9.99, unid:'un', inclui:'Desinstalação e remoção com entrega a ponto de reciclagem', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49010546', nome:'Orçamento para instalação Acessórios Fixar', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49010547', nome:'Trabalho Complementar Aces. Fixar', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Espelhos", icon: '🪞', cor: '#6A6A8A', servicos: [
      { cod:'49010541', nome:'Instalação Espelho WC', pvp:20.0, unid:'un', inclui:'Fixação de espelho até 1,20m, sem ligação eletrica, à parede;', exclui:'O produto a instalar\n\nProdutos essenciais para a instalação\nTrabalhos de canalização, eletricidade  ou construção civil adicionais \nDesmontagem de equipamento existente no local\nRecolha e transporte do equipamento removido para ponto de reciclagem\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49013127', nome:'Remoção Eco Espelho Wc', pvp:20.0, unid:'un', inclui:'Desmontagem e remoção de equipamento antigo fixo a parede com entrega a ponto de reciclagem', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013080', nome:'Complementar espelho elétrico', pvp:15.0, unid:'un', inclui:'Ligação elétrica do espelho a um ponto de eletricidade já existente no local', exclui:'O produto a instalar\n\nProdutos essenciais para a instalação\nTrabalhos de canalização, eletricidade  ou construção civil adicionais \nDesmontagem e remoção do equipamento antigo\nRecolha e transporte de equipamento removido para local de reciclagem\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49013071', nome:'Orçamento para instalação Espelho', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Loi\u00e7a Sanit\u00e1ria", icon: '🚽', cor: '#4A6A9A', servicos: [
      { cod:'49011835', nome:'Inst Pack San.+Aut.PVC/Cerâmica', pvp:49.99, unid:'un', inclui:'"Instalação de Sanita\nInstalação de autoclismo\nInstalação de manguito elastico excentrico/união de sanita \nVerificação de funcionamento\nVedação da sanita"', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nInstalação de Sanitas ou Autoclismos Embutidos\nTodas as Obras de canalização e de construção civil necessárias à boa instalação \nDesmontagem E remoção do equipamento antigo\nTrabalhos de canalização, eletricidade  ou construção civil adicionais \nDesmontagem de equipamento existente no local\nRecolha e transporte do equipamento removido para ponto de reciclagem\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49011833', nome:'Inst. Lavatório +Torneira', pvp:44.99, unid:'un', inclui:'Instalação e fixação de lavatório;\nFixação de torneira;\nLigação de bichas de água.', exclui:'O produto a instalar\n\nProdutos essenciais para a instalação\nTrabalhos de canalização, eletricidade  ou construção civil adicionais \nDesmontagem e remoção do equipamento antigo\nRecolha e transporte de equipamento removido para local de reciclagem\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49011834', nome:'Instalação Chuveiro Higiénico, Bidé ou Urinol', pvp:39.99, unid:'un', inclui:'Instalação de chuveiro higiénico, bidé, sanita, ou urinol\nFixação de torneira no bidé\nLigação de bichas de água', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nInstalação de bidés, chuveiros higiénicos ou sanitas embutidas\nTodas as Obras de canalização necessárias à boa instalação \nTodas as Obras de construção civil\n Desmontagem E remoção do equipamento antigo\nObras de construção civil \nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49011836', nome:'Instalação de Autoclismo PVC', pvp:34.99, unid:'un', inclui:'Montagem e instalação do autoclismo, não embutido\nConexão do autoclismo ao sistema de água existente.\nFixação adequada à parede ou ao chão, conforme necessário.\nColocação de vedante/silicone para garantir a estanqueidade.\nTeste de funcionamento e ajustes iniciais para garantir um funcionamento correto.', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nQualquer alteração estrutural no espaço onde o autoclismo será instalado.\nPreparação ou nivelamento do espaço.\nTrabalhos de canalização, eletricidade  ou construção civil adicionais \nDesmontagem de equipamento existente no local\nRecolha e transporte do equipamento removido para ponto de reciclagem\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49010558', nome:'Remoção ECO Loiça Sanitária', pvp:54.0, unid:'un', inclui:'Desmontagem e remoção de equipamento antigo fixo a parede com entrega a ponto de reciclagem', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49010560', nome:'Trabalho Complementar Loiça Sanitária', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49010559', nome:'Orçamento para instalação Loiças Sanitárias', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "M\u00f3veis de Casa de Banho", icon: '🗄', cor: '#3A5A8A', servicos: [
      { cod:'49012602', nome:'Pack Instalação Móvel Casa Banho', pvp:199.0, unid:'un', inclui:'Remoção ECO de Lavatório ou Móvel de Casa de Banho com lavatório\nInstalação de Móvel com lavatório e torneira\nInstalação e Fixação de Espelho de Casa de Banho\nInstalação de Móvel ou Coluna de Arrumação de Casa de Banho\nInstalação de 2 acessórios de fixar (oferta da terceira unidade a instalar)', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTrabalhos de canalização, eletricidade  ou construção civil adicionais \nDesmontagem de equipamento existente no local\nRecolha e transporte do equipamento removido para ponto de reciclagem para alem do que está  discrito nos serviços incluidos\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49010549', nome:'Inst. Móvel Wc c/ Lavatório + Torneira', pvp:70.0, unid:'un', inclui:'Montagem e fixação do móvel em kit de pé ou suspenso até 120 cm de largura\nFixação na parede \nMontagem do sifão, conexões e instalação de torneira', exclui:'O produto a instalar\n\nProdutos essenciais para a instalação\nFixação de Móveis de pé ou suspensos em paredes de pladur\nTrabalhos de canalização, eletricidade  ou construção civil adicionais \nDesmontagem e remoção do equipamento antigo\nRecolha e transporte de equipamento removido para local de reciclagem\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49010550', nome:'Remoção ECO Móvel C/Lavatório +Torneira', pvp:64.0, unid:'un', inclui:'Desinstalação e remoção com entrega a ponto de reciclagem', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49012606', nome:'Instalação de Móveis/Coluna Arrum. WC', pvp:50.0, unid:'un', inclui:'Montagem e fixação do móvel em kit de pé ou suspenso até 120 cm de largura\nFixação na parede', exclui:'O produto a instalar\n\nProdutos essenciais para a instalação\nFixação de Móveis ou Colunas em paredes de pladur\n-Trabalhos de canalização, eletricidade  ou construção civil adicionais \nDesmontagem de equipamento existente no local\nRecolha e transporte do equipamento removido para ponto de reciclagem\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49012653', nome:'Remoção Móvel C/ Lavatório+ Torn', pvp:39.0, unid:'un', inclui:'Desinstalação do móvel com lavatório e torneira', exclui:'Não inclui remoção do artigo da casa do cliente, nem entrega a ponto de reciclagem', condicoes:'' },
      { cod:'49010551', nome:'Orçamento para instalação Móveis WC', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49010552', nome:'Trabalho Complementar Móveis WC', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Coluna de Duche", icon: '🚿', cor: '#2A7A8A', servicos: [
      { cod:'49013074', nome:'Instalação de Coluna de Hidromassagem', pvp:30.0, unid:'un', inclui:'Montagem e instalação do chuveiro\nConexão à rede de água existente\nMontagem e instalação de todos os componentes da coluna de duche, incluindo chuveiros de mão, jatos de massagem, controles termostáticos, iluminação, e outros recursos de hidromassagem.\nTeste de funcionamento para garantir que o chuveiro funciona corretamente', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nA instalação de torneiras ou misturadoras não está incluída\nTrabalhos de canalização ou de eletricidade adicionais, nomeadamente ajustes na rede eletrica para a boa instalação da coluna de hidromassagem\nReparações ou trabalhos de construção civil, nomeadamente na parede ou no teto para a boa instalação do chuveiro, como cortes, rasgos ou ajustes no revestimento\nDesmontagem de equipamento existente no local\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49013128', nome:'Remoção Eco Chuveiro/Coluna de Hidro', pvp:19.99, unid:'km', inclui:'Desmontagem e remoção de equipamento antigo fixo a parede com entrega a ponto de reciclagem', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49012605', nome:'Instalação Chuveiro de Duche', pvp:15.0, unid:'un', inclui:'Montagem e instalação do chuveiro\nConexão à rede de água existente\nMontagem e instalação de acessórios necessários, como o suporte do chuveiro, braço do chuveiro e cabeça do chuveiro.\nTeste de funcionamento para garantir que o chuveiro funciona corretamente', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nA instalação de torneiras ou misturadoras não está incluída\nNão está incluida a montagem de rampa de duche e fixação do suporte para pendurar o chuveiro; \nReparações ou trabalhos de construção civil, nomeadamente na parede ou no teto para a boa instalação do chuveiro, como cortes, rasgos ou ajustes no revestimento\nDesmontagem de equipamento existente no local\nTrabalhos de canalização, eletricidade  ou construção civil adicionais \nDesmontagem e remoção do equipamento antigo\nRecolha e transporte de equipamento removido para local de reciclagem\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49013073', nome:'instalação de Misturadora/torneira', pvp:15.0, unid:'un', inclui:'Montagem e instalação da misturadora/torneira na coluna de duche ou para o chuveiro \nLigação à rede de agua, para garantir o fornecimento de água à misturadora/torneira.\nMontagem e instalação de todos os componentes necessários da misturadora/torneira\nTeste da misturadora/torneira para garantir que ela funciona corretamente e que a temperatura e a pressão da água estejam de acordo', exclui:'O produto a instalar\n\nProdutos essenciais para a instalação\nTrabalhos de canalização, eletricidade  ou construção civil adicionais \nDesmontagem de equipamento existente no local\nRecolha e transporte do equipamento removido para ponto de reciclagem\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49013076', nome:'Orçamento para instalação Conjunto Duche/C Hidromassagem', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013075', nome:'Trabalho Complementar Conjunto de Duche/Hidromassagem', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Torneiras de Casa de Banho", icon: '🚰', cor: '#2A5A8A', servicos: [
      { cod:'49010563', nome:'Instalação Torneira WC', pvp:20.99, unid:'un', inclui:'Fixação e Instalação de torneira de banheira, duche, lavatório ou bidé, ou torneira de segurança\nLigação de bichas de água.', exclui:'O produto a instalar\n\nProdutos essenciais para a instalação\nTrabalhos de canalização, eletricidade  ou construção civil adicionais \nDesmontagem de equipamento existente no local\nRecolha e transporte do equipamento removido para ponto de reciclagem\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49010564', nome:'Remoção ECO Torneira WC', pvp:19.99, unid:'un', inclui:'Desmontagem e remoção de equipamento antigo fixo a parede com entrega a ponto de reciclagem', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49010565', nome:'Orçamento para instalação Torneiras WC', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49010566', nome:'Trabalho Complementar Torneiras WC', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Banheiras", icon: '🛁', cor: '#2A4A8A', servicos: [
      { cod:'49010568', nome:'Orçamento para Instalação Banheira Simples', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49010569', nome:'Orçamento para Instalação Banheiras Hidro', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49010570', nome:'Trabalho Complementar Banheira', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Cabines", icon: '🚿', cor: '#2A8A7A', servicos: [
      { cod:'49010573', nome:'Instalação Cabine Hidromassagem', pvp:180.0, unid:'un', inclui:'Pré-instalação do corpo da cabine;\nInstalação completa do corpo da cabine;\nLigação da água fria e quente às respetivas redes utilizando para o efeito bichas flexíveis;\nLigação da parte elétrica;\nMontagem das portas;\nNivelamento da cabine;\nMontagem de todos os acessórios.', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nReparação ou modificações e canalização necessários para ligação da cabine de duche ao sistema de água existente.\nQualquer trabalho elétrico necessário para ligar a cabine de duche ao sistema elétrico existente\nQuaisquer alterações estruturais no espaço onde a cabine de duche será instalada\nPreparação ou nivelamento do espaço como trabalhos de alvenaria, pisos ou revestimentos.\nDesmontagem e remoção do equipamento antigo\nRecolha e transporte de equipamento removido para local de reciclagem\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49012607', nome:'Remoção Eco de Cabine Hidromassagem', pvp:89.0, unid:'un', inclui:'Desmontagem e remoção de equipamento antigo fixo a parede com entrega a ponto de reciclagem', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49012655', nome:'Remoção Cabine Hidro', pvp:59.0, unid:'un', inclui:'Desinstalação da cabine de hidromassagem antiga', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49010575', nome:'Orçamento para instalação Cabine Hidromassagem', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49010576', nome:'Trabalho Complementar Cabine Hidromassagem', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Protec\u00e7\u00e3o de Duche", icon: '🚿', cor: '#3A8A6A', servicos: [
      { cod:'49010572', nome:'Inst. Cabine Duche simples', pvp:100.0, unid:'un', inclui:'Montagem e Instalação da Cabine de Duche até 1,2m de largura\nColocação de Silicone.', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nReparação ou modificações e canalização necessários para conectar a cabine de duche ao sistema de água existente.\nQualquer trabalho elétrico necessário para conectar a cabine de duche ao sistema elétrico existente\nQuaisquer alterações estruturais no espaço onde a cabine de duche será instalada\nPreparação ou nivelamento do espaço como trabalhos de alvenaria, pisos ou revestimentos.\nDesmontagem e remoção do equipamento antigo\nRecolha e transporte de equipamento removido para local de reciclagem\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49013077', nome:'Instalação Proteção de Duche (paineis e frontais - duche e de banheira)', pvp:70.0, unid:'un', inclui:'Montagem e instalação do Painel ou Portas de duche até 1,20m de largura na banheira ou na zona de duche\nFixação do mesmo à parede, quando necessário.\nColocação de Silicone para garantir vedação adequada.\nAfinação de Rolamentos, quando aplicável.\n\nQuando contratado o serviço adicional, inclui a instalação de um defletor giratório ou painel lateral fixo ou perfil de compensação', exclui:'O produto a instalar\nReparação ou modificações e canalização necessários para conectar a proteção de duche ao sistema de água existente.\nQualquer trabalho elétrico necessário para conectar a proteção de duche ao sistema elétrico existente\nQuaisquer alterações estruturais no espaço onde a cabine de duche será instalada\nPreparação ou nivelamento do espaço como trabalhos de alvenaria, pisos ou revestimentos.\nDesmontagem e remoção do equipamento antigo\nRecolha e transporte de equipamento removido para local de reciclagem\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)"', condicoes:'' },
      { cod:'49011837', nome:'Remoção Eco de Proteção de Duche', pvp:69.0, unid:'un', inclui:'Desmontagem e remoção de equipamento antigo fixo a parede com entrega a ponto de reciclagem', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49012654', nome:'Remoção Proteção de Duche', pvp:39.0, unid:'un', inclui:'Desinstalação da proteção de duche antiga', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49012608', nome:'Instalação de Defletor/ Painel Lateral fixo/ Perfil de compensação', pvp:30.0, unid:'un', inclui:'Montagem e instalação do defletor/painel lateral fixo à proteção de duche segundo o manual de instruções \ncolocação de silicone (se necessário)', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49010580', nome:'Orçamento para instalação proteção de duche', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013078', nome:'Trabalho Complementar Proteção Duche', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Transversal sec\u00e7\u00e3o 07", icon: '↔️', cor: '#7A6A8A', servicos: [
      { cod:'49013079', nome:'Medidas superiores a 1,20m proteção de duche/Moveis/espelhos', pvp:30.0, unid:'un', inclui:'Instalação de Proteções de Duche, móveis ou espelhos com larguras superiores a 1,20m', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
  ],
  "Carpintaria e Caixilharia": [
    { cat: "Escadas Interior / Balaustre", icon: '🪜', cor: '#8B5A2A', servicos: [
      { cod:'49011191', nome:'Orçamento para Instalação para instalação Escadas Interior', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49011195', nome:'Orçamento para Instalação  para instalação Escadas Sotão', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013061', nome:'Trabalho complementar Escadas Interior/Sótão', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Janelas de Parede", icon: '🪟', cor: '#5A7A4A', servicos: [
      { cod:'49011198', nome:'Instalação de Janela Standard', pvp:79.99, unid:'un', inclui:'Preço da instalação para janelas até 120cm largura ou 120cm altura.\nO local de instalação deve estar limpo e desimpedido:\n- Fixação da Janela a local já preparado;\n- Colocação de vedante.\nGarantia de 3 (três) anos sobre o serviço de  instalação realizado por profissionais especializados e qualificados.', exclui:'Para além das previstas nas Condições Gerais, também se exclui:\nO produto a instalar\nProdutos essenciais para a instalação\nDesmontagem E remoção do equipamento antigo (excepto quando contratado o Serviço)\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)\nObras de construção civil ou outras necessárias à montagem do equipamento\nAdaptações que sejam necessárias para efetivar a instalação.', condicoes:'--> É obrigatório a visita prévia para orçamentação do local, onde exibem: \nUma recomendação da artigo mais indicado a aplicar; \nTodos os materiais necessários à correta instalação; \nToda a mão-de-obra necessária à instalação.' },
      { cod:'49011199', nome:'Orçamento para instalação  Janela Standard', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49011200', nome:'Trabalho Complementar Janela Standard', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "(Geral)", icon: '🔧', cor: '#8B4513', servicos: [
      { cod:'49014334', nome:'Instalação de mosquiteira à medida', pvp:40.0, unid:'un', inclui:'Instalação de rede mosquiteira em janelas de parede \nAplicação até 3m de altura \nAplicação em janelas até 250cmx200cm', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'--> É obrigatório a visita prévia para orçamentação do local, onde exibem: \nUma recomendação da artigo mais indicado a aplicar; \nTodos os materiais necessários à correta instalação; \nToda a mão-de-obra necessária à instalação.' },
      { cod:'49014336', nome:'Trabalho complementar de mosquiteira à medida', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013664', nome:'Complementar Instalação de cortina', pvp:35.0, unid:'un', inclui:'- Instalação de Cortina em Janela de Sótão', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49011207', nome:'Orçamento para Instalação Janela Velux', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'Para além das previstas nas Condições Gerais, também se exclui:\n- Todos os Materiais não incluídos no ponto 1;\n- Todo ou qualquer trabalho que não esteja referenciado no ponto 3.', condicoes:'' },
      { cod:'49013667', nome:'Instalação de 1 Porta Interior (até 4 unidades)', pvp:79.0, unid:'un', inclui:'O local de instalação deve estar limpo e desimpedido:\nPreço da unidade para Instalação até 4 portas de interior\nInstalação do bloco de porta em local já preparado\nColocação da porta, guarnições, aduelas e extensões\nColocação de vedante.\nInstalação das ferragens necessárias para a instalação da porta', exclui:'Para além das previstas nas Condições Gerais, também se exclui:\nO produto a instalar\nProdutos essenciais para a instalação\nDesmontagem E remoção do equipamento antigo (excepto quando contratado o Serviço)\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)\nEmassamento e pintura de paredes, \nReparação de ceramicas ou tejoleiras, \nDeslocação de pontos de luz\nAbertura de paredes transversais\nReparação de pavimentos\nObras de construção civil ou outras necessárias à montagem do equipamento\nAdaptações que sejam necessárias para efetivar a instalação.', condicoes:'--> É obrigatório a visita prévia para orçamentação do local, onde exibem: \nUma recomendação da artigo mais indicado a aplicar; \nTodos os materiais necessários à correta instalação; \nToda a mão-de-obra necessária à instalação.' },
      { cod:'49011244', nome:'Orçamento para Instalação Porta Interior', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49014766', nome:'Instalação Porta Blindada', pvp:399.0, unid:'un', inclui:'O local de instalação deve estar limpo e desimpedido:\nPreparação do vão para receber o bloco de porta blindada\nInstalação do bloco de porta blindada com reforço adequado\nColocação da folha da porta, guarnições, aduelas e extensões\nColocação de vedante.\nInstalação das ferragens necessárias para a instalação da porta', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013674', nome:'Instalação de Porta de Entrada GardenGate', pvp:359.0, unid:'un', inclui:'O local de instalação deve estar limpo e desimpedido:\nInstalação do bloco de porta em local já preparado\nColocação da porta, guarnições, aduelas e extensões\nColocação de vedante.\nInstalação das ferragens necessárias para a instalação da porta', exclui:'Para além das previstas nas Condições Gerais, também se exclui:\nO produto a instalar\nProdutos essenciais para a instalação\nDesmontagem E remoção do equipamento antigo (excepto quando contratado o Serviço)\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)\nEmassamento e pintura de paredes, \nReparação de ceramicas ou tejoleiras, \nDeslocação de pontos de luz\nAbertura de paredes transversais\nReparação de pavimentos\nObras de construção civil ou outras necessárias à montagem do equipamento\nAdaptações que sejam necessárias para efetivar a instalação.', condicoes:'--> É obrigatório a visita prévia para orçamentação do local, onde exibem: \nUma recomendação da artigo mais indicado a aplicar; \nTodos os materiais necessários à correta instalação; \nToda a mão-de-obra necessária à instalação.' },
      { cod:'49013675', nome:'Remoção de Porta de Entrada GardenGate', pvp:140.0, unid:'un', inclui:'Desinstalação de material antigo e entrega a ponto de reciclagem', exclui:'', condicoes:'' },
      { cod:'49013658', nome:'Trabalho Complementar Porta Entrada GardenGate', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013668', nome:'Instalação de Toldo Manual (3m-6m do chão)', pvp:189.0, unid:'un', inclui:'O local de instalação deve estar acessível e desimpedido\nFuração do local a instalar o toldo;\nFixação de Toldo Manual a parede entre 3m e 6m de altura do chão,\nTeste e explicação do funcionamentoToldos superiores a 4.5m de largura sob vista de orçamento', exclui:'Para além das previstas nas Condições Gerais, também se exclui:\nO produto a instalar\nProdutos essenciais para a instalação\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)\nPreparação das paredes (estas devem ser previamente niveladas);\nDesmontagem E remoção do equipamento antigo \nObras de construção civil ou outras necessárias à montagem do equipamento\nMeios elevatórios para acesso a local de instalação', condicoes:'' },
      { cod:'49013669', nome:'Instalação de Toldo Elétrico (até 3m do chão)', pvp:350.0, unid:'un', inclui:'O local de instalação deve estar acessível e desimpedido\nFuração do local a instalar o toldo;\nFixação de Toldo Elétrico a parede até 3mt de altura do chão,\nLigações elétricas até 3m de distância\nAfinação do Toldo\nTeste e explicação do funcionamento.', exclui:'Para além das previstas nas Condições Gerais, também se exclui:\nO produto a instalar\nProdutos essenciais para a instalação\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)\nPreparação das paredes (estas devem ser previamente niveladas);\nDesmontagem E remoção do equipamento antigo \nObras de construção civil ou outras necessárias à montagem do equipamento\nMeios elevatórios para acesso a local de instalação', condicoes:'--> É obrigatório a visita prévia para orçamentação do local, onde exibem: \nUma recomendação da artigo mais indicado a aplicar; \nTodos os materiais necessários à correta instalação; \nToda a mão-de-obra necessária à instalação.' },
      { cod:'49013671', nome:'Instalação sensor de vento', pvp:84.0, unid:'un', inclui:'Instalação do Sensor de Vento', exclui:'Para além das previstas nas Condições Gerais, também se exclui:\nO produto a instalar\nProdutos essenciais para a instalação\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)\nPreparação das paredes (estas devem ser previamente niveladas);\nDesmontagem E remoção do equipamento antigo \nObras de construção civil ou outras necessárias à montagem do equipamento\nMeios elevatórios para acesso a local de instalação', condicoes:'' },
      { cod:'49011270', nome:'Orçamento para Instalação Toldo Manual', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49014339', nome:'Trabalho complementar Toldo Sunstyl', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49011220', nome:'Instalação M2 Pavimento Flutuante/Vinilico (mímimo 8m2)', pvp:9.49, unid:'m²', inclui:'O local de instalação deve estar limpo, desimpedido e chão nivelado:\nValor minimo de instalação: 8m2\n- Instalação pavimento com colocação de isolamento;', exclui:'Para além das previstas nas Condições Gerais, também se exclui:\nO produto a instalar\nProdutos essenciais para a instalação\nDeslocação no valor de 30€\nInstalação de rodapés\nInstalação de Perfis\nCorte de Portas e Aduelas\nDesmontagem E remoção do equipamento antigo;\nObras de construção civil \nMovimentação de mobiliário ou decoração existente.', condicoes:'--> É obrigatório a visita prévia para orçamentação do local, onde exibem: \nUma recomendação da artigo mais indicado a aplicar; \nTodos os materiais necessários à correta instalação; \nToda a mão-de-obra necessária à instalação.' },
      { cod:'49011220', nome:'Instalação M2 Pavimento Flutuante/Vinilico (mínimo 8m2) \nZONA NORTE (ZDV Porto, ZDV Norte)', pvp:7.5, unid:'m²', inclui:'O local de instalação deve estar limpo, desimpedido e chão nivelado:\nValor minimo de instalação: 8m2\n- Instalação pavimento com colocação de isolamento;', exclui:'Para além das previstas nas Condições Gerais, também se exclui:\nO produto a instalar\nProdutos essenciais para a instalação\nDeslocação no valor de 30€\nInstalação de rodapés\nInstalação de Perfis\nCorte de Portas e Aduelas\nDesmontagem E remoção do equipamento antigo;\nObras de construção civil \nMovimentação de mobiliário ou decoração existente.', condicoes:'--> É obrigatório a visita prévia para orçamentação do local, onde exibem: \nUma recomendação da artigo mais indicado a aplicar; \nTodos os materiais necessários à correta instalação; \nToda a mão-de-obra necessária à instalação.' },
      { cod:'49013062', nome:'Corte uma Porta e duas Aduelas', pvp:30.0, unid:'un', inclui:'- Corte de uma Porta e duas Aduelas', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTrabalhos de canalização, eletricidade  ou construção civil adicionais', condicoes:'' },
      { cod:'49013672', nome:'Remoção de pavimento (trab complementar)', pvp:1.0, unid:'un', inclui:'Remoção do pavimento antigo', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013066', nome:'Orçamento Pavimento Flutuante/Vinilico', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49014762', nome:'Trabalho Complementar Pavimento Maciço', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49014351', nome:'Trabalho complementar Ripado exterior de fachada', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013129', nome:'INSTALAÇÃO PORTAS CAMPANHA PORTRISA', pvp:499.05, unid:'un', inclui:'', exclui:'', condicoes:'' },
      { cod:'49013131', nome:'TRAB. EXTRA PORTAS CAMPANHA PORTRISA', pvp:1.0, unid:'un', inclui:'', exclui:'', condicoes:'' },
      { cod:'49013132', nome:'TRAB. COMPL. PORTAS PORTRISA (fora campanha)', pvp:1.0, unid:'un', inclui:'', exclui:'', condicoes:'' },
      { cod:'49013644', nome:'CAIXIAVE_INSTALAÇAO JANELAS (23%)', pvp:1.0, unid:'un', inclui:'', exclui:'', condicoes:'' },
      { cod:'49013676', nome:'REMOÇaO JANELAS CAIXIAVE (23%)', pvp:1.0, unid:'un', inclui:'', exclui:'', condicoes:'' },
      { cod:'49013677', nome:'REMOÇAO JANELAS CAIXIAVE (6%)', pvp:1.0, unid:'un', inclui:'', exclui:'', condicoes:'' },
      { cod:'49014352', nome:'Projecto TV WALL', pvp:450.0, unid:'un', inclui:'Projecto em parede de até 10m2 inclui:\nAplicação de até 2 unidades Painel Ripado parede (medidas até 60*240) (não se mexe em rodapés ou sancas) \nCriação de extrutura para painel de pladur\nColocação Painel de pladur e respectivas furações (medidas ate 90*190)\nFixação de suporte de TV\nAbertura de roço dentro de parede para puxada eletrica \nPuxada eletrica \nBarramento e pintura de parede \nColocação de fita LED\nFixação de móvel suspenso (Quando necessário)', exclui:'Para  os serviços excluidos é necessaria a visita de orçamento caso o cliente pretenda algum dos seguintes aspectos:\nLigações HDMI ou RJ45  por dentro da parede\nO produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49014354', nome:'Trabalho complementar para projeto TV WALL', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49014341', nome:'Projeto Pavimento + Pintura', pvp:39.0, unid:'m²', inclui:'Para uma área mínima de entre 10m2 de chão e até 35m2 de parede:\nO local de instalação deve estar limpo, desimpedido e chão nivelado:\n--> Instalação do pavimento\nInstalação de rodapés\nInstalação de Perfis\nCorte de Portas e Aduelas\nRealização do serviço até 3 metros de altura\nPintura em parede virgem, inclui:\nAplicação de primário;\nAplicação de 2 demãos.\nPintura em parede já pintada, inclui:\nAplicação até 3 demãos(total)', exclui:'Remoção de pavimento antigo\nInstalação de rodapés\nInstalação de Perfis\nCorte de Portas e Aduelas\nRemoção de moveis\nLicenças camarárias\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)\nComplementares essenciais para a instalação\nTrabalhos de canalização, eletricidade  ou construção civil adicionais \nMeios de elevação, limpeza ou nivelamento de paredes,', condicoes:'' },
      { cod:'49014342', nome:'Projeto Pavimento + Pintura + Papel de parede', pvp:48.5, unid:'m²', inclui:'Para uma área mínima de entre 10m2 de chão e até 35m2 de parede:\nO local de instalação deve estar limpo, desimpedido e chão nivelado:\n--> Instalação do pavimento\nInstalação de rodapés\nInstalação de Perfis\nCorte de Portas e Aduelas\nRealização do serviço até 3 metros de altura\nPintura em parede virgem, inclui:\nAplicação de primário;\nAplicação de 2 demãos.\nPintura em parede já pintada, inclui:\nAplicação até 3 demãos  (consoante avaliação técnica)\n--> Instalação papel de parede:\nFixação do artigo em parede ou pladur até 2.5m de Altura.\nFerramentas necessárias à instalação (escadote, berbequim, aparafusadora e outras)\nAplicação de cola, recortes e adaptação do papel de parede, remoção  e colocação de espelhos de tomadas e interruptores eletricos', exclui:'Remoção de pavimento antigo\nRemoção de moveis\nLicenças camarárias\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)\nComplementares essenciais para a instalação\nTrabalhos de canalização, eletricidade  ou construção civil adicionais \nMeios de elevação, limpeza ou nivelamento de paredes,', condicoes:'' },
      { cod:'49014343', nome:'Projeto Pavimento + Pintura + painel ripado colado à parede', pvp:53.0, unid:'m²', inclui:'Para uma área mínima de entre 10m2 de chão e até 35m2 de parede:\nO local de instalação deve estar limpo, desimpedido e chão nivelado:\n--> Instalação do pavimento\nInstalação de rodapés\nInstalação de Perfis\nCorte de Portas e Aduelas\n--> Realização do serviço até 3 metros de altura\nPintura em parede virgem, inclui:\nAplicação de primário;\nAplicação de 2 demãos.\nPintura em parede já pintada, inclui:\nAplicação até 3 demãos  (consoante avaliação técnica)\n--> Colocação de painel ripado de parede (até duas placas)', exclui:'Remoção de pavimento antigo\nRemoção de moveis\nLicenças camarárias\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)\nComplementares essenciais para a instalação\nTrabalhos de canalização, eletricidade  ou construção civil adicionais \nMeios de elevação, limpeza ou nivelamento de paredes,', condicoes:'' },
      { cod:'49014345', nome:'Orçamento Projeto Pavimento + Pintura', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49014346', nome:'Orçamento Projeto Pavimento + Pintura + Papel de parede', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49014347', nome:'Orçamento Projeto Pavimento + Pintura + painel ripado colado à parede', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49014348', nome:'Orçamento Projeto Pavimento + Pintura + Porta Interior', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49014349', nome:'Trabalho Complementar Projeto Pavimento + Pintura', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49014355', nome:'Instalação de Divisória em alvenaria (min: 2 unidades)', pvp:35.0, unid:'un', inclui:'Instalação de divisória em alvenaria', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nDesmontagem E remoção do equipamento antigo (excepto quando contratado o Serviço)\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)\nObras de construção civil ou outras necessárias à montagem do equipamento', condicoes:'' },
      { cod:'49014356', nome:'Envernizar divisórias', pvp:13.0, unid:'un', inclui:'Aplicação até 2 demão de tratamento ou verniz', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nDesmontagem E remoção do equipamento antigo (excepto quando contratado o Serviço)\nObras de construção civil ou outras necessárias à montagem do equipamento', condicoes:'' },
      { cod:'49014358', nome:'Orçamento para Instalação de Divisórias', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49014359', nome:'Trabalho complementar Divisórias', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013673', nome:'Remoção Carpintaria ECO', pvp:60.0, unid:'un', inclui:'Desinstalação de material antigo entrega a ponto de reciclagem  (não aplicável para remoção de pavimento que requer sempre visita de orçamento prévia)\nAbertura do vao ate 6cm largura e 3 cm altura', exclui:'', condicoes:'' },
      { cod:'49013102', nome:'Km Extra Instalações', pvp:1.0, unid:'un', inclui:'O valor de 1€ por KM extra é calculado apenas na ida, após os 30km.', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Mosquiteiras", icon: '🪟', cor: '#4A7A5A', servicos: [
      { cod:'49014335', nome:'Orçamento e retificação de medidas para instalação de mosquiteira à medida', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Janelas de S\u00f3t\u00e3o", icon: '🪟', cor: '#5A8A4A', servicos: [
      { cod:'49011210', nome:'Instalação de Janelas Sotão', pvp:180.0, unid:'un', inclui:'O local de instalação deve estar limpo e desimpedido:\n- Fixação da Janela a local já preparado;\n- Colocação de vedante.\nGarantia de 3 (três) anos sobre o serviço de  instalação realizado por profissionais especializados e qualificados.', exclui:'Para além das previstas nas Condições Gerais, também se exclui:\nO produto a instalar\nProdutos essenciais para a instalação\nDesmontagem E remoção do equipamento antigo (excepto quando contratado o Serviço)\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)\nObras de construção civil ou outras necessárias à montagem do equipamento\nAdaptações que sejam necessárias para efetivar a instalação.', condicoes:'--> É obrigatório a visita prévia para orçamentação do local, onde exibem: \nUma recomendação da artigo mais indicado a aplicar; \nTodos os materiais necessários à correta instalação; \nToda a mão-de-obra necessária à instalação.' },
      { cod:'49013665', nome:'Complementar instalação de mosquiteira', pvp:45.0, unid:'un', inclui:'- Instalação de rede mosquiteira em Janela de Sótão', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013666', nome:'Substituição  de mosquiteira', pvp:75.0, unid:'un', inclui:'Remoção da rede mosquiteira antiga\nCorte da rede mosquiteira\nInstalação da rede mosquiteira nova', exclui:'Para além das previstas nas Condições Gerais, também se exclui:\nO produto a instalar\nProdutos essenciais para a instalação\nDesmontagem E remoção do equipamento antigo (excepto quando contratado o Serviço)\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)\nObras de construção civil ou outras necessárias à montagem do equipamento\nAdaptações que sejam necessárias para efetivar a instalação.', condicoes:'' },
      { cod:'49011211', nome:'Orçamento para Instalação Janela Sotão', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013063', nome:'Trabalho complementar Janelas de Sótão/Velux', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Porta de interior", icon: '🚪', cor: '#7A5A3A', servicos: [
      { cod:'49011243', nome:'Instalação de 1 Porta Interior (a partir de 5 unidades inclusive)', pvp:64.99, unid:'un', inclui:'O local de instalação deve estar limpo e desimpedido:\nPreço da unidade da Instalação de mais do que 5 portas de interior\nInstalação do bloco de porta em local já preparado\nColocação da porta, guarnições, aduelas e extensões\nColocação de vedante.\nInstalação das ferragens necessárias para a instalação da porta', exclui:'Para além das previstas nas Condições Gerais, também se exclui:\nO produto a instalar\nProdutos essenciais para a instalação\nDesmontagem E remoção do equipamento antigo (excepto quando contratado o Serviço)\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)\nEmassamento e pintura de paredes, \nReparação de ceramicas ou tejoleiras, \nDeslocação de pontos de luz\nAbertura de paredes transversais\nReparação de pavimentos\nObras de construção civil ou outras necessárias à montagem do equipamento\nAdaptações que sejam necessárias para efetivar a instalação.', condicoes:'--> É obrigatório a visita prévia para orçamentação do local, onde exibem: \nUma recomendação da artigo mais indicado a aplicar; \nTodos os materiais necessários à correta instalação; \nToda a mão-de-obra necessária à instalação.' },
      { cod:'49014337', nome:'complementar colocação kit guia portas correr', pvp:20.0, unid:'un', inclui:'Colocação do kit de guia para porta de correr', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49011245', nome:'Trabalho Complementar Porta Interior', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Portas de Entrada", icon: '🚪', cor: '#6A4A2A', servicos: [
      { cod:'49011247', nome:'Instalação Porta Exterior', pvp:250.0, unid:'un', inclui:'O local de instalação deve estar limpo e desimpedido:\nInstalação do bloco de porta em local já preparado\nColocação da porta, guarnições, aduelas e extensões\nColocação de vedante.\nInstalação das ferragens necessárias para a instalação da porta', exclui:'Para além das previstas nas Condições Gerais, também se exclui:\nO produto a instalar\nProdutos essenciais para a instalação\nDesmontagem E remoção do equipamento antigo (excepto quando contratado o Serviço)\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)\nEmassamento e pintura de paredes, \nReparação de ceramicas ou tejoleiras, \nDeslocação de pontos de luz\nAbertura de paredes transversais\nReparação de pavimentos\nObras de construção civil ou outras necessárias à montagem do equipamento\nAdaptações que sejam necessárias para efetivar a instalação.', condicoes:'--> É obrigatório a visita prévia para orçamentação do local, onde exibem: \nUma recomendação da artigo mais indicado a aplicar; \nTodos os materiais necessários à correta instalação; \nToda a mão-de-obra necessária à instalação.' },
      { cod:'49011248', nome:'Orçamento para Instalação Porta Exterior', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49011251', nome:'Orçamento para Instalação Porta Blindada', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49011249', nome:'Trabalho Complementar Porta Exterior/ Porta Blindada', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Portas de Entrada GardenGate", icon: '🚪', cor: '#5A4A2A', servicos: [
      { cod:'49013646', nome:'Orçamento para intalação de Porta de Entrada GardenGate', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Toldos e Rede de protec\u00e7\u00e3o", icon: '⛱', cor: '#8A7A2A', servicos: [
      { cod:'49011269', nome:'Instalação de Toldo Manual (até 3m do chão)', pvp:149.0, unid:'un', inclui:'O local de instalação deve estar acessível e desimpedido\nFuração do local a instalar o toldo;\nFixação de Toldo Manual a parede até 3mt de altura do chão,\nTeste e explicação do funcionamento\nToldos superiores a 4.5m de largura sob vista de orçamento', exclui:'Para além das previstas nas Condições Gerais, também se exclui:\nO produto a instalar\nProdutos essenciais para a instalação\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)\nPreparação das paredes (estas devem ser previamente niveladas);\nDesmontagem E remoção do equipamento antigo \nObras de construção civil ou outras necessárias à montagem do equipamento\nMeios elevatórios para acesso a local de instalação', condicoes:'' },
      { cod:'49013670', nome:'Instalação de Toldo Elétrico (3m-6m chão)', pvp:450.0, unid:'un', inclui:'O local de instalação deve estar acessível e desimpedido\nFuração do local a instalar o toldo;\nFixação de Toldo Elétrico a parede entre 3m e 6m de altura do chão,\nLigações elétricas até 3m de distância\nAfinação do Toldo\nTeste e explicação do funcionamento.', exclui:'Para além das previstas nas Condições Gerais, também se exclui:\nO produto a instalar\nProdutos essenciais para a instalação\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)\nPreparação das paredes (estas devem ser previamente niveladas);\nDesmontagem E remoção do equipamento antigo \nObras de construção civil ou outras necessárias à montagem do equipamento\nMeios elevatórios para acesso a local de instalação', condicoes:'--> É obrigatório a visita prévia para orçamentação do local, onde exibem: \nUma recomendação da artigo mais indicado a aplicar; \nTodos os materiais necessários à correta instalação; \nToda a mão-de-obra necessária à instalação.' },
      { cod:'49011239', nome:'Orçamento para Instalação Toldo Electrico', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013068', nome:'Trabalho complementar Toldo Manual/Elétrico', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Toldos Sunstyl", icon: '⛱', cor: '#7A6A2A', servicos: [
      { cod:'49014338', nome:'Orçamento para instalação de Toldo Sunstyl', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Varandas", icon: '🏠', cor: '#6A8A5A', servicos: [
      { cod:'49011240', nome:'Orçamento para Instalação Alpendres', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49011241', nome:'Trabalho Complementar Alpendres', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Pavimento Laminado e Madeira", icon: '🪵', cor: '#8A6A4A', servicos: [
      { cod:'49013067', nome:'Instalação de Perfil e Rodapé ml', pvp:4.0, unid:'ml', inclui:'- Instalação de perfil de remate ou transição e rodapé metro linear', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTrabalhos de canalização, eletricidade  ou construção civil adicionais', condicoes:'' },
      { cod:'49014340', nome:'Colocação de autonivelante', pvp:9.0, unid:'m²', inclui:'Aplicação de até 2 camadas de autonivelante \nAplicação de primário de aderência', exclui:'Não inclui a remoção das camadas de autonivelante existentes\nO produto a instalar\nProdutos essenciais para a instalação', condicoes:'' },
      { cod:'49013065', nome:'Trabalho Complementar Pavimento', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Placa de Revestimento", icon: '🪵', cor: '#7A5A3A', servicos: [
      { cod:'49011215', nome:'Instalação de revestimento  ripado de parede (m2) (interior)', pvp:15.99, unid:'m²', inclui:'O local de instalação deve estar limpo e desimpedido:\n- Criação de Estrutura na parede;\n- Fixação de lambrim de Madeira ou PVC á estrutura.\nValor minimo de instalação: 5m2', exclui:'Para além das previstas nas Condições Gerais, também se exclui:\nO produto a instalar\nProdutos essenciais para a instalação\nTrabalhos de canalização, eletricidade  ou construção civil adicionais \nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'--> É obrigatório a visita prévia para orçamentação do local, onde exibem: \nUma recomendação da artigo mais indicado a aplicar; \nTodos os materiais necessários à correta instalação; \nToda a mão-de-obra necessária à instalação.' },
      { cod:'49012271', nome:'Instalação de revestimento ripado de teto (m2)', pvp:18.99, unid:'m²', inclui:'O local de instalação deve estar limpo e desimpedido:\n- Criação de Estrutura no Teto\n- Fixação de lambrim de Madeira ou PVC á estrutura.\nValor minimo de instalação: 5m2', exclui:'Para além das previstas nas Condições Gerais, também se exclui:\nO produto a instalar\nProdutos essenciais para a instalação\nTrabalhos de canalização, eletricidade  ou construção civil adicionais \nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'--> É obrigatório a visita prévia para orçamentação do local, onde exibem: \nUma recomendação da artigo mais indicado a aplicar; \nTodos os materiais necessários à correta instalação; \nToda a mão-de-obra necessária à instalação.' },
      { cod:'49012273', nome:'Instalação de revestimento de PVC colado à parede (m2)', pvp:13.99, unid:'m²', inclui:'O local de instalação deve estar limpo e desimpedido:\n- Colagem do lambrim de PVC à parede existente (parede tem de estar limpa e nivelada).\n- Valor minimo de instalação: 5m2\nÉ obrigatório a visita prévia para orçamentação do local, onde exibem:\n- Uma recomendação da artigo mais indicado a aplicar;\n- Todos os materiais necessários a correta instalação;\n- Toda a mão-de-obra necessária a instalação.', exclui:'Para além das previstas nas Condições Gerais, também se exclui:\nO produto a instalar\nProdutos essenciais para a instalação\nTrabalhos de canalização, eletricidade  ou construção civil adicionais \nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'--> É obrigatório a visita prévia para orçamentação do local, onde exibem: \nUma recomendação da artigo mais indicado a aplicar; \nTodos os materiais necessários à correta instalação; \nToda a mão-de-obra necessária à instalação.' },
      { cod:'49011216', nome:'Orçamento para Instalação de Revestimento de Madeira', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49011217', nome:'Trabalho Complementar Revestimento de Madeira', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Ripado exterior de fachada", icon: '🪵', cor: '#6A4A2A', servicos: [
      { cod:'49014761', nome:'Orçamento Pavimento Maciço', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49014434', nome:'Orçamento para Ripado exterior de fachada', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "PORTRISA", icon: '🚪', cor: '#5A6A7A', servicos: [
      { cod:'49013130', nome:'RETIFICAÇÃO DE MEDIDAS PORTRISA', pvp:43.05, unid:'un', inclui:'', exclui:'', condicoes:'' },
    ]},
    { cat: "Caixiave", icon: '🪟', cor: '#4A5A7A', servicos: [
      { cod:'49013643', nome:'CAIXIAVE_RETIFICAÇaO DE MEDIDAS', pvp:30.0, unid:'un', inclui:'', exclui:'', condicoes:'' },
      { cod:'49013645', nome:'CAIXIAVE_INSTALAÇaO JANELAS (6%)', pvp:1.0, unid:'un', inclui:'', exclui:'', condicoes:'' },
    ]},
    { cat: "Projeto TV Wall", icon: '📺', cor: '#4A4A8A', servicos: [
      { cod:'49014353', nome:'Orçamento para projeto TV WALL', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Projeto Pavimento + Pintura", icon: '🎨', cor: '#8A4A7A', servicos: [
      { cod:'49014344', nome:'Projeto Pavimento + Pintura + Porta Interior', pvp:49.0, unid:'m²', inclui:'Para uma área mínima de entre 10m2 de chão e até 35m2 de parede:\nO local de instalação deve estar limpo, desimpedido e chão nivelado:\n--> Instalação do pavimento\nInstalação de rodapés\nInstalação de Perfis\nCorte de Portas e Aduelas\n--> Realização do serviço até 3 metros de altura\nPintura em parede virgem, inclui:\nAplicação de primário;\nAplicação de 2 demãos.\nPintura em parede já pintada, inclui:\nAplicação até 3 demãos  (consoante avaliação técnica)\n--> Instalação do bloco de porta em local já preparado\nColocação da porta, guarnições, aduelas e extensões\nColocação de vedante.\nInstalação das ferragens necessárias para a instalação da porta', exclui:'Remoção de pavimento antigo\nRemoção de moveis\nLicenças camarárias\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)\nComplementares essenciais para a instalação\nTrabalhos de canalização, eletricidade  ou construção civil adicionais \nMeios de elevação, limpeza ou nivelamento de paredes, \nPara a instalação da porta de interior, também exclui: \nRemoção da porta antiga\nEmassamento e pintura de paredes, \nReparação de ceramicas ou tejoleiras, \nDeslocação de pontos de luz\nAbertura de paredes transversais\nReparação de pavimentos', condicoes:'' },
    ]},
    { cat: "Divis\u00f3rias", icon: '🧱', cor: '#7A7A5A', servicos: [
      { cod:'49014357', nome:'Instalação Divisórias em teto falso (mín 2 unidades)', pvp:50.0, unid:'un', inclui:'Instalação das divisórias em teto falso\nAbertura de teto falso\nCriação de reforços estruturais\nAplicação das divisórias e componentes\nRegularização do teto falso com pladur, argamassa e pintura', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nDesmontagem E remoção do equipamento antigo (excepto quando contratado o Serviço)\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)\nObras de construção civil ou outras necessárias à montagem do equipamento', condicoes:'' },
    ]},
    { cat: "Transversal  Sec\u00e7\u00e3o 02", icon: '↔️', cor: '#6A6A7A', servicos: [
      { cod:'49012274', nome:'Remoção Carpintaria', pvp:40.0, unid:'un', inclui:'Desinstalação de material antigo (não aplicável para remoção de pavimento que requer sempre visita de orçamento prévia)\nAbertura do vao ate 6cm largura e 3 cm altura', exclui:'Recolha e transporte de equipamento removido para local de reciclagem', condicoes:'' },
    ]},
    { cat: "Transversal Sec\u00e7\u00e3o 02", icon: '↔️', cor: '#6A6A7A', servicos: [
      { cod:'49013101', nome:'Deslocação Instalações', pvp:30.0, unid:'un', inclui:'Deslocação até 30km entre a loja e local de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Transversal Carpintaria", icon: '↔️', cor: '#6A6A7A', servicos: [
      { cod:'49013394', nome:'Km Extra  Orçamento', pvp:1.0, unid:'un', inclui:'O valor de 1€ por KM extra é calculado apenas na ida, após os 30km.', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
  ],
  "Cer\u00e2mica": [
    { cat: "Ceramica", icon: '⬛', cor: '#5A5A6A', servicos: [
      { cod:'49011274', nome:'Inst.M2  Pav.Cerâmico', pvp:24.0, unid:'m²', inclui:'Aplicação de argamassa colante apropriada ao tipo de cerâmica e superfície.\nAssentamento das peças cerâmicas, incluindo o espaçamento e alinhamento conforme especificações.\nAplicação de betume nas juntas, de acordo com as características do material fornecido.\nValor minimo de instalação: 5m2', exclui:'Produto a Instalar\nProdutos Essenciais para a Instalação: Não inclui o fornecimento de argamassa, betume ou outros materiais necessários.\nPreparação do Pavimento: Não inclui nivelamentos ou qualquer tipo de preparação estrutural da superfície antes do assentamento.\nTipos de Assentamento Não Tradicionais, a saber: não inclui:\nAssentamento em amarração (tipo tijolo).\nAssentamento diagonal.\nAssentamento em espinha de peixe (herringbone).\nAssentamento chevron.\nAssentamento em painel ou quadrado modular.\nAssentamento sem juntas (junta mínima).\nAssentamento em fileira alternada.\nAssentamento aleatório (irregular).\nAssentamento de grandes formatos.\nInstalação de Grandes Formatos: formatos com medidas iguais ou superiores a 120x60 ou 60x120\nInstalação de Formatos Inferiores a 20x20.\nReparações e Correções: Não se incluem reparações, correções de construção ou resolução de defeitos ocultos nas superfícies.\nMovimentação de Mobiliários: não inclui a movimentação de móveis ou utensílios vazios por sala. Não inclui desmontagem ou montagem de equipamentos.\nPreparação do Local Existente: Não inclui quaisquer trabalhos preliminares, como remoção de revestimentos antigos ou limpeza profunda do local.\nAplicação de Pastilha Cerâmica', condicoes:'' },
      { cod:'49011279', nome:'Inst.M2 Rev.Cerâmico', pvp:24.0, unid:'m²', inclui:'Aplicação de argamassa colante apropriada ao tipo de cerâmica e superfície.\nAssentamento das peças cerâmicas, incluindo o espaçamento e alinhamento conforme especificações.\nAplicação de betume nas juntas, de acordo com as características do material fornecido.\nValor minimo de instalação: 5m2', exclui:'Produto a Instalar\nProdutos Essenciais para a Instalação: Não inclui o fornecimento de argamassa, betume ou outros materiais necessários.\nPreparação da Parede: Não inclui nivelamentos ou qualquer tipo de preparação estrutural da superfície antes do assentamento.\nTipos de Assentamento Não Tradicionais, a saber: não inclui:\nAssentamento em amarração (tipo tijolo).\nAssentamento diagonal.\nAssentamento em espinha de peixe (herringbone).\nAssentamento chevron.\nAssentamento em painel ou quadrado modular.\nAssentamento sem juntas (junta mínima).\nAssentamento em fileira alternada.\nAssentamento aleatório (irregular).\nAssentamento de grandes formatos.\nInstalação de Grandes Formatos: formatos com medidas iguais ou superiores a 120x60 ou 60x120\nInstalação de Formatos Inferiores a 20x20.\nReparações e Correções: Não se incluem reparações, correções de construção ou resolução de defeitos ocultos nas superfícies.\nMovimentação de Mobiliários: não inclui a movimentação de móveis ou utensílios vazios por sala. Não inclui desmontagem ou montagem de equipamentos.\nPreparação do Local Existente: Não inclui quaisquer trabalhos preliminares, como remoção de revestimentos antigos ou limpeza profunda do local.\nAplicação de Pastilha Cerâmica', condicoes:'' },
      { cod:'49011275', nome:'Orçamento para instalação Pavimento Cerâmico', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49011280', nome:'Orçamento para instalação Revestimento Cerâmico', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013087', nome:'Trabalho Complementar Pavimento e Revestimento Cerâmico', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo parceiro que não estão incluidas no serviço padrão de manutenção', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "(Geral)", icon: '🔧', cor: '#8B4513', servicos: [
      { cod:'49014217', nome:'Complementar Instalação Complexa Cerâmica', pvp:4.0, unid:'m²', inclui:'Este serviço apenas será realizado em conjunto com o serviço principal de assentamento cerâmico\nAssentamentos com padrões específicos ou avançados, incluindo:\nAssentamento em amarração (tipo tijolo).\nAssentamento diagonal.\nAssentamento em espinha de peixe (herringbone).\nAssentamento chevron.\nAssentamento em painel ou quadrado modular.\nAssentamento sem juntas (junta mínima).\nAssentamento em fileira alternada.\nAssentamento aleatório (irregular).\nAssentamento de cerâmicas de grandes formatos (peças com dimensões iguais ou superiores a 60x60 cm ou áreas superiores a 3600 cm²).\nTrabalhos com peças de formatos inferiores a 20x20 cm.', exclui:'Produto a Instalar\nProdutos Essenciais para a Instalação: Não inclui o fornecimento de argamassa, betume ou outros materiais necessários.\nPreparação da Parede: Não inclui nivelamentos ou qualquer tipo de preparação estrutural da superfície antes do assentamento.\nReparações e Correções: Não se incluem reparações, correções de construção ou resolução de defeitos ocultos nas superfícies.\nMovimentação de Mobiliários: não inclui a movimentação de móveis ou utensílios vazios por sala. Não inclui desmontagem ou montagem de equipamentos.\nPreparação do Local Existente: Não inclui quaisquer trabalhos preliminares, como remoção de revestimentos antigos ou limpeza profunda do local.\nAplicação de Pastilha Cerâmica: Todo o trabalho relacionado com este tipo de material está sujeito a orçamento adicional.', condicoes:'' },
      { cod:'49013101', nome:'Deslocação Instalações', pvp:30.0, unid:'un', inclui:'Deslocação até 30km entre a loja e local de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013394', nome:'Km Extra  Orçamento', pvp:1.0, unid:'un', inclui:'O valor de 1€ por KM extra é calculado apenas na ida, após os 30km.', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Transversal Sec\u00e7\u00e3o 6", icon: '↔️', cor: '#6A6A7A', servicos: [
      { cod:'49013102', nome:'Km Extra Instalações', pvp:1.0, unid:'un', inclui:'O valor de 1€ por KM extra é calculado apenas na ida, após os 30km.', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
  ],
  "Materiais de Constru\u00e7\u00e3o": [
    { cat: "Isolamento Interior", icon: '🧱', cor: '#5A6A5A', servicos: [
      { cod:'49013084', nome:'Orçamento Isolamento Térmico/Acustico Interior', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar; Produtos essenciais para a instalação; Todo ou qualquer trabalho não mencionado nos serviços incluídos.', condicoes:'' },
      { cod:'49013085', nome:'Trabalho complementar Isolamento Térmico/Acustico Interior', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Impermiabiliza\u00e7\u00e3o interior", icon: '💧', cor: '#2A6A8A', servicos: [
      { cod:'49015290', nome:'Orçamento Impermeabilização Interior', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar; Produtos essenciais para a instalação; Todo ou qualquer trabalho não mencionado nos serviços incluídos.', condicoes:'' },
    ]},
    { cat: "(Geral)", icon: '🔧', cor: '#8B4513', servicos: [
      { cod:'49011142', nome:'Trabalho Complementar Impermeabilização Interior', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013101', nome:'Deslocação Instalações', pvp:30.0, unid:'un', inclui:'Deslocação até 30km entre a loja e local de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013394', nome:'Km Extra  Orçamento', pvp:1.0, unid:'un', inclui:'O valor de 1€ por KM extra é calculado apenas na ida, após os 30km.', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Blocos de Vidro", icon: '🪟', cor: '#4A8A8A', servicos: [
      { cod:'49011145', nome:'Instalação de Bloco de Vidro  (€/m2)', pvp:21.99, unid:'m²', inclui:'Colocação das fileiras de Bloco de vidro com aplicação de argamassa; Finalização das Juntas.; Valor minimo de instalação: 4m2', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nPreparação do local existente\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49011146', nome:'Orçamento para Instalação Bloco Vidro', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar; Produtos essenciais para a instalação; Todo ou qualquer trabalho não mencionado nos serviços incluídos.', condicoes:'' },
      { cod:'49011147', nome:'Trabalho Complementar Bloco Vidro', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Parede divis\u00f3ria/Pladur", icon: '🧱', cor: '#7A7A5A', servicos: [
      { cod:'49011178', nome:'Instalação Pladur  (€/m2)', pvp:17.99, unid:'m²', inclui:'Criação de estrutura e fixação ao local;\nInstalação de Pladur a estrutura.\nInstalação mínima de 5m2', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nPreparação do local existente\nDeslocação até 30km entre a loja e local de instalação (Acresce 30€)', condicoes:'' },
      { cod:'49011179', nome:'Orçamento para Instalação Pladur', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta instalação\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar; Produtos essenciais para a instalação; Todo ou qualquer trabalho não mencionado nos serviços incluídos.', condicoes:'' },
      { cod:'49011180', nome:'Trabalho Complementar Pladur', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Transversal Sec\u00e7\u00e3o 1", icon: '↔️', cor: '#6A6A7A', servicos: [
      { cod:'49013102', nome:'Km Extra Instalações', pvp:1.0, unid:'un', inclui:'O valor de 1€ por KM extra é calculado apenas na ida, após os 30km.', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
  ],
  "Remodela\u00e7\u00e3o Geral": [
    { cat: "(Geral)", icon: '🔧', cor: '#8B4513', servicos: [
      { cod:'49014059', nome:'Ativação iva taxa reduzida mão de obra - remodelação', pvp:0.01, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49014433', nome:'Orçamento para Remodelação Interior Moradia', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta remodelação de interior moradia que não envolve trabalhos em altura superiores a 3m\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos\nNão inclui trabalhos de instalação de equipamentos de gás ou qualquer outros serviços que impliquem certificação obrigatória como AC, painéis fotovoltaicos, etc.', condicoes:'' },
      { cod:'49013628', nome:'Trabalho Complementar Remodelação Geral (TXNM) - Materiais de construção', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013630', nome:'Trabalho Complementar Remodelação Geral (TXNM) -Pavimento', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013631', nome:'Trabalho Complementar Remodelação Geral (TXNM) -Cerâmica', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013633', nome:'Trabalho Complementar Remodelação Geral (TXNM) - Casas de Banho', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013635', nome:'Trabalho Complementar Remodelação Geral (TXNM) - Cozinhas', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49014102', nome:'Trabalho Complementar Remodelação Geral (TXNM) - Pintura Interior', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013638', nome:'Trabalho Complementar Remodelação Geral (TXNM) - Iluminação', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49014060', nome:'Trabalho complementar remodelação geral : outros trabalhos', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49014061', nome:'Trab complementar tratamento de entulho e limpeza de obra remodelação geral', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013101', nome:'Deslocação Instalações', pvp:30.0, unid:'un', inclui:'Deslocação até 30km entre a loja e local de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
      { cod:'49013394', nome:'Km Extra  Orçamento', pvp:1.0, unid:'un', inclui:'O valor de 1€ por KM extra é calculado apenas na ida, após os 30km.', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Remodela\u00e7\u00e3o Geral", icon: '🏗', cor: '#6A5A4A', servicos: [
      { cod:'49012645', nome:'Orçamento para Remodelação Interior Apartamento', pvp:30.0, unid:'un', inclui:'Orçamentação de materiais e trabalhos necessários para a correta remodelação de interior apartamento que não envolve trabalhos em altura superiores a 3m\nDeslocação até 30km entre a loja e local de instalação', exclui:'O produto a instalar\nProdutos essenciais para a instalação\nTodo ou qualquer trabalho não mencionado nos serviços incluídos\nNão inclui trabalhos de instalação de equipamentos de gás ou qualquer outros serviços que impliquem certificação obrigatória como AC, painéis fotovoltaicos, etc.', condicoes:'' },
    ]},
    { cat: "Remodela\u00e7\u00e3o Geral Interior", icon: '🏗', cor: '#6A5A4A', servicos: [
      { cod:'49013629', nome:'Trabalho Complementar Remodelação Geral (TXNM) -Carpintaria', pvp:1.0, unid:'un', inclui:'O trabalho complementar inclui tarefas descritas pelo instalador que não estão incluidas no serviço padrão de instalação', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
    { cat: "Transversal Sec\u00e7\u00e3o 4", icon: '↔️', cor: '#6A6A7A', servicos: [
      { cod:'49013102', nome:'Km Extra Instalações', pvp:1.0, unid:'un', inclui:'O valor de 1€ por KM extra é calculado apenas na ida, após os 30km.', exclui:'Todo ou qualquer trabalho não mencionado nos serviços incluídos', condicoes:'' },
    ]},
  ],
};
export const MO_SECCAO_ORDEM = [
  'Cozinhas e Roupeiros',
  'Sanitários',
  'Carpintaria e Caixilharia',
  'Cerâmica',
  'Materiais de Construção',
  'Remodelação Geral',
];

// PERSISTÊNCIA — FIREBASE
// ════════════════════════════════════════════════
const MO_DOC_ORC   = 'wk_mo_orcamento';
const MO_DOC_ORDEM = 'wk_mo_ordem';

export async function moCarregarOrcamento() {
  const db = getDb();
  if (!db) return;
  try {
    // Carregar orçamento
    const snapOrc = await getDoc(doc(db, 'wk_estado', MO_DOC_ORC));
    if (snapOrc.exists()) {
      const ST = getST();
      ST.moOrc = snapOrc.data().orc || [];
      moAtualizarBadge();
    }
    // Carregar ordenações personalizadas
    const snapOrd = await getDoc(doc(db, 'wk_estado', MO_DOC_ORDEM));
    if (snapOrd.exists()) {
      window._moOrdem = snapOrd.data().ordem || {};
      // Aplicar ordenações guardadas às listas em memória
      moAplicarOrdens();
    }
  } catch (e) { console.warn('MO: erro ao carregar', e); }
}

async function moGuardarOrcamento() {
  const db = getDb();
  if (!db) return;
  const ST = getST();
  try {
    await setDoc(doc(db, 'wk_estado', MO_DOC_ORC), { orc: ST.moOrc, ts: Date.now() });
    setSyncOk();
  } catch (e) {
    console.warn('MO: erro ao guardar orçamento', e);
    mostrarErroDB(e);
  }
}

async function moGuardarOrdem(chave, ordemCods) {
  const db = getDb();
  if (!db) return;
  if (!window._moOrdem) window._moOrdem = {};
  window._moOrdem[chave] = ordemCods;
  try {
    await setDoc(doc(db, 'wk_estado', MO_DOC_ORDEM), { ordem: window._moOrdem, ts: Date.now() });
  } catch (e) {
    console.warn('MO: erro ao guardar ordem', e);
    toast('⚠️ Ordem não guardada — verifica a ligação');
  }
}

// Aplica as ordens guardadas ao MO_SECCOES em memória
function moAplicarOrdens() {
  const ordens = window._moOrdem || {};
  for (const [chave, cods] of Object.entries(ordens)) {
    const [seccao, cat] = chave.split('|||');
    const secData = MO_SECCOES[seccao];
    if (!secData) continue;
    const catData = secData.find(c => c.cat === cat);
    if (!catData) continue;
    // Reordenar servicos segundo a ordem guardada
    const mapa = Object.fromEntries(catData.servicos.map(s => [s.cod, s]));
    const reordenados = cods.map(cod => mapa[cod]).filter(Boolean);
    // Adicionar serviços novos que não estejam na ordem guardada
    const codsGuardados = new Set(cods);
    const novos = catData.servicos.filter(s => !codsGuardados.has(s.cod));
    catData.servicos = [...reordenados, ...novos];
  }
}

// ════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════
function getMoDados() {
  const ST = getST();
  return MO_SECCOES[ST.moSeccao] || MO_SECCOES['Cozinhas e Roupeiros'];
}

function moChaveOrdem() {
  const ST = getST();
  return `${ST.moSeccao}|||${ST.moCat}`;
}

function moAtualizarBadge() {
  const ST = getST();
  const badge = document.getElementById('badge-mo');
  if (badge) {
    badge.textContent = ST.moOrc.length;
    badge.style.display = ST.moOrc.length ? 'inline-block' : 'none';
  }
}

// ════════════════════════════════════════════════
// RENDER PRINCIPAL
// ════════════════════════════════════════════════
const ddStyle = `padding:8px 28px 8px 12px;border-radius:9px;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.1);color:var(--t2);font-family:var(--sans);font-size:12px;
  cursor:pointer;outline:none;appearance:none;-webkit-appearance:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,.25)'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 10px center;transition:border-color .15s;`;

export function moRender() {
  const ST = getST();
  const cats  = document.getElementById('mo-cats');
  const lista = document.getElementById('mo-lista');
  if (!cats || !lista) return;

  const existingSelect = document.getElementById('mo-seccao-select');
  const seccaoChanged  = existingSelect && existingSelect.value !== ST.moSeccao;

  if (!existingSelect || seccaoChanged) {
    cats.innerHTML = `
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:14px">
        <select id="mo-seccao-select" onchange="window.moSelectSeccao(this.value)"
          style="${ddStyle}min-width:190px;border-color:rgba(196,97,42,.35)">
          ${MO_SECCAO_ORDEM.map(s => `<option value="${s}" ${ST.moSeccao===s?'selected':''}>${s}</option>`).join('')}
        </select>
        <select id="mo-cat-select" onchange="window.moSelectCat(this.value)"
          style="${ddStyle}min-width:180px">
          ${getMoDados().map(c => `<option value="${c.cat}" ${ST.moCat===c.cat?'selected':''}>${c.icon} ${c.cat} (${c.servicos.length})</option>`).join('')}
        </select>
        <div class="search-wrap" style="flex:1;min-width:160px;position:relative">
          <span class="search-icon">⌕</span>
          <input type="text" id="mo-pesquisa-input" class="search-input"
            placeholder="Pesquisar serviço ou código…"
            oninput="window.moPesquisar(this.value)"
            style="padding-right:28px">
          <button onclick="window.moClearPesquisa()"
            style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;
            color:var(--t4);font-size:15px;cursor:pointer;padding:2px 4px">×</button>
        </div>
      </div>`;
  } else {
    const selS = document.getElementById('mo-seccao-select');
    const selC = document.getElementById('mo-cat-select');
    if (selS) selS.value = ST.moSeccao;
    if (selC) {
      selC.innerHTML = getMoDados().map(c => `<option value="${c.cat}" ${ST.moCat===c.cat?'selected':''}>${c.icon} ${c.cat} (${c.servicos.length})</option>`).join('');
      selC.value = ST.moCat;
    }
  }

  moRenderLista();
}

function moRenderLista() {
  const ST   = getST();
  const lista = document.getElementById('mo-lista'); if (!lista) return;
  const pesq  = (ST.moPesquisa || '').toLowerCase().trim();
  let servicos;

  if (pesq) {
    servicos = [];
    getMoDados().forEach(c => {
      c.servicos.forEach(s => {
        if (s.nome.toLowerCase().includes(pesq) || s.cod.includes(pesq)
          || (s.inclui||'').toLowerCase().includes(pesq)) {
          servicos.push({ ...s, _cat: c.cat, _cor: c.cor });
        }
      });
    });
  } else {
    const catData = getMoDados().find(c => c.cat === ST.moCat);
    servicos = (catData?.servicos || []).map(s => ({ ...s, _cat: catData?.cat, _cor: catData?.cor }));
  }

  // Modo de reordenação: só activo quando não há pesquisa
  const podeOrdenar = !pesq;

  lista.innerHTML = servicos.map(s => {
    const noOrc      = ST.moOrc.some(x => x.cod === s.cod);
    const temDetalhe = !!(s.inclui || s.exclui || s.condicoes);
    return `
      <div class="mo-item ${noOrc ? 'mo-item-selected' : ''}" draggable="${podeOrdenar}" data-cod="${s.cod}"
        ${podeOrdenar ? `
          ondragstart="window._moDragStart(event)"
          ondragover="window._moDragOver(event)"
          ondragleave="window._moDragLeave(event)"
          ondrop="window._moDrop(event)"
          ondragend="window._moDragEnd(event)"` : ''}>
        ${podeOrdenar ? `<div class="mo-drag-handle" title="Arrastar para reordenar">⠿</div>` : ''}
        <div style="display:flex;flex-direction:column;gap:3px;min-width:80px;flex-shrink:0">
          <span class="mo-item-cod">${s.cod}</span>
          <button class="mo-item-add"
            style="background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1);color:rgba(255,255,255,.5);padding:2px 7px;font-size:9px"
            onclick="event.stopPropagation();window.copiarTexto('${s.cod}',this)">⎘ Copiar</button>
        </div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span class="mo-item-nome">${s.nome}${pesq&&s._cat?` <span style="font-size:9px;color:var(--t4);font-weight:400">· ${s._cat}</span>`:''}</span>
            ${temDetalhe ? `
            <button onclick="window.moToggleDetalhe('${s.cod}')" id="mo-det-btn-${s.cod}"
              style="padding:2px 7px;border-radius:5px;font-size:9px;font-weight:700;cursor:pointer;transition:all .15s;
              background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:var(--t4)">ℹ︎</button>` : ''}
          </div>
          ${s.nota ? `<div class="mo-item-warn">${s.nota}</div>` : ''}
          <div id="mo-det-${s.cod}" style="display:none;margin-top:7px;padding:9px 11px;
            background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:7px">
            ${s.inclui ? `<div style="margin-bottom:${s.exclui||s.condicoes?'8px':'0'}">
              <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(150,220,150,.5);margin-bottom:4px">✓ Inclui</div>
              ${s.inclui.split('\n').map(l => `<div style="font-size:10px;color:var(--t2);line-height:1.7">· ${l.trim()}</div>`).join('')}
            </div>` : ''}
            ${s.exclui ? `<div style="${s.inclui?'border-top:1px solid rgba(255,255,255,.05);padding-top:8px;':''}margin-bottom:${s.condicoes?'8px':'0'}">
              <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,120,100,.4);margin-bottom:4px">✕ Exclui</div>
              ${s.exclui.split('\n').map(l => `<div style="font-size:10px;color:rgba(255,200,190,.55);line-height:1.7">· ${l.trim()}</div>`).join('')}
            </div>` : ''}
            ${s.condicoes ? `<div style="border-top:1px solid rgba(255,255,255,.05);padding-top:8px">
              <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,190,152,.4);margin-bottom:4px">⚠️ Condições</div>
              ${s.condicoes.split('\n').map(l => `<div style="font-size:10px;color:rgba(255,190,152,.65);line-height:1.7">· ${l.trim()}</div>`).join('')}
            </div>` : ''}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0">
          <span class="mo-item-pvp">${s.pvp > 0 ? fmt(s.pvp) : '<span style="font-size:9px;color:var(--t4)">ver nota</span>'}</span>
          <span style="font-size:9px;color:var(--t4)">${s.unid}</span>
          <button class="mo-item-add ${noOrc ? 'mo-item-add-active' : ''}"
            onclick="window.moToggleOrc('${s.cod}')">
            ${noOrc ? '✓ No Orc.' : '+ Orçamento'}
          </button>
        </div>
      </div>`;
  }).join('') || `<div style="text-align:center;padding:40px;color:var(--t4);font-size:12px">Nenhum serviço encontrado</div>`;
}

// ════════════════════════════════════════════════
// DRAG-AND-DROP — reordenação de serviços MO
// ════════════════════════════════════════════════
let _dragSrc = null;

window._moDragStart = function(e) {
  _dragSrc = e.currentTarget;
  _dragSrc.classList.add('mo-drag-active');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', _dragSrc.dataset.cod);
};

window._moDragOver = function(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const target = e.currentTarget;
  if (target === _dragSrc) return;
  target.classList.add('mo-drag-over');
};

window._moDragLeave = function(e) {
  e.currentTarget.classList.remove('mo-drag-over');
};

window._moDragEnd = function(e) {
  document.querySelectorAll('.mo-drag-active,.mo-drag-over').forEach(el => {
    el.classList.remove('mo-drag-active', 'mo-drag-over');
  });
  _dragSrc = null;
};

window._moDrop = function(e) {
  e.preventDefault();
  const target = e.currentTarget;
  target.classList.remove('mo-drag-over');
  if (!_dragSrc || _dragSrc === target) return;

  const ST      = getST();
  const lista   = document.getElementById('mo-lista');
  const items   = [...lista.querySelectorAll('.mo-item[data-cod]')];
  const srcIdx  = items.indexOf(_dragSrc);
  const tgtIdx  = items.indexOf(target);
  if (srcIdx < 0 || tgtIdx < 0) return;

  // Reordenar no DOM
  if (srcIdx < tgtIdx) {
    target.after(_dragSrc);
  } else {
    target.before(_dragSrc);
  }

  // Reordenar no MO_SECCOES em memória
  const catData = getMoDados().find(c => c.cat === ST.moCat);
  if (!catData) return;
  const novaOrdem = [...lista.querySelectorAll('.mo-item[data-cod]')].map(el => el.dataset.cod);
  const mapa      = Object.fromEntries(catData.servicos.map(s => [s.cod, s]));
  catData.servicos = novaOrdem.map(cod => mapa[cod]).filter(Boolean);

  // Persistir no Firebase
  moGuardarOrdem(moChaveOrdem(), novaOrdem);
  toast('↕ Ordem guardada');
};

function moRenderPainel() {
  const ST  = getST();
  const ct  = document.getElementById('mo-painel-body'); if (!ct) return;
  if (!ST.moOrc.length) {
    ct.innerHTML = `<div style="text-align:center;padding:30px;color:rgba(255,255,255,.5);font-size:12px">Sem serviços no orçamento</div>`;
    return;
  }
  const total = ST.moOrc.reduce((s, a) => s + (a.pvp > 0 ? a.pvp * (a.qty || 1) : 0), 0);

  ct.innerHTML = `
    ${ST.moOrc.map((s, i) => `
      <div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,.08)">
        <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:5px">
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">
              <span style="font-size:11px;color:rgba(255,255,255,.85);font-weight:500">${s.nome}</span>
              ${(s.inclui||s.exclui||s.condicoes) ? `
              <button onclick="window.moOrcToggleDetalhe(${i})" id="mo-orc-det-btn-${i}"
                style="padding:2px 6px;border-radius:4px;font-size:9px;font-weight:700;cursor:pointer;transition:all .15s;
                background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:var(--t4)">ℹ︎</button>` : ''}
            </div>
            <div style="display:flex;align-items:center;gap:5px;margin-top:2px">
              <button onclick="window.copiarTexto('${s.cod}',this)"
                style="font-family:var(--mono);font-size:9px;color:var(--t4);background:rgba(196,97,42,.08);
                border:1px solid rgba(196,97,42,.18);border-radius:4px;padding:1px 7px;cursor:pointer;transition:all .15s">
                ${s.cod} ⎘
              </button>
              <span style="font-size:9px;color:var(--t4)">· ${s._cat}</span>
            </div>
          </div>
          <button onclick="window.moToggleOrc('${s.cod}')"
            style="width:22px;height:22px;border-radius:50%;background:rgba(192,57,43,.1);border:1px solid rgba(192,57,43,.2);
            color:rgba(255,150,140,.5);font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0">×</button>
        </div>
        <div id="mo-orc-det-${i}" style="display:none;margin-bottom:6px;padding:8px 10px;
          background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:7px">
          ${s.inclui ? `<div style="margin-bottom:6px"><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(150,220,150,.5);margin-bottom:4px">✓ Inclui</div>${s.inclui.split('\n').map(l=>`<div style="font-size:10px;color:var(--t2);line-height:1.7">· ${l.trim()}</div>`).join('')}</div>` : ''}
          ${s.exclui ? `<div style="${s.inclui?'border-top:1px solid rgba(255,255,255,.05);padding-top:6px;':''}margin-bottom:${s.condicoes?'6px':'0'}"><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,120,100,.4);margin-bottom:4px">✕ Exclui</div>${s.exclui.split('\n').map(l=>`<div style="font-size:10px;color:rgba(255,200,190,.55);line-height:1.7">· ${l.trim()}</div>`).join('')}</div>` : ''}
          ${s.condicoes ? `<div style="border-top:1px solid rgba(255,255,255,.05);padding-top:6px"><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,190,152,.4);margin-bottom:4px">⚠️ Condições</div>${s.condicoes.split('\n').map(l=>`<div style="font-size:10px;color:rgba(255,190,152,.65);line-height:1.7">· ${l.trim()}</div>`).join('')}</div>` : ''}
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
          <div style="display:flex;align-items:center;gap:6px">
            <button onclick="window.moQty(${i},-1)"
              style="width:22px;height:22px;border-radius:5px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
              color:var(--t2);font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center">−</button>
            <input type="number" min="1" step="1" value="${s.qty || 1}"
              onchange="window.moQtyDirecto(${i}, this.value)"
              oninput="window.moQtyDirecto(${i}, this.value)"
              style="width:44px;padding:3px 6px;border-radius:5px;background:rgba(255,255,255,.06);
              border:1px solid rgba(255,255,255,.1);font-family:var(--mono);font-size:13px;font-weight:700;
              color:var(--t1);text-align:center;outline:none;
              -moz-appearance:textfield;-webkit-appearance:none;appearance:textfield"
              onfocus="this.style.borderColor='rgba(196,97,42,.4)'"
              onblur="this.style.borderColor='rgba(255,255,255,.1)'">
            <button onclick="window.moQty(${i},+1)"
              style="width:22px;height:22px;border-radius:5px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
              color:var(--t2);font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center">+</button>
            <span style="font-size:10px;color:var(--t4)">× ${s.pvp > 0 ? fmt(s.pvp) : 'A definir'}</span>
          </div>
          <span style="font-family:var(--mono);font-size:14px;font-weight:700;color:#fff">
            ${s.pvp > 0 ? fmt(s.pvp * (s.qty || 1)) : '—'}
          </span>
        </div>
      </div>`).join('')}
    <div style="margin-top:14px;padding:12px 0;border-top:1px solid rgba(255,255,255,.2);display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,190,152,.5)">Total Mão de Obra</div>
        <div style="font-size:10px;color:rgba(255,255,255,.3);margin-top:1px">${ST.moOrc.length} serviço${ST.moOrc.length !== 1 ? 's' : ''}</div>
      </div>
      <span style="font-family:var(--mono);font-size:20px;font-weight:700;color:var(--peach)" class="mo-total-val">${fmt(total)}</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">
      <button class="btn-sec" style="width:100%" onclick="window.moCopiarOrcamento()">📋 Copiar Orçamento completo</button>
      <button class="btn-sec" style="width:100%" onclick="window.moCopiarSoCodigos()">⎘ Copiar Códigos + Quantidades</button>
      <button style="width:100%;padding:7px;border-radius:8px;background:rgba(192,57,43,.1);border:1px solid rgba(192,57,43,.2);
        color:rgba(255,150,140,.5);font-family:var(--sans);font-size:11px;font-weight:600;cursor:pointer"
        onclick="window.moLimpar()">× Limpar orçamento</button>
    </div>`;
}

// ════════════════════════════════════════════════
// WINDOW API — funções chamadas pelo HTML
// ════════════════════════════════════════════════
window.moRender = moRender;

window.moPesquisar = function(v) {
  getST().moPesquisa = v;
  moRenderLista();
};

window.moClearPesquisa = function() {
  getST().moPesquisa = '';
  const inp = document.getElementById('mo-pesquisa-input');
  if (inp) { inp.value = ''; inp.focus(); }
  moRenderLista();
};

window.moSelectSeccao = function(seccao) {
  const ST  = getST();
  ST.moSeccao  = seccao;
  ST.moCat     = MO_SECCOES[seccao]?.[0]?.cat || '';
  ST.moPesquisa = '';
  const inp = document.getElementById('mo-pesquisa-input');
  if (inp) inp.value = '';
  moRender();
};

window.moSelectCat = function(cat) {
  getST().moCat     = cat;
  getST().moPesquisa = '';
  const inp = document.getElementById('mo-pesquisa-input');
  if (inp) inp.value = '';
  moRenderLista();
};

window.moToggleDetalhe = function(cod) {
  const painel = document.getElementById('mo-det-' + cod);
  const btn    = document.getElementById('mo-det-btn-' + cod);
  if (!painel) return;
  const aberto = painel.style.display !== 'none';
  painel.style.display = aberto ? 'none' : 'block';
  if (btn) {
    btn.textContent        = aberto ? 'ℹ︎' : 'ℹ︎ fechar';
    btn.style.background   = aberto ? 'rgba(255,255,255,.05)' : 'rgba(196,97,42,.15)';
    btn.style.borderColor  = aberto ? 'rgba(255,255,255,.1)'  : 'rgba(196,97,42,.3)';
    btn.style.color        = aberto ? 'var(--t4)'             : 'rgba(255,190,152,.8)';
  }
};

window.moToggleOrc = function(cod) {
  const ST  = getST();
  const idx = ST.moOrc.findIndex(x => x.cod === cod);
  if (idx >= 0) {
    ST.moOrc.splice(idx, 1);
    toast('× Removido do orçamento');
  } else {
    let servico = null;
    for (const sec of Object.values(MO_SECCOES)) {
      for (const c of sec) {
        const s = c.servicos.find(x => x.cod === cod);
        if (s) { servico = { ...s, _cat: c.cat, _cor: c.cor, qty: 1, nota: '' }; break; }
      }
      if (servico) break;
    }
    if (servico) { ST.moOrc.push(servico); toast('✓ Adicionado ao orçamento'); }
  }
  moAtualizarBadge();
  moRenderLista();
  moRenderPainel();
  moGuardarOrcamento(); // ← persistir automaticamente
};

window.moTogglePainel = function() {
  const p = document.getElementById('mo-painel'); if (!p) return;
  const aberto = p.style.display !== 'none';
  p.style.display = aberto ? 'none' : 'flex';
  if (!aberto) moRenderPainel();
};

window.moQty = function(idx, delta) {
  const ST = getST();
  if (!ST.moOrc[idx]) return;
  ST.moOrc[idx].qty = Math.max(1, (ST.moOrc[idx].qty || 1) + delta);
  moRenderPainel();
  moGuardarOrcamento();
};

window.moQtyDirecto = function(idx, val) {
  const ST = getST();
  if (!ST.moOrc[idx]) return;
  const n = parseInt(val);
  if (isNaN(n) || n < 1) return;
  ST.moOrc[idx].qty = n;
  const totalSpan = document.querySelector('#mo-painel-body .mo-total-val');
  const total = ST.moOrc.reduce((s, a) => s + (a.pvp > 0 ? a.pvp * (a.qty || 1) : 0), 0);
  if (totalSpan) totalSpan.textContent = fmt(total);
  moGuardarOrcamento();
};

window.moOrcToggleDetalhe = function(idx) {
  const painel = document.getElementById('mo-orc-det-' + idx);
  const btn    = document.getElementById('mo-orc-det-btn-' + idx);
  if (!painel) return;
  const aberto = painel.style.display !== 'none';
  painel.style.display = aberto ? 'none' : 'block';
  if (btn) {
    btn.textContent        = aberto ? 'ℹ︎' : 'ℹ︎ fechar';
    btn.style.background   = aberto ? 'rgba(255,255,255,.05)' : 'rgba(196,97,42,.15)';
    btn.style.borderColor  = aberto ? 'rgba(255,255,255,.1)'  : 'rgba(196,97,42,.3)';
    btn.style.color        = aberto ? 'var(--t4)'             : 'rgba(255,190,152,.8)';
  }
};

window.moAtualizarNota = function(idx, nota) {
  const ST = getST();
  if (ST.moOrc[idx]) ST.moOrc[idx].nota = nota;
};

window.moLimpar = function() {
  const ST = getST();
  if (!ST.moOrc.length) return;
  window.wkConfirm('Limpar todo o orçamento de mão de obra?', () => {
    ST.moOrc = [];
    moAtualizarBadge();
    moRenderLista();
    moRenderPainel();
    moGuardarOrcamento();
    toast('✓ Orçamento limpo');
  });
};

window.moCopiarOrcamento = function() {
  const ST = getST();
  if (!ST.moOrc.length) { toast('⚠️ Orçamento vazio'); return; }
  const total  = ST.moOrc.reduce((s, a) => s + (a.pvp > 0 ? a.pvp * (a.qty || 1) : 0), 0);
  const linhas = [
    'ORÇAMENTO — MÃO DE OBRA',
    '─'.repeat(70),
    `${'CÓDIGO'.padEnd(12)}${'QTY'.padEnd(6)}${'UNID'.padEnd(6)}${'P. UNIT'.padEnd(12)}${'TOTAL'.padEnd(12)}DESCRIÇÃO`,
    '─'.repeat(70),
  ];
  ST.moOrc.forEach(s => {
    const qty   = s.qty || 1;
    const punit = s.pvp > 0 ? fmt(s.pvp) : 'A definir';
    const ptot  = s.pvp > 0 ? fmt(s.pvp * qty) : '—';
    linhas.push(`${s.cod.padEnd(12)}${String(qty).padEnd(6)}${s.unid.padEnd(6)}${punit.padEnd(12)}${ptot.padEnd(12)}${s.nome}`);
  });
  linhas.push('─'.repeat(70));
  linhas.push(`${''.padEnd(36)}${'TOTAL MÃO DE OBRA:'.padEnd(12)} ${fmt(total)}`);
  navigator.clipboard.writeText(linhas.join('\n')).then(() => toast('✓ Orçamento copiado — pronto para o programa LM'));
};

window.moCopiarSoCodigos = function() {
  const ST = getST();
  if (!ST.moOrc.length) { toast('⚠️ Orçamento vazio'); return; }
  const linhas = ST.moOrc.map(s => `${s.cod}\t${s.qty || 1}`);
  navigator.clipboard.writeText(linhas.join('\n')).then(() => toast('✓ Códigos + quantidades copiados'));
};

// Exportar getters úteis para outros módulos (ex: proposta consolidada)
export function getMoOrc()      { return getST().moOrc; }
export function getMoSeccoes()  { return MO_SECCOES; }
