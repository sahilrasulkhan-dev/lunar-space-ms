# LunaSafe AI Backend

Production-ready backend for LunaSafe AI – an AI-powered lunar terrain analysis and rover navigation system.

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Docker

Build and run the container:
```bash
docker build -t lunasafe-backend .
docker run -d --name lunasafe-backend -p 8000:8000 lunasafe-backend
```

## API Documentation
Once running, access the interactive Swagger UI documentation at:
`http://127.0.0.1:8000/docs`
