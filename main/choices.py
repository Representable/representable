# Defines the choices for various models and form widgets
# https://www.census.gov/topics/population/race/about.html
RACE_CHOICES = (
    ('white', 'White'),
    ('black', 'Black or African American'),
    ('native', 'American Indian or Alaska Native'),
    ('pacific_islander', 'Native Hawaiian or Other Pacific Islander'),
    ('Asian', (
        ('indian', 'Asian Indian'),
        ('chinese', 'Chinese'),
        ('filipino', 'Filipino'),
        ('japanese', 'Japanese'),
        ('korean', 'Korean'),
        ('vietnamese', 'Vietnamese'),
        ('other_asian', 'Other Asian'),
        )
    ),
    ('other', 'Other'),
)
RELIGION_CHOICES = (
    ('christianity', 'Christianity'),
    ('buddhism', 'Buddhism'),
    ('islam', 'Islam'),
    ('judaism', 'Judaism'),
    ('hinduism', 'Hinduism'),
    ('other', 'Other'),
)

#https://www.census.gov/programs-surveys/aces/information/iccl.html
INDUSTRY_CHOICES = (
    ('agriculture', 'Agriculture'),
    ('forestry','Forestry'),
    ('fishing','Fishing'),
    ('mining','Mining'),
    ('utilities','Utilities (Power, Natural Gas)'),
    ('construction', 'Construction'),
    ('manufacturing','Manufacturing'),
    ('professional','Professional (Scientific/Technical) Services'),
    ('arts','Arts'),
    ('other','Other'),
)

POLICY_ISSUES = (
    ('', 'Select Category'),
    ('zoning', 'Zoning'),
    ('policing','Policing'),
    ('crime','Crime'),
    ('environmental','Environmental'),
    ('nuisance','Nuisance'),
    ('school','School'),
    ('religion','Religion/Church'),
    ('race','Race/Ethnicity'),
    ('immigration', 'Immigration Status'),
    ('socioeconomic','Socioeconomic'),
    ('transportation', 'Transportation'),
    ('neighborhood', 'Neighborhood Identity/Official Definition'),
    ('lgbt', 'LGBT Issues'),
)
