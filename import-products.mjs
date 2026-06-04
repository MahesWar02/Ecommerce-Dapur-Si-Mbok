import { MongoClient } from "mongodb";
import fs from "fs";

const uri =
  "mongodb+srv://dapursimbok:Maheswara02@cluster0.hyfdqcl.mongodb.net/dapursimbok?appName=Cluster0";
const data = JSON.parse(
  fs.readFileSync("./dapur-si-mbok_products.json", "utf8"),
);

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("dapursimbok");
    const collection = db.collection("products");

    const cleaned = data.map((p) => ({
      ...p,
      _id: undefined,
      createdAt: new Date(p.createdAt.$date),
      updatedAt: new Date(p.updatedAt.$date),
    }));

    const result = await collection.insertMany(cleaned);
    console.log(`✅ ${result.insertedCount} produk berhasil diimport!`);
  } finally {
    await client.close();
  }
}

run();
