import sqlite3
import pandas as pd

def check_columns(column_names, column_types):
    assert type(column_names) == list
    assert type(column_types) == list
    assert len(column_names) == len(column_types)

def build_db(db_name,
             table_name,
             column_names,
             column_types):
    '''
    Build a table in db_name called table_name with given
    column_names and column_types.
    '''
    check_columns(column_names, column_types)
    col_statement = ',\n'.join(['{} {} NOT NULL'.format(n, t)
                                 for n, t in zip(column_names, column_types)])
    create_statement = '''
        CREATE TABLE IF NOT EXISTS {} (
            id integer PRIMARY KEY,
            {}
        );'''.format(table_name, col_statement)
    print(create_statement)
    with sqlite3.connect(db_name) as conn:
        cur = conn.cursor()
        cur.execute(create_statement)
        cur.close()

def build_courses(db_name, dummy=False):
    table_name = 'courses'
    column_names = ['name', 'language', 'is_graphed']
    column_types = ['text', 'text', 'integer']
    build_db(db_name,
             table_name,
             column_names,
             column_types)
    if dummy:
        create_sample_courses(db_name)
    
def build_learning_objectives(db_name, dummy=False):
    table_name = 'learning_objectives'
    column_names = ['verb', 'predicate']
    column_types = ['text', 'text']
    build_db(db_name,
             table_name,
             column_names,
             column_types)
    if dummy:
        create_sample_objectives(db_name)

def build_courses_objectives(db_name):
    table_name = 'courses_objectives'
    column_names = ['course_id', 'learning_objective_id']
    column_types = ['integer', 'integer']
    build_db(db_name,
             table_name,
             column_names,
             column_types)                               
        
def build_objectives_objectives(db_name):
    table_name = 'objectives_objectives'
    column_names = ['prereq_id', 'postreq_id']
    column_types = ['integer', 'integer']
    build_db(db_name,
             table_name,
             column_names,
             column_types)     

def create_sample_courses(db_name):
    insert_statement = '''
    INSERT INTO courses(name, language, is_graphed)
        VALUES("test_course", "Python", 0)
    '''
    with sqlite3.connect(db_name) as conn:
        cur = conn.cursor()
        cur.execute(insert_statement)
        cur.close()
    insert_statement = '''
    INSERT INTO courses(name, language, is_graphed)
        VALUES("foo", "Python", 0)
    '''
    with sqlite3.connect(db_name) as conn:
        cur = conn.cursor()
        cur.execute(insert_statement)
        cur.close()
        
def create_obj(db_name, obj_text):
    v, p = obj_text.split(' ', 1)
    insert_statement = '''
    INSERT INTO learning_objectives(verb, predicate)
        VALUES("{}", "{}")
    '''.format(v, p)
    with sqlite3.connect(db_name) as conn:
        cur = conn.cursor()
        cur.execute(insert_statement)
        cur.close()
                                
def create_sample_objectives(db_name):
    sample_objectives = [v.replace('Learner will be able to ', '') for v in '''Learner will be able to define and identify “Python”, “console”, “script editor”.
Learner will be able to define “module”, import a module, import a subset of a module, and import a module using an alias
Learner will be able to define “variable”, assign a number to a variable, identify and resolve errors due to invalid variable names
Learner will be able to understand “whitespace”, when whitespace is important in Python, and resolve errors due to incorrect whitespace at beginning of lines.
Learner will be able to define “string”, create a string, identify and resolve errors resulting from mismatched quotes or missing quotes
Learner will be able to define “float”, assign a float to a variable, and perform basic arithmetic operations on floats
Learner will be able to define “function” and “argument”, “positional argument”, and, “keyword argument”.
Learner will be able to recognize errors caused by unmatched parentheses and recognize syntax highlighting in script editor to help match parentheses.
Learner will be able to define “CSV” and “DataFrame”, use Pandas to a import CSV as a DataFrame, and view rows from a DataFrame
Learner will be able to select columns from a DataFrame using either df.column_name or df[‘column name’] notation.
Learner will be able to define “boolean” and use logical opperators (==, >, <, >=, <=) to select rows from a DataFrame that match a certain criterion
Learner will be able to calculate the min, max, mean, and median of columns of a DataFrame
Learner will be able to create a simple line plot using data from a DataFrame.
Learner will be able to create a plot with multiple lines.
Learner will be able to add title, axis labels, and a legend to a line plot.
Learner will be able to define “list” and create a list of strings.
Learner will be able to identify and correct errors due to missing commas in lists.
Learner will be able to modify the color, marker, and linestyle of a line plot
Learner will be able to change the portion of axes that are displayed
Learner will be able to create an axes object and modify ticks and tick labels.
Learner will be able to create a bar plot and label each bar using the axes object.
Learner will be able to define “histogram”, create a default histogram
Learner will be able to adjust the number of bins, range, and normalization of a histogram'''.split('\n')]
    for obj_text in sample_objectives:
        create_obj(db_name, obj_text)
