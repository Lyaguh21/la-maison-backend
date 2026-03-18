import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // ──────────────────────────────────────────────
  // Очистка таблиц (порядок важен из-за FK)
  // ──────────────────────────────────────────────
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.dishIngredient.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.floorItems.deleteMany();
  await prisma.tables.deleteMany();
  await prisma.user.deleteMany();

  // ──────────────────────────────────────────────
  // Ингредиенты (60 шт.)
  // ──────────────────────────────────────────────
  const ingredientNames = [
    'Мука',
    'Сливочное масло',
    'Оливковое масло',
    'Соль',
    'Чёрный перец',
    'Чеснок',
    'Лук репчатый',
    'Морковь',
    'Картофель',
    'Томаты',
    'Сливки 33%',
    'Молоко',
    'Яйцо куриное',
    'Сыр пармезан',
    'Сыр грюйер',
    'Сыр бри',
    'Куриное филе',
    'Говяжья вырезка',
    'Утиная грудка',
    'Ягнёнок',
    'Лосось',
    'Тунец',
    'Креветки',
    'Мидии',
    'Гребешки',
    'Осьминог',
    'Белое вино',
    'Красное вино',
    'Лимон',
    'Лайм',
    'Базилик',
    'Тимьян',
    'Розмарин',
    'Петрушка',
    'Укроп',
    'Шпинат',
    'Руккола',
    'Латук',
    'Авокадо',
    'Огурец',
    'Спаржа',
    'Цукини',
    'Баклажан',
    'Грибы шампиньоны',
    'Белые грибы',
    'Трюфель',
    'Рис арборио',
    'Паста спагетти',
    'Паста пенне',
    'Паста тальятелле',
    'Сахар',
    'Мёд',
    'Шоколад тёмный',
    'Ваниль',
    'Малина',
    'Клубника',
    'Черника',
    'Мята',
    'Миндаль',
    'Грецкий орех',
  ];

  const ingredients = await Promise.all(
    ingredientNames.map((name) => prisma.ingredient.create({ data: { name } })),
  );

  const ingMap = Object.fromEntries(ingredients.map((i) => [i.name, i.id]));

  // ──────────────────────────────────────────────
  // Категории меню
  // ──────────────────────────────────────────────
  const categoryData = [
    'Салаты',
    'Супы',
    'Закуски',
    'Основные блюда',
    'Паста и ризотто',
    'Морепродукты',
    'Десерты',
    'Напитки',
  ];

  const categories = await Promise.all(
    categoryData.map((name) => prisma.menuCategory.create({ data: { name } })),
  );

  const catMap = Object.fromEntries(categories.map((c) => [c.name, c.id]));

  // ──────────────────────────────────────────────
  // Блюда (42 шт.) + связь с ингредиентами
  // ──────────────────────────────────────────────
  const dishesData: {
    name: string;
    category: string;
    price: number;
    description: string;
    ingredients: string[];
  }[] = [
    // --- Салаты (5) ---
    {
      name: 'Нисуаз',
      category: 'Салаты',
      price: 890,
      description:
        'Классический салат с тунцом, яйцом, оливками и свежими овощами',
      ingredients: [
        'Тунец',
        'Яйцо куриное',
        'Томаты',
        'Латук',
        'Оливковое масло',
        'Лимон',
      ],
    },
    {
      name: 'Цезарь с курицей',
      category: 'Салаты',
      price: 750,
      description:
        'Хрустящий романо, куриное филе на гриле и соус цезарь с пармезаном',
      ingredients: [
        'Куриное филе',
        'Латук',
        'Сыр пармезан',
        'Яйцо куриное',
        'Чеснок',
        'Оливковое масло',
      ],
    },
    {
      name: 'Салат с козьим сыром и свёклой',
      category: 'Салаты',
      price: 820,
      description:
        'Тёплый салат с запечённой свёклой, козьим сыром и грецким орехом',
      ingredients: ['Руккола', 'Грецкий орех', 'Мёд', 'Оливковое масло'],
    },
    {
      name: 'Греческий с авокадо',
      category: 'Салаты',
      price: 780,
      description: 'Свежие овощи, авокадо, фета и оливковая заправка',
      ingredients: [
        'Авокадо',
        'Томаты',
        'Огурец',
        'Лук репчатый',
        'Оливковое масло',
        'Лимон',
      ],
    },
    {
      name: 'Руккола с пармезаном и трюфелем',
      category: 'Салаты',
      price: 1100,
      description: 'Нежная руккола с хлопьями пармезана и трюфельным маслом',
      ingredients: [
        'Руккола',
        'Сыр пармезан',
        'Трюфель',
        'Оливковое масло',
        'Лимон',
      ],
    },

    // --- Супы (5) ---
    {
      name: 'Французский луковый суп',
      category: 'Супы',
      price: 650,
      description:
        'Карамелизированный лук, нежный бульон и гратинированный грюйер',
      ingredients: [
        'Лук репчатый',
        'Сливочное масло',
        'Сыр грюйер',
        'Белое вино',
        'Тимьян',
        'Мука',
      ],
    },
    {
      name: 'Крем-суп из шампиньонов',
      category: 'Супы',
      price: 590,
      description:
        'Бархатистый суп из шампиньонов со сливками и трюфельным маслом',
      ingredients: [
        'Грибы шампиньоны',
        'Сливки 33%',
        'Лук репчатый',
        'Чеснок',
        'Сливочное масло',
        'Тимьян',
      ],
    },
    {
      name: 'Буйабес',
      category: 'Супы',
      price: 1200,
      description: 'Марсельский рыбный суп с лососем, креветками и мидиями',
      ingredients: [
        'Лосось',
        'Креветки',
        'Мидии',
        'Томаты',
        'Чеснок',
        'Белое вино',
        'Базилик',
      ],
    },
    {
      name: 'Велюте из спаржи',
      category: 'Супы',
      price: 680,
      description: 'Нежный суп из зелёной спаржи со сливками',
      ingredients: [
        'Спаржа',
        'Сливки 33%',
        'Сливочное масло',
        'Лук репчатый',
        'Лимон',
      ],
    },
    {
      name: 'Суп-пюре из тыквы',
      category: 'Супы',
      price: 550,
      description: 'Согревающий тыквенный суп с имбирём и сливками',
      ingredients: [
        'Морковь',
        'Сливки 33%',
        'Сливочное масло',
        'Лук репчатый',
        'Мёд',
      ],
    },

    // --- Закуски (6) ---
    {
      name: 'Тартар из тунца',
      category: 'Закуски',
      price: 1050,
      description: 'Свежий тунец с авокадо, соевым соусом и кунжутом',
      ingredients: ['Тунец', 'Авокадо', 'Лайм', 'Огурец'],
    },
    {
      name: 'Фуа-гра с бриошью',
      category: 'Закуски',
      price: 1800,
      description: 'Утиная фуа-гра с конфитюром из инжира и тёплой бриошью',
      ingredients: ['Утиная грудка', 'Сливочное масло', 'Мёд', 'Соль'],
    },
    {
      name: 'Брускетта с томатами',
      category: 'Закуски',
      price: 490,
      description: 'Хрустящий хлеб с томатами, базиликом и оливковым маслом',
      ingredients: ['Томаты', 'Базилик', 'Чеснок', 'Оливковое масло'],
    },
    {
      name: 'Карпаччо из говядины',
      category: 'Закуски',
      price: 950,
      description:
        'Тончайшие ломтики говядины с рукколой, пармезаном и каперсами',
      ingredients: [
        'Говяжья вырезка',
        'Руккола',
        'Сыр пармезан',
        'Оливковое масло',
        'Лимон',
      ],
    },
    {
      name: 'Гребешки на гриле',
      category: 'Закуски',
      price: 1350,
      description: 'Обжаренные морские гребешки с пюре из цветной капусты',
      ingredients: ['Гребешки', 'Сливочное масло', 'Лимон', 'Тимьян'],
    },
    {
      name: 'Сырная тарелка',
      category: 'Закуски',
      price: 1200,
      description: 'Ассорти из бри, грюйера, пармезана с мёдом и орехами',
      ingredients: [
        'Сыр бри',
        'Сыр грюйер',
        'Сыр пармезан',
        'Мёд',
        'Грецкий орех',
        'Миндаль',
      ],
    },

    // --- Основные блюда (8) ---
    {
      name: 'Стейк из говядины с соусом бёрнез',
      category: 'Основные блюда',
      price: 2200,
      description: 'Говяжья вырезка medium-rare с классическим соусом бёрнез',
      ingredients: [
        'Говяжья вырезка',
        'Сливочное масло',
        'Яйцо куриное',
        'Лимон',
        'Тимьян',
        'Чёрный перец',
      ],
    },
    {
      name: 'Утиная грудка с вишнёвым соусом',
      category: 'Основные блюда',
      price: 1850,
      description: 'Розовая утиная грудка с пряным вишнёвым соусом и пюре',
      ingredients: [
        'Утиная грудка',
        'Красное вино',
        'Сливочное масло',
        'Картофель',
        'Тимьян',
        'Мёд',
      ],
    },
    {
      name: 'Каре ягнёнка',
      category: 'Основные блюда',
      price: 2400,
      description: 'Каре ягнёнка с травяной корочкой и рататуем',
      ingredients: [
        'Ягнёнок',
        'Розмарин',
        'Тимьян',
        'Чеснок',
        'Цукини',
        'Баклажан',
        'Томаты',
      ],
    },
    {
      name: 'Курица по-провански',
      category: 'Основные блюда',
      price: 980,
      description: 'Куриное филе с томатами, травами прованса и овощами-гриль',
      ingredients: [
        'Куриное филе',
        'Томаты',
        'Цукини',
        'Оливковое масло',
        'Тимьян',
        'Розмарин',
        'Базилик',
      ],
    },
    {
      name: 'Кок-о-вен',
      category: 'Основные блюда',
      price: 1350,
      description: 'Классическое французское рагу из курицы в красном вине',
      ingredients: [
        'Куриное филе',
        'Красное вино',
        'Грибы шампиньоны',
        'Морковь',
        'Лук репчатый',
        'Тимьян',
        'Чеснок',
      ],
    },
    {
      name: 'Стейк из лосося',
      category: 'Основные блюда',
      price: 1450,
      description: 'Лосось на гриле со спаржей и лимонным соусом',
      ingredients: ['Лосось', 'Спаржа', 'Сливочное масло', 'Лимон', 'Укроп'],
    },
    {
      name: 'Бёф бургиньон',
      category: 'Основные блюда',
      price: 1600,
      description: 'Тушёная говядина в бургундском вине с овощами',
      ingredients: [
        'Говяжья вырезка',
        'Красное вино',
        'Морковь',
        'Лук репчатый',
        'Грибы шампиньоны',
        'Тимьян',
        'Чеснок',
      ],
    },
    {
      name: 'Рататуй',
      category: 'Основные блюда',
      price: 790,
      description: 'Овощное рагу по-провански с цукини, баклажаном и томатами',
      ingredients: [
        'Цукини',
        'Баклажан',
        'Томаты',
        'Лук репчатый',
        'Чеснок',
        'Базилик',
        'Оливковое масло',
      ],
    },

    // --- Паста и ризотто (5) ---
    {
      name: 'Спагетти карбонара',
      category: 'Паста и ризотто',
      price: 850,
      description: 'Спагетти с гуанчиале, яичным соусом и пармезаном',
      ingredients: [
        'Паста спагетти',
        'Яйцо куриное',
        'Сыр пармезан',
        'Чёрный перец',
      ],
    },
    {
      name: 'Тальятелле с белыми грибами',
      category: 'Паста и ризотто',
      price: 1100,
      description: 'Домашняя тальятелле с лесными грибами и трюфельным маслом',
      ingredients: [
        'Паста тальятелле',
        'Белые грибы',
        'Сливки 33%',
        'Сыр пармезан',
        'Чеснок',
        'Тимьян',
      ],
    },
    {
      name: 'Пенне с креветками',
      category: 'Паста и ризотто',
      price: 950,
      description: 'Пенне с креветками в сливочно-чесночном соусе',
      ingredients: [
        'Паста пенне',
        'Креветки',
        'Сливки 33%',
        'Чеснок',
        'Базилик',
        'Томаты',
      ],
    },
    {
      name: 'Ризотто с морепродуктами',
      category: 'Паста и ризотто',
      price: 1250,
      description: 'Сливочное ризотто с креветками, мидиями и гребешками',
      ingredients: [
        'Рис арборио',
        'Креветки',
        'Мидии',
        'Гребешки',
        'Белое вино',
        'Сливочное масло',
        'Лук репчатый',
      ],
    },
    {
      name: 'Ризотто с трюфелем',
      category: 'Паста и ризотто',
      price: 1400,
      description: 'Нежное ризотто с чёрным трюфелем и пармезаном',
      ingredients: [
        'Рис арборио',
        'Трюфель',
        'Сыр пармезан',
        'Сливочное масло',
        'Белое вино',
        'Лук репчатый',
      ],
    },

    // --- Морепродукты (5) ---
    {
      name: 'Мидии в белом вине',
      category: 'Морепродукты',
      price: 990,
      description: 'Мидии в соусе из белого вина, чеснока и петрушки',
      ingredients: [
        'Мидии',
        'Белое вино',
        'Чеснок',
        'Петрушка',
        'Сливочное масло',
        'Лук репчатый',
      ],
    },
    {
      name: 'Креветки фламбе',
      category: 'Морепродукты',
      price: 1350,
      description: 'Тигровые креветки фламбе с коньяком и чесночным маслом',
      ingredients: [
        'Креветки',
        'Чеснок',
        'Сливочное масло',
        'Лимон',
        'Петрушка',
      ],
    },
    {
      name: 'Дуврская камбала',
      category: 'Морепродукты',
      price: 2100,
      description:
        'Целая камбала, приготовленная на сливочном масле с каперсами',
      ingredients: ['Сливочное масло', 'Лимон', 'Петрушка', 'Чёрный перец'],
    },
    {
      name: 'Осьминог на гриле',
      category: 'Морепродукты',
      price: 1550,
      description: 'Осьминог на гриле с картофелем, оливками и зеленью',
      ingredients: [
        'Осьминог',
        'Картофель',
        'Оливковое масло',
        'Лимон',
        'Петрушка',
        'Чеснок',
      ],
    },
    {
      name: 'Тартар из лосося',
      category: 'Морепродукты',
      price: 1150,
      description: 'Свежий лосось с авокадо и цитрусовой заправкой',
      ingredients: ['Лосось', 'Авокадо', 'Лайм', 'Огурец', 'Укроп'],
    },

    // --- Десерты (5) ---
    {
      name: 'Крем-брюле',
      category: 'Десерты',
      price: 490,
      description: 'Классический крем-брюле с карамельной корочкой',
      ingredients: ['Сливки 33%', 'Яйцо куриное', 'Сахар', 'Ваниль'],
    },
    {
      name: 'Фондан из тёмного шоколада',
      category: 'Десерты',
      price: 590,
      description: 'Тёплый шоколадный фондан с жидкой сердцевиной',
      ingredients: [
        'Шоколад тёмный',
        'Сливочное масло',
        'Яйцо куриное',
        'Мука',
        'Сахар',
      ],
    },
    {
      name: 'Тарт татен',
      category: 'Десерты',
      price: 550,
      description: 'Перевёрнутый яблочный тарт с ванильным мороженым',
      ingredients: [
        'Сливочное масло',
        'Сахар',
        'Мука',
        'Яйцо куриное',
        'Ваниль',
      ],
    },
    {
      name: 'Панна котта с малиной',
      category: 'Десерты',
      price: 490,
      description: 'Сливочная панна котта с соусом из свежей малины',
      ingredients: ['Сливки 33%', 'Молоко', 'Сахар', 'Ваниль', 'Малина'],
    },
    {
      name: 'Миллефёй',
      category: 'Десерты',
      price: 650,
      description: 'Слоёный «Наполеон» с заварным кремом и свежими ягодами',
      ingredients: [
        'Мука',
        'Сливочное масло',
        'Сливки 33%',
        'Яйцо куриное',
        'Сахар',
        'Ваниль',
        'Клубника',
      ],
    },

    // --- Напитки (3) ---
    {
      name: 'Лимонад домашний',
      category: 'Напитки',
      price: 350,
      description: 'Освежающий лимонад с мятой и тростниковым сахаром',
      ingredients: ['Лимон', 'Мята', 'Сахар'],
    },
    {
      name: 'Ягодный смузи',
      category: 'Напитки',
      price: 420,
      description: 'Смузи из малины, клубники и черники с йогуртом',
      ingredients: ['Малина', 'Клубника', 'Черника', 'Молоко'],
    },
    {
      name: 'Мохито безалкогольный',
      category: 'Напитки',
      price: 380,
      description: 'Классический безалкогольный мохито с лаймом и мятой',
      ingredients: ['Лайм', 'Мята', 'Сахар'],
    },
  ];

  const dishes: { id: number; name: string; price: number }[] = [];

  for (const d of dishesData) {
    const dish = await prisma.dish.create({
      data: {
        name: d.name,
        categoryId: catMap[d.category],
        description: d.description,
        price: d.price,
        dishIngredients: {
          create: d.ingredients.map((ingName) => ({
            ingredientId: ingMap[ingName],
          })),
        },
      },
    });
    dishes.push({ id: dish.id, name: dish.name, price: dish.price });
  }

  console.log(`  ✅ Создано ${dishes.length} блюд`);

  // ──────────────────────────────────────────────
  // Пользователи (4)
  // ──────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const usersData = [
    {
      name: 'Администратор',
      email: 'admin@lamaison.ru',
      phone: '+79001000001',
      role: 'ADMIN' as const,
      allergens: [],
    },
    {
      name: 'Анна Волкова',
      email: 'anna@lamaison.ru',
      phone: '+79001000002',
      role: 'WAITER' as const,
      allergens: [],
    },
    {
      name: 'Максим Петров',
      email: 'maxim@lamaison.ru',
      phone: '+79001000003',
      role: 'COOK' as const,
      allergens: [],
    },
    {
      name: 'Елена Смирнова',
      email: 'elena@example.com',
      phone: '+79001000004',
      role: 'CUSTOMER' as const,
      allergens: ['Молоко', 'Миндаль'],
    },
    {
      name: 'Игорь Сидоров',
      email: 'igor@lamaison.ru',
      phone: '+79001000005',
      role: 'CUSTOMER' as const,
      allergens: ['Грецкий орех', 'Мёд'],
    },
  ];

  const users = await Promise.all(
    usersData.map((u) =>
      prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          phone: u.phone,
          passwordHash,
          role: u.role,
          userAllergens: {
            connect: (u.allergens || []).map((n) => ({ id: ingMap[n] })),
          },
        },
      }),
    ),
  );

  console.log(`  ✅ Создано ${users.length} пользователей`);

  // ──────────────────────────────────────────────
  // Столы и план зала (точно по переданным данным)
  // ──────────────────────────────────────────────
  const layoutSeed = [
    {
      type: 'TABLE' as const,
      x: 48,
      y: 48,
      width: 144,
      height: 144,
      rotation: 0,
      tableSeedId: 61,
      number: 1,
      tableType: 'SIX' as const,
    },
    {
      type: 'BAR' as const,
      x: 288,
      y: 624,
      width: 144,
      height: 96,
      rotation: 0,
    },
    {
      type: 'EXIT' as const,
      x: 48,
      y: 672,
      width: 96,
      height: 48,
      rotation: 0,
    },
    { type: 'WC' as const, x: 864, y: 624, width: 96, height: 96, rotation: 0 },
    {
      type: 'TABLE' as const,
      x: 336,
      y: 192,
      width: 96,
      height: 144,
      rotation: 0,
      tableSeedId: 64,
      number: 5,
      tableType: 'FOUR' as const,
    },
    {
      type: 'TABLE' as const,
      x: 528,
      y: 192,
      width: 96,
      height: 144,
      rotation: 0,
      tableSeedId: 65,
      number: 6,
      tableType: 'FOUR' as const,
    },
    {
      type: 'TABLE' as const,
      x: 48,
      y: 288,
      width: 144,
      height: 144,
      rotation: 0,
      tableSeedId: 66,
      number: 4,
      tableType: 'SIX' as const,
    },
    {
      type: 'TABLE' as const,
      x: 336,
      y: 384,
      width: 96,
      height: 96,
      rotation: 0,
      tableSeedId: 67,
      number: 7,
      tableType: 'TWO' as const,
    },
    {
      type: 'TABLE' as const,
      x: 528,
      y: 384,
      width: 96,
      height: 96,
      rotation: 0,
      tableSeedId: 68,
      number: 8,
      tableType: 'TWO' as const,
    },
    {
      type: 'TABLE' as const,
      x: 816,
      y: 240,
      width: 96,
      height: 144,
      rotation: 90,
      tableSeedId: 69,
      number: 10,
      tableType: 'FOUR' as const,
    },
    {
      type: 'TABLE' as const,
      x: 816,
      y: 432,
      width: 96,
      height: 144,
      rotation: 90,
      tableSeedId: 70,
      number: 11,
      tableType: 'FOUR' as const,
    },
    {
      type: 'EXIT' as const,
      x: 576,
      y: 672,
      width: 96,
      height: 48,
      rotation: 0,
    },
    {
      type: 'TABLE' as const,
      x: 720,
      y: 0,
      width: 96,
      height: 144,
      rotation: 0,
      tableSeedId: 71,
      number: 9,
      tableType: 'FOUR' as const,
    },
    {
      type: 'TABLE' as const,
      x: 528,
      y: 0,
      width: 96,
      height: 144,
      rotation: 0,
      tableSeedId: 63,
      number: 3,
      tableType: 'FOUR' as const,
    },
    {
      type: 'TABLE' as const,
      x: 336,
      y: 0,
      width: 96,
      height: 144,
      rotation: 0,
      tableSeedId: 62,
      number: 2,
      tableType: 'FOUR' as const,
    },
  ];

  const tableLayout = layoutSeed
    .filter((x) => x.type === 'TABLE')
    .sort((a, b) => (a.number ?? 0) - (b.number ?? 0));

  const tableIdMap = new Map<
    number,
    { id: number; number: number; tableType: 'TWO' | 'FOUR' | 'SIX' }
  >();

  for (const t of tableLayout) {
    const createdTable = await prisma.tables.create({
      data: {
        number: t.number!,
        tableType: t.tableType!,
      },
    });

    tableIdMap.set(t.tableSeedId!, {
      id: createdTable.id,
      number: t.number!,
      tableType: t.tableType!,
    });
  }

  console.log(`  ✅ Создано ${tableIdMap.size} столов`);

  for (const fi of layoutSeed) {
    const data = {
      type: fi.type,
      x: fi.x,
      y: fi.y,
      width: fi.width,
      height: fi.height,
      rotation: fi.rotation,
      ...(fi.type === 'TABLE'
        ? { table: { connect: { id: tableIdMap.get(fi.tableSeedId!)!.id } } }
        : {}),
    };

    await prisma.floorItems.create({ data });
  }

  console.log(`  ✅ Создано ${layoutSeed.length} элементов зала`);

  // ──────────────────────────────────────────────
  // Бронирования + Заказы + Позиции заказов (много данных)
  // ──────────────────────────────────────────────
  const waiter = users.find((u) => u.role === 'WAITER')!;
  const customers = users.filter((u) => u.role === 'CUSTOMER');
  const tables = Array.from(tableIdMap.values());
  const tableCapacity: Record<'TWO' | 'FOUR' | 'SIX', number> = {
    TWO: 2,
    FOUR: 4,
    SIX: 6,
  };

  const calcTotal = (items: { dishId: number; quantity: number }[]) =>
    items.reduce((sum, it) => {
      const dish = dishes.find((d) => d.id === it.dishId)!;
      return sum + dish.price * it.quantity;
    }, 0);

  const quarter = 15;
  const startOfDay = (dayOffset: number, minutes: number) => {
    const date = new Date();
    date.setSeconds(0, 0);
    date.setDate(date.getDate() + dayOffset);
    date.setHours(0, 0, 0, 0);
    date.setMinutes(minutes);
    return date;
  };

  const hash = (a: number, b: number, c: number) =>
    Math.abs((a + 31) * 73856093 + (b + 17) * 19349663 + (c + 11) * 83492791);

  const guestNames = [
    'Иван Иванов',
    'Ольга Соколова',
    'Павел Громов',
    'Марина Белова',
    'Дмитрий Николаев',
    'Виктория Орлова',
    'Евгений Крылов',
    'София Лебедева',
  ];
  const guestPhones = [
    '+79001234567',
    '+79002345678',
    '+79003456789',
    '+79004567890',
    '+79005678901',
    '+79006789012',
    '+79007890123',
    '+79008901234',
  ];

  const openMinutes = 10 * 60;
  const closeMinutes = 23 * 60;
  const durationOptions = [60, 75, 90, 105, 120, 135];
  const gapOptions = [15, 30, 45];
  const occupancy = new Map<string, number>();

  const reservationsData: {
    tableId: number;
    guestsCount: number;
    status:
      | 'BOOKED'
      | 'SEATED'
      | 'CANCELLED'
      | 'PAID'
      | 'COMPLETED'
      | 'NO_SHOW';
    startTime: Date;
    endTime: Date;
    realStartTime: Date | null;
    realEndTime: Date | null;
    userId: number | null;
    guestName: string | null;
    guestPhone: string | null;
    waiterId: number | null;
    orders: {
      orderStatus: 'COOKING' | 'READY' | 'SERVED';
      items: { dishId: number; quantity: number; comment?: string }[];
    }[];
  }[] = [];

  for (let dayOffset = -30; dayOffset <= 30; dayOffset++) {
    for (let tableIdx = 0; tableIdx < tables.length; tableIdx++) {
      const table = tables[tableIdx];
      const seedBase = hash(dayOffset, tableIdx, table.id);

      const reservationsPerDay =
        dayOffset < -3
          ? 2 + (seedBase % 3)
          : dayOffset <= 2
            ? 2 + (seedBase % 2)
            : 1 + (seedBase % 2);

      let cursor = openMinutes + (seedBase % 3) * quarter;

      for (let slot = 0; slot < reservationsPerDay; slot++) {
        const seed = hash(dayOffset, tableIdx, slot);
        const duration = durationOptions[seed % durationOptions.length];
        const gap = gapOptions[seed % gapOptions.length];
        const startMin = cursor;
        const endMin = startMin + duration;

        if (endMin > closeMinutes) {
          break;
        }

        const occupancyKey = `${table.id}:${dayOffset}`;
        const lastEnd = occupancy.get(occupancyKey);
        if (lastEnd !== undefined && startMin < lastEnd) {
          throw new Error(
            `Пересечение брони для стола ${table.number} на день ${dayOffset}`,
          );
        }
        occupancy.set(occupancyKey, endMin);

        const startTime = startOfDay(dayOffset, startMin);
        const endTime = startOfDay(dayOffset, endMin);

        if (
          startTime.getMinutes() % quarter !== 0 ||
          endTime.getMinutes() % quarter !== 0
        ) {
          throw new Error('Бронь не кратна 15 минутам');
        }

        const statusPoolPast = [
          'COMPLETED',
          'PAID',
          'CANCELLED',
          'NO_SHOW',
        ] as const;
        const statusPoolToday = [
          'BOOKED',
          'SEATED',
          'PAID',
          'COMPLETED',
          'CANCELLED',
        ] as const;
        const statusPoolFuture = [
          'BOOKED',
          'BOOKED',
          'BOOKED',
          'CANCELLED',
        ] as const;

        const status =
          dayOffset < 0
            ? statusPoolPast[seed % statusPoolPast.length]
            : dayOffset <= 1
              ? statusPoolToday[seed % statusPoolToday.length]
              : statusPoolFuture[seed % statusPoolFuture.length];

        const capacity = tableCapacity[table.tableType];
        const guestsCount = Math.max(1, (seed % capacity) + 1);
        const attachUser = seed % 10 < 6;
        const customer = customers[seed % customers.length];
        const guestIdx = seed % guestNames.length;

        const userId = attachUser ? customer.id : null;
        const guestName = userId ? null : guestNames[guestIdx];
        const guestPhone = userId ? null : guestPhones[guestIdx];

        const realStartTime =
          status === 'SEATED' || status === 'PAID' || status === 'COMPLETED'
            ? startOfDay(dayOffset, startMin)
            : null;
        const realEndTime =
          status === 'PAID' || status === 'COMPLETED'
            ? startOfDay(
                dayOffset,
                Math.max(startMin + quarter, endMin - quarter),
              )
            : null;

        const orderStatusesForReservation =
          status === 'SEATED'
            ? (['COOKING', 'READY'] as const)
            : status === 'PAID' || status === 'COMPLETED'
              ? (['SERVED'] as const)
              : ([] as const);

        const orders = orderStatusesForReservation.map(
          (orderStatus, orderIdx) => {
            const itemCount = 2 + ((seed + orderIdx) % 3);
            const items = Array.from({ length: itemCount }).map(
              (_, itemIdx) => {
                const dish =
                  dishes[(seed + orderIdx * 7 + itemIdx * 11) % dishes.length];
                const quantity = 1 + ((seed + itemIdx) % 2);
                return {
                  dishId: dish.id,
                  quantity,
                  ...(itemIdx === 0 && seed % 5 === 0
                    ? { comment: 'Без лука, пожалуйста' }
                    : {}),
                };
              },
            );

            return { orderStatus, items };
          },
        );

        reservationsData.push({
          tableId: table.id,
          guestsCount,
          status,
          startTime,
          endTime,
          realStartTime,
          realEndTime,
          userId,
          guestName,
          guestPhone,
          waiterId:
            status === 'SEATED' || status === 'PAID' || status === 'COMPLETED'
              ? waiter.id
              : null,
          orders,
        });

        cursor = endMin + gap;
      }
    }
  }

  let createdOrders = 0;

  for (const reservation of reservationsData) {
    const ordersPayload = reservation.orders.map((order) => {
      const items = order.items.map((item) => ({
        dishId: item.dishId,
        quantity: item.quantity,
        comment: item.comment,
      }));

      return {
        totalPriceOrder: calcTotal(items),
        ...(order.orderStatus === 'READY' || order.orderStatus === 'SERVED'
          ? { finishedAt: new Date() }
          : {}),
        orderItems: {
          create: items.map((item) => ({
            dishId: item.dishId,
            quantity: item.quantity,
            comment: item.comment,
            priceSnapshot: dishes.find((d) => d.id === item.dishId)!.price,
            status: order.orderStatus,
          })),
        },
      };
    });

    createdOrders += ordersPayload.length;

    await prisma.reservation.create({
      data: {
        tableId: reservation.tableId,
        guestsCount: reservation.guestsCount,
        status: reservation.status,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        realStartTime: reservation.realStartTime,
        realEndTime: reservation.realEndTime,
        userId: reservation.userId,
        guestName: reservation.guestName,
        guestPhone: reservation.guestPhone,
        waiterId: reservation.waiterId,
        ...(ordersPayload.length > 0
          ? {
              order: {
                create: ordersPayload,
              },
            }
          : {}),
      },
    });
  }

  const resCount = reservationsData.length;
  const ordCount = createdOrders;
  console.log(`  ✅ Создано ${resCount} бронирований и ${ordCount} заказов`);

  console.log('🎉 Seed завершён!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
