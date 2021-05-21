import sys
from pathlib import Path
sys.path.insert(0,str(Path.cwd().parent))
import csv
import datetime

from app import models
from app.database import SessionLocal, engine

db = SessionLocal()

models.Base.metadata.create_all(bind=engine)

def insert():
    with open("sars_2003_complete_dataset_clean.csv", "r") as f:
        csv_reader = csv.DictReader(f)

        for row in csv_reader:
            db_record = models.Record(
                date=datetime.datetime.strptime(row["date"], "%Y-%m-%d"),
                country=row["country"],
                cases=row["cases"],
                deaths=row["deaths"],
                recoveries=row["recoveries"],
            )
            db.add(db_record)

        db.commit()

    db.close()

if __name__ == '__main__':
    insert()