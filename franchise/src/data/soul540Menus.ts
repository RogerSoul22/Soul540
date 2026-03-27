export type StaticItem = { name: string; subtitle?: string; description: string; harmonization?: string; };
export type StaticCategory = { name: string; items: StaticItem[]; };
export type StaticMenu = { id: string; name: string; tagline: string; obs?: string; categories: StaticCategory[]; };

export const SOUL540_MENUS: StaticMenu[] = [
  {
    id: 'eccezionale',
    name: 'Menu Eccezionale',
    tagline: 'Experiência máxima com ingredientes selecionados',
    categories: [
      {
        name: 'Entradas',
        items: [
          { name: 'Bordinhas Crocantes di Pesto e Gorgonzola', description: 'Massa fina, crocante, pincelada com pesto fresco e finalizada com gorgonzola derretido.', harmonization: 'Cerveja Witbier ou vinho branco fresco (Sauvignon Blanc).' },
          { name: 'Bordinhas Crocantes di Alici e Pomodoro', description: 'Delicada massa crocante com toque de azeite extravirgem, aliche premium e tomates confitados.', harmonization: 'Cerveja Pilsen artesanal ou vinho branco seco (Vermentino).' },
          { name: 'Crostini de Parmesão e Gorgonzola', description: '' },
        ],
      },
      {
        name: 'Pizzas Salgadas',
        items: [
          { name: '1. Ouro Verde Bianca', subtitle: 'Bianca al Pesto e Mandorlo', description: 'Molho pesto artesanal, parmesão, mozzarella de búfala cremosa, amêndoas laminadas crocantes e manjericão fresco regado com azeite extravirgem.', harmonization: 'Cerveja Belgian Blond Ale ou vinho branco aromático (Chardonnay).' },
          { name: '2. Blu Agridoce', subtitle: 'Gorgonzola e Bacon con Geléia di Peperoncino', description: 'Base de molho de tomate italiano, geleia de pimenta agridoce, mozzarella, gorgonzola cremoso e cubos de bacon artesanal finalizados com orégano fresco.', harmonization: 'Cerveja IPA ou vinho tinto leve (Pinot Noir).' },
          { name: '3. Bracciata di Rucola & Parma', subtitle: 'Rucola e Prosciutto di Parma', description: 'Montagem delicada, assada e finalizada com pesto suave, mozzarella de búfala, tomate seco artesanal, folhas frescas de rúcula e finas fatias de presunto Parma.', harmonization: 'Cerveja Pilsen Premium ou espumante brut.' },
          { name: '4. Brie e Frutas Vermelhas', subtitle: 'Brie e Frutti Rossi', description: 'Base de mozzarella de búfala, lâminas de queijo brie e geleia artesanal de frutas vermelhas.', harmonization: 'Cerveja Weiss ou espumante moscatel.' },
          { name: '5. Brie & Pera Pistacchio', description: 'Finas fatias de pera grelhada com brie derretido, pistaches crocantes e um leve fio de mel.', harmonization: 'Espumante moscatel ou vinho branco frutado.' },
          { name: '6. Provolone e Bacon Piccante', description: 'Provolone defumado, tiras crocantes de bacon artesanal, finalizados com mel levemente picante.', harmonization: 'Cerveja Stout ou vinho Syrah.' },
          { name: '7. Alici Tradizionale', description: 'Base de molho de tomate pelati artesanal, aliche premium, cebola roxa confitada, azeitonas pretas Kalamata e orégano fresco.', harmonization: 'Vinho branco seco – Vermentino ou Sauvignon Blanc.' },
          { name: '8. Margherita Bufala', description: 'Molho de tomate, mozzarella de búfala, manjericão, parmesão, orégano e azeite.', harmonization: 'Cerveja Witbier ou Vinho Pinot Noir.' },
          { name: '9. Calabresa Artesanal Curada', description: 'Molho tomate, fatias de calabresa artesanal curada e generosas porções de brie.', harmonization: 'Cerveja Bock ou Vinho Tinto Syrah.' },
          { name: '10. Peperoni Cremosi', subtitle: 'Peperoni Reale al Gorgonzola', description: 'Massa recheada com mozarella e gorgonzola, molho de tomate pelati, catupiry e pepperoni fatiado.', harmonization: 'Vinho Tinto Encorpado – Nero d\'Avola ou Cabernet Franc.' },
        ],
      },
      {
        name: 'Pizzas Doces',
        items: [
          { name: '11. Cioccolato Classico', description: 'Chocolate derretido sobre massa fina, finalizado com lascas crocantes.', harmonization: 'Cerveja Porter ou vinho do Porto.' },
          { name: '12. Nutella Cremosa', description: 'Camada generosa de Nutella finalizada com confeitos ou castanhas a gosto.', harmonization: 'Cerveja Stout ou vinho licoroso.' },
          { name: '13. Banana & Canella', subtitle: 'Banana e Cannella Tradizionale', description: 'Fatias de banana caramelizada, toque de canela, açúcar mascavo e mel.', harmonization: 'Cerveja Weiss ou espumante doce.' },
          { name: '14. Pistache', description: '', harmonization: 'Espumante Brut Rosé ou Moscatel seco.' },
        ],
      },
    ],
  },
  {
    id: 'superiore',
    name: 'Menu Superiore',
    tagline: 'Sabores clássicos com toque artesanal',
    categories: [
      {
        name: 'Entradinhas',
        items: [
          { name: '1. Crostini', description: '' },
          { name: '2. Bordinha de Calabresa', description: '' },
          { name: '3. Bordinha de Queijo', description: '' },
        ],
      },
      {
        name: 'Tradicionais',
        items: [
          { name: '1. Margherita Bufala', description: 'Molho de tomate, mozzarella de búfala, manjoricão, parmesão, orégano e azeite.' },
          { name: '2. Calabresa Tradizionale', description: 'Molho de tomate, mozzarella, calabresa, cebola, azeitona e orégano.' },
          { name: '3. Mozzarella Speciali', description: 'Molho de tomate, mozzarella, tomate em pedaços, azeitona, parmesão, manjericão, orégano e azeite.' },
          { name: '4. Pepperoni Formaggio', description: 'Molho de tomate, mozzarella, pepperoni, parmesão e orégano.' },
          { name: '5. Duo Frango e Bacon', description: 'Molho de tomate, mozzarella, frango desfiado, bacon, catupiry, orégano e azeite.' },
          { name: '6. Quattro Formaggio', description: 'Molho de tomate, mozzarella, gorgonzola, parmesão, catupiry e orégano.' },
          { name: '7. Zucchini Speciali', description: 'Molho de tomate, abobrinha, alho frito, mozzarella, parmesão e azeite.' },
          { name: '8. Blu Agridoce', description: 'Molho de tomate, geleia de pimenta, mozzarella, gorgonzola, bacon e orégano.' },
          { name: '9. Blue e Bianca', description: 'Nossa pizza sem molho, massa, catupiry, búfala, gorgonzola, azeite e orégano.' },
          { name: '10. Orto Italia', description: 'Molho de tomate, mozzarella de búfala, abobrinha, bacon, alho frito, orégano, parmesão e azeite.' },
          { name: '11. Mozzarela Tradizionale', description: 'Molho de tomate, mozzarela e orégano.' },
        ],
      },
      {
        name: 'Pizzas Doces',
        items: [
          { name: '12. Cioccolato Classico', description: 'Chocolate derretido sobre massa fina, finalizado com lascas crocantes.' },
          { name: '13. Banana & Canella', subtitle: 'Banana e Cannella Tradizionale', description: 'Fatias de banana caramelizada, toque de canela, açúcar mascavo e mel.' },
          { name: '14. Pistache', description: '' },
        ],
      },
    ],
  },
  {
    id: 'raffinato',
    name: 'Menu Raffinato',
    tagline: 'Requinte e sofisticação em cada fatia',
    obs: 'Podem ser incluídas qualquer pizza do menu Superiore, acrescentando 8 sabores incríveis.',
    categories: [
      {
        name: 'Entradas',
        items: [
          { name: '1. Bordinha de 4 Queijos', description: 'Nossa massa crocante, recheada de mussarela búfala, catupiry, provolone e parmesão.' },
          { name: '2. Bordinha de Calabresa Cremosi', description: 'Nossa massa crocante, recheada com linguiça calabresa, catupiry e azeitonas pretas.' },
          { name: '3. Crostini Parmesão', description: '' },
        ],
      },
      {
        name: 'Pizzas Salgadas',
        items: [
          { name: '3. Brie & Parma al Miele Tartufato', description: 'Queijo brie com presunto de Parma, mel trufado e rúcula fresca.', harmonization: 'Espumante brut ou Chardonnay.' },
          { name: '4. Calabresa Artesanal Curada e Brie', description: 'Molho tomate, calabresa artesanal curada e brie sobre base cremosa.', harmonization: 'Pinot Noir ou vinho branco aromático.' },
          { name: '5. Provolone Affumicato', description: 'Provolone defumado, tomates secos e azeite, finalizado com manjericão.', harmonization: 'Cerveja IPA ou vinho tinto jovem.' },
          { name: '6. Ouro Verde Bianca', description: 'Molho pesto, parmesão, mozzarella de búfala, catupiry, amêndoas e manjericão.' },
          { name: '7. Duo com Copa', description: 'Borda Vulcão de catupiry, molho de tomate, mozzarella, gorgonzola e fatias de copa.' },
          { name: '8. Peperoni Cremosi', subtitle: 'Peperoni Reale al Gorgonzola', description: 'Massa recheada com mozarella e gorgonzola, catupiry e pepperoni.' },
          { name: '9. Margherita Bufala', description: 'Molho de tomate, mozzarella de búfala, manjoricão, parmesão, orégano e azeite.' },
          { name: '10. Blu Agridoce', description: 'Molho de tomate, geléia de pimenta, mozzarella, gorgonzola, bacon e orégano.' },
          { name: '11. Bracciata di Pomodori Secchi e Rucola', description: 'Massa recheada de búfala, pesto, rúcula, tomates secos, parmesão e azeite.' },
        ],
      },
      {
        name: 'Pizzas Doces',
        items: [
          { name: '12. Cioccolato Classico', description: 'Chocolate derretido sobre massa fina, finalizado com lascas crocantes.' },
          { name: '13. Banana & Canella', description: 'Fatias de banana caramelizada, canela, açúcar mascavo e mel.' },
          { name: '14. Pistache', description: '' },
        ],
      },
    ],
  },
];
