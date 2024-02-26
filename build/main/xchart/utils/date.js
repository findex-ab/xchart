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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy94Y2hhcnQvdXRpbHMvZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBTyxNQUFNLGVBQWUsR0FBRyxDQUFDLFNBQWUsRUFBRSxPQUFhLEVBQUUsTUFBZSxFQUFFLEVBQUU7SUFDakYsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ2pCLElBQUksV0FBVyxHQUFHLElBQUksSUFBSSxDQUN4QixTQUFTLENBQUMsV0FBVyxFQUFFLEVBQ3ZCLFNBQVMsQ0FBQyxRQUFRLEVBQUUsRUFDcEIsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUNwQixDQUFDO0lBR0YsSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUNYLE9BQU8sV0FBVyxJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQzlCLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDeEIsV0FBVyxHQUFHLElBQUksSUFBSSxDQUNwQixXQUFXLENBQUMsT0FBTyxFQUFFLEdBQUcsTUFBTSxDQUMvQixDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7U0FBTSxDQUFDO1FBQ04sT0FBTyxXQUFXLElBQUksT0FBTyxFQUFFLENBQUM7WUFDOUIsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUV4QixXQUFXLEdBQUcsSUFBSSxJQUFJLENBQ3BCLFdBQVcsQ0FBQyxXQUFXLEVBQUUsRUFDekIsV0FBVyxDQUFDLFFBQVEsRUFBRSxFQUN0QixXQUFXLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUMxQixDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMsQ0FBQztBQTdCVyxRQUFBLGVBQWUsbUJBNkIxQjtBQUdLLE1BQU0sT0FBTyxHQUFHLENBQUMsS0FBYyxFQUFFLEVBQUU7SUFDeEMsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRW5CLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFLENBQUM7UUFDekIsSUFBSSxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDZixHQUFHLEdBQUcsSUFBSSxDQUFDO1FBQ2IsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUMsQ0FBQTtBQVZZLFFBQUEsT0FBTyxXQVVuQjtBQUVNLE1BQU0sT0FBTyxHQUFHLENBQUMsS0FBYyxFQUFFLEVBQUU7SUFDeEMsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRW5CLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFLENBQUM7UUFDekIsSUFBSSxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDZixHQUFHLEdBQUcsSUFBSSxDQUFDO1FBQ2IsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUMsQ0FBQTtBQVZZLFFBQUEsT0FBTyxXQVVuQiJ9