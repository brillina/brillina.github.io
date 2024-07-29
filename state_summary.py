import pandas as pd

# Load the CSV file
data = pd.read_csv('data/2020_county_population.csv')

# Clean up and convert 'cases' column to numeric after removing commas
data['cases'] = data['cases'].str.replace(',', '').astype(int)

# Aggregate data by state
state_summary = data.groupby('State').agg({
    'Population': 'sum',
    'cases': 'sum'
}).reset_index()

# Save the aggregated data to a new CSV file
state_summary.to_csv('data/state_summary.csv', index=False)