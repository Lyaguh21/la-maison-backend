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
    },
    {
      name: 'Анна Волкова',
      email: 'anna@lamaison.ru',
      phone: '+79001000002',
      role: 'WAITER' as const,
    },
    {
      name: 'Максим Петров',
      email: 'maxim@lamaison.ru',
      phone: '+79001000003',
      role: 'COOK' as const,
    },
    {
      name: 'Елена Смирнова',
      email: 'elena@example.com',
      phone: '+79001000004',
      role: 'CUSTOMER' as const,
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
            connect:
              u.role === 'CUSTOMER'
                ? [{ id: ingMap['Молоко'] }, { id: ingMap['Миндаль'] }]
                : [],
          },
        },
      }),
    ),
  );

  console.log(`  ✅ Создано ${users.length} пользователей`);

  // ──────────────────────────────────────────────
  // Столы (3 шт. — вручную введённые)
  // ──────────────────────────────────────────────
  const tablesData = [
    { number: 1, tableType: 'SIX' as const },
    { number: 2, tableType: 'FOUR' as const },
    { number: 3, tableType: 'FOUR' as const },
  ];

  const tables = await Promise.all(
    tablesData.map((t) => prisma.tables.create({ data: t })),
  );

  console.log(`  ✅ Создано ${tables.length} столов`);

  // ──────────────────────────────────────────────
  // План зала (FloorItems)
  // ──────────────────────────────────────────────
  const floorItemsData = [
    // Столы (привязка к Tables)
    {
      type: 'TABLE' as const,
      tableId: tables[0].id,
      x: 48,
      y: 48,
      width: 144,
      height: 144,
      rotation: 0,
      number: 1,
      tableType: 'SIX',
    },
    {
      type: 'TABLE' as const,
      tableId: tables[1].id,
      x: 336,
      y: 48,
      width: 96,
      height: 144,
      rotation: 0,
      number: 2,
      tableType: 'FOUR',
    },
    {
      type: 'TABLE' as const,
      tableId: tables[2].id,
      x: 576,
      y: 48,
      width: 96,
      height: 144,
      rotation: 0,
      number: 3,
      tableType: 'FOUR',
    },
  ];

  await Promise.all(
    floorItemsData.map((fi) => {
      const { tableId } = fi as any;
      const allowed = {
        type: (fi as any).type,
        x: (fi as any).x,
        y: (fi as any).y,
        width: (fi as any).width,
        height: (fi as any).height,
        rotation: (fi as any).rotation,
      } as any;
      const data = tableId
        ? { ...allowed, table: { connect: { id: tableId } } }
        : allowed;
      return prisma.floorItems.create({ data });
    }),
  );

  console.log(`  ✅ Создано ${floorItemsData.length} элементов зала`);

  // ──────────────────────────────────────────────
  // Бронирования + Заказы + Позиции заказов
  // ──────────────────────────────────────────────
  const waiter = users.find((u) => u.role === 'WAITER')!;
  const customer = users.find((u) => u.role === 'CUSTOMER')!;

  const now = new Date();
  const hour = (h: number, d = 0) => {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    date.setHours(h, 0, 0, 0);
    return date;
  };

  // Вспомогательная функция для подсчёта итога
  const calcTotal = (items: { dishId: number; quantity: number }[]) =>
    items.reduce((sum, it) => {
      const dish = dishes.find((d) => d.id === it.dishId)!;
      return sum + dish.price * it.quantity;
    }, 0);

  // Данные бронирований
  const reservationsData = [
    // Прошлое: завершённые
    {
      tableIndex: 3,
      guestsCount: 4,
      status: 'COMPLETED' as const,
      startTime: hour(18, -3),
      endTime: hour(20, -3),
      realStartTime: hour(18, -3),
      realEndTime: hour(20, -3),
      userId: customer.id,
      waiterId: waiter.id,
      items: [
        { dishIdx: 0, qty: 2 },
        { dishIdx: 5, qty: 1 },
        { dishIdx: 17, qty: 2 },
        { dishIdx: 30, qty: 4 },
      ],
      orderStatus: 'SERVED' as const,
    },
    {
      tableIndex: 7,
      guestsCount: 6,
      status: 'COMPLETED' as const,
      startTime: hour(19, -2),
      endTime: hour(22, -2),
      realStartTime: hour(19, -2),
      realEndTime: hour(21, -2),
      userId: null,
      guestName: 'Иванов Дмитрий',
      guestPhone: '+79005551234',
      waiterId: waiter.id,
      items: [
        { dishIdx: 2, qty: 2 },
        { dishIdx: 7, qty: 3 },
        { dishIdx: 15, qty: 2 },
        { dishIdx: 20, qty: 3 },
        { dishIdx: 32, qty: 6 },
        { dishIdx: 35, qty: 2 },
      ],
      orderStatus: 'SERVED' as const,
    },
    {
      tableIndex: 1,
      guestsCount: 2,
      status: 'PAID' as const,
      startTime: hour(12, -1),
      endTime: hour(14, -1),
      realStartTime: hour(12, -1),
      realEndTime: hour(13, -1),
      userId: customer.id,
      waiterId: waiter.id,
      items: [
        { dishIdx: 1, qty: 2 },
        { dishIdx: 10, qty: 1 },
        { dishIdx: 39, qty: 2 },
      ],
      orderStatus: 'SERVED' as const,
    },
    // Прошлое: отменённая
    {
      tableIndex: 4,
      guestsCount: 3,
      status: 'CANCELLED' as const,
      startTime: hour(20, -1),
      endTime: hour(22, -1),
      userId: null,
      guestName: 'Козлова Мария',
      guestPhone: '+79003334455',
      waiterId: null,
      items: [],
      orderStatus: null,
    },
    // Прошлое: NO_SHOW
    {
      tableIndex: 0,
      guestsCount: 2,
      status: 'NO_SHOW' as const,
      startTime: hour(19, -1),
      endTime: hour(21, -1),
      userId: null,
      guestName: 'Сидоров Павел',
      guestPhone: '+79007778899',
      waiterId: null,
      items: [],
      orderStatus: null,
    },
    // Текущая: SEATED (сейчас за столом)
    {
      tableIndex: 5,
      guestsCount: 4,
      status: 'SEATED' as const,
      startTime: hour(now.getHours() - 1),
      endTime: hour(now.getHours() + 2),
      realStartTime: hour(now.getHours() - 1),
      userId: customer.id,
      waiterId: waiter.id,
      items: [
        { dishIdx: 4, qty: 2 },
        { dishIdx: 8, qty: 1 },
        { dishIdx: 12, qty: 1 },
        { dishIdx: 22, qty: 2 },
        { dishIdx: 28, qty: 2 },
      ],
      orderStatus: 'COOKING' as const,
    },
    // Будущие: BOOKED
    {
      tableIndex: 8,
      guestsCount: 5,
      status: 'BOOKED' as const,
      startTime: hour(19, 1),
      endTime: hour(22, 1),
      userId: customer.id,
      waiterId: null,
      items: [],
      orderStatus: null,
    },
    {
      tableIndex: 2,
      guestsCount: 2,
      status: 'BOOKED' as const,
      startTime: hour(20, 1),
      endTime: hour(22, 1),
      userId: null,
      guestName: 'Николаев Артём',
      guestPhone: '+79002223344',
      waiterId: null,
      items: [],
      orderStatus: null,
    },
    {
      tableIndex: 10,
      guestsCount: 4,
      status: 'BOOKED' as const,
      startTime: hour(18, 2),
      endTime: hour(21, 2),
      userId: null,
      guestName: 'Фёдорова Ольга',
      guestPhone: '+79006665544',
      waiterId: null,
      items: [],
      orderStatus: null,
    },
    // Ещё одна завершённая для объёма
    {
      tableIndex: 9,
      guestsCount: 2,
      status: 'COMPLETED' as const,
      startTime: hour(13, -4),
      endTime: hour(15, -4),
      realStartTime: hour(13, -4),
      realEndTime: hour(14, -4),
      userId: null,
      guestName: 'Белова Анна',
      guestPhone: '+79009998877',
      waiterId: waiter.id,
      items: [
        { dishIdx: 25, qty: 1 },
        { dishIdx: 26, qty: 1 },
        { dishIdx: 33, qty: 2 },
        { dishIdx: 38, qty: 2 },
      ],
      orderStatus: 'SERVED' as const,
    },
  ];

  for (const r of reservationsData) {
    const orderItems = r.items.map((it) => ({
      dishId: dishes[it.dishIdx].id,
      quantity: it.qty,
    }));

    const totalPrice = calcTotal(orderItems);

    await prisma.reservation.create({
      data: {
        tableId: tables[r.tableIndex % tables.length].id,
        guestsCount: r.guestsCount,
        status: r.status,
        startTime: r.startTime,
        endTime: r.endTime,
        realStartTime: r.realStartTime ?? null,
        realEndTime: (r as any).realEndTime ?? null,
        userId: r.userId ?? null,
        guestName: (r as any).guestName ?? null,
        guestPhone: (r as any).guestPhone ?? null,
        waiterId: r.waiterId ?? null,
        ...(orderItems.length > 0
          ? {
              order: {
                create: {
                  totalPriceOrder: totalPrice,
                  orderItems: {
                    create: orderItems.map((oi) => ({
                      dishId: oi.dishId,
                      quantity: oi.quantity,
                      priceSnapshot: dishes.find((d) => d.id === oi.dishId)!
                        .price,
                      status: r.orderStatus!,
                    })),
                  },
                },
              },
            }
          : {}),
      },
    });
  }

  const resCount = reservationsData.length;
  const ordCount = reservationsData.filter((r) => r.items.length > 0).length;
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
