import Cors from "cors";
import { NextApiRequest, NextApiResponse } from "next";

// Initializing the cors middleware
const cors = Cors({
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  origin: [
    "https://sibeton-api.vercel.app",
    "https://sib-topaz.vercel.app",
    "http://localhost:3000",
  ],
  credentials: true,
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: (
    req: NextApiRequest,
    res: NextApiResponse,
    cb: (result: unknown) => void
  ) => void
): Promise<unknown> {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  return new Promise((resolve, reject) => {
    fn(req, res, (result: unknown) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  apiHandler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
): Promise<void> {
  // Run the middleware
  await runMiddleware(req, res, cors);

  // Rest of the API logic
  return apiHandler(req, res);
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
