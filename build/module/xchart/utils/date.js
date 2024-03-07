import * as fns from 'date-fns';
export const getDatesBetween = (startDate, endDate, stepMs) => {
    const dates = [];
    let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    if (stepMs) {
        while (currentDate <= endDate) {
            dates.push(currentDate);
            currentDate = fns.addMilliseconds(currentDate, stepMs);
        }
    }
    else {
        while (currentDate <= endDate) {
            dates.push(currentDate);
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
        }
    }
    return dates;
};
export const maxDate = (dates) => {
    let max = dates[0];
    for (const date of dates) {
        if (date > max) {
            max = date;
        }
    }
    return max;
};
export const minDate = (dates) => {
    let min = dates[0];
    for (const date of dates) {
        if (date < min) {
            min = date;
        }
    }
    return min;
};
export const isDate = (x) => {
    if (!x)
        return false;
    if (typeof x !== 'object')
        return false;
    return !!x.getDay;
};
