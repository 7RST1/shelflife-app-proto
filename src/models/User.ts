// User.ts
export interface User {
  id: string;
  name: string;
  avatar: string;
  shoppingNeedLevel: number; // Value between 0-100 representing shopping need
  address: string;
  phoneNumber: string;
  dietaryNotes?: string;
  preferredShoppingTime?: string;
  lastShoppingDate?: Date;
}

// Helper function to get a color based on shopping need level
export function getShoppingNeedColor(needLevel: number): string {
  if (needLevel < 30) {
    return 'green';
  } else if (needLevel < 70) {
    return 'orange';
  } else {
    return 'red';
  }
}

// Helper function to get a text description of shopping need
export function getShoppingNeedText(needLevel: number): string {
  if (needLevel < 30) {
    return 'Low need';
  } else if (needLevel < 70) {
    return 'Moderate need';
  } else {
    return 'Urgent need';
  }
}

export const usersM = new Map([
  ["1", {
    id: "1",
    name: "Marte Johansen",
    avatar: "profilePictures/1.png",
    shoppingNeedLevel: 85,
    address: "Eikeveien 23, Leil. 2B",
    phoneNumber: "945 12 345",
    dietaryNotes: "Lavt saltinnhold, ingen nøtter",
    lastShoppingDate: new Date("2025-03-25")
  }],
  ["2", {
    id: "2",
    name: "Geir Svendsen",
    avatar: "profilePictures/2.png",
    shoppingNeedLevel: 45,
    address: "Furuåsen 7",
    phoneNumber: "416 78 901",
    preferredShoppingTime: "Kun formiddag",
    lastShoppingDate: new Date("2025-04-02")
  }],
  ["3", {
    id: "3",
    name: "Dorthe Wilhelmsen",
    avatar: "profilePictures/3.png",
    shoppingNeedLevel: 20,
    address: "Almeveien 45",
    phoneNumber: "922 34 567",
    dietaryNotes: "Glutenfri",
    lastShoppingDate: new Date("2025-04-08")
  }],
  ["4", {
    id: "4",
    name: "Robert Thoresen",
    avatar: "profilePictures/4.png",
    shoppingNeedLevel: 95,
    address: "Lønnegata 10",
    phoneNumber: "976 54 321",
    preferredShoppingTime: "Foretrekker ettermiddag",
    lastShoppingDate: new Date("2025-03-15")
  }],
  ["5", {
    id: "5",
    name: "Hege Andersen",
    avatar: "profilePictures/5.png",
    shoppingNeedLevel: 60,
    address: "Sederveien 22",
    phoneNumber: "934 56 789",
    dietaryNotes: "Diabeteskost",
    lastShoppingDate: new Date("2025-03-31")
  }],
  ["6", {
    id: "6",
    name: "Fredrik Mikkelsen",
    avatar: "profilePictures/6.png",
    shoppingNeedLevel: 30,
    address: "Bjørkealléen 33",
    phoneNumber: "965 43 210",
    lastShoppingDate: new Date("2025-04-05")
  }]
]);

export const usersT: User[] = [...usersM.values()]