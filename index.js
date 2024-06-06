const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const {
  MongoClient,
  ServerApiVersion,
  Timestamp,
  ObjectId,
} = require("mongodb");

// config
require("dotenv").config();
const app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

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
    const paymentsCollection = client.db("flowHr").collection("payments");

    // jwt generator
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "365d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    // clear jwt token on logout
    app.get("/logout", async (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          maxAge: 0,
        })
        .send({ success: true });
    });

    // create-payment-intent
    app.post("/create-payment-intent", async (req, res) => {
      const salary = req.body.salary;
      const salaryInCent = parseFloat(salary) * 100;
      console.log(salaryInCent);
      if (!salary || salaryInCent < 1) return;
      // generate clientSecret
      const { client_secret } = await stripe.paymentIntents.create({
        amount: salaryInCent,
        currency: "usd",
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
          enabled: true,
        },
      });
      // send client secret as response
      res.send({ clientSecret: client_secret });
    });

    // save a user data in db
    app.put("/user", async (req, res) => {
      const user = req.body;
      const query = { email: user?.email };

      // if user already in db
      const isExist = await usersCollection.findOne(query);

      // fired user
      if (isExist) {
        if (user.status === '"fired"') {
          return res.status(401).send({ message: "unauthorized access!!" });
        }
      }

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

    // get work by email db
    app.get("/work-sheet/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await worksCollection.find(query).toArray();
      res.send(result);
    });

    // get all work in db
    app.get("/all-works", async (req, res) => {
      const name = req.query.name;
      // const month = new Date(req.query.month).getMonth();
      const month = req.query.month;
      console.log(month);

      let query = {};
      if (name) {
        query.name = name;
      }
      if (month) {
        query.month = month;
      }
      console.log(query.month);

      const result = await worksCollection.find(query).toArray();

      res.send(result);
    });

    // save payment history
    app.post("/payments", async (req, res) => {
      const paymentData = req.body;
      const result = await paymentsCollection.insertOne(paymentData);
      res.send(result);
    });

    // get payment history
    app.get("/payments", async (req, res) => {
      // const sortOptions = { month: 1 };
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      console.log(page, size);
      const skip = (page - 1) * size;

      const result = await paymentsCollection
        .find()
        .sort({ month: 1 })
        .skip(skip)
        .limit(size)
        .toArray();
      res.send(result);
    });

    // get payment count
    app.get("/payments-count", async (req, res) => {
      const count = await paymentsCollection.estimatedDocumentCount();
      res.send({ count });
      console.log(count);
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
