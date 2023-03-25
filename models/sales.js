const mongoose = require('mongoose')



// Define Schema
const saleSchema = new mongoose.Schema({
  buyer: String,
  date: String,
  quantity: Number, 
  total: Number,//ou decimal128 
  game: mongoose.Schema.Types.ObjectId,
  
})

saleSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})



// Export model
module.exports = mongoose.model('sales', saleSchema)