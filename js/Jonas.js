


addMdToPage(`## Hur förändrades antal röster på de olika partierna från de olika åren?`)
//Röstresultat för varje parti i riksdagsvalen 2018 och 2022
dbQuery.use('riksdagsval-neo4j');
let electionResults =
  await dbQuery('MATCH (p:Partiresultat) RETURN "2018" AS year, p.parti AS parti, SUM(p.roster2018) AS röster UNION ALL MATCH(p: Partiresultat) RETURN "2022" AS year, p.parti AS parti,SUM(p.roster2022) AS röster ORDER BY year, parti; ');
console.log('electionResults from neo4j', electionResults);
tableFromData({ data: electionResults });

let dataForChart = (await dbQuery(`
  MATCH (p:Partiresultat) RETURN p.parti AS parti, SUM(p.roster2018) AS röster2018, SUM(p.roster2022) AS röster2022
  ORDER BY parti;
`)).map(x => ({
  parti: x.parti,
  röster2018: +x.röster2018, // Säkerställ att värdena är numeriska
  röster2022: +x.röster2022
}));

drawGoogleChart({
  type: 'ColumnChart',
  data: makeChartFriendly(dataForChart, 'parti', 'röster2018', 'röster2022'),
  options: {
    height: 500,
    chartArea: { left: 80, right: 0 },
    vAxis: { title: 'Antal röster', format: '#' },
    hAxis: { title: 'Partier' },
    title: 'Jämförelse av röstresultat per parti mellan 2018 och 2022',
    legend: { position: 'bottom' },
    bar: { groupWidth: '80%' }
  }
});






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


addMdToPage(`## Antal arbetslösa per kommun i augusti 2022.`)
dbQuery.use('arbetslösa_2022.db');
let arbetslösaInfo = await dbQuery('SELECT Region, Ålder, arbetslösaAug2022 FROM arbetslöshet LIMIT 25');
console.log('arbetslösaInfo', arbetslösaInfo);
tableFromData({ data: arbetslösaInfo });






/*
dbQuery.use('geo-mysql');
let geoData = await dbQuery('SELECT * FROM geoData LIMIT 25');
console.log('geoData from mysql', geoData);
tableFromData({ data: geoData });


dbQuery.use('kommun-info-mongodb');
let income = await dbQuery.collection('incomeByKommun').find({}).limit(25);
console.log('income from mongodb', income);
tableFromData({ data: income });

dbQuery.use('kommun-info-mongodb');
let ages = await dbQuery.collection('ageByKommun').find({}).limit(25);
console.log('ages from mongodb', ages);
tableFromData({ data: ages });
*/
