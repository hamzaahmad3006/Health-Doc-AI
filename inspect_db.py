import sqlite3
import json

conn = sqlite3.connect('backend/backend_db.sqlite')
cursor = conn.cursor()
cursor.execute("SELECT filename, extracted_data FROM documents WHERE status='completed'")
rows = cursor.fetchall()
for row in rows:
    print(f"File: {row[0]}")
    try:
        data = json.loads(row[1])
        print(json.dumps(data, indent=2))
    except:
        print(f"Raw data: {row[1]}")
    print("-" * 50)
conn.close()
