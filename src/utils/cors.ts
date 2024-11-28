import Cors from "cors";
import { NextApiRequest, NextApiResponse } from "next";

// Initializing the cors middleware
const cors = Cors({
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  origin: ["http://localhost:3000", "https://sibeton-api.vercel.app"],
  credentials: true,
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
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
  apiHandler: Function
) {
  // Run the middleware
  await runMiddleware(req, res, cors);

  // Rest of the API logic
  return apiHandler(req, res);
}
