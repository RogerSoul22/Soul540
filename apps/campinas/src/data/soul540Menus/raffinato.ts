import { text, type StaticMenu } from './types';

export const RAFFINATO_MENU: StaticMenu = {
  id: 'raffinato',
  name: 'Menu Raffinato',
  tagline: 'Requinte e sofisticação em cada fatia',
  obs: 'Podem ser incluídas qualquer pizza do menu Superiore, acrescentando 8 sabores incríveis.',
  categories: [
    {
      name: 'Entradas',
      items: [
        {
          name: '1. Bordinha de 4 Queijos',
          description: text('Nossa massa crocante, recheada de mussarela búfala, catupiry, ', 'provolone e parmesão.'),
        },
        {
          name: '2. Bordinha de Calabresa Cremosi',
          description: text(
            'Nossa massa crocante, recheada com linguiça calabresa, catupiry e ',
            'azeitonas pretas sem caroço.',
          ),
        },
        {
          name: '3. Crostini Parmesão',
          description: '',
        },
      ],
    },
    {
      name: 'Pizzas Salgadas',
      items: [
        {
          name: '3. Brie & Parma al Miele Tartufato',
          description: text(
            'Base de azeite e uma combinação refinada de queijo brie derretido com ',
            'presunto de Parma, finalizada com mel trufado e rúcula fresca. Um ',
            'sabor delicado e elegante.',
          ),
          harmonization: 'Espumante brut ou Chardonnay.',
        },
        {
          name: '4. Calabresa Artesanal Curada e Brie',
          description: text(
            'Molho tomate, fatias de calabresa artesanal curada e generosas porções',
            ' de brie, sobre uma base cremosa. Um toque terroso e sofisticado.',
          ),
          harmonization: 'Pinot Noir ou vinho branco aromático.',
        },
        {
          name: '5. Provolone Affumicato',
          description: text(
            'Molho de tomates, provolone defumado, tomates secos e azeite de oliva,',
            ' finalizados com manjericão fresco. Sabor marcante e leve toque ',
            'defumado.',
          ),
          harmonization: 'Cerveja IPA ou vinho tinto jovem.',
        },
        {
          name: '6. Ouro Verde Bianca',
          description: text(
            'Molho pesto, parmesão, mozzarella de búfala, catupiry, finalizados com',
            ' amêndoas em fatias, manjericão e azeite.',
          ),
        },
        {
          name: '7. Duo com Copa',
          description: text(
            'Massa aberta com borda Vulcão de catupiry, molho de tomate, ',
            'mozzarella, gorgonzola e fatias de copa.',
          ),
          harmonization: 'Pinot Noir ou vinho branco aromático.',
        },
        {
          name: '8. Peperoni Cremosi',
          subtitle: 'Peperoni Reale al Gorgonzola',
          description: text(
            'Feito em massa recheada com mozarella e gorgonzola. Molho de tomate ',
            'pelati rústico, com azeite extravirgem e leve toque de alho. Catupiry ',
            'e pepperoni fatiado fino, levemente apimentado, finalizado com ',
            'parmesão.',
          ),
          harmonization: 'Cerveja IPA ou vinho tinto jovem.',
        },
        {
          name: '9. Margherita Bufala',
          description: 'Molho de tomate, mozzarella de búfala, manjoricão, parmesão, orégano e azeite.',
          harmonization: 'Cerveja Witbier ou Vinho Pinot Noir.',
        },
        {
          name: '10. Blu Agridoce',
          description: 'Molho de tomate, geléia de pimenta, mozzarella, gorgonzola, bacon e orégano.',
          harmonization: 'Cerveja Dubbel (estilo belga) ou vinho Zinfandel ou Primitivo.',
        },
        {
          name: '11. Bracciata di Pomodori Secchi e Rucola',
          description: text(
            'Nossa massa especial que abraça o recheio de búfala fresca, molho ',
            'pesto, rúcula e tomates secos, finalizada com parmesão e azeite.',
          ),
          harmonization: 'Vinho branco – Vermentino ou Sauvignon Blanc.',
        },
      ],
    },
    {
      name: 'Pizzas Doces',
      items: [
        {
          name: '12. Cioccolato Classico',
          description: 'Chocolate derretido sobre massa fina, finalizado com lascas crocantes.',
          harmonization: 'Cerveja Porter ou vinho do Porto.',
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
