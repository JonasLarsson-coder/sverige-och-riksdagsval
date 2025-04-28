

async function fetchAndMergeData() {
  try {
    console.log("Startar datahämtning...");

    // Hämta röstdatan från Neo4j
    dbQuery.use('riksdagsval-neo4j');
    let rosterKommuner = await dbQuery(`
      MATCH (p:Partiresultat)
      RETURN p.kommun AS kommun, p.roster2022 AS roster2022;
    `);

    // Hämta arbetslöshetsdatan från SQLite
    dbQuery.use('arbetslösa_2022.db');
    let arbetslösaInfo = await dbQuery(`
      SELECT Kommun AS kommun, arbetslösaAug2022 
      FROM arbetslöshet;
    `);

    // Säkerställ att data är i arrayformat
    rosterKommuner = Array.isArray(rosterKommuner) ? rosterKommuner : Object.values(rosterKommuner);
    arbetslösaInfo = Array.isArray(arbetslösaInfo) ? arbetslösaInfo : Object.values(arbetslösaInfo);

    // Summera röster per kommun
    let rösterPerKommun = rosterKommuner.reduce((acc, row) => {
      acc[row.kommun] = (acc[row.kommun] || 0) + row.roster2022;
      return acc;
    }, {});

    // Slå ihop röstdatan med arbetslöshetsdata
    let mergedData = Object.keys(rösterPerKommun).map(kommun => {
      let match = arbetslösaInfo.find(arbetslöshet => arbetslöshet.kommun === kommun);
      return {
        kommun: kommun,
        total_roster_2022: rösterPerKommun[kommun],
        arbetslösaAug2022: match ? match.arbetslösaAug2022 : null
      };
    });

    console.log("Sammanställd data:", mergedData);

    // **Skapa dropdown med `addDropdown`**
    let kommunLista = mergedData.map(d => d.kommun);
    let valdKommun = addDropdown("Välj kommun:", kommunLista);


    // **Visa datan när användaren valt en kommun**
    let valdData = mergedData.find(d => d.kommun === valdKommun);
    addMdToPage(valdData ?
      `Kommun: **${valdData.kommun}**  
      Antal röster: **${valdData.total_roster_2022}**  
      Antal arbetslösa: **${valdData.arbetslösaAug2022}**`
      : "Välj en kommun för att se data!");

  } catch (error) {
    console.error("Fel vid hämtning eller sammanslagning av data:", error);
  }
}

// Kör funktionen för att hämta och visualisera data
fetchAndMergeData();
