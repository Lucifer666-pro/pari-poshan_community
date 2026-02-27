/**
 * @fileOverview Weekly quiz data starting from January 2026.
 * Focused on science, ecology, and health.
 */

export interface Question {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  category: 'Science' | 'Ecology' | 'Health';
}

export interface WeeklyQuiz {
  date: string; // ISO format YYYY-MM-DD (Start of week)
  title: string;
  topic: string;
  questions: Question[];
}

export const WEEKLY_QUIZZES: Record<string, WeeklyQuiz> = {
  "2026-01-05": {
    date: "2026-01-05",
    title: "Week 1: Food Safety 2026",
    topic: "Food Safety",
    questions: [
      { id: "w1q1", category: "Science", prompt: "What is the safest internal temperature for cooked poultry in 2026 standards?", options: ["60°C", "74°C", "85°C", "100°C"], correctIndex: 1 },
      { id: "w1q2", category: "Science", prompt: "Which bacteria is most commonly associated with raw eggs?", options: ["E. coli", "Salmonella", "Listeria", "Staphylococcus"], correctIndex: 1 },
      { id: "w1q3", category: "Health", prompt: "How long should you wash your hands to effectively remove pathogens?", options: ["5 seconds", "10 seconds", "20 seconds", "60 seconds"], correctIndex: 2 },
      { id: "w1q4", category: "Science", prompt: "What does 'FIFO' stand for in food storage?", options: ["Fast In Fast Out", "First In First Out", "First In Final Out", "Food In Food Out"], correctIndex: 1 },
      { id: "w1q5", category: "Health", prompt: "Which of these is a 'high-risk' food for listeria?", options: ["Unpasteurized milk", "Dry pasta", "White rice", "Apples"], correctIndex: 0 }
    ]
  },
  "2026-01-12": {
    date: "2026-01-12",
    title: "Week 2: Lab Innovation",
    topic: "Laboratory Tech",
    questions: [
      { id: "w2q1", category: "Science", prompt: "What is the primary use of a centrifuge in a food lab?", options: ["Cooking", "Separating components", "Heating", "Cooling"], correctIndex: 1 },
      { id: "w2q2", category: "Science", prompt: "Which tool measures the sugar content in a liquid?", options: ["Thermometer", "Refractometer", "Barometer", "Hydrometer"], correctIndex: 1 },
      { id: "w2q3", category: "Science", prompt: "What does pH measure in a food sample?", options: ["Weight", "Acidity or alkalinity", "Temperature", "Volume"], correctIndex: 1 },
      { id: "w2q4", category: "Health", prompt: "Why is titration used in nutrition analysis?", options: ["To find color", "To find concentration", "To find weight", "To find smell"], correctIndex: 1 },
      { id: "w2q5", category: "Science", prompt: "What is 'PCR' testing primarily used for in 2026 food safety?", options: ["Weighing food", "DNA-based pathogen detection", "Measuring heat", "Checking color"], correctIndex: 1 }
    ]
  },
  "2026-01-19": {
    date: "2026-01-19",
    title: "Week 3: Soil Health",
    topic: "Ecology",
    questions: [
      { id: "w3q1", category: "Ecology", prompt: "Which organism is known as a 'natural plow' for soil?", options: ["Ant", "Earthworm", "Beetle", "Spider"], correctIndex: 1 },
      { id: "w3q2", category: "Science", prompt: "What is the main component of organic matter in soil?", options: ["Sand", "Clay", "Humus", "Silt"], correctIndex: 2 },
      { id: "w3q3", category: "Ecology", prompt: "Which nutrient do legumes fix into the soil?", options: ["Oxygen", "Nitrogen", "Carbon", "Helium"], correctIndex: 1 },
      { id: "w3q4", category: "Science", prompt: "What is the ideal pH range for most crops?", options: ["1-3", "6-7", "9-11", "12-14"], correctIndex: 1 },
      { id: "w3q5", category: "Ecology", prompt: "What is 'regenerative agriculture' primarily focused on?", options: ["Using more chemicals", "Restoring soil health", "Fast harvesting", "Indoor farming"], correctIndex: 1 }
    ]
  },
  "2026-01-26": {
    date: "2026-01-26",
    title: "Week 4: Microbiome Science",
    topic: "Health",
    questions: [
      { id: "w4q1", category: "Health", prompt: "Where are the majority of human microbiome bacteria located?", options: ["Brain", "Lungs", "Gut", "Heart"], correctIndex: 2 },
      { id: "w4q2", category: "Science", prompt: "What are 'probiotics'?", options: ["Harmful viruses", "Beneficial bacteria", "Vitamins", "Minerals"], correctIndex: 1 },
      { id: "w4q3", category: "Health", prompt: "Which of these is a prebiotic fiber?", options: ["Sugar", "Inulin", "Salt", "Butter"], correctIndex: 1 },
      { id: "w4q4", category: "Health", prompt: "What percentage of the immune system is estimated to live in the gut?", options: ["10%", "30%", "50%", "70%"], correctIndex: 3 },
      { id: "w4q5", category: "Science", prompt: "What term describes an imbalance in the gut bacteria?", options: ["Symbiosis", "Dysbiosis", "Mitosis", "Osmosis"], correctIndex: 1 }
    ]
  },
  "2026-02-02": {
    date: "2026-02-02",
    title: "Week 5: Sustainable Packaging",
    topic: "Ecology",
    questions: [
      { id: "w5q1", category: "Ecology", prompt: "What material is 'Myco-packaging' made from?", options: ["Plastic", "Mushroom roots", "Metal", "Glass"], correctIndex: 1 },
      { id: "w5q2", category: "Science", prompt: "What does 'biodegradable' mean?", options: ["Can be recycled", "Can be broken down by organisms", "Is waterproof", "Is very strong"], correctIndex: 1 },
      { id: "w5q3", category: "Ecology", prompt: "Which is the most energy-efficient way to handle packaging?", options: ["Recycling", "Reusing", "Burning", "Landfilling"], correctIndex: 1 },
      { id: "w5q4", category: "Science", prompt: "What are 'Bioplastics' made from?", options: ["Petroleum", "Renewable biomass", "Sand", "Coal"], correctIndex: 1 },
      { id: "w5q5", category: "Ecology", prompt: "Which gas is released when food waste rots in a landfill?", options: ["Oxygen", "Methane", "Nitrogen", "Helium"], correctIndex: 1 }
    ]
  },
  "2026-02-09": {
    date: "2026-02-09",
    title: "Week 6: Nutrient Density",
    topic: "Nutrition",
    questions: [
      { id: "w6q1", category: "Health", prompt: "Which of these has the highest nutrient density?", options: ["White bread", "Spinach", "Soda", "Potato chips"], correctIndex: 1 },
      { id: "w6q2", category: "Health", prompt: "What are 'Micronutrients'?", options: ["Fats and oils", "Vitamins and minerals", "Water", "Fiber"], correctIndex: 1 },
      { id: "w6q3", category: "Health", prompt: "Which color of vegetable is often highest in Beta-carotene?", options: ["White", "Orange", "Blue", "Black"], correctIndex: 1 },
      { id: "w6q4", category: "Science", prompt: "What unit measures the energy value of food?", options: ["Gram", "Liter", "Calorie", "Meter"], correctIndex: 2 },
      { id: "w6q5", category: "Health", prompt: "Which vitamin is essential for blood clotting?", options: ["Vitamin A", "Vitamin C", "Vitamin K", "Vitamin E"], correctIndex: 2 }
    ]
  },
  "2026-02-16": {
    date: "2026-02-16",
    title: "Week 7: Allergen Management",
    topic: "Health",
    questions: [
      { id: "w7q1", category: "Health", prompt: "Which of these is one of the 'Big 8' allergens?", options: ["Apple", "Peanut", "Carrot", "Rice"], correctIndex: 1 },
      { id: "w7q2", category: "Science", prompt: "What is 'Anaphylaxis'?", options: ["A common cold", "A severe allergic reaction", "A type of bacteria", "A cooking method"], correctIndex: 1 },
      { id: "w7q3", category: "Health", prompt: "What protein in wheat causes reactions in Celiac patients?", options: ["Whey", "Gluten", "Casein", "Soy"], correctIndex: 1 },
      { id: "w7q4", category: "Science", prompt: "How should surfaces be cleaned to remove allergens?", options: ["Just dusting", "Wiping with dry cloth", "Thorough soap and water", "No need to clean"], correctIndex: 2 },
      { id: "w7q5", category: "Health", prompt: "Can cooking destroy most food allergens?", options: ["Yes, always", "No, almost never", "Only for milk", "Only for eggs"], correctIndex: 1 }
    ]
  },
  "2026-02-23": {
    date: "2026-02-23",
    title: "Week 8: Water Stewardship",
    topic: "Ecology",
    questions: [
      { id: "w8q1", category: "Science", prompt: "What percentage of Earth's water is fresh and accessible?", options: ["Less than 1%", "10%", "25%", "50%"], correctIndex: 0 },
      { id: "w8q2", category: "Ecology", prompt: "What is 'gray water'?", options: ["Poisonous water", "Recycled household water", "Rainwater", "Saltwater"], correctIndex: 1 },
      { id: "w8q3", category: "Science", prompt: "What is the process of removing salt from ocean water?", options: ["Filtration", "Desalination", "Evaporation", "Condensation"], correctIndex: 1 },
      { id: "w8q4", category: "Ecology", prompt: "Which sector uses the most freshwater globally?", options: ["Domestic", "Industrial", "Agriculture", "Mining"], correctIndex: 2 },
      { id: "w8q5", category: "Science", prompt: "What is 'Aquifer'?", options: ["A type of fish", "Underground water layer", "A water filter", "A rain cloud"], correctIndex: 1 }
    ]
  },
  "2026-03-02": {
    date: "2026-03-02",
    title: "Week 9: Vertical Farming",
    topic: "Ecology",
    questions: [
      { id: "w9q1", category: "Science", prompt: "What is 'Hydroponics'?", options: ["Growing in soil", "Growing in water", "Growing in air", "Growing in sand"], correctIndex: 1 },
      { id: "w9q2", category: "Ecology", prompt: "What is a major benefit of vertical farming?", options: ["More pesticide use", "Reduced land use", "Higher water waste", "No need for light"], correctIndex: 1 },
      { id: "w9q3", category: "Science", prompt: "What is 'Aeroponics'?", options: ["Growing in air mist", "Growing in soil", "Growing in the ocean", "Growing in space"], correctIndex: 0 },
      { id: "w9q4", category: "Ecology", prompt: "How does vertical farming affect food miles?", options: ["Increases them", "Decreases them", "No effect", "Makes them zero"], correctIndex: 1 },
      { id: "w9q5", category: "Science", prompt: "Which light spectrum is most used in indoor farms?", options: ["Green and Yellow", "Red and Blue", "Infrared", "X-ray"], correctIndex: 1 }
    ]
  },
  "2026-03-09": {
    date: "2026-03-09",
    title: "Week 10: AI in Food",
    topic: "Science",
    questions: [
      { id: "w10q1", category: "Science", prompt: "How can AI help prevent food poisoning?", options: ["By eating the food", "By predicting outbreaks", "By making food colder", "By changing the flavor"], correctIndex: 1 },
      { id: "w10q2", category: "Science", prompt: "What is 'Smart Labeling'?", options: ["Labels that talk", "Labels that track freshness", "Labels that change color", "Both 2 and 3"], correctIndex: 3 },
      { id: "w10q3", category: "Science", prompt: "What does 'Blockchain' provide in food systems?", options: ["Better taste", "End-to-end traceability", "Faster cooking", "Cheaper seeds"], correctIndex: 1 },
      { id: "w10q4", category: "Health", prompt: "How can AI personalize nutrition?", options: ["By picking one food for all", "By analyzing individual health data", "By selling supplements", "By removing flavor"], correctIndex: 1 },
      { id: "w10q5", category: "Science", prompt: "What is an 'AI Sensor' in a 2026 kitchen?", options: ["A digital thermometer", "A device detecting pathogens", "A smart toaster", "A camera for recipes"], correctIndex: 1 }
    ]
  }
};
