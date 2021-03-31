CREATE TABLE IF NOT EXISTS locations (
search_query VARCHAR(125) PRIMARY KEY,
formatted_query VARCHAR(256),
latitude FLOAT ,
longitude FLOAT
);
CREATE TABLE IF NOT EXISTS weathers (
search_query VARCHAR(60),
forecast VARCHAR(265),
time VARCHAR(256)
);
CREATE TABLE IF NOT EXISTS parks (
search_query VARCHAR(60),
name VARCHAR(250),
address VARCHAR(250),
fee FLOAT,
description VARCHAR(5000),
url VARCHAR(600)
);
CREATE TABLE IF NOT EXISTS movies(
search_query VARCHAR(256),
title VARCHAR(265),
overview VARCHAR(1000),
average_votes FLOAT,
total_votes INT,
image_url VARCHAR(265),
popularity FLOAT,
released_on VARCHAR(256)
);
CREATE TABLE IF NOT EXISTS restaurents (
search_query VARCHAR(60),
name VARCHAR(250),
image_url VARCHAR(250),
price VARCHAR(10),
rating FLOAT,
url VARCHAR(600)
);