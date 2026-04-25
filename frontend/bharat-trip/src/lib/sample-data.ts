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

export const sampleItinerary = [
  {
    day: 1,
    title: "Arrival & Old City Walk",
    items: [
      { time: "10:00", place: "Jaipur Airport", desc: "Pickup & transfer to heritage haveli", icon: "plane" },
      { time: "13:30", place: "Lunch at Suvarna Mahal", desc: "Royal Rajasthani thali experience", icon: "utensils" },
      { time: "17:00", place: "Hawa Mahal", desc: "Golden hour photography walk", icon: "camera" },
    ],
  },
  {
    day: 2,
    title: "Forts & Palaces",
    items: [
      { time: "08:00", place: "Amer Fort", desc: "Sunrise visit, mirror palace tour", icon: "landmark" },
      { time: "12:30", place: "Jal Mahal", desc: "Lakeside lunch & boat ride", icon: "ship" },
      { time: "19:00", place: "Chokhi Dhani", desc: "Folk dance & cultural dinner", icon: "music" },
    ],
  },
  {
    day: 3,
    title: "Markets & Departure",
    items: [
      { time: "09:30", place: "Johari Bazaar", desc: "Jewellery & textile shopping", icon: "shopping-bag" },
      { time: "14:00", place: "City Palace Museum", desc: "Royal artifacts & courtyards", icon: "landmark" },
      { time: "18:00", place: "Departure", desc: "Transfer to airport", icon: "plane" },
    ],
  },
];
