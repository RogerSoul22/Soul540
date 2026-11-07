import { text, type StaticMenu } from './types';

export const SUPERIORE_MENU: StaticMenu = {
  id: 'superiore',
  name: 'Menu Superiore',
  tagline: 'Sabores clássicos com toque artesanal',
  categories: [
    {
      name: 'Entradinhas',
      items: [
        {
          name: '1. Crostini',
          description: '',
        },
        {
          name: '2. Bordinha de Calabresa',
          description: '',
        },
        {
          name: '3. Bordinha de Queijo',
          description: '',
        },
      ],
    },
    {
      name: 'Tradicionais',
      items: [
        {
          name: '1. Margherita Bufala',
          description: 'Molho de tomate, mozzarella de búfala, manjoricão, parmesão, orégano e azeite.',
        },
        {
          name: '2. Calabresa Tradizionale',
          description: 'Molho de tomate, mozzarella, calabresa, cobola, azeitona e orégano.',
        },
        {
          name: '3. Mozzarella Speciali',
          description: text(
            'Molho de tomate, mozzarella, tomate em pedaços, azeitona, parmesão, ',
            'manjericão, orégano e azeite.',
          ),
        },
        {
          name: '4. Pepperoni Formaggio',
          description: 'Molho de tomate, mozzarella, pepperoni, parmesão e orégano.',
        },
        {
          name: '5. Duo Frango e Bacon',
          description: 'Molho de tomate, mozzarella, frango desfiado, bacon, catupiry, orégano e azeite.',
        },
        {
          name: '6. Quattro Formaggio',
          description: 'Molho de tomate, mozzarella, gorgonzola, parmesão, catupiry e orégano.',
        },
        {
          name: '7. Zucchini Speciali',
          description: 'Molho de tomate, abobrinha, alho frito, mozzarella, parmesão e azeite.',
        },
        {
          name: '8. Blu Agridoce',
          description: 'Molho de tomate, geleia de pimenta, mozzarella, gorgonzola, bacon e orégano.',
        },
        {
          name: '9. Blue e Bianca',
          description: 'Nossa pizza sem molho, massa, catupiry, búfala, gorgonzola, azeite e orégano.',
        },
        {
          name: '10. Orto Italia',
          description: text(
            'Molho de tomate, mozzarella de búfala, abobrinha em lâminas, bacon, ',
            'alho frito, orégano, parmesão e azeite.',
          ),
        },
        {
          name: '11. Mozzarela Tradizionale',
          description: 'Molho de tomate, mozzarela e orégano.',
        },
      ],
    },
    {
      name: 'Pizzas Doces',
      items: [
        {
          name: '12. Cioccolato Classico',
          description: 'Chocolate derretido sobre massa fina, finalizado com lascas crocantes.',
        },
        {
          name: '13. Banana & Canella',
          subtitle: 'Banana e Cannella Tradizionale',
          description: text('Fatias de banana caramelizada, toque de canela, açúcar mascavo e ', 'finalização de mel.'),
        },
        {
          name: '14. Pistache',
          description: '',
        },
      ],
    },
  ],
};
