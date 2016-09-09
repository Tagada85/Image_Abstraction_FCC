

const express = require('express');
const app = express();
var Search = require('bing.search');
const url = require('url');
const mongoose = require('mongoose');
const SearchDB = require('./searches.js');

search = new Search('XJe/MMPk6neMfRqG5NrcwGmljZ1maHQ7EEhDpNhQ2bY');
mongoose.connect("mongodb://localhost:27017/image");
const db = mongoose.connection;

db.on('open', ()=>{
	console.log('connected to db');
});

db.on('error', (err)=>{
	console.log('error connecting to db');
});

app.get('/?lolcats?offset=10', (req, res)=>{
	search.images('lolcats', {top: 10}, (err, results)=>{
		console.log(results);
		let jsonRes = results.map((img)=>{
    		return {"title": img.title, 
    				"url": img.url,
    				"thumbnail": img.thumbnail.url,
    				"pageUrl":img.sourceUrl};
    	});
    	res.send(jsonRes);

	});
});

app.get('/api/latest', (req, res)=>{
	SearchDB.find({}, (err, results)=>{
		if(err) return next(err);
		let searches = results.map((search)=>{
			return {"term": search.term, "when": search.Date}
		});
		res.json(searches);
	});
});


app.get('*', (req, res, next)=>{
	let urlParsed = url.parse(req.url);
	let query = urlParsed.query;
	if(!query){
		res.json({"message":"Use a search query to look for image" });
	}
	let offsetNumber = getOffsetNumber(query);
	let safeQuery = getQuerySafe(query);
	let newSearch = new SearchDB({
		term: safeQuery
	});
	newSearch.save();
	search.images(safeQuery,
		{top: offsetNumber},
  function(err, results) {
    	let jsonRes = results.map((img)=>{
    		return {"title": img.title, 
    				"url": img.url,
    				"thumbnail": img.thumbnail.url,
    				"pageUrl":img.sourceUrl};
    	});
    	res.send(jsonRes);
  }
);
});






function getOffsetNumber(url){
	let offset = url.split('?')[1];
	if(!offset){
		return 20;
	}
	let offsetNumber = offset.split('=')[1];
	return offsetNumber;
}

function getQuerySafe(url){
	let querySearch = url.split('?')[0];
	let safeQuery = querySearch.replace('%20', '_');
	return safeQuery;
}

app.listen(3000);

