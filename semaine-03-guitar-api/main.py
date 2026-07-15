from fastapi import FastAPI

app = FastAPI(
    title="Guitar API",
    description="API REST pour la logique musicale de Guitar App",
    version="0.1.0",
)


@app.get("/health")
def health():
    return {"status": "ok"}
