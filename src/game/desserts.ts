/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DessertConfig, DessertType } from './types.ts';

export const DESSERT_PALETTE: DessertConfig[] = [
  {
    type: 'souffle_pancake',
    name: '日式舒芙蕾鬆餅',
    nameEn: 'Soufflé Pancake',
    primaryColor: '#F5C16C', // Warm golden fluffy pancake
    secondaryColor: '#E6A745',
    accentColor: '#FFF3A8', // Melting butter cube
    height: 38,
    decorations: ['butter_cube', 'maple_drip'],
  },
  {
    type: 'strawberry_shortcake',
    name: '草莓生乳戚風',
    nameEn: 'Strawberry Shortcake',
    primaryColor: '#FFFDF9', // Whipped cream
    secondaryColor: '#FEE2E2', // Soft strawberry sponge
    accentColor: '#EF4444', // Red ripe strawberry
    height: 42,
    decorations: ['strawberry_slices', 'cream_swirls'],
  },
  {
    type: 'matcha_roll',
    name: '宇治抹茶生乳捲',
    nameEn: 'Matcha Cream Roll',
    primaryColor: '#65A30D', // Rich matcha green
    secondaryColor: '#84CC16',
    accentColor: '#FDFBF7', // Cream swirl center & azuki bean
    height: 40,
    decorations: ['matcha_powder', 'azuki_bean'],
  },
  {
    type: 'caramel_pudding',
    name: '焦糖昭和布丁',
    nameEn: 'Caramel Custard Pudding',
    primaryColor: '#FBBF24', // Rich custard yellow
    secondaryColor: '#D97706',
    accentColor: '#78350F', // Dark amber caramel syrup
    height: 40,
    decorations: ['caramel_drip', 'cherry'],
  },
  {
    type: 'french_macaron',
    name: '法式覆盆子馬卡龍',
    nameEn: 'Raspberry Macaron',
    primaryColor: '#F472B6', // Vibrant pastel pink
    secondaryColor: '#DB2777',
    accentColor: '#FFF1F2', // Vanilla ganache filling
    height: 36,
    decorations: ['macaron_skirt', 'ganache_layer'],
  },
  {
    type: 'honey_toast',
    name: '金黃蜂蜜吐司',
    nameEn: 'Honey Brioche Toast',
    primaryColor: '#FDE68A', // Toasted bread
    secondaryColor: '#B45309', // Toasted crust
    accentColor: '#F59E0B', // Honey drizzle
    height: 42,
    decorations: ['honey_drizzle', 'sugar_crystal'],
  },
  {
    type: 'chocolate_brownie',
    name: '濃郁生巧布朗尼',
    nameEn: 'Fudge Brownie',
    primaryColor: '#582C18', // Deep cocoa
    secondaryColor: '#381A0D',
    accentColor: '#FCD34D', // Walnut crumble
    height: 38,
    decorations: ['cocoa_drip', 'walnut_crumbs'],
  },
  {
    type: 'custard_tart',
    name: '鮮果卡士達水果塔',
    nameEn: 'Fruit Custard Tart',
    primaryColor: '#FEF08A', // Smooth custard
    secondaryColor: '#CA8A04', // Fluted golden pastry crust
    accentColor: '#10B981', // Kiwi/Mint garnish
    height: 38,
    decorations: ['fluted_crust', 'mint_leaf'],
  },
  {
    type: 'berry_cheesecake',
    name: '藍莓重乳酪蛋糕',
    nameEn: 'Blueberry Cheesecake',
    primaryColor: '#FDFBF7', // Rich cheesecake
    secondaryColor: '#7C3AED', // Blueberry violet glaze
    accentColor: '#6D28D9', // Whole berries
    height: 40,
    decorations: ['blueberry_glaze', 'biscuit_base'],
  },
  {
    type: 'rainbow_donut',
    name: '糖霜彩虹甜甜圈',
    nameEn: 'Rainbow Glazed Donut',
    primaryColor: '#F9A8D4', // Strawberry icing
    secondaryColor: '#FBBF24', // Dough base
    accentColor: '#38BDF8', // Colorful sprinkles
    height: 36,
    decorations: ['rainbow_sprinkles', 'icing_drip'],
  },
];

export function getDessertConfig(type: DessertType): DessertConfig {
  return DESSERT_PALETTE.find((d) => d.type === type) || DESSERT_PALETTE[0];
}

export function getRandomDessert(previousType?: DessertType): DessertConfig {
  const available = DESSERT_PALETTE.filter((d) => d.type !== previousType);
  return available[Math.floor(Math.random() * available.length)];
}
