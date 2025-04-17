addMdToPage(`## Katt åt lampa, lös i magen!`)
addMdToPage(`## Katt åt linjal, blev mätt!`)
addMdToPage(`## Jag är världens längsta dvärg!`)
dbQuery.use('counties-sqlite');
let countyInfo = await dbQuery('SELECT * FROM countyInfo');
console.log('countyInfo', countyInfo);

dbQuery.use('geo-mysql');
let geoData = await dbQuery('SELECT * FROM geoData LIMIT 25');
console.log('geoData from mysql', geoData);

dbQuery.use('kommun-info-mongodb');
let income = await dbQuery.collection('incomeByKommun').find({}).limit(25);
console.log('income from mongodb', income);

dbQuery.use('kommun-info-mongodb');
let ages = await dbQuery.collection('ageByKommun').find({}).limit(25);
console.log('ages from mongodb', ages);

dbQuery.use('riksdagsval-neo4j');
let electionResults =
  await dbQuery('MATCH (n:Partiresultat) RETURN n LIMIT 25');
console.log('electionResults from neo4j', electionResults);


/*
let kommunInfo = await dbQuery("db.collection.find({})") || [];
let geoInfo = await dbQuery("SELECT * FROM geoData") || [];
let riksdagsval = await dbQuery("MATCH (n) RETURN n LIMIT 10") || [];

console.log("MongoDB-data:", kommunInfo);
console.log("MySQL-data:", geoInfo);
console.log("Neo4j-data:", riksdagsval);

tableFromData({ data: kommunInfo.length ? kommunInfo : [{ error: "Inga data hittades!" }] });
tableFromData({ data: geoInfo.length ? geoInfo : [{ error: "Inga data hittades!" }] });
tableFromData({ data: riksdagsval.length ? riksdagsval : [{ error: "Inga data hittades!" }] });
*/
