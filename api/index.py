import base64
import io
import os
from typing import List, Optional

import matplotlib.pyplot as plt
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from pydantic import BaseModel
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures


class PredictRequest(BaseModel):
    semesters: List[float]
    cpi: Optional[List[float]] = None
    cpi_values: Optional[List[float]] = None


app = FastAPI(title="CPI Predictor API")

# Configure CORS; set FRONTEND_ORIGIN in Vercel env to restrict
origins = [os.environ.get("FRONTEND_ORIGIN", "*")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def exec_model(sem: List[float], cp: List[float]):
    X = np.array(sem).reshape(-1, 1)
    y = np.array(cp)

    nexs = len(sem) + 1
    X_p = np.array([nexs]).reshape(-1, 1)

    model = make_pipeline(PolynomialFeatures(degree=2), LinearRegression())
    model.fit(X, y)

    pred = model.predict(X_p)[0]
    
    if pred>10:
        pred=10
    if pred<0:
        pred=0
    all_cpi = np.concatenate([y, [pred]])
    miny = min(all_cpi)
    maxy = 10
    X_plot = np.linspace(1, nexs, 100).reshape(-1, 1)
    y_plot = model.predict(X_plot)

    plt.figure(figsize=(5, 10))
    plt.scatter(X, y, color="blue", label="Past CPI")
    plt.plot(X_plot, y_plot, color="red", label="Regression Plot")
    plt.scatter(
        X_p,
        pred,
        color="green",
        marker="X",
        s=200,
        label=f"Predicted CPI: {pred:.2f}",
    )
    plt.title("CPI Trend and Next Semester Prediction")
    plt.xlabel("Semester Number")
    plt.ylabel("CPI")
    plt.ylim(miny, maxy)
    plt.legend()
    plt.grid(True)

    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    plt.close()

    im = base64.b64encode(buf.getvalue()).decode("utf-8")
    return float(pred), im


@app.post("/predict")
def predict_cpi(payload: PredictRequest):
    sem = payload.semesters
    cp = payload.cpi if payload.cpi is not None else payload.cpi_values

    if not sem or cp is None:
        raise HTTPException(status_code=400, detail="semesters and cpi arrays are required")

    if len(sem) != len(cp):
        raise HTTPException(status_code=400, detail="semesters and cpi arrays must be the same length")

    try:
        sem_f = [float(s) for s in sem]
        cp_f = [float(c) for c in cp]
    except Exception:
        raise HTTPException(status_code=400, detail="semesters and cpi must be numeric lists")

    ans, plot = exec_model(sem_f, cp_f)
    return {"ans": ans, "plot": plot}


# Adapter for Vercel serverless
handler = Mangum(app)

