


addMdToPage(`## Hur förändrades antal röster på de olika partierna från de olika åren?`)

dbQuery.use('riksdagsval-neo4j');
let valresultat =
  await dbQuery('MATCH (p:Partiresultat) RETURN p.parti AS Parti, p.roster2018 AS Röster_2018, p.roster2022 AS Röster_2022 ORDER BY p.roster2022 DESC');
console.log('electionResults from neo4j', valresultat);
tableFromData({ data: valresultat });

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
