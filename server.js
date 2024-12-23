const app = require('./app');
const { connectDB } = require('../Blogging_Api Project/server/configuration/db'); 
const dotenv = require('dotenv');


dotenv.config();


connectDB();


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
