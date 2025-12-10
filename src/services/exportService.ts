// Transaction Export Service
// Provides CSV and PDF export functionality for transactions

interface Transaction {
    id: string;
    type: string;
    amount: number;
    currency: string;
    description: string | null;
    category: string | null;
    created_at: string;
}

export const exportService = {
    // Export transactions to CSV
    exportToCSV: (transactions: Transaction[], filename: string = 'transactions') => {
        if (transactions.length === 0) {
            alert('No transactions to export');
            return;
        }

        // CSV headers
        const headers = ['Date', 'Type', 'Description', 'Category', 'Amount', 'Currency'];

        // Format transactions for CSV
        const rows = transactions.map(tx => [
            new Date(tx.created_at).toLocaleDateString(),
            tx.type,
            tx.description || '-',
            tx.category || '-',
            tx.amount.toFixed(2),
            tx.currency
        ]);

        // Create CSV content
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // Export transactions to PDF
    exportToPDF: (transactions: Transaction[], userEmail: string, filename: string = 'transactions') => {
        if (transactions.length === 0) {
            alert('No transactions to export');
            return;
        }

        // Calculate totals
        const income = transactions
            .filter(tx => tx.amount > 0)
            .reduce((sum, tx) => sum + tx.amount, 0);
        const expenses = transactions
            .filter(tx => tx.amount < 0)
            .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

        // Create HTML content for PDF
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>FinoraX Transaction Report</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Segoe UI', Arial, sans-serif; 
                        padding: 40px; 
                        background: #ffffff;
                        color: #333;
                    }
                    .header { 
                        display: flex; 
                        justify-content: space-between; 
                        align-items: center;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #a3e635;
                    }
                    .logo { font-size: 28px; font-weight: bold; color: #a3e635; }
                    .meta { text-align: right; color: #666; font-size: 14px; }
                    .summary { 
                        display: flex; 
                        gap: 20px; 
                        margin-bottom: 30px; 
                    }
                    .summary-card { 
                        flex: 1; 
                        padding: 20px; 
                        border-radius: 12px; 
                        background: #f5f5f5;
                    }
                    .summary-card.income { border-left: 4px solid #22c55e; }
                    .summary-card.expense { border-left: 4px solid #ef4444; }
                    .summary-card.net { border-left: 4px solid #a3e635; }
                    .summary-label { font-size: 12px; color: #666; margin-bottom: 5px; }
                    .summary-value { font-size: 24px; font-weight: bold; }
                    .summary-value.income { color: #22c55e; }
                    .summary-value.expense { color: #ef4444; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { 
                        background: #1a1a2e; 
                        color: #fff; 
                        padding: 12px 8px; 
                        text-align: left;
                        font-size: 12px;
                    }
                    td { 
                        padding: 12px 8px; 
                        border-bottom: 1px solid #eee;
                        font-size: 13px;
                    }
                    tr:hover { background: #f9f9f9; }
                    .amount.positive { color: #22c55e; font-weight: 600; }
                    .amount.negative { color: #ef4444; font-weight: 600; }
                    .footer { 
                        margin-top: 40px; 
                        padding-top: 20px; 
                        border-top: 1px solid #eee;
                        font-size: 12px;
                        color: #999;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">FinoraX</div>
                    <div class="meta">
                        <div>Transaction Report</div>
                        <div>${userEmail}</div>
                        <div>Generated: ${new Date().toLocaleDateString()}</div>
                    </div>
                </div>
                
                <div class="summary">
                    <div class="summary-card income">
                        <div class="summary-label">Total Income</div>
                        <div class="summary-value income">+$${income.toFixed(2)}</div>
                    </div>
                    <div class="summary-card expense">
                        <div class="summary-label">Total Expenses</div>
                        <div class="summary-value expense">-$${expenses.toFixed(2)}</div>
                    </div>
                    <div class="summary-card net">
                        <div class="summary-label">Net Balance</div>
                        <div class="summary-value">$${(income - expenses).toFixed(2)}</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.map(tx => `
                            <tr>
                                <td>${new Date(tx.created_at).toLocaleDateString()}</td>
                                <td>${tx.type}</td>
                                <td>${tx.description || '-'}</td>
                                <td>${tx.category || '-'}</td>
                                <td class="amount ${tx.amount >= 0 ? 'positive' : 'negative'}">
                                    ${tx.amount >= 0 ? '+' : ''}${tx.currency} ${tx.amount.toFixed(2)}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    <p>This report was generated by FinoraX Financial Platform</p>
                    <p>For support, contact support@finorax.com</p>
                </div>
            </body>
            </html>
        `;

        // Open in new window for printing
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();

            // Wait for content to load then trigger print
            setTimeout(() => {
                printWindow.print();
            }, 250);
        }
    },

    // Filter transactions by date range
    filterByDateRange: (transactions: Transaction[], startDate: Date, endDate: Date): Transaction[] => {
        return transactions.filter(tx => {
            const txDate = new Date(tx.created_at);
            return txDate >= startDate && txDate <= endDate;
        });
    }
};
