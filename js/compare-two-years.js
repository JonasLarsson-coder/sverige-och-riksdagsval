await dbQuery.use("utbildning-ren.sqlite");

let utbildningsnivåer = await dbQuery(`
  SELECT DISTINCT utbildningsnivå
  FROM utbildningsdataRen
`);

// Visa resultatet i tabell så du ser allt
tableFromData({ data: utbildningsnivåer });

// Eller om du vill se det som "rå JSON" istället:
console.log(utbildningsnivåer);
