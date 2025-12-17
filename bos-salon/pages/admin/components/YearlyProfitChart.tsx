import React from 'react';
import { Booking, Expense } from '../../../App';

interface YearlyProfitChartProps {
  bookings: Booking[];
  expenses: Expense[];
  selectedYear: number;
}

const YearlyProfitChart: React.FC<YearlyProfitChartProps> = ({ bookings, expenses, selectedYear }) => {
    const monthlyData = Array(12).fill(0).map(() => ({ revenue: 0, expense: 0, net: 0 }));

    bookings.forEach(booking => {
        const date = new Date(booking.bookingDate);
        if (booking.status === 'completed' && date.getFullYear() === selectedYear) {
            const month = date.getMonth();
            monthlyData[month].revenue += booking.totalCost || 0;
        }
    });

    expenses.forEach(expense => {
        const date = new Date(expense.date);
        if (date.getFullYear() === selectedYear) {
            const month = date.getMonth();
            monthlyData[month].expense += expense.amount;
        }
    });

    monthlyData.forEach(month => {
        month.net = month.revenue - month.expense;
    });

    const maxAbsValue = Math.max(...monthlyData.map(d => Math.abs(d.net)), 1);

    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div className="bg-admin-dark-bg/50 border border-admin-dark-border rounded-lg p-4">
            <h4 className="text-sm font-semibold text-admin-dark-text-secondary mb-4">{selectedYear} Net Profit Overview</h4>
            <div className="flex justify-between items-end h-48 gap-1">
                {monthlyData.map((data, index) => {
                    const height = (Math.abs(data.net) / maxAbsValue) * 100;
                    const isProfit = data.net >= 0;
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center justify-end group relative">
                            <div className="absolute -top-6 text-xs bg-admin-dark-bg text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                R{data.net.toFixed(0)}
                            </div>
                            <div
                                className={`w-full rounded-t-sm transition-all duration-300 ${isProfit ? 'bg-blue-500 hover:bg-blue-400' : 'bg-red-500 hover:bg-red-400'}`}
                                style={{ height: `${height}%` }}
                                title={`Net: R${data.net.toFixed(2)}`}
                            ></div>
                            <div className="text-xs text-admin-dark-text-secondary mt-1">{monthLabels[index]}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default YearlyProfitChart;
