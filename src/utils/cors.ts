import Cors from "cors";
import { NextApiRequest, NextApiResponse } from "next";

// Allowed origins
const allowedOrigins = [
  "https://sibeton-api.vercel.app",
  "https://sib-topaz.vercel.app",
  "http://localhost:3000"
];

// Initialize CORS middleware
const cors = Cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
});

// Helper method to run middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Unified API handler with CORS
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  apiHandler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
): Promise<void> {
  try {
    // Run CORS middleware
    await runMiddleware(req, res, cors);

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }

    // Proceed with API handler
    await apiHandler(req, res);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/* -- Create ProductCategory table
CREATE TABLE product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Product table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES product_categories(id),
    reference VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_weight DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ProductVariant table
CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    diameter INTEGER NOT NULL, -- 800 or 1000 in the examples
    weight DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create MeasurementType table
CREATE TABLE measurement_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    unit VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ProductMeasurement table
CREATE TABLE product_measurements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    measurement_type_id INTEGER REFERENCES measurement_types(id),
    value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_measurements_product ON product_measurements(product_id);
CREATE INDEX idx_product_measurements_type ON product_measurements(measurement_type_id);

-- Add example measurement types
INSERT INTO measurement_types (code, name, unit) VALUES
('DI', 'Diamètre Interieur', 'mm'),
('DE', 'Diamètre Exterieur', 'mm'),
('HU', 'Hauteur', 'mm'),
('EP', 'Epaisseur', 'mm'),
('LG', 'Largeur', 'mm'),
('LN', 'Longueur', 'mm'),
('RS', 'Réservation', 'mm'); */
