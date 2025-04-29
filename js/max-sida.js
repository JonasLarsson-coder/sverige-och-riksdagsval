function setDropdownListener(dropdownId, callback) {
  const select = document.querySelector(`select[data-name="${dropdownId}"]`);
  if (select) {
    select.addEventListener("change", event => {
      event.preventDefault();
      callback(select.value);
      setTimeout(() => {
        const target = document.getElementById("scroll-top-kommun");
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300); // Vänta lite så sidan hinner laddas klart
    });
  }
}


async function run() {
  // 1. Rubrik och introduktion
  addMdToPage("## Utbildning och valresultat per kommun");
  addMdToPage(`

Diagrammet nedan visar valresultatet i vald kommun, samt hur stor andel av befolkningen som har en viss utbildningsnivå.  
Vår ursprungliga hypotes var att kommuner med hög utbildningsnivå skulle luta mer åt de konservativa partierna.  
Under arbetets gång visade dock datan på ett annat mönster.

Vi kunde i stället se att i kommuner där en större andel av befolkningen har eftergymnasial utbildning eller forskarutbildning,  
har de rödgröna partierna generellt en starkare ställning än väntat.

Detta är ett exempel på hur en statistisk undersökning kan utmana en förutfattad hypotes och leda till nya insikter.
`);
  addMdToPage('<div id="scroll-top-kommun"></div>');


  await dbQuery.use("geo-mysql");
  const geo = await dbQuery("SELECT municipality, latitude, longitude, county FROM geoData");

  let valdaÅr = [2018, 2022];
  let år = addDropdown("Välj år", valdaÅr, 2022);

  let allaLan = [...new Set(geo.map(g => g.county))].sort();
  let valtLan = addDropdown("Välj län", allaLan, allaLan[0]);

  let kommunerILan = [...new Set(geo.filter(g => g.county === valtLan).map(g => g.municipality))].sort();
  let valtKommun = addDropdown("Välj kommun", kommunerILan, kommunerILan[0]);

  let utbildningsNivaer = [
    { namn: "Eftergymnasial utbildning mindre än 3 år", värde: "eftergymnasial utbildning, mindre än 3 år" },
    { namn: "Eftergymnasial utbildning 3 år eller mer", värde: "eftergymnasial utbildning, 3 år eller mer" },
    { namn: "Forskarutbildning", värde: "forskarutbildning" }
  ];
  let valdUtbildning = addDropdown("Välj utbildningsnivå", utbildningsNivaer.map(u => u.namn), utbildningsNivaer[0].namn);


  async function visaValresultat(kommun) {
    addMdToPage(`### Valresultat och utbildning i ${kommun}`);

    await dbQuery.use("utbildning-ren.sqlite");

    let valdVärde = utbildningsNivaer.find(u => u.namn === valdUtbildning).värde;
    let totalUtbildning = await dbQuery(`SELECT SUM(antal) AS total FROM utbildningsdataRen WHERE kommun = '${kommun}' AND år = ${år}`);
    let utbildning = await dbQuery(`SELECT SUM(antal) AS antal FROM utbildningsdataRen WHERE kommun = '${kommun}' AND år = ${år} AND utbildningsnivå = '${valdVärde}'`);

    let antalUtbildade = utbildning.length > 0 ? utbildning[0].antal : 0;
    let totalAntal = totalUtbildning.length > 0 ? totalUtbildning[0].total : 1;
    let procentUtbildadeText = antalUtbildade > 0 ? `${(antalUtbildade / totalAntal * 100).toFixed(1)}%` : "Ingen data";

    addMdToPage(` Procentuell andel med   **(${valdUtbildning}):** **${procentUtbildadeText}**`);

    await dbQuery.use("riksdagsval-neo4j");
    let valresultat = await dbQuery(`
      MATCH (n:Partiresultat)
      WHERE n.kommun = '${kommun}'
      RETURN n.parti AS parti, n.roster2018 AS roster2018, n.roster2022 AS roster2022
    `);

    let totalRoster = valresultat.reduce((sum, r) => sum + (år == 2018 ? r.roster2018 : r.roster2022), 0);

    let partiKortnamn = {
      "Arbetarepartiet-Socialdemokraterna": "S",
      "Vänsterpartiet": "V",
      "Miljöpartiet de gröna": "MP",
      "Moderaterna": "M",
      "Liberalerna ": "L",
      "Centerpartiet": "C",
      "Kristdemokraterna": "KD",
      "Sverigedemokraterna": "SD",
      "Övriga anmälda partier": "Övr"
    };

    let partiFarger = {
      "S": "#CC0000",
      "V": "#8B0000",
      "MP": "#7BB661",
      "M": "#4169E1",
      "L": "#87CEFA",
      "C": "#2E8B57",
      "KD": "#191970",
      "SD": "#F7DC6F",
      "Övr": "#808080"
    };

    let chartData = [["Parti", "Röster", { role: "style" }, { role: "annotation" }]];
    for (let r of valresultat) {
      let kortnamn = partiKortnamn[r.parti] || r.parti;
      let roster = år == 2018 ? r.roster2018 : r.roster2022;
      let farg = partiFarger[kortnamn] || "gray";
      let procent = ((roster / totalRoster) * 100).toFixed(1) + "%";
      chartData.push([kortnamn, roster, `color: ${farg}`, procent]);
    }

    drawGoogleChart({
      type: "ColumnChart",
      data: chartData,
      options: {
        title: `Valresultat i ${kommun} (${år})`,
        height: 600,
        legend: "none",
        hAxis: {
          title: "Partier",
          slantedText: true,
          slantedTextAngle: 45
        },
        vAxis: {
          title: "Antal röster"
        },
        annotations: {
          alwaysOutside: true
        },
        bar: {
          groupWidth: "80%"
        },
        animation: {
          startup: true,
          duration: 1000,   // vill få en mjuk animerin av staplarna--> när jag ändrar val laddas jag om till högst upp
          easing: 'out'
        }
      }
    });
  }

  // 4. Dropdown-lyssnare
  setDropdownListener("Välj län", nyttLan => {
    valtLan = nyttLan;
    kommunerILan = [...new Set(geo.filter(g => g.county === nyttLan).map(g => g.municipality))].sort();
    setDropdownOptions("Välj kommun", kommunerILan, kommunerILan[0]);
    valtKommun = kommunerILan[0];
    visaValresultat(valtKommun);
  });

  setDropdownListener("Välj kommun", nyKommun => {
    valtKommun = nyKommun;
    visaValresultat(valtKommun);
  });

  setDropdownListener("Välj år", nyttÅr => {
    år = nyttÅr;
    visaValresultat(valtKommun);
  });

  setDropdownListener("Välj utbildningsnivå", nyUtbildning => {
    valdUtbildning = nyUtbildning;
    visaValresultat(valtKommun);
  });


  await visaValresultat(valtKommun);


  addMdToPage("## Kommuner med högst utbildningsnivå per län");
  addMdToPage(`
Här presenteras den kommun i varje län där störst andel av befolkningen har:
- Forskarutbildning
- Eftergymnasial utbildning på minst tre år.

Vi kan se att storstadsområden och universitetsorter, som Lund, Uppsala och Göteborg, ofta toppar dessa listor.
Det kan ge en viss bakgrund till hur politiska sympatier fördelar sig i dessa områden eller att dessa städer har 
skolar och universitet som lockar studenter och forskare.
`);

  let årUtbildning = addDropdown("Välj år för utbildningsnivå", [2018, 2022], 2022);

  async function visaTabeller() {
    await dbQuery.use("utbildning-ren.sqlite");
    let utbildningAllData = await dbQuery(`
    SELECT kommun, år, SUM(antal) AS total,
    SUM(CASE WHEN LOWER(utbildningsnivå) = 'forskarutbildning' THEN antal ELSE 0 END) AS forskarutbildning,
    SUM(CASE WHEN LOWER(utbildningsnivå) = 'eftergymnasial utbildning, 3 år eller mer' THEN antal ELSE 0 END) AS eftergymnasial
    FROM utbildningsdataRen
    GROUP BY kommun, år
  `);

    let utbildningPerKommun = geo.map(g => {
      let u = utbildningAllData.find(u => u.kommun === g.municipality && u.år == årUtbildning);
      if (!u) return null;
      return {
        kommun: g.municipality,
        län: g.county,
        forskarProcent: u.total > 0 ? (u.forskarutbildning / u.total * 100) : 0,
        eftergymnasialProcent: u.total > 0 ? (u.eftergymnasial / u.total * 100) : 0
      };
    }).filter(k => k !== null);

    let länLista = [...new Set(utbildningPerKommun.map(k => k.län))].sort();

    let forskarRader = [];
    let eftergymRader = [];




    for (let län of länLista) {
      let kommunerILän = utbildningPerKommun.filter(k => k.län === län);
      let forskarKommun = kommunerILän.reduce((a, b) => (a.forskarProcent > b.forskarProcent ? a : b));
      let eftergymKommun = kommunerILän.reduce((a, b) => (a.eftergymnasialProcent > b.eftergymnasialProcent ? a : b));

      forskarRader.push({ Län: län, Kommun: forskarKommun.kommun, Andel: `${forskarKommun.forskarProcent.toFixed(1)}%` });
      eftergymRader.push({ Län: län, Kommun: eftergymKommun.kommun, Andel: `${eftergymKommun.eftergymnasialProcent.toFixed(1)}%` });
    }
    window.forskarKommuner = forskarRader.map(k => k.Kommun);
    window.eftergymKommuner = eftergymRader.map(k => k.Kommun);


    // SORTERA från högst till lägst procent:
    forskarRader.sort((a, b) => parseFloat(b.Andel) - parseFloat(a.Andel));
    eftergymRader.sort((a, b) => parseFloat(b.Andel) - parseFloat(a.Andel));

    addMdToPage("###  Kommuner med högst andel forskarutbildning ");
    tableFromData({
      data: forskarRader,
      columns: [{ name: "Län", label: "Län" }, { name: "Kommun", label: "Kommun" }, { name: "Andel", label: "Andel (%)" }]
    });

    addMdToPage("###  Kommuner med högst andel eftergymnasial utbildning 3 år eller mer");
    tableFromData({
      data: eftergymRader,
      columns: [{ name: "Län", label: "Län" }, { name: "Kommun", label: "Kommun" }, { name: "Andel", label: "Andel (%)" }]
    });
  }

  await visaTabeller();


  setDropdownListener("Välj år för utbildningsnivå", nyttÅr => {
    årUtbildning = nyttÅr;
    visaTabeller();
  });


  addMdToPage("##  Valresultat i de kommuner med högst procentuell andel biladade");


  let utbildningstypDropdown = addDropdown("Välj utbildningstyp för diagram", ["Forskarutbildning", "Eftergymnasial 3+ år"], "Forskarutbildning");
  let årValDiagram = addDropdown("Välj år för valresultat för diagram", [2018, 2022], 2022);


  let valdUtbildningstyp = utbildningstypDropdown;
  let valtÅr = årValDiagram;


  async function visaValresultatToppKommuner(valdUtbildningstyp, valtÅr) {
    let totalRödgröna = 0, totalBlåa = 0, totalSD = 0;

    // Hämta utbildningsdata
    await dbQuery.use("utbildning-ren.sqlite");
    let utbildningAllData = await dbQuery(`
    SELECT kommun, år, SUM(antal) AS total,
      SUM(CASE WHEN LOWER(utbildningsnivå) = 'forskarutbildning' THEN antal ELSE 0 END) AS forskarutbildning,
      SUM(CASE WHEN LOWER(utbildningsnivå) = 'eftergymnasial utbildning, 3 år eller mer' THEN antal ELSE 0 END) AS eftergymnasial
    FROM utbildningsdataRen
    GROUP BY kommun, år
  `);

    // Lista med kommuner baserat på vald utbildningstyp
    let kommunerValdaNamn = (valdUtbildningstyp === "Forskarutbildning") ? window.forskarKommuner : window.eftergymKommuner;

    // Hämta utbildningsdata för dessa kommuner
    let utbildningPerKommun = kommunerValdaNamn.map(kommun => {
      let u = utbildningAllData.find(u => u.kommun === kommun && u.år == valtÅr);
      if (!u) return null;
      return {
        kommun: kommun,
        forskarProcent: u.total > 0 ? (u.forskarutbildning / u.total * 100) : 0,
        eftergymnasialProcent: u.total > 0 ? (u.eftergymnasial / u.total * 100) : 0
      };
    }).filter(k => k !== null);

    // Hämta valresultat
    await dbQuery.use("riksdagsval-neo4j");

    let chartDataTopp = [["Kommun", "Rödgröna", "Blåa", "SD"]];

    for (let k of utbildningPerKommun) {
      let valresultat = await dbQuery(`
      MATCH (n:Partiresultat)
      WHERE n.kommun = '${k.kommun}'
      RETURN n.parti AS parti, n.roster2018 AS roster2018, n.roster2022 AS roster2022
    `);

      let totalRoster = valresultat.reduce((sum, r) => sum + (valtÅr == 2018 ? r.roster2018 : r.roster2022), 0) || 1;
      let rödgröna = 0, blåa = 0, sd = 0;

      for (let r of valresultat) {
        let parti = r.parti;
        let roster = valtÅr == 2018 ? r.roster2018 : r.roster2022;

        if (["Arbetarepartiet-Socialdemokraterna", "Vänsterpartiet", "Miljöpartiet de gröna"].includes(parti)) {
          rödgröna += roster;
        } else if (["Moderaterna", "Kristdemokraterna", "Liberalerna "].includes(parti)) {
          blåa += roster;
        } else if (parti === "Centerpartiet") {
          if (valtÅr == 2018) {
            blåa += roster; // Centerpartiet tillhör blåa 2018
          } else {
            rödgröna += roster; // Centerpartiet tillhör rödgröna 2022
          }
        } else if (parti === "Sverigedemokraterna") {
          sd += roster; // SD eget block
        }
      }

      totalRödgröna += rödgröna;
      totalBlåa += blåa;
      totalSD += sd;

      chartDataTopp.push([
        k.kommun,
        +(rödgröna / totalRoster * 100).toFixed(1),
        +(blåa / totalRoster * 100).toFixed(1),
        +(sd / totalRoster * 100).toFixed(1)
      ]);
    }

    const totalRöster = totalRödgröna + totalBlåa + totalSD;

    let aggergeradData = [
      { Grupp: "Rödgröna", Andel: ((totalRödgröna / totalRöster) * 100).toFixed(1) + "%" },
      { Grupp: "Blåa", Andel: ((totalBlåa / totalRöster) * 100).toFixed(1) + "%" },
      { Grupp: "Sverigedemokraterna", Andel: ((totalSD / totalRöster) * 100).toFixed(1) + "%" }
    ];

    // Kommentar och introduktion
    addMdToPage("## Valresultat i de kommuner med högst procentuell andel högutbildade");
    addMdToPage(`
I diagrammet nedan analyseras valresultatet i de kommuner som har störst andel invånare med forskarutbildning eller lång eftergymnasial utbildning.

Trots den ursprungliga hypotesen om att konservativa partier skulle dominera här, visar stapeldiagrammen att:
- De rödgröna partierna (S, V, MP och i vissa fall C 2022) är starka i dessa kommuner.
- Blåa blocket (M, KD, L) är betydande, men ofta mindre än rödgröna.
- Sverigedemokraterna har generellt lägre stöd i dessa högutbildade kommuner jämfört med riksgenomsnittet.

Resultatet belyser vikten av att undersöka verkliga data innan slutsatser dras.
`);

    // Aggregerat cirkeldiagram
    let chartAggData = [
      ["Grupp", "Andel"],
      ...aggergeradData.map(row => [row.Grupp, parseFloat(row.Andel.replace("%", ""))])
    ];

    addMdToPage(`### Aggregerat valresultat i toppkommuner (${valdUtbildningstyp}, ${valtÅr})`);

    drawGoogleChart({
      type: "PieChart",
      data: chartAggData,
      options: {
        title: `Aggregerat valresultat i toppkommuner (${valdUtbildningstyp}, ${valtÅr})`,
        height: 400,
        legend: { position: "top" },
        colors: ["#CC0000", "#4169E1", "#F7DC6F"],
        animation: { startup: true, duration: 1000, easing: 'out' }
      }
    });

    // Stapeldiagram per kommun
    drawGoogleChart({
      type: "ColumnChart",
      data: chartDataTopp,
      options: {
        title: `Valresultat i toppkommuner (${valdUtbildningstyp}, år ${valtÅr})`,
        height: 600,
        legend: { position: "top" },
        colors: ["#CC0000", "#4169E1", "#F7DC6F"],
        isStacked: true,
        vAxis: { title: "Andel (%)" },
        hAxis: { slantedText: true, slantedTextAngle: 45 },
        annotations: {
          alwaysOutside: true,
          textStyle: { fontSize: 11, bold: true, color: '#000000' }
        },
        animation: { startup: true, duration: 1000, easing: 'out' }
      }
    });

    // 🔥 Lägg slutsatser efter att diagrammen är ritade!
    addMdToPage(`
### Slutsatser från aggregerad data

- De rödgröna partierna är största gruppen i kommuner med hög utbildningsnivå, både 2018 och 2022.
- De blåa partierna är relativt starka 2018 men tappar stöd 2022.
- Sverigedemokraterna har konsekvent lägre stöd i högutbildade kommuner än i riket som helhet.
- Mellan 2018 och 2022 har de rödgröna stärkt sin ledning bland högutbildade väljare.

**Sammanfattningsvis:** Vår hypotes om att högre utbildningsnivå skulle korrelera med starkare stöd för konservativa partier motbevisades.  
I själva verket pekar datan på ett omvänt samband, där hög utbildningsnivå i större utsträckning kopplas till ett starkare stöd för rödgröna partier.
`);
  }
}
run();