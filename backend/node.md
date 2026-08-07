const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://adhikarisuyog999_db_user:YOUR_PASSWORD@tbhall.vqtcw3m.mongodb.net/?retryWrites=true&w=majority&appName=tbhall";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected");
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
