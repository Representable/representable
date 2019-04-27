# Defines the choices for various models and form widgets
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
    ('', 'Choose Category'),
    ('criminal_justice', 'Criminal Justice'),
    ('civil_rights','Civil Rights'),
    ('economic','Economic Affairs'),
    ('education','Education'),
    ('environment','Environment'),
    ('health','Health and Health Insurance'),
    ('internet','Internet Regulation'),
    ('women','Women\'s Issues'),
    ('lgbt', 'LGBT Issues'),
    ('security','National Security'),
    ('welfare', 'Social Welfare')
)
