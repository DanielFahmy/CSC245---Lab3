CREATE DATABASE Banking;

USE Banking;

CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    accountHolderName VARCHAR(255) NOT NULL,
    accountNumber VARCHAR(255) NOT NULL,
    balance DECIMAL(10, 2) NOT NULL
);
