import sqlite3
import pandas as pd

def insert_objectives(new_objs, conn, check_duplicates=True):
    new_ids = []
    for obj in new_objs:
        cur = conn.cursor()
        if check_duplicates:
            existing = pd.read_sql('''
            SELECT *
            FROM learning_objectives
            WHERE predicate = "{}";
            '''.format(obj['predicate']), conn)
            if len(existing) > 0:
                continue
        cur.execute(
            'INSERT INTO learning_objectives(verb, predicate) VALUES("{}", "{}")'.format(
                obj['verb'],
                obj['predicate']
            )
        )
        new_ids.append(cur.lastrowid)
    return new_ids

def insert_courses_objectives(course_id, new_lo_ids, conn):
    cur = conn.cursor()
    for lo_id in new_lo_ids:
        cur.execute(
            'INSERT INTO courses_objectives (course_id, learning_objective_id) VALUES({}, {})'.format(
                course_id,
                lo_id
            )
        )
    cur.close()

def get_course_id(course_name, conn):
    course_id_df = pd.read_sql(
        'SELECT id FROM courses where name = "{}"'.format(course_name),
        conn)
    return course_id_df.values[0][0]

def delete_objs(course_id, conn):
    cur = conn.cursor()
    cur.execute('''
        DELETE
        FROM 
           courses_objectives
        WHERE course_id = {}
        '''.format(course_id))
    cur.close()
