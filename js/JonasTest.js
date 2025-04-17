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




