const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const url = process.env.MONGODB_URI;

console.log('connecting to', url);

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  });

  const personSchema = new mongoose.Schema({
    name: {
      type: String,
      minLength: 3,
      required: true
    },
    number: {
      type: String,
      required: true,
      validate: {
        validator: function(value) {
          return validateNumber(value);
        },
        message: '{VALUE} is not a valid number'
      }
    }
  });

  const validateNumber = (number) => {
    const parts = number.split("-");

    if (parts.length !== 2){
      return false;
    }

    const part1 = parts[0];
    const part2 = parts[1];

    if(!(part1.length >= 2 && part1.length <= 3)) {
      return false;
    };

    if (part2.length < 5) {
      return false;
    };

    if (!/^\d+$/.test(part1) || !/^\d+$/.test(part2)) {
      return false;
    };

    if (number.length < 8) {
      return false;
    };

    return true;
  }

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

module.exports = mongoose.model('Person', personSchema);