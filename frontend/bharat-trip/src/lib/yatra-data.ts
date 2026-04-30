export interface YatraItinerary {
  day: number;
  title: string;
  description: string;
}

export interface YatraData {
  id: string;
  title: string;
  region: string;
  duration: string;
  difficulty: "Easy" | "Moderate" | "Challenging";
  budget: string;
  tag: string;
  img: string;
  spiritualInsight: string;
  story: string;
  ritualGuidance: {
    title: string;
    steps: string[];
  };
  itinerary: YatraItinerary[];
  travelInfo: {
    air: string;
    train: string;
    road: string;
  };
  stay: string;
  facilities: string[];
  tips: string[];
  bestTime: string;
}

export const yatras: YatraData[] = [
  {
    id: "char-dham",
    title: "Char Dham Yatra",
    region: "Uttarakhand",
    duration: "12 Days",
    difficulty: "Challenging",
    budget: "₹35,000",
    tag: "Sacred Peaks",
    img: "https://images.unsplash.com/photo-1588663784196-848e42f70364?auto=format&fit=crop&w=1200&q=80",
    spiritualInsight: "A journey to the four sacred abodes—Yamunotri, Gangotri, Kedarnath, and Badrinath—is believed to wash away sins and grant Moksha.",
    story: "Established by Adi Shankaracharya in the 8th century, these four sites represent the four points of India and are the most revered pilgrimage circuit in the Himalayas.",
    ritualGuidance: {
      title: "Sacred Sequence",
      steps: [
        "Holy dip in Yamuna at Yamunotri",
        "Offering prayers at Gangotri",
        "Trek and Darshan at Kedarnath",
        "Final purification at Badrinath"
      ]
    },
    itinerary: [
      { day: 1, title: "Haridwar Arrival", description: "Evening Ganga Aarti at Har Ki Pauri." },
      { day: 3, title: "Yamunotri Darshan", description: "Trek to the source of Yamuna." },
      { day: 6, title: "Gangotri Temple", description: "Prayers at the source of Ganga." },
      { day: 9, title: "Kedarnath Trek", description: "Emotional journey to the abode of Shiva." },
      { day: 12, title: "Badrinath Finality", description: "Darshan of Lord Vishnu." }
    ],
    travelInfo: {
      air: "Jolly Grant Airport, Dehradun",
      train: "Haridwar or Rishikesh Railway Station",
      road: "Well connected by NH58 from Delhi/Dehradun"
    },
    stay: "State-run guest houses and local dharamshalas available at each stop.",
    facilities: ["Medical camps", "Helicopter services", "Pony/Palki services"],
    tips: ["Carry warm woolens even in summer", "Maintain physical fitness", "Carry personal identity proofs"],
    bestTime: "May to June and September to October"
  },
  {
    id: "kashi-vishwanath",
    title: "Kashi Vishwanath",
    region: "Varanasi",
    duration: "3 Days",
    difficulty: "Easy",
    budget: "₹8,500",
    tag: "Eternal City",
    img: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
    spiritualInsight: "Varanasi is the city of Lord Shiva, where life and death meet. A darshan at Kashi Vishwanath is the pinnacle of spiritual liberation.",
    story: "Known as the oldest living city in the world, Kashi is believed to rest on the Trishul of Lord Shiva.",
    ritualGuidance: {
      title: "Morning Rituals",
      steps: [
        "Holy dip in Ganga at sunrise",
        "Sankalp at the Ghats",
        "Offer Jal at Kashi Vishwanath temple",
        "Evening Ganga Aarti"
      ]
    },
    itinerary: [
      { day: 1, title: "Arrival & Ghats", description: "Walking tour of old Kashi alleys." },
      { day: 2, title: "Main Darshan", description: "Early morning temple visit followed by boat ride." },
      { day: 3, title: "Sarnath Visit", description: "Spiritual peace at the Buddha's first sermon site." }
    ],
    travelInfo: {
      air: "Lal Bahadur Shastri Airport, Varanasi",
      train: "Varanasi Junction (BSB)",
      road: "Connected by NH19"
    },
    stay: "Boutique hotels by the ghats or budget dharamshalas in the city.",
    facilities: ["Wheelchair access", "Locker facilities", "Guide services"],
    tips: ["Dress modestly", "Beware of touts", "Best explored by foot or cycle rickshaw"],
    bestTime: "October to March"
  },
  {
    id: "vaishno-devi",
    title: "Vaishno Devi",
    region: "Jammu & Kashmir",
    duration: "4 Days",
    difficulty: "Moderate",
    budget: "₹12,000",
    tag: "Mother's Call",
    img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
    spiritualInsight: "The cave of Mata Vaishno Devi is where the Goddess manifested her three forms—Maha Kali, Maha Lakshmi, and Maha Saraswati.",
    story: "Legend has it that Mata Vaishno Devi hid in the Trikuta mountains to escape Bhairon Nath, eventually attaining her supreme form there.",
    ritualGuidance: {
      title: "The Yatra Path",
      steps: [
        "Registration at Katra",
        "Ban Ganga first stop",
        "Ardh Kuwari meditation",
        "Bhawan Darshan",
        "Bhairon Nath temple (mandatory conclusion)"
      ]
    },
    itinerary: [
      { day: 1, title: "Katra Arrival", description: "Prepare for the trek and register." },
      { day: 2, title: "The Ascent", description: "13km trek to the Bhawan." },
      { day: 3, title: "Darshan & Return", description: "Morning darshan and descent via Bhairon Ghati." },
      { day: 4, title: "Departure", description: "Return from Katra." }
    ],
    travelInfo: {
      air: "Jammu Airport",
      train: "Shri Mata Vaishno Devi Katra (SVDK)",
      road: "Bus services from Jammu and Delhi"
    },
    stay: "Shrine Board managed accommodations are highly recommended.",
    facilities: ["Oxygen parlors", "Electric vehicles", "Helicopter services"],
    tips: ["Book darshan slip in advance", "Avoid heavy luggage", "Comfortable walking shoes are a must"],
    bestTime: "March to October (avoid peak festival seasons for crowds)"
  }
];
