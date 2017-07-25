#!/usr/bin/python

from __future__ import print_function
import boto3
import json
import decimal
import spidev
import time
import os

# Function to read SPI data from MCP3008 chip
# Channel must be an integer 0-7
def ReadChannel(channel):
  adc = spi.xfer2([1,(8+channel)<<4,0])
  data = ((adc[1]&3) << 8) + adc[2]
  return data

# Define sensor channels
sensor_channel = 0

# Define delay between readings
delay = 1800

# Output file
#log_file_name = 'out.csv'

# Open SPI bus
spi = spidev.SpiDev()
spi.open(0,0)

#with open(log_file_name, 'a') as log_file:

session = boto3.session.Session(profile_name='plantsensor') # see ~/.aws/credentials
dynamodb = session.resource('dynamodb',region_name='eu-west-1')

table = dynamodb.Table('PlantSensor')

while True:

    # Read the sensor data
    sensor_level = ReadChannel(sensor_channel)
    timestamp = int(time.time())

    # Write value to log
    #log_line = "%s,%s\n" % (timestamp,sensor_level)
    #print log_line
    #log_file.write(log_line)

    response = table.put_item(
        Item={
            'sensordatestamp': timestamp,
            'sensorvalue': sensor_level,
        }
    )

    # Wait before repeating loop
    time.sleep(delay)
