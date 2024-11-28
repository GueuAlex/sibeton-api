import { Invoice } from "./invoice";
import { Order } from "./order";
export interface IUser {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string; // Champ pour stocker le mot de passe hashé
    role: Role; // Enumération définie pour les rôles
    createdAt: Date;
    updatedAt: Date;
    orders: Order[]; // Liste des commandes associées
    invoices: Invoice[]; // Liste des factures associées
  }

  export enum Role {
    ADMIN = "ADMIN",
    USER = "USER",
  }
  
  