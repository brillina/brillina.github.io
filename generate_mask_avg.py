import pandas as pd

# Load the mask frequency data
mask_df = pd.read_csv('data/mask_frequency.csv')

# Function to calculate weighted average
def calculate_weighted_average(row):
    return (row['NEVER'] * 0) + (row['RARELY'] * 1) + (row['SOMETIMES'] * 2) + (row['FREQUENTLY'] * 3) + (row['ALWAYS'] * 4)

# Calculate weighted average
mask_df['weightedAverage'] = mask_df.apply(calculate_weighted_average, axis=1)

# Save the new CSV file
mask_df.to_csv('data/mask_averages.csv', columns=['fips', 'weightedAverage'], index=False)