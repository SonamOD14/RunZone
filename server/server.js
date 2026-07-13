const app = require('./src/app');
const DecayService = require('./src/services/decayService');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

DecayService.startDecaySchedule();

app.listen(PORT, () => {
  console.log(`🚀 RunZone server running on port ${PORT}`);
});
