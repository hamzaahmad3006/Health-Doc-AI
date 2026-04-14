import sqlite3
import os

# Absolute path to the database
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'backend_db.sqlite')

def migrate():
    print(f"Connecting to database at: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Ensure patients table exists
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR,
        age INTEGER,
        gender VARCHAR,
        user_id INTEGER,
        created_at DATETIME,
        FOREIGN KEY(user_id) REFERENCES users (id)
    )
    """)
    print("Checked 'patients' table.")

    # 2. Check and add columns to documents table
    cursor.execute("PRAGMA table_info(documents)")
    existing_columns = [row[1] for row in cursor.fetchall()]
    
    # Columns to ensure exist
    columns_to_add = [
        ("patient_id", "INTEGER"),
        ("extracted_data", "JSON"),
        ("is_approved", "BOOLEAN DEFAULT 0"),
        ("requires_human_review", "BOOLEAN DEFAULT 0"),
        ("is_anonymized", "BOOLEAN DEFAULT 0"),
        ("confidence_score", "FLOAT")
    ]

    for col_name, col_type in columns_to_add:
        if col_name not in existing_columns:
            print(f"Adding column '{col_name}' to 'documents' table...")
            try:
                cursor.execute(f"ALTER TABLE documents ADD COLUMN {col_name} {col_type}")
                print(f"Successfully added '{col_name}'.")
            except Exception as e:
                print(f"Error adding '{col_name}': {e}")
        else:
            print(f"Column '{col_name}' already exists.")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
