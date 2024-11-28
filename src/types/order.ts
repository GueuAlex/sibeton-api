export interface Order {
    id: number;
    status: string;
    products: string[]; // Liste des produits (ou un autre type si précisé)
    amount: number;
    createdAt: Date;
    updatedAt: Date;
  }
  