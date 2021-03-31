CREATE TABLE IF NOT EXISTS locations (
search_query VARCHAR(125) PRIMARY KEY,
formatted_query VARCHAR(256),
latitude FLOAT ,
longitude FLOAT
);
CREATE TABLE IF NOT EXISTS weathers (
search_query VARCHAR(60),
forecast VARCHAR(265),
time DATE
);
CREATE TABLE IF NOT EXISTS parks (
search_query VARCHAR(60),
name VARCHAR(250),
address VARCHAR(250),
fee FLOAT,
description VARCHAR(5000),
url VARCHAR(600)
);