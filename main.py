import json
import sqlite3
from flask import Flask, render_template, request, redirect, Response
import pandas as pd

from learning_objective_tools import *
from edge_tools import insert_edges
from similarity_tools import get_most_similar
from setup_db import build_courses, build_learning_objectives, build_courses_objectives, build_objectives_objectives

dbfile = 'example.db'

app = Flask(__name__)

@app.route("/", methods = ['POST', 'GET'])
def home():
    return render_template("choose_course_learning_objectives.html")

@app.route("/build_objectives/<string:course_name>", methods = ['POST', 'GET'])
def build_objectives(course_name):
    return render_template('learning_objectives.html', course_name=course_name)

@app.route('/checkObj', methods=['POST', 'GET'])
def get_similar():
    data = request.get_json()
    with sqlite3.connect(dbfile) as conn:
        learning_objectives = pd.read_sql('SELECT id, verb, predicate FROM learning_objectives', conn)
        learning_objectives['full_text'] = learning_objectives.apply(lambda row: row.verb + ' ' + row.predicate, axis=1)
        lo_list = list(learning_objectives.full_text.values)
    new_obj = data['objDict']['verb'] + ' ' + data['objDict']['predicate']
    similar_list = get_most_similar(new_obj, lo_list)
    similar_df = learning_objectives[learning_objectives.full_text.isin(similar_list)][['id', 'verb', 'predicate']]
    return json.dumps(similar_df.to_json(orient='records'))

@app.route('/export_learning_objectives', methods = ['POST', 'GET'])
def write_learning_objectives():
    data = request.get_json()
    print(data)
    objectives = data['objList']
    course_name = data['courseName']
    if len(objectives) > 0:
        with sqlite3.connect(dbfile) as conn:
            # Get course_id
            course_id = get_course_id(course_name, conn)
            # Delete existing course/objective relationships
            delete_objs(course_id, conn)
            # Add new objectives
            new_lo_ids = insert_objectives(objectives, conn)
            # Add new objectives_courses
            insert_courses_objectives(course_id, new_lo_ids, conn)
        return "Success"
    else:
        return "No valid Learning Objectives."

@app.route('/export_edges', methods = ['POST', 'GET'])
def write_edges():
    data = request.get_json()
    print(data);
    edges = data['edgeList']
    course_name = data['courseName']
    print(course_name)
    if len(edges) > 0:
        with sqlite3.connect(dbfile) as conn:
            # Get course_id
            course_id = get_course_id(course_name, conn)
            # Delete existing edges
            # delete_objs(course_id, conn)
            # Add edges
            insert_edges(edges, conn)
        return "Success"
    else:
        return "No valid Edges."
    
@app.route('/table/<string:table_name>')
def display_table(table_name):
    if table_name in ['courses', 'learning_objectives', 'courses_objectives', 'objectives_objectives']:
        with sqlite3.connect(dbfile) as conn:
            table_data = pd.read_sql('SELECT * FROM {}'.format(table_name), conn)
        return render_template('table.html',
                               table_name=table_name,
                               table_data=table_data.to_json(orient='records'))
    else:
        return "Please enter a valid table name"
    
@app.route('/build_course_graph/<string:course_name>')
def build_course_graph(course_name):
    return render_template('build_course_graph.html', course_name=course_name)
    
if __name__ == "__main__":
    
    # For now, clear the database before running
    import os
    if os.path.exists(dbfile):
        os.remove(dbfile)
        
    # Build the database (with dummy values)
    build_courses(dbfile, dummy=True)
    build_learning_objectives(dbfile, dummy=True)
    build_courses_objectives(dbfile)
    build_objectives_objectives(dbfile)
    
    # Run the app
    app.run(debug=True)