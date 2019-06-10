#
# Copyright (c) 2019- Representable Team (Theodor Marcu, Lauren Johnston, Somya Arora, Kyle Barnes, Preeti Iyer).
#
# This file is part of Representable 
# (see http://representable.org).
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
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
