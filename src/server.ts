const express = require("express")
require("express-async-errors")
const cors = require("cors")

require("./database/connection");
const routes = require("./routes");
const path = require("path")

const errorHandler = require("./errors/handler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))
app.use(errorHandler);

app.listen(process.env.PORT || 3000);