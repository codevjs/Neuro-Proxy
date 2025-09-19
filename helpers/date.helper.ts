// Convert month number to month name
export const monthNumberToMonthName = (month: number) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return monthNames[month - 1];
};

// Callculate the difference between two dates by days
export const dateDiffInDays = (finishDate: Date) => {
    const currentDate = new Date();
    const diffTime = Math.abs(finishDate.getTime() - currentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};
