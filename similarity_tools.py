import numpy as np
import pandas as pd

from nltk.corpus import stopwords

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

stopWords = set(stopwords.words('english'))

def get_vectors(*strs):
    text = [t for t in strs]
    vectorizer = TfidfVectorizer(text, stop_words=stopWords)
    vectorizer.fit(text)
    return vectorizer.transform(text).toarray()

def get_cosine_sim(new_lo, old_lo_list): 
    '''
    Takes a new learning objective (as a string with "Learner will be able to" removed
    and compares it to a list of other learning objectives
    '''
    vectors = [t for t in get_vectors(*([new_lo] + old_lo_list))]
    return cosine_similarity(vectors[1:], vectors[0].reshape(1, -1))
    
def get_most_similar(new_lo, old_lo_list):
    sims = get_cosine_sim(new_lo, old_lo_list)
    sim_df = pd.DataFrame({})
    sim_df = pd.DataFrame({})
    sim_df['learning_objective'] = old_lo_list
    sim_df['similarity'] = sims
    return list(sim_df.sort_values(by='similarity')[-5:].learning_objective.values)
