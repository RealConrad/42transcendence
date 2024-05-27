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
	```
    source backend/venv/bin/activate
	```

4. Install dependencies:
> NOTE: This will install all dependencies for the project. Make sure you have postgres installed on your host system before running this else you will get an error.
    ```bash
    pip install -r requirements.txt
    ```

5. Run the development server:
    ```bash
    python backend/manage.py runserver
    ```