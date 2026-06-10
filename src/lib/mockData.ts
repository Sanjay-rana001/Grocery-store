import { Product, Coupon } from './types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Gala Apples',
    category: 'Products',
    subcategory: 'Fruits',
    price: 5.50,
    originalPrice: 6.80,
    description: 'Crisp, sweet, and highly aromatic, these New Zealand Gala apples are a premium snack. Grown under the Hawkes Bay sun, they feature thin skin and an incredibly juicy texture. Perfect for school lunches, baking, or slicing into fresh salads.',
    unit: '1kg Bag',
    origin: 'Hawkes Bay',
    organic: true,
    bestSeller: true,
    seasonal: false,
    stock: 45,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCeR2ha4CwOzcXeYZ65w0SVPMqkID-QQFJtn-FP2IH8vXqEAgxKgJ7CoToClZ71OWXvBx-nqjzXgerPx7b_H4EjMIlD3u0CC8eUhUyNe7ppXxPHgwYI1sE1O0kvXatBFkqMQvGug1Hq5D5sskRIwmxKQe4D8sMlqVcmSiE9p2mOSB_SbKBLdrbPQXXiAsrFyqoniUxzvaIYx0A623n3XTl3aGlJqO58qXbPWoyLQstM1kkwpouoPuLEHmXehXUL5UtVESTIiYoCAP5D',
      'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80'
    ],
    brand: 'FreshMart Organic',
    ratings: 4.8,
    reviewsCount: 14,
    dietary: ['organic', 'vegan', 'gluten-free'],
    reviews: [
      { id: 'r1', userName: 'Liam W.', rating: 5, comment: 'Hands down the crispiest apples I have ordered online. Extremely fresh!', date: '2026-05-20' },
      { id: 'r2', userName: 'Sarah M.', rating: 4.5, comment: 'Sweet and perfect for kids. A couple of minor bruises, but overall great quality.', date: '2026-05-18' }
    ]
  },
  {
    id: '2',
    name: 'Hass Avocado',
    category: 'Products',
    subcategory: 'Fruits',
    price: 2.50,
    description: 'Creamy, rich Hass avocados from the sunny Bay of Plenty. Features standard dark, pebbly skin when ripe and a buttery, nutty green interior. Ideal for smash-on-toast, home-made guacamole, or as a rich addition to healthy smoothies.',
    unit: 'Single',
    origin: 'Bay of Plenty',
    organic: false,
    bestSeller: true,
    seasonal: true,
    stock: 90,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCNis47dFQ5wvLk0QnUPUZqdHJD_MWWcgQ-FA0RJ9uXxzq80P0IN1iKFJQ5rYLPgt9IV4PK2xLX-Ypq2l4M6ap1Nk5iMvF98jBm-YGeeDa8meZ6sZyFjN2iKolZNyvjVIeV0rgBGpbUHgHs3r1_PM-pXQAlRHI9D3TGreysqvCkuJRsYdzAoPfM1Zv4SQwjTVVsUQBNdvCfgvSUpYyK6_B-qK4Eg0EWbBmmfpV584dRqraZdFYAstcYhe6htuSeNWqXr75tczBFsWIM',
      'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80'
    ],
    brand: 'Bay Groves',
    ratings: 4.6,
    reviewsCount: 32,
    dietary: ['vegan', 'gluten-free', 'keto'],
    reviews: [
      { id: 'r3', userName: 'Jackson P.', rating: 5, comment: 'Perfect ripeness, ready to eat today! Incredibly creamy.', date: '2026-05-24' },
      { id: 'r4', userName: 'Emma G.', rating: 4, comment: 'Good size, though one of the two I ordered took a few days to ripen.', date: '2026-05-22' }
    ]
  },
  {
    id: '3',
    name: 'Bunch Carrots',
    category: 'Products',
    subcategory: 'Vegetables',
    price: 4.00,
    description: 'Freshly harvested orange carrots with vibrant green leafy tops still attached. Sourced from the volcanic soils of Pukekohe. Crispy, naturally sweet, and perfect for roasting whole, juicing, or enjoying raw with hummus.',
    unit: '500g Bunch',
    origin: 'Pukekohe',
    organic: true,
    bestSeller: false,
    seasonal: true,
    stock: 35,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC518hF22OjuWJBVOuPRoTpUL7iyiJ4SzePpLFD0jo5EP9zYmR_Qy79PqAUyjEEUZWML3iiXCNFIIE7tF207ctvfjoCJh2hr3NS8g82RCfoTyA_7AjbXEum8n_drqAspH1MsZ_w4AWvD_GxJdLH0_Cbb1XbZbillf0I_TJlGKuONqNAM5DmActToPcAav2hl9NhgoNsjwNmLqVmMhLA7KHug-zpr-VNPCOUJZMpFBS43bzxzk226D0eNVHXd6_tuVKHnV3UU0eRJ6SS',
      'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80'
    ],
    brand: 'Pukekohe Organics',
    ratings: 4.9,
    reviewsCount: 8,
    dietary: ['organic', 'vegan', 'gluten-free'],
    reviews: [
      { id: 'r5', userName: 'Charlotte T.', rating: 5, comment: 'So sweet! Roasted them with honey, absolutely beautiful.', date: '2026-05-21' }
    ]
  },
  {
    id: '4',
    name: 'Head Broccoli',
    category: 'Products',
    subcategory: 'Vegetables',
    price: 3.50,
    originalPrice: 4.20,
    description: 'Vibrant green, tightly clustered broccoli heads with crisp florets and thick edible stems. Packed with Vitamin C and iron, freshly harvested from Canterbury orchards. Ideal for stir-fries, steaming, or making creamy broccoli soup.',
    unit: 'Each',
    origin: 'Canterbury',
    organic: true,
    bestSeller: false,
    seasonal: false,
    stock: 50,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCfD6wvGgtvju1Mv2jJdl2mWtmyuo-doVyCc5-OXuz-zUiOQR_kH8KpVYqHa0VKBoXmklJVGFTsQNEPVm7dCdcnOFrL3fKEZT0TqXG18UCA7T3F2QQPlVgThOe-MxIabtj-5EhkgRcDmnqV_ZN8tDoxkoBDPWy7tBqtJg6xMMpp5VkPCc0Vv2t1Xs8VQubYZwXOezWtzs_Nli1AzGKzcmIm-gfbYfYNQY9wA5k785nguyQGiT5cV7mqpgsOo6zr6A6zDKSHBWhwmXBT',
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80'
    ],
    brand: 'Canterbury Growers',
    ratings: 4.7,
    reviewsCount: 15,
    dietary: ['organic', 'vegan', 'gluten-free', 'keto'],
    reviews: [
      { id: 'r6', userName: 'Noah F.', rating: 5, comment: 'Firm, green, no yellow spots. Excellent quality broccoli.', date: '2026-05-19' }
    ]
  },
  {
    id: '5',
    name: 'Gold Kumara',
    category: 'Products',
    subcategory: 'Vegetables',
    price: 7.99,
    description: 'Golden-skinned New Zealand Kumara (sweet potato) with sweet, creamy yellow flesh. Grown in the Northland region, known for its warm climate and sandy soils. Exceptional when roasted, mashed, or cut into crispy kumara fries.',
    unit: '1kg Bag',
    origin: 'Northland',
    organic: false,
    bestSeller: false,
    seasonal: false,
    stock: 30,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDCAXMR8brSgD4a3aSiaGv34FMMrX23DbO-9NAqRK8wJ9K4o5vwQVbCddSNiIniUIFixlHvnY9Hbk0bm0GPYMHMv7T1zqBQ5QWRpgWT2UXZvPLq-E3w9rxh6kaOBAmeR_J_XURFYW_vkYMnzDiIZv6g5Nc2FuoL6m9WB_bT1X_J96MFeqAeunvgDQNMtqtjQVrgwoiuH9OS_0GjfYTYkbIPueKI7pyIwwKzNUsE_Z48oDTc94oSu28SzNnN-v7AIDC0WWrVMXEwS9SO',
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80'
    ],
    brand: 'Northland Root Co.',
    ratings: 4.5,
    reviewsCount: 9,
    dietary: ['vegan', 'gluten-free'],
    reviews: [
      { id: 'r7', userName: 'Zoe R.', rating: 4, comment: 'Great Kumara, makes the best sweet potato fries ever.', date: '2026-05-15' }
    ]
  },
  {
    id: '6',
    name: 'Baby Spinach',
    category: 'Products',
    subcategory: 'Vegetables',
    price: 4.50,
    originalPrice: 5.20,
    description: 'Fresh, organic baby spinach leaves harvested at peak tenderness from Levin. Pre-washed and packaged in a breathable bag to preserve freshness. Perfect as a base for salads, or quickly wilted into hot pastas and scrambled eggs.',
    unit: '120g Bag',
    origin: 'Levin',
    organic: true,
    bestSeller: true,
    seasonal: false,
    stock: 40,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDSPXJqiv2IgNX-I09l-vmeAYdzfSxgahwbbBgHiznAAWAZTpqmUQ-YZE-ekPNBl_K9hGHXMd6Tredii5h-Ai_PiTQr3XCSnmeUu8Ou87a5O_vSpWHGmnwi-visDPda4tze49-JkqN6NNleIZ6lGJ-QiqMWHI8312IOQf_9_zlTElP8gEqVm7AHH243ATjtcSgpzvgTKCq0hgnSVxG5H6LaJ5q82IENIBO-usiXKkvjf50qpgPk40KxlbZbWJwi6btap8F3gXtZKGH0',
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80'
    ],
    brand: 'Levin Organic Labs',
    ratings: 4.8,
    reviewsCount: 22,
    dietary: ['organic', 'vegan', 'gluten-free', 'keto'],
    reviews: [
      { id: 'r8', userName: 'Michael H.', rating: 5, comment: 'Stays fresh in the fridge for a full week. Pre-washed is super handy.', date: '2026-05-23' }
    ]
  },
  {
    id: '7',
    name: 'NZ Grass-Fed Angus Ribeye',
    category: 'meat',
    subcategory: 'Beef',
    price: 18.50,
    originalPrice: 22.00,
    description: 'Premium, grass-fed New Zealand Angus Ribeye steak. Aged for 21 days to ensure peak tenderness and rich beef flavor. High marbling results in an incredibly juicy and buttery steak when grilled or pan-seared with garlic and rosemary.',
    unit: '300g Cut',
    origin: 'Canterbury',
    organic: false,
    bestSeller: true,
    seasonal: false,
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80'
    ],
    brand: 'Silver Fern Farms',
    ratings: 4.9,
    reviewsCount: 45,
    dietary: ['gluten-free', 'keto'],
    reviews: [
      { id: 'r9', userName: 'Logan K.', rating: 5, comment: 'Phenomenal cut. Great marbling, melted in my mouth like butter.', date: '2026-05-24' },
      { id: 'r10', userName: 'Lucas B.', rating: 5, comment: 'Exceptional steak. Cooked medium-rare, tastes amazing.', date: '2026-05-21' }
    ]
  },
  {
    id: '8',
    name: 'Free-Range Chicken Breast',
    category: 'meat',
    subcategory: 'Poultry',
    price: 14.99,
    description: 'Premium New Zealand free-range chicken breast fillets, bone-out and skin-off. Sourced from certified ethical farms where chickens roam freely outdoors on lush pasture. High in protein, low in fat, and exceptionally tender.',
    unit: '500g Pack',
    origin: 'Waikato',
    organic: false,
    bestSeller: false,
    seasonal: false,
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80'
    ],
    brand: 'Bostock Brothers',
    ratings: 4.7,
    reviewsCount: 18,
    dietary: ['gluten-free', 'keto'],
    reviews: [
      { id: 'r11', userName: 'Sophie G.', rating: 4.5, comment: 'Clean, well-trimmed chicken breasts. Moist and flavorful.', date: '2026-05-22' }
    ]
  },
  {
    id: '9',
    name: 'Premium Lamb Cutlets',
    category: 'meat',
    subcategory: 'Lamb',
    price: 24.90,
    description: 'Delectable, grass-fed New Zealand lamb cutlets. Finely trimmed by expert butchers. A Kiwi favorite, renowned globally for its sweet flavor and outstanding tenderness. Ideal for quick pan-searing or a summer BBQ.',
    unit: '450g Pack',
    origin: 'Otago',
    organic: false,
    bestSeller: true,
    seasonal: false,
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1603048297172-c92544798d5e?auto=format&fit=crop&w=600&q=80'
    ],
    brand: 'Alliance Pure',
    ratings: 4.9,
    reviewsCount: 26,
    dietary: ['gluten-free', 'keto'],
    reviews: [
      { id: 'r12', userName: 'Oliver D.', rating: 5, comment: 'Unbelievably tender. A real premium treat, definitely worth the price!', date: '2026-05-24' }
    ]
  },
  {
    id: '10',
    name: 'Lewis Road Creamery Butter',
    category: 'dairy',
    subcategory: 'Butter & Spreads',
    price: 8.50,
    description: 'Award-winning, grass-fed salted butter from Lewis Road Creamery. Made using the traditional French Fritz churn method, resulting in an exceptionally silky, creamy texture and deep golden color. Perfect for premium baking or melting on warm bread.',
    unit: '250g Block',
    origin: 'Canterbury',
    organic: false,
    bestSeller: true,
    seasonal: false,
    stock: 60,
    images: [
      'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80'
    ],
    brand: 'Lewis Road Creamery',
    ratings: 4.9,
    reviewsCount: 52,
    dietary: ['gluten-free', 'keto'],
    reviews: [
      { id: 'r13', userName: 'Emily W.', rating: 5, comment: 'Best butter in the world. Will never go back to standard butter.', date: '2026-05-25' },
      { id: 'r14', userName: 'Liam S.', rating: 5, comment: 'So yellow and incredibly rich. Incredible on fresh sourdough!', date: '2026-05-23' }
    ]
  },
  {
    id: '11',
    name: 'Meadow Fresh Organic Milk',
    category: 'dairy',
    subcategory: 'Milk & Cream',
    price: 5.20,
    description: 'Pure, organic light milk from grass-fed cows roaming freely on NZ family pastures. Pre-pasteurized and certified organic to ensure clean, wholesome nutrition without artificial additives or pesticides. Excellent for tea, coffee, and cereal.',
    unit: '2L Bottle',
    origin: 'Waikato',
    organic: true,
    bestSeller: true,
    seasonal: false,
    stock: 80,
    images: [
      'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80'
    ],
    brand: 'Meadow Fresh',
    ratings: 4.8,
    reviewsCount: 40,
    dietary: ['organic', 'gluten-free'],
    reviews: [
      { id: 'r15', userName: 'James M.', rating: 5, comment: 'Great fresh taste, certified organic organic milk at a very fair price.', date: '2026-05-24' }
    ]
  },
  {
    id: '12',
    name: 'Anchor Tasty Cheese Block',
    category: 'dairy',
    subcategory: 'Cheese',
    price: 12.00,
    originalPrice: 14.50,
    description: 'Anchor Tasty Cheddar cheese block features a bold, matured bite and smooth crumbly texture, aged up to 12 months. Grate it into high-end toasted sandwiches, melt it over macaroni cheese, or enjoy on crackers with grapes.',
    unit: '750g Block',
    origin: 'Taranaki',
    organic: false,
    bestSeller: false,
    seasonal: false,
    stock: 55,
    images: [
      'https://images.unsplash.com/photo-1618164435735-413d3b066c9a?auto=format&fit=crop&w=600&q=80'
    ],
    brand: 'Anchor',
    ratings: 4.6,
    reviewsCount: 19,
    dietary: ['gluten-free', 'keto'],
    reviews: [
      { id: 'r16', userName: 'Chloe F.', rating: 5, comment: 'Classic NZ tasty cheddar. Consistent quality, good maturity.', date: '2026-05-22' }
    ]
  },
  {
    id: '13',
    name: 'Kapiti Vanilla Bean Ice Cream',
    category: 'dairy',
    subcategory: 'Desserts',
    price: 9.99,
    description: 'Indulgent, ultra-creamy ice cream crafted from fresh New Zealand dairy, blended with real vanilla bean seeds. Features a luxurious speckled golden color and a fragrant, gourmet vanilla pod flavor. A premium Kiwi classic.',
    unit: '1L Tub',
    origin: 'Kapiti Coast',
    organic: false,
    bestSeller: true,
    seasonal: false,
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1560008511-11c63416e52d?auto=format&fit=crop&w=600&q=80'
    ],
    brand: 'Kapiti Ice Cream',
    ratings: 4.9,
    reviewsCount: 38,
    dietary: ['gluten-free'],
    reviews: [
      { id: 'r17', userName: 'Grace N.', rating: 5, comment: 'Incredible vanilla flavor. You can see the real black vanilla specks!', date: '2026-05-18' }
    ]
  },
  {
    id: '14',
    name: "Pic's Crunchy Peanut Butter",
    category: 'pantry',
    subcategory: 'Spreads',
    price: 6.80,
    description: "New Zealand's famous, high-quality crunchy peanut butter. Crafted from 100% Australian hi-oleic peanuts, roasted freshly in Nelson, and ground with a pinch of NZ sea salt. Free of added emulsifiers, oils, sugars, or preservatives.",
    unit: '380g Jar',
    origin: 'Nelson',
    organic: false,
    bestSeller: true,
    seasonal: false,
    stock: 75,
    images: [
      'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80'
    ],
    brand: "Pic's Peanut Butter",
    ratings: 4.9,
    reviewsCount: 64,
    dietary: ['vegan', 'gluten-free', 'keto'],
    reviews: [
      { id: 'r18', userName: 'Mason R.', rating: 5, comment: 'Simply the best peanut butter in the southern hemisphere. Crunchy perfection.', date: '2026-05-25' },
      { id: 'r19', userName: 'Isabella K.', rating: 5, comment: 'No nasty oils or sugars, just great peanuts. Love this brand!', date: '2026-05-20' }
    ]
  },
  {
    id: '15',
    name: 'Ceres Organics Quinoa',
    category: 'pantry',
    subcategory: 'Grains & Pasta',
    price: 7.50,
    description: 'Sustainably sourced, certified organic white quinoa grains. A complete protein containing all nine essential amino acids, high in dietary fiber, and easily digestible. Pre-rinsed to remove bitter saponin. A wholesome alternative to rice.',
    unit: '400g Pack',
    origin: 'South America',
    organic: true,
    bestSeller: false,
    seasonal: false,
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'
    ],
    brand: 'Ceres Organics',
    ratings: 4.7,
    reviewsCount: 11,
    dietary: ['organic', 'vegan', 'gluten-free'],
    reviews: [
      { id: 'r20', userName: 'Harper V.', rating: 4.5, comment: 'Fluffs up beautifully. Pre-rinsed is a big time saver.', date: '2026-05-14' }
    ]
  },
  {
    id: '16',
    name: 'NZ Premium Manuka Honey MGO 100+',
    category: 'pantry',
    subcategory: 'Honey & Sweeteners',
    price: 22.00,
    originalPrice: 26.50,
    description: 'Pure, authentic New Zealand Manuka Honey, certified MGO 100+ for natural bio-active compounds. Sustainably gathered from wild manuka bush in remote, pristine NZ forests. Features a rich earthy flavor, smooth velvety texture, and honeyed gold color.',
    unit: '250g Jar',
    origin: 'East Cape',
    organic: false,
    bestSeller: true,
    seasonal: false,
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80'
    ],
    brand: 'Comvita Manuka',
    ratings: 4.9,
    reviewsCount: 29,
    dietary: ['gluten-free'],
    reviews: [
      { id: 'r21', userName: 'Ethan P.', rating: 5, comment: 'Incredibly soothing for the throat. Tastes like real nature. High quality.', date: '2026-05-24' }
    ]
  },
  {
    id: '17',
    name: 'Daily Bread Organic Sourdough',
    category: 'bakery',
    subcategory: 'Breads',
    price: 8.50,
    description: 'Artisanal organic sourdough loaf, hand-shaped and slow-fermented for 36 hours. Baked fresh daily in a wood-fired stone oven. Features a thick, blistered caramelized crust and an open, elastic interior crumb with a perfect tangy sourdough bite.',
    unit: '750g Loaf',
    origin: 'Auckland',
    organic: true,
    bestSeller: true,
    seasonal: false,
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=600&q=80'
    ],
    brand: 'Daily Bread Bakery',
    ratings: 4.9,
    reviewsCount: 42,
    dietary: ['organic', 'vegan'],
    reviews: [
      { id: 'r22', userName: 'Oliver F.', rating: 5, comment: 'Unreal bread. The crust is chewy and inside is soft and tangy. Toasting this with Lewis Road Butter is heaven.', date: '2026-05-25' },
      { id: 'r23', userName: 'Amelia S.', rating: 5, comment: 'Authentic sourdough. My family eats a whole loaf in one sitting!', date: '2026-05-24' }
    ]
  },
  {
    id: '18',
    name: 'Aroha Sparkling Rhubarb Juice',
    category: 'bakery',
    subcategory: 'Drinks',
    price: 4.20,
    description: 'Refreshing sparkling fruit drink crafted in New Zealand. Made from locally harvested rhubarb stalks, cold-pressed to retain its distinct tart profile and sweet floral aroma. Perfectly carbonated with pure spring water for a crisp refreshing finish.',
    unit: '330ml Bottle',
    origin: 'Canterbury Plains',
    organic: false,
    bestSeller: false,
    seasonal: true,
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80'
    ],
    brand: 'Aroha Drinks',
    ratings: 4.7,
    reviewsCount: 12,
    dietary: ['vegan', 'gluten-free'],
    reviews: [
      { id: 'r24', userName: 'Sophia C.', rating: 4.5, comment: 'Very refreshing. Not overly sweet, perfect balance of tart rhubarb flavor.', date: '2026-05-15' }
    ]
  },
  {
    id: '19',
    name: 'Phoenix Organic Ginger Beer',
    category: 'bakery',
    subcategory: 'Drinks',
    price: 4.50,
    description: 'Premium organic ginger beer, traditionally brewed in NZ using organic ginger root extracts and organic cane sugar. Delivers a robust, spicy kick and deep warming aromatic finish. Free from artificial colorings, chemicals, or preservatives.',
    unit: '330ml Bottle',
    origin: 'Auckland',
    organic: true,
    bestSeller: false,
    seasonal: false,
    stock: 48,
    images: [
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80'
    ],
    brand: 'Phoenix Organics',
    ratings: 4.8,
    reviewsCount: 16,
    dietary: ['organic', 'vegan', 'gluten-free'],
    reviews: [
      { id: 'r25', userName: 'Leo T.', rating: 5, comment: 'Best ginger beer. Excellent spicy ginger burn!', date: '2026-05-20' }
    ]
  },
  {
    id: '20',
    name: 'Organic Kiwifruit',
    category: 'Products',
    subcategory: 'Fruits',
    price: 6.90,
    originalPrice: 8.50,
    description: 'Plump, tangy and sweet New Zealand green kiwifruit. Certified organic and bursting with dietary fiber, digestive enzymes, and double the Vitamin C of oranges. Sourced from organic orchards in Te Puke, the Kiwifruit capital.',
    unit: '1kg Bag',
    origin: 'Bay of Plenty',
    organic: true,
    bestSeller: true,
    seasonal: true,
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=600&q=80'
    ],
    brand: 'Zespri Organic',
    ratings: 4.8,
    reviewsCount: 23,
    dietary: ['organic', 'vegan', 'gluten-free'],
    reviews: [
      { id: 'r26', userName: 'Ruby W.', rating: 5, comment: 'Wonderfully sweet. Te Puke kiwi is always top notch.', date: '2026-05-24' }
    ]
  }
];

export const mockCoupons: Coupon[] = [
  { code: 'KIWI10', type: 'percentage', value: 10, isActive: true },
  { code: 'FRESH5', type: 'fixed', value: 5.00, minAmount: 30.00, isActive: true },
  { code: 'EASTER20', type: 'percentage', value: 20, isActive: true }
];
