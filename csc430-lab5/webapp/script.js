document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('create-account-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const accountHolderName = document.getElementById('accountHolderName').value;
        const accountNumber = document.getElementById('accountNumber').value;
        const balance = document.getElementById('balance').value;

        try {
            const response = await fetch('http://localhost:3000/accounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ accountHolderName, accountNumber, balance })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const account = await response.json();
            alert(`Account created with ID: ${account.id}`);
        } catch (error) {
            console.error('There was an error with the fetch operation:', error);
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        async function loadAccounts() {
            try {
                const response = await fetch('http://localhost:3000/accounts');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
    
                const accounts = await response.json();
    
                const accountsList = document.getElementById('accounts-list');
                accountsList.innerHTML = '';
                accounts.forEach(account => {
                    const li = document.createElement('li');
                    li.classList.add('account-item');
                    li.textContent = `ID: ${account.id}, Name: ${account.accountHolderName}, Number: ${account.accountNumber}, Balance: ${account.balance}`;
    
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.classList.add('delete-button');
                    deleteButton.addEventListener('click', async () => {
                        try {
                            const response = await fetch(`http://localhost:3000/accounts/${account.id}`, {
                                method: 'DELETE',
                            });
                            if (response.ok) {
                                alert('Account deleted');
                                loadAccounts(); // Refresh the account list
                            } else {
                                const error = await response.text();
                                alert(`Failed to delete account: ${error}`);
                            }
                        } catch (error) {
                            console.error('There was an error with the delete operation:', error);
                        }
                    });
    
                    li.appendChild(deleteButton);
                    accountsList.appendChild(li);
                });
            } catch (error) {
                console.error('There was an error with the fetch operation:', error);
            }
        }
    
        document.getElementById('load-accounts').addEventListener('click', loadAccounts);
    
        // Call loadAccounts on page load
        loadAccounts();
    });

    document.getElementById('transfer-funds-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const fromAccountId = parseInt(document.getElementById('fromAccountId').value);
        const toAccountId = parseInt(document.getElementById('toAccountId').value);
        const amount = parseFloat(document.getElementById('amount').value);

        try {
            const response = await fetch('http://localhost:3000/accounts/transfer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fromAccountId, toAccountId, amount })
            });

            if (response.ok) {
                alert('Transfer successful');
            } else {
                const error = await response.text();
                alert(`Transfer failed: ${error}`);
            }
        } catch (error) {
            console.error('There was an error with the fetch operation:', error);
        }
    });
});
