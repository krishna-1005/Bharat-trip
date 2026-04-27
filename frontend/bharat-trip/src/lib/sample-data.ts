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
  { id: "jaipur", name: "Jaipur", region: "Rajasthan", tag: "Heritage", days: "4 days", price: "₹18,500", rating: 4.8, img: jaipurImg },
  { id: "goa", name: "Goa", region: "West Coast", tag: "Beaches", days: "5 days", price: "₹22,900", rating: 4.7, img: goaImg },
  { id: "rishikesh", name: "Rishikesh", region: "Uttarakhand", tag: "Spiritual", days: "3 days", price: "₹14,200", rating: 4.6, img: rishikeshImg },
  { id: "kerala", name: "Kerala Backwaters", region: "Kerala", tag: "Nature", days: "6 days", price: "₹28,400", rating: 4.9, img: keralaImg },
  { id: "varanasi", name: "Varanasi", region: "Uttar Pradesh", tag: "Spiritual", days: "3 days", price: "₹12,800", rating: 4.5, img: varanasiImg },
  { id: "himalayas", name: "Himalayas", region: "Himachal", tag: "Mountains", days: "7 days", price: "₹32,000", rating: 4.9, img: himalayasImg },
  { id: "coorg", name: "Coorg", region: "Karnataka", tag: "Hills", days: "4 days", price: "₹19,600", rating: 4.7, img: coorgImg },
  { id: "munnar", name: "Munnar", region: "Kerala", tag: "Hills", days: "4 days", price: "₹17,900", rating: 4.6, img: munnarImg },
  { id: "ladakh", name: "Ladakh", region: "Ladakh", tag: "Mountains", days: "8 days", price: "₹39,500", rating: 4.9, img: ladakhImg },
  { id: "hampi", name: "Hampi", region: "Karnataka", tag: "Heritage", days: "3 days", price: "₹13,400", rating: 4.7, img: hampiImg },
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
};

export const sampleItinerary = destinationItineraries.jaipur;
