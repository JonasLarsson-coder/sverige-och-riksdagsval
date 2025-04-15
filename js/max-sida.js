



let dataForChart = (await dbQuery(`
  SELECT year, AVG(temperatureC) AS avgTemperature
  FROM dataWithMonths
  WHERE year >= '${year1}' AND year <= '${year2}'
  GROUP BY year
`)).map(x => ({ ...x, year: +x.year })); // map to make year a number

drawGoogleChart({
  type: 'LineChart',
  data: makeChartFriendly(dataForChart, 'månad', `°C`),
  options: {
    height: 500,
    chartArea: { left: 50, right: 0 },
    curveType: 'function',
    pointSize: 5,
    pointShape: 'circle',
    vAxis: { format: '# °C' },
    title: `Medeltemperatur per år i Malmö, trend mellan åren ${year1} och ${year2} (°C)`,
    trendlines: { 0: { color: 'green', pointSize: 0 } },
    hAxis: { format: "#" } // prevents years to be displayed as numbers
  }
});


let year1 = addDropdown('År 1', years, 1964);
let year2 = addDropdown('År 2', years, 2024);
addMdToPage(`
  ### I version 7 av mallen har databashanteringen utökats!

  **Viktigt**: En "breaking change" mellan version 6 och 7 är att mappen *sqlite-databases* inte längre finns, istället finns det en mapp som heter *databases* - och nu stöds SQLite, MySQL, MongoDB och Neo4j.

  Läs mer om hur databaser kopplas in [i den inbyggda dokumentationen](/docs/#mappen-databases). Nu kan du ha hur många databaser inkopplade som helst (nästan)!

  #### Visste du det här om våra län?
  Den här datan kommer från SQLite-databasen **counties**, medan annan data (på andra sidor) kommer från SQLite-databasen **smhi-temp-and-rainfall-malmo**. Men vi hade absolut kunnat blanda data från flera databaser på en sida!
`);

dbQuery.use('counties-sqlite');
let countyInfo = await dbQuery('SELECT * FROM countyInfo');
tableFromData({ data: countyInfo });
