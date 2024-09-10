# pylint: disable=missing-docstring
import zipfile
from pathlib import Path

import pandas as pd

DATA_DIR = Path.cwd() / 'data'


def load_data(data_dir=DATA_DIR):
    base_file_name = 'Medicare_Part_D_Prescribers_by_Provider_and_Drug_2022'
    csv_file_name = base_file_name + '.csv'
    csv_file_path = data_dir / csv_file_name
    if not csv_file_path.is_file():
        print(f'{csv_file_path} not found, extracting zip file')
        zip_file_name = base_file_name + '.zip'
        zip_file_path = data_dir / zip_file_name
        if not zip_file_path.is_file():
            raise FileNotFoundError(f"File not found: {zip_file_path}")
        with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
            zip_ref.extractall(data_dir)
    print(f'Loading data from {csv_file_path}')
    df = pd.read_csv(csv_file_path)
    return df
