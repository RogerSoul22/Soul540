import type { StaticMenu } from '../../../data/soul540Menus/index';
import type { EditableMenuCategory } from '../types/contract-document-types';

export function buildMenuCategories(menu: StaticMenu | undefined): EditableMenuCategory[] {
  if (menu) {
    return menu.categories.map((cat) => ({
      name: cat.name,
      headers: ['Item', 'Descrição'] as [string, string],
      items: cat.items.map((item) => ({
        name: item.name,
        subtitle: item.subtitle || '',
        description: item.description,
      })),
    }));
  }
  return [
    {
      name: 'Entradas',
      headers: ['Item', 'Descrição'] as [string, string],
      items: [
        { name: 'Crostinis', subtitle: '', description: 'Torradinhas artesanais com azeite' },
        { name: 'Pãozinho de Calabresa', subtitle: '', description: 'Massa leve com calabresa' },
        {
          name: 'Maravilha de Queijo',
          subtitle: '',
          description: 'Massa recheada com queijo derretido',
        },
      ],
    },
    {
      name: 'Pizzas Salgadas',
      headers: ['Nome', 'Ingredientes'] as [string, string],
      items: [
        {
          name: 'ZUCCHINI SPECIALI',
          subtitle: '',
          description: 'Massa, molho de tomate, abobrinha, alho frito, parmesão, azeite e orégano',
        },
        {
          name: 'BLU AGRIDOCE',
          subtitle: '',
          description: 'Massa, molho de tomate, geleia de pimenta, mussarela, gorgonzola, bacon e orégano',
        },
        {
          name: 'MARGHERITA BÚFALA',
          subtitle: '',
          description: 'Massa, molho de tomate, mussarela de búfala, parmesão, manjericão, azeite e orégano',
        },
        {
          name: 'CALABRESA TRADIZIONALE',
          subtitle: '',
          description: 'Massa, molho de tomate, mussarela, calabresa, cebola, azeitona e orégano',
        },
        {
          name: 'QUATTRO FORAGGIO',
          subtitle: '',
          description: 'Massa, molho, mussarela, parmesão, gorgonzola, catupiry e orégano',
        },
        {
          name: 'MOZZARELLA SPECIALI',
          subtitle: '',
          description:
            'Massa, molho de tomate, mussarela, tomate em pedaços, azeitona, parmesão, manjericão, azeite e orégano',
        },
        {
          name: 'SEM GLUTEN',
          subtitle: '',
          description: 'Massa especial sem glúten com recheios disponíveis no mise en place',
        },
        {
          name: 'DUO FRANGO E BACON',
          subtitle: '',
          description: 'Massa, molho de tomate, mussarela, frango desfiado, Catupiry, bacon e orégano',
        },
      ],
    },
    {
      name: 'Pizzas Doces',
      headers: ['Nome', 'Ingredientes'] as [string, string],
      items: [{ name: 'Chocolate', subtitle: '', description: 'Massa, Chocolate ao leite, confeitos' }],
    },
  ];
}
