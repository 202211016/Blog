import express from "express";
import path from "path";
/*
 *  Create express server instance.
 */
const app = express();
app.use(express.json());
//require("dotenv").config();
/**
 * env variables Configuration
 */
const result =  require("dotenv").config({ path: path.join(__dirname, '../', '.env') });
if (result.error) throw result.error;

/**
 * Express Server
 */
let PORT: any = process.env.PORT || 4000;

/* HTTP Configutation */
var server = app.listen(PORT, function () {
	console.log('Example app listening on port ' + PORT + '!');
});

/*
 * Primary app routes.
 */
app.use('/v1', require('./v1'));

module.exports = server;
