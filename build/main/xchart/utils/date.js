"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.minDate = exports.maxDate = exports.getDatesBetween = void 0;
const getDatesBetween = (startDate, endDate, stepMs) => {
    const dates = [];
    let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    if (stepMs) {
        while (currentDate <= endDate) {
            dates.push(currentDate);
            currentDate = new Date(currentDate.getTime() + stepMs);
        }
    }
    else {
        while (currentDate <= endDate) {
            dates.push(currentDate);
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
        }
    }
    return dates;
};
exports.getDatesBetween = getDatesBetween;
const maxDate = (dates) => {
    let max = dates[0];
    for (const date of dates) {
        if (date > max) {
            max = date;
        }
    }
    return max;
};
exports.maxDate = maxDate;
const minDate = (dates) => {
    let min = dates[0];
    for (const date of dates) {
        if (date < min) {
            min = date;
        }
    }
    return min;
};
exports.minDate = minDate;
