import pandas as pd
import numpy as np
import nltk
import sqlite3 
from nltk.corpus import stopwords
from fastapi import FastAPI
import uvicorn
import vaderSentiment
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

app = FastAPI()

@app.on_event("startup")
def load_model():
    global analyser, con 
    analyser = SentimentIntensityAnalyzer()
    

@app.get("/")
def home():
    return {"Desc": "Health Check"}

@app.get("/api/v1/company")
def company():
    con = sqlite3.connect("emails.db")
    query = """    SELECT  Sentiment,
                            count(*) as Total
                    from emails
                    group by Sentiment
    """
    df = pd.read_sql_query(query, con)
    return df.to_dict('index')

@app.get("/api/v1/users")
def users(user):
    con = sqlite3.connect("emails.db")
    query = f"""    SELECT  User,
                            Sentiment,
                            count(*)
                    from emails
                    where user = '{user}'
                    group by Sentiment
    """
    df = pd.read_sql_query(query, con)
    return df.to_dict('index')

@app.get("/api/v1/sentiments")
def sentiments():
    con = sqlite3.connect("emails.db")
    query = """with ranks as(
                select
                    User,
                    Sentiment,
                    count(*) as Total,
                    ROW_NUMBER() over(
                        PARTITION BY Sentiment order by count(*) desc) as Rank
                from
                    emails
                group by
                    Sentiment,
                    User)
                SELECT
                    User,
                    Sentiment,
                    Total
                FROM
                    ranks
                where
                    Rank < 6
                order by
                    Sentiment,
                    Total desc"""
    df = pd.read_sql_query(query, con)
    return df.to_dict('index')


@app.get("/api/v1/dates")
def dates(start_date, end_date):
    ## Examples of start_date and end date format: '2000-01-04'
    con = sqlite3.connect("emails.db")
    query = f"""    SELECT  Sentiment,
                            count(*) as Total
                    from emails
                    where Date between '{start_date}' and '{end_date}'
                    group by Sentiment"""
    df = pd.read_sql_query(query, con)
    return df.to_dict('index')


@app.get("/api/v1/eval")
def eval_text(text):
    analyser = SentimentIntensityAnalyzer()
    score = analyser.polarity_scores(text)

    if score['compound'] >= 0.05:
        score["Sentiment"] = "Positive"

    elif score['compound'] <= - 0.05:
        score["Sentiment"] = "Negative"

    else:
        score["Sentiment"] = "Neutral"
    return score
