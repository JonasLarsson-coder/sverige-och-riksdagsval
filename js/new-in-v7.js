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