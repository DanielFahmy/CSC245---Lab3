const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'Banking',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    maxIdle: 10,
    idleTimeout: 60000
});

// Function to fetch records from the database
pool.query('SELECT * FROM accounts', (error, results) => {
    if (error) {
        console.error('Error fetching records:', error.message);
    } else {
        console.log('Records:', results);
    }
});


const app = express();
const port = 3000;

app.use(cors());  // Enable CORS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

let accounts = [];
let nextAccountId = 1;  // Initialize the nextAccountId variable





// Helper function to find account by ID
async function findAccountById(id) {
    const [rows] = await pool.promise().execute(
        'SELECT * FROM accounts where id = ?', [id]
    );
    if (rows.length > 0){
        return rows[0];
    } else {
        return [];
    }
}

async function findAccountByAccountNumber(id) {
    const [rows] = await pool.promise().execute(
        'SELECT * FROM accounts where accountNumber = ?', [id]
    );
    if (rows.length > 0){
        return rows[0];
    } else {
        return [];
    }
}

async function createAccount(name, accNum, balance) {
    const [rows] = await pool.promise().execute(
        'insert into accounts (accountHolderName, accountNumber, balance) VALUES (?, ?, ?)', [name, accNum, balance]
    );
    if (rows.length > 0){
        return rows[0];
    } else {
        return [];
    }
}

app.get('/', (req, res) => {
    const filePath = path.resolve('./webapp/index.html');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));

})
// Get all accounts
app.get('/accounts', async (req, res) => {
    try {
        const [rows] = await pool.promise().execute('SELECT * FROM accounts');
        if (rows.length > 0) {
            res.json(rows);
        } else {
            res.status(404).json({ message: 'Accounts not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Create Account
app.post('/accounts', async (req, res) => {
    console.log("TEST")
    console.log(req.body)
    const { accountHolderName, accountNumber, balance } = req.body;
    await createAccount(accountHolderName, accountNumber, balance);
    console.log('Created Account!')
});

// Get Account
app.get('/accounts/:id', async (req, res) => {
    const accountId = req.params.id;
    const account = findAccountById(accountId);
    if (account.length != 0){
        res.json(account);
    } else {
        res.status(404).json({ message: 'Account not found' })
    }
    // const account = findAccountById(parseInt(req.params.id));
    // if (!account) {
    //     return res.status(404).send('Account not found');
    // }
    // res.json(account);
});

// Update Account
app.put('/accounts/:id', (req, res) => {
    const account = findAccountById(parseInt(req.params.id));
    if (!account) {
        return res.status(404).send('Account not found');
    }
    account.accountHolderName = req.body.accountHolderName;
    account.accountNumber = req.body.accountNumber;
    account.balance = req.body.balance;
    res.json(account);
});

// Delete Account
app.delete('/accounts/:id', (req, res) => {
    const accountIndex = accounts.findIndex(account => account.id === parseInt(req.params.id));
    if (accountIndex === -1) {
        return res.status(404).send('Account not found');
    }
    accounts.splice(accountIndex, 1);
    res.status(204).send();
});

// Transfer
app.post('/accounts/transfer', async (req, res) => {
    console.log("TEST")

    const { fromAccountId, toAccountId, amount } = req.body;
    console.log(fromAccountId, toAccountId, amount)
    const fromAccount = await findAccountByAccountNumber(fromAccountId);
    
    if (!fromAccount) {
        return res.status(404).send('Account not found');
    }

    const toAccount = await findAccountByAccountNumber(toAccountId);
    if (!toAccount) {
        return res.status(404).send('Account not found');
    }

    console.log(toAccount, fromAccount)

    fromAccount.balance -= amount;
    toAccount.balance += amount;


    await pool.promise().execute(
        'UPDATE accounts SET balance = ? WHERE accountNumber = ?', [fromAccount.balance, fromAccount.accountNumber]
    );

    await pool.promise().execute(
        'UPDATE accounts SET balance = ? WHERE accountNumber = ?', [toAccount.balance, toAccount.accountNumber]
    );



    // console.log('Transfer request received:', req.body);

    // const fromAccountId = parseInt(req.body.fromAccountId, 10);
    // const toAccountId = parseInt(req.body.toAccountId, 10);
    // const amount = parseFloat(req.body.amount);

    // const fromAccount = findAccountById(fromAccountId);
    // const toAccount = findAccountById(toAccountId);

    // console.log('From account:', fromAccount);
    // console.log('To account:', toAccount);
    // console.log('Amount:', amount);

    // if (!fromAccount || !toAccount) {
    //     console.log('One or both accounts not found');
    //     return res.status(404).send('One or both accounts not found');
    // }

    // if (fromAccount.balance < amount) {
    //     console.log('Insufficient funds');
    //     return res.status(400).send('Insufficient funds');
    // }

    // fromAccount.balance = parseFloat(fromAccount.balance) - amount;
    // toAccount.balance = parseFloat(toAccount.balance) + amount;

    // console.log('Transfer successful');
    // res.status(200).send('Transfer successful');
});


app.listen(port, () => {
    console.log(`Banking service listening at http://localhost:${port}`);
});