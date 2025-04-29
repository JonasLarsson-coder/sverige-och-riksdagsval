
import sqlite3
import pandas as pd

import pandas as pd

df = pd.read_csv("arbetslösa_2022.csv", encoding="utf-8", delimiter=";")
print(df.head())  # Visa de första raderna



import pandas as pd
import sqlite3

# Läs in CSV-filen
df = pd.read_csv("arbetslösa_2022.csv", encoding="utf-8", delimiter=",")

# Skapa en SQLite-databas och anslut
conn = sqlite3.connect("arbetslösa_2022.db")

# Spara DataFrame till en SQL-tabell
df.to_sql("arbetslöshet", conn, if_exists="replace", index=False)

# Kontrollera att tabellen skapades korrekt
print(pd.read_sql_query("SELECT * FROM arbetslöshet LIMIT 5", conn))

# Stäng anslutningen
conn.close()






