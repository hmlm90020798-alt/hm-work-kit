// ════════════════════════════════════════════════
// materiais.js · Work Kit · Hélder Melo
// Tab Materiais — catálogo, pesquisa global,
// adição/edição directa, importação Excel
// ════════════════════════════════════════════════

import { doc, setDoc, deleteDoc, getDocs, collection }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getDb, getST, fmt, toast, setSyncOk, mostrarErroDB } from './utils.js';

// ════════════════════════════════════════════════
// BASE DE DADOS — seed dos artigos do Excel
// Sobreposta por overrides do Firestore se existirem
// ════════════════════════════════════════════════
export const MATERIAIS_DB = [
  { ref:'81959437', familia:'Material PRO', nome:'Placa Gesso Cartonado Hidrófugo 13mm 2500 GF', preco:13.77, unid:'un', quando:'Locais húmidos — cozinha e WC. Obrigatório onde há vapor ou humidade.', lista:'Remodelação Geral', url:'' },
  { ref:'19960752', familia:'Material PRO', nome:'Placa Gesso Cartonado Normal 13mm 2500 GF', preco:7.77, unid:'un', quando:'Paredes e tetos em zonas secas — salas, quartos e corredores.', lista:'Remodelação Geral', url:'' },
  { ref:'17051615', familia:'Material PRO', nome:'Massa Juntas GC 2H 20kg', preco:11.99, unid:'un', quando:'Barrar juntas após colocação das placas de gesso — primeira camada.', lista:'Remodelação Geral', url:'' },
  { ref:'18769422', familia:'Material PRO', nome:'Fita Papel Juntas Standers 150ml', preco:5.0, unid:'un', quando:'Reforço das juntas antes de barrar — evita fissuras.', lista:'Remodelação Geral', url:'' },
  { ref:'19867582', familia:'Material PRO', nome:'Massa Acabamento Gesso Mecafino Placo 17kg', preco:7.99, unid:'un', quando:'Acabamento final das juntas — lisar antes de pintar.', lista:'Remodelação Geral', url:'' },
  { ref:'19112394', familia:'Material PRO', nome:'Painel Lã Rocha Isole+ 40mm', preco:33.89, unid:'un', quando:'Isolamento acústico e térmico em divisórias de pladur.', lista:'Remodelação Geral', url:'' },
  { ref:'15952944', familia:'Material PRO', nome:'Teto Contínuo T47 3ml', preco:2.29, unid:'un', quando:'Perfil principal da estrutura do teto falso.', lista:'Remodelação Geral', url:'' },
  { ref:'15953000', familia:'Material PRO', nome:'Cantoneira L30×30 0,5mm 3ml', preco:1.39, unid:'un', quando:'Remate de cantos e junção parede-teto em pladur.', lista:'Remodelação Geral', url:'' },
  { ref:'89714277', familia:'Material PRO', nome:'Bucha Latão M6 100un — Pecol', preco:8.49, unid:'un', quando:'Fixação de varão roscado à estrutura de betão — ancoragem do teto.', lista:'Remodelação Geral', url:'' },
  { ref:'81972698', familia:'Material PRO', nome:'Varão Roscado Aço Zincado M6 20uni', preco:9.89, unid:'un', quando:'Suspensão do teto contínuo T47 à laje.', lista:'Remodelação Geral', url:'' },
  { ref:'15953105', familia:'Material PRO', nome:'Emenda 47 50 unidades', preco:8.99, unid:'un', quando:'União entre perfis T47 — garante continuidade da estrutura.', lista:'Remodelação Geral', url:'' },
  { ref:'17042963', familia:'Material PRO', nome:'Perfil Dentado TC47 3m', preco:4.49, unid:'un', quando:'Perfil de suporte secundário — apoia as placas de gesso.', lista:'Remodelação Geral', url:'' },
  { ref:'18762611', familia:'Material PRO', nome:'Parafusos TTPC Standers 25mm 1000un', preco:8.15, unid:'un', quando:'Fixação das placas de gesso cartonado aos perfis metálicos.', lista:'Remodelação Geral', url:'' },
  { ref:'89705139', familia:'Material PRO', nome:'Bucha Nylon Gesso PCL623 6×25 cx1000', preco:22.99, unid:'un', quando:'Fixação leve em gesso cartonado — prateleiras e acessórios leves.', lista:'Remodelação Geral', url:'' },
  { ref:'89973267', familia:'Acabamentos e Renovação', nome:'Pavimento SPC Artens Extrem Zaragoza Nat 340', preco:35.4, unid:'m²', quando:'Pavimento flutuante SPC — colocar sempre sobre base de cortiça.', lista:'Remodelação Geral', url:'' },
  { ref:'91424759', familia:'Acabamentos e Renovação', nome:'Rodapé Artens H2O ARB 80×15×2200 Branco 5pack', preco:28.99, unid:'pack', quando:'Rodapé hidro-resistente — zonas com humidade ou limpeza frequente.', lista:'Remodelação Geral', url:'' },
  { ref:'85063532', familia:'Acabamentos e Renovação', nome:'Primário Fachada Luxens Branco 15L', preco:59.99, unid:'lt', quando:'Primário antes de pintar paredes novas de pladur — evita manchas.', lista:'Remodelação Geral', url:'' },
  { ref:'18725826', familia:'Acabamentos e Renovação', nome:'Tinta Parede Mate Branco Fácil Rob 15L', preco:78.99, unid:'lt', quando:'Tinta interior mate branco — salas, quartos e cozinha.', lista:'Remodelação Geral', url:'' },
  { ref:'16002126', familia:'Vedação e Selagem', nome:'Silicone Cozinha&WC UHU 280ml Branco', preco:5.29, unid:'un', quando:'Junta tampo-parede e remates em cozinha — usar sempre stop mofo.', lista:'Instalação Cozinha', url:'' },
  { ref:'16002133', familia:'Vedação e Selagem', nome:'Silicone Cozinha&WC UHU 280ml Transparente', preco:5.29, unid:'un', quando:'Junta lava-louça/tampo — transparente quando a junta é visível.', lista:'Instalação Cozinha', url:'' },
  { ref:'14871185', familia:'Vedação e Selagem', nome:'Cola e Veda T-Rex Cristal 290ml Transparente', preco:10.99, unid:'un', quando:'Colagem de lavatório, espelho ou tampo em pedra natural.', lista:'Instalação Cozinha', url:'https://www.leroymerlin.pt/produtos/cola-e-veda-t-rex-cristal-290ml-14871185.html' },
  { ref:'82201489', familia:'Vedação e Selagem', nome:'Cola Sikaflex 118 Extreme Grab 290ml', preco:9.99, unid:'un', quando:'Fixação de materiais pesados — revestimentos PVC e rodapés.', lista:'Remodelação Geral', url:'' },
  { ref:'13731256', familia:'Vedação e Selagem', nome:'Cola Montagem Tudo Montak Express 450g', preco:7.89, unid:'un', quando:'Cola de montagem geral — painéis, rodapés e acessórios.', lista:'Remodelação Geral', url:'' },
  { ref:'15765806', familia:'Vedação e Selagem', nome:'Fita Alumínio 50mm×10m Sanitop', preco:1.45, unid:'un', quando:'Selagem de juntas em tubagens — cozinha e WC.', lista:'Remodelação Geral', url:'' },
  { ref:'19945961', familia:'Fixação e Estrutura', nome:'25 Buchas Mult 8×40mm+PFS Duopower', preco:5.99, unid:'cx', quando:'Fixação robusta em parede — universal tijolo/betão/pladur.', lista:'Instalação Cozinha', url:'' },
  { ref:'81933022', familia:'Fixação e Estrutura', nome:'50 Buchas+Parafusos Multimat D8×50mm', preco:5.49, unid:'cx', quando:'Fixação em parede de tijolo ou betão — uso geral.', lista:'Instalação Cozinha', url:'' },
  { ref:'14675976', familia:'Fixação e Estrutura', nome:'200 Parafusos CP Pozi Bicrom 3,5×30mm SPAX', preco:7.69, unid:'cx', quando:'Fixação de módulos de cozinha e roupeiro entre si.', lista:'Instalação Cozinha', url:'' },
  { ref:'14676431', familia:'Fixação e Estrutura', nome:'100 Parafusos CP Pozi Bicrom 3,5×16mm SPAX', preco:4.99, unid:'cx', quando:'Fixação interna de painéis e fundos de módulos.', lista:'Instalação Cozinha', url:'' },
  { ref:'79783074', familia:'Fixação e Estrutura', nome:'Esquadro Angular Inox 40×15×2mm', preco:1.09, unid:'un', quando:'Reforço de cantos de módulos ou painéis — uso discreto.', lista:'Instalação Cozinha', url:'' },
  { ref:'84851047', familia:'Fixação e Estrutura', nome:'10 Abraçadeiras para Tubo Multic EQT 16', preco:0.91, unid:'cx', quando:'Fixação de tubagem eléctrica anelada D16/20 à parede.', lista:'Remodelação Geral', url:'' },
  { ref:'87978117', familia:'Iluminação', nome:'Fita LED Cutflexi Reg 1000lm 5m Inspiro', preco:45.69, unid:'un', quando:'Iluminação de trabalho em cozinha — instalar sob móveis superiores.', lista:'Instalação Cozinha', url:'' },
  { ref:'84846308', familia:'Iluminação', nome:'Foco SPF IP44 Sanoal 2000lm 6000K Branco Inspiro', preco:26.99, unid:'un', quando:'Foco embutido IP44 — adequado para WC, cozinha e teto pladur.', lista:'Remodelação Geral', url:'' },
  { ref:'84845486', familia:'Iluminação', nome:'Painel LED Gdansk 1800lm 30×30 Branco Inspiro', preco:40.59, unid:'un', quando:'Painel LED 30×30 — corredor ou espaço pequeno.', lista:'Remodelação Geral', url:'' },
  { ref:'84845491', familia:'Iluminação', nome:'Painel LED Gdansk 5400lm 30×120 Branco Inspiro', preco:74.09, unid:'un', quando:'Painel LED 30×120 — cozinha ou sala comprida.', lista:'Remodelação Geral', url:'' },
  { ref:'84845508', familia:'Iluminação', nome:'Painel LED Gdansk 4000lm 60×60 Enki Inspiro', preco:93.39, unid:'un', quando:'Painel LED 60×60 — instalação embutida em teto de pladur.', lista:'Remodelação Geral', url:'' },
  { ref:'81868524', familia:'Iluminação', nome:'Espelho Push 80×80 Bluetooth/Altifalante c/Luz', preco:98.99, unid:'un', quando:'Espelho inteligente c/ luz — WC principal.', lista:'Remodelação WC', url:'' },
  { ref:'16635311', familia:'Instalação Elétrica', nome:'Caixa Aparelhagem Redonda p/Pladur 65×40 PP', preco:6.49, unid:'un', quando:'Caixa de encastre para tomadas em pladur — obrigatória.', lista:'Remodelação Geral', url:'' },
  { ref:'86295204', familia:'Instalação Elétrica', nome:'Tubo Anelado 320 C-Guia 20 NG R100', preco:18.89, unid:'un', quando:'Tubo corrugado para passagem de fios — protecção obrigatória.', lista:'Remodelação Geral', url:'' },
  { ref:'83147165', familia:'Instalação Elétrica', nome:'Pack 5 Tomadas 2P+T Lika Branco', preco:7.35, unid:'pack', quando:'Tomadas acabamento Lika branco — corresponder ao interruptor.', lista:'Remodelação Geral', url:'' },
  { ref:'83147166', familia:'Instalação Elétrica', nome:'Pack 5 Comutadores Lika Branco', preco:7.35, unid:'pack', quando:'Comutadores para escadas ou corredores com 2 pontos de comando.', lista:'Remodelação Geral', url:'' },
  { ref:'82658642', familia:'Instalação Elétrica', nome:'Cabo Int. 50m Cat6A U/FTP FC-E Lexman', preco:43.69, unid:'un', quando:'Cabo de rede Cat6A — instalação de rede ethernet nova.', lista:'Remodelação Geral', url:'' },
  { ref:'82658665', familia:'Instalação Elétrica', nome:'Cabo TV 100m 17VATC FC-E Lexman', preco:26.59, unid:'un', quando:'Cabo coaxial TV — instalação nova de antena.', lista:'Remodelação Geral', url:'' },
  { ref:'84388225', familia:'Instalação Elétrica', nome:'Tomada RJ45 Cat6E UTP Branca Miluz-Schneider', preco:9.09, unid:'un', quando:'Tomada de rede internet — face final visível.', lista:'Remodelação Geral', url:'' },
  { ref:'82976409', familia:'Instalação Elétrica', nome:'Kit Painel ATI M2 Régua 6 Saídas 6PC', preco:209.0, unid:'un', quando:'Central de distribuição TV/dados — instalar em armário técnico.', lista:'Remodelação Geral', url:'' },
  { ref:'14550865', familia:'Instalação Elétrica', nome:'Interruptor Diferencial 2P 30mA AC Hager 25A', preco:29.89, unid:'un', quando:'Diferencial 30mA — protecção geral obrigatória no quadro.', lista:'Remodelação Geral', url:'' },
  { ref:'14551320', familia:'Instalação Elétrica', nome:'Disjuntor 1P 3kA C Hager 16A', preco:2.19, unid:'un', quando:'Disjuntor 16A — circuito de tomadas (2,5mm²).', lista:'Remodelação Geral', url:'' },
  { ref:'14551313', familia:'Instalação Elétrica', nome:'Disjuntor 1P 3kA C Hager 10A', preco:2.19, unid:'un', quando:'Disjuntor 10A — circuito de iluminação (1,5mm²).', lista:'Remodelação Geral', url:'' },
  { ref:'17596292', familia:'Instalação Elétrica', nome:'Fio H07 VU 2,5 Azul 100m Revi', preco:32.49, unid:'un', quando:'Fio 2,5mm² azul — fase circuito tomadas.', lista:'Remodelação Geral', url:'' },
  { ref:'17596271', familia:'Instalação Elétrica', nome:'Fio H07 VU 2,5 Castanho 100m Revi', preco:32.49, unid:'un', quando:'Fio 2,5mm² castanho — neutro circuito tomadas.', lista:'Remodelação Geral', url:'' },
  { ref:'17596285', familia:'Instalação Elétrica', nome:'Fio H07 VU 2,5 Verde/Amarelo 100m Revi', preco:32.49, unid:'un', quando:'Fio 2,5mm² verde/amarelo — terra circuito tomadas.', lista:'Remodelação Geral', url:'' },
  { ref:'17596243', familia:'Instalação Elétrica', nome:'Fio H07 VU 1,5 Azul 100m Revi', preco:20.99, unid:'un', quando:'Fio 1,5mm² azul — fase circuito iluminação.', lista:'Remodelação Geral', url:'' },
  { ref:'17596264', familia:'Instalação Elétrica', nome:'Fio H07 VU 1,5 Castanho 100m Revi', preco:20.99, unid:'un', quando:'Fio 1,5mm² castanho — neutro circuito iluminação.', lista:'Remodelação Geral', url:'' },
  { ref:'17596201', familia:'Instalação Elétrica', nome:'Fio H07 VU 1,5 Verde/Amarelo 100m Revi', preco:20.99, unid:'un', quando:'Fio 1,5mm² verde/amarelo — terra circuito iluminação.', lista:'Remodelação Geral', url:'' },
  { ref:'88899425', familia:'Instalação Elétrica', nome:'100 Ligadores Rápidos Wago 4 Cond', preco:24.39, unid:'cx', quando:'Ligadores Wago — caixas de derivação e emendas seguras.', lista:'Remodelação Geral', url:'' },
  { ref:'16642325', familia:'Instalação Elétrica', nome:'Quadro Saliente Gama S TEV2 18 módulos', preco:28.99, unid:'un', quando:'Quadro eléctrico 18 módulos — substituição completa.', lista:'Remodelação Geral', url:'' },
  { ref:'86471345', familia:'Instalação Elétrica', nome:'4 Conectores Ethernet+Mangas Cat6 RJ45 Lexman', preco:1.29, unid:'cx', quando:'Conectores RJ45 — terminação de cabos ethernet.', lista:'Remodelação Geral', url:'' },
  { ref:'80129468', familia:'Ferragens e Acessórios', nome:'Lote 2 Dobradiças 110º c/ Amortecedor c/ Bucha', preco:9.89, unid:'lt', quando:'Dobradiça standard cozinha — obrigatório com amortecedor.', lista:'Instalação Cozinha', url:'' },
  { ref:'84335799', familia:'Ferragens e Acessórios', nome:'4 Puxadores Inspire Oslo 96mm NQ Escov Bril', preco:11.99, unid:'lt', quando:'Puxador para portas de cozinha — passo 96mm standard.', lista:'Instalação Cozinha', url:'' },
  { ref:'19166133', familia:'Ferragens e Acessórios', nome:'Puxador Roseta Tupai Skin 2002 Inox Satinado', preco:9.99, unid:'un', quando:'Puxador roseta para portas interiores — fixação na folha.', lista:'Remodelação Geral', url:'' },
  { ref:'956663',   familia:'Ferragens e Acessórios', nome:'Lote 2 Sistema Push Open para Porta Branco Di', preco:11.99, unid:'lt', quando:'Push open — porta sem puxador visível (toque para abrir).', lista:'Instalação Cozinha', url:'' },
  { ref:'923439',   familia:'Ferragens e Acessórios', nome:'Sistema Elevatório Compacto Básico', preco:16.99, unid:'un', quando:'Porta horizontal elevatória de cozinha — mecanismo básico.', lista:'Instalação Cozinha', url:'' },
  { ref:'15293075', familia:'Ferragens e Acessórios', nome:'Grelha Ventilação Forno Inox 60×12,5', preco:20.99, unid:'un', quando:'Grelha de ventilação obrigatória no módulo de forno encastre.', lista:'Instalação Cozinha', url:'' },
  { ref:'956902',   familia:'Ferragens e Acessórios', nome:'Kit Suporte para Forno Branco', preco:10.99, unid:'un', quando:'Suporte de forno encastre — fixação ao módulo coluna.', lista:'Instalação Cozinha', url:'' },
  { ref:'940507',   familia:'Ferragens e Acessórios', nome:'Lote 10 Abraçadeiras para Rodapé PVC', preco:5.29, unid:'lt', quando:'Abraçadeiras de fixação do rodapé de cozinha ao chão.', lista:'Instalação Cozinha', url:'' },
  { ref:'82764045', familia:'Ferragens e Acessórios', nome:'União Multi-Angular 100mm 810', preco:5.29, unid:'un', quando:'União angular para tubo de extracção do exaustor — 100mm.', lista:'Instalação Cozinha', url:'' },
  { ref:'82658450', familia:'Ferragens e Acessórios', nome:'2 Prateleiras Spaceo 80×30cm Aço Branco', preco:31.99, unid:'lt', quando:'Prateleiras dispensa — sistema ajustável em cremalheira.', lista:'Remodelação Geral', url:'' },
  { ref:'82658443', familia:'Ferragens e Acessórios', nome:'10 Poleias Simples Spaceo 30cm Branco', preco:19.99, unid:'lt', quando:'Poleias dispensa — montagem em cremalheira Spaceo.', lista:'Remodelação Geral', url:'' },
  { ref:'82658422', familia:'Ferragens e Acessórios', nome:'Cremalheira Simples Spaceo 2m Branco', preco:6.49, unid:'un', quando:'Cremalheira para sistema de poleias da dispensa.', lista:'Remodelação Geral', url:'' },
  { ref:'84600969', familia:'Ferragens e Acessórios', nome:"Módulo Spaceo Evo'm 230,4×60×54cm Branco", preco:98.29, unid:'un', quando:"Módulo base roupeiro Spaceo Evo'm.", lista:'Instalação Roupeiro', url:'' },
  { ref:'84600992', familia:'Ferragens e Acessórios', nome:"4 Painéis Porta Correr 230,4×60 Branco Spaceo Evo'm", preco:42.99, unid:'un', quando:'Painel porta correr roupeiro — 1 painel por vão.', lista:'Instalação Roupeiro', url:'' },
  { ref:'90201815', familia:'Ferragens e Acessórios', nome:"Kit Rail Porta Evo'm L180 Softclose", preco:114.0, unid:'un', quando:'Rail softclose L180 — roupeiro 3 portas correr.', lista:'Instalação Roupeiro', url:'' },
  { ref:'90201814', familia:'Ferragens e Acessórios', nome:"Kit Rail Porta Evo'm L120 Softclose", preco:96.99, unid:'un', quando:'Rail softclose L120 — roupeiro 2 portas correr.', lista:'Instalação Roupeiro', url:'' },
  { ref:'84990340', familia:'Ferragens e Acessórios', nome:"Kit Barra Roupeiro + Sup Evo'm 60cm Preto", preco:6.09, unid:'un', quando:'Barra de cabides interior roupeiro.', lista:'Instalação Roupeiro', url:'' },
  { ref:'84600845', familia:'Ferragens e Acessórios', nome:"Estrutura Gaveta Spaceo Evo'm 25,6×60×54cm Branco", preco:26.09, unid:'un', quando:'Caixa de gaveta interior roupeiro.', lista:'Instalação Roupeiro', url:'' },
  { ref:'84601011', familia:'Ferragens e Acessórios', nome:"Frente Gaveta Interior Spaceo Evo'm 22,5×60cm Branco", preco:6.49, unid:'un', quando:'Frente de gaveta interior roupeiro.', lista:'Instalação Roupeiro', url:'' },
  { ref:'86365093', familia:'Ferragens e Acessórios', nome:"Kit Puxador Perfil p/3 Portas 230,4cm Evo'm Cinza", preco:77.99, unid:'un', quando:'Puxador perfil roupeiro 3 portas.', lista:'Instalação Roupeiro', url:'' },
  { ref:'86365092', familia:'Ferragens e Acessórios', nome:"Kit Puxador Perfil p/2 Portas 230,4cm Evo'm Cinza", preco:58.99, unid:'un', quando:'Puxador perfil roupeiro 2 portas.', lista:'Instalação Roupeiro', url:'' },
  { ref:'84600802', familia:'Ferragens e Acessórios', nome:"Pack 2 Prateleiras Spaceo Evo'm 60×54cm Branco", preco:24.0, unid:'pack', quando:"Prateleiras interior roupeiro Spaceo Evo'm.", lista:'Instalação Roupeiro', url:'' },
  { ref:'94024247', familia:'Ferragens e Acessórios', nome:'Revestimento PVC Shine Inspiro 75×45cm', preco:73.14, unid:'un', quando:'Revestimento PVC decorativo parede WC — zona seca acima dos mosaicos.', lista:'Remodelação WC', url:'' },
  { ref:'94024248', familia:'Ferragens e Acessórios', nome:'Revestimento PVC Twilight Inspiro 75×45cm', preco:73.14, unid:'un', quando:'Revestimento PVC decorativo — variante mais escura.', lista:'Remodelação WC', url:'' },
  { ref:'83518405', familia:'WC / Sanitários', nome:'Lavatório Lupi 81×46 Centro Branco BLH Gelcoat', preco:129.0, unid:'un', quando:'Lavatório sobre móvel 81×46cm — balcão de WC principal.', lista:'Remodelação WC', url:'' },
  { ref:'17729271', familia:'WC / Sanitários', nome:'Móvel Armário CH Zeus/Play 40×32×180 2G2P Branco', preco:189.0, unid:'un', quando:'Coluna WC 40cm com 2 gavetas e 2 portas — arrumação lateral.', lista:'Remodelação WC', url:'' },
  { ref:'17729306', familia:'WC / Sanitários', nome:'Móvel Cesto CH Zeus/Play 40×32×180 Branco', preco:149.0, unid:'un', quando:'Coluna WC 40cm com cesto aberto — toalhas e produtos.', lista:'Remodelação WC', url:'' },
  { ref:'86510135', familia:'WC / Sanitários', nome:'Móvel CH Luca 80×45×84 2G/1P Branco', preco:319.0, unid:'un', quando:'Móvel lavatório 80cm 2 gavetas — principal do WC.', lista:'Remodelação WC', url:'' },
  { ref:'91329343', familia:'Lava-Louça e Torneiras', nome:'Lava-Louça 1C 51×44×20cm Loft Inox', preco:91.99, unid:'un', quando:'Lava-louça inox 1 cuba encastrar em tampo — rebaixo ou à face.', lista:'Instalação Cozinha', url:'' },
  { ref:'16353603', familia:'Ferragens e Acessórios', nome:'Régua 600mm p/Forno 560', preco:9.89, unid:'un', quando:'Régua de nivelamento para módulo de forno 560mm — usar quando o módulo inferior não tem profundidade standard.', lista:'Instalação Cozinha', url:'' },
  { ref:'81934117', familia:'Ferragens e Acessórios', nome:'Régua Ref Móv 800 Forno 760mm', preco:13.99, unid:'un', quando:'Régua de referência para módulo de forno 760mm — garante nivelamento correcto do forno na coluna.', lista:'Instalação Cozinha', url:'' },
  { ref:'19276894', familia:'Vedação e Selagem', nome:'Adesivo Dumafix 290ml Dumawall', preco:10.99, unid:'un', quando:'Colagem de painéis Dumawall/Dumaplast em paredes — usar em vez de silicone para painéis PVC de revestimento.', lista:'Instalação Cozinha', url:'' },
  { ref:'86904474', familia:'Ferramentas e Consumíveis', nome:'Fita Pintor Multisup Dexter 50m×48mm', preco:2.49, unid:'un', quando:'Protecção de superfícies durante instalação — mascarar tampos, eletros e paredes antes de silicone ou pintura.', lista:'Instalação Cozinha', url:'' },
  { ref:'84299215', familia:'Fixação e Estrutura', nome:'Tubo Flexível Alumínio D120 C35 a 200cm', preco:7.39, unid:'un', quando:'Ligação do exaustor à saída de ar — tubo extensível até 200cm para alcançar a chaminé.', lista:'Instalação Cozinha', url:'' },
  { ref:'81995522', familia:'Ferragens e Acessórios', nome:'Rolo Protecção Gaveta/Móv Cinza 150×50 Delinia', preco:4.29, unid:'rolo', quando:'Forro de gavetas e prateleiras de cozinha — protecção e acabamento interior dos módulos.', lista:'Instalação Cozinha', url:'' },
  { ref:'82151451', familia:'Fixação e Estrutura', nome:'Esquadro Angular 40×40mm Zincado', preco:0.49, unid:'un', quando:'Reforço de junções entre módulos de cozinha — mais robusto que os esquadros 30×30mm para módulos pesados.', lista:'Instalação Cozinha', url:'' },
  { ref:'91779055', familia:'Lava-Louça e Torneiras', nome:'Sifão Plástico EQT 1/2 1/4 Extens 32/40', preco:6.09, unid:'un', quando:'Sifão de lava-louça extensível — usar quando a saída de esgotos é mais afastada que o standard.', lista:'Instalação Cozinha', url:'' },
  { ref:'91779105', familia:'Lava-Louça e Torneiras', nome:'Tubo Extensível 1.1/2 40-50mm Branco KC', preco:1.69, unid:'un', quando:'Extensão de sifão 40-50mm — para ajustar a distância entre sifão e saída de esgoto na parede.', lista:'Instalação Cozinha', url:'' },
  { ref:'87210143', familia:'Carpintaria e Caixilharia', nome:'Porta Blindada Lisa 80×200cm Inox Esq', preco:399.0, unid:'un', quando:'Porta blindada 80cm abertura esquerda — substituição porta entrada.', lista:'Remodelação Geral', url:'' },
];

// Famílias com ícone e cor
export const MAT_FAMILIAS = {
  'Material PRO':              { icon:'🏗', cor:'#7A3A2A', bg:'rgba(122,58,42,.12)' },
  'Acabamentos e Renovação':   { icon:'🎨', cor:'#3A7A44', bg:'rgba(58,122,68,.12)' },
  'Vedação e Selagem':         { icon:'🔵', cor:'#2A6B7A', bg:'rgba(42,107,122,.12)' },
  'Fixação e Estrutura':       { icon:'🔩', cor:'#C4612A', bg:'rgba(196,97,42,.12)' },
  'Iluminação':                { icon:'💡', cor:'#8B6914', bg:'rgba(139,105,20,.12)' },
  'Instalação Elétrica':       { icon:'⚡', cor:'#2A5A9A', bg:'rgba(42,90,154,.12)' },
  'Ferragens e Acessórios':    { icon:'🔧', cor:'#6B4FC4', bg:'rgba(107,79,196,.12)' },
  'Lava-Louça e Torneiras':    { icon:'🚰', cor:'#2A5A9A', bg:'rgba(42,90,154,.12)' },
  'WC / Sanitários':           { icon:'🚿', cor:'#2A6B7A', bg:'rgba(42,107,122,.12)' },
  'Carpintaria e Caixilharia': { icon:'🚪', cor:'#7A5A3A', bg:'rgba(122,90,58,.12)' },
  'Cozinha / Móveis':          { icon:'🪑', cor:'#C4612A', bg:'rgba(196,97,42,.12)' },
};

// ════════════════════════════════════════════════
// ESTADO DO MÓDULO
// ════════════════════════════════════════════════
const MS = {
  pesquisa:      '',
  familiaFiltro: 'todas',
  detalheRef:    null,
  orc:           [],      // [{ ref, nome, familia, preco, unid, qty }]
  orcAberto:     false,
};

// ════════════════════════════════════════════════
// FIREBASE — overrides (adições/edições directas)
// ════════════════════════════════════════════════
const COL_MAT = 'wk_materiais_overrides';
let _overrides = {};

export async function matCarregar() {
  const db = getDb(); if (!db) return;
  try {
    const snap = await getDocs(collection(db, COL_MAT));
    snap.forEach(d => { _overrides[d.id] = d.data(); });
    // Aplicar overrides ao DB em memória
    _overrides && Object.entries(_overrides).forEach(([ref, dados]) => {
      const idx = MATERIAIS_DB.findIndex(a => a.ref === ref);
      if (idx >= 0) {
        Object.assign(MATERIAIS_DB[idx], dados);
      } else if (dados._novo) {
        // Artigo novo adicionado directamente na app
        MATERIAIS_DB.push({ ref, ...dados });
      }
    });
  } catch(e) {
    const code = e?.code || '';
    if (code === 'permission-denied') {
      toast('🔒 Materiais: sem permissão — adiciona wk_materiais_overrides às Firestore Rules');
    }
    console.warn('materiais: carregar overrides', e);
  }
}

async function matGuardar(ref, dados) {
  // Nota: matGuardarModal chama o Firestore directamente para poder
  // controlar o fluxo (não fechar modal se falhar).
  // Esta função interna mantém-se para uso futuro / imports externos.
  _overrides[ref] = dados;
  const idx = MATERIAIS_DB.findIndex(a => a.ref === ref);
  if (idx >= 0) Object.assign(MATERIAIS_DB[idx], dados);
  else MATERIAIS_DB.push({ ref, ...dados });
  const db = getDb(); if (!db) return;
  try {
    await setDoc(doc(db, COL_MAT, ref), dados);
  } catch(e) {
    toast('⚠️ Erro ao guardar material: ' + (e?.code || e?.message || ''));
    console.warn('materiais: guardar', e);
    throw e; // FIX: re-lançar para que o chamador possa tratar o erro
  }
}

async function matApagar(ref) {
  delete _overrides[ref];
  const idx = MATERIAIS_DB.findIndex(a => a.ref === ref);
  if (idx >= 0) MATERIAIS_DB.splice(idx, 1);
  const db = getDb(); if (!db) return;
  try { await deleteDoc(doc(db, COL_MAT, ref)); } catch(e) {}
}

// ════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════
function artigos_filtrados() {
  const pesq = MS.pesquisa.toLowerCase().trim();
  return MATERIAIS_DB.filter(a => {
    const matchFam = MS.familiaFiltro === 'todas' || a.familia === MS.familiaFiltro;
    if (!matchFam) return false;
    if (!pesq) return true;
    return a.nome.toLowerCase().includes(pesq)
      || a.ref.includes(pesq)
      || (a.quando || '').toLowerCase().includes(pesq)
      || (a.familia || '').toLowerCase().includes(pesq);
  });
}

function fam_info(f) {
  return MAT_FAMILIAS[f] || { icon: '📦', cor: '#6A6A7A', bg: 'rgba(106,106,122,.12)' };
}

// ════════════════════════════════════════════════
// RENDER PRINCIPAL
// ════════════════════════════════════════════════
export function matInit() {
  // Só renderiza o header completo uma vez (contém o input de pesquisa)
  const h = document.getElementById('mat-header');
  if (h && !document.getElementById('mat-pesquisa')) {
    renderMatHeader();
  }
  renderMatChips();
  renderMatGrid();
}

function renderMatHeader() {
  const h = document.getElementById('mat-header');
  if (!h) return;
  h.innerHTML = `
    <div class="page-header page-header-flex" style="margin-bottom:12px">
      <div>
        <div class="page-titulo">Materiais</div>
        <div class="page-sub">${MATERIAIS_DB.length} artigos · ${Object.keys(MAT_FAMILIAS).length} famílias</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn-sec" onclick="window.matToggleOrc()">
          🧾 Orçamento <span id="mat-orc-badge" style="display:none" class="badge-pill"></span>
        </button>
        <button class="btn-pri" onclick="window.matAbrirNovo()">+ Novo Artigo</button>
      </div>
    </div>
    <div class="search-wrap" style="margin-bottom:14px">
      <span class="search-icon">⌕</span>
      <input type="text" id="mat-pesquisa" class="search-input"
        placeholder="Pesquisar por nome, referência LM ou 'quando usar'…"
        oninput="window.matPesquisar(this.value)">
      <button id="mat-pesq-clear" onclick="window.matPesquisar('')"
        style="display:none;position:absolute;right:10px;top:50%;transform:translateY(-50%);
        background:none;border:none;color:var(--t4);font-size:15px;cursor:pointer">×</button>
    </div>
    <div id="mat-chips"></div>
    <div id="mat-info" style="font-size:10px;color:var(--t4);margin-bottom:10px"></div>`;
}

function renderMatChips() {
  const chips = document.getElementById('mat-chips');
  const info  = document.getElementById('mat-info');
  const clear = document.getElementById('mat-pesq-clear');
  if (!chips) return;

  if (clear) clear.style.display = MS.pesquisa ? 'block' : 'none';

  const familias = ['todas', ...Object.keys(MAT_FAMILIAS)];
  const total    = MATERIAIS_DB.length;
  const filtrado = artigos_filtrados().length;

  // Dropdown de família + contador de resultados
  const fi_sel = MS.familiaFiltro === 'todas'
    ? { icon:'🗂', cor:'#C4612A' }
    : fam_info(MS.familiaFiltro);

  chips.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px">
      <div style="position:relative;flex:1;min-width:200px;max-width:320px">
        <select id="mat-familia-sel"
          onchange="window.matFiltrarFamilia(this.value)"
          style="width:100%;padding:8px 32px 8px 12px;border-radius:9px;
            background:rgba(255,255,255,.05);border:1px solid rgba(196,97,42,.3);
            color:var(--t2);font-family:var(--sans);font-size:12px;font-weight:600;
            cursor:pointer;outline:none;appearance:none;-webkit-appearance:none;
            background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,.3)'/%3E%3C/svg%3E\");
            background-repeat:no-repeat;background-position:right 10px center">
          ${familias.map(f => {
            const n = f === 'todas' ? total : MATERIAIS_DB.filter(a => a.familia === f).length;
            const fi2 = f === 'todas' ? { icon:'🗂' } : fam_info(f);
            return `<option value="${f}" ${MS.familiaFiltro === f ? 'selected' : ''}>
              ${fi2.icon} ${f === 'todas' ? 'Todas as famílias' : f} (${n})
            </option>`;
          }).join('')}
        </select>
      </div>
    </div>`;

  if (info) info.textContent = filtrado + ' artigo' + (filtrado !== 1 ? 's' : '') +
    (MS.pesquisa || MS.familiaFiltro !== 'todas' ? ' encontrado' + (filtrado !== 1 ? 's' : '') : '');
}


function renderMatGrid() {
  const g = document.getElementById('mat-grid');
  if (!g) return;

  const lista = artigos_filtrados();

  if (!lista.length) {
    g.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:var(--t4)">
        <div style="font-size:32px;margin-bottom:12px">📦</div>
        <div style="font-size:13px">Nenhum artigo encontrado</div>
        ${MS.pesquisa ? `<div style="font-size:11px;margin-top:6px">Tenta outros termos ou <button onclick="window.matPesquisar('')" style="background:none;border:none;color:var(--peach-dark);cursor:pointer;font-size:11px;padding:0">limpa a pesquisa</button></div>` : ''}
      </div>`;
    return;
  }

  // Agrupar por família se não há filtro de família activo
  const agrupar = MS.familiaFiltro === 'todas' && !MS.pesquisa;

  if (agrupar) {
    // Render agrupado por família
    const por_fam = {};
    lista.forEach(a => {
      if (!por_fam[a.familia]) por_fam[a.familia] = [];
      por_fam[a.familia].push(a);
    });

    g.innerHTML = Object.entries(por_fam).map(([fam, artigos]) => {
      const fi = fam_info(fam);
      return `
        <div style="margin-bottom:24px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;
            padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,.07)">
            <span style="font-size:14px">${fi.icon}</span>
            <span style="font-family:var(--serif);font-size:16px;color:${fi.cor}">${fam}</span>
            <span style="font-size:10px;color:var(--t4)">${artigos.length} artigo${artigos.length !== 1 ? 's' : ''}</span>
          </div>
          <div class="mat-grid-inner">
            ${artigos.map(a => renderCardMat(a)).join('')}
          </div>
        </div>`;
    }).join('');
  } else {
    g.innerHTML = `<div class="mat-grid-inner">${lista.map(a => renderCardMat(a)).join('')}</div>`;
  }
}

function renderCardMat(a) {
  const fi      = fam_info(a.familia);
  const aberto  = MS.detalheRef === a.ref;
  const quando  = a.quando || '';
  const longo   = quando.length > 90;

  return `
    <div class="mat-card ${aberto ? 'mat-card-aberto' : ''}"
      style="${aberto ? `border-color:${fi.cor}55;` : ''}">

      <!-- Topo: família + link -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;
          padding:2px 8px;border-radius:99px;background:${fi.bg};color:${fi.cor};border:1px solid ${fi.cor}22">
          ${fi.icon} ${a.familia}
        </span>
        ${a.url ? `
        <a href="${a.url}" target="_blank" rel="noopener"
          style="width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center;
          background:rgba(196,97,42,.1);border:1px solid rgba(196,97,42,.2);
          color:rgba(255,190,152,.7);font-size:11px;text-decoration:none;flex-shrink:0">↗</a>` : ''}
      </div>

      <!-- Nome -->
      <div style="font-size:12px;font-weight:600;color:var(--t1);line-height:1.35;margin-bottom:4px">${a.nome}</div>

      <!-- Ref -->
      <div style="display:flex;align-items:center;gap:5px;margin-bottom:8px">
        <span style="font-family:var(--mono);font-size:10px;color:var(--peach-dark);font-weight:700">${a.ref}</span>
        <button onclick="window.copiarTexto('${a.ref}',this)"
          style="padding:1px 5px;border-radius:4px;background:rgba(196,97,42,.08);
          border:1px solid rgba(196,97,42,.18);color:var(--t4);font-size:9px;cursor:pointer">⎘</button>
        ${a.preco ? `<span style="font-family:var(--mono);font-size:11px;font-weight:700;color:var(--t2);margin-left:auto">${fmt(a.preco)}</span>` : ''}
      </div>

      <!-- Quando usar -->
      ${quando ? `
      <div style="border-top:1px solid rgba(255,255,255,.05);padding-top:7px">
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;
          color:${fi.cor};opacity:.6;margin-bottom:4px">Quando usar</div>
        <div id="mat-quando-${a.ref}" style="font-size:10px;color:var(--t3);line-height:1.6;
          font-style:italic;${longo && !aberto ? 'overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical' : ''}">
          ${quando}
        </div>
        ${longo ? `
        <button onclick="window.matToggleDetalhe('${a.ref}')"
          style="margin-top:4px;padding:0;background:none;border:none;font-size:9px;
          color:${fi.cor};opacity:.7;cursor:pointer;font-family:var(--sans);font-weight:700">
          ${aberto ? '▴ fechar' : '▾ ver mais'}
        </button>` : ''}
      </div>` : ''}

      <!-- Rodapé: lista + acções -->
      <div style="display:flex;align-items:center;justify-content:space-between;
        margin-top:8px;padding-top:7px;border-top:1px solid rgba(255,255,255,.05)">
        ${a.lista ? `
        <span style="font-size:9px;padding:2px 7px;border-radius:99px;
          background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.09);color:var(--t4)">
          ${a.lista}
        </span>` : '<span></span>'}
        <div style="display:flex;gap:4px">
          <button onclick="window.matOrcToggle('${a.ref}')"
            style="padding:3px 10px;border-radius:6px;font-family:var(--sans);font-size:10px;
            font-weight:700;cursor:pointer;transition:all .15s;
            ${MS.orc.some(x=>x.ref===a.ref)
              ? 'background:rgba(58,122,68,.15);border:1px solid rgba(58,122,68,.3);color:rgba(120,220,120,.7)'
              : 'background:rgba(196,97,42,.1);border:1px solid rgba(196,97,42,.25);color:rgba(255,190,152,.7)'
            }">
            ${MS.orc.some(x=>x.ref===a.ref) ? '✓ No Orc.' : '+ Orçamento'}
          </button>
          <button onclick="window.matEditar('${a.ref}')"
            style="padding:3px 8px;border-radius:6px;background:rgba(255,255,255,.05);
            border:1px solid rgba(255,255,255,.09);color:var(--t4);font-size:10px;cursor:pointer;
            transition:all .15s" title="Editar">✎</button>
          <button onclick="window.matConfirmarApagar('${a.ref}')"
            style="padding:3px 8px;border-radius:6px;background:rgba(192,57,43,.08);
            border:1px solid rgba(192,57,43,.15);color:rgba(255,150,140,.4);font-size:10px;
            cursor:pointer;transition:all .15s" title="Apagar">×</button>
        </div>
      </div>
    </div>`;
}

// ════════════════════════════════════════════════
// MODAL EDIÇÃO / NOVO ARTIGO
// ════════════════════════════════════════════════
function abrirModal(artigo) {
  document.getElementById('mat-modal')?.remove();

  const isNovo = !artigo;
  const a      = artigo || { ref:'', familia:'Fixação e Estrutura', nome:'', preco:'', unid:'un', quando:'', lista:'', url:'' };
  const familias = Object.keys(MAT_FAMILIAS);
  const unidades = ['un','cx','m²','ml','kg','lt','tb','par','rolo','pack'];
  const listas   = ['Instalação Cozinha','Remodelação WC','Instalação Roupeiro','Remodelação Geral','Geral'];

  const modal = document.createElement('div');
  modal.id = 'mat-modal';
  modal.className = 'overlay-modal open';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:520px">
      <div class="modal-header">
        <div class="modal-titulo">${isNovo ? 'Novo Artigo' : 'Editar Artigo'}</div>
        <button class="modal-close" onclick="document.getElementById('mat-modal')?.remove()">×</button>
      </div>
      <div class="modal-body">
        <div class="form-grid-2">
          <div class="form-campo full">
            <label class="form-label">Nome / Designação *</label>
            <input type="text" id="mat-f-nome" class="f-input" value="${a.nome.replace(/"/g,'&quot;')}"
              placeholder="Ex: Silicone Branco Stop Mofo Ceys 280ml">
          </div>
          <div class="form-campo">
            <label class="form-label">Referência LM *</label>
            <input type="text" id="mat-f-ref" class="f-input" value="${a.ref}"
              placeholder="Ex: 16679355" ${!isNovo ? 'readonly style="opacity:.5"' : ''}>
          </div>
          <div class="form-campo">
            <label class="form-label">Família</label>
            <select id="mat-f-familia" class="f-select">
              ${familias.map(f => `<option value="${f}" ${f === a.familia ? 'selected' : ''}>${MAT_FAMILIAS[f].icon} ${f}</option>`).join('')}
            </select>
          </div>
          <div class="form-campo">
            <label class="form-label">Preço (€)</label>
            <input type="number" id="mat-f-preco" class="f-input" value="${a.preco || ''}" step="0.01" placeholder="0,00">
          </div>
          <div class="form-campo">
            <label class="form-label">Unidade</label>
            <select id="mat-f-unid" class="f-select">
              ${unidades.map(u => `<option value="${u}" ${u === (a.unid||'un') ? 'selected' : ''}>${u}</option>`).join('')}
            </select>
          </div>
          <div class="form-campo">
            <label class="form-label">Lista Base</label>
            <select id="mat-f-lista" class="f-select">
              <option value="">—</option>
              ${listas.map(l => `<option value="${l}" ${l === a.lista ? 'selected' : ''}>${l}</option>`).join('')}
            </select>
          </div>
          <div class="form-campo full">
            <label class="form-label">Quando usar <span style="color:var(--peach-dark)">★</span></label>
            <textarea id="mat-f-quando" class="f-textarea" rows="3"
              placeholder="Ex: Usar stop mofo SEMPRE em cozinha/WC — silicone normal desenvolve fungos em 6 meses">${a.quando || ''}</textarea>
          </div>
          <div class="form-campo full">
            <label class="form-label">URL Leroy Merlin</label>
            <input type="url" id="mat-f-url" class="f-input" value="${a.url || ''}"
              placeholder="https://www.leroymerlin.pt/produtos/…">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancelar" onclick="document.getElementById('mat-modal')?.remove()">Cancelar</button>
        <button class="btn-guardar" id="mat-btn-guardar" data-ref="${a.ref}" data-novo="${isNovo}">Guardar</button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  // FIX: usar addEventListener em vez de onclick inline
  // Evita (1) isNovo chegar como string truthy "false" e
  // (2) quebras de HTML por caracteres especiais na ref/nome
  document.getElementById('mat-btn-guardar').addEventListener('click', function () {
    const ref   = this.dataset.ref;
    const isNov = this.dataset.novo === 'true'; // converte string → boolean correcto
    window.matGuardarModal(ref, isNov);
  });

  setTimeout(() => document.getElementById('mat-f-nome')?.focus(), 50);
}


// ════════════════════════════════════════════════
// ORÇAMENTO DE MATERIAIS
// ════════════════════════════════════════════════
function matAtualizarBadge() {
  const badge = document.getElementById('mat-orc-badge');
  if (badge) {
    badge.textContent = MS.orc.length || '';
    badge.style.display = MS.orc.length ? 'inline-block' : 'none';
  }
}

function renderMatOrc() {
  const painel = document.getElementById('mat-orc-painel');
  if (!painel) return;

  if (!MS.orc.length) {
    painel.innerHTML = `
      <div style="text-align:center;padding:30px 20px;color:var(--t4)">
        <div style="font-size:24px;margin-bottom:8px">🧾</div>
        <div style="font-size:12px">Sem artigos no orçamento</div>
        <div style="font-size:10px;margin-top:4px">Clica + nos cartões para adicionar</div>
      </div>`;
    return;
  }

  const total = MS.orc.reduce((s, a) => s + (a.preco || 0) * (a.qty || 1), 0);

  painel.innerHTML = `
    ${MS.orc.map((a, i) => {
      const fi = fam_info(a.familia);
      return `
      <div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,.07)">
        <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px">
          <div style="flex:1;min-width:0">
            <div style="font-size:11px;font-weight:600;color:var(--t1);line-height:1.3">${a.nome}</div>
            <div style="display:flex;align-items:center;gap:5px;margin-top:2px">
              <span style="font-family:var(--mono);font-size:9px;color:var(--peach-dark)">${a.ref}</span>
              <span style="font-size:9px;padding:1px 6px;border-radius:99px;
                background:${fi.bg};color:${fi.cor};border:1px solid ${fi.cor}22">${fi.icon} ${a.familia}</span>
            </div>
          </div>
          <button onclick="window.matOrcRemover(${i})"
            style="width:22px;height:22px;border-radius:50%;flex-shrink:0;
            background:rgba(192,57,43,.1);border:1px solid rgba(192,57,43,.2);
            color:rgba(255,150,140,.5);font-size:12px;cursor:pointer;
            display:flex;align-items:center;justify-content:center">×</button>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:5px">
            <button onclick="window.matOrcQty(${i},-1)"
              style="width:22px;height:22px;border-radius:5px;background:rgba(255,255,255,.06);
              border:1px solid rgba(255,255,255,.1);color:var(--t2);font-size:13px;cursor:pointer;
              display:flex;align-items:center;justify-content:center">−</button>
            <input type="number" min="1" value="${a.qty || 1}"
              onchange="window.matOrcQtyDirecto(${i},this.value)"
              style="width:44px;padding:3px 6px;border-radius:5px;background:rgba(255,255,255,.06);
              border:1px solid rgba(255,255,255,.1);font-family:var(--mono);font-size:13px;
              font-weight:700;color:var(--t1);text-align:center;outline:none;
              -moz-appearance:textfield;-webkit-appearance:none"
              onfocus="this.style.borderColor='rgba(196,97,42,.4)'"
              onblur="this.style.borderColor='rgba(255,255,255,.1)'">
            <button onclick="window.matOrcQty(${i},+1)"
              style="width:22px;height:22px;border-radius:5px;background:rgba(255,255,255,.06);
              border:1px solid rgba(255,255,255,.1);color:var(--t2);font-size:13px;cursor:pointer;
              display:flex;align-items:center;justify-content:center">+</button>
            <span style="font-size:10px;color:var(--t4)">× ${fmt(a.preco)}</span>
          </div>
          <span style="font-family:var(--mono);font-size:14px;font-weight:700;color:var(--t1)">
            ${fmt((a.preco || 0) * (a.qty || 1))}
          </span>
        </div>
      </div>`;
    }).join('')}

    <div style="margin-top:14px;padding:12px 0;border-top:1px solid rgba(255,255,255,.2);
      display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,190,152,.5)">
          Total Materiais
        </div>
        <div style="font-size:10px;color:var(--t4);margin-top:1px">
          ${MS.orc.length} artigo${MS.orc.length !== 1 ? 's' : ''}
        </div>
      </div>
      <span style="font-family:var(--mono);font-size:20px;font-weight:700;color:var(--peach)">
        ${fmt(total)}
      </span>
    </div>

    <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">
      <button class="btn-sec" style="width:100%" onclick="window.matOrcCopiar()">
        📋 Copiar Lista Completa
      </button>
      <button class="btn-sec" style="width:100%" onclick="window.matOrcCopiarRefs()">
        ⎘ Copiar Referências
      </button>
      <button style="width:100%;padding:7px;border-radius:8px;
        background:rgba(192,57,43,.1);border:1px solid rgba(192,57,43,.2);
        color:rgba(255,150,140,.5);font-family:var(--sans);font-size:11px;
        font-weight:600;cursor:pointer" onclick="window.matOrcLimpar()">
        × Limpar
      </button>
    </div>`;
}

// ════════════════════════════════════════════════
// WINDOW API
// ════════════════════════════════════════════════
window.matInit = matInit;

window.matPesquisar = function(v) {
  MS.pesquisa = v || '';
  // Sincronizar input se chamado programaticamente (ex: botão limpar)
  const inp = document.getElementById('mat-pesquisa');
  if (inp && inp.value !== MS.pesquisa) {
    inp.value = MS.pesquisa;
    inp.focus();
  }
  // NUNCA recriar o input — só actualizar chips e grid
  renderMatChips();
  renderMatGrid();
};

window.matFiltrarFamilia = function(f) {
  MS.familiaFiltro = f;
  renderMatChips();
  renderMatGrid();
};

window.matToggleDetalhe = function(ref) {
  MS.detalheRef = MS.detalheRef === ref ? null : ref;
  renderMatGrid();
};

window.matAbrirNovo = function() { abrirModal(null); };

window.matEditar = function(ref) {
  // FIX: usar cópia do objecto para que edições no modal não mutam o DB em memória
  // antes de o utilizador confirmar com Guardar
  const a = MATERIAIS_DB.find(x => x.ref === ref);
  if (a) abrirModal(structuredClone ? structuredClone(a) : { ...a });
};

window.matGuardarModal = async function(refOriginal, isNovo) {
  // FIX: garantir que isNovo é sempre boolean, independentemente de como chegou
  // (inline onclick passava a string "false" que é truthy em JS)
  const _isNovo = isNovo === true || isNovo === 'true';

  const nome    = document.getElementById('mat-f-nome')?.value?.trim();
  const ref     = _isNovo
    ? document.getElementById('mat-f-ref')?.value?.trim()
    : refOriginal;
  const familia = document.getElementById('mat-f-familia')?.value;
  const preco   = parseFloat(document.getElementById('mat-f-preco')?.value) || 0;
  const unid    = document.getElementById('mat-f-unid')?.value || 'un';
  const lista   = document.getElementById('mat-f-lista')?.value || '';
  const quando  = document.getElementById('mat-f-quando')?.value?.trim() || '';
  const url     = document.getElementById('mat-f-url')?.value?.trim() || '';

  if (!nome) { toast('⚠️ Nome obrigatório'); return; }
  if (!ref)  { toast('⚠️ Referência LM obrigatória'); return; }

  const dados = { ref, familia, nome, preco, unid, lista, quando, url, ...(_isNovo ? { _novo: true } : {}) };

  // FIX: só fechar o modal e mostrar toast após tentativa de guardar no Firestore
  // Assim o utilizador sabe se houve erro real, em vez de falso sucesso
  const db = getDb();
  if (db) {
    try {
      await setDoc(doc(db, COL_MAT, ref), dados);
    } catch(e) {
      const msg = e?.code === 'permission-denied'
        ? '🔒 Sem permissão para guardar — verifica as Firestore Rules'
        : `⚠️ Erro ao guardar: ${e?.code || e?.message || 'desconhecido'}`;
      toast(msg);
      console.error('[materiais] guardar modal', e);
      return; // FIX: não fechar o modal nem actualizar DB local se Firestore falhou
    }
  }

  // Só chega aqui se o Firestore guardou com sucesso (ou se não há DB — modo offline)
  document.getElementById('mat-modal')?.remove();
  _overrides[ref] = dados;
  const idx = MATERIAIS_DB.findIndex(a => a.ref === ref);
  if (idx >= 0) Object.assign(MATERIAIS_DB[idx], dados);
  else MATERIAIS_DB.push({ ref, ...dados });

  renderMatChips();
  renderMatGrid();
  setSyncOk();
  toast(_isNovo ? '✓ Artigo adicionado' : '✓ Artigo actualizado');
};

window.matConfirmarApagar = function(ref) {
  const a = MATERIAIS_DB.find(x => x.ref === ref);
  window.wkConfirm(
    `Apagar "${a?.nome || ref}" do catálogo de materiais?`,
    async () => {
      await matApagar(ref);
      renderMatChips();
      renderMatGrid();
      toast('✓ Artigo apagado');
    }
  );
};

window.matToggleOrc = function() {
  MS.orcAberto = !MS.orcAberto;
  const painel = document.getElementById('mat-orc-painel-wrap');
  if (!painel) {
    // Criar painel na primeira vez
    const p = document.createElement('div');
    p.id = 'mat-orc-painel-wrap';
    p.className = 'painel-lateral';
    p.style.display = 'flex';
    p.style.flexDirection = 'column';
    p.innerHTML = `
      <div class="painel-header">
        <div class="painel-titulo">Orçamento — Materiais</div>
        <button class="painel-fechar" onclick="window.matToggleOrc()">×</button>
      </div>
      <div class="painel-body" id="mat-orc-painel"></div>`;
    document.getElementById('tab-materiais')?.appendChild(p);
  }
  const wrap = document.getElementById('mat-orc-painel-wrap');
  if (wrap) {
    wrap.style.display = MS.orcAberto ? 'flex' : 'none';
    if (MS.orcAberto) renderMatOrc();
  }
};

window.matOrcToggle = function(ref) {
  const idx = MS.orc.findIndex(x => x.ref === ref);
  if (idx >= 0) {
    MS.orc.splice(idx, 1);
    toast('× Removido do orçamento');
  } else {
    const a = MATERIAIS_DB.find(x => x.ref === ref);
    if (a) {
      MS.orc.push({ ...a, qty: 1 });
      toast('✓ Adicionado ao orçamento');
    }
  }
  matAtualizarBadge();
  renderMatGrid();
  if (MS.orcAberto) renderMatOrc();
};

window.matOrcRemover = function(idx) {
  if (MS.orc[idx]) { MS.orc.splice(idx, 1); matAtualizarBadge(); renderMatGrid(); renderMatOrc(); }
};

window.matOrcQty = function(idx, delta) {
  if (!MS.orc[idx]) return;
  MS.orc[idx].qty = Math.max(1, (MS.orc[idx].qty || 1) + delta);
  renderMatOrc();
};

window.matOrcQtyDirecto = function(idx, val) {
  if (!MS.orc[idx]) return;
  const n = parseInt(val);
  if (isNaN(n) || n < 1) return;
  MS.orc[idx].qty = n;
  renderMatOrc();
};

window.matOrcLimpar = function() {
  if (!MS.orc.length) return;
  window.wkConfirm('Limpar o orçamento de materiais?', () => {
    MS.orc = [];
    matAtualizarBadge();
    renderMatGrid();
    renderMatOrc();
    toast('✓ Orçamento limpo');
  });
};

window.matOrcCopiar = function() {
  if (!MS.orc.length) { toast('⚠️ Orçamento vazio'); return; }
  const total = MS.orc.reduce((s, a) => s + (a.preco||0) * (a.qty||1), 0);
  const linhas = ['ORÇAMENTO — MATERIAIS', '─'.repeat(60)];
  MS.orc.forEach(a => {
    linhas.push(`${a.ref}  ×${a.qty||1}  ${fmt((a.preco||0)*(a.qty||1))}  ${a.nome}`);
  });
  linhas.push('─'.repeat(60));
  linhas.push(`TOTAL: ${fmt(total)}`);
  navigator.clipboard.writeText(linhas.join('\n')).then(() => toast('✓ Lista copiada'));
};

window.matOrcCopiarRefs = function() {
  if (!MS.orc.length) { toast('⚠️ Orçamento vazio'); return; }
  const linhas = MS.orc.map(a => `${a.ref}\t${a.qty||1}`);
  navigator.clipboard.writeText(linhas.join('\n')).then(() => toast('✓ Referências copiadas'));
};

