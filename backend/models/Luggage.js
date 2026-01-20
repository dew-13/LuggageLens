// Luggage Model Schema

// Example Luggage document structure:
/*
{
  _id: ObjectId,
  userId: ObjectId,
  caseType: String (suitcase, backpack, duffel, etc.),
  color: String,
  size: String (small, medium, large),
  brand: String,
  description: String,
  images: [String] (URLs),
  status: String (lost, found, matched, resolved),
  reportDate: Date,
  location: {
    airport: String,
    terminal: String,
    gate: String
  },
  matchedWith: ObjectId (reference to matched luggage),
  createdAt: Date,
  updatedAt: Date
}
*/

// TODO: Implement Mongoose schema
