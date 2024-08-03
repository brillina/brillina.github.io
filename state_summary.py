import pandas as pd

data = pd.read_csv('data/2020_county_population.csv')

data['cases'] = data['cases'].str.replace(',', '').astype(int)

state_summary = data.groupby('State').agg({
    'Population': 'sum',
    'cases': 'sum'
}).reset_index()

state_summary.to_csv('data/state_summary.csv', index=False)