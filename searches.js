const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let SearchSchema = new Schema({
	term: String,
	Date: {type: Date, default: Date.now()}
});

let Search = mongoose.model('Search', SearchSchema);

module.exports = Search;