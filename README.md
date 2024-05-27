## Django Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/42transcendence.git
cd 42transcendence
```

2. Create the virtual environment
```bash
python3 -m venv backend/venv
```

3. Run the virtual environment
```bash
source backend/venv/bin/activate
```

4. Install dependencies:
> NOTE: Ensure you have postgres install before running this, else you will get an error. You can install it via: `brew install postgresql` 
```bash
pip install -r requirements.txt
```

5. Sync settings with db
```bash
python backend/manage.py migrate
```

6. Run the development server:
```bash
python backend/manage.py runserver
```
