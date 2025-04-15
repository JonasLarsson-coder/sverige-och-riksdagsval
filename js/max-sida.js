let years = (await dbQuery(
  'SELECT DISTINCT year FROM dataWithMonths'
)).map(x => x.year);

let year1 = addDropdown('År 1', years, 1964);
let year2 = addDropdown('År 2', years, 2024);