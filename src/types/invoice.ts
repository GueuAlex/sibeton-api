export interface Invoice {
    id: number;
    amount: number;
    status: string; // Statut de la facture (e.g., "PAID", "PENDING")
    createdAt: Date;
    updatedAt: Date;
    userId: number; // Relation vers l'utilisateur
  }
  