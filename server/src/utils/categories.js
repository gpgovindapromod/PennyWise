const CATEGORIES = [
  {
    id: 'food-drinks',
    label: 'Food & Drinks',
    icon: 'Utensils',
    subcategories: [
      // Tea & coffee
      'Tea with snacks',
      'Tea without snacks',
      'Coffee with snacks',
      'Coffee without snacks',
      // Meals & main dishes
      'Mandi',
      'Biriyani',
      'Meals',
      'Parotta',
      'Shawarma',
      // Snacks & drinks
      'Puff',
      'Samosa',
      'Cutlet',
      'Lime',
      'Juice',
      'Soft drinks',
      'Hostel Canteen',
      'Other Food'
    ]
  },
  {
    id: 'academic',
    label: 'Academic Expenses',
    icon: 'GraduationCap',
    subcategories: [
      'College fees',
      'Photocopy & printing',
      'Textbooks',
      'Second-hand books',
      'Pens & stationery',
      'Notebooks & records',
      'Lab supplies & components',
      'Project materials',
      'Calculator & instruments',
      'Workshops & certifications',
      'Other study costs'
    ]
  },
  {
    id: 'travel',
    label: 'Travel & Transport',
    icon: 'Bus',
    subcategories: [
      'Bus ticket/pass',
      'Train ticket',
      'Auto rickshaw',
      'Two-wheeler fuel',
      'Metro',
      'Cab / Ride share',
      'Other travel'
    ]
  },
  {
    id: 'shopping',
    label: 'Shopping',
    icon: 'ShoppingBag',
    subcategories: [
      'Clothing',
      'Footwear',
      'Electronics & cables',
      'Room essentials',
      'Other shopping'
    ]
  },
  {
    id: 'bills-utilities',
    label: 'Bills & Utilities',
    icon: 'Zap',
    subcategories: [
      'Mobile recharge',
      'Wi-Fi / Internet',
      'Electricity bill',
      'Mess bill',
      'Room rent'
    ]
  },
  {
    id: 'health',
    label: 'Health & Medical',
    icon: 'HeartPulse',
    subcategories: [
      'Medicines',
      'Doctor appointment',
      'Dental',
      'Health checkup'
    ]
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    icon: 'Film',
    subcategories: [
      'Movie ticket',
      'Streaming subscription',
      'Outing / Celebration',
      'Gaming',
      'Sports'
    ]
  },
  {
    id: 'personal-care',
    label: 'Personal Care',
    icon: 'Smile',
    subcategories: [
      'Haircut / Salon',
      'Toiletries & grooming',
      'Laundry / Ironing'
    ]
  },
  {
    id: 'allowance',
    label: 'Allowance / Pocket Money',
    icon: 'Wallet',
    isIncome: true,
    subcategories: [
      'Monthly allowance from home',
      'Emergency allowance',
      'Relative gift'
    ]
  },
  {
    id: 'scholarship',
    label: 'Scholarship / Grant',
    icon: 'Award',
    isIncome: true,
    subcategories: [
      'Merit scholarship',
      'Government grant',
      'Fee concession reimbursement'
    ]
  },
  {
    id: 'freelance',
    label: 'Freelance / Part-time',
    icon: 'Briefcase',
    isIncome: true,
    subcategories: [
      'Tutoring / Tuition',
      'Design / Coding project',
      'Campus internship',
      'Part-time job'
    ]
  },
  {
    id: 'other',
    label: 'Other',
    icon: 'MoreHorizontal',
    subcategories: [
      'Miscellaneous expense',
      'Miscellaneous income',
      'Borrowed money returned',
      'Cash adjustment'
    ]
  }
];

module.exports = { CATEGORIES };
