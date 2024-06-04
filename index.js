const express = require("express");
const cors = require("cors");
const {
  MongoClient,
  ServerApiVersion,
  Timestamp,
  ObjectId,
} = require("mongodb");

// config
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.w5tdn25.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // collections
    const usersCollection = client.db("flowHr").collection("users");
    const messagesCollection = client.db("flowHr").collection("messages");
    const worksCollection = client.db("flowHr").collection("works");

    // save a user data in db
    app.put("/user", async (req, res) => {
      const user = req.body;

      const query = { email: user?.email };

      // if user already in db
      const isExist = await usersCollection.findOne(query);

      // save user for the first time
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...user,
        },
      };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    // get all users data from db
    app.get("/users", async (req, res) => {
      const { verified } = req.query;
      // admin filter
      let filter = {};
      if (verified === "true") {
        filter.verified = true;
      }
      const result = await usersCollection.find(filter).toArray();
      res.send(result);
    });

    // get all users data by email from db
    app.get("/users-details/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    // update user salary
    app.put("/user-salary/:id", async (req, res) => {
      const id = req.params.id;
      const salaryData = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...salaryData,
        },
      };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      console.log(result);
      res.send(result);
    });

    // update user role
    app.put("/user-role/:id", async (req, res) => {
      const id = req.params.id;
      const roleData = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...roleData,
        },
      };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      console.log(result);
      res.send(result);
    });

    // update user status fired
    app.put("/user-status/:id", async (req, res) => {
      const id = req.params.id;
      const statusData = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...statusData,
        },
      };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      console.log(result);
      res.send(result);
    });

    // update user verified
    app.put("/user-verified/:id", async (req, res) => {
      const id = req.params.id;
      const verifiedData = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...verifiedData,
        },
      };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      console.log(result);
      res.send(result);
    });

    // save messages in db
    app.put("/messages", async (req, res) => {
      const message = req.body;
      const result = await messagesCollection.insertOne(message);
      res.send(result);
    });

    // get messages from db
    app.get("/messages", async (req, res) => {
      const result = await messagesCollection.find().toArray();
      res.send(result);
    });

    // save work in db
    app.put("/work-sheet", async (req, res) => {
      const workData = req.body;
      const result = await worksCollection.insertOne(workData);
      res.send(result);
    });

    // get work in db
    app.get("/work-sheet/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await worksCollection.find(query).toArray();
      res.send(result);
    });

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// test
app.get("/", (req, res) => {
  res.send("FlowHR server is Running");
});

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});
