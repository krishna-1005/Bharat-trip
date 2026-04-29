import jaipurImg from "@/assets/dest-jaipur.jpg";
import goaImg from "@/assets/dest-goa.jpg";
import rishikeshImg from "@/assets/dest-rishikesh.jpg";
import keralaImg from "@/assets/dest-kerala.jpg";
import varanasiImg from "@/assets/dest-varanasi.jpg";
import himalayasImg from "@/assets/dest-himalayas.jpg";
import coorgImg from "@/assets/dest-coorg.jpg";
import munnarImg from "@/assets/dest-munnar.jpg";
import ladakhImg from "@/assets/dest-ladakh.jpg";
import hampiImg from "@/assets/dest-hampi.jpg";

export const destinations = [
  { id: "jaipur", name: "Jaipur", region: "Rajasthan", tag: "Heritage", days: "4 days", price: "₹18,500", rating: 4.8, img: jaipurImg, isInternational: false },
  { id: "goa", name: "Goa", region: "West Coast", tag: "Beaches", days: "5 days", price: "₹22,900", rating: 4.7, img: goaImg, isInternational: false },
  { id: "rishikesh", name: "Rishikesh", region: "Uttarakhand", tag: "Spiritual", days: "3 days", price: "₹14,200", rating: 4.6, img: rishikeshImg, isInternational: false },
  { id: "kerala", name: "Kerala Backwaters", region: "Kerala", tag: "Nature", days: "6 days", price: "₹28,400", rating: 4.9, img: keralaImg, isInternational: false },
  { id: "varanasi", name: "Varanasi", region: "Uttar Pradesh", tag: "Spiritual", days: "3 days", price: "₹12,800", rating: 4.5, img: varanasiImg, isInternational: false },
  { id: "himalayas", name: "Himalayas", region: "Himachal", tag: "Mountains", days: "7 days", price: "₹32,000", rating: 4.9, img: himalayasImg, isInternational: false },
  { id: "coorg", name: "Coorg", region: "Karnataka", tag: "Hills", days: "4 days", price: "₹19,600", rating: 4.7, img: coorgImg, isInternational: false },
  { id: "munnar", name: "Munnar", region: "Kerala", tag: "Hills", days: "4 days", price: "₹17,900", rating: 4.6, img: munnarImg, isInternational: false },
  { id: "ladakh", name: "Ladakh", region: "Ladakh", tag: "Mountains", days: "8 days", price: "₹39,500", rating: 4.9, img: ladakhImg, isInternational: false },
  { id: "hampi", name: "Hampi", region: "Karnataka", tag: "Heritage", days: "3 days", price: "₹13,400", rating: 4.7, img: hampiImg, isInternational: false },
  { id: "paris", name: "Paris", region: "France", tag: "Heritage", days: "5 days", price: "₹1,25,000", rating: 4.9, img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80", isInternational: true },
  { id: "dubai", name: "Dubai", region: "UAE", tag: "Modern", days: "4 days", price: "₹85,000", rating: 4.8, img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80", isInternational: true },
  { id: "bali", name: "Bali", region: "Indonesia", tag: "Nature", days: "6 days", price: "₹65,000", rating: 4.9, img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80", isInternational: true },
  { id: "tokyo", name: "Tokyo", region: "Japan", tag: "Culture", days: "5 days", price: "₹1,45,000", rating: 4.9, img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80", isInternational: true },
  { id: "singapore", name: "Singapore", region: "Singapore", tag: "Modern", days: "4 days", price: "₹75,000", rating: 4.7, img: "https://images.unsplash.com/photo-1525625230556-8e8ad36c6eb2?auto=format&fit=crop&w=800&q=80", isInternational: true },
  { id: "rome", name: "Rome", region: "Italy", tag: "Heritage", days: "5 days", price: "₹1,15,000", rating: 4.8, img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80", isInternational: true },
];

export const destinationItineraries: Record<string, any[]> = {
  jaipur: [
    {
      day: 1,
      title: "Arrival & Old City Walk",
      items: [
        { time: "10:00", place: "Jaipur Airport", desc: "Pickup & transfer to heritage haveli", icon: "plane", lat: 26.8289, lng: 75.8056 },
        { time: "13:30", place: "Lunch at Suvarna Mahal", desc: "Royal Rajasthani thali experience", icon: "utensils", lat: 26.8925, lng: 75.8114 },
        { time: "17:00", place: "Hawa Mahal", desc: "Golden hour photography walk", icon: "camera", lat: 26.9239, lng: 75.8267 },
      ],
    },
    {
      day: 2,
      title: "Forts & Palaces",
      items: [
        { time: "08:00", place: "Amer Fort", desc: "Sunrise visit, mirror palace tour", icon: "landmark", lat: 26.9855, lng: 75.8513 },
        { time: "12:30", place: "Jal Mahal", desc: "Lakeside lunch & boat ride", icon: "ship", lat: 26.9535, lng: 75.8462 },
        { time: "19:00", place: "Chokhi Dhani", desc: "Folk dance & cultural dinner", icon: "music", lat: 26.7670, lng: 75.8353 },
      ],
    },
    {
      day: 3,
      title: "Royal Markets & Arts",
      items: [
        { time: "09:30", place: "Johari Bazaar", desc: "Jewellery & textile shopping", icon: "shopping-bag", lat: 26.9200, lng: 75.8270 },
        { time: "14:00", place: "City Palace Museum", desc: "Royal artifacts & courtyards", icon: "landmark", lat: 26.9258, lng: 75.8236 },
        { time: "17:30", place: "Nahargarh Fort", desc: "Sunset views over the Pink City", icon: "camera", lat: 26.9374, lng: 75.8156 },
      ],
    },
    {
      day: 4,
      title: "Temple Trail & Departure",
      items: [
        { time: "08:30", place: "Birla Mandir", desc: "White marble temple architecture", icon: "landmark", lat: 26.8923, lng: 75.8153 },
        { time: "11:00", place: "Albert Hall Museum", desc: "State museum tour", icon: "camera", lat: 26.9116, lng: 75.8193 },
        { time: "15:00", place: "Departure", desc: "Transfer to airport", icon: "plane", lat: 26.8289, lng: 75.8056 },
      ],
    },
  ],
  goa: [
    {
      day: 1,
      title: "Beach Vibes & Sunsets",
      items: [
        { time: "11:00", place: "Dabolim Airport", desc: "Transfer to North Goa resort", icon: "plane", lat: 15.3800, lng: 73.8333 },
        { time: "15:00", place: "Anjuna Beach", desc: "Beachside shacks & relaxation", icon: "sun", lat: 15.5828, lng: 73.7411 },
        { time: "18:30", place: "Thalassa", desc: "Greek dinner with sunset views", icon: "utensils", lat: 15.5975, lng: 73.7336 },
      ],
    },
    {
      day: 2,
      title: "Heritage & Water Sports",
      items: [
        { time: "09:00", place: "Aguada Fort", desc: "Historic lighthouse & sea views", icon: "landmark", lat: 15.4920, lng: 73.7731 },
        { time: "13:00", place: "Calangute", desc: "Parasailing & jet skiing", icon: "ship", lat: 15.5494, lng: 73.7535 },
        { time: "20:00", place: "Tito's Lane", desc: "Nightlife & music in Baga", icon: "music", lat: 15.5555, lng: 73.7517 },
      ],
    },
    {
      day: 3,
      title: "South Goa Serenity",
      items: [
        { time: "10:00", place: "Palolem Beach", desc: "Quiet morning at the crescent beach", icon: "sun", lat: 15.0100, lng: 74.0232 },
        { time: "13:00", place: "Cabo de Rama Fort", desc: "Ocean views from historic ruins", icon: "landmark", lat: 15.0894, lng: 73.9189 },
        { time: "17:00", place: "Colva Beach", desc: "Relaxing evening by the waves", icon: "sun", lat: 15.2713, lng: 73.9116 },
      ],
    },
    {
      day: 4,
      title: "Old Goa & Churches",
      items: [
        { time: "10:00", place: "Basilica of Bom Jesus", desc: "UNESCO World Heritage site", icon: "landmark", lat: 15.5009, lng: 73.9116 },
        { time: "14:00", place: "Panjim Latin Quarter", desc: "Fontainhas colorful streets walk", icon: "camera", lat: 15.4909, lng: 73.8331 },
        { time: "18:00", place: "Casino Cruise", desc: "Mandovi river evening cruise", icon: "ship", lat: 15.4989, lng: 73.8278 },
      ],
    },
    {
      day: 5,
      title: "Markets & Departure",
      items: [
        { time: "10:00", place: "Mapusa Market", desc: "Traditional Goan shopping", icon: "shopping-bag", lat: 15.5937, lng: 73.8131 },
        { time: "13:00", place: "Miramar Beach", desc: "Last walk by the shore", icon: "sun", lat: 15.4850, lng: 73.8100 },
        { time: "16:00", place: "Departure", desc: "Transfer to airport", icon: "plane", lat: 15.3800, lng: 73.8333 },
      ],
    },
  ],
  rishikesh: [
    {
      day: 1,
      title: "Ganga Aarti & Temples",
      items: [
        { time: "11:00", place: "Dehradun Airport", desc: "Transfer to yoga ashram", icon: "plane", lat: 30.1897, lng: 78.3753 },
        { time: "15:00", place: "Laxman Jhula", desc: "Iconic suspension bridge walk", icon: "camera", lat: 30.1300, lng: 78.3300 },
        { time: "18:00", place: "Triveni Ghat", desc: "Spiritual evening Ganga Aarti", icon: "music", lat: 30.1030, lng: 78.2980 },
      ],
    },
    {
      day: 2,
      title: "Adventure & Peace",
      items: [
        { time: "08:00", place: "Shivpuri", desc: "White water river rafting", icon: "ship", lat: 30.1300, lng: 78.3900 },
        { time: "13:00", place: "Beatles Ashram", desc: "Art & meditation ruins tour", icon: "landmark", lat: 30.1197, lng: 78.3121 },
        { time: "17:00", place: "Ganga Beach", desc: "Meditation by the river banks", icon: "sun", lat: 30.1250, lng: 78.3200 },
      ],
    },
    {
      day: 3,
      title: "Yoga & Mountains",
      items: [
        { time: "07:00", place: "Parmarth Niketan", desc: "Morning yoga session", icon: "sun", lat: 30.1190, lng: 78.3150 },
        { time: "11:00", place: "Neer Garh Falls", desc: "Trek to hidden waterfalls", icon: "camera", lat: 30.1400, lng: 78.3500 },
        { time: "15:00", place: "Departure", desc: "Transfer to airport", icon: "plane", lat: 30.1897, lng: 78.3753 },
      ],
    },
  ],
  kerala: [
    {
      day: 1,
      title: "Kochi Arrival & Culture",
      items: [
        { time: "10:00", place: "Kochi Airport", desc: "Transfer to Fort Kochi", icon: "plane", lat: 10.1520, lng: 76.3920 },
        { time: "15:00", place: "Chinese Fishing Nets", desc: "Iconic waterfront exploration", icon: "camera", lat: 9.9667, lng: 76.2427 },
        { time: "18:30", place: "Kathakali Centre", desc: "Traditional dance performance", icon: "music", lat: 9.9675, lng: 76.2435 },
      ],
    },
    {
      day: 2,
      title: "Drive to Munnar Hills",
      items: [
        { time: "09:00", place: "Munnar Road", desc: "Scenic drive through waterfalls", icon: "plane", lat: 10.0889, lng: 77.0595 },
        { time: "14:00", place: "Tea Museum", desc: "Learn about tea processing", icon: "landmark", lat: 10.0935, lng: 77.0601 },
        { time: "17:00", place: "Pothamedu View", desc: "Stunning valley views", icon: "camera", lat: 10.0600, lng: 77.0500 },
      ],
    },
    {
      day: 3,
      title: "Eravikulam & Lakes",
      items: [
        { time: "08:30", place: "Eravikulam Park", desc: "Spotting Nilgiri Tahr", icon: "sun", lat: 10.1500, lng: 77.0600 },
        { time: "13:30", place: "Mattupetty Dam", desc: "Boating in the reservoir", icon: "ship", lat: 10.1060, lng: 77.1240 },
        { time: "16:30", place: "Echo Point", desc: "Natural echo phenomena", icon: "music", lat: 10.1200, lng: 77.1600 },
      ],
    },
    {
      day: 4,
      title: "Alleppey Houseboat",
      items: [
        { time: "12:00", place: "Punnamada Lake", desc: "Board luxury houseboat", icon: "ship", lat: 9.5100, lng: 76.3500 },
        { time: "14:00", place: "Backwater Cruise", desc: "Lunch while sailing through canals", icon: "utensils", lat: 9.4933, lng: 76.3333 },
        { time: "19:00", place: "Overnight Stay", desc: "Dinner under the stars on boat", icon: "sun", lat: 9.4981, lng: 76.3275 },
      ],
    },
    {
      day: 5,
      title: "Marari Beach Serenity",
      items: [
        { time: "10:00", place: "Marari Beach", desc: "Check-in to beach villa", icon: "sun", lat: 9.6000, lng: 76.3000 },
        { time: "14:00", place: "Village Walk", desc: "Exploring local life", icon: "camera", lat: 9.6100, lng: 76.3100 },
        { time: "18:00", place: "Sunset Yoga", desc: "Relaxation by the waves", icon: "sun", lat: 9.6050, lng: 76.3050 },
      ],
    },
    {
      day: 6,
      title: "Shopping & Departure",
      items: [
        { time: "10:00", place: "Kochi Markets", desc: "Buying spices & handicrafts", icon: "shopping-bag", lat: 9.9600, lng: 76.2500 },
        { time: "15:00", place: "Departure", desc: "Transfer to airport", icon: "plane", lat: 10.1520, lng: 76.3920 },
      ],
    },
  ],
  munnar: [
    {
      day: 1,
      title: "Tea Garden Immersion",
      items: [
        { time: "10:00", place: "Kochi Airport", desc: "Scenic drive to Munnar (4 hrs)", icon: "plane", lat: 10.1520, lng: 76.3920 },
        { time: "15:00", place: "Tea Museum", desc: "Learn about tea processing", icon: "landmark", lat: 10.0935, lng: 77.0601 },
        { time: "17:30", place: "Pothamedu Viewpoint", desc: "Panorama of tea estates", icon: "camera", lat: 10.0600, lng: 77.0500 },
      ],
    },
    {
      day: 2,
      title: "Peaks & Lakes",
      items: [
        { time: "08:30", place: "Eravikulam Park", desc: "Spotting Nilgiri Tahr at Rajamala", icon: "sun", lat: 10.1500, lng: 77.0600 },
        { time: "13:00", place: "Mattupetty Dam", desc: "Boating & elephant sightings", icon: "ship", lat: 10.1060, lng: 77.1240 },
        { time: "16:00", place: "Echo Point", desc: "Natural echo phenomenon walk", icon: "music", lat: 10.1200, lng: 77.1600 },
      ],
    },
    {
      day: 3,
      title: "Waterfalls & Spice Trails",
      items: [
        { time: "09:30", place: "Attukad Waterfalls", desc: "Trekking through spice gardens", icon: "camera", lat: 10.0500, lng: 77.0300 },
        { time: "13:00", place: "Blossom Park", desc: "Flower gardens & river walk", icon: "landmark", lat: 10.0800, lng: 77.0500 },
        { time: "16:30", place: "Kundala Lake", desc: "Pedal boat ride in pine forest", icon: "ship", lat: 10.1341, lng: 77.2415 },
      ],
    },
    {
      day: 4,
      title: "Top Station & Departure",
      items: [
        { time: "08:30", place: "Top Station", desc: "Breathtaking views of Tamil Nadu", icon: "camera", lat: 10.1224, lng: 77.2443 },
        { time: "12:00", place: "Marayoor Sandalwood", desc: "Ancient dolmens exploration", icon: "landmark", lat: 10.2800, lng: 77.1500 },
        { time: "16:00", place: "Departure", desc: "Transfer back to Kochi", icon: "plane", lat: 10.1520, lng: 76.3920 },
      ],
    },
  ],
  varanasi: [
    {
      day: 1,
      title: "The Holy City",
      items: [
        { time: "11:00", place: "Lal Bahadur Shastri Airport", desc: "Transfer to ghat-side boutique hotel", icon: "plane", lat: 25.4497, lng: 82.8593 },
        { time: "16:00", place: "Old City Walk", desc: "Guided narrow alley exploration", icon: "landmark", lat: 25.3176, lng: 83.0062 },
        { time: "18:30", place: "Dashashwamedh Ghat", desc: "Witness the grand evening Ganga Aarti", icon: "music", lat: 25.3068, lng: 83.0103 },
      ],
    },
    {
      day: 2,
      title: "Ghats & Sarnath",
      items: [
        { time: "05:30", place: "Subah-e-Banaras", desc: "Sunrise boat ride on the Ganges", icon: "ship", lat: 25.3100, lng: 83.0100 },
        { time: "10:30", place: "Sarnath", desc: "Visit the Dhamek Stupa and museum", icon: "landmark", lat: 25.3762, lng: 83.0227 },
        { time: "17:00", place: "Assi Ghat", desc: "Cultural evening and snacks", icon: "utensils", lat: 25.2897, lng: 83.0065 },
      ],
    },
    {
      day: 3,
      title: "Temple Trail & Silk",
      items: [
        { time: "09:00", place: "Kashi Vishwanath", desc: "Visit the golden temple of Shiva", icon: "landmark", lat: 25.3109, lng: 83.0107 },
        { time: "12:00", place: "Banaras Weaving Centre", desc: "Experience famous silk weaving", icon: "shopping-bag", lat: 25.3300, lng: 83.0000 },
        { time: "15:00", place: "Departure", desc: "Transfer to airport", icon: "plane", lat: 25.4497, lng: 82.8593 },
      ],
    },
  ],
  himalayas: [
    {
      day: 1,
      title: "Mountain Gateway",
      items: [
        { time: "10:00", place: "Shimla Mall Road", desc: "Walk through colonial architecture", icon: "landmark", lat: 31.1048, lng: 77.1734 },
        { time: "14:00", place: "Jakhu Temple", desc: "Hilltop temple with monkey views", icon: "camera", lat: 31.1011, lng: 77.1852 },
        { time: "17:00", place: "Ridge Walk", desc: "Panoramic views of the peaks", icon: "camera", lat: 31.1044, lng: 77.1722 },
      ],
    },
    {
      day: 2,
      title: "Apple Orchards & Valleys",
      items: [
        { time: "09:00", place: "Kufri", desc: "Snow point and panoramic views", icon: "sun", lat: 31.1000, lng: 77.2667 },
        { time: "15:00", place: "Narkanda", desc: "Drive through dense cedar forests", icon: "camera", lat: 31.2583, lng: 77.4586 },
        { time: "19:00", place: "Local Homestay", desc: "Traditional Pahari dinner", icon: "utensils", lat: 31.2500, lng: 77.4500 },
      ],
    },
    {
      day: 3,
      title: "Manali Drive & Beas River",
      items: [
        { time: "08:00", place: "Pandoh Dam", desc: "Scenic stop on the way to Manali", icon: "camera", lat: 31.6700, lng: 77.0700 },
        { time: "15:00", place: "Old Manali", desc: "Riverside cafes and cedar forests", icon: "utensils", lat: 32.2475, lng: 77.1800 },
        { time: "18:00", place: "Hadimba Temple", desc: "Ancient wooden temple in the woods", icon: "landmark", lat: 32.2483, lng: 77.1781 },
      ],
    },
    {
      day: 4,
      title: "Solang Valley Adventure",
      items: [
        { time: "09:00", place: "Solang Valley", desc: "Paragliding and snow activities", icon: "sun", lat: 32.3167, lng: 77.1500 },
        { time: "14:00", place: "Vashisht Hot Springs", desc: "Natural thermal baths", icon: "sun", lat: 32.2600, lng: 77.1900 },
      ],
    },
    {
      day: 5,
      title: "Rohtang Pass Experience",
      items: [
        { time: "08:00", place: "Rohtang Pass", desc: "High altitude snow desert exploration", icon: "camera", lat: 32.3700, lng: 77.2400 },
        { time: "16:00", place: "Mall Road Manali", desc: "Evening shopping and snacks", icon: "shopping-bag", lat: 32.2400, lng: 77.1900 },
      ],
    },
    {
      day: 6,
      title: "Kasol & Manikaran",
      items: [
        { time: "09:00", place: "Kasol", desc: "Mini Israel of India riverside walk", icon: "sun", lat: 32.0100, lng: 77.3100 },
        { time: "13:00", place: "Manikaran Sahib", desc: "Hot springs and holy shrine", icon: "landmark", lat: 32.0200, lng: 77.3400 },
      ],
    },
    {
      day: 7,
      title: "Kullu Valley & Departure",
      items: [
        { time: "10:00", place: "Kullu Shawl Factory", desc: "Authentic weaving experience", icon: "shopping-bag", lat: 31.9500, lng: 77.1000 },
        { time: "15:00", place: "Departure", desc: "Transfer to airport/station", icon: "plane", lat: 31.9500, lng: 77.1000 },
      ],
    },
  ],
  coorg: [
    {
      day: 1,
      title: "Coffee & Culture",
      items: [
        { time: "11:00", place: "Madikeri Fort", desc: "Historic fort and museum tour", icon: "landmark", lat: 12.4217, lng: 75.7383 },
        { time: "15:00", place: "Abbey Falls", desc: "Lush waterfall exploration", icon: "camera", lat: 12.4411, lng: 75.7214 },
        { time: "18:00", place: "Raja's Seat", desc: "Panoramic sunset garden", icon: "camera", lat: 12.4131, lng: 75.7383 },
      ],
    },
    {
      day: 2,
      title: "Elephant Camp & Monasteries",
      items: [
        { time: "09:00", place: "Dubare Elephant Camp", desc: "Interaction and bathing experience", icon: "sun", lat: 12.3686, lng: 75.9039 },
        { time: "14:00", place: "Namdroling Monastery", desc: "Golden Temple Tibetan architecture", icon: "landmark", lat: 12.4286, lng: 75.9686 },
        { time: "17:00", place: "Cauvery Nisargadhama", desc: "Bamboo forest and river island", icon: "sun", lat: 12.4500, lng: 75.9300 },
      ],
    },
    {
      day: 3,
      title: "Tala Kaveri Spiritual Journey",
      items: [
        { time: "09:00", place: "Tala Kaveri", desc: "Source of River Kaveri in Brahmagiri hills", icon: "landmark", lat: 12.3800, lng: 75.4800 },
        { time: "13:00", place: "Bhagamandala", desc: "Temple at the confluence of three rivers", icon: "landmark", lat: 12.3900, lng: 75.5300 },
        { time: "16:00", place: "Coffee Plantation", desc: "Guided bean-to-cup coffee tour", icon: "camera", lat: 12.4200, lng: 75.7400 },
      ],
    },
    {
      day: 4,
      title: "Wildlife & Departure",
      items: [
        { time: "08:00", place: "Nagarhole Park", desc: "Early morning safari (nearby)", icon: "sun", lat: 12.0300, lng: 76.1200 },
        { time: "13:00", place: "Iruppu Falls", desc: "Freshwater cascade in the jungle", icon: "camera", lat: 12.0300, lng: 75.9500 },
        { time: "16:00", place: "Departure", desc: "Transfer to Mangalore/Mysore", icon: "plane", lat: 12.4200, lng: 75.7300 },
      ],
    },
  ],
  ladakh: [
    {
      day: 1,
      title: "Acclimatization in Leh",
      items: [
        { time: "09:00", place: "Leh Airport", desc: "Transfer to hotel and rest for altitude", icon: "plane", lat: 34.1444, lng: 77.5551 },
        { time: "16:00", place: "Shanti Stupa", desc: "Sunset views over Leh city", icon: "landmark", lat: 34.1683, lng: 77.5775 },
        { time: "18:00", place: "Leh Palace", desc: "Evening walk through the royal ruins", icon: "landmark", lat: 34.1663, lng: 77.5855 },
      ],
    },
    {
      day: 2,
      title: "Monasteries & Markets",
      items: [
        { time: "10:00", place: "Thiksey Monastery", desc: "Morning prayers and art tour", icon: "landmark", lat: 34.0561, lng: 77.6669 },
        { time: "13:00", place: "Hemis Monastery", desc: "Hidden spiritual giant in the valley", icon: "landmark", lat: 33.9125, lng: 77.7011 },
        { time: "16:00", place: "Leh Main Bazaar", desc: "Shopping for local handicrafts", icon: "shopping-bag", lat: 34.1642, lng: 77.5848 },
      ],
    },
    {
      day: 3,
      title: "Nubra Valley via Khardung La",
      items: [
        { time: "08:00", place: "Khardung La", desc: "Pass at world's highest motorable road", icon: "camera", lat: 34.2700, lng: 77.6000 },
        { time: "14:00", place: "Diskit Monastery", desc: "Giant Buddha overlooking the valley", icon: "landmark", lat: 34.5400, lng: 77.5600 },
        { time: "17:00", place: "Hunder Sand Dunes", desc: "Double-humped camel safari", icon: "sun", lat: 34.5800, lng: 77.4700 },
      ],
    },
    {
      day: 4,
      title: "Pangong Lake Experience",
      items: [
        { time: "09:00", place: "Pangong Tso", desc: "Breathtaking high-altitude blue lake", icon: "camera", lat: 33.7500, lng: 78.6667 },
        { time: "15:00", place: "Chang La Pass", desc: "Rugged beauty at 17,500 feet", icon: "camera", lat: 34.0400, lng: 77.9300 },
      ],
    },
    {
      day: 5,
      title: "Tso Moriri Journey",
      items: [
        { time: "09:00", place: "Tso Moriri", desc: "Hidden salt water lake exploration", icon: "camera", lat: 32.9000, lng: 78.3100 },
        { time: "16:00", place: "Korzok Village", desc: "Experience nomadic life and culture", icon: "landmark", lat: 32.9600, lng: 78.3300 },
      ],
    },
    {
      day: 6,
      title: "Magnetic Hill & Hall of Fame",
      items: [
        { time: "10:00", place: "Magnetic Hill", desc: "Gravity-defying natural phenomenon", icon: "sun", lat: 34.1700, lng: 77.4100 },
        { time: "13:00", place: "Hall of Fame", desc: "War museum dedicated to soldiers", icon: "landmark", lat: 34.1500, lng: 77.5400 },
      ],
    },
    {
      day: 7,
      title: "Alchi & Lamayuru",
      items: [
        { time: "09:00", place: "Alchi Monastery", desc: "Oldest monastery complex in Ladakh", icon: "landmark", lat: 34.2200, lng: 77.1700 },
        { time: "14:00", place: "Lamayuru Moonland", desc: "Breathtaking lunar landscapes", icon: "camera", lat: 34.2800, lng: 76.7700 },
      ],
    },
    {
      day: 8,
      title: "Final Souvenirs & Departure",
      items: [
        { time: "09:00", place: "Leh Market", desc: "Last minute shopping for apricot and woolens", icon: "shopping-bag", lat: 34.1600, lng: 77.5800 },
        { time: "13:00", place: "Departure", desc: "Transfer to Leh Airport", icon: "plane", lat: 34.1400, lng: 77.5500 },
      ],
    },
  ],
  hampi: [
    {
      day: 1,
      title: "The Lost Kingdom",
      items: [
        { time: "09:00", place: "Virupaksha Temple", desc: "Guided tour of the ancient living temple", icon: "landmark", lat: 15.3350, lng: 76.4580 },
        { time: "15:00", place: "Vittala Temple", desc: "Stone chariot and musical pillars", icon: "camera", lat: 15.3391, lng: 76.4789 },
        { time: "18:00", place: "Matanga Hill", desc: "Short trek for the best Hampi sunset", icon: "camera", lat: 15.3333, lng: 76.4667 },
      ],
    },
    {
      day: 2,
      title: "Riverside Ruins",
      items: [
        { time: "10:00", place: "Tungabhadra River", desc: "Coracle boat ride through boulder landscapes", icon: "ship", lat: 15.3400, lng: 76.4600 },
        { time: "14:00", place: "Lotus Mahal", desc: "Indo-Islamic architectural gems", icon: "landmark", lat: 15.3283, lng: 76.4700 },
        { time: "17:00", place: "Elephant Stables", desc: "Royal structures from the empire", icon: "landmark", lat: 15.3300, lng: 76.4750 },
      ],
    },
    {
      day: 3,
      title: "Anegundi & Departure",
      items: [
        { time: "09:00", place: "Hanuman Temple", desc: "Climbing Anjanadri Hill for views", icon: "landmark", lat: 15.3400, lng: 76.4800 },
        { time: "12:00", place: "Hazara Rama Temple", desc: "Epic carvings and royal enclosure", icon: "landmark", lat: 15.3280, lng: 76.4650 },
        { time: "15:00", place: "Departure", desc: "Transfer to Hospet station", icon: "plane", lat: 15.2689, lng: 76.3909 },
      ],
    },
  ],
  paris: [
    {
      day: 1,
      title: "Arrival & Eiffel Magic",
      items: [
        { time: "10:00", place: "CDG Airport", desc: "Private transfer to luxury hotel in Le Marais", icon: "plane", lat: 49.0097, lng: 2.5479 },
        { time: "14:00", place: "Le Marais District", desc: "Guided walk through historic alleys and cafes", icon: "landmark", lat: 48.8575, lng: 2.3600 },
        { time: "18:00", place: "Eiffel Tower", desc: "Champagne toast and sunset photography", icon: "camera", lat: 48.8584, lng: 2.2945 },
      ],
    },
    {
      day: 2,
      title: "Art & Culture Immersion",
      items: [
        { time: "09:00", place: "The Louvre", desc: "VIP skip-the-line tour of masterworks", icon: "landmark", lat: 48.8606, lng: 2.3376 },
        { time: "13:00", place: "Jardin des Tuileries", desc: "Al-fresco lunch in the royal gardens", icon: "utensils", lat: 48.8635, lng: 2.3275 },
        { time: "16:00", place: "Montmartre", desc: "Artist square and Sacré-Cœur Basilica", icon: "camera", lat: 48.8867, lng: 2.3431 },
      ],
    },
    {
      day: 3,
      title: "Palatial Grandeur",
      items: [
        { time: "09:30", place: "Versailles Palace", desc: "Full day exploration of royal gardens and hall of mirrors", icon: "landmark", lat: 48.8049, lng: 2.1204 },
        { time: "19:00", place: "Seine River Cruise", desc: "Gourmet dinner cruise through the heart of Paris", icon: "ship", lat: 48.8617, lng: 2.3275 },
      ],
    },
    {
      day: 4,
      title: "Bohemian Rhythms",
      items: [
        { time: "10:00", place: "Saint-Germain-des-Prés", desc: "Historic literary cafes and boutiques", icon: "shopping-bag", lat: 48.8533, lng: 2.3333 },
        { time: "15:00", place: "Musée d'Orsay", desc: "Impressionist masterpieces in a grand station", icon: "landmark", lat: 48.8594, lng: 2.3265 },
        { time: "20:00", place: "Latin Quarter", desc: "Evening walk and traditional bistro dinner", icon: "utensils", lat: 48.8500, lng: 2.3444 },
      ],
    },
    {
      day: 5,
      title: "Leisure & Departure",
      items: [
        { time: "10:00", place: "Canal Saint-Martin", desc: "Relaxing walk along the trendy waterways", icon: "sun", lat: 48.8714, lng: 2.3622 },
        { time: "13:00", place: "Galeries Lafayette", desc: "Luxury shopping and rooftop views", icon: "shopping-bag", lat: 48.8736, lng: 2.3322 },
        { time: "17:00", place: "CDG Airport", desc: "Departure transfer", icon: "plane", lat: 49.0097, lng: 2.5479 },
      ],
    },
  ],
  dubai: [
    {
      day: 1,
      title: "Skyline & Shopping",
      items: [
        { time: "11:00", place: "Dubai International", desc: "Luxury car transfer to Downtown hotel", icon: "plane", lat: 25.2532, lng: 55.3657 },
        { time: "15:00", place: "Dubai Mall", desc: "Explore the world's largest mall and aquarium", icon: "shopping-bag", lat: 25.1972, lng: 55.2797 },
        { time: "18:30", place: "Burj Khalifa", desc: "Sunset views from the 148th floor", icon: "camera", lat: 25.1972, lng: 55.2744 },
      ],
    },
    {
      day: 2,
      title: "Desert & Heritage",
      items: [
        { time: "09:00", place: "Old Dubai & Souks", desc: "Gold and spice market cultural walk", icon: "landmark", lat: 25.2697, lng: 55.2975 },
        { time: "15:00", place: "Desert Safari", desc: "Dune bashing, camel riding and starlit BBQ", icon: "sun", lat: 24.9500, lng: 55.3500 },
      ],
    },
    {
      day: 3,
      title: "Island Luxury",
      items: [
        { time: "10:00", place: "Palm Jumeirah", desc: "Visit Atlantis and The View at The Palm", icon: "sun", lat: 25.1124, lng: 55.1390 },
        { time: "15:00", place: "Dubai Marina", desc: "Luxury yacht cruise along the skyline", icon: "ship", lat: 25.0805, lng: 55.1403 },
        { time: "20:00", place: "JBR The Walk", desc: "Beachfront dining and evening stroll", icon: "utensils", lat: 25.0760, lng: 55.1300 },
      ],
    },
    {
      day: 4,
      title: "Modern Marvels & Departure",
      items: [
        { time: "10:00", place: "Museum of the Future", desc: "Exploring tomorrow's technology", icon: "landmark", lat: 25.2192, lng: 55.2819 },
        { time: "14:00", place: "Madinat Jumeirah", desc: "Traditional souk with Burj Al Arab views", icon: "shopping-bag", lat: 25.1328, lng: 55.1844 },
        { time: "18:00", place: "Dubai International", desc: "Departure transfer", icon: "plane", lat: 25.2532, lng: 55.3657 },
      ],
    },
  ],
  bali: [
    {
      day: 1,
      title: "Ubud Serenity",
      items: [
        { time: "10:00", place: "Ngurah Rai Airport", desc: "Transfer to lush Ubud villa", icon: "plane", lat: -8.7481, lng: 115.1671 },
        { time: "15:00", place: "Sacred Monkey Forest", desc: "Walk through the ancient forest sanctuary", icon: "camera", lat: -8.5193, lng: 115.2588 },
        { time: "18:00", place: "Ubud Art Market", desc: "Traditional crafts and evening vibes", icon: "shopping-bag", lat: -8.5069, lng: 115.2625 },
      ],
    },
    {
      day: 2,
      title: "Temples & Terraces",
      items: [
        { time: "08:00", place: "Tegalalang Rice Terrace", desc: "Morning walk through green landscapes", icon: "sun", lat: -8.4333, lng: 115.2833 },
        { time: "13:00", place: "Tirta Empul", desc: "Holy water temple spiritual experience", icon: "landmark", lat: -8.4117, lng: 115.2875 },
        { time: "17:30", place: "Tanah Lot", desc: "Sunset views at the iconic sea temple", icon: "camera", lat: -8.6212, lng: 115.0868 },
      ],
    },
    {
      day: 3,
      title: "Coastal Bliss",
      items: [
        { time: "10:00", place: "Seminyak Beach", desc: "Surfing and beach club relaxation", icon: "sun", lat: -8.6913, lng: 115.1554 },
        { time: "16:00", place: "Uluwatu Temple", desc: "Cliffside temple and Kecak fire dance", icon: "landmark", lat: -8.8291, lng: 115.0849 },
      ],
    },
    {
      day: 4,
      title: "Nusa Penida Adventure",
      items: [
        { time: "08:00", place: "Sanur Port", desc: "Fast boat to Nusa Penida island", icon: "ship", lat: -8.6750, lng: 115.2639 },
        { time: "11:00", place: "Kelingking Beach", desc: "The famous T-Rex shaped cliff view", icon: "camera", lat: -8.7391, lng: 115.0868 },
      ],
    },
    {
      day: 5,
      title: "Waterfalls & Lakes",
      items: [
        { time: "09:00", place: "Ulun Danu Beratan", desc: "The iconic lake temple in the highlands", icon: "landmark", lat: -8.2752, lng: 115.1664 },
        { time: "14:00", place: "Sekumpul Waterfall", desc: "Trekking to Bali's most beautiful falls", icon: "sun", lat: -8.1733, lng: 115.1819 },
      ],
    },
    {
      day: 6,
      title: "South Bali Vibes & Departure",
      items: [
        { time: "10:00", place: "Canggu Village", desc: "Cafes and boutique shopping", icon: "shopping-bag", lat: -8.6478, lng: 115.1385 },
        { time: "17:00", place: "Ngurah Rai Airport", desc: "Departure transfer", icon: "plane", lat: -8.7481, lng: 115.1671 },
      ],
    },
  ],
  tokyo: [
    {
      day: 1,
      title: "Neon & Tradition",
      items: [
        { time: "11:00", place: "Narita Airport", desc: "Skyliner transfer to Shinjuku", icon: "plane", lat: 35.7720, lng: 140.3929 },
        { time: "15:00", place: "Meiji Jingu Shrine", desc: "Peaceful forest walk in the heart of the city", icon: "landmark", lat: 35.6764, lng: 139.6993 },
        { time: "19:00", place: "Shinjuku Omoide Yokocho", desc: "Izakaya dinner in historic narrow alleys", icon: "utensils", lat: 35.6931, lng: 139.6999 },
      ],
    },
    {
      day: 2,
      title: "Pop Culture & Views",
      items: [
        { time: "10:00", place: "Harajuku Takeshita Street", desc: "Teen fashion and quirky snacks", icon: "shopping-bag", lat: 35.6715, lng: 139.7032 },
        { time: "14:00", place: "Shibuya Crossing", desc: "World's busiest intersection experience", icon: "camera", lat: 35.6595, lng: 139.7005 },
        { time: "18:00", place: "Shibuya Sky", desc: "Panoramic city views at sunset", icon: "sun", lat: 35.6585, lng: 139.7015 },
      ],
    },
    {
      day: 3,
      title: "Ancient Temples & Otaku Culture",
      items: [
        { time: "09:00", place: "Senso-ji Temple", desc: "Tokyo's oldest temple in historic Asakusa", icon: "landmark", lat: 35.7148, lng: 139.7967 },
        { time: "13:00", place: "Akihabara Electric Town", desc: "Anime, gaming and electronics exploration", icon: "shopping-bag", lat: 35.6984, lng: 139.7700 },
        { time: "18:00", place: "Sumida River Cruise", desc: "Evening boat ride to Odaiba", icon: "ship", lat: 35.7100, lng: 139.8000 },
      ],
    },
    {
      day: 4,
      title: "Mount Fuji Day Trip",
      items: [
        { time: "08:00", place: "Lake Kawaguchi", desc: "Stunning views of Mt. Fuji across the water", icon: "sun", lat: 35.5171, lng: 138.7518 },
        { time: "13:00", place: "Oishi Park", desc: "Seasonal flowers with a mountain backdrop", icon: "camera", lat: 35.5235, lng: 138.7464 },
        { time: "16:00", place: "Chureito Pagoda", desc: "The iconic view of Fuji with the red pagoda", icon: "landmark", lat: 35.4968, lng: 138.8014 },
      ],
    },
    {
      day: 5,
      title: "Digital Art & Luxury",
      items: [
        { time: "10:00", place: "teamLab Borderless", desc: "Immersive digital art museum experience", icon: "camera", lat: 35.6263, lng: 139.7753 },
        { time: "14:00", place: "Ginza District", desc: "Luxury shopping and high-end architecture", icon: "shopping-bag", lat: 35.6717, lng: 139.7650 },
        { time: "18:00", place: "Haneda Airport", desc: "Departure transfer", icon: "plane", lat: 35.5494, lng: 139.7798 },
      ],
    },
  ],
  singapore: [
    {
      day: 1,
      title: "Garden City Arrival",
      items: [
        { time: "10:00", place: "Changi Airport", desc: "Explore Jewel Changi and waterfalls", icon: "plane", lat: 1.3644, lng: 103.9915 },
        { time: "15:00", place: "Gardens by the Bay", desc: "Cloud Forest and Supertree Grove tour", icon: "sun", lat: 1.2816, lng: 103.8636 },
        { time: "19:00", place: "Marina Bay Sands", desc: "Spectra light and water show", icon: "camera", lat: 1.2847, lng: 103.8610 },
      ],
    },
    {
      day: 2,
      title: "Culture & Cuisine",
      items: [
        { time: "09:30", place: "Chinatown Heritage", desc: "Temples and traditional shophouses", icon: "landmark", lat: 1.2841, lng: 103.8448 },
        { time: "12:30", place: "Maxwell Food Centre", desc: "Lunch at famous hawker stalls", icon: "utensils", lat: 1.2804, lng: 103.8448 },
        { time: "16:00", place: "Sentosa Island", desc: "Beach clubs and cable car ride", icon: "ship", lat: 1.2494, lng: 103.8303 },
      ],
    },
    {
      day: 3,
      title: "Zoo & Night Safaris",
      items: [
        { time: "10:00", place: "Singapore Zoo", desc: "Open-concept rainforest zoo experience", icon: "sun", lat: 1.4043, lng: 103.7930 },
        { time: "19:30", place: "Night Safari", desc: "World's first nocturnal wildlife park", icon: "camera", lat: 1.4022, lng: 103.7880 },
      ],
    },
    {
      day: 4,
      title: "Orchard Luxury & Departure",
      items: [
        { time: "10:00", place: "Orchard Road", desc: "Premier shopping belt exploration", icon: "shopping-bag", lat: 1.3048, lng: 103.8318 },
        { time: "15:00", place: "Fort Canning Park", desc: "Historic hill with scenic tunnels", icon: "landmark", lat: 1.2953, lng: 103.8463 },
        { time: "19:00", place: "Changi Airport", desc: "Departure transfer", icon: "plane", lat: 1.3644, lng: 103.9915 },
      ],
    },
  ],
  rome: [
    {
      day: 1,
      title: "Empire & Ruins",
      items: [
        { time: "10:00", place: "Fiumicino Airport", desc: "Transfer to historic center", icon: "plane", lat: 41.7999, lng: 12.2462 },
        { time: "14:00", place: "Colosseum", desc: "Guided tour of the gladiatorial arena", icon: "landmark", lat: 41.8902, lng: 12.4922 },
        { time: "17:00", place: "Roman Forum", desc: "Walk through the ancient heart of Rome", icon: "camera", lat: 41.8925, lng: 12.4853 },
      ],
    },
    {
      day: 2,
      title: "Art & Faith",
      items: [
        { time: "09:00", place: "Vatican Museums", desc: "Sistine Chapel and Raphael rooms", icon: "landmark", lat: 41.9065, lng: 12.4534 },
        { time: "14:00", place: "St. Peter's Basilica", desc: "Explore the world's largest church", icon: "camera", lat: 41.9022, lng: 12.4539 },
        { time: "19:00", place: "Trastevere", desc: "Traditional dinner in a lively neighborhood", icon: "utensils", lat: 41.8894, lng: 12.4667 },
      ],
    },
    {
      day: 3,
      title: "Piazzas & Fountains",
      items: [
        { time: "09:30", place: "Pantheon", desc: "Ancient temple with the giant dome", icon: "landmark", lat: 41.8986, lng: 12.4769 },
        { time: "12:00", place: "Trevi Fountain", desc: "Coin toss and gelato break", icon: "camera", lat: 41.9009, lng: 12.4833 },
        { time: "16:00", place: "Spanish Steps", desc: "Fashion district walk and sunset view", icon: "shopping-bag", lat: 41.9057, lng: 12.4823 },
      ],
    },
    {
      day: 4,
      title: "Borghese Gardens",
      items: [
        { time: "10:00", place: "Borghese Gallery", desc: "Masterpieces of Bernini and Caravaggio", icon: "landmark", lat: 41.9142, lng: 12.4921 },
        { time: "15:00", place: "Villa Borghese Park", desc: "Relaxing walk and lake rowing", icon: "sun", lat: 41.9128, lng: 12.4853 },
      ],
    },
    {
      day: 5,
      title: "Appian Way & Departure",
      items: [
        { time: "09:00", place: "Catacombs of Rome", desc: "Underground history exploration", icon: "landmark", lat: 41.8600, lng: 12.5100 },
        { time: "14:00", place: "Testaccio Market", desc: "Last authentic Roman food experience", icon: "utensils", lat: 41.8778, lng: 12.4761 },
        { time: "18:00", place: "Fiumicino Airport", desc: "Departure transfer", icon: "plane", lat: 41.7999, lng: 12.2462 },
      ],
    },
  ],
};

export const sampleItinerary = destinationItineraries.jaipur;
