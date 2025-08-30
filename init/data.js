// data.js
// 100 complete listings manually crafted
// Images are real villa photos from Unsplash

const data = [
  {
    title: "Sunset Cliff Villa",
    description: "Experience breathtaking sunsets every evening from this luxurious cliffside villa with infinity pool and private chef services.",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 4500,
    location: "Santorini",
    country: "Greece"
  },
  {
    title: "Tropical Hideaway",
    description: "Hidden in lush tropical gardens, this hideaway offers ultimate privacy, a crystal-clear lagoon, and open-air living areas.",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=3000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 3200,
    location: "Bora Bora",
    country: "French Polynesia"
  },
  {
    title: "Rustic Lakeside Retreat",
    description: "A peaceful retreat by a serene lake, featuring cozy fireplaces, canoes, and beautiful stargazing nights.",
    image: "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 1400,
    location: "Lake Como",
    country: "Italy"
  },
  {
    title: "Beachfront Bliss",
    description: "Wake up to the sound of waves in this luxurious beachfront villa with private access to white sand beaches.",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 3700,
    location: "Maui",
    country: "United States"
  },
  {
    title: "Modern Urban Oasis",
    description: "An ultra-modern villa with sleek designs, rooftop gardens, and panoramic city views, perfect for a cosmopolitan experience.",
    image: "https://plus.unsplash.com/premium_photo-1736194027564-74e1a686babd?q=80&w=3310&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 5000,
    location: "Dubai",
    country: "United Arab Emirates"
  },
  {
    title: "Countryside Manor",
    description: "Set on acres of rolling hills, this classic English manor features horse stables, rose gardens, and afternoon tea service.",
    image: "https://plus.unsplash.com/premium_photo-1736194025882-1aad786e38ec?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 3000,
    location: "Cotswolds",
    country: "United Kingdom"
  },
  {
    title: "Snowy Mountain Chalet",
    description: "Ski-in, ski-out luxury with a roaring fireplace, hot tub, and chalet-style wood interiors perfect for cozy winter nights.",
    image: "https://plus.unsplash.com/premium_photo-1733514692183-bcef805397bc?q=80&w=3200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 4200,
    location: "Zermatt",
    country: "Switzerland"
  },
  {
    title: "Desert Mirage Mansion",
    description: "An oasis in the desert with sweeping architecture, refreshing pools, and shaded courtyards to beat the heat.",
    image: "https://plus.unsplash.com/premium_photo-1677622923387-71062ea4b667?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 5200,
    location: "Palm Springs",
    country: "United States"
  },
  {
    title: "Jungle Treehouse",
    description: "Perched high in the canopy, this eco-friendly treehouse offers stunning rainforest views and natural swimming pools.",
    image: "https://plus.unsplash.com/premium_photo-1733514692198-89d29a884616?q=80&w=3200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 1700,
    location: "Costa Rica",
    country: "Costa Rica"
  },
  {
    title: "Historic Stone Villa",
    description: "A charming villa built with ancient stones, featuring rustic kitchens, olive groves, and beautiful cobblestone patios.",
    image: "https://images.unsplash.com/photo-1597682496035-b04f723202a4?q=80&w=3538&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 2800,
    location: "Provence",
    country: "France"
  },

  {
    title: "Secluded Island Villa",
    description: "Private island luxury with crystal-clear waters, personal staff, and activities like kayaking and snorkeling.",
    image: "https://images.unsplash.com/photo-1629153847446-d5f3708a575a?q=80&w=2975&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 9000,
    location: "Exuma",
    country: "Bahamas"
  },
  {
    title: "Mediterranean Dream",
    description: "Overlooking turquoise waters, this villa offers terraced gardens, rustic stonework, and outdoor dining under the stars.",
    image: "https://plus.unsplash.com/premium_photo-1677613735286-df09b4de4007?q=80&w=2968&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 4700,
    location: "Mallorca",
    country: "Spain"
  },
  {
    title: "Luxury Alpine Lodge",
    description: "A luxurious ski lodge with personal butlers, gourmet kitchens, and floor-to-ceiling windows showcasing snowy peaks.",
    image: "https://plus.unsplash.com/premium_photo-1700828949556-d8f2ef1c87a0?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 8000,
    location: "Aspen",
    country: "United States"
  },
  {
    title: "Sleek Cliffside Haven",
    description: "A striking villa carved into seaside cliffs, with glass walls, modern art, and private access to hidden beaches.",
    image: "https://images.unsplash.com/photo-1492889971304-ac16ab4a4a5a?q=80&w=3548&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 6200,
    location: "Amalfi Coast",
    country: "Italy"
  },
  {
    title: "Zen Garden House",
    description: "Find your peace at this Japanese-inspired villa with koi ponds, bamboo groves, and traditional tatami interiors.",
    image: "https://images.unsplash.com/photo-1615634364452-8daf3851f2f1?q=80&w=3456&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 2500,
    location: "Kyoto",
    country: "Japan"
  },
  {
    title: "Overwater Bungalow Retreat",
    description: "Luxury overwater villas with direct ocean access, glass-bottom floors, and sunsets you’ll never forget.",
    image: "https://images.unsplash.com/photo-1638009512305-ccdd23ec4c4d?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 7100,
    location: "Maldives",
    country: "Maldives"
  },
  {
    title: "Majestic Safari Lodge",
    description: "Experience wildlife from your own plunge pool and sleep under the stars in this ultra-luxe safari lodge.",
    image: "https://images.unsplash.com/photo-1638008696090-ea8e8ed37a89?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 6800,
    location: "Serengeti",
    country: "Tanzania"
  },
  {
    title: "Vintage Vineyard Estate",
    description: "Savor the finest wines straight from your backyard vineyard at this 18th-century French chateau.",
    image: "https://images.unsplash.com/photo-1638008313433-11ce583a90d2?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 4400,
    location: "Bordeaux",
    country: "France"
  },
  {
    title: "Architectural Desert Escape",
    description: "Minimalist design meets desert beauty in this stylish retreat, with cactus gardens and open-sky bathrooms.",
    image: "https://plus.unsplash.com/premium_photo-1694475545392-37ba9972239e?q=80&w=3217&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 3900,
    location: "Joshua Tree",
    country: "United States"
  },
  {
    title: "Bohemian Beach Bungalow",
    description: "Colorful hammocks, handmade furniture, and surf-ready beaches right at your doorstep.",
    image: "https://plus.unsplash.com/premium_photo-1694475548474-62ed644e6919?q=80&w=3217&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 1600,
    location: "Tulum",
    country: "Mexico"
  },

  {
    title: "Tropical Treehouse",
    description: "Sleep among the treetops in this luxurious open-air treehouse with sweeping views of the jungle canopy.",
    image: "https://plus.unsplash.com/premium_photo-1694475560209-03084d14ae84?q=80&w=3217&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 2100,
    location: "Ubud",
    country: "Indonesia"
  },
  {
    title: "Historic Downtown Loft",
    description: "Industrial-chic loft in the heart of downtown, featuring exposed brick, massive windows, and skyline views.",
    image: "https://plus.unsplash.com/premium_photo-1694475429278-5f14e38b7d6c?q=80&w=2151&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 2600,
    location: "New York",
    country: "United States"
  },
  {
    title: "Arctic Glass Igloo",
    description: "Fall asleep under the Northern Lights in a cozy heated igloo with transparent domed ceilings.",
    image: "https://images.unsplash.com/photo-1626249893783-cc4a9f66880a?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 7300,
    location: "Saariselkä",
    country: "Finland"
  },
  {
    title: "Countryside Stone Cottage",
    description: "Charming cottage with flower gardens, wood-burning fireplaces, and cozy window nooks perfect for reading.",
    image: "https://images.unsplash.com/photo-1611410885997-0636819b3cf0?q=80&w=3431&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 1900,
    location: "Cotswolds",
    country: "United Kingdom"
  },
  {
    title: "Modern Eco Villa",
    description: "Sustainable design with solar panels, organic gardens, and eco-friendly luxury living near the ocean.",
    image: "https://images.unsplash.com/photo-1649159827136-9612b9aaf3ef?q=80&w=3552&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 3600,
    location: "Byron Bay",
    country: "Australia"
  },
  {
    title: "Mountain River Lodge",
    description: "Rustic-chic lodge beside a flowing river, with roaring fireplaces, cedar hot tubs, and endless trails.",
    image: "https://plus.unsplash.com/premium_photo-1682377521741-66b111791809?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 3300,
    location: "Banff",
    country: "Canada"
  },
  {
    title: "Sailing Yacht Charter",
    description: "Live aboard a private luxury yacht and cruise the coastlines, complete with captain and personal chef.",
    image: "https://plus.unsplash.com/premium_photo-1682377521705-bfaed7549ab4?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 11000,
    location: "Mykonos",
    country: "Greece"
  },
  {
    title: "Colorful Colonial Mansion",
    description: "Vibrant historic mansion with hand-painted tiles, sunny courtyards, and rich architectural charm.",
    image: "https://plus.unsplash.com/premium_photo-1682377521564-b180edfc960c?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 2900,
    location: "Cartagena",
    country: "Colombia"
  },
  {
    title: "Seaside A-Frame Cabin",
    description: "Adorable A-frame cabin steps from the beach, perfect for campfires, surfing, and salty breezes.",
    image: "https://plus.unsplash.com/premium_photo-1687995673087-8719f3a394e6?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 1700,
    location: "Big Sur",
    country: "United States"
  },
  {
    title: "Ancient Cave House",
    description: "Stay in a luxurious cave carved into volcanic rock, featuring underground pools and stone terraces.",
    image: "https://plus.unsplash.com/premium_photo-1687995671685-761d75c109e4?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 5200,
    location: "Santorini",
    country: "Greece"
  },

  {
    title: "Private Desert Oasis",
    description: "Luxury villa tucked into the dunes, featuring infinity pools, camel rides, and endless starry skies.",
    image: "https://plus.unsplash.com/premium_photo-1661883982941-50af7720a6ff?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 8700,
    location: "Dubai",
    country: "United Arab Emirates"
  },
  {
    title: "French Vineyard Estate",
    description: "Historic vineyard estate offering wine tastings, panoramic terraces, and centuries-old cellars.",
    image: "https://plus.unsplash.com/premium_photo-1742418222453-6940c5a033b7?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 7100,
    location: "Bordeaux",
    country: "France"
  },
  {
    title: "Safari Tent Retreat",
    description: "Luxurious tented camp with king beds, wildlife safaris, and sundowners in the savannah.",
    image: "https://images.unsplash.com/photo-1479642758906-86ea61b235af?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 6900,
    location: "Maasai Mara",
    country: "Kenya"
  },
  {
    title: "Japanese Ryokan Inn",
    description: "Traditional ryokan with tatami mats, onsen baths, and multi-course kaiseki dinners.",
    image: "https://images.unsplash.com/photo-1504843812413-16480b674871?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D0",
    price: 4300,
    location: "Kyoto",
    country: "Japan"
  },
  {
    title: "Icelandic Volcano Cabin",
    description: "Remote wood cabin set near active volcano fields, with geothermal hot tubs and endless hikes.",
    image: "https://images.unsplash.com/photo-1620833020192-3bfe126a3954?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 5100,
    location: "Hvolsvöllur",
    country: "Iceland"
  },
  {
    title: "Floating River Hut",
    description: "Charming thatched hut floating peacefully on a calm river, ideal for quiet fishing and kayaking.",
    image: "https://plus.unsplash.com/premium_photo-1683888724549-73a380c5ed68?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 1400,
    location: "Kanchanaburi",
    country: "Thailand"
  },
  {
    title: "Scottish Castle Stay",
    description: "Live like royalty in a historic castle featuring turrets, banquet halls, and sprawling moors.",
    image: "https://plus.unsplash.com/premium_photo-1683888725060-684307792076?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 7600,
    location: "Inverness",
    country: "Scotland"
  },
  {
    title: "Surf Shack Bungalow",
    description: "Chill surf shack steps from the waves, with hammocks, beach bonfires, and tiki vibes.",
    image: "https://plus.unsplash.com/premium_photo-1687995671595-b3e6cdf73950?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 1200,
    location: "Bali",
    country: "Indonesia"
  },
  {
    title: "Rooftop City Penthouse",
    description: "Ultra-modern penthouse with panoramic rooftop views, private pool, and sleek designer interiors.",
    image: "https://images.unsplash.com/photo-1622015663319-e97e697503ee?q=80&w=3477&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 9800,
    location: "Hong Kong",
    country: "Hong Kong"
  },
  {
    title: "Chilean Patagonia Lodge",
    description: "Remote eco-lodge with glacier views, hiking expeditions, and endless pristine wilderness.",
    image: "https://images.unsplash.com/photo-1622015663084-307d19eabbbf?q=80&w=3442&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 6700,
    location: "Torres del Paine",
    country: "Chile"
  },

  {
    title: "Swiss Alps Chalet",
    description: "Idyllic mountain chalet with wood-burning fireplaces, ski-in/ski-out access, and alpine charm.",
    image: "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?q=80&w=3546&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 8500,
    location: "Zermatt",
    country: "Switzerland"
  },
  {
    title: "Greek Island Windmill",
    description: "Stay inside a converted historic windmill with stunning sea views and charming whitewashed interiors.",
    image: "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?q=80&w=3534&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 3000,
    location: "Mykonos",
    country: "Greece"
  },
  {
    title: "Amazon Jungle Treehouse",
    description: "Adventure deep into the rainforest with a luxury treehouse stay, riverboat tours, and exotic wildlife.",
    image: "https://plus.unsplash.com/premium_photo-1733306523667-80d5e5668631?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 3700,
    location: "Manaus",
    country: "Brazil"
  },
  {
    title: "Italian Tuscan Villa",
    description: "Elegant villa surrounded by vineyards and rolling hills, perfect for long dinners under the stars.",
    image: "https://plus.unsplash.com/premium_photo-1680287296491-d15d891df039?q=80&w=3024&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 7100,
    location: "Tuscany",
    country: "Italy"
  },
  {
    title: "Canadian Lakeside Cottage",
    description: "Cozy lakeside retreat with dock access, canoeing, and breathtaking autumn foliage.",
    image: "https://plus.unsplash.com/premium_photo-1680287296835-0424869199ae?q=80&w=3024&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 2500,
    location: "Muskoka",
    country: "Canada"
  },
  {
    title: "Moroccan Riad Palace",
    description: "Intricately tiled riad featuring courtyard pools, rooftop terraces, and vibrant souk access.",
    image: "https://plus.unsplash.com/premium_photo-1687862745559-d6019959d481?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 5200,
    location: "Marrakech",
    country: "Morocco"
  },
  {
    title: "Norwegian Fjord Cabin",
    description: "Secluded waterfront cabin offering serene fjord views, cozy saunas, and northern lights viewing.",
    image: "https://plus.unsplash.com/premium_photo-1687862745602-fe6771fbf95e?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 6100,
    location: "Geiranger",
    country: "Norway"
  },
  {
    title: "Historic New Orleans Mansion",
    description: "Charming antebellum mansion in the French Quarter, filled with chandeliers, balconies, and jazz spirit.",
    image: "https://plus.unsplash.com/premium_photo-1687960117014-f6463f5b419a?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 4800,
    location: "New Orleans",
    country: "USA"
  },
  {
    title: "Malaysian Rainforest Bungalow",
    description: "Rustic-luxury bungalow set amidst dense jungle, with canopy walks and birdwatching trails.",
    image: "https://plus.unsplash.com/premium_photo-1687960116574-782d09070294?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 2700,
    location: "Borneo",
    country: "Malaysia"
  },
  {
    title: "Cuban Colonial Home",
    description: "Colorful restored colonial home featuring pastel facades, courtyards, and salsa rhythms.",
    image: "https://plus.unsplash.com/premium_photo-1687995671536-65a1a556f4a6?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 3100,
    location: "Havana",
    country: "Cuba"
  },

  {
    title: "Balinese Cliffside Villa",
    description: "Infinity pool villa perched on cliffs with panoramic ocean views and authentic Balinese design.",
    image: "https://plus.unsplash.com/premium_photo-1687995673059-99f6fa1f4c72?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 8200,
    location: "Uluwatu",
    country: "Indonesia"
  },
  {
    title: "Saharan Desert Camp",
    description: "Luxury tented camp among the dunes, offering camel rides, stargazing, and Berber feasts.",
    image: "https://images.unsplash.com/photo-1630443069393-3ed603e7f37a?q=80&w=3657&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 4400,
    location: "Merzouga",
    country: "Morocco"
  },
  {
    title: "Scottish Castle Retreat",
    description: "Stay in a grand medieval castle with roaring fireplaces, hidden stairways, and sprawling estates.",
    image: "https://images.unsplash.com/photo-1635550369168-faea2e6e2e8b?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 9100,
    location: "Inverness",
    country: "Scotland"
  },
  {
    title: "South African Safari Lodge",
    description: "All-inclusive lodge with wildlife safaris, sunset drives, and luxurious bushveld suites.",
    image: "https://images.unsplash.com/photo-1637391929773-f3c490cdb677?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 7600,
    location: "Kruger Park",
    country: "South Africa"
  },
  {
    title: "Parisian Penthouse Apartment",
    description: "Chic penthouse with Eiffel Tower views, modern furnishings, and private rooftop terrace.",
    image: "https://images.unsplash.com/photo-1641454054800-61028c271177?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 8500,
    location: "Paris",
    country: "France"
  },
  {
    title: "Icelandic Turf House",
    description: "Traditional eco-friendly turf houses with geothermal hot springs and epic volcanic landscapes.",
    image: "https://plus.unsplash.com/premium_photo-1694475617184-6974a15154d7?q=80&w=2771&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 4900,
    location: "Reykjavik",
    country: "Iceland"
  },
  {
    title: "Caribbean Overwater Bungalow",
    description: "Glass-bottom overwater villa with direct ocean access, private plunge pool, and luxury service.",
    image: "https://images.unsplash.com/photo-1574708006526-c61cf5fe25b1?q=80&w=3089&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 10500,
    location: "St. Lucia",
    country: "Caribbean"
  },
  {
    title: "Tokyo Futuristic Capsule Hotel",
    description: "Experience minimalist living in sleek, high-tech capsules in the vibrant heart of Tokyo.",
    image: "https://images.unsplash.com/photo-1603085429201-64dadaec4061?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 800,
    location: "Tokyo",
    country: "Japan"
  },
  {
    title: "Egyptian Pyramid View Loft",
    description: "Stylish loft with breathtaking direct views of the Great Pyramids and desert sunsets.",
    image: "https://images.unsplash.com/photo-1585169595746-31a414233959?q=80&w=3431&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 3600,
    location: "Giza",
    country: "Egypt"
  },
  {
    title: "Spanish Andalusian Hacienda",
    description: "Historic hacienda featuring olive groves, whitewashed patios, and flamenco nights.",
    image: "https://images.unsplash.com/photo-1534009095716-c1c1281c15f2?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 6800,
    location: "Seville",
    country: "Spain"
  },

  {
    title: "Venezuelan Tepui Base Camp",
    description: "Adventure base at the foot of towering flat-topped mountains with jungle treks and river tours.",
    image: "https://plus.unsplash.com/premium_photo-1682285210821-5d1b5a406b97?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 3900,
    location: "Canaima",
    country: "Venezuela"
  },
  {
    title: "Antarctic Research Station Stay",
    description: "Unique experience staying at a research station among glaciers, penguins, and eternal ice.",
    image: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?q=80&w=3530&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 20000,
    location: "Antarctica",
    country: "Antarctica"
  },
  {
    title: "Dubrovnik Old Town Apartment",
    description: "Charming stone-walled apartment inside the ancient fortified city, steps from historic sites.",
    image: "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 4200,
    location: "Dubrovnik",
    country: "Croatia"
  },
  {
    title: "Marrakech Riad with Courtyard Pool",
    description: "Vibrant traditional riad with lush inner courtyard gardens and intricate Moroccan tilework.",
    image: "https://images.unsplash.com/photo-1670589953882-b94c9cb380f5?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 4600,
    location: "Marrakech",
    country: "Morocco"
  },
  {
    title: "New Zealand Hobbit House",
    description: "Stay in a cozy, earth-sheltered hobbit house with round doors and scenic green hillsides.",
    image: "https://images.unsplash.com/photo-1717167398817-121e3c283dbb?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 3700,
    location: "Matamata",
    country: "New Zealand"
  },
  {
    title: "Canadian Wilderness Lodge",
    description: "Rustic luxury lodge surrounded by endless forests, lakes, and opportunities for wildlife viewing.",
    image: "https://images.unsplash.com/photo-1602075432748-82d264e2b463?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 5100,
    location: "Banff",
    country: "Canada"
  },
  {
    title: "Dubai Desert Resort",
    description: "Lavish tented suites in the middle of golden dunes with camel rides and gourmet dining under stars.",
    image: "https://plus.unsplash.com/premium_photo-1681855276370-56b04d54f0c1?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 9700,
    location: "Dubai",
    country: "United Arab Emirates"
  },
  {
    title: "Greek Island Windmill House",
    description: "Traditional windmill converted into a romantic getaway with sweeping views of Aegean sunsets.",
    image: "https://images.unsplash.com/photo-1577842041275-2da5ff5d6c23?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 5300,
    location: "Santorini",
    country: "Greece"
  },
  {
    title: "Tibetan Monastery Guesthouse",
    description: "Authentic guesthouse experience inside an ancient monastery with meditation and mountain vistas.",
    image: "https://images.unsplash.com/photo-1578907209587-9bce8615a2be?q=80&w=2700&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 4200,
    location: "Lhasa",
    country: "Tibet"
  },
  {
    title: "Brazilian Rainforest Treehouse",
    description: "Treehouse suite deep in the Amazon, surrounded by exotic wildlife, rivers, and dense jungle canopy.",
    image: "https://plus.unsplash.com/premium_photo-1675745329954-9639d3b74bbf?q=80&w=2335&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 5900,
    location: "Manaus",
    country: "Brazil"
  },


  {
    title: "Alaskan Glacier Cabin",
    description: "Cozy off-grid cabin with panoramic views of nearby glaciers and pristine wilderness.",
    image: "https://plus.unsplash.com/premium_photo-1683888725032-77a464b20a68?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 4900,
    location: "Juneau",
    country: "USA"
  },
  {
    title: "Swiss Alps Chalet",
    description: "Traditional wood chalet nestled among snowy peaks with skiing and cozy fireplaces.",
    image: "https://plus.unsplash.com/premium_photo-1687862745573-1e8dff585c66?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 8800,
    location: "Zermatt",
    country: "Switzerland"
  },
  {
    title: "Iceland Lava Field Cottage",
    description: "Secluded cottage surrounded by ancient lava fields, geothermal pools, and northern lights.",
    image: "https://plus.unsplash.com/premium_photo-1687960117069-567a456fe5f3?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 6200,
    location: "Reykjanes",
    country: "Iceland"
  },
  {
    title: "Madagascar Baobab Camp",
    description: "Eco-camp among giant baobab trees, wildlife safaris, and epic sunsets over the plains.",
    image: "https://images.unsplash.com/photo-1686385798007-b14812307040?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 4100,
    location: "Morondava",
    country: "Madagascar"
  },
  {
    title: "Parisian Artist Loft",
    description: "Sun-drenched bohemian loft in Montmartre, filled with vintage furniture and city views.",
    image: "https://images.unsplash.com/photo-1686385798643-785926fccc1d?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 7800,
    location: "Paris",
    country: "France"
  },
  {
    title: "Japanese Zen Villa",
    description: "Minimalist villa with tatami floors, open gardens, and a private onsen overlooking bamboo forests.",
    image: "https://images.unsplash.com/photo-1606830467925-7308d05d0321?q=80&w=1908&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 8700,
    location: "Kyoto",
    country: "Japan"
  },
  {
    title: "Namibian Desert Camp",
    description: "Luxury tents at the edge of giant dunes with stargazing decks and desert wildlife tours.",
    image: "https://images.unsplash.com/photo-1690324079503-8aaa8e82bd15?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 6600,
    location: "Sossusvlei",
    country: "Namibia"
  },
  {
    title: "Peruvian Andean Homestay",
    description: "Experience local culture in a mountain village, with llamas, woven textiles, and breathtaking trails.",
    image: "https://images.unsplash.com/photo-1683154167237-bfbfb32646dd?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 3200,
    location: "Cusco",
    country: "Peru"
  },
  {
    title: "Scottish Castle Estate",
    description: "Stay in a historic stone castle surrounded by misty hills, ancient forests, and roaring fireplaces.",
    image: "https://images.unsplash.com/photo-1557750505-e7b4d1c40410?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 9900,
    location: "Inverness",
    country: "Scotland"
  },
  {
    title: "Bali Jungle Villa",
    description: "Open-air villa hidden in tropical rainforest with infinity pool and views over emerald valleys.",
    image: "https://images.unsplash.com/photo-1670589953903-b4e2f17a70a9?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 5400,
    location: "Ubud",
    country: "Indonesia"
  },

  {
    title: "Portuguese Cliff House",
    description: "Spectacular clifftop villa with ocean panoramas, terraced gardens, and sunset patios.",
    image: "https://images.unsplash.com/photo-1599777560450-e462cffc5368?q=80&w=3388&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 7300,
    location: "Algarve",
    country: "Portugal"
  },
  {
    title: "Canadian Wilderness Yurt",
    description: "Charming yurt deep in the forest, close to lakes, hiking trails, and northern lights.",
    image: "https://images.unsplash.com/photo-1602493347312-222218d66a2e?q=80&w=3388&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 2700,
    location: "Yukon",
    country: "Canada"
  },
  {
    title: "South African Wine Estate",
    description: "Elegant guesthouse among vineyards, with wine tastings, horseback rides, and mountain views.",
    image: "https://images.unsplash.com/photo-1614149383958-06b97007a37a?q=80&w=3435&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 8100,
    location: "Stellenbosch",
    country: "South Africa"
  },
  {
    title: "Moroccan Desert Riad",
    description: "Traditional riad with colorful courtyards, rooftop lounges, and desert excursions by camel.",
    image: "https://images.unsplash.com/photo-1631528858266-5ebeb8bfc6f5?q=80&w=3360&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 4500,
    location: "Marrakech",
    country: "Morocco"
  },
  {
    title: "New Zealand Coastal Lodge",
    description: "Seaside lodge with whale watching, black sand beaches, and dramatic coastal hikes.",
    image: "https://images.unsplash.com/photo-1630008483888-0c00f669ec4a?q=80&w=3024&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 7700,
    location: "Kaikoura",
    country: "New Zealand"
  },
  {
    title: "Patagonian Lake Cabin",
    description: "Rustic cabin on a crystal-clear lake, surrounded by glaciers and soaring Andes peaks.",
    image: "https://plus.unsplash.com/premium_photo-1721914104996-4f19fb5828dc?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 6900,
    location: "Bariloche",
    country: "Argentina"
  },
  {
    title: "Greek Island Windmill",
    description: "Charming restored windmill on a cliff edge, whitewashed walls, and endless blue sea views.",
    image: "https://plus.unsplash.com/premium_photo-1718285692131-ca20720a5f3a?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 5600,
    location: "Santorini",
    country: "Greece"
  },
  {
    title: "Kenyan Safari Tent",
    description: "Luxury tented camp in a wildlife reserve with private decks and guided safari tours.",
    image: "https://plus.unsplash.com/premium_photo-1718285552224-5d17a96063dd?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 8700,
    location: "Masai Mara",
    country: "Kenya"
  },
  {
    title: "Finnish Glass Igloo",
    description: "Sleep under the northern lights in a heated glass igloo surrounded by Arctic wilderness.",
    image: "https://plus.unsplash.com/premium_photo-1719430571386-b32cec341373?q=80&w=2746&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 9200,
    location: "Rovaniemi",
    country: "Finland"
  },
  {
    title: "Austrian Alpine Hut",
    description: "Traditional wooden hut tucked into the mountains, perfect for hiking, skiing, and cozy fires.",
    image: "https://plus.unsplash.com/premium_photo-1718285549233-42414e1c16f9?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 5100,
    location: "Salzburg",
    country: "Austria"
  },

  {
    title: "Icelandic Turf House",
    description: "Cozy eco-cabin built into a hillside with geothermal hot springs nearby and northern lights views.",
    image: "https://plus.unsplash.com/premium_photo-1718285553401-a7bba113255d?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 7500,
    location: "Hella",
    country: "Iceland"
  },
  {
    title: "Japanese Machiya Townhouse",
    description: "Beautifully restored Kyoto townhouse with tatami rooms, sliding doors, and a private zen garden.",
    image: "https://images.unsplash.com/photo-1595081611958-6a3b35524cc9?q=80&w=3375&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 6800,
    location: "Kyoto",
    country: "Japan"
  },
  {
    title: "Norwegian Fjord Cabin",
    description: "Idyllic waterfront cabin nestled between fjords and mountains, ideal for kayaking and hiking.",
    image: "https://images.unsplash.com/photo-1595666998368-7153f9c67683?q=80&w=3379&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 8400,
    location: "Geiranger",
    country: "Norway"
  },
  {
    title: "Tunisian Medina House",
    description: "Traditional home with colorful tiles, archways, and a rooftop overlooking ancient medina streets.",
    image: "https://images.unsplash.com/photo-1594468592936-bf45bada8cde?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 4300,
    location: "Tunis",
    country: "Tunisia"
  },
  {
    title: "South Korean Hanok",
    description: "Historic hanok stay featuring wooden beams, ondol heated floors, and serene courtyards.",
    image: "https://images.unsplash.com/photo-1582016309733-5865c2f9f21f?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 5900,
    location: "Gyeongju",
    country: "South Korea"
  },
  {
    title: "Belgian Canal House",
    description: "Romantic 17th-century canal house with historic interiors and gondola tours outside the door.",
    image: "https://images.unsplash.com/photo-1667297079034-98fc51f71552?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 7100,
    location: "Bruges",
    country: "Belgium"
  },
  {
    title: "Chilean Mountain Refuge",
    description: "Remote mountain lodge in Patagonia with glacier views, starry skies, and wild treks.",
    image: "https://images.unsplash.com/photo-1667297079046-7d203c41fc5a?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 8600,
    location: "Torres del Paine",
    country: "Chile"
  },
  {
    title: "Indian Heritage Haveli",
    description: "Stay in a centuries-old haveli with frescoed walls, marble courtyards, and royal suites.",
    image: "https://images.unsplash.com/photo-1722560394461-19f310d398c1?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 4700,
    location: "Jodhpur",
    country: "India"
  },
  {
    title: "Croatian Beach Stone House",
    description: "Rustic seaside stone house with pebbled beaches, turquoise waters, and ancient ruins nearby.",
    image: "https://images.unsplash.com/photo-1715944171009-67c19539c2b8?q=80&w=3381&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 6400,
    location: "Hvar",
    country: "Croatia"
  },
  {
    title: "Philippine Overwater Villa",
    description: "Luxury villa suspended above clear turquoise water, with private snorkel reefs and beach access.",
    image: "https://images.unsplash.com/photo-1702942468112-e6dfaf287144?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 9300,
    location: "Palawan",
    country: "Philippines"
  },

  {
    title: "Mexican Desert Dome",
    description: "Off-grid adobe dome in the Sonoran Desert, offering stunning sunsets and cactus gardens.",
    image: "https://images.unsplash.com/photo-1635790303840-9338c1169cbf?q=80&w=2736&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 5200,
    location: "Baja California",
    country: "Mexico"
  },
  {
    title: "Canadian Tree Cabin",
    description: "Elevated wooden cabin tucked into maple forests with cozy interiors and snowshoe trails nearby.",
    image: "https://images.unsplash.com/photo-1657160551233-426428117373?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 6900,
    location: "Quebec",
    country: "Canada"
  },
  {
    title: "Egyptian Nile Villa",
    description: "Elegant riverside villa with palm-lined gardens, traditional mashrabiya balconies, and private docks.",
    image: "https://images.unsplash.com/photo-1641857425840-137bb93265e1?q=80&w=3276&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 7700,
    location: "Aswan",
    country: "Egypt"
  },
  {
    title: "Portuguese Azulejo Home",
    description: "Colorful house adorned with hand-painted tiles, near old town markets and Atlantic beaches.",
    image: "https://images.unsplash.com/photo-1641857054776-4cc0af4a429a?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 5800,
    location: "Lisbon",
    country: "Portugal"
  },
  {
    title: "South African Safari Lodge",
    description: "Luxury thatched lodge with panoramic savannah views, infinity pool, and guided wildlife drives.",
    image: "https://images.unsplash.com/photo-1537823286324-7d070255022e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 9100,
    location: "Kruger National Park",
    country: "South Africa"
  },
  {
    title: "New Zealand Hobbit House",
    description: "Whimsical underground cottage with round doors, cozy nooks, and lush rolling hills.",
    image: "https://images.unsplash.com/photo-1739163132621-f6f478497a3f?q=80&w=3435&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 7200,
    location: "Matamata",
    country: "New Zealand"
  },
  {
    title: "Russian Wooden Izba",
    description: "Charming log cabin with hand-carved details, nestled in snowy forests by a frozen lake.",
    image: "https://images.unsplash.com/photo-1594433575301-cf59b8ada6b1?q=80&w=3538&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 4800,
    location: "Suzdal",
    country: "Russia"
  },
  {
    title: "Hungarian Thermal Spa House",
    description: "Elegant countryside home near natural hot springs and traditional wine cellars.",
    image: "https://images.unsplash.com/photo-1558240894-9821078a16a9?q=80&w=3024&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 5500,
    location: "Eger",
    country: "Hungary"
  },
  {
    title: "Greek Cycladic Windmill",
    description: "Historic windmill turned romantic suite with panoramic Aegean Sea views and whitewashed walls.",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 8600,
    location: "Mykonos",
    country: "Greece"
  },
  {
    title: "Swiss Apline Chalet",
    description: "Traditional chalet tucked into snowy mountains with roaring fireplaces and ski-in access.",
    image: "https://images.unsplash.com/photo-1717167398882-15d1cefd22f6?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 9500,
    location: "Zermatt",
    country: "Switzerland"
  },

  {
    title: "Argentinian Vineyard Estate",
    description: "Elegant stone estate among endless vineyards, offering wine tastings and sunset horseback rides.",
    image: "https://images.unsplash.com/photo-1586864573798-2f3231b6fa13?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 7300,
    location: "Mendoza",
    country: "Argentina"
  },
  {
    title: "Icelandic Glass Cabin",
    description: "Futuristic cabin with glass walls for uninterrupted views of northern lights and volcanoes.",
    image: "https://plus.unsplash.com/premium_photo-1688114987038-28a3ea4127cb?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 8700,
    location: "Vík í Mýrdal",
    country: "Iceland"
  },
  {
    title: "Japanese Zen Garden Villa",
    description: "Minimalist wooden villa surrounded by koi ponds, bamboo groves, and peaceful meditation paths.",
    image: "https://images.unsplash.com/photo-1610127191243-db6102d0584c?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 8100,
    location: "Kyoto",
    country: "Japan"
  },
  {
    title: "Scottish Castle Tower",
    description: "Historic stone tower with roaring fireplaces, antique decor, and misty highland views.",
    image: "https://images.unsplash.com/photo-1648738089349-c17274a3a4b7?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 9900,
    location: "Inverness",
    country: "Scotland"
  },
  {
    title: "Moroccan Riad Oasis",
    description: "Colorful riad with mosaic fountains, lush courtyards, and rooftop dining under desert stars.",
    image: "https://plus.unsplash.com/premium_photo-1717346482132-838fef0ebbd1?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 6500,
    location: "Marrakech",
    country: "Morocco"
  },
  {
    title: "Alaskan Glacier Lodge",
    description: "Secluded log lodge near glaciers and fjords, perfect for whale-watching and kayaking adventures.",
    image: "https://images.unsplash.com/photo-1602774895568-c45887255ab4?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 8800,
    location: "Juneau",
    country: "United States"
  },
  {
    title: "Vietnamese Riverside Retreat",
    description: "Tranquil stilt house above the water, surrounded by rice paddies and tropical gardens.",
    image: "https://plus.unsplash.com/premium_photo-1718285549990-74ef9fb74946?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 4700,
    location: "Hoi An",
    country: "Vietnam"
  },
  {
    title: "Peruvian Mountain Casita",
    description: "Hand-built adobe casita in the Sacred Valley, near ancient ruins and colorful markets.",
    image: "https://plus.unsplash.com/premium_photo-1718285552468-87a89ecd1523?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 6900,
    location: "Urubamba",
    country: "Peru"
  },
  {
    title: "Australian Rainforest Treehouse",
    description: "Hidden treehouse deep in lush rainforest, featuring outdoor showers and canopy hammocks.",
    image: "https://images.unsplash.com/photo-1533554030380-20991a0f9c9e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 7600,
    location: "Daintree",
    country: "Australia"
  },
  {
    title: "Finnish Arctic Igloo",
    description: "Glass-roofed igloo for stargazing and aurora watching, with heated beds and cozy furs.",
    image: "https://images.unsplash.com/photo-1646390605737-133b4c2268fa?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 9200,
    location: "Rovaniemi",
    country: "Finland"
  }

];
module.exports = data;
