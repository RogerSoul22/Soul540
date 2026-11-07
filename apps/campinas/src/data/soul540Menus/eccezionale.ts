import { text, type StaticMenu } from './types';

export const ECCEZIONALE_MENU: StaticMenu = {
  id: 'eccezionale',
  name: 'Menu Eccezionale',
  tagline: 'Experiência máxima com ingredientes selecionados',
  categories: [
    {
      name: 'Entradas',
      items: [
        {
          name: 'Bordinhas Crocantes di Pesto e Gorgonzola',
          description: text(
            'Massa fina, crocante, pincelada com pesto fresco e finalizada com ',
            'gorgonzola derretido.',
          ),
          harmonization: 'Cerveja Witbier ou vinho branco fresco (Sauvignon Blanc).',
        },
        {
          name: 'Bordinhas Crocantes di Alici e Pomodoro',
          description: text(
            'Delicada massa crocante com toque de azeite extravirgem, aliche ',
            'premium e tomates confitados.',
          ),
          harmonization: 'Cerveja Pilsen artesanal ou vinho branco seco (Vermentino).',
        },
        {
          name: 'Crostini de Parmesão e Gorgonzola',
          description: '',
        },
      ],
    },
    {
      name: 'Pizzas Salgadas',
      items: [
        {
          name: '1. Ouro Verde Bianca',
          subtitle: 'Bianca al Pesto e Mandorlo',
          description: text(
            'Molho pesto artesanal, parmesão, mozzarella de búfala cremosa, ',
            'amêndoas laminadas crocantes e manjericão fresco regado com azeite ',
            'extravirgem.',
          ),
          harmonization: 'Cerveja Belgian Blond Ale ou vinho branco aromático (Chardonnay).',
        },
        {
          name: '2. Blu Agridoce',
          subtitle: 'Gorgonzola e Bacon con Geléia di Peperoncino',
          description: text(
            'Base de molho de tomate italiano, geleia de pimenta agridoce, ',
            'mozzarella, gorgonzola cremoso e cubos de bacon artesanal finalizados ',
            'com orégano fresco.',
          ),
          harmonization: 'Cerveja IPA ou vinho tinto leve (Pinot Noir).',
        },
        {
          name: '3. Bracciata di Rucola & Parma',
          subtitle: 'Rucola e Prosciutto di Parma',
          description: text(
            'Montagem delicada, assada e finalizada com pesto suave, mozzarella de ',
            'búfala, tomate seco artesanal, folhas frescas de rúcula e finas fatias',
            ' de presunto Parma.',
          ),
          harmonization: 'Cerveja Pilsen Premium ou espumante brut.',
        },
        {
          name: '4. Brie e Frutas Vermelhas',
          subtitle: 'Brie e Frutti Rossi',
          description: text(
            'Base de mozzarella de búfala, lâminas de queijo brie e geleia ',
            'artesanal de frutas vermelhas. Sutil, doce e sofisticada.',
          ),
          harmonization: 'Cerveja Weiss ou espumante moscatel.',
        },
        {
          name: '5. Brie & Pera Pistacchio',
          description: text(
            'Finas fatias de pera grelhada com brie derretido, pistaches crocantes ',
            'e um leve fio de mel. Doce, cremoso e crocante na medida.',
          ),
          harmonization: 'Espumante moscatel ou vinho branco frutado.',
        },
        {
          name: '6. Provolone e Bacon Piccante',
          description: text(
            'Provolone defumado, tiras crocantes de bacon artesanal, finalizados ',
            'com mel levemente picante. Uma explosão de sabores intensos.',
          ),
          harmonization: 'Cerveja Stout ou vinho Syrah.',
        },
        {
          name: '7. Alici Tradizionale',
          description: text(
            'Base de molho de tomate pelati artesanal, temperado com azeite ',
            'extravirgem e ervas frescas. Cobertura com aliche (anchova) premium, ',
            'cebola roxa confitada, azeitonas pretas Kalamata e orégano fresco. ',
            'Finalizada com fio de azeite de oliva.',
          ),
          harmonization: text(
            'Vinho branco seco e mineral – Vermentino ou Sauvignon Blanc. Cerveja ',
            'Pilsen artesanal ou Witbier cítrica.',
          ),
        },
        {
          name: '8. Margherita Bufala',
          description: 'Molho de tomate, mozzarella de búfala, manjericão, parmesão, orégano e azeite.',
          harmonization: 'Cerveja Witbier ou Vinho Pinot Noir.',
        },
        {
          name: '9. Calabresa Artesanal Curada',
          description: text(
            'Molho tomate, fatias de calabresa artesanal curada e generosas porções',
            ' de brie, sobre uma base cremosa. Um toque terroso e sofisticado.',
          ),
          harmonization: 'Cerveja Bock ou Vinho Tinto de Médio Corpo – Syrah (Shiraz).',
        },
        {
          name: '10. Peperoni Cremosi',
          subtitle: 'Peperoni Reale al Gorgonzola',
          description: text(
            'Feito em massa recheada com mozarella e gorgonzola. Molho de tomate ',
            'pelati rústico, com azeite extravirgem e leve toque de alho. Catupiry ',
            'e pepperoni fatiado fino, levemente apimentado, finalizado com ',
            'parmesão.',
          ),
          harmonization: "Vinho Tinto Encorpado – Nero d'Avola ou Cabernet Franc.",
        },
      ],
    },
    {
      name: 'Pizzas Doces',
      items: [
        {
          name: '11. Cioccolato Classico',
          description: 'Chocolate derretido sobre massa fina, finalizado com lascas crocantes.',
          harmonization: 'Cerveja Porter ou vinho do Porto.',
        },
        {
          name: '12. Nutella Cremosa',
          description: 'Camada generosa de Nutella finalizada com confeitos ou castanhas a gosto.',
          harmonization: 'Cerveja Stout ou vinho licoroso.',
        },
        {
          name: '13. Banana & Canella',
          subtitle: 'Banana e Cannella Tradizionale',
          description: text('Fatias de banana caramelizada, toque de canela, açúcar mascavo e ', 'finalização de mel.'),
          harmonization: 'Cerveja Weiss ou espumante doce.',
        },
        {
          name: '14. Pistache',
          description: '',
          harmonization: 'Espumante Brut Rosé ou Moscatel seco.',
        },
      ],
    },
  ],
};
