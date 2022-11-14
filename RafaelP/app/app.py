import numpy as np
import pandas as pd
import pandas_datareader as web
import datetime as dt
from fastapi import FastAPI
import uvicorn
import pickle


from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, LSTM

app = FastAPI()


@app.on_event("startup")
def load_model():

    global model_stock, scaler

    with open("stock_pred.pkl", "rb") as openfile:
        model_stock = pickle.load(openfile)

    with open("stock_scaler.pkl", "rb") as openfile:
        scaler = pickle.load(openfile)

@app.get("/api/v1/predict")
def stock_predict():

    time_delta = dt.timedelta(days=150)
    end =dt.datetime.now()
    start = end - time_delta

    data = web.DataReader('GOOGL', 'yahoo', start, end)


    imputs = data['Close'].values
    imputs = imputs[-90:]
    imputs = imputs.reshape(-1, 1)
    imputs = np.array(imputs)
    imputs = scaler.transform(imputs)
    realer_data = np.reshape(imputs, (imputs.shape[1], imputs.shape[0], 1))
    prediction = model_stock.predict(realer_data)
    prediction = scaler.inverse_transform(prediction)
    return {"GOOGLE_STOCK_PRICE": prediction}


@app.get("/")
def home():
    return {"Desc": "Health Check"}


if __name__ == '__main__':
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)