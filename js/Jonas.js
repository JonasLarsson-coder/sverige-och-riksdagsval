

addMdToPage(`## Antal arbetslösa per kommun i augusti 2022.`)
addMdToPage(`Då vi inte kunde filtrera bort personer under 18 år, var vi tvungna att gå från 16 år.`)
addMdToPage(`Valde augusti för att få en mer exakt siffra på hur många som var arbetslösa vid valets tidpunkt.`)
dbQuery.use('arbetslösa_2022.db');
let arbetslösaInfo = await dbQuery('SELECT Kommun, Ålder, arbetslösaAug2022 FROM arbetslöshet LIMIT 25');
console.log('arbetslösaInfo', arbetslösaInfo);
tableFromData({ data: arbetslösaInfo });








/*
dbQuery.use('riksdagsval-neo4j');
let rawResults = await dbQuery('MATCH (n:Partiresultat) RETURN n ');
//rawResults = rawResults.map(x => ({ ...x, ids: x.ids.identity }));
rawResults = rawResults.map(({ roster2018, kommun, roster2022, parti, labels }) => ({ roster2018, kommun, roster2022, parti, labels }));
console.log('🔍 rawResults:', rawResults);
tableFromData({ data: rawResults, columnNames: ['Röster 2018', 'KOMMUN', 'Röster 2022', 'Parti', 'Taggat som'] });
*/



/*
dbQuery.use('counties-sqlite');
let countyInfo = await dbQuery('SELECT * FROM countyInfo');
console.log('countyInfo', countyInfo);
tableFromData({ data: countyInfo });
*/









/*
dbQuery.use('geo-mysql');
let geoData = await dbQuery('SELECT * FROM geoData LIMIT 25');
console.log('geoData from mysql', geoData);
tableFromData({ data: geoData });
*/


