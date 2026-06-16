export type Seller = {
  name: string;
  fullName: string;
  email: string;
  avatarColor: string;
  barColor: string;
};

export const SELLERS_CONFIG: Seller[] = [
  { name: "Orlando",  fullName: "Orlando Jaime",      email: "orlando.jaime@sicobenediciones.com",   avatarColor: "bg-blue-500/20 text-blue-400",    barColor: "bg-blue-500"    },
  { name: "Omar",     fullName: "Omar Martinez",       email: "omar.martinez@sicobenediciones.com",   avatarColor: "bg-violet-500/20 text-violet-400", barColor: "bg-violet-500"  },
  { name: "Joaquin",  fullName: "Joaquin Samudio",     email: "joaquin.samudio@sicobenediciones.com", avatarColor: "bg-teal-500/20 text-teal-400",     barColor: "bg-teal-500"    },
  { name: "John",     fullName: "Johnluis Lanz",       email: "johnluis.lanz@sicobenediciones.com",   avatarColor: "bg-emerald-500/20 text-emerald-400",barColor: "bg-emerald-500" },
  { name: "Daniel",   fullName: "Daniel Benarroch",    email: "daniel.benarroch@sicobenediciones.com",avatarColor: "bg-amber-500/20 text-amber-400",   barColor: "bg-amber-500"   },
];

export const SELLER_NAMES = SELLERS_CONFIG.map((s) => s.name);

export function getSellerByName(name: string): Seller | undefined {
  if (!name) return undefined;
  return SELLERS_CONFIG.find(
    (s) => s.name.toLowerCase() === name.trim().toLowerCase()
  );
}
