import sqlite3
import pandas as pd

def insert_edges(new_edges, conn, check_duplicates=True):
    for edge in new_edges:
        cur = conn.cursor()
        if check_duplicates:
            existing = pd.read_sql('''
            SELECT *
            FROM objectives_objectives
            WHERE prereq_id = "{}"
                AND postreq_id = "{}";
            '''.format(edge['prereq_id'], edge['postreq_id']), conn)
            if len(existing) > 0:
                continue
        cur.execute(
            'INSERT INTO objectives_objectives(prereq_id, postreq_id) VALUES("{}", "{}")'.format(
                edge['prereq_id'],
                edge['postreq_id']
            )
        )