// Lägg till rubriken först, innan något annat skapas på sidan
addMdToPage(`## Arbetslöshet och röster per kommun i riksdagsvalet 2022.`);
addMdToPage(`Här visas antalet röster varje kommun gjorde samt hur många personer som var arbetslösa vid den tidpunkten.\n
  Påverkar arbetslöshet antalet röster?`);

// Funktion för att hämta och slå ihop data
async function fetchAndMergeData() {
  try {
    dbQuery.use('riksdagsval-neo4j');
    let rosterKommuner = await dbQuery(`
      MATCH (p:Partiresultat)
      RETURN p.kommun AS kommun, p.roster2022 AS roster2022;
    `);

    dbQuery.use('arbetslösa_2022.db');
    let arbetslösaInfo = await dbQuery(`
      SELECT Kommun AS kommun, arbetslösaAug2022 
      FROM arbetslöshet;
    `);

    rosterKommuner = Array.isArray(rosterKommuner) ? rosterKommuner : Object.values(rosterKommuner);
    arbetslösaInfo = Array.isArray(arbetslösaInfo) ? arbetslösaInfo : Object.values(arbetslösaInfo);

    let rösterPerKommun = rosterKommuner.reduce((acc, row) => {
      acc[row.kommun] = (acc[row.kommun] || 0) + row.roster2022;
      return acc;
    }, {});

    let mergedData = Object.keys(rösterPerKommun).map(kommun => {
      let match = arbetslösaInfo.find(arbetslöshet => arbetslöshet.kommun === kommun);
      return {
        kommun: kommun,
        total_roster_2022: rösterPerKommun[kommun],
        arbetslösaAug2022: match ? match.arbetslösaAug2022 : null
      };
    });

    return mergedData; // Visar hela datasetet utan begränsning

  } catch (error) {
    console.error("Fel vid hämtning eller sammanslagning av data:", error);
    return [];
  }
}

// Kör hela processen och visualisera med tableFromData
(async function () {
  let mergedData = await fetchAndMergeData();
  if (mergedData.length > 0) {
    addMdToPage(`## Arbetslöshet och röster per kommun i riksdagsvalet 2022.`); // Säkerställ att rubriken läggs till igen efter dataladdning
    addMdToPage(`Här visas antalet röster varje kommun gjorde samt hur många personer som var arbetslösa vid den tidpunkten.\n
  Påverkar arbetslöshet antalet röster?`);
    tableFromData({ data: mergedData }); // Visa data i tabellformat
  } else {
    console.error("Inga data att visa i tabellen!");
  }
})();
