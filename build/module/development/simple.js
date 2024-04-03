export function plot(canvas, data) {
    if (data.length === 0) {
        return; // Nothing to plot if the data is empty
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return; // Abort if the canvas context is not available
    }
    const padding = 50; // Adjust padding for axis labels
    const plotWidth = canvas.width - padding * 2;
    const plotHeight = canvas.height - padding * 2;
    // Extract values for easier processing
    const values = data.map((item) => item.value);
    const dates = data.map((item) => item.date.toLocaleDateString());
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const valueRange = maxValue - minValue;
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw the Y-axis and X-axis labels as before
    // [...code for axes and labels...]
    //
    // Draw the Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();
    // Draw the X-axis
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    // Y-axis labels
    const yAxisLabelCount = 5;
    const yAxisInterval = valueRange / (yAxisLabelCount - 1);
    for (let i = 0; i < yAxisLabelCount; i++) {
        const label = (minValue + yAxisInterval * i).toFixed(2);
        const y = padding +
            (plotHeight / (yAxisLabelCount - 1)) * (yAxisLabelCount - i - 1);
        ctx.fillStyle = 'black';
        ctx.fillText(label, padding / 3, y + 3);
    }
    // X-axis labels
    const xAxisLabelCount = Math.min(dates.length, 5); // Limit the number of labels to avoid clutter
    for (let i = 0; i < xAxisLabelCount; i++) {
        const labelIndex = Math.floor(((dates.length - 1) / (xAxisLabelCount - 1)) * i);
        const label = dates[labelIndex];
        const x = padding + labelIndex * (plotWidth / (dates.length - 1));
        ctx.fillStyle = 'black';
        ctx.fillText(label, x - 20, canvas.height - 5); // Adjust label positioning as needed
    }
    // Begin plotting the line graph
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding); // Start at the first point on the X-axis
    // Draw line segments for each data point
    values.forEach((value, index) => {
        const x = padding + index * (plotWidth / (values.length - 1));
        const y = padding + (plotHeight - ((value - minValue) / valueRange) * plotHeight);
        ctx.lineTo(x, y);
    });
    // Complete the path to fill the area under the line
    ctx.lineTo(padding + plotWidth, canvas.height - padding); // End at the last point on the X-axis
    ctx.closePath(); // Close the path to connect back to the start point
    // Fill the area under the line
    ctx.fillStyle = 'rgba(135, 206, 235, 0.5)'; // Semi-transparent blue, adjust color as desired
    ctx.fill();
    // Optionally, draw the line on top of the filled area
    ctx.stroke(); // Apply the drawing
}
